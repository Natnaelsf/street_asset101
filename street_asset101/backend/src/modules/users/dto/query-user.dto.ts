import { IsOptional, IsString, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { UserRole, RegionName } from "@prisma/client";

export class QueryUserDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RegionName)
  region?: RegionName;
}
