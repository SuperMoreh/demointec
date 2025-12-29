import {
    Entity,
    Column,
    PrimaryColumn,
    OneToMany,
  } from 'typeorm';
import { SubcategoriesEntity } from './subCategories.entity';


  @Entity({ name: 'categories' })
  export class CategoriesEntity {
    @PrimaryColumn({ name: 'id_category', type: 'varchar', length: 255})
    id_category!: string;
  
    @Column({ name: 'name_category', type: 'varchar', length: 100 })
    name_category!: string;
  
    @Column({ name: 'status', type: 'boolean', default: true })
    status!: boolean;

    @OneToMany(() => SubcategoriesEntity, sub => sub.category_id)
    subcategory_id!: SubcategoriesEntity[];
  
  }
