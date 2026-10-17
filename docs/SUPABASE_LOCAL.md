# Supabase local (Docker) — Atto

## Puertos

Otro proyecto local ya usa `54321–54327`, por eso Atto usa:

| Servicio | URL |
|----------|-----|
| API | http://127.0.0.1:54521 |
| Studio | http://127.0.0.1:54523 |
| DB | postgresql://postgres:postgres@127.0.0.1:54522/postgres |
| Mailpit | http://127.0.0.1:54524 |

La app lee las keys desde `.env.local` (tiene prioridad sobre `.env`).

## Comandos

```bash
# Levantar
supabase start

# Ver status / keys
supabase status

# Reset DB + migraciones + seed ropa deportiva
supabase db reset

# Apagar
supabase stop
```

## Seed

[`supabase/seed.sql`](../supabase/seed.sql) carga categorías trail, 14 productos con variantes/talles y stock.

## Admin local

El seed crea un operador para desarrollo:

- Email: `coco@atto.com`
- Contraseña: `attoadmin`
- Login: `/auth/admin-login`

Si la base se resetea (`supabase db reset`), esa cuenta se vuelve a crear. También podés dar de alta otro operador en `/auth/admin-register`.
