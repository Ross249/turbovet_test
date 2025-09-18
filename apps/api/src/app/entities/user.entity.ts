import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Role } from './role.entity';
import { Task } from './task.entity';
import { AuditLog } from './audit-log.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'display_name' })
  displayName!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: false,
    eager: true,
  })
  role!: Role;

  @ManyToOne(() => Organization, (organization) => organization.users, {
    nullable: false,
    eager: true,
  })
  organization!: Organization;

  @OneToMany(() => Task, (task) => task.creator)
  createdTasks?: Task[];

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks?: Task[];

  @OneToMany(() => AuditLog, (log) => log.actor)
  auditEntries?: AuditLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
