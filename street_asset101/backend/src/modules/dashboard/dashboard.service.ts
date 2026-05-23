import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [totalPoles, activePoles, damagedPoles, totalIncidents, openIncidents, totalWorkOrders, pendingWorkOrders, completedWorkOrders] = await Promise.all([
      this.prisma.pole.count({ where: { isDeleted: false } }),
      this.prisma.pole.count({ where: { isDeleted: false, status: 'ACTIVE' } }),
      this.prisma.pole.count({ where: { isDeleted: false, status: 'DAMAGED' } }),
      this.prisma.incident.count(),
      this.prisma.incident.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      this.prisma.workOrder.count(),
      this.prisma.workOrder.count({ where: { status: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] } } }),
      this.prisma.workOrder.count({ where: { status: 'COMPLETED' } }),
    ]);

    return {
      totalPoles, activePoles, damagedPoles,
      totalIncidents, openIncidents,
      totalWorkOrders, pendingWorkOrders, completedWorkOrders,
      poleHealthRate: totalPoles ? Math.round((activePoles / totalPoles) * 100) : 0,
    };
  }

  async getRegionalComparison() {
    const regions = await this.prisma.region.findMany({
      include: {
        _count: { select: { poles: true } },
      },
    });
    return regions.map(r => ({ name: r.name, code: r.code, poleCount: r._count.poles }));
  }

  async getMaintenanceStats() {
    const byStatus = await this.prisma.pole.groupBy({
      by: ['maintenanceStatus'],
      _count: true,
      where: { isDeleted: false },
    });
    return byStatus.map(s => ({ status: s.maintenanceStatus, count: s._count }));
  }

  async getFaultStatistics() {
    const byRegion = await this.prisma.pole.groupBy({
      by: ['regionId'],
      _count: true,
      where: { isDeleted: false, status: { in: ['DAMAGED', 'UNDER_MAINTENANCE'] } },
    });
    return byRegion;
  }

  async getRecentActivities(limit = 10) {
    const logs = await this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    return logs;
  }
}
