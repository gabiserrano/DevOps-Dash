#!/usr/bin/env bash
# Prueba de humo del API: login por rol y matriz de permisos.
#   npm run smoke
#   API_URL=http://localhost:3000 npm run smoke
set -u

API="${API_URL:-http://localhost:3000}/api/v1"
PASSWORD="${SEED_PASSWORD:-Origenes2026}"

login() {
    curl -s -X POST "$API/auth/login" -H 'Content-Type: application/json' \
        -d "{\"email\":\"$1\",\"password\":\"$PASSWORD\"}" \
        | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).token ?? ''"
}

code() {
    curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $1" "$API/$2"
}

ADMIN=$(login admin@origenes.sv)
GERENTE=$(login carlos.martinez@origenes.sv)
CAJERO=$(login ana.hernandez@origenes.sv)
BARISTA=$(login luis.gomez@origenes.sv)

if [ -z "$ADMIN" ]; then
    echo "No se pudo iniciar sesión como admin@origenes.sv."
    echo "¿Cargaste los datos? -> npm run db:seed -- --force"
    exit 1
fi

echo "tokens: admin=${#ADMIN} gerente=${#GERENTE} cajero=${#CAJERO} barista=${#BARISTA}"
echo
echo "recurso       admin gerente cajero barista"
for recurso in sucursal proveedor empleado planilla insumos compras ventas inventario producto caja roles usuarios; do
    printf '%-13s %5s %7s %6s %7s\n' "$recurso" \
        "$(code "$ADMIN" "$recurso")" \
        "$(code "$GERENTE" "$recurso")" \
        "$(code "$CAJERO" "$recurso")" \
        "$(code "$BARISTA" "$recurso")"
done
echo
echo "sin token: $(curl -s -o /dev/null -w '%{http_code}' "$API/sucursal") (esperado 401)"
