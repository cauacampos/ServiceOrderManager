import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { scopeByCliente } from '../common/scope-by-cliente.util';
import { CreateEquipamentoDto } from './dto/create-equipamento.dto';
import { UpdateEquipamentoDto } from './dto/update-equipamento.dto';

@Injectable()
export class EquipamentosService {
  constructor(private prisma: PrismaService) {}
 
  create(dto: CreateEquipamentoDto) {
    return this.prisma.equipamento.create({ data: dto });
  }
 
  // CLIENTE só vê os próprios equipamentos — staff vê todos
  findAll(user: AuthenticatedUser) {
    return this.prisma.equipamento.findMany({
      where: scopeByCliente(user),
      include: { cliente: { select: { id: true, nome: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
 
  async findOne(id: string, user: AuthenticatedUser) {
    const equipamento = await this.prisma.equipamento.findUnique({
      where: { id },
      include: { cliente: { select: { id: true, nome: true } } },
    });
 
    if (!equipamento) {
      throw new NotFoundException('Equipamento não encontrado');
    }
 
    if (user.role === Role.CLIENTE && equipamento.clienteId !== user.clienteId) {
      throw new ForbiddenException('Acesso negado a este equipamento');
    }
 
    return equipamento;
  }
 
  async update(id: string, dto: UpdateEquipamentoDto) {
    await this.garantirExiste(id);
    return this.prisma.equipamento.update({ where: { id }, data: dto });
  }
 
  async remove(id: string) {
    await this.garantirExiste(id);
 
    const osVinculadas = await this.prisma.ordemServico.count({
      where: { equipamentoId: id },
    });
 
    if (osVinculadas > 0) {
      throw new ConflictException(
        'Este equipamento possui ordens de serviço vinculadas e não pode ser excluído',
      );
    }
 
    return this.prisma.equipamento.delete({ where: { id } });
  }
 
  private async garantirExiste(id: string) {
    const equipamento = await this.prisma.equipamento.findUnique({
      where: { id },
    });
    if (!equipamento) {
      throw new NotFoundException('Equipamento não encontrado');
    }
  }
}