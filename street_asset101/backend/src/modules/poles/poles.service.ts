import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePoleDto } from "./dto/create-pole.dto";
import { UpdatePoleDto } from "./dto/update-pole.dto";
import { QueryPoleDto } from "./dto/query-pole.dto";
import * as csv from "csv-parse/sync";
import * as XLSX from "exceljs";

@Injectable()
export class PolesService {
  private readonly logger = new Logger(PolesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePoleDto, userId: string) {
    const existing = await this.prisma.pole.findUnique({
      where: { streetLightId: dto.streetLightId },
    });
    if (existing)
      throw new ConflictException(
        `Pole with ID ${dto.streetLightId} already exists`,
      );

    const region = await this.prisma.region.findUnique({
      where: { id: dto.regionId },
    });
    if (!region) throw new NotFoundException("Region not found");

    if (dto.subcityId) {
      const subcity = await this.prisma.subcity.findUnique({
        where: { id: dto.subcityId },
      });
      if (!subcity) throw new NotFoundException("Subcity not found");
    }

    const pole = await this.prisma.pole.create({
      data: {
        streetLightId: dto.streetLightId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        lampType: dto.lampType,
        poleMaterial: dto.poleMaterial,
        poleCondition: dto.poleCondition,
        status: dto.status || "ACTIVE",
        maintenanceStatus: dto.maintenanceStatus || "GOOD",
        regionId: dto.regionId,
        subcityId: dto.subcityId,
        installationDate: dto.installationDate
          ? new Date(dto.installationDate)
          : null,
        photoUrl: dto.photoUrl,
        remarks: dto.remarks,
        createdById: userId,
      },
      include: {
        region: true,
        subcity: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return pole;
  }

  async findAll(query: QueryPoleDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      regionId,
      subcityId,
      maintenanceStatus,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };
    if (search) {
      where.OR = [
        { streetLightId: { contains: search, mode: "insensitive" } },
        { remarks: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;
    if (regionId) where.regionId = regionId;
    if (subcityId) where.subcityId = subcityId;
    if (maintenanceStatus) where.maintenanceStatus = maintenanceStatus;

    const [poles, total] = await Promise.all([
      this.prisma.pole.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          region: true,
          subcity: true,
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.pole.count({ where }),
    ]);

    return {
      data: poles,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const pole = await this.prisma.pole.findUnique({
      where: { id },
      include: {
        region: true,
        subcity: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        incidents: true,
        workOrders: true,
      },
    });
    if (!pole || pole.isDeleted) throw new NotFoundException("Pole not found");
    return pole;
  }

  async update(id: string, dto: UpdatePoleDto, userId: string) {
    await this.findOne(id);

    const pole = await this.prisma.pole.update({
      where: { id },
      data: {
        ...dto,
        installationDate: dto.installationDate
          ? new Date(dto.installationDate)
          : undefined,
        updatedById: userId,
      },
      include: { region: true, subcity: true },
    });

    return pole;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);

    await this.prisma.pole.update({
      where: { id },
      data: { isDeleted: true, updatedById: userId },
    });

    return { message: "Pole deleted successfully" };
  }

  async getGisData(filters?: {
    regionId?: string;
    subcityId?: string;
    status?: string;
  }) {
    const where: any = { isDeleted: false };
    if (filters?.regionId) where.regionId = filters.regionId;
    if (filters?.subcityId) where.subcityId = filters.subcityId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.pole.findMany({
      where,
      select: {
        id: true,
        streetLightId: true,
        latitude: true,
        longitude: true,
        status: true,
        maintenanceStatus: true,
        region: { select: { name: true } },
        subcity: { select: { name: true } },
      },
    });
  }

  async bulkImport(file: Express.Multer.File, userId: string) {
    let records: any[] = [];
    let errors: string[] = [];
    let successCount = 0;

    try {
      const content = file.buffer.toString("utf-8");
      if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
        records = csv.parse(content, {
          columns: true,
          skip_empty_lines: true,
          relax_column_count: true,
        });
      } else {
        const workbook = new XLSX.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.worksheets[0];
        const jsonData: any[] = [];
        const headers: string[] = [];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) {
            row.eachCell((cell) => headers.push(cell.text));
          } else {
            const obj: any = {};
            row.eachCell((cell, colNumber) => {
              obj[headers[colNumber - 1]] = cell.text;
            });
            jsonData.push(obj);
          }
        });
        records = jsonData;
      }
    } catch (err) {
      throw new BadRequestException(`Failed to parse file: ${err.message}`);
    }

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        if (!record.streetLightId) throw new Error("streetLightId is required");
        if (!record.latitude || !record.longitude)
          throw new Error("latitude and longitude are required");

        const existing = await this.prisma.pole.findUnique({
          where: { streetLightId: record.streetLightId },
        });
        if (existing)
          throw new Error(`Duplicate streetLightId: ${record.streetLightId}`);

        let region = await this.prisma.region.findFirst({
          where: { name: record.region?.toUpperCase() as any },
        });
        if (!region) {
          region = await this.prisma.region.findFirst();
          if (!region) throw new Error("No region found");
        }

        await this.prisma.pole.create({
          data: {
            streetLightId: record.streetLightId,
            latitude: parseFloat(record.latitude),
            longitude: parseFloat(record.longitude),
            lampType: record.lampType,
            poleMaterial: record.poleMaterial,
            poleCondition: record.poleCondition,
            status: record.status || "ACTIVE",
            maintenanceStatus: record.maintenanceStatus || "GOOD",
            regionId: region.id,
            remarks: record.remarks,
            createdById: userId,
          },
        });
        successCount++;
      } catch (err) {
        errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    await this.prisma.importHistory.create({
      data: {
        fileName: file.originalname,
        entity: "POLE",
        totalRows: records.length,
        successRows: successCount,
        failedRows: records.length - successCount,
        errors: JSON.stringify(errors),
        importedById: userId,
      },
    });

    return {
      totalRows: records.length,
      successRows: successCount,
      failedRows: records.length - successCount,
      errors,
    };
  }

  async getImportHistory(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.prisma.importHistory.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.importHistory.count(),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
