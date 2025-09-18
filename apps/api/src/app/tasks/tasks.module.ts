import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Organization } from '../entities/organization.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AccessModule } from '../access/access.module';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';
import { PermissionsGuard } from '../access/permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Organization]),
    AccessModule,
    UsersModule,
    AuditModule,
  ],
  providers: [TasksService, PermissionsGuard],
  controllers: [TasksController],
})
export class TasksModule {}
