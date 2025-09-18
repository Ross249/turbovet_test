import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditModule } from './audit/audit.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    TasksModule,
    AuditModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
