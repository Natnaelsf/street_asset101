import { IsOptional, IsEnum, IsString } from "class-validator";
import { Type } from "class-transformer";
import { WorkOrderStatus, WorkOrderType, Priority } from "@prisma/client";

export class QueryWorkOrderDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @IsOptional()
  @IsEnum(WorkOrderType)
  type?: WorkOrderType;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  regionId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
