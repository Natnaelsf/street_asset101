import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DIRECTOR_GENERAL, UserRole.ICT_DIRECTOR)
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('userId') userId?: string, @Query('action') action?: string, @Query('entity') entity?: string) {
    return this.auditLogsService.findAll(page || 1, limit || 20, userId, action, entity);
  }
}
