import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { PermissionsGuard } from '../access/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditService, PermissionsGuard],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
