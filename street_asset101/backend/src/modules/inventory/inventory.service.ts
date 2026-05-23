import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private prisma: PrismaService) {}

  private async generateRequestId(): Promise<string> {
    const count = await this.prisma.inventoryRequest.count();
    return `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;
  }

  async createRequest(
    dto: {
      title: string;
      description?: string;
      items: string;
      workOrderId?: string;
    },
    userId: string,
  ) {
    const requestId = await this.generateRequestId();
    return this.prisma.inventoryRequest.create({
      data: {
        requestId,
        title: dto.title,
        description: dto.description,
        items: dto.items,
        workOrderId: dto.workOrderId,
        requestedById: userId,
      },
    });
  }

  async findAllRequests(page = 1, limit = 10, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.inventoryRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          requestedBy: { select: { firstName: true, lastName: true } },
          approvedBy: { select: { firstName: true, lastName: true } },
          workOrder: { select: { workOrderId: true, title: true } },
        },
      }),
      this.prisma.inventoryRequest.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async approveRequest(
    id: string,
    approverId: string,
    dto: { approved: boolean; notes?: string },
  ) {
    const request = await this.prisma.inventoryRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException("Request not found");

    const status = dto.approved ? "APPROVED" : "REJECTED";
    const updated = await this.prisma.inventoryRequest.update({
      where: { id },
      data: {
        status,
        approvedById: approverId,
        approvedAt: new Date(),
        notes: dto.notes,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: request.requestedById,
        title: dto.approved
          ? "Inventory Request Approved"
          : "Inventory Request Rejected",
        message: `Your request ${request.requestId} has been ${dto.approved ? "approved" : "rejected"}`,
        type: dto.approved ? "APPROVAL" : "REJECTION",
      },
    });

    return updated;
  }

  async getItems() {
    return this.prisma.inventoryItem.findMany({ orderBy: { name: "asc" } });
  }

  async createItem(dto: {
    name: string;
    description?: string;
    quantity: number;
    unit: string;
    minQuantity?: number;
    location?: string;
  }) {
    return this.prisma.inventoryItem.create({ data: dto });
  }

  async updateItem(
    id: string,
    dto: { quantity?: number; minQuantity?: number; name?: string },
  ) {
    return this.prisma.inventoryItem.update({ where: { id }, data: dto });
  }

  async getLowStockAlerts() {
    return this.prisma.inventoryItem.findMany({
      where: {
        quantity: { lte: this.prisma.inventoryItem.fields.minQuantity },
      },
    });
  }
}
