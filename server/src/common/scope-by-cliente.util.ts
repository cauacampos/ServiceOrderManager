import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

export function scopeByCliente(user: AuthenticatedUser): { clienteId?: string } {
  if (user.role !== Role.CLIENTE) {
    return {};
  }

  if (!user.clienteId) {
    throw new ForbiddenException('Usuário sem cliente vinculado');
  }

  return { clienteId: user.clienteId };
}