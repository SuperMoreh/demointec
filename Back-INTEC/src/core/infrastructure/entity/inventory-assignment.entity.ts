import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryEntity } from './inventory.entity';

@Entity({ name: 'inventory_assignments' })
export class InventoryAssignmentEntity {
  @PrimaryGeneratedColumn()
  id_assignment!: number;

  @Column({ name: 'id_inventory', type: 'varchar', length: 255 })
  id_inventory!: string;

  @Column({ name: 'id_employee', type: 'varchar', length: 255 })
  id_employee!: string;

  @Column({ name: 'quantity', type: 'int', default: 1 })
  quantity!: number;

  @Column({ name: 'assignment_date', type: 'date' })
  assignment_date!: string;

  @Column({ name: 'return_date', type: 'date', nullable: true })
  return_date!: string;

  @Column({ name: 'state', type: 'varchar', length: 50, default: 'Asignado' })
  state!: string;

  @Column({ name: 'responsible', type: 'varchar', length: 255, nullable: true })
  responsible!: string;

  @Column({ name: 'observations', type: 'text', nullable: true })
  observations!: string;

  @Column({ name: 'status', type: 'boolean', default: true })
  status!: boolean;

  @ManyToOne(() => InventoryEntity, (inv) => inv.assignments)
  @JoinColumn({ name: 'id_inventory' })
  inventory!: InventoryEntity;
}
