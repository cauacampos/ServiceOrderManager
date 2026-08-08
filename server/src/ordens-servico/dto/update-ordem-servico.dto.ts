import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateOrdemServicoDto {
  @IsOptional()
  @IsUUID()
  equipamentoId?: string;

  @IsOptional()
  @IsUUID()
  tecnicoId?: string;

  @IsOptional()
  @IsString()
  defeitoRelatado?: string;

  @IsOptional()
  @IsString()
  laudoTecnico?: string;

  @IsOptional()
  @IsString()
  observacoesInternas?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorOrcamento?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorTotal?: number;
}