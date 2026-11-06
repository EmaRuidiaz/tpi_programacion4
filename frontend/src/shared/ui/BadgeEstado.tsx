import type { EstadoPedido } from '../../features/pedidos/types';

interface BadgeEstadoProps {
  estado: EstadoPedido;
}

const configEstado: Record<EstadoPedido, { label: string; classes: string }> = {
  PENDIENTE: {
    label: 'Pendiente',
    classes: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  EN_PREPARACION: {
    label: 'En preparación',
    classes: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  ENTREGADO: {
    label: 'Entregado',
    classes: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  CANCELADO: {
    label: 'Cancelado',
    classes: 'bg-red-100 text-red-800 border-red-200',
  },
};

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const cfg = configEstado[estado] ?? {
    label: estado,
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}
