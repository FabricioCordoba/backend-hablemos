# Frontend Integration Guide

Guia practica para consumir este backend desde el frontend sin tener que inferir contratos desde el codigo.

## Base URL

- Desarrollo local: `http://localhost:3000`
- El puerto real sale de `PORT`, con default `3000`

## Headers

- JSON normal:

```http
Content-Type: application/json
```

- Rutas protegidas:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Auth flow

1. Registrar o loguear usuario
2. Guardar `access_token`
3. Enviar `Authorization: Bearer <token>` a rutas protegidas
4. Usar `GET /auth/profile` para hidratar la sesion actual

## Error format

Todas las excepciones HTTP pasan por el filtro global y responden con este shape:

```json
{
  "statusCode": 400,
  "timestamp": "2026-04-17T12:00:00.000Z",
  "path": "/posts/abc",
  "message": "Validation failed (numeric string is expected)"
}
```

Notas:

- `message` puede ser `string` o `string[]` cuando viene de `class-validator`
- Sin token o con token invalido normalmente vas a recibir `401`
- Errores de permisos devuelven `403`
- Recursos inexistentes devuelven `404`

## Auth endpoints

### `POST /auth/register`

Publica.

Request:

```json
{
  "email": "ana@example.com",
  "password": "123456",
  "pseudonym": "Ana"
}
```

Validaciones:

- `email` debe ser email valido
- `password` minimo 6 caracteres
- `pseudonym` requerido

Response `201`:

```json
{
  "access_token": "jwt-token"
}
```

### `POST /auth/login`

Publica.

Request:

```json
{
  "email": "ana@example.com",
  "password": "123456"
}
```

Response `201`:

```json
{
  "access_token": "jwt-token"
}
```

Errores frecuentes:

- `401`: `Invalid credentials`

### `GET /auth/profile`

Protegida.

Response `200`:

```json
{
  "id": 1,
  "email": "ana@example.com",
  "pseudonym": "Ana",
  "avatar": "avatar_1",
  "createdAt": "2026-04-17T12:00:00.000Z",
  "updatedAt": "2026-04-17T12:00:00.000Z",
  "role": "USER"
}
```

Notas:

- No incluye `password`
- `role` hoy puede ser `USER` o `ADMIN`

## Users endpoints

### `POST /users`

Publica.

Request:

```json
{
  "email": "ana@example.com",
  "password": "123456",
  "pseudonym": "Ana",
  "avatar": "avatar_2"
}
```

Response `201`:

```json
{
  "id": 1,
  "pseudonym": "Ana",
  "avatar": "avatar_2",
  "createdAt": "2026-04-17T12:00:00.000Z",
  "updatedAt": "2026-04-17T12:00:00.000Z"
}
```

Errores frecuentes:

- `400`: `Email already in use`

### `GET /users`

Publica.

Response `200`:

```json
[
  {
    "id": 1,
    "pseudonym": "Ana",
    "avatar": "avatar_2",
    "createdAt": "2026-04-17T12:00:00.000Z",
    "updatedAt": "2026-04-17T12:00:00.000Z"
  }
]
```

### `GET /users/:id`

Publica.

Response `200`:

```json
{
  "id": 1,
  "pseudonym": "Ana",
  "avatar": "avatar_2",
  "createdAt": "2026-04-17T12:00:00.000Z",
  "updatedAt": "2026-04-17T12:00:00.000Z"
}
```

### `PATCH /users/:id`

Protegida.

Permisos:

- el usuario puede actualizar su propio perfil
- un `ADMIN` puede actualizar cualquier usuario

Request:

```json
{
  "pseudonym": "Ana Dev",
  "avatar": "avatar_3"
}
```

Response `200`:

```json
{
  "id": 1,
  "pseudonym": "Ana Dev",
  "avatar": "avatar_3",
  "createdAt": "2026-04-17T12:00:00.000Z",
  "updatedAt": "2026-04-17T12:05:00.000Z"
}
```

### `DELETE /users/:id`

Protegida.

Permisos:

- el usuario puede borrarse a si mismo
- un `ADMIN` puede borrar cualquier usuario

Response `200`:

```json
{
  "message": "User deleted successfully"
}
```

## Posts endpoints

### `POST /posts`

Protegida.

Request:

```json
{
  "content": "Mi primer post"
}
```

Validaciones:

- `content` requerido
- longitud minima 1
- longitud maxima 2000

Response `201`:

```json
{
  "id": 1,
  "content": "Mi primer post",
  "createdAt": "2026-04-17T12:00:00.000Z",
  "author": {
    "id": 1,
    "pseudonym": "Ana",
    "avatar": "avatar_1"
  }
}
```

### `GET /posts?page=1&limit=10`

Publica.

Response `200`:

```json
{
  "data": [
    {
      "id": 1,
      "content": "Mi primer post",
      "createdAt": "2026-04-17T12:00:00.000Z",
      "author": {
        "id": 1,
        "pseudonym": "Ana",
        "avatar": "avatar_1"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "lastPage": 1
}
```

### `GET /posts/feed?page=1&limit=10`

Publica.

Pensado para listado liviano.

Response `200`:

```json
{
  "data": [
    {
      "id": 1,
      "content": "Mi primer post",
      "createdAt": "2026-04-17T12:00:00.000Z",
      "author": {
        "id": 1,
        "pseudonym": "Ana",
        "avatar": "avatar_1"
      },
      "commentsCount": 3
    }
  ],
  "total": 1,
  "page": 1,
  "lastPage": 1
}
```

### `GET /posts/:id`

Publica.

Response `200`:

```json
{
  "id": 1,
  "content": "Mi primer post",
  "createdAt": "2026-04-17T12:00:00.000Z",
  "author": {
    "id": 1,
    "pseudonym": "Ana",
    "avatar": "avatar_1"
  },
  "comments": [
    {
      "id": 5,
      "content": "Buen post",
      "createdAt": "2026-04-17T12:10:00.000Z",
      "author": {
        "id": 2,
        "pseudonym": "Luis",
        "avatar": "avatar_2"
      }
    }
  ]
}
```

### `PATCH /posts/:id`

Protegida.

Permiso:

- solo el autor

Request:

```json
{
  "content": "Post editado"
}
```

Response `200`:

```json
{
  "id": 1,
  "content": "Post editado",
  "createdAt": "2026-04-17T12:00:00.000Z",
  "author": {
    "id": 1,
    "pseudonym": "Ana",
    "avatar": "avatar_1"
  }
}
```

Errores frecuentes:

- `403`: `You are not the author of this post`

### `DELETE /posts/:id`

Protegida.

Permisos:

- el autor puede borrar su post
- un `ADMIN` puede borrar cualquier post

Response `200`:

```json
{
  "message": "Post deleted"
}
```

## Comments endpoints

### `POST /comments`

Protegida.

Request:

```json
{
  "content": "Buen post",
  "postId": 1
}
```

Response `201`:

```json
{
  "id": 5,
  "content": "Buen post",
  "createdAt": "2026-04-17T12:10:00.000Z",
  "updatedAt": "2026-04-17T12:10:00.000Z",
  "author": {
    "id": 2,
    "pseudonym": "Luis",
    "avatar": "avatar_2"
  }
}
```

### `GET /comments/post/:postId`

Publica.

Response `200`:

```json
[
  {
    "id": 5,
    "content": "Buen post",
    "createdAt": "2026-04-17T12:10:00.000Z",
    "updatedAt": "2026-04-17T12:10:00.000Z",
    "author": {
      "id": 2,
      "pseudonym": "Luis",
      "avatar": "avatar_2"
    }
  }
]
```

### `PATCH /comments/:id`

Protegida.

Permiso:

- solo el autor

Request:

```json
{
  "content": "Comentario editado"
}
```

Response `200`:

```json
{
  "id": 5,
  "content": "Comentario editado",
  "createdAt": "2026-04-17T12:10:00.000Z",
  "updatedAt": "2026-04-17T12:15:00.000Z",
  "author": {
    "id": 2,
    "pseudonym": "Luis",
    "avatar": "avatar_2"
  }
}
```

Errores frecuentes:

- `403`: `Not your comment`

### `DELETE /comments/:id`

Protegida.

Permisos:

- el autor puede borrar su comentario
- un `ADMIN` puede borrar cualquier comentario

Response `200`:

```json
{
  "message": "Comment deleted successfully"
}
```

## Frontend recommendations

- Guardar el token y pedir `GET /auth/profile` al boot de la app
- Tomar `401` como sesion invalida o expirada
- Tomar `403` como problema de permisos
- Usar `GET /posts/feed` para listados y `GET /posts/:id` para detalle

## Known API inconsistencies

Estas no bloquean arrancar el frontend, pero conviene tenerlas presentes:

1. `GET /auth/profile` devuelve perfil privado del usuario autenticado, mientras `users` expone perfil publico
