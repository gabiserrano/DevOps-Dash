# DevOps-Dash

Backend REST (Node.js + Express 5 + Sequelize + PostgreSQL) del sistema Orígenes SV.

## Levantar el proyecto

```bash
cp .env.example .env      # ajustar DB_URL (Docker expone Postgres en 3031)
npm install
docker compose up -d db   # o usar un PostgreSQL local en 5432
npm run dev               # nodemon src/main.js
```

La API queda en `http://localhost:3000/api/v1`.

## Base de datos

Dos caminos posibles (elegir uno):

1. **Carga reproducible desde Node** (no requiere `psql` ni Docker CLI):
   ```bash
   npm run db:seed -- --force   # DESTRUCTIVO: recrea el esquema y carga datos de prueba
   ```
2. **Scripts SQL a mano**:
   ```bash
   docker exec -i origenes_sv psql -U postgres -d devops_db < documents/script.sql
   docker exec -i origenes_sv psql -U postgres -d devops_db < documents/seeder.sql
   ```
3. **`DB_SYNC=true`**: Sequelize crea las tablas, pero **quedan vacías** (sin roles,
   sucursales ni usuarios). No sirve para probar el login.

`script.sql` hace `DROP SCHEMA public CASCADE`: es destructivo y reinicia todo.

### Migraciones incrementales

Si ya tenés datos y no querés recrear la base:

```bash
npm run db:migrate
```

Aplica `documents/migracion_inventario.sql`: agrega SKU y categoría a insumos,
SKU a productos, fecha de actualización del stock, la tabla `categorias` y la
tabla puente `insumo_proveedores`, con backfill de los datos existentes.

## Prueba de humo

```bash
npm run smoke
```

Hace login con cada rol y muestra el código HTTP por recurso (200/403), además de
verificar que sin token responda 401.

## Probar inventario por API

Requiere rol `admin` o `gerente`.

```bash
API=http://localhost:3000/api/v1
TOKEN=$(curl -s -X POST "$API/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"admin@origenes.sv","password":"Origenes2026"}' \
  | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).token")

# 1. Ver stock de un insumo en una sucursal
curl -s -H "Authorization: Bearer $TOKEN" "$API/inventario?sucursalId=1&insumoId=1"

# 2. Entrada de stock (crea la fila de inventario si no existe)
curl -s -X POST "$API/inventario/ajuste" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"sucursalId":1,"insumoId":1,"tipo":"entrada","cantidad":250,"motivo":"prueba entrada"}'

# 3. Salida de stock (falla si no hay suficiente)
curl -s -X POST "$API/inventario/ajuste" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"sucursalId":1,"insumoId":1,"tipo":"salida","cantidad":100,"motivo":"prueba salida"}'

# 4. Ajuste por inventario físico (la cantidad es el stock final)
curl -s -X POST "$API/inventario/ajuste" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"sucursalId":1,"insumoId":1,"tipo":"ajuste","cantidad":5000,"motivo":"conteo fisico"}'

# 5. Stock mínimo
curl -s -X PATCH "$API/inventario/1/minimo" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"stockMinimo":1500}'

# 6. Historial de movimientos
curl -s -H "Authorization: Bearer $TOKEN" "$API/inventario/movimientos?sucursalId=1&insumoId=1"

# 7. Crear un insumo nuevo y darle stock
curl -s -X POST "$API/insumos" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Insumo Prueba 2","unidad":"g","costoPromedio":0.5}'
```

Registrar una compra (`POST /compras`) también incrementa el inventario automáticamente
en la sucursal indicada.

## Usuarios de prueba

Todos usan la contraseña **`Origenes2026`**.

| Email | Rol |
|---|---|
| `admin@origenes.sv` | `admin` |
| `carlos.martinez@origenes.sv` | `gerente` |
| `sofia.ramirez@origenes.sv` | `gerente` |
| `ana.hernandez@origenes.sv` | `cajero` |
| `jose.flores@origenes.sv` | `cajero` |
| `luis.gomez@origenes.sv` | `barista` |
| `maria.lopez@origenes.sv` | `barista` |
| `daniela.perez@origenes.sv` | `barista` |

## Autorización por recurso

| Recurso | Roles permitidos |
|---|---|
| `auth` | público (login) / JWT (`me`) |
| `sucursal` | `admin`, `gerente` |
| `usuario`, `rol` | `admin`, `gerente` (escritura de roles) |
| `empleado`, `planilla` | `admin`, `gerente` |
| `proveedor`, `compras` | `admin`, `gerente`, `compras` |
| `insumos` | `admin`, `gerente`, `compras`, `barista` |
| `inventario` | `admin`, `gerente`, `compras`, `barista` |
| `categorias` | lectura: autenticado · escritura: `admin`, `gerente` |
| `producto` (GET) | `admin`, `gerente`, `cajero`, `barista`, `compras` |
| `ventas`, `clientes`, `caja` | `admin`, `gerente`, `cajero` |
| `metodos-pago` | cualquier usuario autenticado (catálogo del POS) |
| `recetas` | `admin`, `gerente`, `barista`, `compras` |

Todo recurso distinto de `auth` exige `Authorization: Bearer <JWT>`.

## Pruebas e2e

```bash
npm run e2e
```

Requiere `jest-e2e.json` (pendiente) y la base `origenes_sv_e2e` (contenedor `db_e2e`,
puerto 3032).
