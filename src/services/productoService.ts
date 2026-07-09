import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Producto } from '../types';

const PRODUCTOS_COLLECTION = 'productos';

export async function obtenerProductos(): Promise<Producto[]> {
  const snapshot = await getDocs(collection(db, PRODUCTOS_COLLECTION));

  return snapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  })) as Producto[];
}

export async function crearProducto(
  producto: Omit<Producto, 'id'>
): Promise<void> {
  await addDoc(collection(db, PRODUCTOS_COLLECTION), producto);
}

export async function actualizarProducto(
  id: string,
  producto: Partial<Producto>
): Promise<void> {
  const referencia = doc(db, PRODUCTOS_COLLECTION, id);
  await updateDoc(referencia, producto);
}

export async function eliminarProducto(id: string): Promise<void> {
  const referencia = doc(db, PRODUCTOS_COLLECTION, id);
  await deleteDoc(referencia);
}