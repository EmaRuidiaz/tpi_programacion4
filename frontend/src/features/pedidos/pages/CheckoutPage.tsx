import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCrearPedido } from '../hooks/useCrearPedido';
import { CheckoutForm } from '../components/CheckoutForm';
import type { FormaPago } from '../types';
import { useCartStore } from '../../../store/cartStore';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total);
  const crearPedidoMutation = useCrearPedido();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleConfirmar = async (values: {
    direccion_entrega: string;
    forma_pago: FormaPago;
    notas: string;
  }) => {
    setServerError(null);
    try {
      await crearPedidoMutation.mutateAsync({
        items: items.map((i) => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad,
        })),
        direccion_entrega: values.direccion_entrega.trim(),
        forma_pago: values.forma_pago,
        notas: values.notas.trim() || undefined,
      });
      vaciar();
      navigate('/mis-pedidos');
    } catch (err) {
      setServerError(handleApiError(err));
    }
  };

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Confirmar pedido</h1>
        <EstadoVacio
          titulo="No tenés productos en el carrito"
          descripcion="Agregá al menos un producto antes de realizar el checkout."
          accion={
            <Link to="/">
              <Button variant="primary">Volver al catálogo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Confirmar pedido</h1>
        <p className="text-sm text-slate-500">
          Indicá la dirección de entrega y la forma de pago
        </p>
      </div>

      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <CheckoutForm onSubmit={handleConfirmar} />

        <Card className="space-y-3 md:col-span-2">
          <h3 className="font-bold text-slate-900">Detalle del pedido</h3>
          <div className="divide-y divide-slate-100 text-sm">
            {items.map((item) => (
              <div
                key={item.producto_id}
                className="flex items-center justify-between py-2"
              >
                <span className="text-slate-600">
                  {item.cantidad}x {item.nombre}
                </span>
                <span className="font-medium text-slate-900">
                  ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900">
            <span>Total a pagar</span>
            <span>${total().toLocaleString('es-AR')}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
