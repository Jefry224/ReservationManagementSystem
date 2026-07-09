import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('email-sending')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  // The process method runs asynchronously when a job is pulled from Redis
  async process(job: Job<any, any, string>): Promise<any> {
    const { patientEmail, providerName, startTime, endTime } = job.data;

    this.logger.log(`[Worker] Starting email processing for ${patientEmail}...`);

    // Simulate network latency, for example when calling an external email service
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.logger.log(
      `[MOCK EMAIL SENT]
      To: ${patientEmail}
      Subject: Reservation Confirmation
      Message: Your reservation with ${providerName} has been confirmed successfully.
      Time: From ${startTime} to ${endTime}
      --------------------------------------------------`
    );

    return { sent: true };
  }
}
