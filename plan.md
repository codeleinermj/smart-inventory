# 🚀 Smart Inventory: Sistema de Gestión con Predicción de Stock

Este proyecto es una solución de nivel empresarial que integra el desarrollo backend tradicional con Inteligencia Artificial para transformar la gestión de inventarios de un modelo reactivo a uno **proactivo**.

## 📊 1. Stack Tecnológico (The Tech Stack)

Como PM, hemos seleccionado este stack buscando el equilibrio entre rendimiento y mantenibilidad.

| Componente | Tecnología | Razón Técnica |
| :--- | :--- | :--- |
| **Backend API** | **Node.js + Express** | Estándar de la industria, flexibilidad y ecosistema maduro. |
| **ML Engine** | **Python + FastAPI** | Líder en ciencia de datos; FastAPI ofrece comunicación asíncrona de alta velocidad. |
| **Lenguaje** | **TypeScript** | Tipado fuerte para reducir errores en tiempo de ejecución. |
| **Validación** | **Zod** | Esquemas de validación estrictos y contratos de datos seguros. |
| **Base de Datos** | **PostgreSQL** | Integridad referencial y robustez para datos financieros. |
| **ORM** | **Drizzle ORM** | Ligero, Type-safe y con integración nativa para Zod. |
| **Caché/Broker** | **Redis** | Gestión de colas de tareas y caché de predicciones costosas. |
| **Infraestructura** | **Docker & Compose** | Orquestación de servicios y replicabilidad de entorno. |
| **Frontend** | **Next.js + Tremor** | Dashboard profesional optimizado para visualización de datos. |

---

## 🏗️ 2. Arquitectura y Patrones de Diseño

El sistema se rige por una **Arquitectura de Capas (Layered Architecture)** para garantizar el desacoplamiento total.

### Capas del Backend (Node.js)
1.  **Capa de Controladores:** Gestión de entrada/salida (Request/Response) y validación vía **Zod**.
2.  **Capa de Servicios:** Lógica de negocio (reglas de inventario, cálculos de stock).
3.  **Capa de Repositorios:** Abstracción de la DB mediante el **Repository Pattern**.
4.  **Capa de Adaptadores:** Comunicación externa con el servicio de Python y Redis (**Adapter Pattern**).

### Patrones de Diseño Implementados
* **Singleton:** Garantiza una única conexión a PostgreSQL y Redis.
* **Strategy Pattern:** Permite alternar algoritmos de cálculo (Simple vs. Machine Learning).
* **DTO (Data Transfer Object):** Uso de Zod para asegurar que los datos entre capas sean válidos.

---

## 📅 3. Hoja de Ruta (Roadmap)

### Fase 1: Análisis y Modelado (Semana 1)
- Diseño del esquema Entidad-Relación (ERD).
- Definición de contratos de datos (Zod Schemas).
- Setup inicial de la arquitectura de capas en Express.

### Fase 2: Backend Core & Persistencia (Semana 2)
- Implementación del CRUD de Productos y Ventas.
- Configuración de Drizzle ORM y migraciones automáticas.
- Dockerización inicial (Node + Postgres).

### Fase 3: Motor de Predicción ML (Semana 3)
- Desarrollo del microservicio en Python con FastAPI.
- Implementación del modelo de series temporales (**Prophet** o **Scikit-learn**).
- Comunicación inter-servicio vía REST/HTTP.

### Fase 4: Lógica Proactiva (Semana 4)
- Configuración de **Cron Jobs** para recalcular predicciones.
- Sistema de alertas inteligente: "Días restantes de stock".
- Integración de Redis para acelerar la respuesta del Dashboard.

### Fase 5: Frontend & QA (Semana 5)
- Creación del Dashboard con Next.js y Tremor.
- Pruebas de integración y unitarias (Vitest/Pytest).
- Documentación final en Swagger/OpenAPI.

---

## ⚖️ 4. Evaluación del PM (Pros y Contras)

### ✅ Pros
* **Escalabilidad:** El motor de IA no bloquea la API principal.
* **Mantenibilidad:** El uso de Drizzle + Zod elimina errores de inconsistencia de datos.
* **High Impact:** Demuestra dominio de múltiples lenguajes y arquitecturas distribuidas.

### ❌ Contras
* **Complejidad Inicial:** Configurar Docker para múltiples lenguajes requiere tiempo.
* **Overhead:** La arquitectura de capas implica escribir más código inicial (Boilerplate).