import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreatePecaDto {
  @IsString()
  @MinLength(1)
  sku!: string;

  @IsString()
  @MinLength(2)
  nome!: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  // Estoque inicial — movimentações futuras passam pelo endpoint de
  // movimentação, não por update direto neste campo.
  @IsOptional()
  @IsInt()
  @Min(0)
  quantidadeAtual?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantidadeMinima?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precoCusto?: number;

  @IsNumber()
  @Min(0)
  precoVenda!: number;
}