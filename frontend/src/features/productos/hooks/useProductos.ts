import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
  updateProductoStock,
} from '../api/productos';
import type {
  ProductoCreate,
  ProductosFiltros,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types';

export function useProductos(filtros: ProductosFiltros = {}) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
  });
}

export function useCrearProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductoCreate) => createProducto(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useActualizarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) =>
      updateProducto(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useActualizarStockProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoStockUpdate }) =>
      updateProductoStock(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useEliminarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}
