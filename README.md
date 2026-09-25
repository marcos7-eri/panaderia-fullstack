# Panadería Full Stack

Proyecto académico de una aplicación web para administrar productos, clientes y pedidos de una panadería.

## Tecnologías

- React, Vite y TypeScript
- Node.js, Express y TypeScript
- Prisma ORM y PostgreSQL
- Docker y Docker Compose

## Estructura

```text
frontend/        Interfaz web
backend/         API REST
documentacion/   Registro de prompts y evidencias
docker-compose.yml
```

## Desarrollo local

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

## Docker

1. Copiar `.env.example` como `.env`.
2. Cambiar la contraseña de ejemplo.
3. Ejecutar:

```bash
docker compose up --build
```

La interfaz estará disponible en `http://localhost:8080` y la API en `http://localhost:3000/api/health`.

El volumen `panaderia_postgres_data` conserva los datos de PostgreSQL aunque los contenedores se detengan.

## Modelo de datos

La base de datos contiene:

- `User`: administradores del sistema.
- `Category`: categorías de productos.
- `Product`: catálogo, precios y existencias.
- `Customer`: información de clientes.
- `Order`: cabecera, total y estado de cada pedido.
- `OrderItem`: productos, cantidades y precios de cada pedido.

Relaciones principales:

```text
Category 1 ─── N Product
Customer 1 ─── N Order
Order    1 ─── N OrderItem
Product  1 ─── N OrderItem
```

Para cargar los productos de ejemplo después de iniciar PostgreSQL:

```bash
docker compose exec backend npm run db:seed
```

## API REST

La URL base del backend es `http://localhost:3000/api`.

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/categories` | Listar categorías activas |
| `GET` | `/categories/:id` | Consultar una categoría y sus productos |
| `POST` | `/categories` | Crear una categoría |
| `PUT` | `/categories/:id` | Actualizar una categoría |
| `DELETE` | `/categories/:id` | Desactivar una categoría |
| `GET` | `/products` | Listar productos activos |
| `GET` | `/products/:id` | Consultar un producto |
| `POST` | `/products` | Crear un producto |
| `PUT` | `/products/:id` | Actualizar un producto |
| `DELETE` | `/products/:id` | Desactivar un producto |

Filtros disponibles:

```text
GET /api/products?categoryId=1
GET /api/products?search=chocolate
GET /api/products?includeInactive=true
GET /api/categories?includeInactive=true
```

Ejemplo para crear un producto:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"PAN-002","name":"Pan integral","price":3.5,"stock":30,"categoryId":1}'
```
