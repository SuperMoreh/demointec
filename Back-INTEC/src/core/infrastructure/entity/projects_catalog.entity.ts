import {
    Entity,
    Column,
    PrimaryColumn,
  } from 'typeorm';

  @Entity({ name: 'projects_catalog' })
  export class ProjectEntity {
    @PrimaryColumn({ name: 'id_project', type: 'varchar', length: 255})
    id_project!: string;
  
    @Column({ name: 'name_project', type: 'varchar', length: 255})
    name_project!: string;
  
    @Column({ name: 'locationType', type: 'varchar' })
    locationType!:string;
  
    @Column({ name: 'locality', type: 'varchar', length: 255})
    locality!: string;
  
    @Column({ name: 'official', type: 'varchar', length: 255  })
    official!: string;
  
    @Column({ name: 'status', type: 'boolean', default: true })
    status!: boolean;
  
  }