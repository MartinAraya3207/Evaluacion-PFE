import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ProtectedRouteProps } from '../types';

/**
 * ProtectedRoute: envuelve rutas que requieren sesión activa.
 * Si no hay usuario logueado, redirige automáticamente a /login.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
