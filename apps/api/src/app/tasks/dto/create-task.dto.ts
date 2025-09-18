import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '@turbovetnx/data';

export class CreateTaskDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsUUID()
  organizationId!: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
