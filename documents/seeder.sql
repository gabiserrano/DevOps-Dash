-- =====================================================================
-- Restaurante Orígenes SV - Seeder (datos de prueba)
-- Ejecutar DESPUÉS del esquema. Contraseña de todos los usuarios: Origenes2026
-- =====================================================================


INSERT INTO insumos (nombre, unidad, costo_promedio)
SELECT v.nombre, v.unidad, v.costo
FROM (VALUES
  ('Café de especialidad',      'g',   0.0300),
  ('Leche entera',              'ml',  0.0020),
  ('Agua purificada',           'ml',  0.0005),
  ('Hielo',                     'g',   0.0010),
  ('Azúcar',                    'g',   0.0015),
  ('Chocolate en polvo',        'g',   0.0100),
  ('Té negro (bolsa)',          'und', 0.2500),
  ('Vaso 8oz',                  'und', 0.0800),
  ('Vaso 12oz',                 'und', 0.1000),
  ('Vaso 16oz',                 'und', 0.1200),
  ('Tapadera',                  'und', 0.0500),
  ('Viñeta',                    'und', 0.0200),
  ('Pan de sándwich',           'und', 0.4000),
  ('Jamón',                     'g',   0.0120),
  ('Queso',                     'g',   0.0150),
  ('Empaque sándwich',          'und', 0.1500),
  ('Masa de croissant',         'und', 0.6000),
  ('Mantequilla',               'g',   0.0100),
  ('Botella de agua 500ml',     'und', 0.4000),
  ('Galleta empacada',          'und', 0.6500),
  ('Bolsa de café 340g',        'und', 5.5000)
) AS v(nombre, unidad, costo);

-- ---------------------------------------------------------------------
-- productos: nombre, categoría, precio con IVA
-- ---------------------------------------------------------------------
INSERT INTO productos (nombre, categoria, tipo, precio)
SELECT v.nombre, v.categoria, 'elaborado', v.precio
FROM (VALUES
  ('Espresso',                    'Bebidas calientes', 1.75),
  ('Americano',                   'Bebidas calientes', 2.25),
  ('Latte Grande',                'Bebidas calientes', 3.75),
  ('Latte Mediano',               'Bebidas calientes', 3.25),
  ('Capuchino',                   'Bebidas calientes', 3.50),
  ('Mocha',                       'Bebidas calientes', 4.25),
  ('Chocolate caliente',          'Bebidas calientes', 3.00),
  ('Té caliente',                 'Bebidas calientes', 1.75),
  ('Frappé de café',              'Bebidas frías',     4.50),
  ('Cold Brew',                   'Bebidas frías',     3.75),
  ('Sándwich de jamón y queso',   'Alimentos',         3.50),
  ('Croissant de mantequilla',    'Alimentos',         2.25)
) AS v(nombre, categoria, precio);

-- ---------------------------------------------------------------------
-- productos de reventa
-- ---------------------------------------------------------------------
INSERT INTO productos (nombre, categoria, tipo, precio, insumo_id)
SELECT v.nombre, 'Empacados', 'reventa', v.precio, i.id
FROM (VALUES
  ('Botella de agua 500ml',  1.00),
  ('Galleta empacada',       1.50),
  ('Bolsa de café 340g',     9.50)
) AS v(nombre, precio)
JOIN insumos i ON i.nombre = v.nombre;

-- ---------------------------------------------------------------------
-- recetas
-- ---------------------------------------------------------------------
INSERT INTO recetas (producto_id, insumo_id, cantidad)
SELECT p.id, i.id, v.cantidad
FROM (VALUES
  -- Espresso
  ('Espresso', 'Café de especialidad', 18), ('Espresso', 'Vaso 8oz', 1),
  ('Espresso', 'Tapadera', 1), ('Espresso', 'Viñeta', 1),
  -- Americano
  ('Americano', 'Café de especialidad', 18), ('Americano', 'Agua purificada', 200),
  ('Americano', 'Vaso 12oz', 1), ('Americano', 'Tapadera', 1), ('Americano', 'Viñeta', 1),
  -- Latte Grande (del enunciado: 18g café, 250ml leche, vaso 16oz, tapadera, viñeta)
  ('Latte Grande', 'Café de especialidad', 18), ('Latte Grande', 'Leche entera', 250),
  ('Latte Grande', 'Vaso 16oz', 1), ('Latte Grande', 'Tapadera', 1), ('Latte Grande', 'Viñeta', 1),
  -- Latte Mediano
  ('Latte Mediano', 'Café de especialidad', 18), ('Latte Mediano', 'Leche entera', 180),
  ('Latte Mediano', 'Vaso 12oz', 1), ('Latte Mediano', 'Tapadera', 1), ('Latte Mediano', 'Viñeta', 1),
  -- Capuchino
  ('Capuchino', 'Café de especialidad', 18), ('Capuchino', 'Leche entera', 150),
  ('Capuchino', 'Vaso 12oz', 1), ('Capuchino', 'Tapadera', 1), ('Capuchino', 'Viñeta', 1),
  -- Mocha
  ('Mocha', 'Café de especialidad', 18), ('Mocha', 'Leche entera', 200),
  ('Mocha', 'Chocolate en polvo', 20), ('Mocha', 'Vaso 16oz', 1),
  ('Mocha', 'Tapadera', 1), ('Mocha', 'Viñeta', 1),
  -- Chocolate caliente
  ('Chocolate caliente', 'Chocolate en polvo', 30), ('Chocolate caliente', 'Leche entera', 250),
  ('Chocolate caliente', 'Vaso 12oz', 1), ('Chocolate caliente', 'Tapadera', 1),
  ('Chocolate caliente', 'Viñeta', 1),
  -- Té caliente
  ('Té caliente', 'Té negro (bolsa)', 1), ('Té caliente', 'Agua purificada', 250),
  ('Té caliente', 'Vaso 12oz', 1), ('Té caliente', 'Tapadera', 1), ('Té caliente', 'Viñeta', 1),
  -- Frappé de café
  ('Frappé de café', 'Café de especialidad', 18), ('Frappé de café', 'Leche entera', 200),
  ('Frappé de café', 'Hielo', 150), ('Frappé de café', 'Azúcar', 20),
  ('Frappé de café', 'Vaso 16oz', 1), ('Frappé de café', 'Tapadera', 1), ('Frappé de café', 'Viñeta', 1),
  -- Cold Brew
  ('Cold Brew', 'Café de especialidad', 25), ('Cold Brew', 'Agua purificada', 250),
  ('Cold Brew', 'Hielo', 100), ('Cold Brew', 'Vaso 16oz', 1),
  ('Cold Brew', 'Tapadera', 1), ('Cold Brew', 'Viñeta', 1),
  -- Sándwich de jamón y queso
  ('Sándwich de jamón y queso', 'Pan de sándwich', 2), ('Sándwich de jamón y queso', 'Jamón', 40),
  ('Sándwich de jamón y queso', 'Queso', 30), ('Sándwich de jamón y queso', 'Empaque sándwich', 1),
  ('Sándwich de jamón y queso', 'Viñeta', 1),
  -- Croissant de mantequilla
  ('Croissant de mantequilla', 'Masa de croissant', 1), ('Croissant de mantequilla', 'Mantequilla', 10),
  ('Croissant de mantequilla', 'Viñeta', 1)
) AS v(producto, insumo, cantidad)
JOIN productos p ON p.nombre = v.producto
JOIN insumos i ON i.nombre = v.insumo;

-- ---------------------------------------------------------------------
-- inventario
-- ---------------------------------------------------------------------
INSERT INTO inventario (sucursal_id, insumo_id, stock_actual, stock_minimo)
SELECT s.id, i.id, v.stock, v.minimo
FROM (VALUES
  ('Café de especialidad',   5000, 1000),
  ('Leche entera',          20000, 4000),
  ('Agua purificada',       30000, 5000),
  ('Hielo',                 10000, 2000),
  ('Azúcar',                 3000,  500),
  ('Chocolate en polvo',     2000,  400),
  ('Té negro (bolsa)',        100,   20),
  ('Vaso 8oz',                300,   60),
  ('Vaso 12oz',               300,   60),
  ('Vaso 16oz',               300,   60),
  ('Tapadera',                600,  120),
  ('Viñeta',                  600,  120),
  ('Pan de sándwich',         100,   20),
  ('Jamón',                  2000,  400),
  ('Queso',                  1500,  300),
  ('Empaque sándwich',         60,   12),
  ('Masa de croissant',        60,   12),
  ('Mantequilla',            1000,  200),
  ('Botella de agua 500ml',    48,   12),
  ('Galleta empacada',         40,   10),
  ('Bolsa de café 340g',       20,    5)
) AS v(insumo, stock, minimo)
JOIN insumos i ON i.nombre = v.insumo
CROSS JOIN sucursales s;

-- Para demostrar la alerta de stock mínimo: Jamón bajo el mínimo en la sucursal 2
UPDATE inventario SET stock_actual = 150
WHERE sucursal_id = 2 AND insumo_id = (SELECT id FROM insumos WHERE nombre = 'Jamón');

-- ---------------------------------------------------------------------
-- empleados
-- ---------------------------------------------------------------------
INSERT INTO empleados (sucursal_id, nombres, apellidos, dui, nit, puesto, salario_mensual, fecha_contratacion)
VALUES
  (1, 'Carlos',  'Martínez',  '01234567-8', '0614-010190-101-1', 'gerente', 1200.00, '2023-02-01'),
  (1, 'Ana',     'Hernández', '02345678-9', '0614-020292-102-2', 'cajero',   500.00, '2023-06-15'),
  (1, 'Luis',    'Gómez',     '03456789-0', '0614-030393-103-3', 'barista',  480.00, '2024-01-10'),
  (1, 'María',   'López',     '04567890-1', '0614-040494-104-4', 'barista',  480.00, '2024-03-20'),
  (2, 'Sofía',   'Ramírez',   '05678901-2', '0614-050595-105-5', 'gerente', 1100.00, '2023-09-01'),
  (2, 'José',    'Flores',    '06789012-3', '0614-060696-106-6', 'cajero',   500.00, '2024-02-05'),
  (2, 'Daniela', 'Pérez',     '07890123-4', '0614-070797-107-7', 'barista',  480.00, '2024-05-12');

-- ---------------------------------------------------------------------
-- usuarios (uno por empleado; contraseña: Origenes2026)
-- ---------------------------------------------------------------------
INSERT INTO usuarios (empleado_id, sucursal_id, rol_id, email, password_hash)
SELECT e.id, e.sucursal_id, r.id, v.email, '$2b$10$xGN7XUkrP/MD4BbANMuIpugFfN6xBdKbHHAkl4RhYDwWnWg9t6Rge'
FROM (VALUES
  ('01234567-8', 'carlos.martinez@origenes.sv'),
  ('02345678-9', 'ana.hernandez@origenes.sv'),
  ('03456789-0', 'luis.gomez@origenes.sv'),
  ('04567890-1', 'maria.lopez@origenes.sv'),
  ('05678901-2', 'sofia.ramirez@origenes.sv'),
  ('06789012-3', 'jose.flores@origenes.sv'),
  ('07890123-4', 'daniela.perez@origenes.sv')
) AS v(dui, email)
JOIN empleados e ON e.dui = v.dui
JOIN roles r ON r.nombre = e.puesto;

-- ---------------------------------------------------------------------
-- provedores (no reales)
-- ---------------------------------------------------------------------
INSERT INTO proveedores (nombre, nit, nrc, telefono, email, direccion, dias_credito)
VALUES
  ('Distribuidora de Café Cuscatlán', '0614-150880-101-0', '123456-7', '2222-1111', 'ventas@cafecuscatlan.sv', 'San Salvador', 30),
  ('Lácteos El Pastor',               '0614-220985-102-1', '234567-8', '2222-2222', 'pedidos@elpastor.sv',     'Santa Tecla',  15),
  ('Empaques y Desechables SV',       '0614-101090-103-2', '345678-9', '2222-3333', 'info@empaquessv.com',     'Soyapango',    30);

-- ---------------------------------------------------------------------
-- clientes (no reales)
-- ---------------------------------------------------------------------
INSERT INTO clientes (nombre, nit, nrc, giro, direccion, email)
VALUES
  ('Inversiones Del Valle, S.A. de C.V.', '0614-010110-101-5', '111111-1', 'Servicios de consultoría', 'San Salvador',  'contabilidad@delvalle.sv'),
  ('Comercial Los Pinos, S.A. de C.V.',   '0614-020220-102-6', '222222-2', 'Comercio al por menor',    'Antiguo Cuscatlán', 'admin@lospinos.sv');