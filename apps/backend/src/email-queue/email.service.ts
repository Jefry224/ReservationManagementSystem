import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Reservation } from '../reservations/reservation.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectQueue('email-sending')
    private readonly emailQueue: Queue,
  ) {}

  async queueConfirmation(reservation: Reservation, providerName: string) {
    this.logger.log(`Queueing confirmation email for: ${reservation.patientEmail}`);

    // Add the job to the BullMQ queue in Redis
    await this.emailQueue.add(
      'send-confirmation', // Job name
      {
        reservationId: reservation.id,
        patientEmail: reservation.patientEmail,
        providerName,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
      },
      {
        attempts: 3, // Retry up to 3 times on failure
        backoff: {
          type: 'exponential',
          delay: 1000, // Retry after 1s, then 2s, then 4s...
        },
      },
    );
  }
}
