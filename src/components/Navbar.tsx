import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTema } from '../context/ThemeContext';

const ROLES_LABEL: Record<string, string> = {
  admin: 'Administrador',
  vendedor: 'Vendedor',
  bodeguero: 'Bodeguero',
};

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const { oscuro, toggleTema } = useTema();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">📦</span>
        <span className="brand-name">StockPro</span>
      </div>

      <div className="navbar-links">
        <Link to="/dashboard" className={isActive('/dashboard') ? 'nav-link active' : 'nav-link'}>
          🏠 Dashboard
        </Link>
        <Link to="/productos" className={isActive('/productos') ? 'nav-link active' : 'nav-link'}>
          📦 Productos
        </Link>
        <Link to="/ventas" className={isActive('/ventas') ? 'nav-link active' : 'nav-link'}>
          🧾 Ventas
        </Link>
        {usuario?.rol === 'admin' && (
          <Link to="/usuarios" className={isActive('/usuarios') ? 'nav-link active' : 'nav-link'}>
            👥 Usuarios
          </Link>
        )}
      </div>

      <div className="navbar-user">
        {/* Botón de modo oscuro/claro */}
        <button
          className="btn-tema"
          onClick={toggleTema}
          title={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {oscuro ? '☀️' : '🌙'}
        </button>

        <Link to="/perfil" className="user-info">
          <div className="user-avatar">
            {usuario?.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{usuario?.nombre} {usuario?.apellido}</span>
            <span className="user-role">{ROLES_LABEL[usuario?.rol ?? ''] ?? usuario?.rol}</span>
          </div>
        </Link>
        <button className="btn-logout" onClick={logout} title="Cerrar sesión">
          🚪 Salir
        </button>
      </div>
    </nav>
  );
}
