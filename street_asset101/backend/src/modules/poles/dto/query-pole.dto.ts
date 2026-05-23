import { IsOptional, IsString, IsEnum, IsNumber, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PoleStatus, MaintenanceStatus } from '@prisma/client';

export class QueryPoleDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PoleStatus)
  status?: PoleStatus;

  @IsOptional()
  @IsString()
  regionId?: string;

  @IsOptional()
  @IsString()
  subcityId?: string;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  maintenanceStatus?: MaintenanceStatus;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
