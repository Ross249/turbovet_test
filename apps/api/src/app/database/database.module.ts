import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { Organization } from '../entities/organization.entity';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env.local', 'apps/api/.env'],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        database: config.get<string>('DATABASE_PATH') ?? 'apps/api/data/turbovet.sqlite',
        autoLoadEntities: true,
        synchronize: true,
        logging: config.get<boolean>('ORM_LOGGING') ?? false,
      }),
    }),
    TypeOrmModule.forFeature([Organization, Role, Permission, User, Task, AuditLog]),
  ],
  providers: [SeedService],
  exports: [SeedService, TypeOrmModule],
})
export class DatabaseModule {}
