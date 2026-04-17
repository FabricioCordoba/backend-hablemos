# Hablemos Backend

Backend de Hablemos construido con NestJS, TypeORM y MySQL.

## Stack

- NestJS 11
- TypeORM 0.3
- MySQL
- JWT para autenticacion
- Jest para tests unitarios y e2e basicos

## Modulos principales

- `auth`: registro, login, perfil autenticado y borrado de usuario autenticado/admin
- `users`: CRUD basico de usuarios
- `posts`: CRUD de publicaciones, listado paginado y feed
- `comments`: CRUD de comentarios por post
- `common`: filtro global HTTP, decorador `@User()` y logger
- `config`: carga y validacion de variables de entorno

## Requisitos

- Node.js 20+
- MySQL disponible
- Archivo de entorno con las variables requeridas

## Variables de entorno

La app carga `.env.<NODE_ENV>` y falla al iniciar si faltan estas variables:

- `DB_HOST`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Variables opcionales:

- `PORT` con default `3000`
- `DB_PORT` con default `3306`
- `NODE_ENV` con default `development`

## Puesta en marcha

```bash
npm install
npm run start:dev
```

Build y ejecucion:

```bash
npm run build
npm run start:prod
```

## Scripts utiles

```bash
npm run lint
npm test
npm run test:cov
npm run test:e2e
```

## Estado actual de calidad

- La suite unitaria queda en verde con el codigo actual.
- Hay cobertura real sobre `AuthService`, `AuthController`, `UsersService`, `UsersController`, `PostsService` y `PostsController`.
- `CommentsService` y `CommentsController` tienen cobertura minima, asi que ese modulo sigue siendo el punto mas flojo en testing.
- Existe un test e2e base de Nest, pero no una cobertura integral de endpoints.

## Notas de implementacion

- `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`
- `HttpExceptionFilter` global para respuestas consistentes
- `synchronize` de TypeORM se desactiva en produccion
- El feed de posts expone `commentsCount`

## Proximos pasos recomendados

1. Agregar tests unitarios reales para `CommentsService`
2. Sumar e2e de autenticacion y rutas protegidas
3. Documentar endpoints con Swagger
4. Revisar permisos de actualizacion y eliminacion en controladores publicos
