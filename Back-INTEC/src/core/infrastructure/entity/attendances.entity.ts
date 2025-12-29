import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { EmployeeEntity } from './employees.entity';

@Entity({ name: 'attendances' })
export class AttendanceEntity {
  @PrimaryColumn({ name: 'id_attendance', type: 'varchar', length: 255 })
  id_attendance!: string;

  @Column({ name: 'name_user', type: 'varchar', length: 100 })
  name_user!: string;

  @Column({ name: 'date', type: 'date' })
  date!: Date;

  @Column({ name: 'hour', type: 'time' })
  hour!: string;

  @Column({ name: 'latitude', type: 'varchar', length: 100 })
  latitude!: string;

  @Column({ name: 'length', type: 'varchar', length: 100 })
  length!: string;

  @Column({ name: 'observation', type: 'varchar', length: 150 })
  observation!: string;

  @Column({ name: 'type', type: 'varchar', length: 50 })
  type!: string;

  @Column({ name: 'uuid', type: 'varchar', length: 255 })
  uuid!: string;

  @Column({ name: 'status', type: 'boolean', default: true })
  status!: boolean;

}
