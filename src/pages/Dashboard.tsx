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

// Tasas de cambio obtenidas desde la API de exchangerate
interface TasasCambio {
  USD: number;
  EUR: number;
  ARG: number;
  BRL: number;
  actualizadoEn: string;
}

const MONEDAS = [
  { codigo: 'CLP', simbolo: '$', nombre: 'Peso chileno' },
  { codigo: 'USD', simbolo: 'US$', nombre: 'Dólar estadounidense' },
  { codigo: 'EUR', simbolo: '€', nombre: 'Euro' },
  { codigo: 'ARG', simbolo: 'AR$', nombre: 'Peso argentino' },
  { codigo: 'BRL', simbolo: 'R$', nombre: 'Real brasileño' },
];

export default function Dashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalProductos: 0,
    productosStockBajo: 0,
    totalVentas: 0,
    ingresosMes: 0,
  });
  const [ultimasVentas, setUltimasVentas] = useState<Venta[]>([]);

  // Estados del conversor de moneda
  const [tasas, setTasas] = useState<TasasCambio | null>(null);
  const [tasasCargando, setTasasCargando] = useState(true);
  const [tasasError, setTasasError] = useState(false);
  const [montoOrigen, setMontoOrigen] = useState('1000');
  const [monedaOrigen, setMonedaOrigen] = useState('CLP');
  const [monedaDestino, setMonedaDestino] = useState('USD');

  // Carga de datos locales (localStorage)
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

  // Consumo de API de tasas de cambio — base CLP (Peso chileno)
  useEffect(() => {
    async function fetchTasas() {
      try {
        // API gratuita, sin clave, base CLP
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/CLP');
        if (!res.ok) throw new Error('Error de red');
        const data = await res.json();

        setTasas({
          USD: data.rates.USD,
          EUR: data.rates.EUR,
          ARG: data.rates.ARS,
          BRL: data.rates.BRL,
          actualizadoEn: new Date(data.time_last_updated * 1000).toLocaleString('es-CL'),
        });
      } catch {
        setTasasError(true);
      } finally {
        setTasasCargando(false);
      }
    }

    fetchTasas();
  }, []);

  // Función que convierte entre cualquier par de monedas usando CLP como base
  function convertir(): string {
    if (!tasas || !montoOrigen || isNaN(Number(montoOrigen))) return '—';

    const monto = Number(montoOrigen);

    // Tasas relativas a CLP (1 CLP = X moneda)
    const tasasCompletas: Record<string, number> = {
      CLP: 1,
      USD: tasas.USD,
      EUR: tasas.EUR,
      ARG: tasas.ARG,
      BRL: tasas.BRL,
    };

    // Convertir origen → CLP → destino
    const enCLP = monto / tasasCompletas[monedaOrigen];
    const resultado = enCLP * tasasCompletas[monedaDestino];

    return resultado.toLocaleString('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }

  const simboloOrigen = MONEDAS.find(m => m.codigo === monedaOrigen)?.simbolo ?? '';
  const simboloDestino = MONEDAS.find(m => m.codigo === monedaDestino)?.simbolo ?? '';

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

      {/* Conversor de moneda — datos en vivo desde exchangerate-api */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>💱 Conversor de moneda</h2>
          <span className="badge-api">API en vivo</span>
        </div>
        <p style={{ marginBottom: '20px', fontSize: '0.875rem' }}>
          Convierte precios del inventario entre monedas en tiempo real.
          Tasas obtenidas desde <strong>exchangerate-api.com</strong>.
        </p>

        {tasasCargando && (
          <div className="react-api-loading">
            <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
            <span>Obteniendo tasas de cambio...</span>
          </div>
        )}

        {tasasError && (
          <div className="alert alert-error" style={{ maxWidth: 420 }}>
            No se pudieron obtener las tasas. Verifica tu conexión a internet.
          </div>
        )}

        {tasas && (
          <>
            {/* Controles del conversor */}
            <div className="conversor">
              <div className="conversor-campo">
                <label>Monto</label>
                <div className="conversor-input-group">
                  <span className="conversor-simbolo">{simboloOrigen}</span>
                  <input
                    type="number"
                    min="0"
                    value={montoOrigen}
                    onChange={(e) => setMontoOrigen(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="conversor-campo">
                <label>Desde</label>
                <select
                  value={monedaOrigen}
                  onChange={(e) => setMonedaOrigen(e.target.value)}
                >
                  {MONEDAS.map(m => (
                    <option key={m.codigo} value={m.codigo}>
                      {m.simbolo} {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="conversor-flecha">⇄</div>

              <div className="conversor-campo">
                <label>A</label>
                <select
                  value={monedaDestino}
                  onChange={(e) => setMonedaDestino(e.target.value)}
                >
                  {MONEDAS.map(m => (
                    <option key={m.codigo} value={m.codigo}>
                      {m.simbolo} {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="conversor-resultado">
                <span className="resultado-label">Resultado</span>
                <span className="resultado-valor">
                  {simboloDestino} {convertir()}
                </span>
              </div>
            </div>

            {/* Tasas rápidas respecto al CLP */}
            <div className="tasas-grid">
              <div className="tasa-card">
                <span className="tasa-nombre">🇺🇸 Dólar (USD)</span>
                <span className="tasa-valor">
                  $1 = US$ {tasas.USD.toLocaleString('es-CL', { minimumFractionDigits: 4 })}
                </span>
              </div>
              <div className="tasa-card">
                <span className="tasa-nombre">🇪🇺 Euro (EUR)</span>
                <span className="tasa-valor">
                  $1 = € {tasas.EUR.toLocaleString('es-CL', { minimumFractionDigits: 4 })}
                </span>
              </div>
              <div className="tasa-card">
                <span className="tasa-nombre">🇦🇷 Peso argentino</span>
                <span className="tasa-valor">
                  $1 = AR$ {tasas.ARG.toLocaleString('es-CL', { minimumFractionDigits: 4 })}
                </span>
              </div>
              <div className="tasa-card">
                <span className="tasa-nombre">🇧🇷 Real brasileño</span>
                <span className="tasa-valor">
                  $1 = R$ {tasas.BRL.toLocaleString('es-CL', { minimumFractionDigits: 4 })}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px' }}>
              Última actualización: {tasas.actualizadoEn}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
