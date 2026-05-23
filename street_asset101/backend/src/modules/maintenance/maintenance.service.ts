import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(private prisma: PrismaService) {}

  async submitEngineerReport(
    workOrderId: string,
    engineerId: string,
    dto: {
      description?: string;
      inventoryUsed?: string;
      completionPhotos?: string;
      status?: string;
    },
  ) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
    });
    if (!wo) throw new NotFoundException("Work order not found");

    const report = await this.prisma.maintenanceReport.create({
      data: {
        workOrderId,
        engineerId,
        description: dto.description,
        inventoryUsed: dto.inventoryUsed,
        completionPhotos: dto.completionPhotos,
        status: "COMPLETED",
      },
    });

    await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: { status: "COMPLETED" },
    });

    await this.prisma.notification.create({
      data: {
        userId: wo.assignedById,
        title: "Engineer Report Submitted",
        message: `Engineer has submitted completion report for work order ${wo.workOrderId}`,
        type: "COMPLETION",
        workOrderId: workOrderId,
      },
    });

    return report;
  }

  async reviewReport(
    reportId: string,
    reviewerId: string,
    dto: {
      status: "APPROVED" | "REJECTED" | "REVISION_REQUESTED";
      reviewNotes?: string;
    },
  ) {
    const report = await this.prisma.maintenanceReport.findUnique({
      where: { id: reportId },
      include: { workOrder: true },
    });
    if (!report) throw new NotFoundException("Report not found");

    const updated = await this.prisma.maintenanceReport.update({
      where: { id: reportId },
      data: {
        status: dto.status,
        reviewNotes: dto.reviewNotes,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
    });

    await this.prisma.workOrder.update({
      where: { id: report.workOrderId },
      data: {
        status:
          dto.status === "APPROVED"
            ? "APPROVED"
            : dto.status === "REVISION_REQUESTED"
              ? "REVISION_REQUESTED"
              : "REJECTED",
      },
    });

    const title =
      dto.status === "APPROVED"
        ? "Report Approved"
        : dto.status === "REVISION_REQUESTED"
          ? "Revision Requested"
          : "Report Rejected";
    await this.prisma.notification.create({
      data: {
        userId: report.engineerId,
        title,
        message: `Your work order report has been ${dto.status.toLowerCase()}`,
        type: dto.status === "APPROVED" ? "COMPLETION" : "REJECTION",
        workOrderId: report.workOrderId,
      },
    });

    return updated;
  }

  async approveIssue(
    incidentId: string,
    reviewerId: string,
    dto: { approved: boolean; comments?: string },
  ) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
      include: { reportedBy: true },
    });
    if (!incident) throw new NotFoundException("Incident not found");

    const status = dto.approved ? "IN_PROGRESS" : "REJECTED";
    await this.prisma.incident.update({
      where: { id: incidentId },
      data: { status },
    });

    await this.prisma.notification.create({
      data: {
        userId: incident.reportedById,
        title: dto.approved ? "Issue Approved" : "Issue Rejected",
        message:
          dto.comments ||
          `Your issue has been ${dto.approved ? "approved" : "rejected"}`,
        type: dto.approved ? "APPROVAL" : "REJECTION",
        incidentId: incidentId,
      },
    });

    return {
      message: `Issue ${dto.approved ? "approved" : "rejected"} successfully`,
    };
  }

  async getWorkflowStats() {
    const [totalIssues, totalWorkOrders, completedWO, approvedWO] =
      await Promise.all([
        this.prisma.incident.count(),
        this.prisma.workOrder.count(),
        this.prisma.workOrder.count({ where: { status: "COMPLETED" } }),
        this.prisma.workOrder.count({ where: { status: "APPROVED" } }),
      ]);
    return {
      totalIssues,
      totalWorkOrders,
      completedWorkOrders: completedWO,
      approvedWorkOrders: approvedWO,
      completionRate: totalWorkOrders
        ? Math.round((approvedWO / totalWorkOrders) * 100)
        : 0,
    };
  }

  async getEngineerDashboard(engineerId: string) {
    const [assignedOrders, completedOrders, pendingOrders] = await Promise.all([
      this.prisma.workOrder.count({ where: { assignedToId: engineerId } }),
      this.prisma.maintenanceReport.count({
        where: { engineerId, status: "APPROVED" },
      }),
      this.prisma.workOrder.count({
        where: {
          assignedToId: engineerId,
          status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] },
        },
      }),
    ]);
    return { assignedOrders, completedOrders, pendingOrders };
  }
}
