import { useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import {
  useActualizarProducto,
  useActualizarStockProducto,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos';
import type { Producto } from '../types';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Skeleton } from '../../../shared/components/Skeleton';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';

const columnHelper = createColumnHelper<Producto>();

export function AdminProductosPage() {
  const { data, isLoading, isError, error, refetch } = useProductos({
    skip: 0,
    limit: 100,
  });
  const { data: categorias = [] } = useCategorias();

  const crearMutation = useCrearProducto();
  const actualizarMutation = useActualizarProducto();
  const stockMutation = useActualizarStockProducto();
  const eliminarMutation = useEliminarProducto();

  const [globalFilter, setGlobalFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [stockModalProd, setStockModalProd] = useState<Producto | null>(null);
  const [productoABorrar, setProductoABorrar] = useState<Producto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const productos = data?.items ?? [];

  const form = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio_base: 0,
      imagen_url: '',
      stock: 0,
      disponible: true,
      categoria_id: categorias[0]?.id ?? 1,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        if (editando) {
          await actualizarMutation.mutateAsync({
            id: editando.id,
            data: {
              nombre: value.nombre.trim(),
              descripcion: value.descripcion.trim(),
              precio_base: Number(value.precio_base),
              imagen_url: value.imagen_url.trim(),
              stock: Number(value.stock),
              disponible: value.disponible,
              categoria_id: Number(value.categoria_id),
            },
          });
        } else {
          await crearMutation.mutateAsync({
            nombre: value.nombre.trim(),
            descripcion: value.descripcion.trim(),
            precio_base: Number(value.precio_base),
            imagen_url: value.imagen_url.trim(),
            stock: Number(value.stock),
            disponible: value.disponible,
            categoria_id: Number(value.categoria_id),
          });
        }
        setModalOpen(false);
        setEditando(null);
      } catch (err) {
        setFormError(handleApiError(err));
      }
    },
  });

  const stockForm = useForm({
    defaultValues: {
      stock: 0,
      disponible: true,
    },
    onSubmit: async ({ value }) => {
      if (!stockModalProd) return;
      setFormError(null);
      try {
        await stockMutation.mutateAsync({
          id: stockModalProd.id,
          data: {
            stock: Number(value.stock),
            disponible: value.disponible,
          },
        });
        setStockModalProd(null);
      } catch (err) {
        setFormError(handleApiError(err));
      }
    },
  });

  const abrirCrear = () => {
    setEditando(null);
    setFormError(null);
    form.reset();
    form.setFieldValue('nombre', '');
    form.setFieldValue('descripcion', '');
    form.setFieldValue('precio_base', 0);
    form.setFieldValue('imagen_url', '');
    form.setFieldValue('stock', 10);
    form.setFieldValue('disponible', true);
    form.setFieldValue('categoria_id', categorias[0]?.id ?? 1);
    setModalOpen(true);
  };

  const abrirEditar = (prod: Producto) => {
    setEditando(prod);
    setFormError(null);
    form.reset();
    form.setFieldValue('nombre', prod.nombre);
    form.setFieldValue('descripcion', prod.descripcion ?? '');
    form.setFieldValue('precio_base', prod.precio_base);
    form.setFieldValue('imagen_url', prod.imagen_url ?? '');
    form.setFieldValue('stock', prod.stock);
    form.setFieldValue('disponible', prod.disponible);
    form.setFieldValue('categoria_id', prod.categoria_id);
    setModalOpen(true);
  };

  const abrirStockModal = (prod: Producto) => {
    setStockModalProd(prod);
    setFormError(null);
    stockForm.reset();
    stockForm.setFieldValue('stock', prod.stock);
    stockForm.setFieldValue('disponible', prod.disponible);
  };

  const handleConfirmarBaja = async () => {
    if (!productoABorrar) return;
    setFormError(null);
    try {
      await eliminarMutation.mutateAsync(productoABorrar.id);
      setProductoABorrar(null);
    } catch (err) {
      setFormError(handleApiError(err));
      setProductoABorrar(null);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => <span className="font-mono text-xs">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('nombre', {
        header: 'Producto',
        cell: (info) => (
          <div>
            <p className="font-semibold text-slate-900">{info.getValue()}</p>
            <p className="text-xs text-slate-500">
              {info.row.original.categoria?.nombre ?? `Cat #${info.row.original.categoria_id}`}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('precio_base', {
        header: 'Precio',
        cell: (info) => (
          <span className="font-semibold text-slate-900">
            ${info.getValue().toLocaleString('es-AR')}
          </span>
        ),
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => (
          <span
            className={`font-semibold ${
              info.getValue() === 0 ? 'text-red-600' : 'text-slate-800'
            }`}
          >
            {info.getValue()} u.
          </span>
        ),
      }),
      columnHelper.accessor('disponible', {
        header: 'Disponibilidad',
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Disponible
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              Pausado
            </span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => abrirStockModal(row.original)}
            >
              Stock
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => abrirEditar(row.original)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={eliminarMutation.isPending}
              onClick={() => setProductoABorrar(row.original)}
            >
              Baja
            </Button>
          </div>
        ),
      }),
    ],
    [eliminarMutation.isPending, categorias]
  );

  const table = useReactTable({
    data: productos,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 8 },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Productos</h1>
          <p className="text-sm text-slate-500">
            Creá, editá y actualizá el stock y disponibilidad del catálogo
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Filtrar productos en tabla..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <Button variant="primary" onClick={abrirCrear}>
            + Nuevo producto
          </Button>
        </div>
      </div>

      {formError && !modalOpen && !stockModalProd && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {isLoading ? (
        <Skeleton cantidad={5} variant="row" />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : productos.length === 0 ? (
        <EstadoVacio
          titulo="No hay productos activos"
          descripcion="Agregá productos al catálogo para que los clientes puedan pedir."
          accion={
            <Button variant="primary" onClick={abrirCrear}>
              Crear producto
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 font-semibold">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {table.getPageCount() > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <span className="text-xs text-slate-500">
                Página {table.getState().pagination.pageIndex + 1} de{' '}
                {table.getPageCount()} ({table.getFilteredRowModel().rows.length} productos)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Modal
        open={modalOpen}
        title={editando ? 'Editar producto' : 'Nuevo producto'}
        onClose={() => setModalOpen(false)}
      >
        {formError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {formError}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-3.5"
        >
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? 'El nombre es obligatorio' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="prod-nombre"
                label="Nombre"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0]}
              />
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <Input
                id="prod-descripcion"
                label="Descripción"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-3">
            <form.Field
              name="precio_base"
              validators={{
                onChange: ({ value }) =>
                  Number(value) < 0 ? 'El precio debe ser >= 0' : undefined,
              }}
            >
              {(field) => (
                <Input
                  id="prod-precio"
                  type="number"
                  step="0.01"
                  min="0"
                  label="Precio base ($)"
                  value={String(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={field.state.meta.errors[0]}
                />
              )}
            </form.Field>

            <form.Field
              name="stock"
              validators={{
                onChange: ({ value }) =>
                  Number(value) < 0 ? 'El stock debe ser >= 0' : undefined,
              }}
            >
              {(field) => (
                <Input
                  id="prod-stock"
                  type="number"
                  min="0"
                  label="Stock"
                  value={String(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={field.state.meta.errors[0]}
                />
              )}
            </form.Field>
          </div>

          <form.Field name="categoria_id">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Categoría</label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="imagen_url">
            {(field) => (
              <Input
                id="prod-imagen"
                label="URL de imagen"
                placeholder="https://..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                Disponible para la venta
              </label>
            )}
          </form.Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(stockModalProd)}
        title={`Stock y disponibilidad: ${stockModalProd?.nombre ?? ''}`}
        onClose={() => setStockModalProd(null)}
      >
        {formError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {formError}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void stockForm.handleSubmit();
          }}
          className="space-y-4"
        >
          <stockForm.Field
            name="stock"
            validators={{
              onChange: ({ value }) =>
                Number(value) < 0 ? 'El stock debe ser >= 0' : undefined,
            }}
          >
            {(field) => (
              <Input
                id="quick-stock"
                type="number"
                min="0"
                label="Cantidad en stock"
                value={String(field.state.value)}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                error={field.state.meta.errors[0]}
              />
            )}
          </stockForm.Field>

          <stockForm.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                Disponible para la venta
              </label>
            )}
          </stockForm.Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStockModalProd(null)}
            >
              Cancelar
            </Button>
            <stockForm.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? 'Actualizando...' : 'Actualizar'}
                </Button>
              )}
            </stockForm.Subscribe>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(productoABorrar)}
        title="Confirmar baja de producto"
        onClose={() => setProductoABorrar(null)}
      >
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            ¿Querés dar de baja lógica al producto{' '}
            <strong className="text-slate-900">{productoABorrar?.nombre}</strong>? Dejará
            de mostrarse en el catálogo público.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setProductoABorrar(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              disabled={eliminarMutation.isPending}
              onClick={() => void handleConfirmarBaja()}
            >
              {eliminarMutation.isPending ? 'Procesando...' : 'Confirmar baja'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
