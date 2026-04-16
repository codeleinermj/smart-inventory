# Smart Inventory

<p align="center">
  <img src="docs/screenshots/login.png" width="32%" alt="Login" />
  <img src="docs/screenshots/02-dashboard.png" width="32%" alt="Dashboard" />
  <img src="docs/screenshots/products.png" width="32%" alt="Productos" />
</p>

## Objetivo del proyecto

Smart Inventory es una plataforma de gestión de inventario diseñada para pequeñas y medianas empresas que necesitan controlar su stock en tiempo real sin depender de hojas de cálculo o software costoso.

### Qué problema soluciona

Las empresas pierden dinero de dos formas opuestas: **sobrestock** (capital inmovilizado, productos vencidos o sin rotación) y **quiebre de stock** (ventas perdidas, clientes insatisfechos). Hoy ese equilibrio se maneja manualmente — alguien revisa planillas, hace estimaciones a ojo y pide de más "por las dudas".

Smart Inventory soluciona esto con tres pilares:

1. **Visibilidad en tiempo real** — panel centralizado con estado de stock, alertas de mínimos y valor total del inventario, accesible desde cualquier dispositivo.
2. **Predicción de demanda con ML** — el sistema analiza el histórico de movimientos y predice cuándo un producto va a llegar a su mínimo, adelantándose al quiebre antes de que ocurra.
3. **Control de acceso por roles** — los administradores gestionan productos y ven predicciones; los operadores registran movimientos sin poder alterar la configuración base.

### A quién está dirigido

Negocios con inventario físico: distribuidoras, comercios, depósitos, laboratorios o cualquier operación donde el stock sea un activo crítico.

---

Sistema de gestión de inventario con predicción de stock basada en ML. Monorepo con tres servicios: API REST (Node.js), servicio ML (Python/FastAPI) y frontend web (Next.js).

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 20.x |
| pnpm | 9.x |
| Python | 3.12 |
| Docker + Docker Compose | cualquier versión reciente |
| Git | cualquier |

---

## Setup inicial (primera vez)

### 1. Clonar y configurar variables de entorno

```bash
git clone <repo-url>
cd sistema_de_gestion
cp .env.example .env
```

Editar `.env` y completar al menos:

```env
JWT_SECRET=<genera con: openssl rand -base64 32>
ADMIN_EMAIL=admin@tuempresa.com
ADMIN_PASSWORD=TuPasswordSegura123!
```

### 2. Levantar la base de datos e infraestructura

```bash
docker compose up postgres redis -d
```

Postgres queda en `localhost:5433` (no 5432 — puerto remapeado para evitar conflictos).  
Redis queda en `localhost:6379`.

### 3. Instalar dependencias Node.js

```bash
pnpm install
```

### 4. Correr migraciones y seed inicial

```bash
# Crea las tablas en la DB
pnpm --filter api db:migrate

# Crea el usuario admin (usa ADMIN_EMAIL y ADMIN_PASSWORD del .env)
ADMIN_EMAIL=admin@tuempresa.com ADMIN_PASSWORD=TuPassword123! pnpm --filter api db:seed

# Opcional: cargar 100 productos de demo
DATABASE_URL=postgresql://smart_inv:smart_inv@localhost:5433/smart_inv \
  npx tsx apps/api/src/scripts/seed-products.ts
```

### 5. Configurar el servicio ML (Python)

```bash
cd apps/ml
python -m venv .venv

# Linux/Mac
source .venv/bin/activate

# Windows (Git Bash)
source .venv/Scripts/activate

pip install -e ".[dev]"
cd ../..
```

---

## Desarrollo local (hot-reload)

Abrir tres terminales:

```bash
# Terminal 1 — API Node.js (puerto 3001)
pnpm --filter api dev

# Terminal 2 — ML service Python (puerto 8000)
cd apps/ml && uvicorn app.main:app --reload

# Terminal 3 — Web Next.js (puerto 3000)
pnpm --filter web dev
```

Acceder a:
- **Web:** http://localhost:3000
- **API:** http://localhost:3001
- **ML:** http://localhost:8000
- **API health:** http://localhost:3001/health
- **ML health:** http://localhost:8000/health

---

## Alternativa: Docker Compose completo

Levanta los cuatro servicios (postgres + redis + api + ml) en contenedores:

```bash
docker compose up --build
```

> La web no tiene Dockerfile aún — correrla localmente con `pnpm --filter web dev`.

---

## Scripts de referencia

### Raíz del monorepo

```bash
pnpm install            # instalar todas las deps de todos los workspaces
```

### API (`apps/api`)

```bash
pnpm --filter api dev            # servidor con hot-reload (tsx watch)
pnpm --filter api build          # compilar TypeScript → dist/
pnpm --filter api start          # correr build compilado
pnpm --filter api test           # tests con Vitest
pnpm --filter api test:watch     # tests en modo watch
pnpm --filter api typecheck      # tsc --noEmit
pnpm --filter api lint           # eslint
pnpm --filter api db:generate    # generar SQL de migración (drizzle-kit)
pnpm --filter api db:migrate     # aplicar migraciones a la DB
pnpm --filter api db:seed        # crear usuario admin
```

### Web (`apps/web`)

```bash
pnpm --filter web dev       # Next.js dev server (puerto 3000)
pnpm --filter web build     # build de producción
pnpm --filter web start     # servidor de producción
pnpm --filter web typecheck # tsc --noEmit
pnpm --filter web lint      # eslint (next lint)
```

### ML (`apps/ml`)

```bash
pytest                              # tests
uvicorn app.main:app --reload       # dev server (desde apps/ml con venv activo)
ruff check .                        # linter Python
```

---

## Variables de entorno

Todas en `.env` en la raíz. El `.env.example` tiene la plantilla completa.

| Variable | Requerida | Descripción |
|---|---|---|
| `NODE_ENV` | No | `development` / `production` / `test` |
| `LOG_LEVEL` | No | `debug` / `info` / `warn` / `error` |
| `POSTGRES_USER` | Sí | Usuario PostgreSQL (default: `smart_inv`) |
| `POSTGRES_PASSWORD` | Sí | Password PostgreSQL (default: `smart_inv`) |
| `POSTGRES_DB` | Sí | Nombre de la DB (default: `smart_inv`) |
| `DATABASE_URL` | Sí | Connection string completa para la API |
| `REDIS_URL` | No | URL de Redis (default: `redis://localhost:6379`) |
| `ML_SERVICE_URL` | No | URL del servicio ML (default: `http://localhost:8000`) |
| `JWT_SECRET` | **Sí** | Clave para firmar JWTs — mínimo 32 chars |
| `ADMIN_EMAIL` | Para seed | Email del admin inicial |
| `ADMIN_PASSWORD` | Para seed | Password del admin inicial |
| `SENTRY_DSN` | No | DSN de Sentry para observabilidad (dejar vacío para deshabilitar) |

---

## Estructura del monorepo

```
sistema_de_gestion/
├── apps/
│   ├── api/                  # Express API (Node.js + TypeScript)
│   │   ├── src/
│   │   │   ├── adapters/     # DB (Drizzle), logger (Pino), Sentry
│   │   │   ├── config/       # Validación de env vars con Zod
│   │   │   ├── controllers/  # HTTP handlers (auth, products, movements)
│   │   │   ├── db/schema/    # Esquema Drizzle (users, products, movements)
│   │   │   ├── lib/          # JWT, bcrypt, errores tipados
│   │   │   ├── middleware/   # auth JWT, validación Zod, error handler, health
│   │   │   ├── repositories/ # Acceso a DB (users, products, movements)
│   │   │   ├── routes/       # Express routers (auth, products)
│   │   │   ├── scripts/      # migrate, seed, seed-products
│   │   │   ├── services/     # Lógica de negocio (auth, products, movements)
│   │   │   ├── app.ts        # Express app factory
│   │   │   └── server.ts     # Punto de entrada
│   │   ├── drizzle/          # Archivos SQL de migraciones generados
│   │   ├── tests/            # Tests de integración (Vitest + Supertest)
│   │   └── Dockerfile
│   │
│   ├── ml/                   # Servicio de predicción (Python + FastAPI)
│   │   ├── app/
│   │   │   └── main.py       # FastAPI app con /health y /predict
│   │   ├── tests/
│   │   │   └── test_health.py
│   │   ├── pyproject.toml    # Deps: fastapi, uvicorn, pydantic, ruff, pytest
│   │   └── Dockerfile
│   │
│   └── web/                  # Frontend (Next.js 15 + React 18)
│       ├── app/              # App Router
│       │   ├── api/          # BFF (Backend For Frontend) — Route Handlers
│       │   │   ├── auth/     # login, logout, me
│       │   │   ├── products/ # CRUD + movements
│       │   │   └── ml/       # predict proxy
│       │   ├── dashboard/    # página del dashboard
│       │   ├── login/        # página de login
│       │   └── products/     # lista, detalle, nuevo
│       ├── components/
│       │   ├── ui/           # Button, Input, Field, Card (design system)
│       │   ├── login-hero.tsx         # Hero con GSAP (orbs animados)
│       │   ├── warehouse-scene-3d.tsx # Escena 3D con Three.js (cajas)
│       │   ├── navbar.tsx
│       │   ├── product-form.tsx
│       │   └── page-transition.tsx
│       ├── lib/
│       │   ├── client/       # React Query hooks (useLogin, useProducts, etc.)
│       │   └── cn.ts         # clsx helper
│       └── middleware.ts     # Auth redirect (protege /dashboard, /products)
│
├── packages/
│   └── shared-types/         # Zod schemas compartidos (api ↔ web)
│       └── src/
│           ├── auth.ts       # loginRequestSchema, loginResponseSchema
│           ├── products.ts   # createProductSchema, updateProductSchema, etc.
│           └── index.ts      # re-exports
│
├── docker/
│   └── postgres/init.sql     # Inicialización de la DB en Docker
├── docker-compose.yml        # Orquestación: postgres, redis, api, ml
├── .env.example              # Plantilla de variables de entorno
├── .github/workflows/ci.yml  # CI: lint, typecheck, tests Node + Python, docker build
├── plan.md                   # PRD y roadmap original del proyecto
├── pnpm-workspace.yaml
└── package.json              # Scripts raíz
```

---

## Arquitectura de capas (API)

```
HTTP Request
    ↓
Router (Express)
    ↓
Middleware (auth JWT → validate Zod)
    ↓
Controller (extrae req, llama service, envía res)
    ↓
Service (lógica de negocio, orquesta repos)
    ↓
Repository (queries Drizzle → PostgreSQL)
```

El servicio ML se consume desde la API o directamente desde el BFF web vía HTTP.

---

## Credenciales de desarrollo

Tras correr el seed:

| Campo | Valor |
|---|---|
| Email | el que pusiste en `ADMIN_EMAIL` |
| Password | el que pusiste en `ADMIN_PASSWORD` |
| Rol | `admin` (acceso total) |

Para crear un viewer: insertar usuario directamente en la DB con `role = 'viewer'`.

---

## CI/CD

GitHub Actions en `.github/workflows/ci.yml`. Se ejecuta en todo PR y push a `main`:

| Job | Qué hace |
|---|---|
| `lint-node` | ESLint en `apps/api` |
| `typecheck-node` | `tsc --noEmit` en api y web |
| `test-node` | Vitest con Postgres real (service container) + migraciones |
| `lint-python` | Ruff en `apps/ml` |
| `test-python` | Pytest en `apps/ml` |
| `docker-build-check` | Verifica que ambas imágenes Docker buildean sin errores |

---

## Convenciones

- **TypeScript strict** en toda la codebase Node.js.
- **Zod** para validación en boundaries de sistema (HTTP body/query, env vars). No validar internamente.
- **Repository pattern**: los services nunca tocan Drizzle directamente.
- **Soft delete** en productos: `deleted_at IS NULL` — los SKUs de productos eliminados pueden reutilizarse.
- **Roles**: `admin` puede escribir, `viewer` solo lectura.
- **JWT en cookie HttpOnly**: el BFF web setea/lee la cookie; el frontend nunca toca el token directamente.
- **Commits**: `feat`, `fix`, `chore`, `ci`, `docs` + scope entre paréntesis. Ej: `feat(api): agregar endpoint de movimientos`.
