-- =====================================================================
-- Restaurante Orígenes SV - Esquema PostgreSQL
-- =====================================================================

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- ---------------------------------------------------------------------
-- base : sucursales, roles, usuarios, empleados.
-- ---------------------------------------------------------------------
CREATE TABLE sucursales (
  id           SERIAL PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  direccion    VARCHAR(200),
  telefono     VARCHAR(20),
  activa       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE roles (
  id      SERIAL PRIMARY KEY,
  nombre  VARCHAR(30) NOT NULL UNIQUE   -- gerente, cajero, barista
);

CREATE TABLE empleados (
  id                SERIAL PRIMARY KEY,
  sucursal_id       INT NOT NULL REFERENCES sucursales(id),
  nombres           VARCHAR(100) NOT NULL,
  apellidos         VARCHAR(100) NOT NULL,
  dui               VARCHAR(10) UNIQUE,
  nit               VARCHAR(17),
  puesto            VARCHAR(30) NOT NULL CHECK (puesto IN ('barista','cajero','gerente')),
  salario_mensual   NUMERIC(10,2) NOT NULL CHECK (salario_mensual >= 0),
  fecha_contratacion DATE NOT NULL,
  activo            BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE usuarios (
  id           SERIAL PRIMARY KEY,
  empleado_id  INT REFERENCES empleados(id),
  sucursal_id  INT NOT NULL REFERENCES sucursales(id),
  rol_id       INT NOT NULL REFERENCES roles(id),
  email        VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  activo       BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
--  inventario y recetas. 
-- ---------------------------------------------------------------------
CREATE TABLE insumos (
  id           SERIAL PRIMARY KEY,
  nombre       VARCHAR(120) NOT NULL UNIQUE,
  unidad       VARCHAR(10) NOT NULL,          -- g, ml, und
  costo_promedio NUMERIC(12,4) NOT NULL DEFAULT 0,
  activo       BOOLEAN NOT NULL DEFAULT TRUE
);

--  stock por sucursal
CREATE TABLE inventario (
  id           SERIAL PRIMARY KEY,
  sucursal_id  INT NOT NULL REFERENCES sucursales(id),
  insumo_id    INT NOT NULL REFERENCES insumos(id),
  stock_actual NUMERIC(12,3) NOT NULL DEFAULT 0,
  stock_minimo NUMERIC(12,3) NOT NULL DEFAULT 0,
  UNIQUE (sucursal_id, insumo_id)
);

CREATE TABLE productos (
  id           SERIAL PRIMARY KEY,
  nombre       VARCHAR(120) NOT NULL UNIQUE,
  categoria    VARCHAR(50),
  tipo         VARCHAR(10) NOT NULL CHECK (tipo IN ('elaborado','reventa')),
  precio       NUMERIC(10,2) NOT NULL CHECK (precio >= 0),   
  insumo_id    INT REFERENCES insumos(id),    
  activo       BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK ( (tipo = 'reventa' AND insumo_id IS NOT NULL) OR tipo = 'elaborado' )
);

CREATE TABLE recetas (
  id           SERIAL PRIMARY KEY,
  producto_id  INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  insumo_id    INT NOT NULL REFERENCES insumos(id),
  cantidad     NUMERIC(12,3) NOT NULL CHECK (cantidad > 0),
  UNIQUE (producto_id, insumo_id)
);

CREATE TABLE movimientos_inventario (
  id           SERIAL PRIMARY KEY,
  sucursal_id  INT NOT NULL REFERENCES sucursales(id),
  insumo_id    INT NOT NULL REFERENCES insumos(id),
  tipo         VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada','salida','ajuste')),
  cantidad     NUMERIC(12,3) NOT NULL,
  motivo       VARCHAR(30) NOT NULL,          
  referencia_id INT,                          
  usuario_id   INT REFERENCES usuarios(id),
  fecha        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
--  compras y provedores 
-- ---------------------------------------------------------------------
CREATE TABLE proveedores (
  id           SERIAL PRIMARY KEY,
  nombre       VARCHAR(150) NOT NULL,
  nit          VARCHAR(17),
  nrc          VARCHAR(15),
  telefono     VARCHAR(20),
  email        VARCHAR(120),
  direccion    VARCHAR(200),
  dias_credito INT NOT NULL DEFAULT 0,
  activo       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE compras (
  id             SERIAL PRIMARY KEY,
  sucursal_id    INT NOT NULL REFERENCES sucursales(id),
  proveedor_id   INT NOT NULL REFERENCES proveedores(id),
  numero_factura VARCHAR(40) NOT NULL,
  fecha          DATE NOT NULL,
  tipo_pago      VARCHAR(10) NOT NULL CHECK (tipo_pago IN ('contado','credito')),
  clasificacion  VARCHAR(10) NOT NULL DEFAULT 'costo' CHECK (clasificacion IN ('costo','gasto')),
  subtotal       NUMERIC(12,2) NOT NULL,
  iva            NUMERIC(12,2) NOT NULL DEFAULT 0,
  total          NUMERIC(12,2) NOT NULL,
  usuario_id     INT REFERENCES usuarios(id),
  UNIQUE (proveedor_id, numero_factura)
);

CREATE TABLE compra_detalle (
  id             SERIAL PRIMARY KEY,
  compra_id      INT NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
  insumo_id      INT NOT NULL REFERENCES insumos(id),
  cantidad       NUMERIC(12,3) NOT NULL CHECK (cantidad > 0),
  costo_unitario NUMERIC(12,4) NOT NULL CHECK (costo_unitario >= 0),
  subtotal       NUMERIC(12,2) NOT NULL
);

CREATE TABLE cuentas_por_pagar (
  id            SERIAL PRIMARY KEY,
  compra_id     INT NOT NULL UNIQUE REFERENCES compras(id),
  proveedor_id  INT NOT NULL REFERENCES proveedores(id),
  monto_total   NUMERIC(12,2) NOT NULL,
  saldo         NUMERIC(12,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado        VARCHAR(10) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','parcial','pagada'))
);

CREATE TABLE pagos_cxp (
  id           SERIAL PRIMARY KEY,
  cxp_id       INT NOT NULL REFERENCES cuentas_por_pagar(id),
  monto        NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  metodo_pago_id INT,                          -- FK se agrega abajo
  fecha        TIMESTAMP NOT NULL DEFAULT NOW(),
  usuario_id   INT REFERENCES usuarios(id)
);

-- ---------------------------------------------------------------------
--  ventas y facturación 
-- ---------------------------------------------------------------------
CREATE TABLE metodos_pago (
  id      SERIAL PRIMARY KEY,
  nombre  VARCHAR(30) NOT NULL UNIQUE,         
  es_efectivo BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE pagos_cxp
  ADD CONSTRAINT fk_pagos_cxp_metodo FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id);

CREATE TABLE clientes (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(150) NOT NULL,
  nit        VARCHAR(17),
  nrc        VARCHAR(15),
  giro       VARCHAR(150),
  direccion  VARCHAR(200),
  email      VARCHAR(120)
);

--   correlativos de sucursal y el tipo de documento
CREATE TABLE correlativos (
  id           SERIAL PRIMARY KEY,
  sucursal_id  INT NOT NULL REFERENCES sucursales(id),
  tipo_doc     VARCHAR(5) NOT NULL CHECK (tipo_doc IN ('FCF','CCF')),
  serie        VARCHAR(10) NOT NULL DEFAULT 'A',
  ultimo_numero INT NOT NULL DEFAULT 0,
  UNIQUE (sucursal_id, tipo_doc, serie)
);

--la caja usa flujos; se declara antes de ventas
CREATE TABLE cajas (
  id               SERIAL PRIMARY KEY,
  sucursal_id      INT NOT NULL REFERENCES sucursales(id),
  usuario_id       INT NOT NULL REFERENCES usuarios(id),
  turno            VARCHAR(15) NOT NULL CHECK (turno IN ('manana','tarde','noche')),
  fecha_apertura   TIMESTAMP NOT NULL DEFAULT NOW(),
  monto_inicial    NUMERIC(12,2) NOT NULL CHECK (monto_inicial >= 0),
  estado           VARCHAR(10) NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta','cerrada')),
  -- cierre
  fecha_cierre     TIMESTAMP,
  efectivo_esperado NUMERIC(12,2),
  efectivo_real    NUMERIC(12,2),
  diferencia       NUMERIC(12,2),
  tarjeta_total    NUMERIC(12,2),
  digital_total    NUMERIC(12,2),
  observaciones    VARCHAR(300)
);

--  solo una caja abierta por usuario a la vez
CREATE UNIQUE INDEX uq_caja_abierta_usuario ON cajas (usuario_id) WHERE estado = 'abierta';

CREATE TABLE ventas (
  id             SERIAL PRIMARY KEY,
  sucursal_id    INT NOT NULL REFERENCES sucursales(id),
  caja_id        INT NOT NULL REFERENCES cajas(id),
  usuario_id     INT NOT NULL REFERENCES usuarios(id),
  cliente_id     INT REFERENCES clientes(id),            
  tipo_doc       VARCHAR(5) NOT NULL CHECK (tipo_doc IN ('FCF','CCF')),
  serie          VARCHAR(10) NOT NULL DEFAULT 'A',
  numero_doc     INT NOT NULL,
  fecha          TIMESTAMP NOT NULL DEFAULT NOW(),
  subtotal       NUMERIC(12,2) NOT NULL,                 -- base sin IVA
  iva            NUMERIC(12,2) NOT NULL,                 -- IVA 13%
  total          NUMERIC(12,2) NOT NULL,
  estado         VARCHAR(10) NOT NULL DEFAULT 'emitida' CHECK (estado IN ('emitida','anulada')),
  UNIQUE (sucursal_id, tipo_doc, serie, numero_doc),
  CHECK (tipo_doc = 'FCF' OR cliente_id IS NOT NULL)
);

CREATE TABLE venta_detalle (
  id              SERIAL PRIMARY KEY,
  venta_id        INT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id     INT NOT NULL REFERENCES productos(id),
  cantidad        INT NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(10,2) NOT NULL,
  subtotal        NUMERIC(12,2) NOT NULL
);


CREATE TABLE venta_pagos (
  id             SERIAL PRIMARY KEY,
  venta_id       INT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  metodo_pago_id INT NOT NULL REFERENCES metodos_pago(id),
  monto          NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  referencia     VARCHAR(80)                              
);

-- ---------------------------------------------------------------------
--  caja y flujos
-- ---------------------------------------------------------------------
CREATE TABLE movimientos_caja (
  id          SERIAL PRIMARY KEY,
  caja_id     INT NOT NULL REFERENCES cajas(id),
  tipo        VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso','egreso')),
  concepto    VARCHAR(200) NOT NULL,
  monto       NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  fecha       TIMESTAMP NOT NULL DEFAULT NOW(),
  usuario_id  INT REFERENCES usuarios(id)
);

-- ---------------------------------------------------------------------
--  rrhh (recursos humanos)
-- ---------------------------------------------------------------------
-- (verificar valores vigentes antes de cargar)
CREATE TABLE parametros_nomina (
  clave   VARCHAR(30) PRIMARY KEY,                -- isss_empleado, afp_empleado, isss_tope
  valor   NUMERIC(12,4) NOT NULL
);

CREATE TABLE isr_tramos (
  id             SERIAL PRIMARY KEY,
  periodo        VARCHAR(10) NOT NULL DEFAULT 'quincenal',
  desde          NUMERIC(12,2) NOT NULL,
  hasta          NUMERIC(12,2),                    -- NULL = sin límite
  porcentaje     NUMERIC(5,2) NOT NULL,
  sobre_exceso   NUMERIC(12,2) NOT NULL DEFAULT 0,
  cuota_fija     NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE planillas (
  id            SERIAL PRIMARY KEY,
  sucursal_id   INT REFERENCES sucursales(id),
  fecha_inicio  DATE NOT NULL,
  fecha_fin     DATE NOT NULL,
  estado        VARCHAR(10) NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador','aprobada','pagada')),
  creada_por    INT REFERENCES usuarios(id),
  UNIQUE (sucursal_id, fecha_inicio, fecha_fin)
);

CREATE TABLE planilla_detalle (
  id            SERIAL PRIMARY KEY,
  planilla_id   INT NOT NULL REFERENCES planillas(id) ON DELETE CASCADE,
  empleado_id   INT NOT NULL REFERENCES empleados(id),
  salario_bruto NUMERIC(12,2) NOT NULL,
  isss          NUMERIC(12,2) NOT NULL DEFAULT 0,
  afp           NUMERIC(12,2) NOT NULL DEFAULT 0,
  isr           NUMERIC(12,2) NOT NULL DEFAULT 0,
  otras_deducciones NUMERIC(12,2) NOT NULL DEFAULT 0,
  salario_neto  NUMERIC(12,2) NOT NULL,
  UNIQUE (planilla_id, empleado_id)
);

-- ---------------------------------------------------------------------
--  indices
-- ---------------------------------------------------------------------
CREATE INDEX idx_ventas_caja ON ventas(caja_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_venta_pagos_venta ON venta_pagos(venta_id);
CREATE INDEX idx_inventario_sucursal ON inventario(sucursal_id);
CREATE INDEX idx_mov_inv_insumo ON movimientos_inventario(insumo_id);
CREATE INDEX idx_compras_proveedor ON compras(proveedor_id);
CREATE INDEX idx_cxp_estado ON cuentas_por_pagar(estado);
CREATE INDEX idx_mov_caja_caja ON movimientos_caja(caja_id);

-- ---------------------------------------------------------------------
-- datos base
-- ---------------------------------------------------------------------
INSERT INTO roles (nombre) VALUES ('gerente'), ('cajero'), ('barista');

INSERT INTO metodos_pago (nombre, es_efectivo) VALUES
  ('efectivo', TRUE), ('tarjeta', FALSE), ('bitcoin_chivo', FALSE);

INSERT INTO sucursales (nombre, direccion) VALUES
  ('Orígenes Centro', 'San Salvador, Centro'),
  ('Orígenes Escalón', 'San Salvador, Colonia Escalón');

INSERT INTO correlativos (sucursal_id, tipo_doc, serie, ultimo_numero) VALUES
  (1,'FCF','A',0), (2,'CCF','A',0),
  (1,'CCF','A',0), (2,'FCF','A',0);

  

-- ISSS (3%) y AFP (7.25%) según el enunciado.
-- Falta cargar lo de ISSS y lo de ISR (lo hace RRHH con las tablas vigentes)
INSERT INTO parametros_nomina (clave, valor) VALUES
  ('isss_empleado', 0.03),
  ('afp_empleado', 0.0725);