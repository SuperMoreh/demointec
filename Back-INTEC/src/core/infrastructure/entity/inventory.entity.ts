import { Entity, Column, PrimaryColumn, OneToMany, UpdateDateColumn } from 'typeorm';
import { InventoryUniformEntity } from './inventory-uniform.entity';
import { InventoryExtintorEntity } from './inventory-extintor.entity';
import { InventoryMovementEntity } from './inventory-movement.entity';
import { InventoryAssignmentEntity } from './inventory-assignment.entity';

@Entity({ name: 'inventory' })
export class InventoryEntity {
  @PrimaryColumn({ name: 'id_inventory', type: 'varchar', length: 255 })
  id_inventory!: string;

  @Column({ name: 'name_inventory', type: 'varchar', length: 255 })
  name_inventory!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'category', type: 'varchar', length: 100 })
  category!: string;

  @Column({ name: 'quantity', type: 'int', default: 0 })
  quantity!: number;

  @Column({ name: 'unit', type: 'varchar', length: 50 })
  unit!: string;

  @Column({ name: 'location', type: 'varchar', length: 255, nullable: true })
  location!: string;

  @Column({ name: 'state', type: 'varchar', length: 50, default: 'Disponible' })
  state!: string;

  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchase_date!: string;

  @Column({ name: 'supplier', type: 'varchar', length: 255, nullable: true })
  supplier!: string;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
  unit_cost!: number;

  @Column({ name: 'responsible', type: 'varchar', length: 255, nullable: true })
  responsible!: string;

  @Column({ name: 'minimum_stock', type: 'int', default: 0 })
  minimum_stock!: number;

  @Column({ name: 'maximum_stock', type: 'int', nullable: true })
  maximum_stock!: number;

  @Column({ name: 'observations', type: 'text', nullable: true })
  observations!: string;

  @Column({ name: 'status', type: 'boolean', default: true })
  status!: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @OneToMany(() => InventoryUniformEntity, (u) => u.inventory)
  uniforms!: InventoryUniformEntity[];

  @OneToMany(() => InventoryExtintorEntity, (e) => e.inventory)
  extintores!: InventoryExtintorEntity[];

  @OneToMany(() => InventoryMovementEntity, (m) => m.inventory)
  movements!: InventoryMovementEntity[];

  @OneToMany(() => InventoryAssignmentEntity, (a) => a.inventory)
  assignments!: InventoryAssignmentEntity[];
}
