import type { Pedido } from '../types';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';

interface DetallePedidoModalProps {
  pedido: Pedido | null;
  onClose: () => void;
}

export function DetallePedidoModal({ pedido, onClose }: DetallePedidoModalProps) {
  if (!pedido) return null;

  return (
    <Modal
      open={Boolean(pedido)}
      title={`Detalle del Pedido #${pedido.id}`}
      onClose={onClose}
    >
      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
          <div>
            <p className="text-xs text-slate-500">Estado actual</p>
            <div className="mt-1">
              <BadgeEstado estado={pedido.estado} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Fecha</p>
            <p className="font-medium text-slate-800">
              {new Date(pedido.created_at).toLocaleString('es-AR')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Dirección de entrega</p>
            <p className="mt-0.5 font-medium text-slate-900">
              {pedido.direccion_entrega}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Forma de pago</p>
            <p className="mt-0.5 font-medium text-slate-900">{pedido.forma_pago}</p>
          </div>
        </div>

        {pedido.notas && (
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-500">Notas</p>
            <p className="mt-0.5 text-slate-700">{pedido.notas}</p>
          </div>
        )}

        <div>
          <h4 className="mb-2 font-semibold text-slate-900">Ítems del pedido</h4>
          <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
            {pedido.items.map((item, idx) => (
              <div
                key={item.id ?? `${item.producto_id}-${idx}`}
                className="flex items-center justify-between px-3.5 py-2.5"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.nombre_producto}</p>
                  <p className="text-xs text-slate-500">
                    {item.cantidad} x ${item.precio_unitario.toLocaleString('es-AR')}
                  </p>
                </div>
                <span className="font-semibold text-slate-900">
                  ${item.subtotal.toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
          <span>Total</span>
          <span>${pedido.total.toLocaleString('es-AR')}</span>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
