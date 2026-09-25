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
