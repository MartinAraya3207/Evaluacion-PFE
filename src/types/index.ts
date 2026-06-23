// ─── Tipos de dominio ─────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'vendedor' | 'bodeguero';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: UserRole;
  avatar?: string;
  fechaRegistro: string;
}

export interface SessionUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: UserRole;
  avatar?: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  proveedor: string;
  fechaIngreso: string;
  activo: boolean;
}

export interface Venta {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  vendedorId: string;
  vendedorNombre: string;
  clienteNombre: string;
  fecha: string;
}

// ─── Props de componentes ─────────────────────────────────────────────────────

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export interface NavbarProps {
  onLogout: () => void;
}

export interface ProductoFormProps {
  productoEditar?: Producto | null;
  onGuardado: () => void;
  onCancelar: () => void;
}

export interface VentaFormProps {
  productos: Producto[];
  onGuardado: () => void;
  onCancelar: () => void;
}

export interface ConfirmModalProps {
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}
