import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PermissionAction,
  RoleName,
  canPerform,
  orgScopeForRole,
} from '@turbovetnx/auth';
import { Task } from '../entities/task.entity';
import { Organization } from '../entities/organization.entity';
import { AuthenticatedUser } from '../common/authenticated-user.interface';

@Injectable()
export class AccessControlService {
  constructor(
    @InjectRepository(Task)
    private readonly tasks: Repository<Task>,
    @InjectRepository(Organization)
    private readonly organizations: Repository<Organization>,
  ) {}

  async assertTaskAccess(
    user: AuthenticatedUser,
    taskId: string,
    action: PermissionAction,
  ): Promise<Task> {
    const task = await this.tasks.findOne({
      where: { id: taskId },
      relations: ['organization', 'creator', 'assignee'],
    });
    if (!task) {
      throw new ForbiddenException('Task not found or inaccessible');
    }

    await this.assertOrganizationScope(user, task.organization.id, action);
    return task;
  }

  async assertOrganizationScope(
    user: AuthenticatedUser,
    organizationId: string,
    action: PermissionAction,
  ): Promise<void> {
    if (!canPerform(user.role, action)) {
      throw new ForbiddenException('Permission denied');
    }

    const scope = await this.resolveOrgScope(user.role, user.organizationId);
    if (!scope.has(organizationId)) {
      throw new ForbiddenException('Organization out of scope');
    }
  }

  async getOrganizationScope(user: AuthenticatedUser): Promise<Set<string>> {
    return this.resolveOrgScope(user.role, user.organizationId);
  }

  private async resolveOrgScope(
    role: RoleName,
    userOrgId: string,
  ): Promise<Set<string>> {
    if (role === RoleName.Owner) {
      const allIds = await this.organizations.find({
        select: { id: true, parent: { id: true } },
        relations: ['parent'],
      });
      const nodes = allIds.map((org) => ({
        id: org.id,
        parentId: org.parent?.id ?? null,
      }));
      return orgScopeForRole(role, userOrgId, { nodes });
    }

    const tree = await this.organizations.find({
      select: { id: true, parent: { id: true } },
      relations: ['parent'],
    });
    const nodes = tree.map((org) => ({
      id: org.id,
      parentId: org.parent?.id ?? null,
    }));
    return orgScopeForRole(role, userOrgId, { nodes });
  }
}
