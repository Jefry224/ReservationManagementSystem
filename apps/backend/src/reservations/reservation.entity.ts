import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Provider } from '../providers/provider.entity';

@Entity('reservations')
// Composite index to speed up availability queries and provider/time locking
@Index(['providerId', 'startTime', 'endTime'])
export class Reservation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'provider_id', type: 'uuid' })
    providerId: string;

    @Column({ name: 'patient_email', type: 'varchar', length: 150 })
    patientEmail: string;

    @Column({ name: 'start_time', type: 'timestamp with time zone' })
    startTime: Date;

    @Column({ name: 'end_time', type: 'timestamp with time zone' })
    endTime: Date;

    @ManyToOne(() => Provider, (provider) => provider.reservations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'provider_id' })
    provider: Provider;
}
