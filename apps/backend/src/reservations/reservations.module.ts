import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { Reservation } from './reservation.entity';
import { ProvidersModule } from '../providers/providers.module';
import { EmailQueueModule } from '../email-queue/email-queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation]),
    ProvidersModule,
    EmailQueueModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
