import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { QueryIncidentDto } from './dto/query-incident.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentsController {
  constructor(private incidentsService: IncidentsService) {}

  @Post()
  async create(@Body() dto: CreateIncidentDto, @CurrentUser('id') userId: string) {
    return this.incidentsService.create(dto, userId);
  }

  @Get()
  async findAll(@Query() query: QueryIncidentDto) {
    return this.incidentsService.findAll(query);
  }

  @Get('sla-stats')
  async getSlaStats() {
    return this.incidentsService.getSlaStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateIncidentDto) {
    return this.incidentsService.update(id, dto);
  }
}
