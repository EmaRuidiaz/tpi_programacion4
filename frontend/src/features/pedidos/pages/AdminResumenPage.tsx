import { useResumenPedidos } from '../hooks/useResumenPedidos';
import { TarjetaResumen } from '../components/TarjetaResumen';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { Skeleton } from '../../../shared/components/Skeleton';

export function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resumen del Negocio</h1>
        <p className="text-sm text-slate-500">
          Indicadores generales de pedidos e ingresos de Food Store
        </p>
      </div>

      {isLoading ? (
        <Skeleton cantidad={6} variant="card" />
      ) : isError || !data ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen
            titulo="Pedidos pendientes"
            valor={data.pendientes}
            subtitulo="Esperando confirmación de cocina"
            acento="amber"
          />
          <TarjetaResumen
            titulo="En preparación"
            valor={data.en_preparacion}
            subtitulo="Preparándose actualmente"
            acento="blue"
          />
          <TarjetaResumen
            titulo="Pedidos entregados"
            valor={data.entregados}
            subtitulo="Completados exitosamente"
            acento="emerald"
          />
          <TarjetaResumen
            titulo="Pedidos cancelados"
            valor={data.cancelados}
            subtitulo="Con stock restituido"
            acento="red"
          />
          <TarjetaResumen
            titulo="Pedidos de hoy"
            valor={data.pedidos_hoy}
            subtitulo="Ingresados en la jornada actual"
            acento="purple"
          />
          <TarjetaResumen
            titulo="Ingresos entregados"
            valor={`$${data.ingresos_entregados.toLocaleString('es-AR')}`}
            subtitulo="Suma total de pedidos entregados"
            acento="orange"
          />
        </div>
      )}
    </div>
  );
}
