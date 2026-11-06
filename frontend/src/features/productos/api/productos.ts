import { axiosInstance } from '../../../shared/api/axiosInstance';
import type {
  Producto,
  ProductoCreate,
  ProductosFiltros,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types';

export async function getProductos(
  filtros: ProductosFiltros = {}
): Promise<ProductosPaginados> {
  const params: Record<string, string | number | boolean> = {
    skip: filtros.skip ?? 0,
    limit: filtros.limit ?? 20,
  };
  if (filtros.search && filtros.search.trim()) {
    params.search = filtros.search.trim();
  }
  if (filtros.categoria_id !== undefined) {
    params.categoria_id = filtros.categoria_id;
  }
  if (filtros.disponible !== undefined) {
    params.disponible = filtros.disponible;
  }
  const { data } = await axiosInstance.get<ProductosPaginados>('/productos', {
    params,
  });
  return data;
}

export async function getProductoById(id: number): Promise<Producto> {
  const { data } = await axiosInstance.get<Producto>(`/productos/${id}`);
  return data;
}

export async function createProducto(payload: ProductoCreate): Promise<Producto> {
  const { data } = await axiosInstance.post<Producto>('/productos', payload);
  return data;
}

export async function updateProducto(
  id: number,
  payload: ProductoUpdate
): Promise<Producto> {
  const { data } = await axiosInstance.put<Producto>(`/productos/${id}`, payload);
  return data;
}

export async function updateProductoStock(
  id: number,
  payload: ProductoStockUpdate
): Promise<Producto> {
  const { data } = await axiosInstance.patch<Producto>(
    `/productos/${id}/stock`,
    payload
  );
  return data;
}

export async function deleteProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`);
}
