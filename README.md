# ElectroTech - Sistema de Gestión Electrónica 🔌⚡

Sistema completo de gestión para tiendas de electrónicos con Docker.

## 🚀 Inicio Rápido con Docker

### Prerrequisitos
- Docker 20.0+
- Docker Compose 2.0+

### Levantar el sistema completo
```bash
# Clonar el repositorio
git clone <repository-url>
cd sis-electronico

# Levantar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### 📡 Servicios Disponibles

| Servicio | URL | Puerto | Descripción |
|----------|-----|--------|-------------|
| **Frontend** | http://localhost:3000 | 3000 | Interfaz web de usuario |
| **Backend API** | http://localhost:4000 | 4000 | API REST del sistema |
| **PostgreSQL** | localhost:5432 | 5432 | Base de datos |

### 🔐 Credenciales por defecto
- **Usuario:** `admin`
- **Contraseña:** `admin123`

## 🛠️ Comandos Docker Útiles

```bash
# Detener todos los servicios
docker-compose down

# Reconstruir imágenes
docker-compose build

# Ver estado de contenedores
docker-compose ps

# Acceder a logs específicos
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Reiniciar un servicio específico
docker-compose restart backend

# Ejecutar comandos en contenedores
docker-compose exec backend npm run dev
docker-compose exec postgres psql -U postgres -d sis_electronico
```

## 🏗️ Estructura del Proyecto

```
sis-electronico/
├── backend/                 # API Node.js + Express
│   ├── Dockerfile
│   ├── package.json
│   ├── models/
│   ├── routes/
│   └── controllers/
├── frontend/                # Frontend HTML/CSS/JS
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── pages/
│   └── assets/
├── docker-compose.yml       # Orquestación de servicios
└── init-db.sql             # Inicialización de BD
```

## 🎯 Módulos del Sistema

- **👤 Login/Autenticación** - JWT token based
- **📊 Dashboard** - KPIs y gráficos con Chart.js
- **📦 Inventario** - CRUD de productos con control de stock
- **👥 Clientes** - Gestión de clientes y historial
- **💰 Ventas** - Sistema de ventas con carrito
- **📈 Reportes** - Exportación PDF/Excel
- **🔍 Consulta Rápida** - Búsqueda universal

## 🔧 Desarrollo

### Backend (Node.js + Express + PostgreSQL)
```bash
cd backend
npm install
npm run dev  # modo desarrollo con nodemon
```

### Frontend (HTML5 + Bootstrap + Vanilla JS)
```bash
cd frontend
# Servir con cualquier servidor web estático
python -m http.server 3000
# o
npx serve -s . -l 3000
```

## 🐳 Producción con Docker

El sistema está completamente dockerizado para facilitar el despliegue:

- **PostgreSQL 15** con datos inicializados automáticamente
- **Backend** con Node.js 18 y reinicio automático
- **Frontend** servido con Nginx Alpine optimizado
- **Health checks** para monitoreo de servicios
- **Volúmenes persistentes** para datos de BD
- **Red interna** para comunicación entre servicios

## 🛡️ Seguridad

- Autenticación JWT
- Validación de datos en backend
- Headers de seguridad en Nginx
- Variables de entorno para secrets
- SSL/TLS listo para producción

## 📝 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Autenticación |
| GET | `/api/dashboard/summary` | Datos del dashboard |
| GET/POST/PUT/DELETE | `/api/products` | CRUD productos |
| GET/POST/PUT/DELETE | `/api/clients` | CRUD clientes |
| GET/POST | `/api/sales` | Gestión de ventas |
| GET | `/api/reports/*` | Reportes PDF/Excel |
| GET | `/api/consulta` | Búsqueda universal |

---

**ElectroTech** - Desarrollado con ❤️ para la gestión moderna de tiendas electrónicas.
1. Configura la base de datos PostgreSQL y ejecuta `db/init.sql`.
2. Configura `.env` en `/backend`.
3. Instala dependencias en `/backend` y ejecuta el servidor.
4. Abre `/frontend` en tu navegador.

## Roles
- Administrador: gestión total
- Vendedor: ventas y consultas

## Autor
Tu nombre aquí
