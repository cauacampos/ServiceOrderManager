import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientesModule } from './clientes/clientes.module';
import { EquipamentosModule } from './equipamentos/equipamentos.module';
import { OrdensServicoModule } from './ordens-servico/ordens-servico.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';

@Module({
  imports: [AuthModule, PrismaModule, ClientesModule,
            EquipamentosModule, OrdensServicoModule, AgendamentosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
