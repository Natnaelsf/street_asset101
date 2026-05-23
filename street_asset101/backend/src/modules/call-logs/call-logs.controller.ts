import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CallLogsService } from './call-logs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('call-logs')
@UseGuards(JwtAuthGuard)
export class CallLogsController {
  constructor(private callLogsService: CallLogsService) {}

  @Post()
  async create(@Body() dto: { callerName: string; phoneNumber: string; duration?: number; callType?: string; recordingUrl?: string; notes?: string; incidentId?: string }, @CurrentUser('id') userId: string) {
    return this.callLogsService.create(dto, userId);
  }

  @Get()
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @CurrentUser('id') userId?: string) {
    return this.callLogsService.findAll(page || 1, limit || 10);
  }
}
