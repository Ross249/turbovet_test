import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { AccessControlService } from '../access/access-control.service';
import { AuthenticatedUser } from '../common/authenticated-user.interface';
import { OrganizationDto } from '@turbovetnx/data';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizations: Repository<Organization>,
    private readonly accessControl: AccessControlService,
  ) {}

  async listForUser(user: AuthenticatedUser): Promise<OrganizationDto[]> {
    const scope = await this.accessControl.getOrganizationScope(user);
    const ids = Array.from(scope);
    const entities = await this.organizations.find({
      where: ids.length > 0 ? { id: In(ids) } : {},
      relations: ['parent'],
      order: { level: 'ASC', name: 'ASC' },
    });
    return entities
      .filter((org) => scope.has(org.id))
      .map((org) => ({
        id: org.id,
        name: org.name,
        parentId: org.parent?.id ?? null,
        level: org.level,
        path: org.path,
      }));
  }
}
