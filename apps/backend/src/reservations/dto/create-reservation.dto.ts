import { IsEmail, IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @IsUUID('4', { message: 'Invalid provider ID format' })
  @IsNotEmpty({ message: 'Provider ID is required' })
  providerId: string;

  @IsEmail({}, { message: 'A valid patient email is required' })
  @IsNotEmpty({ message: 'Patient email is required' })
  patientEmail: string;

  @IsDateString({}, { message: 'Start time must be a valid ISO date string' })
  @IsNotEmpty({ message: 'Start time is required' })
  startTime: string;

  @IsDateString({}, { message: 'End time must be a valid ISO date string' }) // e.g. "2024-12-01T10:30:00-05:00"
  @IsNotEmpty({ message: 'End time is required' })
  endTime: string;
}
