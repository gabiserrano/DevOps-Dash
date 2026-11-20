-- =====================================================================
-- Migración NO destructiva: inventario extendido (SKU, categorías,
-- proveedores por insumo y fecha de actualización de stock).
-- Ejecutar sobre una base ya creada con script.sql.
-- =====================================================================

ALTER TABLE insumos ADD COLUMN IF NOT EXISTS sku VARCHAR(30);
ALTER TABLE insumos ADD COLUMN IF NOT EXISTS categoria VARCHAR(50);
CREATE UNIQUE INDEX IF NOT EXISTS uq_insumos_sku ON insumos(sku) WHERE sku IS NOT NULL;

ALTER TABLE productos ADD COLUMN IF NOT EXISTS sku VARCHAR(30);
CREATE UNIQUE INDEX IF NOT EXISTS uq_productos_sku ON productos(sku) WHERE sku IS NOT NULL;

ALTER TABLE inventario ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS categorias (
  id      SERIAL PRIMARY KEY,
  nombre  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS insumo_proveedores (
  insumo_id     INT NOT NULL REFERENCES insumos(id) ON DELETE CASCADE,
  proveedor_id  INT NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  PRIMARY KEY (insumo_id, proveedor_id)
);

-- Backfill de datos existentes
INSERT INTO categorias (nombre)
SELECT DISTINCT categoria FROM productos WHERE categoria IS NOT NULL
ON CONFLICT (nombre) DO NOTHING;

UPDATE insumos SET sku = 'INS-' || LPAD(id::text, 4, '0') WHERE sku IS NULL;
UPDATE insumos SET categoria = 'Materia prima' WHERE categoria IS NULL;
UPDATE productos SET sku = 'PRD-' || LPAD(id::text, 4, '0') WHERE sku IS NULL;

INSERT INTO insumo_proveedores (insumo_id, proveedor_id)
SELECT DISTINCT cd.insumo_id, c.proveedor_id
FROM compra_detalle cd
JOIN compras c ON c.id = cd.compra_id
ON CONFLICT DO NOTHING;

INSERT INTO insumo_proveedores (insumo_id, proveedor_id)
SELECT i.id, p.id
FROM insumos i
CROSS JOIN proveedores p
WHERE (i.nombre = 'Café de especialidad' AND p.nombre LIKE 'Distribuidora de Café%')
   OR (i.nombre IN ('Leche entera', 'Queso', 'Mantequilla') AND p.nombre LIKE 'Lácteos%')
   OR (i.unidad = 'und' AND p.nombre LIKE 'Empaques%')
ON CONFLICT DO NOTHING;
