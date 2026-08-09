import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TipoMovimentacao } from '@prisma/client';

export class CreateMovimentacaoDto {
  @IsUUID()
  pecaId!: string;

  @IsEnum(TipoMovimentacao)
  tipo!: TipoMovimentacao;

  @IsInt()
  @Min(1)
  quantidade!: number;

  @IsOptional()
  @IsString()
  motivo?: string;

  // Preenchido quando a saída é o uso da peça numa OS específica
  @IsOptional()
  @IsUUID()
  ordemServicoId?: string;
}