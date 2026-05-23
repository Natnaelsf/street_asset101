import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateWorkOrderDto } from "./dto/create-work-order.dto";
import { UpdateWorkOrderDto } from "./dto/update-work-order.dto";
import { QueryWorkOrderDto } from "./dto/query-work-order.dto";

@Injectable()
export class WorkOrdersService {
  private readonly logger = new Logger(WorkOrdersService.name);

  constructor(private prisma: PrismaService) {}

  private async generateWorkOrderId(): Promise<string> {
    const count = await this.prisma.workOrder.count();
    const year = new Date().getFullYear();
    return `WO-${year}-${String(count + 1).padStart(5, "0")}`;
  }

  async create(dto: CreateWorkOrderDto, userId: string) {
    const workOrderId = await this.generateWorkOrderId();

    const workOrder = await this.prisma.workOrder.create({
      data: {
        workOrderId,
        title: dto.title,
        description: dto.description,
        type: dto.type || "HEAD_OFFICE",
        status: "PENDING",
        priority: dto.priority || "MEDIUM",
        incidentId: dto.incidentId,
        poleId: dto.poleId,
        assignedById: userId,
        assignedToId: dto.assignedToId,
        regionId: dto.regionId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      include: {
        assignedTo: { select: { firstName: true, lastName: true } },
        incident: { select: { ticketId: true } },
      },
    });

    if (dto.assignedToId) {
      await this.prisma.notification.create({
        data: {
          userId: dto.assignedToId,
          title: "New Work Order",
          message: `Work order ${workOrderId} has been assigned to you`,
          type: "ASSIGNMENT",
          workOrderId: workOrder.id,
        },
      });
    }

    return workOrder;
  }

  async findAll(query: QueryWorkOrderDto) {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      regionId,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (regionId) where.regionId = regionId;
    if (search)
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { workOrderId: { contains: search, mode: "insensitive" } },
      ];

    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          assignedTo: { select: { firstName: true, lastName: true } },
          assignedBy: { select: { firstName: true, lastName: true } },
          pole: { select: { streetLightId: true } },
          incident: { select: { ticketId: true } },
        },
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        assignedBy: true,
        pole: true,
        incident: true,
        maintenanceReports: {
          include: {
            engineer: { select: { firstName: true, lastName: true } },
          },
        },
        inventoryRequests: true,
        region: true,
      },
    });
    if (!wo) throw new NotFoundException("Work order not found");
    return wo;
  }

  async update(id: string, dto: UpdateWorkOrderDto) {
    await this.findOne(id);
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        completedAt:
          dto.status === "COMPLETED" || dto.status === "APPROVED"
            ? new Date()
            : undefined,
      },
    });
  }

  async addComment(workOrderId: string, content: string, userId: string) {
    await this.findOne(workOrderId);
    const comment = await this.prisma.comment.create({
      data: { content, userId, entity: "WORK_ORDER", entityId: workOrderId },
      include: {
        user: { select: { firstName: true, lastName: true, role: true } },
      },
    });
    return comment;
  }
}
