import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { WorkOrderType, Priority } from '@prisma/client';

export class CreateWorkOrderDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WorkOrderType)
  type?: WorkOrderType;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  incidentId?: string;

  @IsOptional()
  @IsString()
  poleId?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  regionId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
