# PRD — Smart Inventory: Sistema de Gestión con Predicción de Stock

**Versión:** 1.0  
**Fecha:** 2026-04-14  
**Estado:** Fases 1–4 implementadas

---

## 1. Visión del producto

Smart Inventory transforma la gestión de inventario de un modelo **reactivo** (el operador descubre el problema cuando el stock ya se agotó) a uno **proactivo** (el sistema calcula cuántos días de stock quedan y cuándo hay que reordenar).

El sistema combina tres servicios independientes que se comunican entre sí:

1. **API REST** — fuente de verdad para productos, stock y usuarios.
2. **Motor de predicción ML** — calcula tendencias de consumo y días de reabastecimiento.
3. **Frontend web** — interfaz de usuario para operadores y administradores.

---

## 2. Objetivos y métricas de éxito

| Objetivo | Métrica |
|---|---|
| Eliminar roturas de stock por descuido | Alertas de estado visibles (critical / low / normal / excess) |
| Dar visibilidad del consumo | `days_until_reorder` calculado por el motor ML |
| Permitir gestión sin conocimiento técnico | UI web con CRUD completo y validaciones |
| Garantizar seguridad de datos | Auth con JWT HttpOnly, roles admin/viewer, Zod en todos los boundaries |
| Correr en cualquier entorno | Docker Compose con cuatro servicios orquestados |

---

## 3. Usuarios y roles

| Rol | Permisos |
|---|---|
| `admin` | Leer y escribir: crear/editar/eliminar productos, registrar movimientos de stock |
| `viewer` | Solo lectura: ver productos, stock y predicciones |

---

## 4. Stack tecnológico

| Componente | Tecnología | Razón |
|---|---|---|
| API REST | Node.js 20 + Express 4 + TypeScript 5 | Ecosistema maduro, tipado fuerte end-to-end |
| ORM | Drizzle ORM 0.45 | Ligero, type-safe, integración nativa con Zod |
| Validación | Zod 3 | Esquemas compartidos entre API y frontend via `shared-types` |
| Auth | JWT (jsonwebtoken 9) + bcrypt | Estándar, stateless, sin dependencia de sesiones en servidor |
| Logger | Pino 9 + pino-http | Logging JSON estructurado de alto rendimiento |
| Base de datos | PostgreSQL 16 | ACID, integridad referencial, índices parciales |
| Caché / Broker | Redis 7 | Declarado en infra, disponible para caché de predicciones y colas |
| Motor ML | Python 3.12 + FastAPI 0.x | Líder en data science, async nativo con uvicorn |
| ML validation | Pydantic v2 | Integrado en FastAPI, tipado estricto de contratos |
| Frontend | Next.js 15 (App Router) + React 18 | SSR/SSG, BFF nativo via Route Handlers |
| Estilos | Tailwind CSS v4 (CSS-first config) | Utility-first, tokens CSS en globals.css |
| Animaciones | Framer Motion 12 + GSAP 3 | Framer para transiciones de componentes, GSAP para animaciones imperativos complejas |
| 3D | Three.js 0.183 (vanilla, sin r3f) | Escena 3D en login — r3f incompatible con Next.js 15 app-pages-browser layer |
| Formularios | React Hook Form 7 + Zod resolver | Performance, validación client-side con los mismos schemas del servidor |
| Data fetching | TanStack Query 5 | Cache, loading/error states, invalidación automática |
| Monorepo | pnpm workspaces 9 | Hoisting eficiente, workspace protocol para deps internas |
| CI/CD | GitHub Actions | Tests, typecheck, lint, docker build en cada PR/push a main |
| Containerización | Docker + Docker Compose | Orquestación local y producción consistente |
| Observabilidad | Sentry (opcional, ambos servicios) | Error tracking en Node y Python |

---

## 5. Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────┐
│                    Browser / Usuario                     │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│            Next.js Web App  :3000                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │  App Router (pages + layouts)                   │    │
│  │  ├── /login         → LoginPage                 │    │
│  │  ├── /dashboard     → DashboardPage             │    │
│  │  └── /products      → ProductsPage / Detail     │    │
│  └──────────────────────────┬──────────────────────┘    │
│  ┌───────────────────────────▼──────────────────────┐   │
│  │  BFF — Route Handlers (Next.js API routes)       │   │
│  │  ├── POST /api/auth/login   → proxy → API        │   │
│  │  ├── POST /api/auth/logout  → borra cookie       │   │
│  │  ├── GET  /api/auth/me      → proxy → API        │   │
│  │  ├── GET/POST/PATCH/DELETE /api/products/...     │   │
│  │  └── POST /api/ml/predict   → proxy → ML         │   │
│  └──────────────────────┬───────────────────────────┘   │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTP interno
          ┌───────────────┴──────────────────┐
          │                                  │
┌─────────▼──────────┐           ┌───────────▼───────────┐
│   Express API :3001 │           │  FastAPI ML :8000      │
│                    │           │                        │
│  Routes            │           │  POST /predict         │
│  ├── POST /auth/login          │  GET  /health          │
│  ├── POST /auth/logout         │                        │
│  ├── GET  /auth/me             │  Algoritmo:            │
│  ├── GET    /products          │  · Calcula avg_daily   │
│  ├── GET    /products/:id      │    _usage desde        │
│  ├── POST   /products          │    movimientos         │
│  ├── PATCH  /products/:id      │  · Status: critical /  │
│  ├── DELETE /products/:id      │    low / normal /      │
│  ├── GET    /products/:id/     │    excess              │
│  │         movements           │  · days_until_reorder  │
│  └── POST   /products/:id/     │  · recommended_qty     │
│            movements           │  · confidence score    │
│                    │           └───────────────────────┘
│  Middleware chain  │
│  auth JWT          │
│  validate Zod      │
│  error handler     │
└─────────┬──────────┘
          │
┌─────────▼──────────┐     ┌────────────────────┐
│  PostgreSQL :5432   │     │   Redis :6379       │
│  (host: 5433)       │     │   (disponible para  │
│                    │     │    caché/colas)      │
│  Tables:           │     └────────────────────┘
│  · users           │
│  · products        │
│  · stock_movements │
└────────────────────┘
```

---

## 6. Esquema de base de datos

### `users`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `email` | TEXT NOT NULL | Único (índice único) |
| `password_hash` | TEXT NOT NULL | bcrypt, rounds configurables |
| `role` | ENUM(`admin`,`viewer`) | Default `viewer` |
| `created_at` | TIMESTAMPTZ | Default NOW() |
| `updated_at` | TIMESTAMPTZ | Default NOW() |

### `products`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `sku` | TEXT NOT NULL | Único entre activos (índice parcial WHERE deleted_at IS NULL) |
| `name` | TEXT NOT NULL | |
| `description` | TEXT | Nullable |
| `price` | NUMERIC(12,2) NOT NULL | |
| `stock` | INTEGER NOT NULL | Default 0 |
| `min_stock` | INTEGER NOT NULL | Umbral de alerta, default 0 |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |
| `deleted_at` | TIMESTAMPTZ | NULL = activo; soft delete |

> El índice parcial en `sku` permite reutilizar SKUs de productos eliminados sin violar unicidad.

### `stock_movements`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID PK | |
| `product_id` | UUID NOT NULL | FK a products (sin ON DELETE CASCADE — intencional) |
| `type` | TEXT NOT NULL | CHECK: `'in'` \| `'out'` \| `'adjustment'` |
| `quantity` | INTEGER NOT NULL | |
| `reason` | TEXT | Nullable |
| `user_id` | UUID | Nullable — quién registró el movimiento |
| `created_at` | TIMESTAMPTZ | |

---

## 7. Contratos de API

### Auth

```
POST /auth/login
Body: { email: string, password: string }
Response 200: { token: string, user: { id, email, role } }
Response 401: { error: { code: "INVALID_CREDENTIALS", message: string } }

POST /auth/logout
Response 200: {}

GET /auth/me
Header: Authorization: Bearer <token>
Response 200: { id, email, role, createdAt }
Response 401: sin token o token inválido
```

### Products

```
GET /products?search=&page=&limit=&sortBy=&sortDir=
Header: Authorization: Bearer <token>  (cualquier rol)
Response 200: { data: Product[], total: number, page: number, limit: number }

GET /products/:id
Header: Authorization (cualquier rol)
Response 200: Product
Response 404: not found

POST /products
Header: Authorization (solo admin)
Body: { sku, name, description?, price, stock?, minStock? }
Response 201: Product

PATCH /products/:id
Header: Authorization (solo admin)
Body: Partial<{ name, description, price, stock, minStock }>
Response 200: Product

DELETE /products/:id
Header: Authorization (solo admin)
Response 204: (soft delete — setea deleted_at)

GET /products/:id/movements
Header: Authorization (cualquier rol)
Response 200: StockMovement[]

POST /products/:id/movements
Header: Authorization (solo admin)
Body: { type: 'in'|'out'|'adjustment', quantity: number, reason?: string }
Response 201: StockMovement
```

### ML

```
POST /predict
Body: {
  product_id: string,
  current_stock: number,        // >= 0
  min_stock: number,            // >= 0
  avg_daily_usage?: number,     // >= 0, opcional
  recent_movements: Movement[]  // historial reciente
}
Response 200: {
  product_id: string,
  status: "critical" | "low" | "normal" | "excess",
  days_until_reorder: number | null,
  recommended_reorder_qty: number,
  avg_daily_usage: number,
  confidence: number            // 0.0 – 0.95
}

GET /health
Response 200: { status: "ok", service: "ml" }
```

### Algoritmo de predicción (ML)

1. Si `avg_daily_usage` no se provee, se calcula desde `recent_movements`:
   - Con ≥3 movimientos `type=out`: total salidas / rango de días.
   - Fallback: `max(current_stock, 1) / 30`.
2. `days_until_reorder = (current_stock - min_stock) / avg_daily_usage`
3. `recommended_reorder_qty = ceil(avg_daily_usage * 30)`
4. Status por comparación de `current_stock` vs `min_stock`:
   - `critical`: stock ≤ 0
   - `low`: stock ≤ min_stock
   - `normal`: stock ≤ min_stock × 2
   - `excess`: stock > min_stock × 2
5. `confidence = min(0.95, 0.4 + n_out_movements * 0.055)` — crece con el historial de datos.

---

## 8. Frontend — páginas y flujo

### Rutas

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | Redirect a `/login` o `/dashboard` | Público → redirect |
| `/login` | LoginPage + LoginForm + LoginHero | No autenticado |
| `/dashboard` | DashboardPage | Autenticado |
| `/products` | ProductsPage (lista con filtros) | Autenticado |
| `/products/new` | ProductForm | Admin |
| `/products/[id]` | ProductDetail + movimientos | Autenticado |

### Protección de rutas

`apps/web/middleware.ts` intercepta todas las rutas y redirige:
- No autenticado en `/dashboard` o `/products` → `/login`
- Autenticado en `/login` → `/dashboard`

La cookie JWT HttpOnly es seteada por el BFF en `/api/auth/login` y borrada en `/api/auth/logout`. El frontend (React) nunca accede al token directamente.

### Design system

Tokens CSS en `globals.css` (Tailwind v4 CSS-first):

| Token | Valor |
|---|---|
| `--color-bg` | `#0a0a0f` (casi negro) |
| `--color-brand` | `#7c5cff` (violeta) |
| `--color-accent` | `#00e5c7` (teal) |
| `--color-danger` | `#ff4d6d` |
| `--color-fg` | `#f3f4f8` |

Componentes UI reutilizables: `Button` (framer-motion, variantes primary/secondary/ghost/danger), `Input`, `Field`, `Card`.

### Login page — detalles técnicos

- **Hero izquierdo (desktop):** Tres orbs de gradiente animados con GSAP `matchMedia`, títulos con slide-in escalonado. Respeta `prefers-reduced-motion`.
- **Escena 3D:** `warehouse-scene-3d.tsx` — vanilla Three.js (sin react-three-fiber — incompatible con Next.js 15). Cuatro cajas isométricas con:
  - Geometría con bevel procedural (vertex displacement en BoxGeometry).
  - Texturas de cartón procedurales (canvas texture con fibras horizontales).
  - Shipping labels 512×256 con header, SKU, código de barras.
  - Iluminación: ambient + directional + dos fill lights de color.
  - Mouse repel: las cajas se alejan del cursor.
  - Entrada con ease cubic y respiración idle.
- **Font display:** Michroma (Google Fonts) para títulos; Inter para body.

---

## 9. Hoja de ruta — planeado vs implementado

### Fase 1 — Scaffold y estructura (implementado ✅)

**Planeado:** Diseño ERD, contratos Zod, setup arquitectura Express.  
**Implementado:**
- Monorepo pnpm con workspaces (api, web, ml, shared-types).
- Docker Compose con postgres + redis + api + ml.
- `shared-types` con schemas Zod para auth y productos.
- Estructura de carpetas: controllers / services / repositories / adapters / middleware.
- CI básico (GitHub Actions).
- Tests verdes iniciales.

**Commit:** `chore: scaffold inicial (Phase 1 — monorepo + Docker + tests verde)`

---

### Fase 2 — Backend core y persistencia (implementado ✅)

**Planeado:** CRUD de Productos y Ventas, Drizzle ORM, migraciones, Dockerización.  
**Implementado:**
- Drizzle ORM con esquema completo: `users`, `products`, `stock_movements`.
- Migraciones automáticas via `drizzle-kit`.
- CRUD completo de productos (`GET /products`, `GET /:id`, `POST`, `PATCH`, `DELETE`).
- Soft delete en productos con índice parcial en SKU.
- Auth JWT: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.
- Middleware `auth` (verifica JWT) + `requireRole` (admin-only).
- Validación Zod en todos los endpoints via middleware `validate`.
- Scripts: `db:migrate`, `db:seed`, `db:generate`.
- Logger Pino con JSON estructurado.
- Sentry en Node.js (opcional por DSN).
- Tests de integración con Supertest.

**Commits:** `feat(api): Phase 2 — products CRUD + JWT auth + Drizzle 0.44.7`  
`ci: postgres service container + db:migrate before tests`

---

### Fase 3 — Motor ML y Frontend (implementado ✅)

**Planeado:** Microservicio Python/FastAPI, modelo de series temporales, comunicación inter-servicio.  
**Implementado (ML):**
- FastAPI con `POST /predict` y `GET /health`.
- Algoritmo de predicción estadístico (sin Prophet/Sklearn en esta iteración — suficiente para MVP).
- Pydantic v2 para validación de contratos.
- Logger JSON con `python-json-logger`.
- Sentry Python (opcional).
- Dockerfile con imagen Python slim.
- Tests Pytest.
- Ruff para linting.

**Implementado (Web):**
- Next.js 15 App Router con layout autenticado.
- BFF via Route Handlers: proxy transparente hacia API + ML.
- Middleware de protección de rutas con cookie JWT.
- Páginas: login, dashboard, products (lista + detalle + nuevo).
- Design system: tokens CSS, Button, Input, Field, Card.
- TanStack Query para data fetching con cache e invalidación.
- React Hook Form + Zod para formularios.
- Login page: hero GSAP + escena 3D Three.js + font Michroma.
- Animaciones: Framer Motion en transiciones de página y formularios.
- Tailwind CSS v4 CSS-first.

**Commits:** `feat(web): Phase 3 — BFF + products CRUD UI + modern animated theme`  
`fix(docker): instalar deps de shared-types en imagen api`

---

### Fase 4 — Búsqueda, filtros, movimientos y predicción integrada (implementado ✅)

**Planeado:** Cron jobs, alertas inteligentes, integración Redis para caché de dashboard.  
**Implementado:**
- Búsqueda de productos (`?search=`), paginación (`?page=&limit=`), ordenamiento (`?sortBy=&sortDir=`).
- Endpoint de movimientos de stock (GET + POST con validación de tipo `in/out/adjustment`).
- Repositorio y servicio de movimientos.
- Dashboard con métricas de stock.
- Integración del endpoint `/predict` del servicio ML desde el BFF web.
- `seed-products.ts` — 100 productos de demo.

**Commit:** `feat(p4): búsqueda/filtros/paginación, dashboard, movimientos de stock y predicción ML`

---

### Fase 5 — Pendiente

**Planeado:** QA completo, tests de integración end-to-end, documentación Swagger/OpenAPI.  
**Estado:** Parcialmente cubierto por CI actual. Pendiente:
- Swagger / OpenAPI spec en la API Express.
- Tests E2E (Playwright o Cypress).
- Cron jobs para recalcular predicciones automáticamente.
- Caché Redis para respuestas del dashboard.
- Roles en la UI (deshabilitar acciones de escritura si `role === viewer`).

---

## 10. Decisiones técnicas relevantes

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| Vanilla Three.js en login | react-three-fiber (r3f) | r3f v8 usa `react-reconciler@0.27.0` que requiere `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED` — no disponible en Next.js 15 `app-pages-browser` layer. Crash fatal en runtime. |
| Tailwind CSS v4 CSS-first | Tailwind v3 con tailwind.config.js | v4 permite definir tokens directamente en CSS, sin JS config. Mejor DX para design tokens. |
| Drizzle ORM | Prisma | Más ligero, type-safe nativo con PostgreSQL, integración directa con Zod schemas. |
| BFF via Route Handlers | Llamadas directas del browser a la API | Mantiene el JWT en cookie HttpOnly (browser nunca ve el token), simplifica CORS, centraliza auth. |
| Algoritmo estadístico en ML | Prophet / Scikit-learn | Para el MVP, el promedio de consumo + buffer es suficientemente preciso. Sin dependencias pesadas de ML. Fácil de reemplazar en Fase 5. |
| Puerto 5433 para Postgres (host) | 5432 | Evita conflictos con instancias locales de Postgres ya corriendo en 5432. |
| Soft delete con índice parcial | Hard delete | Preserva historial de movimientos. El índice parcial `WHERE deleted_at IS NULL` permite reutilizar SKUs. |
| Zod en shared-types (package separado) | Duplicar schemas | Fuente única de verdad para contratos entre API y frontend. Compila con `module: NodeNext`. |

---

## 11. Próximos pasos sugeridos

1. **Swagger/OpenAPI** — agregar `swagger-ui-express` + `zod-to-openapi` para documentación interactiva de la API.
2. **Roles en UI** — deshabilitar botones de edición/eliminación si `user.role === 'viewer'`.
3. **Cron job de predicciones** — job que corre cada noche, llama `/predict` para todos los productos con stock bajo, persiste el resultado, envía alertas.
4. **Caché Redis** — cachear respuestas del dashboard con TTL de 5 minutos para reducir carga en DB.
5. **Tests E2E** — Playwright cubriendo el flujo login → ver productos → registrar movimiento.
6. **Docker para web** — Dockerfile para la app Next.js para deploy consistente.
7. **Modelo ML más sofisticado** — integrar Prophet o Scikit-learn LinearRegression cuando haya suficiente historial de movimientos.
