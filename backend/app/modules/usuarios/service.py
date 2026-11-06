from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    pass


class UsuarioDuplicado(Exception):
    pass


class OperacionNoPermitida(Exception):
    pass


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar_usuarios(self) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = uow.usuarios.get_all(skip=0, limit=1000)
            return [UserPublic.model_validate(u) for u in usuarios]

    def activar_usuario(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if not usuario:
                raise UsuarioNoEncontrado("Usuario no encontrado")
            usuario.disabled = False
            uow.session.add(usuario)
            uow.session.flush()
            uow.session.refresh(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar_usuario(self, usuario_id: int, admin_id: int) -> UserPublic:
        if usuario_id == admin_id:
            raise OperacionNoPermitida("No puedes desactivarte a ti mismo")
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if not usuario:
                raise UsuarioNoEncontrado("Usuario no encontrado")
            usuario.disabled = True
            uow.session.add(usuario)
            uow.session.flush()
            uow.session.refresh(usuario)
            return UserPublic.model_validate(usuario)
