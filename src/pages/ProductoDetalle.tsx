import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Producto } from '../types';
import { obtenerProductos } from '../services/productoService';

export default function ProductoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<Producto | null>(null);

  useEffect(() => {
    async function cargarProducto() {
      const productos = await obtenerProductos();
      const encontrado = productos.find((p) => p.id === id) ?? null;
      setProducto(encontrado);
    }

    cargarProducto();
  }, [id]);

  if (!producto) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Producto no encontrado.</p>
          <button className="btn-secondary" onClick={() => navigate('/productos')}>
            ← Volver a productos
          </button>
        </div>
      </div>
    );
  }

  const stockEstado =
    producto.stock === 0
      ? 'Sin stock'
      : producto.stock <= producto.stockMinimo
      ? 'Stock bajo'
      : 'Disponible';

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate('/productos')}>
        ← Volver
      </button>

      <div className="detalle-card">
        <div className="detalle-header">
          <div>
            <h1>{producto.nombre}</h1>
            <span className="badge-categoria">{producto.categoria}</span>
          </div>
          <div className="detalle-precio">
            <span className="precio-label">Precio</span>
            <span className="precio-valor">${producto.precio.toLocaleString('es-CL')}</span>
          </div>
        </div>

        {producto.descripcion && (
          <p className="detalle-descripcion">{producto.descripcion}</p>
        )}

        <div className="detalle-grid">
          <div className="detalle-item">
            <span className="detalle-label">Stock actual</span>
            <span className={`detalle-valor badge-stock-${producto.stock <= producto.stockMinimo ? 'bajo' : 'ok'}`}>
              {producto.stock} unidades
            </span>
          </div>
          <div className="detalle-item">
            <span className="detalle-label">Stock mínimo</span>
            <span className="detalle-valor">{producto.stockMinimo} unidades</span>
          </div>
          <div className="detalle-item">
            <span className="detalle-label">Proveedor</span>
            <span className="detalle-valor">{producto.proveedor}</span>
          </div>
          <div className="detalle-item">
            <span className="detalle-label">Estado de stock</span>
            <span className={`detalle-valor ${producto.stock === 0 ? 'text-red' : producto.stock <= producto.stockMinimo ? 'text-orange' : 'text-green'}`}>
              {stockEstado}
            </span>
          </div>
          <div className="detalle-item">
            <span className="detalle-label">Estado del producto</span>
            <span className={`badge-${producto.activo ? 'activo' : 'inactivo'}`}>
              {producto.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div className="detalle-item">
            <span className="detalle-label">Fecha de ingreso</span>
            <span className="detalle-valor">
              {new Date(producto.fechaIngreso).toLocaleDateString('es-CL')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
