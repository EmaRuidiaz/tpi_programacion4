import { useForm } from '@tanstack/react-form';
import { Link } from 'react-router-dom';
import type { FormaPago } from '../types';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';

interface CheckoutFormValues {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

interface CheckoutFormProps {
  onSubmit: (values: CheckoutFormValues) => Promise<void>;
}

export function CheckoutForm({ onSubmit }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <Card className="md:col-span-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="direccion_entrega"
          validators={{
            onChange: ({ value }) => {
              const len = value.trim().length;
              if (len < 5 || len > 200) {
                return 'La dirección debe tener entre 5 y 200 caracteres';
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <Input
              id="direccion_entrega"
              label="Dirección de entrega"
              placeholder="Ej: Av. Colón 1250, Piso 3 B"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors[0]}
            />
          )}
        </form.Field>

        <form.Field name="forma_pago">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="forma_pago"
                className="text-sm font-medium text-slate-700"
              >
                Forma de pago
              </label>
              <select
                id="forma_pago"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value as FormaPago)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
          )}
        </form.Field>

        <form.Field name="notas">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="notas" className="text-sm font-medium text-slate-700">
                Notas adicionales (opcional)
              </label>
              <textarea
                id="notas"
                rows={3}
                placeholder="Indicaciones para la entrega o preparación..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          )}
        </form.Field>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/carrito">
            <Button type="button" variant="outline">
              Volver al carrito
            </Button>
          </Link>
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Confirmar pedido'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Card>
  );
}
