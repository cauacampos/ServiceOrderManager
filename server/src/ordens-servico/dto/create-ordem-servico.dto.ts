import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateOrdemServicoDto {
  @IsUUID()
  clienteId!: string;

  @IsOptional()
  @IsUUID()
  equipamentoId?: string;

  @IsOptional()
  @IsUUID()
  tecnicoId?: string;

  @IsString()
  @MinLength(5)
  defeitoRelatado!: string;

  @IsOptional()
  @IsString()
  observacoesInternas?: string;
}