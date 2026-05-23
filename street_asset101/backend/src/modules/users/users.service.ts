import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryUserDto) {
    const { page = 1, limit = 10, role, search, region } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) where.role = role;
    if (region) where.region = region;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, region: true, subcity: true, isActive: true, lastLogin: true, createdAt: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true, role: true, region: true, subcity: true, isActive: true, lastLogin: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.update({ where: { id }, data, select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, region: true, subcity: true, isActive: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    return { message: 'User deactivated successfully' };
  }

  async getRolePermissions() {
    return {
      DIRECTOR_GENERAL: { label: 'Director General', permissions: ['full_access', 'view_reports', 'comment_workflows', 'analytics_dashboard', 'regional_performance_dashboard'] },
      ENGINEERING_REGULATORY_DDG: { label: 'Engineering Regulatory DDG', permissions: ['oversight', 'view_reports'] },
      PROCUREMENT_DIRECTOR: { label: 'Procurement & Contract Admin Director', permissions: ['contract_monitoring'] },
      DESIGN_PROJECT_DIRECTOR: { label: 'Design & Project Management Director', permissions: ['design_access', 'project_access'] },
      LICENSE_PERMIT_DDG: { label: 'License & Permit DDG', permissions: ['register_poles', 'edit_poles', 'delete_poles', 'manage_gis', 'manage_config'] },
      ICT_DIRECTOR: { label: 'ICT Director', permissions: ['register_poles', 'edit_poles', 'delete_poles', 'manage_gis', 'manage_config'] },
      LICENSE_CUSTOMER_SERVICE_DIRECTOR: { label: 'License & Customer Service Director', permissions: ['customer_service_oversight'] },
      OPERATION_MAINTENANCE_DDG: { label: 'Operation & Maintenance DDG', permissions: ['approve_issues', 'approve_work_orders', 'monitor_maintenance', 'comment_progress', 'view_reports', 'register_poles', 'edit_poles', 'delete_poles'] },
      OPERATION_MAINTENANCE_DIRECTOR: { label: 'Operation & Maintenance Director', permissions: ['create_work_orders', 'create_inventory_requests', 'review_maintenance_reports', 'approve_maintenance_completion', 'register_poles', 'edit_poles'] },
      MAINTENANCE_CENTER_DIRECTOR: { label: 'Maintenance Center Director', permissions: ['maintenance_operations_visibility'] },
      NORTH_REGION_DIRECTOR: { label: 'North Region Director', permissions: ['create_site_survey', 'create_work_orders', 'create_inventory_requests', 'review_reports', 'approve_completion'] },
      SOUTH_REGION_DIRECTOR: { label: 'South Region Director', permissions: ['create_site_survey', 'create_work_orders', 'create_inventory_requests', 'review_reports', 'approve_completion'] },
      WEST_REGION_DIRECTOR: { label: 'West Region Director', permissions: ['create_site_survey', 'create_work_orders', 'create_inventory_requests', 'review_reports', 'approve_completion'] },
      EAST_REGION_DIRECTOR: { label: 'East Region Director', permissions: ['create_site_survey', 'create_work_orders', 'create_inventory_requests', 'review_reports', 'approve_completion'] },
      CALL_CENTER_AGENT: { label: 'Call Center Agent', permissions: ['register_calls', 'create_tickets', 'view_tickets'] },
      MAINTENANCE_ENGINEER: { label: 'Maintenance Engineer', permissions: ['receive_work_orders', 'submit_reports', 'upload_photos', 'update_status'] },
      SUPERVISOR: { label: 'Supervisor', permissions: ['create_issues', 'upload_attachments'] },
    };
  }
}
