import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { SessionUser, User } from '../types';

// ─── Usuarios predefinidos (simulan la "base de datos" inicial) ───────────────
const USUARIOS_INICIALES: User[] = [
  {
    id: '1',
    nombre: 'Admin',
    apellido: 'Sistema',
    email: 'admin@stockpro.cl',
    password: 'admin123',
    rol: 'admin',
    fechaRegistro: new Date().toISOString(),
  },
  {
    id: '2',
    nombre: 'María',
    apellido: 'González',
    email: 'vendedor@stockpro.cl',
    password: 'venta123',
    rol: 'vendedor',
    fechaRegistro: new Date().toISOString(),
  },
];

// ─── Tipos del contexto ───────────────────────────────────────────────────────
interface AuthContextType {
  usuario: SessionUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  registrar: (datos: Omit<User, 'id' | 'fechaRegistro'>) => { ok: boolean; error?: string };
  usuarios: User[];
  cargando: boolean;
}

// ─── Creación del contexto ────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ─── Hook personalizado para consumir el contexto ─────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<SessionUser | null>(null);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [cargando, setCargando] = useState(true);

  // Al montar: carga sesión activa y lista de usuarios desde localStorage
  useEffect(() => {
    // Inicializar usuarios predefinidos si no existen
    const usersGuardados = localStorage.getItem('stockpro_usuarios');
    if (!usersGuardados) {
      localStorage.setItem('stockpro_usuarios', JSON.stringify(USUARIOS_INICIALES));
      setUsuarios(USUARIOS_INICIALES);
    } else {
      setUsuarios(JSON.parse(usersGuardados));
    }

    // Restaurar sesión
    const sesion = localStorage.getItem('stockpro_sesion');
    if (sesion) {
      setUsuario(JSON.parse(sesion));
    }

    setCargando(false);
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  function login(email: string, password: string): boolean {
    const usersActuales: User[] = JSON.parse(
      localStorage.getItem('stockpro_usuarios') || '[]'
    );
    const encontrado = usersActuales.find(
      (u) => u.email === email && u.password === password
    );
    if (!encontrado) return false;

    const sesion: SessionUser = {
      id: encontrado.id,
      nombre: encontrado.nombre,
      apellido: encontrado.apellido,
      email: encontrado.email,
      rol: encontrado.rol,
      avatar: encontrado.avatar,
    };

    localStorage.setItem('stockpro_sesion', JSON.stringify(sesion));
    setUsuario(sesion);
    return true;
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  function logout(): void {
    localStorage.removeItem('stockpro_sesion');
    setUsuario(null);
  }

  // ── Registro de nuevo usuario ──────────────────────────────────────────────
  function registrar(
    datos: Omit<User, 'id' | 'fechaRegistro'>
  ): { ok: boolean; error?: string } {
    const usersActuales: User[] = JSON.parse(
      localStorage.getItem('stockpro_usuarios') || '[]'
    );

    const emailExiste = usersActuales.some((u) => u.email === datos.email);
    if (emailExiste) {
      return { ok: false, error: 'Ya existe un usuario con ese email.' };
    }

    const nuevoUsuario: User = {
      ...datos,
      id: crypto.randomUUID(),
      fechaRegistro: new Date().toISOString(),
    };

    const actualizados = [...usersActuales, nuevoUsuario];
    localStorage.setItem('stockpro_usuarios', JSON.stringify(actualizados));
    setUsuarios(actualizados);

    return { ok: true };
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, registrar, usuarios, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}
