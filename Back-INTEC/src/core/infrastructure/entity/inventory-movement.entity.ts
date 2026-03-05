import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { InventoryEntity } from './inventory.entity';

@Entity({ name: 'inventory_movements' })
export class InventoryMovementEntity {
  @PrimaryGeneratedColumn()
  id_movement!: number;

  @Column({ name: 'id_inventory', type: 'varchar', length: 255 })
  id_inventory!: string;

  @Column({ name: 'movement_type', type: 'varchar', length: 20 })
  movement_type!: string;

  @Column({ name: 'quantity', type: 'int' })
  quantity!: number;

  @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
  reason!: string;

  @Column({ name: 'id_employee', type: 'varchar', length: 255, nullable: true })
  id_employee!: string;

  @Column({ name: 'responsible', type: 'varchar', length: 255, nullable: true })
  responsible!: string;

  @Column({ name: 'movement_date', type: 'date' })
  movement_date!: string;

  @Column({ name: 'observations', type: 'text', nullable: true })
  observations!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @ManyToOne(() => InventoryEntity, (inv) => inv.movements)
  @JoinColumn({ name: 'id_inventory' })
  inventory!: InventoryEntity;
}
