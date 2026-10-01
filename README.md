# biblioteca-api

API REST construida con Node.js, Express 5, TypeScript y MongoDB.
Arquitectura por capas (rutas → controlador → servicio → repositorio).

## Instalación

```bash
npm install
cp .env.example .env   # ajusta MONGO_URI
```

## Ejecución

```bash
npm run dev            # desarrollo con recarga
npm run build && npm start   # producción
```

## Endpoints del módulo demo

Base URL: `http://localhost:3000/api/v1/demo`

| Método | Ruta   | Descripción                  |
| ------ | ------ | ---------------------------- |
| POST   | /      | Crea un registro             |
| GET    | /      | Lista todos los registros    |
| GET    | /:id   | Obtiene un registro por id   |
| PUT    | /:id   | Actualiza un registro        |
| DELETE | /:id   | Elimina un registro          |

Health check: `GET /health`
