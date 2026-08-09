import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { TipoAgendamento } from '@prisma/client';

export class CreateAgendamentoDto {
  @IsUUID()
  clienteId!: string;

  @IsOptional()
  @IsUUID()
  tecnicoId?: string;

  @IsOptional()
  @IsUUID()
  ordemServicoId?: string;

  @IsEnum(TipoAgendamento)
  tipo!: TipoAgendamento;

  // ISO 8601, ex: "2026-08-15T14:30:00.000Z"
  @IsDateString()
  dataHora!: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  duracaoMinutos?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}