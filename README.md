# Food Store — Sistema de Pedidos de Comida

Trabajo Práctico Integrador — **Programación 4** (Tecnicatura Universitaria en Programación a Distancia - UTN).

Aplicación web completa para la gestión de pedidos de un local gastronómico con arquitectura en capas + Unit of Work en el backend (**FastAPI + SQLModel**) y arquitectura por features en el frontend (**React 19 + TypeScript + Tailwind CSS + TanStack Query/Form/Table + Zustand**).

---

## Enlaces de Entrega

- **Repositorio GitHub**: https://github.com/EmaRuidiaz/tpi_programacion4.git
- **Video de demostración**: `https://youtu.be/enlace-del-video` *(reemplazar con el link público del video)*

---

## Requisitos Previos

- **Python**: 3.11 a 3.13
- **Node.js**: 20.19 o superior
- **pnpm**: 9 o superior (`npm install -g pnpm`)
- **Base de datos**: PostgreSQL 15+ (para desarrollo local se incluye configuración directa con SQLite en `.env.example`)

---

## Variables de Entorno

### Backend (`backend/.env`)

Copiar el archivo `backend/.env.example` a `backend/.env`:

| Variable | Descripción | Valor por defecto / ejemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | Cadena de conexión a la base de datos | `sqlite:///./foodstore.db` o `postgresql://user:pass@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave secreta para firmar JWT (mín. 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo de firma JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Minutos de validez de la sesión y cookie HttpOnly | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS con credenciales | `http://localhost:5173` |

### Frontend (`frontend/.env`)

Copiar el archivo `frontend/.env.example` a `frontend/.env`:

| Variable | Descripción | Valor por defecto / ejemplo |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL base de la API REST del backend | `http://localhost:8000/api/v1` |

---

## Instalación y Ejecución del Backend

1. Abrir una terminal y ubicarse en la carpeta `backend`:
   ```bash
   cd backend
   ```

2. (Opcional) Crear y activar un entorno virtual:
   ```bash
   python -m venv venv
   # En Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # En Linux / macOS:
   source venv/bin/activate
   ```

3. Instalar las dependencias fijadas:
   ```bash
   pip install -r requirements.txt
   ```

4. Configurar el archivo `.env` a partir de `.env.example`:
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env
   # Linux / macOS
   cp .env.example .env
   ```

5. Ejecutar el **seed** inicial (idempotente: crea las tablas, el usuario `admin`, 4 categorías y 10 productos con stock):
   ```bash
   python -m app.db.seed
   ```

6. Iniciar el servidor de desarrollo:
   ```bash
   uvicorn app.main:app --reload
   ```

- **API Base URL**: `http://localhost:8000/api/v1`
- **Documentación Swagger UI**: `http://localhost:8000/docs`
- **Documentación ReDoc**: `http://localhost:8000/redoc`

---

## Instalación y Ejecución del Frontend

1. Abrir otra terminal y ubicarse en la carpeta `frontend`:
   ```bash
   cd frontend
   ```

2. Configurar el archivo `.env` a partir de `.env.example`:
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env
   # Linux / macOS
   cp .env.example .env
   ```

3. Instalar dependencias con `pnpm`:
   ```bash
   pnpm install
   ```

4. Verificar tipos y compilación de producción:
   ```bash
   pnpm build
   ```

5. Iniciar el servidor de desarrollo de Vite:
   ```bash
   pnpm dev
   ```

- **Aplicación Web**: `http://localhost:5173`

---

## Usuario Administrador del Seed

El comando `python -m app.db.seed` crea de forma idempotente el usuario administrador:

- **Usuario (`username`)**: `admin`
- **Contraseña (`password`)**: `Admin1234!`
- **Rol**: `admin`
- **Email**: `admin@foodstore.com`

Los clientes pueden registrarse desde la pantalla pública `/register` (se crean con rol `user`).

---

## Estructura del Proyecto

```text
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/          # config, database, security, deps, unit_of_work, base_repository
│   │   ├── modules/       # auth, usuarios, categorias, productos, pedidos
│   │   └── db/seed.py     # Carga inicial idempotente
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── shared/        # api (axios, handleApiError, queryClient), ui, components, layout
│   │   ├── features/      # auth, categorias, productos, usuarios, pedidos
│   │   ├── store/         # authStore y cartStore (Zustand + persist)
│   │   └── routes/        # AppRouter y ProtectedRoute
│   ├── .env.example
│   └── package.json
└── README.md
```
