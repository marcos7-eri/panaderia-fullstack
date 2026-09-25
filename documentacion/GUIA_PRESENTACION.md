# Guía breve para presentar el proyecto

## Recorrido recomendado

1. Mostrar la portada y explicar que React es el frontend.
2. Abrir el catálogo, utilizar búsqueda y filtros y agregar productos.
3. Completar el carrito y crear un pedido.
4. Consultar el pedido con su número y correo.
5. Iniciar sesión como administrador.
6. Mostrar el resumen y crear o editar un producto.
7. Avanzar el pedido de pendiente a preparación.
8. Enseñar `docker compose ps` y las tablas de PostgreSQL.
9. Detener y volver a iniciar Docker para demostrar la persistencia.
10. Mostrar `documentacion/prompts.md` como evidencia del uso de IA.

## Conceptos para defender

- **API REST:** contrato HTTP mediante el cual React y Express intercambian JSON.
- **ORM:** Prisma transforma operaciones TypeScript en consultas para PostgreSQL.
- **Migración:** archivo versionado que reproduce la estructura de la base de datos.
- **Transacción:** conjunto de cambios que se confirma completo o se deshace completo.
- **Volumen:** almacenamiento independiente del ciclo de vida del contenedor.
- **Hash de contraseña:** representación irreversible utilizada para no guardar contraseñas en texto plano.
- **Desactivación lógica:** conserva los registros históricos aunque ya no aparezcan públicamente.

## Pregunta probable: ¿cómo se utilizó IA?

La IA ayudó a planificar la arquitectura, generar una primera implementación, diagnosticar errores de Docker, proponer validaciones, crear pruebas y preparar documentación. Cada solicitud y resultado relevante quedó registrado en `documentacion/prompts.md`; el equipo verificó el código mediante compilación, pruebas y ejecución con Docker.

