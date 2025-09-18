import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../entities/organization.entity';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [TypeOrmModule.forFeature([Organization]), AccessModule],
  providers: [OrganizationsService],
  controllers: [OrganizationsController],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
