import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmarPassword: string;
  rol: UserRole;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  confirmarPassword?: string;
}

export default function Registro() {
  const { registrar, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmarPassword: '',
    rol: 'vendedor',
  });
  const [errores, setErrores] = useState<FormErrors>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [exitoso, setExitoso] = useState(false);

  function actualizar(campo: keyof FormData, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    // Limpiar error del campo al escribir
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  }

  function validar(): boolean {
    const nuevosErrores: FormErrors = {};

    if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.';
    if (!form.apellido.trim()) nuevosErrores.apellido = 'El apellido es obligatorio.';
    if (!form.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nuevosErrores.email = 'El email no tiene un formato válido.';
    }
    if (!form.password) {
      nuevosErrores.password = 'La contraseña es obligatoria.';
    } else if (form.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (form.password !== form.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral('');

    if (!validar()) return;

    const resultado = registrar({
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      rol: form.rol,
    });

    if (!resultado.ok) {
      setErrorGeneral(resultado.error ?? 'Error al registrar usuario.');
      return;
    }

    setExitoso(true);
    // Iniciar sesión automáticamente tras registro
    setTimeout(() => {
      login(form.email.trim().toLowerCase(), form.password);
      navigate('/dashboard', { replace: true });
    }, 1200);
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-header">
          <span className="auth-logo">📦</span>
          <h1>StockPro</h1>
          <p>Crea tu cuenta para acceder al sistema</p>
        </div>

        {exitoso ? (
          <div className="alert alert-success">
            ✅ Cuenta creada exitosamente. Redirigiendo...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <h2>Crear Cuenta</h2>

            {errorGeneral && <div className="alert alert-error">{errorGeneral}</div>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={(e) => actualizar('nombre', e.target.value)}
                  placeholder="Juan"
                />
                {errores.nombre && <span className="field-error">{errores.nombre}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  id="apellido"
                  type="text"
                  value={form.apellido}
                  onChange={(e) => actualizar('apellido', e.target.value)}
                  placeholder="Pérez"
                />
                {errores.apellido && <span className="field-error">{errores.apellido}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => actualizar('email', e.target.value)}
                placeholder="juan@empresa.cl"
                autoComplete="email"
              />
              {errores.email && <span className="field-error">{errores.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="rol">Rol</label>
              <select
                id="rol"
                value={form.rol}
                onChange={(e) => actualizar('rol', e.target.value as UserRole)}
              >
                <option value="vendedor">Vendedor</option>
                <option value="bodeguero">Bodeguero</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-password">Contraseña</label>
                <input
                  id="reg-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => actualizar('password', e.target.value)}
                  placeholder="Mín. 6 caracteres"
                  autoComplete="new-password"
                />
                {errores.password && <span className="field-error">{errores.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmar">Confirmar contraseña</label>
                <input
                  id="confirmar"
                  type="password"
                  value={form.confirmarPassword}
                  onChange={(e) => actualizar('confirmarPassword', e.target.value)}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                />
                {errores.confirmarPassword && (
                  <span className="field-error">{errores.confirmarPassword}</span>
                )}
              </div>
            </div>

            <button type="submit" className="btn-primary btn-full">
              Crear Cuenta
            </button>

            <p className="auth-link">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login">Iniciar sesión</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
