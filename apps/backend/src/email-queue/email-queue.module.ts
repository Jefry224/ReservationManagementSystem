import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [
    // Register the 'email-sending' queue for this module
    BullModule.registerQueue({
      name: 'email-sending',
    }),
  ],
  providers: [EmailService, EmailProcessor],
  exports: [EmailService], // Export the service so ReservationsModule can inject it
})
export class EmailQueueModule {}
