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
import { auth } from '../firebase/firebase';
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

  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }

  return ctx;
}

function mapFirebaseUser(user: FirebaseUser): SessionUser {
  const nombreCompleto = user.displayName ?? '';

  const partes = nombreCompleto.split(' ');

  return {
    id: user.uid,
    nombre: partes[0] || 'Usuario',
    apellido: partes.slice(1).join(' '),
    email: user.email ?? '',
    rol: 'vendedor',
  };
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [usuario, setUsuario] = useState<SessionUser | null>(null);

  // Se deja para cuando migremos a Firestore
  const [usuarios] = useState<User[]>([]);

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

    return unsubscribe;
  }, []);

  async function login(
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async function logout(): Promise<void> {
    await signOut(auth);
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

      // Guardar nombre y apellido en Firebase Authentication
      await updateProfile(credenciales.user, {
        displayName: `${datos.nombre} ${datos.apellido}`,
      });

      return { ok: true };
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return {
            ok: false,
            error: 'Ya existe un usuario con ese correo.',
          };

        case 'auth/weak-password':
          return {
            ok: false,
            error: 'La contraseña debe tener al menos 6 caracteres.',
          };

        case 'auth/invalid-email':
          return {
            ok: false,
            error: 'El correo electrónico no es válido.',
          };

        default:
          console.error(error);
          return {
            ok: false,
            error: 'No se pudo registrar el usuario.',
          };
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        registrar,
        usuarios,
        cargando,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}