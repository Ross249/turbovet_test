import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from './user.entity';

@Entity({ name: 'organizations' })
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @ManyToOne(() => Organization, (organization) => organization.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent?: Organization | null;

  @OneToMany(() => Organization, (organization) => organization.parent)
  children?: Organization[];

  @Column({ type: 'integer', default: 0 })
  level!: number;

  @Column({ type: 'text' })
  path!: string;

  @OneToMany(() => User, (user) => user.organization)
  users?: User[];

  @OneToMany(() => Task, (task) => task.organization)
  tasks?: Task[];
}
