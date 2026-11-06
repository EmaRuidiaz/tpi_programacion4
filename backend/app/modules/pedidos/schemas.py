from datetime import datetime
from typing import Literal, Optional

from sqlmodel import Field, SQLModel

FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]
EstadoPedido = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]


class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: Optional[str] = ""


class DetallePedidoRead(SQLModel):
    id: Optional[int] = None
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str] = ""
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead] = []


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]
    page: int = 1
    size: int = 20
    pages: int = 1


class CambioEstado(SQLModel):
    estado: EstadoPedido


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
