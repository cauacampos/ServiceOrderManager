import { IsEnum } from 'class-validator';
import { StatusAgendamento } from '@prisma/client';

export class UpdateStatusAgendamentoDto {
  @IsEnum(StatusAgendamento)
  status!: StatusAgendamento;
}