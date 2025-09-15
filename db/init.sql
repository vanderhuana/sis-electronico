-- Script de inicialización de la base de datos para SIS Electrónico

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena_hash TEXT NOT NULL,
    rol VARCHAR(20) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT now()
);

INSERT INTO usuarios (usuario, contrasena_hash, rol) VALUES
('admin', '$2b$10$hashdeejemplo', 'administrador');

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(100),
    telefono VARCHAR(30),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT now()
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo_sku VARCHAR(50) UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    precio_compra NUMERIC(12,2),
    precio_venta NUMERIC(12,2) NOT NULL,
    stock INT DEFAULT 0,
    proveedor VARCHAR(150),
    imagen_url TEXT,
    fecha_creacion TIMESTAMP DEFAULT now()
);

INSERT INTO productos (codigo_sku, nombre, descripcion, categoria, precio_compra, precio_venta, stock, proveedor)
VALUES
('SKU001', 'Laptop Lenovo', 'Laptop de alto rendimiento', 'Laptops', 500.00, 700.00, 10, 'Lenovo'),
('SKU002', 'Mouse Logitech', 'Mouse inalámbrico', 'Accesorios', 10.00, 20.00, 50, 'Logitech');

CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT now(),
    usuario_id INT REFERENCES usuarios(id),
    cliente_id INT REFERENCES clientes(id),
    subtotal NUMERIC(12,2),
    descuento NUMERIC(12,2) DEFAULT 0,
    impuesto NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2),
    metodo_pago VARCHAR(50)
);

CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INT REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INT REFERENCES productos(id),
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL
);