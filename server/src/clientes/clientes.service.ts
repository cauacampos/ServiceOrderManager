import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { CreateAcessoClienteDto } from './dto/create-acesso-cliente.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateClienteDto) {
    return this.prisma.cliente.create({ data: dto });
  }

  findAll() {
    return this.prisma.cliente.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string, user: AuthenticatedUser) {
    if (user.role === Role.CLIENTE && user.clienteId !== id) {
      throw new ForbiddenException('Acesso negado a este cliente');
    }

    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto) {
    await this.garantirExiste(id);
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.garantirExiste(id);
    return this.prisma.cliente.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async criarAcesso(clienteId: string, dto: CreateAcessoClienteDto) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
      include: { usuario: true },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }
    if (cliente.usuario) {
      throw new ConflictException('Este cliente já possui um acesso criado');
    }

    const emailEmUso = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (emailEmUso) {
      throw new ConflictException('E-mail já está em uso');
    }

    const senhaHash = await bcrypt.hash(dto.senha, SALT_ROUNDS);

    return this.prisma.user.create({
      data: {
        nome: cliente.nome,
        email: dto.email,
        senhaHash,
        role: Role.CLIENTE,
        clienteId: cliente.id,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        clienteId: true,
      },
    });
  }

  private async garantirExiste(id: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }
  }
}