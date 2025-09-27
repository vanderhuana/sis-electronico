-- Inicialización de la base de datos ElectroTech
-- Este script se ejecuta automáticamente al crear el contenedor de PostgreSQL

-- Crear base de datos si no existe
CREATE DATABASE sis_electronico;

-- Conectar a la base de datos
\c sis_electronico;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'empleado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    codigo_sku VARCHAR(50),
    precio_compra DECIMAL(10,2),
    precio_venta DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    categoria VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    usuario_id INTEGER REFERENCES usuarios(id),
    total DECIMAL(10,2),
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de detalle de ventas
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id),
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER,
    precio_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2)
);

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (usuario, contrasena, rol) 
VALUES ('admin', '$2b$10$rLzQJXGNVPNl8bZ4HQ8X3eC4B1GzPyZm4DjYKQE7pGhOCwKgWmJHG', 'administrador')
ON CONFLICT (usuario) DO NOTHING;
-- Contraseña: admin123

-- Insertar datos de ejemplo
INSERT INTO clientes (nombre, correo, telefono, direccion) VALUES
('Juan Pérez', 'juan.perez@email.com', '555-0001', 'Av. Principal 123'),
('María García', 'maria.garcia@email.com', '555-0002', 'Calle Secundaria 456'),
('Carlos López', 'carlos.lopez@email.com', '555-0003', 'Jr. Comercio 789')
ON CONFLICT DO NOTHING;

INSERT INTO productos (nombre, descripcion, codigo_sku, precio_compra, precio_venta, stock, categoria) VALUES
('Smartphone Galaxy A54', 'Teléfono inteligente Samsung 128GB', 'SM-A545F', 250.00, 350.00, 15, 'Smartphones'),
('Laptop HP Pavilion', 'Laptop HP 15.6" Intel Core i5 8GB RAM', 'HP-PAV15', 450.00, 650.00, 8, 'Computadoras'),
('Auriculares Sony WH-1000XM4', 'Auriculares inalámbricos con cancelación de ruido', 'SONY-WH1000XM4', 200.00, 280.00, 12, 'Audio'),
('Tablet iPad Air', 'Tablet Apple iPad Air 64GB WiFi', 'IPAD-AIR-64', 400.00, 550.00, 6, 'Tablets'),
('Smart TV LG 55"', 'Televisor Smart TV LG 55 pulgadas 4K', 'LG-55UP7500', 350.00, 500.00, 4, 'Televisores')
ON CONFLICT (codigo_sku) DO NOTHING;

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_detalle_ventas_producto ON detalle_ventas(producto_id);

COMMIT;