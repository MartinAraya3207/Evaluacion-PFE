import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, usuario } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  if (usuario) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('El email es obligatorio.');
      return;
    }

    if (!password) {
      setError('La contraseña es obligatoria.');
      return;
    }

    setCargando(true);

    const ok = await login(email.trim().toLowerCase(), password);

    if (ok) {
      navigate('/dashboard', { replace: true });
    } else {
      setError('Email o contraseña incorrectos.');
    }

    setCargando(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">📦</span>
          <h1>StockPro</h1>
          <p>Sistema de gestión de inventario y ventas</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <h2>Iniciar Sesión</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@stockpro.cl"
              autoComplete="email"
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={cargando}
            />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>

          <p className="auth-link">
            ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
          </p>
        </form>
      </div>
    </div>
  );
}