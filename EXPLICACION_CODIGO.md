# Explicacion del codigo - StockPro

## App.tsx

Este archivo contiene toda la logica principal de la intranet.

- `type User`, `type Product` y `type Sale`: definen que datos tendra cada usuario, producto y venta.
- `defaultUsers` y `defaultProducts`: cargan datos iniciales para que el sistema funcione apenas se abre.
- `readStorage`: lee datos guardados en el navegador usando `localStorage`.
- `useState`: guarda el estado actual de usuarios, sesion, productos, ventas, modulo activo y formularios.
- `useEffect`: guarda automaticamente en `localStorage` cuando cambian usuarios, productos, ventas o sesion.
- `handleAuth`: permite iniciar sesion o registrar un usuario nuevo.
- `logout`: cierra la sesion y vuelve al estado inicial.
- `saveProduct`: agrega un producto nuevo o guarda cambios si se esta editando.
- `editProduct`: carga los datos de un producto en el formulario para modificarlos.
- `deleteProduct`: elimina un producto del listado.
- `addSaleItem`: agrega un producto al detalle de venta.
- `updateSaleQuantity`: cambia la cantidad vendida sin superar el stock disponible.
- `registerSale`: registra la venta con fecha, hora, vendedor y total, y descuenta el stock.
- `totalStock`, `totalInventory`, `totalSales` y `lowStock`: calculan datos que se muestran en el dashboard.

## App.css

Este archivo se encarga del diseno visual de la intranet.

- `.auth-page` y `.auth-panel`: disenan la pantalla de inicio de sesion.
- `.app-shell`: divide la intranet entre barra lateral y contenido principal.
- `.sidebar`: contiene los botones de navegacion por modulos.
- `.metrics`: muestra los indicadores del dashboard.
- `.product-form` y `.table`: ordenan el formulario y tabla del CRUD de productos.
- `.sale-layout`: organiza el punto de venta y el detalle de productos vendidos.
- `.profile-card`: muestra la informacion del usuario logueado.
- `@media`: adapta la interfaz a pantallas pequenas.

## index.css

Este archivo define estilos generales reutilizados por toda la aplicacion.

- Configura fuente, color base y fondo.
- Aplica `box-sizing: border-box` para controlar mejor los tamanos.
- Da estilo comun a botones, inputs y textarea.
- Define estilos generales de titulos y parrafos.

## Como probar

1. Ejecutar `npm install`.
2. Ejecutar `npm run dev`.
3. Entrar con `admin@stockpro.cl` y clave `123456`.
4. Probar registro de usuario, productos, ventas, dashboard, perfil y cierre de sesion.
