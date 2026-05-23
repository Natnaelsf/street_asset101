import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PoleStatus, MaintenanceStatus } from '@prisma/client';

export class CreatePoleDto {
  @IsString()
  streetLightId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  lampType?: string;

  @IsOptional()
  @IsString()
  poleMaterial?: string;

  @IsOptional()
  @IsString()
  poleCondition?: string;

  @IsOptional()
  @IsEnum(PoleStatus)
  status?: PoleStatus;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  maintenanceStatus?: MaintenanceStatus;

  @IsString()
  regionId: string;

  @IsOptional()
  @IsString()
  subcityId?: string;

  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
