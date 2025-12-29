import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { EmployeeEntity } from "./employees.entity";

@Entity({ name: 'employee_documents' })
export class EmployeeDocumentEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'id_employee', type: 'varchar', length: 255 })
    id_employee!: string;

    @Column({ name: 'document_type', type: 'varchar', length: 50 })
    document_type!: string;

    @Column({ name: 'document_path', type: 'text', nullable: true })
    document_path!: string;

    @CreateDateColumn({ name: 'upload_date' })
    upload_date!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at!: Date;

    @ManyToOne(() => EmployeeEntity)
    @JoinColumn({ name: 'id_employee' })
    employee!: EmployeeEntity;
}
