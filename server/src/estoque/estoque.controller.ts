import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';
import { EstoqueService } from './estoque.service';
import { CreatePecaDto } from './dto/create-peca.dto';
import { UpdatePecaDto } from './dto/update-peca.dto';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';

// Módulo de estoque é assunto interno — CLIENTE nunca acessa nenhuma rota aqui
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.ATENDENTE, Role.TECNICO)
@Controller('estoque/pecas')
export class EstoqueController {
  constructor(private estoqueService: EstoqueService) {}

  @Post()
  createPeca(@Body() dto: CreatePecaDto) {
    return this.estoqueService.createPeca(dto);
  }

  @Get()
  findAllPecas() {
    return this.estoqueService.findAllPecas();
  }

  @Get('alertas/estoque-baixo')
  findPecasEstoqueBaixo() {
    return this.estoqueService.findPecasEstoqueBaixo();
  }

  @Get(':id')
  findOnePeca(@Param('id') id: string) {
    return this.estoqueService.findOnePeca(id);
  }

  @Patch(':id')
  updatePeca(@Param('id') id: string, @Body() dto: UpdatePecaDto) {
    return this.estoqueService.updatePeca(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  removePeca(@Param('id') id: string) {
    return this.estoqueService.removePeca(id);
  }

  @Get(':id/movimentacoes')
  findMovimentacoes(@Param('id') id: string) {
    return this.estoqueService.findMovimentacoesByPeca(id);
  }

  @Post('movimentacoes')
  registrarMovimentacao(
    @Body() dto: CreateMovimentacaoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.estoqueService.registrarMovimentacao(dto, user);
  }
}