import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CallLogsService {
  private readonly logger = new Logger(CallLogsService.name);
  constructor(private prisma: PrismaService) {}

  async create(dto: { callerName: string; phoneNumber: string; duration?: number; callType?: string; recordingUrl?: string; notes?: string; incidentId?: string }, agentId: string) {
    return this.prisma.callLog.create({ data: { ...dto, agentId } });
  }

  async findAll(page = 1, limit = 10, agentId?: string) {
    const where: any = {};
    if (agentId) where.agentId = agentId;

    const [data, total] = await Promise.all([
      this.prisma.callLog.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { agent: { select: { firstName: true, lastName: true } }, incident: { select: { ticketId: true } } },
      }),
      this.prisma.callLog.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
