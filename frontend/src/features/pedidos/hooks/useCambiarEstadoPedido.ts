import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cambiarEstadoPedido } from '../api/pedidos';
import type { EstadoPedido } from '../types';

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoPedido(id, { estado }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
      void queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] });
    },
  });
}
