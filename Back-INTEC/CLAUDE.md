# CLAUDE.md — Back-INTEC

## Descripcion del Proyecto

Back-INTEC es una API REST backend para un sistema de gestion empresarial (ERP interno). Maneja colaboradores, asistencias, solicitudes de materiales/herramientas, catalogos, roles, permisos y documentos de empleados. Construido con **Express.js 5** + **TypeScript** sobre **Node.js**, usando **MySQL** como base de datos principal con **TypeORM** como ORM, y **Firebase** para almacenamiento de archivos y base de datos en tiempo real.

## Arquitectura

El proyecto sigue una **Arquitectura por Capas con principios DDD** y patron **Repository/Adapter**:

```
src/
├── config/                        # Configuracion (DB, servicios externos)
├── core/
│   ├── domain/
│   │   ├── models/                # Modelos de dominio (clases puras TS)
│   │   └── repository/           # Interfaces de repositorio (contratos)
│   └── infrastructure/
│       ├── adapters/             # Implementaciones de repositorios
│       ├── entity/               # Entidades TypeORM (mapeo a BD)
│       └── rest/
│           ├── controllers/      # Controladores HTTP
│           ├── routes/           # Definicion de rutas
│           └── middlewares/      # Middlewares Express
├── middleware/                    # Middleware global (auth JWT)
├── firebase/                     # Configuracion Firebase
└── index.ts                      # Punto de entrada
```

### Flujo de datos

```
Request HTTP → Route → Controller → Adapter → TypeORM Entity → MySQL/Firebase
```

## Stack Tecnologico

- **Runtime**: Node.js con TypeScript 5.8
- **Framework**: Express.js 5.1
- **ORM**: TypeORM 0.3
- **Base de datos**: MySQL (mysql2)
- **Autenticacion**: JWT (jsonwebtoken) + bcrypt
- **Almacenamiento**: Firebase Admin SDK (Storage + Realtime DB)
- **Uploads**: Multer (5MB, memoria)
- **Compilacion**: tsc → dist/

## Convenciones de Nombres

### Base de datos / Entidades
- Columnas en snake_case: `id_user`, `name_employee`, `admission_date`
- Tablas en plural: `users`, `employees`, `roles`, `attendances`
- Prefijo `id_` para llaves primarias: `id_user`, `id_employee`
- Prefijo `p` para permisos: `pAut1`, `pCapSol`, `pAlertaContratos`

### Clases y Archivos
- PascalCase para clases de dominio: `User`, `Employee`, `Role`
- Sufijo `Entity` para TypeORM: `UserEntity`, `EmployeeEntity`
- Sufijo `Repository` para interfaces: `UserRepository`, `EmployeesRepository`
- Sufijo `AdapterRepository` para implementaciones: `UserAdapterRepository`
- Sufijo `Controller` para controladores: `UserController`
- Archivos en kebab-case o snake_case: `users.controller.ts`, `employees.route.ts`

### Metodos
- Getters/Setters: `getId()`, `setName()`, `getEmail()`
- Controladores CRUD: `create()`, `list()`, `get()`, `update()`, `remove()`

### Rutas (en español)
- `/api/usuarios`, `/api/colaboradores`, `/api/asistencias`
- `/api/herramientas-catalogo`, `/api/materiales-catalogo`
- `/api/solicitudes`, `/api/solicitud-detalles`

## Instrucciones para Agentes y Modelos de IA

### Reglas Obligatorias

1. **Respetar la arquitectura existente.** Todo codigo nuevo debe seguir el patron de capas: Domain Model → Repository Interface → Adapter → Entity → Controller → Route. No mezclar responsabilidades entre capas.

2. **Codigo limpio y buenas practicas.**
   - Aplicar principios SOLID.
   - Nombres descriptivos en ingles para clases, metodos y variables. Rutas API en español siguiendo la convencion existente.
   - No dejar codigo muerto, comentarios innecesarios ni console.log de debug.
   - Manejar errores apropiadamente con try/catch y codigos HTTP correctos.
   - No duplicar logica; reutilizar adaptadores y repositorios existentes.

3. **NO generar documentacion.** No crear archivos README, .md, ni documentacion de ningún tipo a menos que se solicite explicitamente.

4. **NO generar scripts.** No crear scripts utilitarios, scripts de migracion, scripts de seed, ni archivos de automatizacion a menos que se solicite explicitamente.

5. **Seguir las convenciones de nombres del proyecto.** Usar los sufijos, prefijos y patrones descritos arriba. No inventar nuevas convenciones.

6. **Mantener consistencia con el codigo existente.** Antes de escribir codigo nuevo, leer los archivos relacionados para entender patrones y replicarlos.

7. **No sobreingenieria.** Implementar solo lo solicitado. No agregar features extra, validaciones innecesarias, abstracciones prematuras ni configurabilidad que no se pidio.

8. **Seguridad.** No introducir vulnerabilidades (SQL injection, XSS, etc.). Usar parametros de TypeORM para queries. No exponer secretos ni credenciales.

### Patron para Nuevas Entidades

Al crear un nuevo recurso seguir este orden:

1. `src/core/domain/models/{recurso}.ts` — Modelo de dominio (clase pura con getters/setters)
2. `src/core/domain/repository/{recurso}.repository.ts` — Interfaz del repositorio
3. `src/core/infrastructure/entity/{recurso}.entity.ts` — Entidad TypeORM con decoradores
4. `src/core/infrastructure/adapters/{recurso}.adapter.ts` — Implementacion del repositorio
5. `src/core/infrastructure/rest/controllers/{recurso}.controller.ts` — Controlador HTTP
6. `src/core/infrastructure/rest/routes/{recurso}.route.ts` — Definicion de rutas
7. Registrar la entidad en `src/config/db.ts`
8. Registrar las rutas en `src/index.ts`

### Autenticacion

- JWT con Bearer Token en header `Authorization`
- Middleware en `src/middleware/auth.middleware.ts`
- Proteger todas las rutas nuevas con el middleware de auth excepto login y seed
- Contraseñas hasheadas con bcrypt (salt rounds: 10)

### Base de Datos

- MySQL como fuente principal de verdad
- TypeORM con `synchronize: true` (auto-sync de schema)
- Firebase para replicacion en tiempo real y almacenamiento de archivos
- Registrar toda entidad nueva en el array de entities de `src/config/db.ts`
