import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation } from './reservation.entity';
import { DataSource, Repository, MoreThanOrEqual, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProvidersService } from '../providers/providers.service';
import { Provider } from '../providers/provider.entity';
import { EmailService } from '../email-queue/email.service';
import { PastBookingException } from '../common/exceptions/past-booking.exception';
import { ProviderNotFoundException } from '../common/exceptions/provider-not-found.exception';
import { InvalidDurationException } from '../common/exceptions/invalid-duration.exception';
import { SlotAlreadyBookedException } from '../common/exceptions/slot-already-booked.exception';

@Injectable()
export class ReservationsService {

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly providersService: ProvidersService,
    private readonly emailService: EmailService,
    // Used for manual transactions and pessimistic locking
    private readonly dataSource: DataSource,
  ) { }

  async bookSlot(dto: CreateReservationDto): Promise<Reservation> {
    const { providerId, patientEmail, startTime, endTime } = dto;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start.getTime() < Date.now()) {
      throw new PastBookingException();
    }

    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    if (durationMinutes !== 30) {
      throw new InvalidDurationException();
    }

    // 1. Run the full database workflow inside a transaction
    const savedReservation = await this.dataSource.transaction(async (entityManager) => {
      // Apply a pessimistic write lock on the provider
      const provider = await entityManager.getRepository(Provider).findOne({
        where: { id: providerId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!provider) {
        throw new ProviderNotFoundException(providerId);
      }

      // Check for overlap inside the same transaction
      const overlapping = await entityManager.getRepository(Reservation)
        .createQueryBuilder('reservation')
        .where('reservation.providerId = :providerId', { providerId })
        .andWhere('(reservation.startTime < :end AND reservation.endTime > :start)', { start, end })
        .getOne();

      if (overlapping) {
        throw new SlotAlreadyBookedException();
      }

      // Create and save the reservation
      const newReservation = entityManager.getRepository(Reservation).create({
        providerId,
        patientEmail,
        startTime: start,
        endTime: end,
      });

      return await entityManager.save(newReservation);
    });

    // 2. Outside the DB transaction, enqueue the job only after the booking is confirmed
    const provider = await this.providersService.findById(providerId);
    await this.emailService.queueConfirmation(savedReservation, provider.name);

    return savedReservation;
  }

  async findUpcomingByProvider(providerId: string): Promise<Reservation[]> {
    await this.providersService.findById(providerId); // Validate that the provider exists

    return await this.reservationRepository.find({
      where: {
        providerId,
        startTime: MoreThanOrEqual(new Date()), // Keep only upcoming reservations
      },
      order: { startTime: 'ASC' },
    });
  }

  async getAvailability(providerId: string, dateStr: string) {
    await this.providersService.findById(providerId);

    // Parse a date in YYYY-MM-DD format
    const [year, month, day] = dateStr.split('-').map(Number);
    // JS Date months are zero-indexed, so subtract 1
    const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    // Generate slots from 9:00 AM to 5:00 PM UTC for that day
    const slots: { startTime: string; endTime: string }[] = [];
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min of [0, 30]) {
        const slotStart = new Date(Date.UTC(year, month - 1, day, hour, min, 0, 0));
        const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
        });
      }
    }

    // Fetch reservations within that range
    const reservations = await this.reservationRepository.find({
      where: {
        providerId,
        startTime: Between(dayStart, dayEnd),
      },
    });

    return slots.map(slot => {
      const isBooked = reservations.some(res => {
        return new Date(res.startTime).getTime() === new Date(slot.startTime).getTime();
      });

      const isPast = new Date(slot.startTime).getTime() < Date.now();

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: !isBooked && !isPast,
      };
    });
  }
}
