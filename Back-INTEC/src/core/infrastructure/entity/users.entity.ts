import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { RoleEntity } from './roles.entity';
  
  @Entity({ name: 'users' })
  export class UserEntity {
    @PrimaryGeneratedColumn({ name: 'id_user', type: 'int' })
    id_user!: number;
  
    @Column({ name: 'name_user', type: 'varchar', length: 100 })
    name_user!: string;
  
    @Column({ name: 'email', type: 'varchar', length: 100, unique: true })
    email!: string;
  
    @Column({ name: 'password', type: 'varchar', length: 255 })
    password!: string;

    @Column({ name: 'phone', type: 'varchar', length: 50 })
    phone!: string;
  
    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt!: Date;

    @Column({ name: 'photo', type: 'blob', nullable: true })
    photo?: Buffer;
  
    @Column({ name: 'status', type: 'boolean', default: true })
    status!: boolean;
  
    @ManyToOne(() => RoleEntity, role => role.user_id)
    @JoinColumn({ name: 'role_id' })
    role_id!: RoleEntity;
}