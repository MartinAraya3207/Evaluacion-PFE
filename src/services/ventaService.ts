import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Venta } from '../types';

const VENTAS_COLLECTION = 'ventas';

export async function obtenerVentas(): Promise<Venta[]> {
  const snapshot = await getDocs(collection(db, VENTAS_COLLECTION));

  return snapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  })) as Venta[];
}

export async function crearVenta(
  venta: Omit<Venta, 'id'>
): Promise<void> {
  await addDoc(collection(db, VENTAS_COLLECTION), venta);
}

export async function eliminarVenta(id: string): Promise<void> {
  const referencia = doc(db, VENTAS_COLLECTION, id);
  await deleteDoc(referencia);
}