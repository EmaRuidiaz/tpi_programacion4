import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearPedido } from '../api/pedidos';
import type { PedidoCreate } from '../types';

export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PedidoCreate) => crearPedido(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
      void queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] });
    },
  });
}
