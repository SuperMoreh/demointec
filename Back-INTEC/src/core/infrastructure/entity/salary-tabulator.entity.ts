import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'salary_tabulators' })
export class SalaryTabulatorEntity {
    @PrimaryGeneratedColumn({ name: 'id_salary_tabulator', type: 'int' })
    id_salary_tabulator!: number;

    @Column({ name: 'position', type: 'varchar', length: 100 })
    position!: string;

    @Column({ name: 'geographic_zone', type: 'varchar', length: 100 })
    geographic_zone!: string;

    @Column({ name: 'weekly_salary', type: 'decimal', precision: 10, scale: 2 })
    weekly_salary!: number;
}
