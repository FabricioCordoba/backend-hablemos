# Improvements Log

Este archivo deja registro de mejoras relevantes hechas sobre la base original y del estado actual despues de la correccion de abril de 2026.

## Mejoras confirmadas en el codigo

- JWT configurado desde variables de entorno
- Validacion de variables requeridas al iniciar
- `ValidationPipe` global con saneamiento de payloads
- `LoggerService` centralizado en `common`
- Campos `updatedAt` agregados en entidades
- Longitud de `Post.content` alineada con el DTO
- Ruta `GET /posts/feed` protegida frente al conflicto con `GET /posts/:id`

## Ajustes hechos en esta revision

- Se reordeno `PostsController` para que `feed` no compita con la ruta parametrica
- Se corrigieron specs desfasados por cambios en el controlador de auth
- Se alineo el mock de `LoggerService` con la inyeccion real del servicio
- Se reescribio la documentacion para reflejar el estado efectivo del repo

## Estado real hoy

- Suite unitaria: verde
- Build: validado en esta revision
- Cobertura fuerte: `auth`, `users`, `posts`
- Cobertura debil: `comments`
- E2E: solo base scaffold

## Deuda visible

1. Completar tests de `CommentsService` y `CommentsController`
2. Agregar e2e de login, perfil y rutas protegidas
3. Documentar endpoints y contratos de respuesta
4. Revisar configuracion de `NODE_ENV` en la capa de config para evitar lecturas inconsistentes

## Criterio para mantener este archivo util

- Registrar solo mejoras verificadas
- Evitar afirmar "production-ready" sin evidencia automatizada
- Actualizar este documento cada vez que cambie el estado de tests, build o riesgos conocidos
