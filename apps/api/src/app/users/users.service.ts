import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserSummary } from '@turbovetnx/data';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Role)
    private readonly roles: Repository<Role>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  toSummary(user: User): UserSummary {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role.name,
      organizationId: user.organization.id,
      organizationPath: user.organization.path,
    };
  }

  async listByOrganizationIds(orgIds: string[]): Promise<UserSummary[]> {
    if (orgIds.length === 0) {
      return [];
    }
    const users = await this.users.find({
      where: { organization: { id: In(orgIds) } },
      relations: ['organization', 'role'],
    });
    return users.map((user) => this.toSummary(user));
  }
}
