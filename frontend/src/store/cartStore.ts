import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Producto } from '../features/productos/types';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock: number;
  imagen_url?: string | null;
}

interface CartState {
  items: CartItem[];
  agregar: (producto: Producto, cantidad?: number) => void;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto: Producto, cantidad = 1) => {
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === producto.id);
          if (existente) {
            const nuevaCantidad = Math.min(existente.cantidad + cantidad, producto.stock);
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.id
                  ? {
                      ...i,
                      cantidad: nuevaCantidad,
                      precio_unitario: producto.precio_base,
                      stock: producto.stock,
                    }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                cantidad: Math.min(cantidad, producto.stock),
                stock: producto.stock,
                imagen_url: producto.imagen_url,
              },
            ],
          };
        });
      },

      quitar: (producto_id: number) => {
        set((state) => ({
          items: state.items.filter((i) => i.producto_id !== producto_id),
        }));
      },

      cambiarCantidad: (producto_id: number, cantidad: number) => {
        if (cantidad <= 0) {
          get().quitar(producto_id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.producto_id === producto_id
              ? { ...i, cantidad: Math.min(cantidad, i.stock) }
              : i
          ),
        }));
      },

      vaciar: () => {
        set({ items: [] });
      },

      total: () => {
        return get().items.reduce(
          (acc, item) => acc + item.precio_unitario * item.cantidad,
          0
        );
      },
    }),
    {
      name: 'foodstore-cart',
    }
  )
);
