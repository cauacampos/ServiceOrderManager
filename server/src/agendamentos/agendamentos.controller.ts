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
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { UpdateStatusAgendamentoDto } from './dto/update-status-agendamento.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('agendamentos')
export class AgendamentosController {
  constructor(private agendamentosService: AgendamentosService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ATENDENTE)
  create(@Body() dto: CreateAgendamentoDto) {
    return this.agendamentosService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.ATENDENTE, Role.TECNICO, Role.CLIENTE)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.agendamentosService.findAll(user);
  }

  @Get('minha-agenda')
  @Roles(Role.TECNICO)
  findMinhaAgenda(@CurrentUser() user: AuthenticatedUser) {
    return this.agendamentosService.findMinhaAgenda(user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ATENDENTE, Role.TECNICO, Role.CLIENTE)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.agendamentosService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ATENDENTE)
  update(@Param('id') id: string, @Body() dto: UpdateAgendamentoDto) {
    return this.agendamentosService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.ATENDENTE, Role.TECNICO)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusAgendamentoDto,
  ) {
    return this.agendamentosService.updateStatus(id, dto);
  }
}