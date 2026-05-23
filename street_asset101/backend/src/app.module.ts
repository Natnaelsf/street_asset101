import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PolesModule } from './modules/poles/poles.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CallLogsModule } from './modules/call-logs/call-logs.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { RegionsModule } from './modules/regions/regions.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    PolesModule,
    IncidentsModule,
    WorkOrdersModule,
    MaintenanceModule,
    InventoryModule,
    NotificationsModule,
    ReportsModule,
    DashboardModule,
    CallLogsModule,
    AuditLogsModule,
    RegionsModule,
    AttachmentsModule,
  ],
})
export class AppModule {}
