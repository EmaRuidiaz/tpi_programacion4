import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const items = useCartStore((s) => s.items);
  const navigate = useNavigate();

  const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-orange-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-white">
              🍔
            </span>
            <span>Food Store</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-4">
            <NavLink to="/" end className={navLinkClass}>
              Catálogo
            </NavLink>
            <NavLink to="/carrito" className={navLinkClass}>
              Carrito
              {cantidadTotal > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">
                  {cantidadTotal}
                </span>
              )}
            </NavLink>
            {usuario && (
              <NavLink to="/mis-pedidos" className={navLinkClass}>
                Mis pedidos
              </NavLink>
            )}
            {usuario?.role === 'admin' && (
              <>
                <span className="text-slate-300">|</span>
                <NavLink to="/admin/resumen" className={navLinkClass}>
                  Resumen
                </NavLink>
                <NavLink to="/admin/categorias" className={navLinkClass}>
                  Categorías
                </NavLink>
                <NavLink to="/admin/productos" className={navLinkClass}>
                  Productos
                </NavLink>
                <NavLink to="/admin/pedidos" className={navLinkClass}>
                  Pedidos
                </NavLink>
                <NavLink to="/admin/usuarios" className={navLinkClass}>
                  Usuarios
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-slate-800">{usuario.full_name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    usuario.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {usuario.role}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
