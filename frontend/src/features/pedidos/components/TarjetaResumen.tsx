import { Card } from '../../../shared/ui/Card';

interface TarjetaResumenProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  acento?: 'amber' | 'blue' | 'emerald' | 'red' | 'orange' | 'purple';
}

const clasesAcento: Record<NonNullable<TarjetaResumenProps['acento']>, string> = {
  amber: 'border-l-4 border-l-amber-500',
  blue: 'border-l-4 border-l-blue-500',
  emerald: 'border-l-4 border-l-emerald-500',
  red: 'border-l-4 border-l-red-500',
  orange: 'border-l-4 border-l-orange-500',
  purple: 'border-l-4 border-l-purple-500',
};

export function TarjetaResumen({
  titulo,
  valor,
  subtitulo,
  acento = 'orange',
}: TarjetaResumenProps) {
  return (
    <Card className={`${clasesAcento[acento]} flex flex-col justify-between`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {titulo}
      </p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{valor}</p>
      {subtitulo && <p className="mt-1 text-xs text-slate-500">{subtitulo}</p>}
    </Card>
  );
}
