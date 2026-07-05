import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import type { SessionUser, User } from '../types';

interface AuthContextType {
  usuario: SessionUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registrar: (datos: Omit<User, 'id' | 'fechaRegistro'>) => Promise<{ ok: boolean; error?: string }>;
  usuarios: User[];
  cargando: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

function mapFirebaseUser(user: FirebaseUser): SessionUser {
  return {
    id: user.uid,
    nombre: user.displayName?.split(' ')[0] || 'Usuario',
    apellido: user.displayName?.split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    rol: 'vendedor',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<SessionUser | null>(null);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUsuario(mapFirebaseUser(firebaseUser));
      } else {
        setUsuario(null);
      }

      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  async function login(email: string, password: string): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  }

  async function logout(): Promise<void> {
    await signOut(auth);
    setUsuario(null);
  }

  async function registrar(
    datos: Omit<User, 'id' | 'fechaRegistro'>
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      await createUserWithEmailAndPassword(auth, datos.email, datos.password);
      return { ok: true };
    } catch (error) {
      console.error('Error al registrar:', error);
      return {
        ok: false,
        error: 'No se pudo registrar el usuario. Revisa el correo o la contraseña.',
      };
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, registrar, usuarios, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}