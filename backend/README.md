# SIS Electrónico - Backend

Sistema web para la gestión de productos electrónicos.

## Tecnologías
- Node.js + Express
- PostgreSQL
- JWT + bcrypt
- pdfkit/Puppeteer

## Configuración
1. Instala dependencias: `npm install`
2. Configura `.env` con tus credenciales.
3. Ejecuta el script SQL de `db/init.sql` en tu base de datos PostgreSQL.

## Estructura
- `/routes`: Rutas API
- `/controllers`: Lógica de negocio
- `/services`: Acceso a datos
- `/middlewares`: Seguridad y validaciones
- `/models`: Modelos de datos

## Endpoints principales
- POST /api/auth/login
- GET /api/auth/me
- CRUD /api/products
- CRUD /api/clients
- POST /api/sales
- GET /api/sales/:id/receipt
- GET /api/reports/income
- GET /api/reports/monthly
- GET /api/reports/low-stock
- CRUD /api/users
- GET /api/dashboard/summary
