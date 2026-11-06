import type { ReactNode } from 'react';

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-2xl">
        🍽️
      </div>
      <h3 className="text-base font-semibold text-slate-900">{titulo}</h3>
      {descripcion && (
        <p className="mt-1 max-w-md text-sm text-slate-500">{descripcion}</p>
      )}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}
