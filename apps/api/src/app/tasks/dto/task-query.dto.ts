import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TaskPriority, TaskStatus } from '@turbovetnx/data';

export class TaskQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}
