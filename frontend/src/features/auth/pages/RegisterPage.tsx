import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';
import { handleApiError } from '../../../shared/api/handleApiError';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';

export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      navigate('/login');
    },
    onError: (err) => {
      setServerError(handleApiError(err));
    },
  });

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      await mutation.mutateAsync(value);
    },
  });

  return (
    <div className="mx-auto max-w-md py-10">
      <Card className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registrate para realizar tus pedidos en Food Store
          </p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
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
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 3
                  ? 'El usuario debe tener al menos 3 caracteres'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                id="username"
                label="Nombre de usuario"
                placeholder="ej: juanperez"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0]}
              />
            )}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2
                  ? 'El nombre completo es obligatorio'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                id="full_name"
                label="Nombre completo"
                placeholder="Juan Pérez"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0]}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                  ? 'Ingresá un correo electrónico válido'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                id="email"
                type="email"
                label="Correo electrónico"
                placeholder="juan@ejemplo.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0]}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 8
                  ? 'La contraseña debe tener al menos 8 caracteres'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                id="password"
                type="password"
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0]}
              />
            )}
          </form.Field>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Registrarse'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-orange-600 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
