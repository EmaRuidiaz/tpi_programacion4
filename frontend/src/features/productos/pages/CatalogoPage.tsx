import { useState } from 'react';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { useProductos } from '../hooks/useProductos';
import { ProductoCard } from '../components/ProductoCard';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Paginacion } from '../../../shared/components/Paginacion';
import { Skeleton } from '../../../shared/components/Skeleton';
import { Button } from '../../../shared/ui/Button';

const LIMIT = 6;

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0);
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  const { data: categorias = [] } = useCategorias();
  const { data, isLoading, isError, error, refetch } = useProductos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    search: search || undefined,
    categoria_id: categoriaId,
    disponible: soloDisponibles ? true : undefined,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagina(0);
  };

  const handleCategoriaChange = (id: number | undefined) => {
    setCategoriaId(id);
    setPagina(0);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 p-6 text-white shadow-sm sm:p-8">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          Pedí tu comida favorita recién hecha
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-orange-50 sm:text-base">
          Explorá nuestro catálogo, armá tu carrito y recibí tu pedido donde estés.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <input
              type="search"
              placeholder="Buscar por nombre de producto..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={soloDisponibles}
              onChange={(e) => {
                setSoloDisponibles(e.target.checked);
                setPagina(0);
              }}
              className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
            Solo disponibles
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleCategoriaChange(undefined)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              categoriaId === undefined
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoriaChange(cat.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                categoriaId === cat.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton cantidad={LIMIT} variant="card" />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EstadoVacio
          titulo="No se encontraron productos"
          descripcion="Probá cambiando el término de búsqueda o seleccionando otra categoría."
          accion={
            (search || categoriaId !== undefined || soloDisponibles) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setCategoriaId(undefined);
                  setSoloDisponibles(false);
                  setPagina(0);
                }}
              >
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
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
    </div>
  );
}
