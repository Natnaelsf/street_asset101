import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkOrderDto } from './create-work-order.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

export class UpdateWorkOrderDto extends PartialType(CreateWorkOrderDto) {
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;
}
