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
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias';
import type { Categoria } from '../types';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Skeleton } from '../../../shared/components/Skeleton';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';

const columnHelper = createColumnHelper<Categoria>();

export function AdminCategoriasPage() {
  const { data: categorias = [], isLoading, isError, error, refetch } = useCategorias();
  const crearMutation = useCrearCategoria();
  const actualizarMutation = useActualizarCategoria();
  const eliminarMutation = useEliminarCategoria();

  const [globalFilter, setGlobalFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [categoriaABorrar, setCategoriaABorrar] = useState<Categoria | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: editando?.nombre ?? '',
      descripcion: editando?.descripcion ?? '',
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
            },
          });
        } else {
          await crearMutation.mutateAsync({
            nombre: value.nombre.trim(),
            descripcion: value.descripcion.trim(),
          });
        }
        setModalOpen(false);
        setEditando(null);
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
    setModalOpen(true);
  };

  const abrirEditar = (cat: Categoria) => {
    setEditando(cat);
    setFormError(null);
    form.reset();
    form.setFieldValue('nombre', cat.nombre);
    form.setFieldValue('descripcion', cat.descripcion ?? '');
    setModalOpen(true);
  };

  const handleConfirmarBaja = async () => {
    if (!categoriaABorrar) return;
    setFormError(null);
    try {
      await eliminarMutation.mutateAsync(categoriaABorrar.id);
      setCategoriaABorrar(null);
    } catch (err) {
      setFormError(handleApiError(err));
      setCategoriaABorrar(null);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => <span className="font-mono text-xs">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => <span className="font-semibold text-slate-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        cell: (info) => (
          <span className="text-slate-600">{info.getValue() || 'Sin descripción'}</span>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
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
              onClick={() => setCategoriaABorrar(row.original)}
            >
              Dar de baja
            </Button>
          </div>
        ),
      }),
    ],
    [eliminarMutation.isPending]
  );

  const table = useReactTable({
    data: categorias,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Categorías</h1>
          <p className="text-sm text-slate-500">
            Administrá las categorías activas del catálogo
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Filtrar categorías..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <Button variant="primary" onClick={abrirCrear}>
            + Nueva categoría
          </Button>
        </div>
      </div>

      {formError && !modalOpen && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {isLoading ? (
        <Skeleton cantidad={4} variant="row" />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : categorias.length === 0 ? (
        <EstadoVacio
          titulo="No hay categorías activas"
          descripcion="Creá la primera categoría para organizar los productos."
          accion={
            <Button variant="primary" onClick={abrirCrear}>
              Crear categoría
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
                {table.getPageCount()}
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
        title={editando ? 'Editar categoría' : 'Nueva categoría'}
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
          className="space-y-4"
        >
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) => {
                const len = value.trim().length;
                if (len < 2 || len > 100) {
                  return 'El nombre debe tener entre 2 y 100 caracteres';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                id="cat-nombre"
                label="Nombre"
                placeholder="Ej: Hamburguesas"
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
                id="cat-descripcion"
                label="Descripción"
                placeholder="Descripción breve de la categoría"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
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
        open={Boolean(categoriaABorrar)}
        title="Confirmar baja lógica"
        onClose={() => setCategoriaABorrar(null)}
      >
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            ¿Querés dar de baja la categoría{' '}
            <strong className="text-slate-900">{categoriaABorrar?.nombre}</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setCategoriaABorrar(null)}>
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
