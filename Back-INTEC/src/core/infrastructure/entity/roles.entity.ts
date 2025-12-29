import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
  } from 'typeorm';
  import { UserEntity } from './users.entity';
  
  @Entity({ name: 'roles' })
  export class RoleEntity {
    @PrimaryGeneratedColumn({ name: 'id_role', type: 'int' })
    id_role!: number;
  
    @Column({ name: 'name_role', type: 'varchar', length: 50, unique: true })
    name_role!: string;

    @Column({ name: 'status', type: 'boolean', default: true })
    status!: boolean;
  
    @OneToMany(() => UserEntity, user => user.role_id)
    user_id!: UserEntity[];
  }