# Plan de pruebas

## Pruebas automáticas

```bash
docker compose exec backend npm test
```

Se verifican:

- Cifrado y comprobación de contraseñas.
- Creación y validación de tokens.
- Rechazo de tokens manipulados.
- Validación de identificadores, precios, stock y correos.

## Pruebas funcionales

| Caso | Procedimiento | Resultado esperado |
|---|---|---|
| Catálogo | Abrir Productos | Se muestran los productos activos |
| Filtro | Elegir una categoría | Solo aparecen productos de esa categoría |
| Carrito | Agregar y cambiar cantidades | El total se actualiza |
| Pedido | Completar datos y confirmar | Se muestra un número de pedido |
| Stock | Comparar existencias antes y después | El stock disminuye según la cantidad |
| Seguimiento | Consultar número y correo | Se muestra el estado y detalle |
| Login inválido | Usar una contraseña incorrecta | La API rechaza el acceso |
| Login válido | Usar las credenciales configuradas | Se abre el panel |
| Estado | Avanzar un pedido | Cambia siguiendo el flujo permitido |
| Cancelación | Cancelar un pedido activo | El stock se repone |
| Persistencia | Ejecutar `down` y luego `up -d` | Los datos siguen disponibles |

## Verificación técnica

```bash
docker compose ps
curl http://localhost:3000/api/health
docker compose exec database psql -U panaderia_user -d panaderia -c "\dt"
```

Los tres servicios deben aparecer saludables y PostgreSQL debe mostrar las tablas del modelo y `_prisma_migrations`.

