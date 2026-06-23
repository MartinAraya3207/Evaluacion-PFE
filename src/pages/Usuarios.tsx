import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

const ROLES_LABEL: Record<string, string> = {
  admin: '👑 Administrador',
  vendedor: '🛒 Vendedor',
  bodeguero: '📦 Bodeguero',
};

export default function Usuarios() {
  const { usuario, usuarios } = useAuth();
  const [lista, setLista] = useState<User[]>([]);

  useEffect(() => {
    const guardados: User[] = JSON.parse(
      localStorage.getItem('stockpro_usuarios') || '[]'
    );
    setLista(guardados);
  }, [usuarios]);

  // Solo admin puede acceder
  if (usuario?.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>👥 Usuarios</h1>
          <p>Gestión de cuentas del sistema</p>
        </div>
      </div>

      <div className="usuarios-grid">
        {lista.map((u) => (
          <div key={u.id} className="usuario-card">
            <div className="usuario-avatar">
              {u.nombre.charAt(0).toUpperCase()}{u.apellido.charAt(0).toUpperCase()}
            </div>
            <div className="usuario-info">
              <strong>{u.nombre} {u.apellido}</strong>
              <span>{u.email}</span>
              <span className="badge-rol-small">{ROLES_LABEL[u.rol] ?? u.rol}</span>
              <span className="usuario-fecha">
                Registrado: {new Date(u.fechaRegistro).toLocaleDateString('es-CL')}
              </span>
            </div>
            {u.id === usuario.id && (
              <span className="badge-yo">Tú</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
