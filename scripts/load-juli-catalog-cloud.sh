#!/usr/bin/env bash
# Carga docs/catalogo-juli-load.sql a Supabase cloud.
# Requiere SUPABASE_DB_PASSWORD en .env.local y haber revisado el catálogo.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a
# shellcheck disable=SC1091
source .env.local
set +a
: "${SUPABASE_DB_PASSWORD:?Falta SUPABASE_DB_PASSWORD en .env.local}"
DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.oowgoanqbnyprzjwbuzw.supabase.co:5432/postgres"
echo "Aplicando docs/catalogo-juli-load.sql…"
psql "$DB_URL" -v ON_ERROR_STOP=1 -f docs/catalogo-juli-load.sql
echo "Listo."
