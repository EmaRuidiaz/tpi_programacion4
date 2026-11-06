import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCancelarPedido } from '../hooks/useCancelarPedido';
import { usePedidos } from '../hooks/usePedidos';
import type { EstadoPedido, Pedido } from '../types';
import { DetallePedidoModal } from '../components/DetallePedidoModal';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Paginacion } from '../../../shared/components/Paginacion';
import { Skeleton } from '../../../shared/components/Skeleton';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Modal } from '../../../shared/ui/Modal';

const LIMIT = 10;

const ESTADOS_FILTRO: Array<{ label: string; value: EstadoPedido | '' }> = [
  { label: 'Todos', value: '' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'En preparación', value: 'EN_PREPARACION' },
  { label: 'Entregados', value: 'ENTREGADO' },
  { label: 'Cancelados', value: 'CANCELADO' },
];

export function MisPedidosPage() {
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
  const cancelarMutation = useCancelarPedido();

  const handleConfirmarCancelacion = async () => {
    if (!pedidoACancelar) return;
    setActionError(null);
    try {
      await cancelarMutation.mutateAsync(pedidoACancelar.id);
      setPedidoACancelar(null);
    } catch (err) {
      setActionError(handleApiError(err));
      setPedidoACancelar(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Pedidos</h1>
          <p className="text-sm text-slate-500">
            Consultá el estado y el detalle de tus pedidos realizados
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
        <Skeleton cantidad={4} variant="row" />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EstadoVacio
          titulo={
            estadoFiltro
              ? 'No tenés pedidos con ese estado'
              : 'Todavía no realizaste ningún pedido'
          }
          descripcion="Recorré nuestro catálogo y hacé tu pedido."
          accion={
            <Link to="/">
              <Button variant="primary">Ver catálogo</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {data.items.map((pedido) => (
              <Card
                key={pedido.id}
                className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      Pedido #{pedido.id}
                    </span>
                    <BadgeEstado estado={pedido.estado} />
                    <span className="text-xs text-slate-500">
                      {new Date(pedido.created_at).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Entrega: <span className="font-medium">{pedido.direccion_entrega}</span>{' '}
                    · Pago: <span className="font-medium">{pedido.forma_pago}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {pedido.items.map((i) => `${i.cantidad}x ${i.nombre_producto}`).join(', ')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-extrabold text-slate-900">
                    ${pedido.total.toLocaleString('es-AR')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPedidoDetalle(pedido)}
                  >
                    Ver detalle
                  </Button>
                  {pedido.estado === 'PENDIENTE' && (
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={cancelarMutation.isPending}
                      onClick={() => setPedidoACancelar(pedido)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Paginacion
            pagina={pagina}
            limit={LIMIT}
            total={data.total}
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
            ¿Estás seguro de que querés cancelar este pedido por{' '}
            <strong className="text-slate-900">
              ${pedidoACancelar?.total.toLocaleString('es-AR')}
            </strong>
            ? Se restituirá automáticamente el stock de los productos.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setPedidoACancelar(null)}
            >
              Volver
            </Button>
            <Button
              variant="danger"
              disabled={cancelarMutation.isPending}
              onClick={() => void handleConfirmarCancelacion()}
            >
              {cancelarMutation.isPending ? 'Cancelando...' : 'Sí, cancelar pedido'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
