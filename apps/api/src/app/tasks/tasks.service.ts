import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { Organization } from '../entities/organization.entity';
import { AccessControlService } from '../access/access-control.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import {
  TaskDto,
  TaskStatus,
  TaskPriority,
  AuditAction,
} from '@turbovetnx/data';
import { PermissionAction } from '@turbovetnx/auth';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasks: Repository<Task>,
    @InjectRepository(Organization)
    private readonly organizations: Repository<Organization>,
    private readonly accessControl: AccessControlService,
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  async list(user: AuthenticatedUser, query: TaskQueryDto): Promise<TaskDto[]> {
    const orgScope = Array.from(
      await this.accessControl.getOrganizationScope(user),
    );
    if (orgScope.length === 0) {
      return [];
    }

    const qb = this.tasks
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.organization', 'organization')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.creator', 'creator')
      .where('organization.id IN (:...orgIds)', { orgIds: orgScope });

    if (query.status) {
      qb.andWhere('task.status = :status', { status: query.status });
    }
    if (query.category) {
      qb.andWhere('task.category = :category', { category: query.category });
    }

    if (query.search) {
      qb.andWhere('task.title LIKE :search OR task.description LIKE :search', {
        search: `%${query.search}%`,
      });
    }

    if (query.priority) {
      qb.andWhere('task.priority = :priority', { priority: query.priority });
    }

    const results = await qb.orderBy('task.updatedAt', 'DESC').getMany();
    return results.map((task) => this.toDto(task));
  }

  async create(
    user: AuthenticatedUser,
    dto: CreateTaskDto,
  ): Promise<TaskDto> {
    await this.accessControl.assertOrganizationScope(
      user,
      dto.organizationId,
      PermissionAction.TaskCreate,
    );

    const organization = await this.organizations.findOne({
      where: { id: dto.organizationId },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const creator = await this.usersService.findById(user.id);

    let assignee = null;
    if (dto.assigneeId) {
      assignee = await this.usersService.findById(dto.assigneeId);
      const scope = await this.accessControl.getOrganizationScope(user);
      if (!scope.has(assignee.organization.id)) {
        throw new ForbiddenException('Assignee outside of your scope');
      }
    }

    const task = this.tasks.create({
      title: dto.title,
      description: dto.description ?? null,
      category: dto.category ?? 'General',
      status: dto.status ?? TaskStatus.Backlog,
      priority: dto.priority ?? TaskPriority.Medium,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      organization,
      creator,
      assignee: assignee ?? null,
    });

    const saved = await this.tasks.save(task);

    await this.auditService.record({
      actorId: user.id,
      action: AuditAction.TaskCreate,
      resourceType: 'task',
      resourceId: saved.id,
      metadata: { title: saved.title },
    });

    const hydrated = await this.tasks.findOne({
      where: { id: saved.id },
      relations: ['organization', 'creator', 'assignee'],
    });
    if (!hydrated) {
      throw new NotFoundException('Task not found after creation');
    }
    return this.toDto(hydrated);
  }

  async update(
    user: AuthenticatedUser,
    id: string,
    dto: UpdateTaskDto,
  ): Promise<TaskDto> {
    const task = await this.accessControl.assertTaskAccess(
      user,
      id,
      PermissionAction.TaskUpdate,
    );

    if (dto.organizationId && dto.organizationId !== task.organization.id) {
      await this.accessControl.assertOrganizationScope(
        user,
        dto.organizationId,
        PermissionAction.TaskUpdate,
      );
      const nextOrg = await this.organizations.findOne({
        where: { id: dto.organizationId },
      });
      if (!nextOrg) {
        throw new NotFoundException('Organization not found');
      }
      task.organization = nextOrg;
    }

    if (dto.assigneeId !== undefined) {
      if (!dto.assigneeId) {
        task.assignee = null;
      } else {
        const newAssignee = await this.usersService.findById(dto.assigneeId);
        const scope = await this.accessControl.getOrganizationScope(user);
        if (!scope.has(newAssignee.organization.id)) {
          throw new ForbiddenException('Assignee outside of your scope');
        }
        task.assignee = newAssignee;
      }
    }

    task.title = dto.title ?? task.title;
    task.description = dto.description ?? task.description;
    task.category = dto.category ?? task.category;
    task.status = dto.status ?? task.status;
    task.priority = dto.priority ?? task.priority;
    if (dto.dueDate !== undefined) {
      task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    const saved = await this.tasks.save(task);

    await this.auditService.record({
      actorId: user.id,
      action: AuditAction.TaskUpdate,
      resourceType: 'task',
      resourceId: saved.id,
      metadata: { title: saved.title },
    });

    return this.toDto(saved);
  }

  async remove(user: AuthenticatedUser, id: string): Promise<void> {
    const task = await this.accessControl.assertTaskAccess(
      user,
      id,
      PermissionAction.TaskDelete,
    );
    await this.tasks.remove(task);
    await this.auditService.record({
      actorId: user.id,
      action: AuditAction.TaskDelete,
      resourceType: 'task',
      resourceId: id,
      metadata: { title: task.title },
    });
  }

  private toDto(task: Task): TaskDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      category: task.category,
      status: task.status,
      priority: task.priority,
      organizationId: task.organization.id,
      assigneeId: task.assignee?.id,
      dueDate: task.dueDate?.toISOString(),
      createdById: task.creator.id,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}
