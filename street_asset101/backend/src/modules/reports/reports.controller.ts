import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { Response } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Controller("reports")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get("pole-inventory")
  @Roles(
    UserRole.DIRECTOR_GENERAL,
    UserRole.OPERATION_MAINTENANCE_DDG,
    UserRole.ICT_DIRECTOR,
  )
  async getPoleInventoryReport(
    @Res() res: Response,
    @Query("format") format: "pdf" | "excel" | "csv" = "pdf",
    @Query("regionId") regionId?: string,
    @Query("status") status?: string,
  ) {
    return this.reportsService.generatePoleInventoryReport(format, res, {
      regionId,
      status,
    });
  }

  @Get("maintenance")
  async getMaintenanceReport(
    @Res() res: Response,
    @Query("format") format: "pdf" | "excel" | "csv" = "pdf",
    @Query("workOrderId") workOrderId?: string,
  ) {
    return this.reportsService.generateMaintenanceReport(
      format,
      res,
      workOrderId,
    );
  }

  @Get("incidents")
  async getIncidentReport(
    @Res() res: Response,
    @Query("format") format: "pdf" | "excel" | "csv" = "pdf",
    @Query("status") status?: string,
    @Query("priority") priority?: string,
  ) {
    return this.reportsService.generateIncidentReport(format, res, {
      status,
      priority,
    });
  }
}
