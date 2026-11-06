import { useState } from 'react';
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido';
import { usePedidos } from '../hooks/usePedidos';
import type { EstadoPedido, Pedido } from '../types';
import { DetallePedidoModal } from '../components/DetallePedidoModal';
import { TablaPedidos } from '../components/TablaPedidos';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Paginacion } from '../../../shared/components/Paginacion';
import { Skeleton } from '../../../shared/components/Skeleton';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';

const LIMIT = 20;

const ESTADOS_FILTRO: Array<{ label: string; value: EstadoPedido | '' }> = [
  { label: 'Todos', value: '' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'En preparación', value: 'EN_PREPARACION' },
  { label: 'Entregados', value: 'ENTREGADO' },
  { label: 'Cancelados', value: 'CANCELADO' },
];

export function AdminPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | ''>('');
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [pedidoACancelar, setPedidoACancelar] = useState<Pedido | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    estado: estadoFiltro || undefined,
  });

  const cambiarEstadoMutation = useCambiarEstadoPedido();

  const handleTransicion = async (id: number, estado: EstadoPedido) => {
    setActionError(null);
    try {
      await cambiarEstadoMutation.mutateAsync({ id, estado });
    } catch (err) {
      setActionError(handleApiError(err));
    }
  };

  const handleConfirmarCancelacion = async () => {
    if (!pedidoACancelar) return;
    await handleTransicion(pedidoACancelar.id, 'CANCELADO');
    setPedidoACancelar(null);
  };

  const pedidos = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Pedidos</h1>
          <p className="text-sm text-slate-500">
            Avanzá o cancelá los pedidos según la máquina de estados
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ESTADOS_FILTRO.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => {
                setEstadoFiltro(f.value);
                setPagina(0);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                estadoFiltro === f.value
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <Skeleton cantidad={5} variant="row" />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : pedidos.length === 0 ? (
        <EstadoVacio
          titulo="No hay pedidos para mostrar"
          descripcion="No se encontraron pedidos con el filtro seleccionado."
        />
      ) : (
        <>
          <TablaPedidos
            pedidos={pedidos}
            isUpdating={cambiarEstadoMutation.isPending}
            onVerDetalle={setPedidoDetalle}
            onCambiarEstado={(id, estado) => void handleTransicion(id, estado)}
            onConfirmarCancelacion={setPedidoACancelar}
          />

          <Paginacion
            pagina={pagina}
            limit={LIMIT}
            total={data?.total ?? 0}
            onPageChange={setPagina}
          />
        </>
      )}

      <DetallePedidoModal
        pedido={pedidoDetalle}
        onClose={() => setPedidoDetalle(null)}
      />

      <Modal
        open={Boolean(pedidoACancelar)}
        title={`Cancelar Pedido #${pedidoACancelar?.id ?? ''}`}
        onClose={() => setPedidoACancelar(null)}
      >
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            ¿Confirmás la cancelación del pedido{' '}
            <strong className="text-slate-900">#{pedidoACancelar?.id}</strong>? El stock
            de todas sus líneas será restituido en la misma transacción.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setPedidoACancelar(null)}>
              Volver
            </Button>
            <Button
              variant="danger"
              disabled={cambiarEstadoMutation.isPending}
              onClick={() => void handleConfirmarCancelacion()}
            >
              {cambiarEstadoMutation.isPending ? 'Cancelando...' : 'Confirmar cancelación'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
