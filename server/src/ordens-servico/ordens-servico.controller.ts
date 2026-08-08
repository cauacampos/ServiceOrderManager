import {
  Body,
  Controller,
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
import { OrdensServicoService } from './ordens-servico.service';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { UpdateOrdemServicoDto } from './dto/update-ordem-servico.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ordens-servico')
export class OrdensServicoController {
  constructor(private ordensServicoService: OrdensServicoService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ATENDENTE)
  create(@Body() dto: CreateOrdemServicoDto) {
    return this.ordensServicoService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.ATENDENTE, Role.TECNICO, Role.CLIENTE)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.ordensServicoService.findAll(user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ATENDENTE, Role.TECNICO, Role.CLIENTE)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ordensServicoService.findOne(id, user);
  }

  // Linha do tempo de status — é essa rota que a tela de acompanhamento
  // do cliente consome.
  @Get(':id/historico')
  @Roles(Role.ADMIN, Role.ATENDENTE, Role.TECNICO, Role.CLIENTE)
  findHistorico(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.ordensServicoService.findHistorico(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ATENDENTE, Role.TECNICO)
  update(@Param('id') id: string, @Body() dto: UpdateOrdemServicoDto) {
    return this.ordensServicoService.update(id, dto);
  }

  // Cliente NUNCA muda status — só ADMIN/ATENDENTE/TECNICO
  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.ATENDENTE, Role.TECNICO)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.ordensServicoService.updateStatus(id, dto);
  }
}