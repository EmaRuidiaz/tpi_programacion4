from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)


def create_all_tables() -> None:
    from app.modules.categorias.models import Categoria  # noqa: F401
    from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401
    from app.modules.productos.models import Producto  # noqa: F401
    from app.modules.usuarios.models import Usuario  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)
