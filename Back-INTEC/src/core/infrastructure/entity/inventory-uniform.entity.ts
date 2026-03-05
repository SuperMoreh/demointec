import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryEntity } from './inventory.entity';

@Entity({ name: 'inventory_uniforms' })
export class InventoryUniformEntity {
  @PrimaryGeneratedColumn()
  id_inventory_uniform!: number;

  @Column({ name: 'id_inventory', type: 'varchar', length: 255 })
  id_inventory!: string;

  @Column({ name: 'size', type: 'varchar', length: 20, nullable: true })
  size!: string;

  @Column({ name: 'gender', type: 'varchar', length: 20, nullable: true })
  gender!: string;

  @Column({ name: 'department', type: 'varchar', length: 255, nullable: true })
  department!: string;

  @Column({ name: 'id_employee', type: 'varchar', length: 255, nullable: true })
  id_employee!: string;

  @Column({ name: 'delivery_date', type: 'date', nullable: true })
  delivery_date!: string;

  @Column({ name: 'estimated_replacement_date', type: 'date', nullable: true })
  estimated_replacement_date!: string;

  @Column({ name: 'status', type: 'boolean', default: true })
  status!: boolean;

  @ManyToOne(() => InventoryEntity, (inv) => inv.uniforms)
  @JoinColumn({ name: 'id_inventory' })
  inventory!: InventoryEntity;
}
