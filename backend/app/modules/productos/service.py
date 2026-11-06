import math
from typing import Optional

from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            items = [ProductoRead.model_validate(p) for p in productos]
            page = (skip // limit) + 1 if limit > 0 else 1
            pages = max(1, math.ceil(total / limit)) if limit > 0 else 1
            return ProductosPaginados(
                total=total,
                items=items,
                page=page,
                size=limit,
                pages=pages,
            )

    def obtener_por_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(data.categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("La categoría no existe o está dada de baja")

            nuevo = Producto(
                nombre=data.nombre.strip(),
                descripcion=data.descripcion or "",
                precio_base=data.precio_base,
                imagen_url=data.imagen_url or "",
                stock=data.stock,
                disponible=data.disponible,
                categoria_id=data.categoria_id,
                activo=True,
            )
            uow.productos.add(nuevo)
            return ProductoRead.model_validate(nuevo)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")

            campos = data.model_dump(exclude_unset=True)
            if "categoria_id" in campos and campos["categoria_id"] is not None:
                categoria = uow.categorias.get_by_id(campos["categoria_id"])
                if not categoria or not categoria.activo:
                    raise CategoriaNoEncontrada("La categoría no existe o está dada de baja")
                producto.categoria_id = campos["categoria_id"]

            if "nombre" in campos and campos["nombre"] is not None:
                producto.nombre = campos["nombre"].strip()
            if "descripcion" in campos and campos["descripcion"] is not None:
                producto.descripcion = campos["descripcion"]
            if "precio_base" in campos and campos["precio_base"] is not None:
                producto.precio_base = campos["precio_base"]
            if "imagen_url" in campos and campos["imagen_url"] is not None:
                producto.imagen_url = campos["imagen_url"]
            if "stock" in campos and campos["stock"] is not None:
                producto.stock = campos["stock"]
            if "disponible" in campos and campos["disponible"] is not None:
                producto.disponible = campos["disponible"]

            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")

            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.activo = False
            uow.session.add(producto)
            uow.session.flush()
