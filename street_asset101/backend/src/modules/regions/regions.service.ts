import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.region.findMany({
      include: {
        subcities: true,
        _count: { select: { poles: true } },
      },
    });
  }

  async getSubcities(regionId?: string) {
    const where: any = {};
    if (regionId) where.regionId = regionId;
    return this.prisma.subcity.findMany({ where, include: { region: true } });
  }
}
