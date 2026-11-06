import { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { EstadoPedido, Pedido } from '../types';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';

const columnHelper = createColumnHelper<Pedido>();

interface TablaPedidosProps {
  pedidos: Pedido[];
  isUpdating: boolean;
  onVerDetalle: (pedido: Pedido) => void;
  onCambiarEstado: (id: number, estado: EstadoPedido) => void;
  onConfirmarCancelacion: (pedido: Pedido) => void;
}

export function TablaPedidos({
  pedidos,
  isUpdating,
  onVerDetalle,
  onCambiarEstado,
  onConfirmarCancelacion,
}: TablaPedidosProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => (
          <span className="font-mono text-xs font-bold">#{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('usuario_id', {
        header: 'Cliente',
        cell: (info) => (
          <span className="text-slate-700">Usuario #{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('direccion_entrega', {
        header: 'Entrega / Pago',
        cell: (info) => (
          <div>
            <p className="font-medium text-slate-900">{info.getValue()}</p>
            <p className="text-xs text-slate-500">{info.row.original.forma_pago}</p>
          </div>
        ),
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => (
          <span className="font-bold text-slate-900">
            ${info.getValue().toLocaleString('es-AR')}
          </span>
        ),
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => <BadgeEstado estado={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const ped = row.original;
          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVerDetalle(ped)}
              >
                Detalle
              </Button>
              {ped.estado === 'PENDIENTE' && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => onCambiarEstado(ped.id, 'EN_PREPARACION')}
                  >
                    Preparar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => onConfirmarCancelacion(ped)}
                  >
                    Cancelar
                  </Button>
                </>
              )}
              {ped.estado === 'EN_PREPARACION' && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => onCambiarEstado(ped.id, 'ENTREGADO')}
                  >
                    Entregar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => onConfirmarCancelacion(ped)}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          );
        },
      }),
    ],
    [isUpdating, onVerDetalle, onCambiarEstado, onConfirmarCancelacion]
  );

  const table = useReactTable({
    data: pedidos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
    </Card>
  );
}
