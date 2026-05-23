import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('regional-comparison')
  async getRegionalComparison() {
    return this.dashboardService.getRegionalComparison();
  }

  @Get('maintenance-stats')
  async getMaintenanceStats() {
    return this.dashboardService.getMaintenanceStats();
  }

  @Get('fault-statistics')
  async getFaultStatistics() {
    return this.dashboardService.getFaultStatistics();
  }

  @Get('recent-activities')
  async getRecentActivities() {
    return this.dashboardService.getRecentActivities();
  }
}
