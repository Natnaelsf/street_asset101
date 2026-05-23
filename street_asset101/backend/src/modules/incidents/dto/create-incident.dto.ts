import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { IncidentCategory, Priority } from '@prisma/client';

export class CreateIncidentDto {
  @IsString()
  callerName: string;

  @IsString()
  phoneNumber: string;

  @IsEnum(IncidentCategory)
  incidentType: IncidentCategory;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  poleId?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsDateString()
  slaDeadline?: string;
}
