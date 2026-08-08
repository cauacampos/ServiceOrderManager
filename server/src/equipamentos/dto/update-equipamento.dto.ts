import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateEquipamentoDto } from './create-equipamento.dto';

export class UpdateEquipamentoDto extends PartialType(
  OmitType(CreateEquipamentoDto, ['clienteId'] as const),
) {}