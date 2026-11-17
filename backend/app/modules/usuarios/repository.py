from typing import Optional

from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Optional[Usuario]:
        normalized = username.strip().lower()
        statement = select(Usuario).where(func.lower(Usuario.username) == normalized)
        return self.session.exec(statement).first()

    def get_by_email(self, email: str) -> Optional[Usuario]:
        normalized = email.strip().lower()
        statement = select(Usuario).where(func.lower(Usuario.email) == normalized)
        return self.session.exec(statement).first()
