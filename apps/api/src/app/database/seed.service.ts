import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleName, PermissionAction, permissionsForRole } from '@turbovetnx/auth';
import { TaskStatus, TaskPriority, AuditAction } from '@turbovetnx/data';
import { AuditLog } from '../entities/audit-log.entity';
import { Organization } from '../entities/organization.entity';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);
  private seeded = false;

  constructor(
    @InjectRepository(Organization)
    private readonly organizations: Repository<Organization>,
    @InjectRepository(Role)
    private readonly roles: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissions: Repository<Permission>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Task)
    private readonly tasks: Repository<Task>,
    @InjectRepository(AuditLog)
    private readonly auditLogs: Repository<AuditLog>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    if (this.seeded) {
      return;
    }
    const existingUsers = await this.users.count();
    if (existingUsers > 0) {
      this.logger.log('Seed skipped: data already present');
      this.seeded = true;
      return;
    }

    this.logger.log('Seeding reference data...');
    const [rootOrg, fieldOps, research] = await this.createOrganizations();
    const roleEntities = await this.createRolesWithPermissions();
    const { owner, admin, viewer } = await this.createUsers(
      { rootOrg, fieldOps, research },
      roleEntities,
    );
    await this.createSampleTasks({ owner, admin, viewer });
    this.logger.log('Seeding complete');
    this.seeded = true;
  }

  private async createOrganizations(): Promise<Organization[]> {
    const root = this.organizations.create({
      name: 'TurboVets HQ',
      level: 0,
      path: 'TurboVets HQ',
    });
    const savedRoot = await this.organizations.save(root);

    const fieldOps = this.organizations.create({
      name: 'Field Operations',
      level: 1,
      path: `${savedRoot.path} > Field Operations`,
      parent: savedRoot,
    });

    const research = this.organizations.create({
      name: 'Research Lab',
      level: 1,
      path: `${savedRoot.path} > Research Lab`,
      parent: savedRoot,
    });

    const savedChildren = await this.organizations.save([fieldOps, research]);
    return [savedRoot, ...savedChildren];
  }

  private async createRolesWithPermissions(): Promise<Record<RoleName, Role>> {
    const rolesByName: Record<RoleName, Role> = {
      [RoleName.Owner]: await this.roles.save(
        this.roles.create({ name: RoleName.Owner }),
      ),
      [RoleName.Admin]: await this.roles.save(
        this.roles.create({ name: RoleName.Admin }),
      ),
      [RoleName.Viewer]: await this.roles.save(
        this.roles.create({ name: RoleName.Viewer }),
      ),
    };

    const permissionEntities: Permission[] = [];
    for (const [roleName, roleEntity] of Object.entries(rolesByName) as Array<[
      RoleName,
      Role,
    ]>) {
      const actions = permissionsForRole(roleName);
      for (const action of actions) {
        permissionEntities.push(
          this.permissions.create({
            role: roleEntity,
            action: action as PermissionAction,
          }),
        );
      }
    }
    await this.permissions.save(permissionEntities);
    return rolesByName;
  }

  private async createUsers(
    orgs: { rootOrg: Organization; fieldOps: Organization; research: Organization },
    roles: Record<RoleName, Role>,
  ): Promise<{ owner: User; admin: User; viewer: User }> {
    const password = await bcrypt.hash('ChangeMe123!', 10);

    const owner = await this.users.save(
      this.users.create({
        email: 'owner@turbovets.test',
        displayName: 'Olivia Owner',
        passwordHash: password,
        role: roles[RoleName.Owner],
        organization: orgs.rootOrg,
      }),
    );

    const admin = await this.users.save(
      this.users.create({
        email: 'admin@turbovets.test',
        displayName: 'Avery Admin',
        passwordHash: password,
        role: roles[RoleName.Admin],
        organization: orgs.fieldOps,
      }),
    );

    const viewer = await this.users.save(
      this.users.create({
        email: 'viewer@turbovets.test',
        displayName: 'Vera Viewer',
        passwordHash: password,
        role: roles[RoleName.Viewer],
        organization: orgs.research,
      }),
    );

    return { owner, admin, viewer };
  }

  private async createSampleTasks(users: {
    owner: User;
    admin: User;
    viewer: User;
  }): Promise<void> {
    const tasks: Task[] = [
      this.tasks.create({
        title: 'Calibrate monitoring sensors',
        description: 'Ensure clinic sensors are calibrated for evening shift.',
        category: 'Operations',
        status: TaskStatus.InProgress,
        priority: TaskPriority.High,
        organization: users.admin.organization,
        creator: users.admin,
        assignee: users.admin,
      }),
      this.tasks.create({
        title: 'Draft Q4 training plan',
        description: 'Outline onboarding modules for new field staff.',
        category: 'Training',
        status: TaskStatus.Backlog,
        priority: TaskPriority.Medium,
        organization: users.owner.organization,
        creator: users.owner,
        assignee: users.owner,
      }),
      this.tasks.create({
        title: 'Compile bio-sample audit',
        description: 'Summarize chain-of-custody for last week.',
        category: 'Compliance',
        status: TaskStatus.Completed,
        priority: TaskPriority.Medium,
        organization: users.viewer.organization,
        creator: users.owner,
        assignee: users.viewer,
      }),
    ];

    const saved = await this.tasks.save(tasks);
    const auditEntries = saved.map((task) =>
      this.auditLogs.create({
        actor: task.creator,
        action: AuditAction.TaskCreate,
        resourceId: task.id,
        resourceType: 'task',
        metadata: { title: task.title },
      }),
    );
    await this.auditLogs.save(auditEntries);
  }
}
