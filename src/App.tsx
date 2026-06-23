import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import Productos from './pages/Productos';
import ProductoDetalle from './pages/ProductoDetalle';
import Ventas from './pages/Ventas';
import Usuarios from './pages/Usuarios';
import './App.css';

// Layout que muestra la Navbar solo cuando el usuario está logueado
function IntranetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas protegidas (requieren sesión activa) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <IntranetLayout>
                  <Dashboard />
                </IntranetLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <IntranetLayout>
                  <Perfil />
                </IntranetLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <IntranetLayout>
                  <Productos />
                </IntranetLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos/:id"
            element={
              <ProtectedRoute>
                <IntranetLayout>
                  <ProductoDetalle />
                </IntranetLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ventas"
            element={
              <ProtectedRoute>
                <IntranetLayout>
                  <Ventas />
                </IntranetLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <IntranetLayout>
                  <Usuarios />
                </IntranetLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirige raíz al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
