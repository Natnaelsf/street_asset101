import { Injectable, Logger, Res } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import PDFDocument from "pdfkit";
import * as ExcelJS from "exceljs";
import { stringify } from "csv-stringify/sync";
import { Response } from "express";

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private prisma: PrismaService) {}

  async generatePoleInventoryReport(
    format: "pdf" | "excel" | "csv",
    res: Response,
    filters?: { regionId?: string; status?: string },
  ) {
    const where: any = { isDeleted: false };
    if (filters?.regionId) where.regionId = filters.regionId;
    if (filters?.status) where.status = filters.status;

    const poles = await this.prisma.pole.findMany({
      where,
      include: { region: true, subcity: true },
      orderBy: { streetLightId: "asc" },
    });

    const data = poles.map((p) => ({
      "Street Light ID": p.streetLightId,
      Latitude: p.latitude,
      Longitude: p.longitude,
      "Lamp Type": p.lampType || "",
      Material: p.poleMaterial || "",
      Condition: p.poleCondition || "",
      Status: p.status,
      Maintenance: p.maintenanceStatus,
      Region: p.region?.name || "",
      Subcity: p.subcity?.name || "",
      "Installation Date": p.installationDate
        ? p.installationDate.toISOString().split("T")[0]
        : "",
      Remarks: p.remarks || "",
    }));

    if (format === "csv") {
      const csv = stringify(data, { header: true });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=pole-inventory-report.csv",
      );
      res.send(csv);
    } else if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Pole Inventory");
      sheet.columns = Object.keys(data[0] || {}).map((key) => ({
        header: key,
        key,
        width: 20,
      }));
      sheet.addRows(data);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=pole-inventory-report.xlsx",
      );
      await workbook.xlsx.write(res);
      res.end();
    } else {
      const doc = new PDFDocument({
        margin: 30,
        size: "A4",
        layout: "landscape",
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=pole-inventory-report.pdf",
      );
      doc.pipe(res);

      doc
        .fontSize(16)
        .text("Street Light Pole Inventory Report", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(10)
        .text(`Generated: ${new Date().toISOString()}`, { align: "right" });
      doc.moveDown();

      const tableTop = 100;
      const colWidths = [80, 60, 60, 60, 60, 60, 60, 60, 60];
      const headers = [
        "Pole ID",
        "Lat",
        "Lng",
        "Lamp",
        "Material",
        "Condition",
        "Status",
        "Region",
        "Subcity",
      ];
      let y = tableTop;

      doc.fontSize(8).font("Helvetica-Bold");
      headers.forEach((h, i) => {
        doc.text(h, 30 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
          width: colWidths[i],
        });
      });
      y += 15;

      doc.font("Helvetica").fontSize(7);
      poles.forEach((p) => {
        if (y > 550) {
          doc.addPage();
          y = 50;
        }
        const vals = [
          p.streetLightId,
          p.latitude.toString(),
          p.longitude.toString(),
          p.lampType || "",
          p.poleMaterial || "",
          p.poleCondition || "",
          p.status,
          p.region?.name || "",
          p.subcity?.name || "",
        ];
        vals.forEach((v, i) => {
          doc.text(
            v,
            30 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
            y,
            { width: colWidths[i] },
          );
        });
        y += 12;
      });

      doc.end();
    }
  }

  async generateMaintenanceReport(
    format: "pdf" | "excel" | "csv",
    res: Response,
    workOrderId?: string,
  ) {
    const where: any = {};
    if (workOrderId) where.id = workOrderId;

    const workOrders = await this.prisma.workOrder.findMany({
      where,
      include: {
        assignedTo: true,
        pole: true,
        maintenanceReports: { include: { engineer: true } },
        region: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const data = workOrders.map((wo) => ({
      "Work Order ID": wo.workOrderId,
      Title: wo.title,
      Type: wo.type,
      Status: wo.status,
      Priority: wo.priority,
      "Assigned To": wo.assignedTo
        ? `${wo.assignedTo.firstName} ${wo.assignedTo.lastName}`
        : "",
      Region: wo.region?.name || "",
      Pole: wo.pole?.streetLightId || "",
      Created: wo.createdAt.toISOString().split("T")[0],
      Completed: wo.completedAt
        ? wo.completedAt.toISOString().split("T")[0]
        : "",
    }));

    if (format === "csv") {
      const csv = stringify(data, { header: true });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=maintenance-report.csv",
      );
      res.send(csv);
    } else if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Maintenance Report");
      sheet.columns = Object.keys(data[0] || {}).map((key) => ({
        header: key,
        key,
        width: 20,
      }));
      sheet.addRows(data);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=maintenance-report.xlsx",
      );
      await workbook.xlsx.write(res);
      res.end();
    } else {
      const doc = new PDFDocument({
        margin: 30,
        size: "A4",
        layout: "landscape",
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=maintenance-report.pdf",
      );
      doc.pipe(res);
      doc.fontSize(16).text("Maintenance Report", { align: "center" });
      doc
        .moveDown()
        .fontSize(10)
        .text(`Generated: ${new Date().toISOString()}`, { align: "right" });
      doc.moveDown();

      const colWidths = [70, 80, 50, 60, 50, 80, 50, 70];
      const headers = [
        "WO ID",
        "Title",
        "Type",
        "Status",
        "Priority",
        "Assignee",
        "Region",
        "Pole",
      ];
      let y = 100;

      doc.fontSize(7).font("Helvetica-Bold");
      headers.forEach((h, i) => {
        doc.text(h, 30 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
          width: colWidths[i],
        });
      });
      y += 15;

      doc.font("Helvetica").fontSize(6);
      workOrders.forEach((wo) => {
        if (y > 550) {
          doc.addPage();
          y = 50;
        }
        const vals = [
          wo.workOrderId,
          wo.title,
          wo.type,
          wo.status,
          wo.priority,
          wo.assignedTo
            ? `${wo.assignedTo.firstName} ${wo.assignedTo.lastName}`
            : "",
          wo.region?.name || "",
          wo.pole?.streetLightId || "",
        ];
        vals.forEach((v, i) => {
          doc.text(
            v,
            30 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
            y,
            { width: colWidths[i] },
          );
        });
        y += 12;
      });
      doc.end();
    }
  }

  async generateIncidentReport(
    format: "pdf" | "excel" | "csv",
    res: Response,
    filters?: { status?: string; priority?: string },
  ) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;

    const incidents = await this.prisma.incident.findMany({
      where,
      include: { reportedBy: true, assignedTo: true, pole: true },
      orderBy: { createdAt: "desc" },
    });

    const data = incidents.map((inc) => ({
      "Ticket ID": inc.ticketId,
      Caller: inc.callerName,
      Phone: inc.phoneNumber,
      Type: inc.incidentType,
      Priority: inc.priority,
      Status: inc.status,
      "Reported By": `${inc.reportedBy.firstName} ${inc.reportedBy.lastName}`,
      "Assigned To": inc.assignedTo
        ? `${inc.assignedTo.firstName} ${inc.assignedTo.lastName}`
        : "",
      Pole: inc.pole?.streetLightId || "",
      Created: inc.createdAt.toISOString().split("T")[0],
      Resolved: inc.resolvedAt
        ? inc.resolvedAt.toISOString().split("T")[0]
        : "",
    }));

    if (format === "csv") {
      const csv = stringify(data, { header: true });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=incident-report.csv",
      );
      res.send(csv);
    } else if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Incident Report");
      sheet.columns = Object.keys(data[0] || {}).map((key) => ({
        header: key,
        key,
        width: 20,
      }));
      sheet.addRows(data);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=incident-report.xlsx",
      );
      await workbook.xlsx.write(res);
      res.end();
    } else {
      const doc = new PDFDocument({
        margin: 30,
        size: "A4",
        layout: "landscape",
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=incident-report.pdf",
      );
      doc.pipe(res);
      doc.fontSize(16).text("Incident Report", { align: "center" });
      doc
        .moveDown()
        .fontSize(10)
        .text(`Generated: ${new Date().toISOString()}`, { align: "right" });
      doc.moveDown();

      const colWidths = [70, 60, 60, 60, 50, 60, 80, 80, 60, 60];
      const headers = [
        "Ticket",
        "Caller",
        "Phone",
        "Type",
        "Priority",
        "Status",
        "Reporter",
        "Assignee",
        "Pole",
        "Created",
      ];
      let y = 100;
      doc.fontSize(7).font("Helvetica-Bold");
      headers.forEach((h, i) => {
        doc.text(h, 30 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
          width: colWidths[i],
        });
      });
      y += 15;
      doc.font("Helvetica").fontSize(6);
      incidents.forEach((inc) => {
        if (y > 550) {
          doc.addPage();
          y = 50;
        }
        const vals = [
          inc.ticketId,
          inc.callerName,
          inc.phoneNumber,
          inc.incidentType,
          inc.priority,
          inc.status,
          `${inc.reportedBy.firstName} ${inc.reportedBy.lastName}`,
          inc.assignedTo
            ? `${inc.assignedTo.firstName} ${inc.assignedTo.lastName}`
            : "",
          inc.pole?.streetLightId || "",
          inc.createdAt.toISOString().split("T")[0],
        ];
        vals.forEach((v, i) => {
          doc.text(
            v,
            30 + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
            y,
            { width: colWidths[i] },
          );
        });
        y += 12;
      });
      doc.end();
    }
  }
}
