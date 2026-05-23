import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PolesService } from './poles.service';
import { CreatePoleDto } from './dto/create-pole.dto';
import { UpdatePoleDto } from './dto/update-pole.dto';
import { QueryPoleDto } from './dto/query-pole.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('poles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PolesController {
  constructor(private polesService: PolesService) {}

  @Post()
  @Roles(UserRole.OPERATION_MAINTENANCE_DDG, UserRole.OPERATION_MAINTENANCE_DIRECTOR, UserRole.LICENSE_PERMIT_DDG, UserRole.ICT_DIRECTOR)
  async create(@Body() dto: CreatePoleDto, @CurrentUser('id') userId: string) {
    return this.polesService.create(dto, userId);
  }

  @Get()
  @Roles(UserRole.OPERATION_MAINTENANCE_DDG, UserRole.OPERATION_MAINTENANCE_DIRECTOR, UserRole.LICENSE_PERMIT_DDG, UserRole.ICT_DIRECTOR, UserRole.DIRECTOR_GENERAL, UserRole.ENGINEERING_REGULATORY_DDG)
  async findAll(@Query() query: QueryPoleDto) {
    return this.polesService.findAll(query);
  }

  @Get('gis')
  async getGisData(@Query('regionId') regionId?: string, @Query('subcityId') subcityId?: string, @Query('status') status?: string) {
    return this.polesService.getGisData({ regionId, subcityId, status });
  }

  @Get('import-history')
  @Roles(UserRole.OPERATION_MAINTENANCE_DDG, UserRole.ICT_DIRECTOR)
  async getImportHistory(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.polesService.getImportHistory(page || 1, limit || 10);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.polesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.OPERATION_MAINTENANCE_DDG, UserRole.OPERATION_MAINTENANCE_DIRECTOR, UserRole.LICENSE_PERMIT_DDG, UserRole.ICT_DIRECTOR)
  async update(@Param('id') id: string, @Body() dto: UpdatePoleDto, @CurrentUser('id') userId: string) {
    return this.polesService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(UserRole.OPERATION_MAINTENANCE_DDG, UserRole.LICENSE_PERMIT_DDG, UserRole.ICT_DIRECTOR)
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.polesService.remove(id, userId);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(UserRole.OPERATION_MAINTENANCE_DDG, UserRole.ICT_DIRECTOR)
  async bulkImport(@UploadedFile() file: Express.Multer.File, @CurrentUser('id') userId: string) {
    return this.polesService.bulkImport(file, userId);
  }
}
