import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access/permissions.guard';
import { RequirePermissions } from '../access/permissions.decorator';
import { PermissionAction } from '@turbovetnx/auth';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthenticatedUser } from '../common/authenticated-user.interface';
import { TaskDto } from '@turbovetnx/data';

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequirePermissions(PermissionAction.TaskRead)
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TaskQueryDto,
  ): Promise<TaskDto[]> {
    return this.tasksService.list(user, query);
  }

  @Post()
  @RequirePermissions(PermissionAction.TaskCreate)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTaskDto,
  ): Promise<TaskDto> {
    return this.tasksService.create(user, dto);
  }

  @Put(':id')
  @RequirePermissions(PermissionAction.TaskUpdate)
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskDto> {
    return this.tasksService.update(user, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PermissionAction.TaskDelete)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.tasksService.remove(user, id);
  }
}
