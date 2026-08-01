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
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { CreateAcessoClienteDto } from './dto/create-acesso-cliente.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private clientesService: ClientesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ATENDENTE)
  create(@Body() dto: CreateClienteDto) {
    return this.clientesService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.ATENDENTE, Role.TECNICO)
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ATENDENTE, Role.TECNICO, Role.CLIENTE)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.clientesService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ATENDENTE)
  update(@Param('id') id: string, @Body() dto: UpdateClienteDto) {
    return this.clientesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.clientesService.remove(id);
  }

  @Post(':id/acesso')
  @Roles(Role.ADMIN, Role.ATENDENTE)
  criarAcesso(
    @Param('id') id: string,
    @Body() dto: CreateAcessoClienteDto,
  ) {
    return this.clientesService.criarAcesso(id, dto);
  }
}