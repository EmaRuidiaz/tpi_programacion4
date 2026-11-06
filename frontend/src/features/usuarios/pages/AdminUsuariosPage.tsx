import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  useActivarUsuario,
  useDesactivarUsuario,
  useUsuarios,
} from '../hooks/useUsuarios';
import type { UserPublic } from '../types';
import { useAuthStore } from '../../../store/authStore';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Skeleton } from '../../../shared/components/Skeleton';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';

const columnHelper = createColumnHelper<UserPublic>();

export function AdminUsuariosPage() {
  const usuarioSesion = useAuthStore((s) => s.usuario);
  const { data: usuarios = [], isLoading, isError, error, refetch } = useUsuarios();
  const activarMutation = useActivarUsuario();
  const desactivarMutation = useDesactivarUsuario();
  const [globalFilter, setGlobalFilter] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const handleActivar = async (id: number) => {
    setActionError(null);
    try {
      await activarMutation.mutateAsync(id);
    } catch (err) {
      setActionError(handleApiError(err));
    }
  };

  const handleDesactivar = async (id: number) => {
    setActionError(null);
    try {
      await desactivarMutation.mutateAsync(id);
    } catch (err) {
      setActionError(handleApiError(err));
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'Usuario',
        cell: (info) => (
          <span className="font-semibold text-slate-900">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('full_name', {
        header: 'Nombre',
        cell: (info) => <span className="text-slate-700">{info.getValue()}</span>,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
      }),
      columnHelper.accessor('role', {
        header: 'Rol',
        cell: (info) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              info.getValue() === 'admin'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('disabled', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
              Desactivado
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Activo
            </span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const user = row.original;
          const esUsuarioActual = usuarioSesion?.id === user.id;

          return (
            <div className="flex items-center gap-2">
              {user.disabled ? (
                <Button
                  variant="success"
                  size="sm"
                  disabled={activarMutation.isPending}
                  onClick={() => void handleActivar(user.id)}
                >
                  Activar
                </Button>
              ) : !esUsuarioActual ? (
                <Button
                  variant="danger"
                  size="sm"
                  disabled={desactivarMutation.isPending}
                  onClick={() => void handleDesactivar(user.id)}
                >
                  Desactivar
                </Button>
              ) : (
                <span className="text-xs italic text-slate-400">Sesión actual</span>
              )}
            </div>
          );
        },
      }),
    ],
    [usuarioSesion?.id, activarMutation.isPending, desactivarMutation.isPending]
  );

  const table = useReactTable({
    data: usuarios,
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
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-sm text-slate-500">
            Administrá el estado de las cuentas registradas en el sistema
          </p>
        </div>
        <input
          type="search"
          placeholder="Buscar por usuario, nombre o email..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 sm:w-72"
        />
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
      ) : usuarios.length === 0 ? (
        <EstadoVacio titulo="No hay usuarios registrados" />
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
    </div>
  );
}
