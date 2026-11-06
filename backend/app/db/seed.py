from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import get_password_hash
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

CATEGORIAS_INICIALES = [
    {
        "nombre": "Hamburguesas",
        "descripcion": "Hamburguesas artesanales de carne vacuna 100% seleccionada con pan brioche.",
    },
    {
        "nombre": "Pizzas",
        "descripcion": "Pizzas a la piedra con masa madre de fermentación lenta y muzzarella de primera calidad.",
    },
    {
        "nombre": "Empanadas",
        "descripcion": "Empanadas caseras horneadas con rellenos tradicionales y especiales.",
    },
    {
        "nombre": "Bebidas",
        "descripcion": "Gaseosas, aguas saborizadas y limonadas caseras bien frías.",
    },
]

PRODUCTOS_INICIALES = [
    {
        "categoria": "Hamburguesas",
        "nombre": "Burger Clásica Cheddar",
        "descripcion": "Doble medallón smash, cuádruple cheddar, cebolla crispy y salsa especial en pan de papa.",
        "precio_base": 8500.0,
        "imagen_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "stock": 25,
        "disponible": True,
    },
    {
        "categoria": "Hamburguesas",
        "nombre": "Burger Bacon BBQ",
        "descripcion": "Medallón de 180g, panceta ahumada crocante, cheddar, aros de cebolla y barbacoa casera.",
        "precio_base": 9200.0,
        "imagen_url": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80",
        "stock": 20,
        "disponible": True,
    },
    {
        "categoria": "Hamburguesas",
        "nombre": "Burger Americana Deluxe",
        "descripcion": "Doble carne, lechuga capuchina, tomate fresco, pepinillos, cheddar y aderezo mil islas.",
        "precio_base": 8900.0,
        "imagen_url": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
        "stock": 18,
        "disponible": True,
    },
    {
        "categoria": "Pizzas",
        "nombre": "Pizza Muzzarella Clásica",
        "descripcion": "Salsa de tomates italianos, abundante muzzarella, orégano y aceitunas verdes (8 porciones).",
        "precio_base": 10500.0,
        "imagen_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        "stock": 15,
        "disponible": True,
    },
    {
        "categoria": "Pizzas",
        "nombre": "Pizza Napolitana con Ajo",
        "descripcion": "Muzzarella, rodajas de tomate fresco, ajo picado, perejil y aceite de oliva extra virgen.",
        "precio_base": 11800.0,
        "imagen_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "stock": 12,
        "disponible": True,
    },
    {
        "categoria": "Pizzas",
        "nombre": "Pizza Fugazzeta Rellena",
        "descripcion": "Masa rellena con muzzarella y jamón natural, cubierta de cebolla blanca y provolone gratinado.",
        "precio_base": 13500.0,
        "imagen_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
        "stock": 10,
        "disponible": True,
    },
    {
        "categoria": "Empanadas",
        "nombre": "Docena de Empanadas Criollas",
        "descripcion": "12 empanadas de carne cortada a cuchillo, huevo duro, verdeo y aceitunas.",
        "precio_base": 14000.0,
        "imagen_url": "https://images.unsplash.com/photo-1604908554025-aaa87c152c7b?auto=format&fit=crop&w=800&q=80",
        "stock": 20,
        "disponible": True,
    },
    {
        "categoria": "Empanadas",
        "nombre": "Media Docena Jamón y Queso",
        "descripcion": "6 empanadas horneadas rellenas con abundante muzzarella y jamón cocido natural.",
        "precio_base": 7500.0,
        "imagen_url": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "stock": 30,
        "disponible": True,
    },
    {
        "categoria": "Bebidas",
        "nombre": "Limonada con Menta y Jengibre 1L",
        "descripcion": "Limonada exprimida en el momento con hojas de menta fresca, jengibre y almíbar suave.",
        "precio_base": 4200.0,
        "imagen_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "stock": 40,
        "disponible": True,
    },
    {
        "categoria": "Bebidas",
        "nombre": "Gaseosa Línea Cola 1.5L",
        "descripcion": "Botella familiar de 1.5 litros bien fría ideal para compartir.",
        "precio_base": 3800.0,
        "imagen_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
        "stock": 50,
        "disponible": True,
    },
]


def run_seed() -> None:
    create_all_tables()
    with session_factory() as session:
        admin = session.exec(select(Usuario).where(Usuario.username == "admin")).first()
        if not admin:
            admin = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=get_password_hash("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
            session.flush()
            print("Usuario admin creado (admin / Admin1234!)")
        else:
            print("Usuario admin ya existe")

        mapa_categorias: dict[str, int] = {}
        for cat_data in CATEGORIAS_INICIALES:
            cat = session.exec(
                select(Categoria).where(Categoria.nombre == cat_data["nombre"])
            ).first()
            if not cat:
                cat = Categoria(
                    nombre=cat_data["nombre"],
                    descripcion=cat_data["descripcion"],
                    activo=True,
                )
                session.add(cat)
                session.flush()
                session.refresh(cat)
            if cat.id is not None:
                mapa_categorias[cat.nombre] = cat.id

        creados = 0
        for prod_data in PRODUCTOS_INICIALES:
            existente = session.exec(
                select(Producto).where(Producto.nombre == prod_data["nombre"])
            ).first()
            if not existente:
                cat_id = mapa_categorias.get(str(prod_data["categoria"]))
                if cat_id is not None:
                    nuevo = Producto(
                        categoria_id=cat_id,
                        nombre=str(prod_data["nombre"]),
                        descripcion=str(prod_data["descripcion"]),
                        precio_base=float(prod_data["precio_base"]),
                        imagen_url=str(prod_data["imagen_url"]),
                        stock=int(prod_data["stock"]),
                        disponible=bool(prod_data["disponible"]),
                        activo=True,
                    )
                    session.add(nuevo)
                    creados += 1

        session.commit()
        print(f"Seed completado: {len(mapa_categorias)} categorías y {creados} productos nuevos.")


if __name__ == "__main__":
    run_seed()
