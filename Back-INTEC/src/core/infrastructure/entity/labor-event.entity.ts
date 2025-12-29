import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EmployeeEntity } from './employees.entity';

@Entity({ name: 'labor_events' })
export class LaborEventEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'id_employee', type: 'varchar', length: 255 })
    id_employee!: string;

    @Column({ name: 'event_date', type: 'date' })
    event_date!: string;

    @Column({ name: 'event_name', type: 'varchar', length: 100 })
    event_name!: string;

    @Column({ name: 'observation', type: 'text', nullable: true })
    observation!: string;

    @Column({ name: 'document_path', type: 'text', nullable: true })
    document_path!: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at!: Date;

    @ManyToOne(() => EmployeeEntity)
    @JoinColumn({ name: 'id_employee' })
    employee!: EmployeeEntity;
}
