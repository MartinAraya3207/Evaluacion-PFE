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
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import type { SessionUser, User } from '../types';

interface AuthContextType {
  usuario: SessionUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registrar: (
    datos: Omit<User, 'id' | 'fechaRegistro'>
  ) => Promise<{ ok: boolean; error?: string }>;
  usuarios: User[];
  cargando: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

async function obtenerUsuarioFirestore(user: FirebaseUser): Promise<SessionUser> {
  const ref = doc(db, 'usuarios', user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data() as User;

    return {
      id: user.uid,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      rol: data.rol,
      avatar: data.avatar,
    };
  }

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
  const [usuarios] = useState<User[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const usuarioFirestore = await obtenerUsuarioFirestore(firebaseUser);
          setUsuario(usuarioFirestore);
        } else {
          setUsuario(null);
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    });

    return unsubscribe;
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
      const credenciales = await createUserWithEmailAndPassword(
        auth,
        datos.email,
        datos.password
      );

      await updateProfile(credenciales.user, {
        displayName: `${datos.nombre} ${datos.apellido}`,
      });

      const nuevoUsuario: User = {
        id: credenciales.user.uid,
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        password: '',
        rol: datos.rol,
        fechaRegistro: new Date().toISOString(),
      };

      await setDoc(doc(db, 'usuarios', credenciales.user.uid), nuevoUsuario);

      setUsuario({
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        avatar: nuevoUsuario.avatar,
      });

      return { ok: true };
    } catch (error: any) {
      console.error('Error al registrar:', error);

      if (error.code === 'auth/email-already-in-use') {
        return { ok: false, error: 'Ya existe un usuario con ese correo.' };
      }

      if (error.code === 'auth/weak-password') {
        return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
      }

      if (error.code === 'auth/invalid-email') {
        return { ok: false, error: 'El correo no tiene un formato válido.' };
      }

      return { ok: false, error: 'No se pudo registrar el usuario.' };
    }
  }

  return (
    <AuthContext.Provider
      value={{ usuario, login, logout, registrar, usuarios, cargando }}
    >
      {children}
    </AuthContext.Provider>
  );
}