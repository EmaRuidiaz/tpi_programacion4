import { useState } from 'react';
import { useCartStore } from '../../../store/cartStore';
import { Button } from '../../../shared/ui/Button';
import type { Producto } from '../types';

interface ProductoCardProps {
  producto: Producto;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar);
  const itemEnCarrito = useCartStore((s) =>
    s.items.find((i) => i.producto_id === producto.id)
  );
  const [agregadoReciente, setAgregadoReciente] = useState(false);

  const cantidadEnCarrito = itemEnCarrito?.cantidad ?? 0;
  const sinStock = !producto.disponible || producto.stock <= 0;
  const topeAlcanzado = cantidadEnCarrito >= producto.stock;

  const handleAgregar = () => {
    agregar(producto, 1);
    setAgregadoReciente(true);
    setTimeout(() => {
      setAgregadoReciente(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={producto.imagen_url || FALLBACK_IMAGE}
          alt={producto.nombre}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        {producto.categoria && (
          <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs">
            {producto.categoria.nombre}
          </span>
        )}
        {sinStock && (
          <span className="absolute top-3 right-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
            Agotado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-slate-900">{producto.nombre}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">
          {producto.descripcion || 'Preparado en el momento con ingredientes frescos.'}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <span className="text-lg font-extrabold text-slate-900">
              ${producto.precio_base.toLocaleString('es-AR')}
            </span>
            <p className="text-xs text-slate-500">
              Stock: {producto.stock} u.
              {cantidadEnCarrito > 0 && ` (${cantidadEnCarrito} en carrito)`}
            </p>
          </div>

          <Button
            variant={agregadoReciente ? 'success' : 'primary'}
            size="sm"
            disabled={sinStock || topeAlcanzado}
            onClick={handleAgregar}
          >
            {sinStock
              ? 'No disponible'
              : topeAlcanzado
                ? 'Stock máx.'
                : agregadoReciente
                  ? '¡Agregado! ✓'
                  : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </div>
  );
}
