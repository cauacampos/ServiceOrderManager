import { StatusOS } from '@prisma/client';

// Define, para cada status, quais são os próximos status válidos.
// Qualquer transição fora desse mapa é rejeitada pelo service.
export const TRANSICOES_VALIDAS: Record<StatusOS, StatusOS[]> = {
  [StatusOS.ABERTA]: [StatusOS.EM_DIAGNOSTICO, StatusOS.CANCELADA],
  [StatusOS.EM_DIAGNOSTICO]: [
    StatusOS.AGUARDANDO_APROVACAO,
    StatusOS.EM_REPARO,
    StatusOS.CANCELADA,
  ],
  [StatusOS.AGUARDANDO_APROVACAO]: [StatusOS.EM_REPARO, StatusOS.CANCELADA],
  [StatusOS.EM_REPARO]: [
    StatusOS.AGUARDANDO_PECA,
    StatusOS.CONCLUIDA,
    StatusOS.CANCELADA,
  ],
  [StatusOS.AGUARDANDO_PECA]: [StatusOS.EM_REPARO, StatusOS.CANCELADA],
  [StatusOS.CONCLUIDA]: [StatusOS.ENTREGUE],
  [StatusOS.ENTREGUE]: [],
  [StatusOS.CANCELADA]: [],
};

export function transicaoEhValida(
  statusAtual: StatusOS,
  statusNovo: StatusOS,
): boolean {
  return TRANSICOES_VALIDAS[statusAtual]?.includes(statusNovo) ?? false;
}