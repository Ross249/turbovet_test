import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoleName } from '@turbovetnx/auth';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true })
  name!: RoleName;

  @OneToMany(() => Permission, (permission) => permission.role)
  permissions?: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users?: User[];
}
