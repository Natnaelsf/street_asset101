import { IsOptional, IsEnum, IsString } from "class-validator";
import { Type } from "class-transformer";
import { IncidentStatus, Priority, IncidentCategory } from "@prisma/client";

export class QueryIncidentDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsEnum(IncidentCategory)
  incidentType?: IncidentCategory;

  @IsOptional()
  @IsString()
  search?: string;
}
