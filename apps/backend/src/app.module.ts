import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ProvidersModule } from './providers/providers.module';
import { BullModule } from '@nestjs/bullmq';
import { EmailQueueModule } from './email-queue/email-queue.module';
import configuration from './config/configuration';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const urlStr =
          configService.get<string>('redis.url') || 'redis://localhost:6379';
        const parsed = new URL(urlStr);

        return {
          connection: {
            host: parsed.hostname,
            port: parseInt(parsed.port || '6379', 10),
            username: parsed.username || undefined,
            password: parsed.password || undefined,
            tls: parsed.protocol === 'rediss:' ? {} : undefined,
          },
        };
      },
    }),
    DatabaseModule,
    ReservationsModule,
    ProvidersModule,
    EmailQueueModule,
  ],
})
export class AppModule {}
