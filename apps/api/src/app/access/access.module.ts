import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Organization } from '../entities/organization.entity';
import { AccessControlService } from './access-control.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Organization])],
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class AccessModule {}
