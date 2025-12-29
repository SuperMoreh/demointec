import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'job_descriptions' })
export class JobDescriptionEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    job_title!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    immediate_boss!: string;

    @Column({ type: 'text', nullable: true })
    subordinates!: string;

    @Column({ type: 'text', nullable: true })
    basic_function!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    responsibility_level!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    employment_type!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    shift!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    schedule_mon_fri!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    schedule_weekend!: string;

    @Column({ type: 'text', nullable: true })
    decision_making!: string;

    @Column({ type: 'text', nullable: true })
    general_objective!: string;

    @Column({ type: 'text', nullable: true })
    functions!: string; // Stored as JSON string or plain text if simple

    @Column({ type: 'text', nullable: true })
    tasks!: string; // Stored as JSON string or plain text if simple

    @Column({ type: 'text', nullable: true })
    required_documents!: string; // Stored as JSON string of document names

    @Column({ type: 'boolean', default: true })
    status!: boolean;
}
