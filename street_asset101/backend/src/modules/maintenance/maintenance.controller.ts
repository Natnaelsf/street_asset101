import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Post('reports/:workOrderId')
  @Roles(UserRole.MAINTENANCE_ENGINEER)
  async submitReport(
    @Param('workOrderId') workOrderId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: { description?: string; inventoryUsed?: string; completionPhotos?: string; status?: string },
  ) {
    return this.maintenanceService.submitEngineerReport(workOrderId, userId, dto);
  }

  @Put('reviews/:reportId')
  @Roles(UserRole.OPERATION_MAINTENANCE_DIRECTOR, UserRole.OPERATION_MAINTENANCE_DDG, UserRole.NORTH_REGION_DIRECTOR, UserRole.SOUTH_REGION_DIRECTOR, UserRole.WEST_REGION_DIRECTOR, UserRole.EAST_REGION_DIRECTOR)
  async reviewReport(
    @Param('reportId') reportId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: { status: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'; reviewNotes?: string },
  ) {
    return this.maintenanceService.reviewReport(reportId, userId, dto);
  }

  @Put('issues/:incidentId/approve')
  @Roles(UserRole.OPERATION_MAINTENANCE_DDG)
  async approveIssue(
    @Param('incidentId') incidentId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: { approved: boolean; comments?: string },
  ) {
    return this.maintenanceService.approveIssue(incidentId, userId, dto);
  }

  @Get('stats')
  async getWorkflowStats() {
    return this.maintenanceService.getWorkflowStats();
  }

  @Get('engineer-dashboard')
  @Roles(UserRole.MAINTENANCE_ENGINEER)
  async getEngineerDashboard(@CurrentUser('id') userId: string) {
    return this.maintenanceService.getEngineerDashboard(userId);
  }
}
