import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('regions')
@UseGuards(JwtAuthGuard)
export class RegionsController {
  constructor(private regionsService: RegionsService) {}

  @Get()
  async findAll() {
    return this.regionsService.findAll();
  }

  @Get('subcities')
  async getSubcities(@Param('regionId') regionId?: string) {
    return this.regionsService.getSubcities(regionId);
  }
}
