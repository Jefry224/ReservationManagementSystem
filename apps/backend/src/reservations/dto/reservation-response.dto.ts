import { Expose, Transform } from 'class-transformer';

export class ReservationResponseDto {
  @Expose()
  id: string;

  @Expose()
  providerId: string;

  @Expose()
  patientEmail: string;

  @Expose()
  @Transform(({ value }: { value: unknown }) =>
    value instanceof Date ? value.toISOString() : String(value),
  )
  startTime: string;

  @Expose()
  @Transform(({ value }: { value: unknown }) =>
    value instanceof Date ? value.toISOString() : String(value),
  )
  endTime: string;
}
