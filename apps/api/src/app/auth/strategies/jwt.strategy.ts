import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../../common/authenticated-user.interface';
import { AuthService } from '../auth.service';
import { RoleName } from '@turbovetnx/auth';
import { DEFAULT_JWT_SECRET } from '../auth.constants';

interface JwtPayload {
  sub: string;
  email: string;
  role: RoleName;
  organizationId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? DEFAULT_JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    return this.authService.getProfile(payload.sub);
  }
}
