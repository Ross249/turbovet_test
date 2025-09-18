import { Controller, Get, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthenticatedUser } from '../common/authenticated-user.interface';
import { OrganizationDto } from '@turbovetnx/data';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser): Promise<OrganizationDto[]> {
    return this.organizationsService.listForUser(user);
  }
}
