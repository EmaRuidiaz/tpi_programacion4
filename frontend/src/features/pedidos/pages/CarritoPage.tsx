import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../../store/cartStore';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';

export function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Tu Carrito</h1>
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Agregá productos desde el catálogo para armar tu pedido."
          accion={
            <Link to="/">
              <Button variant="primary">Ir al catálogo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const montoTotal = total();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tu Carrito</h1>
          <p className="text-sm text-slate-500">
            Revisá las cantidades antes de confirmar tu pedido
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => {
            const subtotal = item.precio_unitario * item.cantidad;
            return (
              <Card
                key={item.producto_id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div className="flex items-center gap-4">
                  {item.imagen_url && (
                    <img
                      src={item.imagen_url}
                      alt={item.nombre}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.nombre}</h3>
                    <p className="text-xs text-slate-500">
                      Precio unitario: ${item.precio_unitario.toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-lg border border-slate-300">
                    <button
                      type="button"
                      onClick={() =>
                        cambiarCantidad(item.producto_id, item.cantidad - 1)
                      }
                      className="px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm font-semibold text-slate-900">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      disabled={item.cantidad >= item.stock}
                      onClick={() =>
                        cambiarCantidad(item.producto_id, item.cantidad + 1)
                      }
                      className="px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="w-24 text-right font-bold text-slate-900">
                    ${subtotal.toLocaleString('es-AR')}
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => quitar(item.producto_id)}
                  >
                    Quitar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div>
          <Card className="sticky top-24 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Resumen de compra</h2>
            <div className="space-y-2 border-b border-slate-200 pb-4 text-sm">
              {items.map((item) => (
                <div
                  key={item.producto_id}
                  className="flex justify-between text-slate-600"
                >
                  <span>
                    {item.cantidad}x {item.nombre}
                  </span>
                  <span>
                    ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-lg font-extrabold text-slate-900">
              <span>Total</span>
              <span>${montoTotal.toLocaleString('es-AR')}</span>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate('/checkout')}
            >
              Continuar al checkout
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
