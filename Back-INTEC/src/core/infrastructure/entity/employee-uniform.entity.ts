import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { EmployeeEntity } from './employees.entity';

@Entity({ name: 'employee_uniforms' })
export class EmployeeUniformEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'id_employee', type: 'varchar', length: 255, unique: true })
    id_employee!: string;

    @Column({ name: 'vest_type', type: 'varchar', length: 50, nullable: true })
    vest_type!: string;

    @Column({ name: 'helmet_color', type: 'varchar', length: 50, nullable: true })
    helmet_color!: string;

    @Column({ name: 'glasses', type: 'boolean', default: false })
    glasses!: boolean;

    @Column({ name: 'gloves_type', type: 'varchar', length: 50, nullable: true })
    gloves_type!: string;

    @Column({ name: 'earplugs', type: 'boolean', default: false })
    earplugs!: boolean;

    @Column({ name: 'boots_size', type: 'varchar', length: 20, nullable: true })
    boots_size!: string;

    @Column({ name: 'boots_color', type: 'varchar', length: 20, nullable: true })
    boots_color!: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at!: Date;

    @OneToOne(() => EmployeeEntity)
    @JoinColumn({ name: 'id_employee' })
    employee!: EmployeeEntity;
}
