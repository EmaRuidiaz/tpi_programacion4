import { useQuery } from '@tanstack/react-query';
import { getPedidos } from '../api/pedidos';
import type { PedidosFiltros } from '../types';

export function usePedidos(filtros: PedidosFiltros = {}) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidos(filtros),
  });
}
