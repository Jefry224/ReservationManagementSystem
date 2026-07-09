import { Expose, Transform } from 'class-transformer';

export class ReservationResponseDto {
    @Expose()
    id: string;

    @Expose()
    providerId: string;

    @Expose()
    patientEmail: string;

    @Expose()
    @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
    startTime: string;

    @Expose()
    @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
    endTime: string;
}