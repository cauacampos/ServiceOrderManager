import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateEquipamentoDto {
  @IsUUID()
  clienteId!: string;

  @IsString()
  @MinLength(2)
  tipo!: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  numeroSerie?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}