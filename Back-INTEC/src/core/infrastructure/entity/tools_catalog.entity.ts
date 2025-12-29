import {
    Entity,
    Column,
    PrimaryColumn,
  } from 'typeorm';

  @Entity({ name: 'tools_catalog' })
  export class ToolsEntity {
    @PrimaryColumn({ name: 'id_tool', type: 'varchar', length: 255})
    id_tool!: string;
  
    @Column({ name: 'name_tool', type: 'varchar', length: 255})
    name_tool!: string;
  
    @Column({ name: 'code', type: 'varchar' })
    code!:string;
  
    @Column({ name: 'description', type: 'varchar', length: 255})
    description!: string;
  
    @Column({ name: 'image', type: 'varchar', length: 255  })
    image!: string;
  
    @Column({ name: 'status', type: 'boolean', default: true })
    status!: boolean;
  
  }
