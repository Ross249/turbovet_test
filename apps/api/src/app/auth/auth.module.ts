import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { DEFAULT_JWT_SECRET } from './auth.constants';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? DEFAULT_JWT_SECRET,
        signOptions: {
          expiresIn: `${config.get<number>('JWT_EXPIRES_IN_SECONDS') ?? 3600}s`,
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
