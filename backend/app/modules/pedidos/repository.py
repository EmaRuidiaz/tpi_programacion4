from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import desc, func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def list_by_usuario(
        self,
        usuario_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> tuple[int, list[Pedido]]:
        conditions = []
        if usuario_id is not None:
            conditions.append(Pedido.usuario_id == usuario_id)
        if estado:
            conditions.append(Pedido.estado == estado)

        count_stmt = select(func.count()).select_from(Pedido)
        if conditions:
            count_stmt = count_stmt.where(*conditions)
        total = self.session.exec(count_stmt).one()

        items_stmt = select(Pedido)
        if conditions:
            items_stmt = items_stmt.where(*conditions)
        items_stmt = items_stmt.order_by(desc(Pedido.created_at), desc(Pedido.id)).offset(skip).limit(limit)
        items = list(self.session.exec(items_stmt).all())
        return int(total), items

    def count_by_estado(self, estado: str) -> int:
        statement = select(func.count()).select_from(Pedido).where(Pedido.estado == estado)
        return int(self.session.exec(statement).one())

    def count_pedidos_hoy(self) -> int:
        now = datetime.now(timezone.utc)
        inicio_hoy = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= inicio_hoy)
        )
        return int(self.session.exec(statement).one())

    def sum_ingresos_entregados(self) -> float:
        statement = (
            select(func.coalesce(func.sum(Pedido.total), 0.0))
            .where(Pedido.estado == "ENTREGADO")
        )
        return float(self.session.exec(statement).one())
