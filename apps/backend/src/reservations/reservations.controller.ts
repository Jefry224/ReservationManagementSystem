import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async bookSlot(@Body() createReservationDto: CreateReservationDto): Promise<ReservationResponseDto> {
    const reservation = await this.reservationsService.bookSlot(createReservationDto);
    return plainToInstance(ReservationResponseDto, reservation, { excludeExtraneousValues: true });
  }

  @Get(':providerId')
  async findUpcomingByProvider(@Param('providerId') providerId: string): Promise<ReservationResponseDto[]> {
    const reservations = await this.reservationsService.findUpcomingByProvider(providerId);
    return plainToInstance(ReservationResponseDto, reservations, { excludeExtraneousValues: true });
  }

  @Get(':providerId/availability')
  async getAvailability(
    @Param('providerId') providerId: string,
    @Query('date') date: string,
  ) {
    return this.reservationsService.getAvailability(providerId, date);
  }
}
