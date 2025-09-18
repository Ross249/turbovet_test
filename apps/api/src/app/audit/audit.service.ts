import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { User } from '../entities/user.entity';
import { AuditAction, AuditLogEntry } from '@turbovetnx/data';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogs: Repository<AuditLog>,
  ) {}

  async record(options: {
    actorId: string;
    action: AuditAction;
    resourceType: string;
    resourceId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const entry = this.auditLogs.create({
      actor: { id: options.actorId } as User,
      action: options.action,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      metadata: options.metadata ?? null,
    });
    await this.auditLogs.save(entry);
    this.logger.log(
      `AUDIT ${options.action} actor=${options.actorId} resource=${options.resourceType}:${options.resourceId}`,
    );
  }

  async recent(limit = 50): Promise<AuditLogEntry[]> {
    const entries = await this.auditLogs.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['actor'],
    });
    return entries.map((entry) => ({
      id: entry.id,
      actorId: entry.actor.id,
      action: entry.action,
      resourceId: entry.resourceId,
      resourceType: entry.resourceType,
      metadata: entry.metadata ?? undefined,
      createdAt: entry.createdAt.toISOString(),
    }));
  }
}
