import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { QueryWorkOrderDto } from './dto/query-work-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('work-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkOrdersController {
  constructor(private workOrdersService: WorkOrdersService) {}

  @Post()
  async create(@Body() dto: CreateWorkOrderDto, @CurrentUser('id') userId: string) {
    return this.workOrdersService.create(dto, userId);
  }

  @Get()
  async findAll(@Query() query: QueryWorkOrderDto) {
    return this.workOrdersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workOrdersService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.workOrdersService.update(id, dto);
  }

  @Post(':id/comments')
  async addComment(@Param('id') id: string, @Body('content') content: string, @CurrentUser('id') userId: string) {
    return this.workOrdersService.addComment(id, content, userId);
  }
}
