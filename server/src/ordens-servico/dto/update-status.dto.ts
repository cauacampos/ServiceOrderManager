import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusOS } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(StatusOS)
  status!: StatusOS;

  @IsOptional()
  @IsString()
  observacao?: string;
}