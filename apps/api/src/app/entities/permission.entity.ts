import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PermissionAction } from '@turbovetnx/auth';
import { Role } from './role.entity';

@Entity({ name: 'permissions' })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  action!: PermissionAction;

  @ManyToOne(() => Role, (role) => role.permissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  role!: Role;
}
