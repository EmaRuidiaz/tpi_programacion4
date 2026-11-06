from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar_activas(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.list_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def obtener_por_id(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            nombre_limpio = data.nombre.strip()
            if uow.categorias.get_by_nombre(nombre_limpio):
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            nueva = Categoria(
                nombre=nombre_limpio,
                descripcion=data.descripcion or "",
                activo=True,
            )
            uow.categorias.add(nueva)
            return CategoriaRead.model_validate(nueva)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            campos = data.model_dump(exclude_unset=True)
            if "nombre" in campos and campos["nombre"] is not None:
                nuevo_nombre = campos["nombre"].strip()
                existente = uow.categorias.get_by_nombre(nuevo_nombre)
                if existente and existente.id != categoria_id:
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")
                categoria.nombre = nuevo_nombre

            if "descripcion" in campos and campos["descripcion"] is not None:
                categoria.descripcion = campos["descripcion"]

            uow.session.add(categoria)
            uow.session.flush()
            uow.session.refresh(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            categoria.activo = False
            uow.session.add(categoria)
            uow.session.flush()
