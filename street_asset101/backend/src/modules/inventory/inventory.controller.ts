import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post('requests')
  @Roles(UserRole.OPERATION_MAINTENANCE_DIRECTOR, UserRole.NORTH_REGION_DIRECTOR, UserRole.SOUTH_REGION_DIRECTOR, UserRole.WEST_REGION_DIRECTOR, UserRole.EAST_REGION_DIRECTOR)
  async createRequest(@Body() dto: { title: string; description?: string; items: string; workOrderId?: string }, @CurrentUser('id') userId: string) {
    return this.inventoryService.createRequest(dto, userId);
  }

  @Get('requests')
  async findAllRequests(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: string) {
    return this.inventoryService.findAllRequests(page || 1, limit || 10, status);
  }

  @Put('requests/:id/approve')
  @Roles(UserRole.OPERATION_MAINTENANCE_DDG, UserRole.NORTH_REGION_DIRECTOR, UserRole.SOUTH_REGION_DIRECTOR, UserRole.WEST_REGION_DIRECTOR, UserRole.EAST_REGION_DIRECTOR)
  async approveRequest(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: { approved: boolean; notes?: string }) {
    return this.inventoryService.approveRequest(id, userId, dto);
  }

  @Get('items')
  async getItems() {
    return this.inventoryService.getItems();
  }

  @Post('items')
  async createItem(@Body() dto: { name: string; description?: string; quantity: number; unit: string; minQuantity?: number; location?: string }) {
    return this.inventoryService.createItem(dto);
  }

  @Put('items/:id')
  async updateItem(@Param('id') id: string, @Body() dto: { quantity?: number; minQuantity?: number; name?: string }) {
    return this.inventoryService.updateItem(id, dto);
  }

  @Get('low-stock')
  async getLowStockAlerts() {
    return this.inventoryService.getLowStockAlerts();
  }
}
