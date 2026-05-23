import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { UpdateIncidentDto } from "./dto/update-incident.dto";
import { QueryIncidentDto } from "./dto/query-incident.dto";

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(private prisma: PrismaService) {}

  private async generateTicketId(): Promise<string> {
    const count = await this.prisma.incident.count();
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(6, "0");
    return `TKT-${year}-${seq}`;
  }

  async create(dto: CreateIncidentDto, userId: string) {
    const ticketId = await this.generateTicketId();

    const incident = await this.prisma.incident.create({
      data: {
        ticketId,
        callerName: dto.callerName,
        phoneNumber: dto.phoneNumber,
        incidentType: dto.incidentType,
        description: dto.description,
        location: dto.location,
        priority: dto.priority || "MEDIUM",
        poleId: dto.poleId,
        reportedById: userId,
        assignedToId: dto.assignedToId,
        slaDeadline: dto.slaDeadline ? new Date(dto.slaDeadline) : null,
      },
      include: {
        reportedBy: { select: { firstName: true, lastName: true } },
        pole: { select: { streetLightId: true } },
      },
    });

    if (dto.assignedToId) {
      await this.prisma.notification.create({
        data: {
          userId: dto.assignedToId,
          title: "New Incident Assigned",
          message: `Incident ${ticketId} has been assigned to you`,
          type: "ASSIGNMENT",
          incidentId: incident.id,
        },
      });
    }

    return incident;
  }

  async findAll(query: QueryIncidentDto) {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      incidentType,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (incidentType) where.incidentType = incidentType;
    if (search) {
      where.OR = [
        { ticketId: { contains: search, mode: "insensitive" } },
        { callerName: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.incident.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reportedBy: { select: { firstName: true, lastName: true } },
          assignedTo: { select: { firstName: true, lastName: true } },
          pole: { select: { streetLightId: true } },
        },
      }),
      this.prisma.incident.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        reportedBy: {
          select: { firstName: true, lastName: true, email: true },
        },
        assignedTo: { select: { firstName: true, lastName: true } },
        pole: true,
        workOrders: true,
        attachments: true,
        callLogs: true,
      },
    });
    if (!incident) throw new NotFoundException("Incident not found");
    return incident;
  }

  async update(id: string, dto: UpdateIncidentDto) {
    await this.findOne(id);
    return this.prisma.incident.update({
      where: { id },
      data: {
        ...dto,
        slaDeadline: dto.slaDeadline ? new Date(dto.slaDeadline) : undefined,
        resolvedAt:
          dto.status === "RESOLVED" || dto.status === "CLOSED"
            ? new Date()
            : undefined,
      },
    });
  }

  async getSlaStats() {
    const incidents = await this.prisma.incident.findMany({
      where: {
        status: { in: ["RESOLVED", "CLOSED"] },
        slaDeadline: { not: null },
      },
    });
    const met = incidents.filter(
      (i) => i.resolvedAt && i.slaDeadline && i.resolvedAt <= i.slaDeadline,
    ).length;
    return {
      total: incidents.length,
      met,
      breached: incidents.length - met,
      complianceRate: incidents.length
        ? Math.round((met / incidents.length) * 100)
        : 0,
    };
  }
}
