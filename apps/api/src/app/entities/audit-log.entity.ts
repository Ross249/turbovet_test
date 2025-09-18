import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditAction } from '@turbovetnx/data';
import { User } from './user.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.auditEntries, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  actor!: User;

  @Column({ type: 'text' })
  action!: AuditAction;

  @Column({ name: 'resource_type', type: 'text' })
  resourceType!: string;

  @Column({ name: 'resource_id', type: 'text' })
  resourceId!: string;

  @Column({ name: 'metadata', type: 'simple-json', nullable: true })
  metadata?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
