import {
    Entity,
    Column,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
import { CategoriesEntity } from './categories.entity';
  
  
  @Entity({ name: 'subcategories' })
  export class SubcategoriesEntity {
   @PrimaryColumn({ name: 'id_subcategory', type: 'varchar', length: 255})
    id_subcategory!: string;
  
    @Column({ name: 'name_subcategory', type: 'varchar', length: 100 })
    name_subcategory!: string;
  
    @Column({ name: 'c1', type: 'varchar', length: 100})
    c1!: string;
  
    @Column({ name: 'c2', type: 'varchar', length: 255 })
    c2!: string;
  
    @Column({ name: 'status', type: 'boolean', default: true })
    status!: boolean;
  
    @ManyToOne(() => CategoriesEntity, category => category.subcategory_id)
    @JoinColumn({ name: 'category_id' })
    category_id!: CategoriesEntity;
  }