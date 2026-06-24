import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Producto } from '../types';

interface FormProd {
  nombre: string;
  descripcion: string;
  categoria: string;
  nuevaCategoria: string;
  precio: string;
  stock: string;
  stockMinimo: string;
  proveedor: string;
}

const FORM_VACIO: FormProd = {
  nombre: '',
  descripcion: '',
  categoria: '',
  nuevaCategoria: '',
  precio: '',
  stock: '',
  stockMinimo: '5',
  proveedor: '',
};

// ── Helpers para categorías en localStorage ───────────────────────────────
function leerCategorias(): string[] {
  return JSON.parse(localStorage.getItem('stockpro_categorias') || '[]');
}

function guardarCategorias(lista: string[]) {
  localStorage.setItem('stockpro_categorias', JSON.stringify(lista));
}

export default function Productos() {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarGestCat, setMostrarGestCat] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState<FormProd>(FORM_VACIO);
  const [errores, setErrores] = useState<Partial<FormProd>>({});
  const [confirmElim, setConfirmElim] = useState<string | null>(null);
  const [inputCategoria, setInputCategoria] = useState('');
  const [errorCategoria, setErrorCategoria] = useState('');

  // Cargar productos y categorías desde localStorage al montar
  useEffect(() => {
    const guardados: Producto[] = JSON.parse(
      localStorage.getItem('stockpro_productos') || '[]'
    );
    setProductos(guardados);
    setCategorias(leerCategorias());
  }, []);

  // ── Guardar productos en localStorage ────────────────────────────────────
  function guardarLocal(lista: Producto[]) {
    localStorage.setItem('stockpro_productos', JSON.stringify(lista));
    setProductos(lista);
  }

  // ── Agregar nueva categoría ───────────────────────────────────────────────
  function agregarCategoria() {
    const nueva = inputCategoria.trim();
    if (!nueva) {
      setErrorCategoria('Escribe un nombre para la categoría.');
      return;
    }
    const actuales = leerCategorias();
    if (actuales.some(c => c.toLowerCase() === nueva.toLowerCase())) {
      setErrorCategoria('Esa categoría ya existe.');
      return;
    }
    const actualizadas = [...actuales, nueva];
    guardarCategorias(actualizadas);
    setCategorias(actualizadas);
    setInputCategoria('');
    setErrorCategoria('');
  }

  // ── Eliminar categoría ────────────────────────────────────────────────────
  function eliminarCategoria(cat: string) {
    const enUso = productos.some(p => p.categoria === cat);
    if (enUso) {
      setErrorCategoria(`No se puede eliminar "${cat}" porque hay productos que la usan.`);
      return;
    }
    const actualizadas = leerCategorias().filter(c => c !== cat);
    guardarCategorias(actualizadas);
    setCategorias(actualizadas);
    setErrorCategoria('');
  }

  // ── Filtrado combinado ────────────────────────────────────────────────────
  const productosFiltrados = productos.filter((p) => {
    const coincideTexto =
      p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      p.proveedor.toLowerCase().includes(filtro.toLowerCase());
    const coincideCategoria = categoriaFiltro ? p.categoria === categoriaFiltro : true;
    return coincideTexto && coincideCategoria;
  });

  // ── Abrir formulario para editar ──────────────────────────────────────────
  function abrirEditar(p: Producto) {
    setEditando(p);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria,
      nuevaCategoria: '',
      precio: String(p.precio),
      stock: String(p.stock),
      stockMinimo: String(p.stockMinimo),
      proveedor: p.proveedor,
    });
    setMostrarForm(true);
    setErrores({});
  }

  function abrirNuevo() {
    setEditando(null);
    setForm({ ...FORM_VACIO, categoria: categorias[0] ?? '' });
    setMostrarForm(true);
    setErrores({});
  }

  // ── Validar formulario ────────────────────────────────────────────────────
  function validar(): boolean {
    const e: Partial<FormProd> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    if (!form.categoria && !form.nuevaCategoria.trim())
      e.categoria = 'Selecciona o escribe una categoría.';
    if (!form.precio || isNaN(Number(form.precio)) || Number(form.precio) < 0)
      e.precio = 'Ingresa un precio válido.';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = 'Ingresa un stock válido.';
    if (!form.proveedor.trim()) e.proveedor = 'El proveedor es obligatorio.';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  // ── Guardar (crear o editar) ──────────────────────────────────────────────
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validar()) return;

    // Si escribió una categoría nueva, agregarla primero
    let categoriaFinal = form.categoria;
    if (form.nuevaCategoria.trim()) {
      const nueva = form.nuevaCategoria.trim();
      const actuales = leerCategorias();
      if (!actuales.some(c => c.toLowerCase() === nueva.toLowerCase())) {
        const actualizadas = [...actuales, nueva];
        guardarCategorias(actualizadas);
        setCategorias(actualizadas);
      }
      categoriaFinal = nueva;
    }

    if (editando) {
      const actualizado: Producto = {
        ...editando,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        categoria: categoriaFinal,
        precio: Number(form.precio),
        stock: Number(form.stock),
        stockMinimo: Number(form.stockMinimo),
        proveedor: form.proveedor.trim(),
      };
      guardarLocal(productos.map((p) => (p.id === editando.id ? actualizado : p)));
    } else {
      const nuevo: Producto = {
        id: crypto.randomUUID(),
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        categoria: categoriaFinal,
        precio: Number(form.precio),
        stock: Number(form.stock),
        stockMinimo: Number(form.stockMinimo),
        proveedor: form.proveedor.trim(),
        fechaIngreso: new Date().toISOString(),
        activo: true,
      };
      guardarLocal([...productos, nuevo]);
    }

    setMostrarForm(false);
    setEditando(null);
  }

  // ── Eliminar producto ─────────────────────────────────────────────────────
  function eliminar(id: string) {
    guardarLocal(productos.filter((p) => p.id !== id));
    setConfirmElim(null);
  }

  const canEdit = usuario?.rol === 'admin' || usuario?.rol === 'bodeguero';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>📦 Productos</h1>
          <p>Gestión de inventario</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {canEdit && (
            <button className="btn-secondary" onClick={() => { setMostrarGestCat(true); setErrorCategoria(''); }}>
              🏷️ Categorías
            </button>
          )}
          {canEdit && (
            <button className="btn-primary" onClick={abrirNuevo}>
              + Nuevo producto
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-bar">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o proveedor..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="input-busqueda"
        />
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Modal gestión de categorías */}
      {mostrarGestCat && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>🏷️ Gestionar Categorías</h2>
            <p style={{ marginBottom: '20px', fontSize: '0.875rem' }}>
              Agrega o elimina categorías. No puedes eliminar una categoría que tenga productos asignados.
            </p>

            {/* Input nueva categoría */}
            <div className="cat-input-row">
              <input
                type="text"
                value={inputCategoria}
                onChange={(e) => { setInputCategoria(e.target.value); setErrorCategoria(''); }}
                placeholder="Nombre de la nueva categoría..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarCategoria())}
              />
              <button className="btn-primary" onClick={agregarCategoria}>
                + Agregar
              </button>
            </div>
            {errorCategoria && <span className="field-error" style={{ marginBottom: '12px', display: 'block' }}>{errorCategoria}</span>}

            {/* Lista de categorías existentes */}
            {categorias.length === 0 ? (
              <div className="cat-vacia">
                <p>No hay categorías. Agrega la primera arriba.</p>
              </div>
            ) : (
              <ul className="cat-lista">
                {categorias.map((c) => {
                  const enUso = productos.filter(p => p.categoria === c).length;
                  return (
                    <li key={c} className="cat-item">
                      <div className="cat-info">
                        <span className="cat-nombre">{c}</span>
                        <span className="cat-en-uso">
                          {enUso > 0 ? `${enUso} producto${enUso > 1 ? 's' : ''}` : 'Sin productos'}
                        </span>
                      </div>
                      <button
                        className="btn-delete"
                        onClick={() => eliminarCategoria(c)}
                        title={enUso > 0 ? 'No se puede eliminar, tiene productos' : 'Eliminar categoría'}
                        disabled={enUso > 0}
                      >
                        🗑️
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button className="btn-primary" onClick={() => { setMostrarGestCat(false); setErrorCategoria(''); }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario nuevo/editar producto */}
      {mostrarForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit} className="form-grid" noValidate>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                />
                {errores.nombre && <span className="field-error">{errores.nombre}</span>}
              </div>

              <div className="form-group">
                <label>Categoría *</label>
                {categorias.length === 0 ? (
                  <p className="field-error" style={{ marginTop: 4 }}>
                    No hay categorías. Cierra este formulario y crea una primero.
                  </p>
                ) : (
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value, nuevaCategoria: '' }))}
                  >
                    <option value="">Selecciona una categoría...</option>
                    {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
                <input
                  type="text"
                  value={form.nuevaCategoria}
                  onChange={(e) => setForm((f) => ({ ...f, nuevaCategoria: e.target.value, categoria: '' }))}
                  placeholder="O escribe una nueva categoría..."
                  style={{ marginTop: '6px' }}
                />
                {errores.categoria && <span className="field-error">{errores.categoria}</span>}
              </div>

              <div className="form-group span-2">
                <label>Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Precio (CLP) *</label>
                <input
                  type="number"
                  min="0"
                  value={form.precio}
                  onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
                />
                {errores.precio && <span className="field-error">{errores.precio}</span>}
              </div>

              <div className="form-group">
                <label>Proveedor *</label>
                <input
                  type="text"
                  value={form.proveedor}
                  onChange={(e) => setForm((f) => ({ ...f, proveedor: e.target.value }))}
                />
                {errores.proveedor && <span className="field-error">{errores.proveedor}</span>}
              </div>

              <div className="form-group">
                <label>Stock actual *</label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                />
                {errores.stock && <span className="field-error">{errores.stock}</span>}
              </div>

              <div className="form-group">
                <label>Stock mínimo</label>
                <input
                  type="number"
                  min="0"
                  value={form.stockMinimo}
                  onChange={(e) => setForm((f) => ({ ...f, stockMinimo: e.target.value }))}
                />
              </div>

              <div className="modal-actions span-2">
                <button type="button" className="btn-secondary" onClick={() => setMostrarForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editando ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminación producto */}
      {confirmElim && (
        <div className="modal-overlay">
          <div className="modal modal--sm">
            <h3>¿Eliminar producto?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmElim(null)}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={() => eliminar(confirmElim)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      {productosFiltrados.length === 0 ? (
        <div className="empty-state">
          <p>{productos.length === 0 ? 'No hay productos registrados.' : 'No hay resultados para esa búsqueda.'}</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Proveedor</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link to={`/productos/${p.id}`} className="link-tabla">
                    {p.nombre}
                  </Link>
                </td>
                <td>{p.categoria}</td>
                <td>${p.precio.toLocaleString('es-CL')}</td>
                <td>
                  <span className={p.stock <= p.stockMinimo ? 'badge-stock-bajo' : 'badge-stock-ok'}>
                    {p.stock}
                  </span>
                </td>
                <td>{p.proveedor}</td>
                <td>
                  <span className={p.activo ? 'badge-activo' : 'badge-inactivo'}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  {canEdit && (
                    <div className="acciones">
                      <button className="btn-edit" onClick={() => abrirEditar(p)}>✏️</button>
                      <button className="btn-delete" onClick={() => setConfirmElim(p.id)}>🗑️</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
