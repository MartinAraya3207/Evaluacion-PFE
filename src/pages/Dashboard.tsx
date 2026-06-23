import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Producto, Venta } from '../types';

interface Stats {
  totalProductos: number;
  productosStockBajo: number;
  totalVentas: number;
  ingresosMes: number;
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalProductos: 0,
    productosStockBajo: 0,
    totalVentas: 0,
    ingresosMes: 0,
  });
  const [ultimasVentas, setUltimasVentas] = useState<Venta[]>([]);

  useEffect(() => {
    const productos: Producto[] = JSON.parse(
      localStorage.getItem('stockpro_productos') || '[]'
    );
    const ventas: Venta[] = JSON.parse(
      localStorage.getItem('stockpro_ventas') || '[]'
    );

    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const ventasMes = ventas.filter((v) => new Date(v.fecha) >= inicioMes);
    const ingresos = ventasMes.reduce((acc, v) => acc + v.total, 0);

    setStats({
      totalProductos: productos.filter((p) => p.activo).length,
      productosStockBajo: productos.filter((p) => p.stock <= p.stockMinimo && p.activo).length,
      totalVentas: ventas.length,
      ingresosMes: ingresos,
    });

    setUltimasVentas(ventas.slice(-5).reverse());
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>¡Bienvenido, {usuario?.nombre}! 👋</h1>
          <p>Resumen del sistema StockPro</p>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="stats-grid">
        <div className="stat-card stat-card--blue">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalProductos}</span>
            <span className="stat-label">Productos activos</span>
          </div>
        </div>

        <div className={`stat-card ${stats.productosStockBajo > 0 ? 'stat-card--red' : 'stat-card--green'}`}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <span className="stat-value">{stats.productosStockBajo}</span>
            <span className="stat-label">Stock bajo</span>
          </div>
        </div>

        <div className="stat-card stat-card--purple">
          <div className="stat-icon">🧾</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalVentas}</span>
            <span className="stat-label">Ventas totales</span>
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">
              ${stats.ingresosMes.toLocaleString('es-CL')}
            </span>
            <span className="stat-label">Ingresos este mes</span>
          </div>
        </div>
      </div>

      {/* Últimas ventas */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Últimas ventas</h2>
          <Link to="/ventas" className="btn-link">Ver todas →</Link>
        </div>

        {ultimasVentas.length === 0 ? (
          <div className="empty-state">
            <p>No hay ventas registradas aún.</p>
            <Link to="/ventas" className="btn-primary">Registrar primera venta</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cliente</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ultimasVentas.map((v) => (
                <tr key={v.id}>
                  <td>{v.productoNombre}</td>
                  <td>{v.clienteNombre}</td>
                  <td>{v.cantidad}</td>
                  <td>${v.total.toLocaleString('es-CL')}</td>
                  <td>{new Date(v.fecha).toLocaleDateString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="dashboard-section">
        <h2>Accesos rápidos</h2>
        <div className="quick-access">
          <Link to="/productos" className="quick-card">
            <span>📦</span>
            <span>Ver Productos</span>
          </Link>
          <Link to="/ventas" className="quick-card">
            <span>🧾</span>
            <span>Registrar Venta</span>
          </Link>
          <Link to="/perfil" className="quick-card">
            <span>👤</span>
            <span>Mi Perfil</span>
          </Link>
          {usuario?.rol === 'admin' && (
            <Link to="/usuarios" className="quick-card">
              <span>👥</span>
              <span>Gestionar Usuarios</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
