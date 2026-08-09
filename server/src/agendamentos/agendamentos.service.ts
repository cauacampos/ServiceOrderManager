import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { scopeByCliente } from '../common/scope-by-cliente.util';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { UpdateStatusAgendamentoDto } from './dto/update-status-agendamento.dto';

const DURACAO_PADRAO_MINUTOS = 60;

@Injectable()
export class AgendamentosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAgendamentoDto) {
    const duracao = dto.duracaoMinutos ?? DURACAO_PADRAO_MINUTOS;
    const inicio = new Date(dto.dataHora);

    if (dto.tecnicoId) {
      await this.garantirSemConflito(dto.tecnicoId, inicio, duracao);
    }

    return this.prisma.agendamento.create({
      data: { ...dto, dataHora: inicio, duracaoMinutos: duracao },
    });
  }

  findAll(user: AuthenticatedUser) {
    return this.prisma.agendamento.findMany({
      where: scopeByCliente(user),
      include: {
        cliente: { select: { id: true, nome: true } },
        tecnico: { select: { id: true, nome: true } },
      },
      orderBy: { dataHora: 'asc' },
    });
  }

  // Agenda do próprio técnico logado
  findMinhaAgenda(user: AuthenticatedUser) {
    return this.prisma.agendamento.findMany({
      where: {
        tecnicoId: user.id,
        status: { not: StatusAgendamento.CANCELADO },
      },
      include: { cliente: { select: { id: true, nome: true } } },
      orderBy: { dataHora: 'asc' },
    });
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const agendamento = await this.prisma.agendamento.findUnique({
      where: { id },
      include: {
        cliente: { select: { id: true, nome: true } },
        tecnico: { select: { id: true, nome: true } },
      },
    });

    if (!agendamento) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (
      user.role === Role.CLIENTE &&
      agendamento.clienteId !== user.clienteId
    ) {
      throw new ForbiddenException('Acesso negado a este agendamento');
    }

    return agendamento;
  }

  async update(id: string, dto: UpdateAgendamentoDto) {
    const atual = await this.buscarOuFalhar(id);

    const tecnicoId = dto.tecnicoId ?? atual.tecnicoId;
    const inicio = dto.dataHora ? new Date(dto.dataHora) : atual.dataHora;
    const duracao = dto.duracaoMinutos ?? atual.duracaoMinutos;

    if (tecnicoId && (dto.dataHora || dto.duracaoMinutos || dto.tecnicoId)) {
      await this.garantirSemConflito(tecnicoId, inicio, duracao, id);
    }

    return this.prisma.agendamento.update({
      where: { id },
      data: { ...dto, dataHora: dto.dataHora ? inicio : undefined },
    });
  }

  async updateStatus(id: string, dto: UpdateStatusAgendamentoDto) {
    await this.buscarOuFalhar(id);
    return this.prisma.agendamento.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  // Verifica se o técnico já tem outro agendamento (não cancelado) cujo
  // intervalo de tempo colide com o novo. `ignorarId` é usado no update,
  // pra não comparar o agendamento consigo mesmo.
  private async garantirSemConflito(
    tecnicoId: string,
    inicio: Date,
    duracaoMinutos: number,
    ignorarId?: string,
  ) {
    const fim = new Date(inicio.getTime() + duracaoMinutos * 60_000);

    const conflitos = await this.prisma.agendamento.findMany({
      where: {
        tecnicoId,
        status: { not: StatusAgendamento.CANCELADO },
        id: ignorarId ? { not: ignorarId } : undefined,
      },
      select: { id: true, dataHora: true, duracaoMinutos: true },
    });

    const temColisao = conflitos.some((c) => {
      const cInicio = c.dataHora;
      const cFim = new Date(cInicio.getTime() + c.duracaoMinutos * 60_000);
      return inicio < cFim && fim > cInicio; // sobreposição de intervalos
    });

    if (temColisao) {
      throw new BadRequestException(
        'Este técnico já possui um agendamento nesse horário',
      );
    }
  }

  private async buscarOuFalhar(id: string) {
    const agendamento = await this.prisma.agendamento.findUnique({
      where: { id },
    });
    if (!agendamento) {
      throw new NotFoundException('Agendamento não encontrado');
    }
    return agendamento;
  }
}