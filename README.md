# StockPro — Intranet de Inventario y Ventas

Intranet desarrollada en React + TypeScript con Vite para la Evaluación Sumativa 3 de Programación FrontEnd (TI2031).

## Contexto del proyecto

Sistema de gestión de stock y ventas para uso interno de una empresa. Permite a los distintos usuarios (administradores, vendedores y bodegueros) gestionar el inventario de productos y registrar ventas, con autenticación por roles.

## Cómo ejecutar el proyecto

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`

### Credenciales de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@stockpro.cl | admin123 | Administrador |
| vendedor@stockpro.cl | venta123 | Vendedor |

También puedes registrar nuevas cuentas desde la pantalla de registro.

## Módulos implementados

### 🔐 Autenticación y sesión
- Login con validación de credenciales
- Registro de nuevos usuarios
- Cierre de sesión con limpieza de estado
- Contexto global de usuario via `useContext` (`AuthContext`)
- Rutas protegidas: redirigen a `/login` si no hay sesión activa

### 📦 Productos (CRUD completo)
- Listado con búsqueda por nombre/proveedor y filtro por categoría
- Creación con formulario controlado y validación
- Edición en modal
- Eliminación con confirmación
- Alerta visual de stock bajo
- Ruta dinámica `/productos/:id` con `useParams` para ver detalle

### 🧾 Ventas (CRUD)
- Registro de ventas que descuenta automáticamente del stock
- Listado con filtro por producto/cliente
- Eliminación de ventas (solo admin)

### 🏠 Dashboard
- Estadísticas en tiempo real: productos activos, stock bajo, ventas, ingresos del mes
- Tabla de últimas ventas
- Accesos rápidos por rol

### 👤 Perfil de usuario
- Información del usuario logueado
- Permisos del rol
- Botón de cerrar sesión

### 👥 Usuarios (solo admin)
- Listado de todos los usuarios registrados

## Tecnologías y hooks utilizados

- **React 19 + TypeScript**
- **React Router v7** — enrutamiento SPA sin recarga
- **useState** — formularios controlados y estado local
- **useEffect** — carga de datos desde localStorage al montar componentes
- **useContext** — contexto global de autenticación (`AuthContext`)
- **useParams** — lectura del `:id` en la ruta de detalle de producto
- **localStorage** — persistencia de usuarios, sesión, productos y ventas

## Estructura de carpetas

```
src/
├── context/       # AuthContext (useContext + estado global)
├── pages/         # Vistas: Login, Registro, Dashboard, Productos, Ventas, Perfil, Usuarios
├── components/    # Navbar, ProtectedRoute
├── types/         # Interfaces TypeScript (User, Producto, Venta, etc.)
└── hooks/         # (disponible para hooks personalizados futuros)
```
