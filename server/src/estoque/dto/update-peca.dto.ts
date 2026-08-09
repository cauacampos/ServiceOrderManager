import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePecaDto } from './create-peca.dto';

export class UpdatePecaDto extends PartialType(
  OmitType(CreatePecaDto, ['quantidadeAtual'] as const),
) {}