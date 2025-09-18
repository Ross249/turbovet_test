import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../access/permissions.guard';
import { RequirePermissions } from '../access/permissions.decorator';
import { PermissionAction } from '@turbovetnx/auth';
import { AuditLogEntry } from '@turbovetnx/data';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions(PermissionAction.AuditRead)
  async getRecent(@Query('limit') limit?: string): Promise<AuditLogEntry[]> {
    const parsed = Number.parseInt(limit ?? '50', 10);
    const safeLimit = Number.isNaN(parsed) ? 50 : Math.min(parsed, 200);
    return this.auditService.recent(safeLimit);
  }
}
