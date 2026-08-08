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
import { EquipamentosService } from './equipamentos.service';
import { CreateEquipamentoDto } from './dto/create-equipamento.dto';
import { UpdateEquipamentoDto } from './dto/update-equipamento.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipamentos')
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ATENDENTE)
  create(@Body() dto: CreateEquipamentoDto) {
    return this.equipamentosService.create(dto);
  }

    @Get()
  @Roles(Role.ADMIN, Role.ATENDENTE, Role.TECNICO, Role.CLIENTE)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.equipamentosService.findAll(user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ATENDENTE, Role.TECNICO, Role.CLIENTE)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.equipamentosService.findOne(id, user);
  }
}