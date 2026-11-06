import { Link } from 'react-router-dom';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';

export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <Card className="p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
          🔒
        </div>
        <h1 className="text-xl font-bold text-slate-900">Acceso no autorizado</h1>
        <p className="mt-2 text-sm text-slate-600">
          No contás con los permisos necesarios para acceder a esta sección.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button variant="primary">Volver al inicio</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
