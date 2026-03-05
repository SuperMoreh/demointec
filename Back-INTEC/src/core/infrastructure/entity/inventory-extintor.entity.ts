import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryEntity } from './inventory.entity';

@Entity({ name: 'inventory_extintores' })
export class InventoryExtintorEntity {
  @PrimaryGeneratedColumn()
  id_inventory_extintor!: number;

  @Column({ name: 'id_inventory', type: 'varchar', length: 255 })
  id_inventory!: string;

  @Column({ name: 'extintor_type', type: 'varchar', length: 50, nullable: true })
  extintor_type!: string;

  @Column({ name: 'capacity', type: 'varchar', length: 50, nullable: true })
  capacity!: string;

  @Column({ name: 'serial_number', type: 'varchar', length: 100, nullable: true })
  serial_number!: string;

  @Column({ name: 'exact_location', type: 'varchar', length: 255, nullable: true })
  exact_location!: string;

  @Column({ name: 'recharge_date', type: 'date', nullable: true })
  recharge_date!: string;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expiration_date!: string;

  @Column({ name: 'last_inspection', type: 'date', nullable: true })
  last_inspection!: string;

  @Column({ name: 'next_inspection', type: 'date', nullable: true })
  next_inspection!: string;

  @Column({ name: 'status', type: 'boolean', default: true })
  status!: boolean;

  @ManyToOne(() => InventoryEntity, (inv) => inv.extintores)
  @JoinColumn({ name: 'id_inventory' })
  inventory!: InventoryEntity;
}
