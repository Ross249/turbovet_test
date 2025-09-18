import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskPriority, TaskStatus } from '@turbovetnx/data';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 'General' })
  category!: string;

  @Column({
    type: 'text',
    default: TaskStatus.Backlog,
  })
  status!: TaskStatus;

  @Column({
    type: 'text',
    default: TaskPriority.Medium,
  })
  priority!: TaskPriority;

  @ManyToOne(() => Organization, (organization) => organization.tasks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  organization!: Organization;

  @ManyToOne(() => User, (user) => user.createdTasks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  creator!: User;

  @ManyToOne(() => User, (user) => user.assignedTasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  assignee?: User | null;

  @Column({ type: 'datetime', nullable: true })
  dueDate?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
