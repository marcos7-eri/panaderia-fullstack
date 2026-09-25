# Pan Artesano — aplicación full stack

Proyecto académico para gestionar el catálogo, los clientes y los pedidos de una panadería. Incluye una tienda pública, carrito de compra, seguimiento de pedidos y panel administrativo protegido.

## Funcionalidades

- Portada y catálogo adaptable a computadoras y celulares.
- Búsqueda y filtro de productos por categoría.
- Carrito, registro de cliente y creación de pedidos.
- Cálculo de totales y actualización de stock en una transacción.
- Seguimiento por número de pedido y correo.
- Panel con resumen, categorías, productos, clientes y pedidos.
- Inicio de sesión administrativo con contraseña cifrada y token firmado.
- PostgreSQL persistente mediante un volumen de Docker.
- Migraciones, datos iniciales, validaciones y pruebas automatizadas.

## Tecnologías

- Frontend: React 19, Vite y TypeScript.
- Backend: Node.js 22, Express 5 y TypeScript.
- Datos: PostgreSQL 17 y Prisma ORM 5.
- Infraestructura: Docker, Docker Compose y Nginx.

## Arquitectura

```text
Navegador
   │ HTTP/JSON
   ├── Frontend React servido por Nginx :8080
   │
   └── API REST Express :3000
             │ Prisma
             └── PostgreSQL :5432
                       │
                       └── volumen panaderia_postgres_data
```

## Ejecución con Docker

Requisitos: Docker Desktop y Docker Compose.

1. Copiar `.env.example` como `.env`.
2. Cambiar `POSTGRES_PASSWORD`, `AUTH_SECRET` y `ADMIN_PASSWORD`.
3. Construir e iniciar los servicios:

```bash
docker compose up -d --build
```

4. Cargar el administrador, categorías, productos y cliente de demostración:

```bash
docker compose exec backend npm run db:seed
```

5. Comprobar el estado:

```bash
docker compose ps
curl http://localhost:3000/api/health
```

Direcciones:

- Aplicación: `http://localhost:8080`
- API: `http://localhost:3000/api`
- Salud de la API: `http://localhost:3000/api/health`

Credenciales predeterminadas de demostración:

```text
Correo: admin@panaderia.com
Contraseña: Admin123!
```

Estas credenciales se pueden cambiar en `.env`. Después debe ejecutarse nuevamente `npm run db:seed` dentro del backend.

## Persistencia del volumen

Detener y volver a iniciar los contenedores no elimina la información:

```bash
docker compose down
docker compose up -d
```

El volumen utilizado se llama `panaderia_postgres_data`. El comando `docker compose down -v` sí lo elimina y no debe utilizarse cuando se quieran conservar los datos.

## Comandos frecuentes

```bash
# Ver los servicios
docker compose ps

# Ver registros del backend
docker compose logs backend --tail=100

# Volver a construir después de modificar código
docker compose up -d --build

# Ejecutar las pruebas automatizadas
docker compose exec backend npm test

# Mostrar las tablas de PostgreSQL
docker compose exec database psql -U panaderia_user -d panaderia -c "\dt"

# Detener sin borrar información
docker compose down
```

## Desarrollo local

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend, con PostgreSQL disponible y una variable `DATABASE_URL` local:

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

Pruebas locales del backend:

```bash
cd backend
npm run test:full
```

## API REST

Las rutas marcadas como **Admin** requieren `Authorization: Bearer TOKEN`.

| Acceso | Método | Ruta | Función |
|---|---|---|---|
| Público | `GET` | `/api/health` | Comprobar la API |
| Público | `POST` | `/api/auth/login` | Iniciar sesión |
| Admin | `GET` | `/api/auth/me` | Consultar la sesión |
| Público | `GET` | `/api/categories` | Listar categorías |
| Público | `GET` | `/api/categories/:id` | Consultar una categoría |
| Admin | `POST/PUT/DELETE` | `/api/categories[/:id]` | Administrar categorías |
| Público | `GET` | `/api/products` | Listar, buscar y filtrar productos |
| Público | `GET` | `/api/products/:id` | Consultar un producto |
| Admin | `POST/PUT/DELETE` | `/api/products[/:id]` | Administrar productos |
| Público | `POST` | `/api/customers` | Registrar o actualizar un comprador |
| Admin | `GET/PUT/DELETE` | `/api/customers[/:id]` | Administrar clientes |
| Público | `POST` | `/api/orders` | Crear un pedido |
| Público | `GET` | `/api/orders/track?id=1&email=...` | Seguir un pedido |
| Admin | `GET` | `/api/orders[/:id]` | Consultar pedidos |
| Admin | `PATCH` | `/api/orders/:id/status` | Cambiar el estado |

Estados permitidos:

```text
PENDING → PREPARING → READY → DELIVERED
    └──────────────→ CANCELLED
```

## Modelo de datos

```text
Category 1 ─── N Product
Customer 1 ─── N Order
Order    1 ─── N OrderItem
Product  1 ─── N OrderItem
User            administrador
```

Los borrados de categorías, productos y clientes son lógicos: el campo `active` cambia a `false` para conservar el historial.

## Estructura

```text
backend/
  prisma/              esquema, migración y seed
  src/controllers/     lógica HTTP
  src/middleware/      autenticación y errores
  src/routes/          endpoints REST
  src/utils/           seguridad y validaciones
frontend/
  public/productos/    ilustraciones locales
  src/                 interfaz React
documentacion/
  prompts.md           registro del uso de IA
  ARQUITECTURA.md
  PRUEBAS.md
  GUIA_PRESENTACION.md
  CAPTURAS.md
docker-compose.yml
```

## Documentación académica

- [Arquitectura](documentacion/ARQUITECTURA.md)
- [Plan de pruebas](documentacion/PRUEBAS.md)
- [Guía para la presentación](documentacion/GUIA_PRESENTACION.md)
- [Lista de capturas](documentacion/CAPTURAS.md)
- [Registro de prompts](documentacion/prompts.md)
