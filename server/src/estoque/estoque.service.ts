import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TipoMovimentacao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { CreatePecaDto } from './dto/create-peca.dto';
import { UpdatePecaDto } from './dto/update-peca.dto';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';

@Injectable()
export class EstoqueService {
  constructor(private prisma: PrismaService) {}

  async createPeca(dto: CreatePecaDto) {
    const skuEmUso = await this.prisma.peca.findUnique({
      where: { sku: dto.sku },
    });
    if (skuEmUso) {
      throw new ConflictException('SKU já cadastrado');
    }
    return this.prisma.peca.create({ data: dto });
  }

  findAllPecas() {
    return this.prisma.peca.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }

  // Peças cujo estoque atual está no ou abaixo do mínimo — pra tela de alertas
  // não recebe nenhum input do usuário (não há risco de SQL injection aqui)
  findPecasEstoqueBaixo() {
    return this.prisma.$queryRaw`
      SELECT * FROM pecas
      WHERE ativo = true AND "quantidadeAtual" <= "quantidadeMinima"
      ORDER BY "quantidadeAtual" ASC
    `;
  }

  async findOnePeca(id: string) {
    const peca = await this.prisma.peca.findUnique({ where: { id } });
    if (!peca) {
      throw new NotFoundException('Peça não encontrada');
    }
    return peca;
  }

  async updatePeca(id: string, dto: UpdatePecaDto) {
    await this.findOnePeca(id);
    return this.prisma.peca.update({ where: { id }, data: dto });
  }

  async removePeca(id: string) {
    await this.findOnePeca(id);
    return this.prisma.peca.update({ where: { id }, data: { ativo: false } });
  }

  // Registra a movimentação E atualiza a quantidade da peça numa única
  // transação — nunca fica um sem o outro.
  async registrarMovimentacao(dto: CreateMovimentacaoDto, user: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      const peca = await tx.peca.findUnique({ where: { id: dto.pecaId } });
      if (!peca) {
        throw new NotFoundException('Peça não encontrada');
      }

      if (
        dto.tipo === TipoMovimentacao.SAIDA &&
        peca.quantidadeAtual < dto.quantidade
      ) {
        throw new BadRequestException(
          `Estoque insuficiente: disponível ${peca.quantidadeAtual}, solicitado ${dto.quantidade}`,
        );
      }

      const delta =
        dto.tipo === TipoMovimentacao.ENTRADA
          ? dto.quantidade
          : -dto.quantidade;

      const [movimentacao] = await Promise.all([
        tx.movimentacaoEstoque.create({
          data: {
            pecaId: dto.pecaId,
            tipo: dto.tipo,
            quantidade: dto.quantidade,
            motivo: dto.motivo,
            ordemServicoId: dto.ordemServicoId,
            usuarioId: user.id,
          },
        }),
        tx.peca.update({
          where: { id: dto.pecaId },
          data: { quantidadeAtual: { increment: delta } },
        }),
      ]);

      return movimentacao;
    });
  }

  async findMovimentacoesByPeca(pecaId: string) {
    await this.findOnePeca(pecaId);
    return this.prisma.movimentacaoEstoque.findMany({
      where: { pecaId },
      include: { usuario: { select: { id: true, nome: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}