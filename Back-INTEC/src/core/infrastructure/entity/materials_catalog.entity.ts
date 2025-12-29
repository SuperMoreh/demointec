import {
    Entity,
    Column,
    PrimaryColumn,
  } from 'typeorm';

  @Entity({ name: 'materials_catalog' })
  export class MaterialEntity {
    @PrimaryColumn({ name: 'id_material', type: 'varchar', length: 255})
    id_material!: string;
  
    @Column({ name: 'name_material', type: 'varchar', length: 255})
    name_material!: string;
  
    @Column({ name: 'code', type: 'varchar' })
    code!:string;
  
    @Column({ name: 'c1', type: 'varchar', length: 255})
    c1!: string;

    @Column({ name: 'c2', type: 'varchar', length: 255})
    c2!: string;
  
    @Column({ name: 'image', type: 'varchar', length: 255  })
    image!: string;

    @Column({ name: 'category', type: 'varchar', length: 255})
    category!: string;

    @Column({ name: 'subcategory', type: 'varchar', length: 255})
    subcategory!: string;

    @Column({ name: 'unit', type: 'varchar', length: 255})
    unit!: string;
  
    @Column({ name: 'status', type: 'boolean', default: true })
    status!: boolean;
  
}
