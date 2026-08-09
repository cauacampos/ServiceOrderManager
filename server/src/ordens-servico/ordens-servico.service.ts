import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, StatusOS } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { scopeByCliente } from '../common/scope-by-cliente.util';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { UpdateOrdemServicoDto } from './dto/update-ordem-servico.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { transicaoEhValida } from './status-transitions';

@Injectable()
export class OrdensServicoService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateOrdemServicoDto) {
    return this.prisma.$transaction(async (tx) => {
      const os = await tx.ordemServico.create({ data: dto });

      await tx.historicoStatusOS.create({
        data: {
          ordemServicoId: os.id,
          statusAnterior: null,
          statusNovo: StatusOS.ABERTA,
          observacao: 'OS criada',
        },
      });

      return os;
    });
  }

  findAll(user: AuthenticatedUser) {
    return this.prisma.ordemServico.findMany({
      where: scopeByCliente(user),
      include: {
        cliente: { select: { id: true, nome: true } },
        equipamento: { select: { id: true, tipo: true, modelo: true } },
        tecnico: { select: { id: true, nome: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const os = await this.prisma.ordemServico.findUnique({
      where: { id },
      include: {
        cliente: { select: { id: true, nome: true } },
        equipamento: true,
        tecnico: { select: { id: true, nome: true } },
        itens: true,
      },
    });

    if (!os) {
      throw new NotFoundException('Ordem de serviço não encontrada');
    }

    if (user.role === Role.CLIENTE && os.clienteId !== user.clienteId) {
      throw new ForbiddenException('Acesso negado a esta ordem de serviço');
    }

    return os;
  }

  async update(id: string, dto: UpdateOrdemServicoDto) {
    await this.buscarOuFalhar(id);
    return this.prisma.ordemServico.update({ where: { id }, data: dto });
  }

  // Muda o status respeitando o mapa de transições válidas e grava o
  // histórico — tudo dentro de uma transação pra nunca ficar inconsistente.
  async updateStatus(id: string, dto: UpdateStatusDto) {
    const os = await this.buscarOuFalhar(id);

    if (!transicaoEhValida(os.status, dto.status)) {
      throw new BadRequestException(
        `Não é possível mudar de "${os.status}" para "${dto.status}"`,
      );
    }

    // Preenche datas de marco automaticamente conforme o novo status
    const datasAutomaticas: Record<string, Date> = {};
    if (dto.status === StatusOS.CONCLUIDA) {
      datasAutomaticas.dataConclusao = new Date();
    }
    if (dto.status === StatusOS.ENTREGUE) {
      datasAutomaticas.dataEntrega = new Date();
    }

    return this.prisma.$transaction(async (tx) => {
      const osAtualizada = await tx.ordemServico.update({
        where: { id },
        data: {
          status: dto.status,
          ...datasAutomaticas,
        },
      });

      await tx.historicoStatusOS.create({
        data: {
          ordemServicoId: id,
          statusAnterior: os.status,
          statusNovo: dto.status,
          observacao: dto.observacao,
        },
      });

      return osAtualizada;
    });
  }

  // Retorna a linha do tempo completa de status de uma OS, do mais antigo
  // pro mais recente — é o que alimenta a tela de acompanhamento do cliente.
  async findHistorico(ordemServicoId: string, user: AuthenticatedUser) {
    // Reaproveita a checagem de propriedade do findOne
    await this.findOne(ordemServicoId, user);

    return this.prisma.historicoStatusOS.findMany({
      where: { ordemServicoId },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async buscarOuFalhar(id: string) {
    const os = await this.prisma.ordemServico.findUnique({ where: { id } });
    if (!os) {
      throw new NotFoundException('Ordem de serviço não encontrada');
    }
    return os;
  }
}