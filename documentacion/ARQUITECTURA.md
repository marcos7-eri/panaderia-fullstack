# Arquitectura del sistema

## Objetivo

Separar presentación, reglas de negocio y persistencia para que el proyecto sea sencillo de explicar, probar y mantener.

## Componentes

1. **Frontend:** aplicación React escrita con TypeScript. Consume la API mediante HTTP y nunca se conecta directamente con PostgreSQL.
2. **Backend:** API REST con Express. Valida la información, controla permisos, calcula pedidos y utiliza Prisma.
3. **Base de datos:** PostgreSQL almacena usuarios, categorías, productos, clientes y pedidos.
4. **Nginx:** sirve los archivos compilados del frontend.
5. **Docker Compose:** inicia y conecta los tres servicios en una red interna.

## Flujo de un pedido

```text
Cliente agrega productos al carrito
              ↓
Frontend registra o actualiza al cliente
              ↓
Frontend envía productos y cantidades a la API
              ↓
Backend consulta precios y existencias en PostgreSQL
              ↓
Transacción: crea pedido + detalles + descuenta stock
              ↓
La API devuelve número, estado y total del pedido
```

El frontend no envía un total confiable. El backend toma los precios almacenados y calcula el importe para evitar manipulaciones.

## Seguridad

- Las contraseñas se almacenan mediante `scrypt` con una sal aleatoria.
- El panel utiliza tokens firmados con HMAC y una duración de ocho horas.
- Las operaciones administrativas requieren un token válido.
- `.env` está excluido de Git; `.env.example` solo contiene valores de muestra.
- Las consultas se realizan mediante Prisma, evitando concatenar SQL recibido del usuario.

## Persistencia

PostgreSQL escribe en el volumen `panaderia_postgres_data`. Los contenedores son reemplazables, mientras que el volumen mantiene la información. Las migraciones de Prisma se ejecutan al iniciar el backend.

