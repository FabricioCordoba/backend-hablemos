# Testing Guide

Este documento resume el estado real de los tests del proyecto.

## Como ejecutar la suite

```bash
npm test
npm run test:watch
npm run test:cov
npm run test:e2e
```

Para correr un archivo puntual:

```bash
npm test -- auth.controller.spec
```

## Cobertura actual

La cobertura actual es mayormente unitaria. Hoy existen tests para:

- `src/auth/auth.service.spec.ts`
- `src/auth/auth.controller.spec.ts`
- `src/users/users.service.spec.ts`
- `src/users/users.controller.spec.ts`
- `src/posts/posts.service.spec.ts`
- `src/posts/posts.controller.spec.ts`
- `src/comments/comments.service.spec.ts`
- `src/comments/comments.controller.spec.ts`
- `src/app.controller.spec.ts`

## Que validan hoy

- `AuthService`: validacion de credenciales, login y register
- `AuthController`: register, login y profile
- `UsersService`: creacion, lectura puntual y borrado del propio usuario
- `UsersController`: creacion y borrado
- `PostsService`: create, update, delete, findAll, findOne y feed
- `PostsController`: delegacion correcta al servicio
- `CommentsService` y `CommentsController`: solo smoke tests de definicion

## Limitaciones actuales

- No hay cobertura fuerte del modulo `comments`
- No hay tests dedicados para guards JWT
- No hay tests de DTOs ni del filtro global de excepciones
- El e2e actual es el ejemplo base de Nest, no una bateria funcional de endpoints

## Patron recomendado para nuevos tests

```ts
describe('ExampleService', () => {
  let service: ExampleService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ExampleService,
        {
          provide: getRepositoryToken(Entity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ExampleService);
  });

  afterEach(() => jest.clearAllMocks());
});
```

## Prioridades recomendadas

1. Agregar tests reales de `CommentsService`
2. Cubrir rutas protegidas y errores de autenticacion en e2e
3. Cubrir permisos de update y delete en `users` y `comments`
4. Agregar tests del `HttpExceptionFilter`
