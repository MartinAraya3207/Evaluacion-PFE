import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Producto, Venta } from '../types';

interface FormVenta {
  productoId: string;
  cantidad: string;
  clienteNombre: string;
}

const FORM_VACIO: FormVenta = { productoId: '', cantidad: '1', clienteNombre: '' };

export default function Ventas() {
  const { usuario } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filtro, setFiltro] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<FormVenta>(FORM_VACIO);
  const [errores, setErrores] = useState<Partial<FormVenta>>({});
  const [confirmElim, setConfirmElim] = useState<string | null>(null);

  useEffect(() => {
    const v: Venta[] = JSON.parse(localStorage.getItem('stockpro_ventas') || '[]');
    const p: Producto[] = JSON.parse(localStorage.getItem('stockpro_productos') || '[]');
    setVentas(v.reverse()); // más recientes primero
    setProductos(p.filter((prod) => prod.activo && prod.stock > 0));
  }, []);

  function guardarVentas(lista: Venta[]) {
    localStorage.setItem('stockpro_ventas', JSON.stringify([...lista].reverse()));
    setVentas(lista);
  }

  const ventasFiltradas = ventas.filter(
    (v) =>
      v.productoNombre.toLowerCase().includes(filtro.toLowerCase()) ||
      v.clienteNombre.toLowerCase().includes(filtro.toLowerCase())
  );

  function validar(): boolean {
    const e: Partial<FormVenta> = {};
    if (!form.productoId) e.productoId = 'Selecciona un producto.';
    if (!form.cantidad || Number(form.cantidad) < 1) e.cantidad = 'Cantidad mínima: 1.';
    if (!form.clienteNombre.trim()) e.clienteNombre = 'El nombre del cliente es obligatorio.';

    const prod = productos.find((p) => p.id === form.productoId);
    if (prod && Number(form.cantidad) > prod.stock) {
      e.cantidad = `Stock insuficiente. Disponible: ${prod.stock}`;
    }

    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validar()) return;

    const prod = productos.find((p) => p.id === form.productoId)!;
    const cantidad = Number(form.cantidad);

    const nuevaVenta: Venta = {
      id: crypto.randomUUID(),
      productoId: prod.id,
      productoNombre: prod.nombre,
      cantidad,
      precioUnitario: prod.precio,
      total: prod.precio * cantidad,
      vendedorId: usuario?.id ?? '',
      vendedorNombre: `${usuario?.nombre} ${usuario?.apellido}`,
      clienteNombre: form.clienteNombre.trim(),
      fecha: new Date().toISOString(),
    };

    // Actualizar stock del producto
    const productosActuales: Producto[] = JSON.parse(
      localStorage.getItem('stockpro_productos') || '[]'
    );
    const prodActualizados = productosActuales.map((p) =>
      p.id === prod.id ? { ...p, stock: p.stock - cantidad } : p
    );
    localStorage.setItem('stockpro_productos', JSON.stringify(prodActualizados));
    setProductos(prodActualizados.filter((p) => p.activo && p.stock > 0));

    const ventasActuales: Venta[] = JSON.parse(
      localStorage.getItem('stockpro_ventas') || '[]'
    );
    const nuevasVentas = [...ventasActuales, nuevaVenta];
    localStorage.setItem('stockpro_ventas', JSON.stringify(nuevasVentas));
    setVentas([nuevaVenta, ...ventas]);

    setMostrarForm(false);
    setForm(FORM_VACIO);
  }

  function eliminarVenta(id: string) {
    const ventasActuales: Venta[] = JSON.parse(
      localStorage.getItem('stockpro_ventas') || '[]'
    );
    const actualizadas = ventasActuales.filter((v) => v.id !== id);
    localStorage.setItem('stockpro_ventas', JSON.stringify(actualizadas));
    setVentas(ventas.filter((v) => v.id !== id));
    setConfirmElim(null);
  }

  const productoSeleccionado = productos.find((p) => p.id === form.productoId);
  const totalPreview = productoSeleccionado
    ? productoSeleccionado.precio * (Number(form.cantidad) || 0)
    : 0;

  const canSell = usuario?.rol === 'admin' || usuario?.rol === 'vendedor';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🧾 Ventas</h1>
          <p>Historial y registro de ventas</p>
        </div>
        {canSell && (
          <button className="btn-primary" onClick={() => { setMostrarForm(true); setForm(FORM_VACIO); setErrores({}); }}>
            + Nueva venta
          </button>
        )}
      </div>

      {/* Filtro */}
      <div className="filtros-bar">
        <input
          type="text"
          placeholder="🔍 Buscar por producto o cliente..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="input-busqueda"
        />
      </div>

      {/* Formulario nueva venta */}
      {mostrarForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Nueva Venta</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label>Producto *</label>
                <select
                  value={form.productoId}
                  onChange={(e) => setForm((f) => ({ ...f, productoId: e.target.value }))}
                >
                  <option value="">Selecciona un producto...</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} — Stock: {p.stock} — ${p.precio.toLocaleString('es-CL')}
                    </option>
                  ))}
                </select>
                {errores.productoId && <span className="field-error">{errores.productoId}</span>}
              </div>

              <div className="form-group">
                <label>Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  value={form.cantidad}
                  onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
                />
                {errores.cantidad && <span className="field-error">{errores.cantidad}</span>}
              </div>

              <div className="form-group">
                <label>Nombre del cliente *</label>
                <input
                  type="text"
                  value={form.clienteNombre}
                  onChange={(e) => setForm((f) => ({ ...f, clienteNombre: e.target.value }))}
                  placeholder="Ej: Pedro Soto"
                />
                {errores.clienteNombre && <span className="field-error">{errores.clienteNombre}</span>}
              </div>

              {totalPreview > 0 && (
                <div className="venta-preview">
                  <strong>Total estimado: ${totalPreview.toLocaleString('es-CL')}</strong>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setMostrarForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmación */}
      {confirmElim && (
        <div className="modal-overlay">
          <div className="modal modal--sm">
            <h3>¿Eliminar venta?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmElim(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => eliminarVenta(confirmElim)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      {ventasFiltradas.length === 0 ? (
        <div className="empty-state">
          <p>{ventas.length === 0 ? 'No hay ventas registradas.' : 'Sin resultados para esa búsqueda.'}</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cliente</th>
              <th>Cantidad</th>
              <th>Precio u.</th>
              <th>Total</th>
              <th>Vendedor</th>
              <th>Fecha</th>
              {usuario?.rol === 'admin' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map((v) => (
              <tr key={v.id}>
                <td>{v.productoNombre}</td>
                <td>{v.clienteNombre}</td>
                <td>{v.cantidad}</td>
                <td>${v.precioUnitario.toLocaleString('es-CL')}</td>
                <td><strong>${v.total.toLocaleString('es-CL')}</strong></td>
                <td>{v.vendedorNombre}</td>
                <td>{new Date(v.fecha).toLocaleDateString('es-CL')}</td>
                {usuario?.rol === 'admin' && (
                  <td>
                    <button className="btn-delete" onClick={() => setConfirmElim(v.id)}>🗑️</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
