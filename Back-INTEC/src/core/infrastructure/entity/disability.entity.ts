import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EmployeeEntity } from './employees.entity';

@Entity({ name: 'disabilities' })
export class DisabilityEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'id_employee', type: 'varchar', length: 255 })
    id_employee!: string;

    @Column({ name: 'name', type: 'varchar', length: 255 })
    name!: string;

    @Column({ name: 'admission_date', type: 'varchar', length: 100, nullable: true })
    admission_date!: string;

    @Column({ name: 'position', type: 'varchar', length: 100, nullable: true })
    position!: string;

    @Column({ name: 'location', type: 'varchar', length: 100, nullable: true })
    location!: string;

    @Column({ name: 'start_date', type: 'date' })
    start_date!: string;

    @Column({ name: 'folio', type: 'varchar', length: 100, nullable: true })
    folio!: string;

    @Column({ name: 'days', type: 'int' })
    days!: number;

    @Column({ name: 'end_date', type: 'date' })
    end_date!: string;

    @Column({ name: 'type', type: 'varchar', length: 50 })
    type!: string;

    @Column({ name: 'insurance_branch', type: 'varchar', length: 100 })
    insurance_branch!: string;

    @Column({ name: 'eg', type: 'tinyint', default: 0 })
    eg!: boolean;

    @Column({ name: 'rt', type: 'tinyint', default: 0 })
    rt!: boolean;

    @Column({ name: 'at_field', type: 'tinyint', default: 0 })
    at_field!: boolean;

    @Column({ name: 'st7', type: 'tinyint', default: 0 })
    st7!: boolean;

    @Column({ name: 'st2', type: 'tinyint', default: 0 })
    st2!: boolean;

    @Column({ name: 'return_to_work_date', type: 'date', nullable: true })
    return_to_work_date!: string;

    @Column({ name: 'document_path', type: 'text', nullable: true })
    document_path!: string;

    @Column({ name: 'document_name', type: 'varchar', length: 255, nullable: true })
    document_name!: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at!: Date;

    @ManyToOne(() => EmployeeEntity)
    @JoinColumn({ name: 'id_employee' })
    employee!: EmployeeEntity;
}
