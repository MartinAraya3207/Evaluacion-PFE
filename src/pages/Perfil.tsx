import { useAuth } from '../context/AuthContext';

const ROLES_LABEL: Record<string, string> = {
  admin: '👑 Administrador',
  vendedor: '🛒 Vendedor',
  bodeguero: '📦 Bodeguero',
};

export default function Perfil() {
  const { usuario, logout } = useAuth();

  if (!usuario) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mi Perfil</h1>
        <p>Información de tu cuenta en StockPro</p>
      </div>

      <div className="perfil-card">
        <div className="perfil-avatar-section">
          <div className="perfil-avatar-grande">
            {usuario.nombre.charAt(0).toUpperCase()}
            {usuario.apellido.charAt(0).toUpperCase()}
          </div>
          <h2>{usuario.nombre} {usuario.apellido}</h2>
          <span className="badge-rol">{ROLES_LABEL[usuario.rol] ?? usuario.rol}</span>
        </div>

        <div className="perfil-info">
          <div className="info-item">
            <span className="info-label">📧 Email</span>
            <span className="info-value">{usuario.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🆔 ID de usuario</span>
            <span className="info-value info-mono">{usuario.id}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🔑 Rol en el sistema</span>
            <span className="info-value">{ROLES_LABEL[usuario.rol] ?? usuario.rol}</span>
          </div>
        </div>

        <div className="perfil-permisos">
          <h3>Permisos del rol</h3>
          <ul className="permisos-list">
            {usuario.rol === 'admin' && (
              <>
                <li>✅ Gestionar productos (crear, editar, eliminar)</li>
                <li>✅ Ver y registrar ventas</li>
                <li>✅ Administrar usuarios del sistema</li>
                <li>✅ Ver dashboard completo</li>
              </>
            )}
            {usuario.rol === 'vendedor' && (
              <>
                <li>✅ Ver catálogo de productos</li>
                <li>✅ Registrar ventas</li>
                <li>✅ Ver historial de sus ventas</li>
                <li>❌ No puede eliminar productos</li>
              </>
            )}
            {usuario.rol === 'bodeguero' && (
              <>
                <li>✅ Gestionar productos e inventario</li>
                <li>✅ Actualizar stock</li>
                <li>❌ No puede registrar ventas</li>
              </>
            )}
          </ul>
        </div>

        <div className="perfil-acciones">
          <button className="btn-danger" onClick={logout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
