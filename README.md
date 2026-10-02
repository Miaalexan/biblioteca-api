# Biblioteca API

API REST para la gestión de una biblioteca: **autores**, **libros** y **préstamos**.
Proyecto de la asignatura Programación III.

## Tecnologías

- Node.js + Express 5
- TypeScript
- MongoDB (driver oficial)

## Arquitectura

Cada módulo sigue una arquitectura por capas:

```
routes → controller → service → repository → MongoDB
```

- **routes:** define las URLs.
- **controller:** recibe la petición y devuelve la respuesta HTTP.
- **service:** validaciones y reglas de negocio.
- **repository:** acceso a la base de datos.
- **model:** tipos de datos.

```
src/
├── api/v1/            # registro de rutas
├── config/            # variables de entorno y conexión a MongoDB
├── modules/
│   ├── authors/
│   ├── books/
│   └── loans/
└── shared/            # errores y middlewares (errorHandler, asyncHandler)
```

## Requisitos

- Node.js 20 o superior
- Una base de datos MongoDB (local o MongoDB Atlas)

## Instalación y ejecución

```bash
# 1. Clonar el repositorio e instalar dependencias
git clone https://github.com/Miaalexan/biblioteca-api.git
cd biblioteca-api
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env y coloca tu cadena de conexión de MongoDB

# 3. Ejecutar en desarrollo
npm run dev

# 4. Compilar y ejecutar en producción
npm run build
npm start
```

La API queda disponible en `http://localhost:3000/api/v1`.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `MONGO_URI` | Cadena de conexión de MongoDB | `mongodb://localhost:27017` |
| `MONGO_DB_NAME` | Nombre de la base de datos | `biblioteca` |

## Modelos

**Author:** `name`, `nationality`, `birthYear` (opcional), `createdAt`, `updatedAt`

**Book:** `title`, `isbn` (único), `authorId`, `year` (opcional), `available` (por defecto `true`), `createdAt`, `updatedAt`

**Loan:** `bookId`, `userName`, `loanDate`, `returnDate` (opcional), `returned` (por defecto `false`), `createdAt`, `updatedAt`

## Endpoints

Base: `/api/v1`

| Método | Ruta | Descripción | Código |
|---|---|---|---|
| POST | `/authors` | Crear un autor | 201 |
| GET | `/authors` | Listar autores | 200 |
| GET | `/authors/:id` | Consultar un autor | 200 |
| PUT | `/authors/:id` | Actualizar un autor | 200 |
| DELETE | `/authors/:id` | Eliminar un autor | 204 |
| POST | `/books` | Crear un libro | 201 |
| GET | `/books` | Listar libros | 200 |
| GET | `/books/:id` | Consultar un libro | 200 |
| PUT | `/books/:id` | Actualizar un libro | 200 |
| DELETE | `/books/:id` | Eliminar un libro | 204 |
| POST | `/loans` | Registrar un préstamo | 201 |
| GET | `/loans` | Listar préstamos | 200 |
| GET | `/loans/:id` | Consultar un préstamo | 200 |
| PUT | `/loans/:id` | Actualizar / devolver un préstamo | 200 |
| DELETE | `/loans/:id` | Eliminar un préstamo | 204 |

Errores: `400` (datos inválidos), `404` (no encontrado), `500` (error interno).
Formato de error: `{ "status": "error", "message": "..." }`.

## Ejemplos (curl)

```bash
# Crear un autor
curl -X POST http://localhost:3000/api/v1/authors \
  -H "Content-Type: application/json" \
  -d '{"name":"Gabriel García Márquez","nationality":"Colombiana","birthYear":1927}'

# Crear un libro (usa el _id del autor)
curl -X POST http://localhost:3000/api/v1/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Cien años de soledad","isbn":"978-0307474728","authorId":"<ID_AUTOR>","year":1967}'

# Registrar un préstamo (usa el _id del libro)
curl -X POST http://localhost:3000/api/v1/loans \
  -H "Content-Type: application/json" \
  -d '{"bookId":"<ID_LIBRO>","userName":"Oscar","loanDate":"2026-10-01"}'

# Devolver un préstamo
curl -X PUT http://localhost:3000/api/v1/loans/<ID_PRESTAMO> \
  -H "Content-Type: application/json" \
  -d '{"returned":true}'

# Listar libros
curl http://localhost:3000/api/v1/books
```

Health check: `GET /health`

## Pruebas (colección de Postman)

ejecuta las peticiones en orden:
**Autores → Libros → Préstamos → Limpieza**.

Las peticiones de creación guardan automáticamente los ids (`authorId`, `bookId`, `loanId`)
en variables de la colección, por lo que no hace falta copiarlos a mano. Las peticiones
marcadas como `ERROR` deben fallar: demuestran las validaciones.

## Validaciones y relaciones

- Campos obligatorios no vacíos, tipos correctos e ids de MongoDB válidos.
- No se puede crear un libro con un `authorId` inexistente.
- No se puede crear un préstamo con un `bookId` inexistente.
- El `isbn` de los libros es único.

## Reglas de negocio

- **Autores:** no se puede eliminar un autor que tenga libros asociados.
- **Libros:** al registrar un préstamo, el libro debe estar disponible (`available: true`);
  al prestarlo pasa a `available: false`.
- **Préstamos:** al marcar `returned: true` se asigna `returnDate` y el libro vuelve a
  `available: true`.

Decisiones adicionales: no se puede cambiar el libro de un préstamo, no se puede reabrir un
préstamo devuelto, `returnDate` no puede ser anterior a `loanDate`, y al eliminar un préstamo
activo el libro queda disponible nuevamente.

## Autor

Mia Camacho