import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { AuthenticatedUser } from '../common/authenticated-user.interface';
import { AuthPayload } from '@turbovetnx/data';
import { RoleName } from '@turbovetnx/auth';
import { DEFAULT_JWT_SECRET } from './auth.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateCredentials(email: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.usersService.findByEmail(email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role.name,
      organizationId: user.organization.id,
      organizationPath: user.organization.path,
    };
  }

  async login(user: AuthenticatedUser): Promise<AuthPayload> {
    const expiresIn = this.config.get<number>('JWT_EXPIRES_IN_SECONDS') ?? 3600;
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        organizationId: user.organizationId,
        organizationPath: user.organizationPath,
      },
      accessToken,
      expiresIn,
    };
  }

  private get jwtSecret(): string {
    const secret = this.config.get<string>('JWT_SECRET');
    if (secret) {
      return secret;
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is not configured');
    }

    this.logger.warn('JWT_SECRET is not configured; using development fallback secret.');
    return DEFAULT_JWT_SECRET;
  }

  async getProfile(userId: string): Promise<AuthenticatedUser> {
    const user = await this.usersService.findById(userId);
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role.name as RoleName,
      organizationId: user.organization.id,
      organizationPath: user.organization.path,
    };
  }
}
