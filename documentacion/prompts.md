# Registro de prompts utilizados

Este documento conserva los prompts utilizados durante el desarrollo del proyecto y el resultado producido por cada uno.

## Prompt 01 — Planificación y arquitectura

**Objetivo:** definir las tecnologías, la arquitectura, los servicios de Docker, las entidades de la base de datos y las etapas de desarrollo de una aplicación web para una panadería.

**Prompt utilizado:**

> Actúa como un desarrollador web full stack y arquitecto de software.
>
> Necesito desarrollar un proyecto académico que consiste en una página web completa para una panadería.
>
> El proyecto posteriormente deberá ejecutarse utilizando Docker, Docker Compose y volúmenes para garantizar la persistencia de los datos.
>
> Antes de escribir código, ayúdame a planificar correctamente el proyecto.
>
> La aplicación debe permitir como mínimo:
>
> - Mostrar una página de inicio de la panadería.
> - Mostrar los productos disponibles.
> - Organizar productos por categorías.
> - Mostrar nombre, descripción, precio e imagen de cada producto.
> - Registrar y administrar productos.
> - Registrar clientes.
> - Crear pedidos.
> - Consultar los pedidos realizados.
> - Tener un panel básico de administración.
>
> El proyecto debe incluir:
>
> - Frontend.
> - Backend.
> - Base de datos.
> - API REST.
> - Dockerfile.
> - Docker Compose.
> - Volúmenes de Docker para persistencia de datos.
> - Variables de entorno.
> - Repositorio Git.
> - README con documentación para instalar y ejecutar el proyecto.
>
> Quiero que el proyecto sea adecuado para estudiantes universitarios, por lo que debe tener una arquitectura clara y no ser innecesariamente complejo.
>
> En esta primera etapa NO generes todo el código.
>
> Primero indícame:
>
> 1. Qué tecnologías recomiendas utilizar.
> 2. La arquitectura general del sistema.
> 3. Qué servicios tendremos en Docker.
> 4. Cómo se comunicarán frontend, backend y base de datos.
> 5. Qué información debería almacenar la base de datos.
> 6. Qué funcionalidades tendrá el sistema.
> 7. Una estructura inicial de carpetas.
> 8. Las etapas en las que deberíamos desarrollar el proyecto.
>
> Explica cada decisión de manera sencilla porque posteriormente tendremos que documentar y defender el proyecto.

**Resultado:** se eligió React + Vite + TypeScript para el frontend, Node.js + Express + TypeScript para el backend, Prisma como ORM, PostgreSQL para la base de datos y Docker Compose para la ejecución.

**Evidencia sugerida:** captura de la conversación de planificación.

## Prompt 02 — Preparación del proyecto

**Objetivo:** crear la estructura inicial, comprobar herramientas, configurar las aplicaciones y preparar Docker sin implementar todavía el CRUD.

**Prompt utilizado:**

> Actúa como desarrollador full stack. Prepara la estructura inicial de un proyecto web para una panadería utilizando React, Vite y TypeScript en el frontend; Node.js, Express y TypeScript en el backend; Prisma como ORM; PostgreSQL como base de datos; y Docker Compose para ejecutar los servicios. Antes de implementar funcionalidades, revisa la carpeta del proyecto, comprueba las herramientas instaladas, crea una estructura organizada, configura Git y crea un archivo para registrar todos los prompts utilizados. No desarrolles todavía el CRUD ni el diseño completo.

**Resultado:** se prepararon frontend, backend, archivos de Docker, variables de entorno de ejemplo y este registro de prompts.

**Evidencia sugerida:** captura del árbol de carpetas y de las versiones de Node.js, npm, Git, Docker y Docker Compose.

## Prompt 03 — Diseño de la base de datos

**Objetivo:** definir el modelo relacional de la panadería y preparar su creación reproducible en PostgreSQL.

**Prompt utilizado:**

> Actúa como diseñador de bases de datos y desarrollador backend. Diseña la base de datos PostgreSQL de la aplicación de panadería utilizando Prisma ORM. Incluye administradores, categorías, productos, clientes, pedidos y detalles de pedido. Define claves primarias, claves foráneas, restricciones, estados de pedido, precios decimales, stock y fechas de auditoría. Crea el archivo `schema.prisma`, una migración inicial versionada y un script de datos de prueba con categorías y productos. La estructura debe ser clara, normalizada y apropiada para un proyecto universitario. Explica las relaciones y no implementes todavía los controladores CRUD.

**Resultado:** se crearon seis modelos (`User`, `Category`, `Product`, `Customer`, `Order` y `OrderItem`), enumeraciones para roles y estados, relaciones e índices, una migración inicial y datos de prueba reutilizables.

**Evidencia sugerida:** captura de `schema.prisma`, del resultado de `npx prisma validate` y de las tablas ejecutándose en PostgreSQL.

### Prompt 03.1 — Corrección de Prisma en Docker

**Objetivo:** diagnosticar y corregir el reinicio continuo del backend durante la ejecución de las migraciones.

**Prompt utilizado:**

> El contenedor del backend se reinicia. Los registros indican que Prisma no puede detectar OpenSSL y muestran el error `Could not parse schema engine response`. La base de datos PostgreSQL está saludable, pero todavía no contiene relaciones. Diagnostica la causa y corrige la configuración de Docker sin eliminar el volumen de datos.

**Resultado:** se sustituyó la imagen Alpine del backend por `node:22-bookworm-slim` y se instalaron explícitamente OpenSSL y los certificados necesarios en las etapas de compilación y ejecución.

**Evidencia sugerida:** captura de los registros anteriores al cambio y del backend saludable después de reconstruir la imagen.

## Prompt 04 — API REST de categorías y productos

**Objetivo:** implementar las primeras operaciones CRUD del backend utilizando Express, TypeScript y Prisma.

**Prompt utilizado:**

> Actúa como desarrollador backend. Implementa una API REST con Express, TypeScript y Prisma para administrar categorías y productos de la panadería. Organiza el código mediante rutas, controladores, configuración, validaciones y middleware de errores. Incluye operaciones para listar, consultar, crear, actualizar y desactivar categorías y productos. Permite filtrar productos por categoría y buscarlos por nombre, descripción o código SKU. Valida identificadores, campos obligatorios, precios positivos, stock no negativo y categorías activas. Utiliza desactivación lógica al eliminar para conservar la información histórica. Documenta los endpoints y no desarrolles todavía clientes ni pedidos.

**Resultado:** se implementaron diez endpoints REST, validación de datos, respuestas HTTP apropiadas, búsqueda y filtros, control de duplicados y desactivación lógica de registros.

**Evidencia sugerida:** capturas de las respuestas JSON de `GET /api/categories`, `GET /api/products` y de la creación de un producto mediante Postman, Insomnia o la terminal.

