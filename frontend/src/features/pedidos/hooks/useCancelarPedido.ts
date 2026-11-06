import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelarPedido } from '../api/pedidos';

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
      void queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] });
    },
  });
}
