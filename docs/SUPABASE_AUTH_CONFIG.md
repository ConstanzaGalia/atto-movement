# Configuración de autenticación y emails (Atto)

## 1. Confirmar email (obligatorio para OTP)

La app verifica el email de clientes con un **código OTP de 6 dígitos** enviado por Resend. Para que funcione, Supabase debe exigir email confirmado:

1. Entrá al [Dashboard de Supabase](https://supabase.com/dashboard) y elegí tu proyecto.
2. Andá a **Authentication** → **Providers** → **Email**.
3. **Activá** la opción **"Confirm email"** (Enable email confirmations).
4. Guardá los cambios.

Los clientes se crean con `email_confirm: false` y solo pueden iniciar sesión después de validar el OTP en `/auth/verificar-email`.

> Importante: desactivá o ignorá los templates de mail de Supabase para signup; el código OTP lo envía la app con Resend, no el mail por defecto de Supabase.

---

## 2. Resend (envío de emails)

### Variables de entorno

Agregá en `.env` (local) y en Vercel (producción):

```env
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM_EMAIL=Atto <noreply@tudominio.com>
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

En desarrollo podés usar el remitente de prueba de Resend:

```env
RESEND_FROM_EMAIL=Atto <onboarding@resend.dev>
```

(Ese remitente solo puede enviar al email de tu cuenta Resend.)

### Qué mails se envían

| Evento | Destinatario |
|--------|----------------|
| Pedido creado | `customer_email` del pedido |
| Estado `preparing` / `delivered` / `cancelled` | `customer_email` del pedido |
| Registro cliente | OTP verificación |
| Recuperar contraseña | OTP reset |

### Base de datos OTP

Ejecutá en el SQL Editor de Supabase el script:

`scripts/033_create_email_otps.sql`

---

## 3. Login con Google (opcional)

### En Supabase

1. En el Dashboard: **Authentication** → **Providers** → **Google**.
2. Activá **Enable Sign in with Google**.
3. Creá credenciales en [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Tipo: **OAuth 2.0 Client ID** (aplicación web).
   - **Authorized JavaScript origins**:  
     `http://localhost:3000` (desarrollo) y tu dominio en producción (ej. `https://tudominio.com`).
   - **Authorized redirect URIs**:  
     La URL de callback de Supabase, ej. `https://TU_PROJECT_REF.supabase.co/auth/v1/callback`  
     (copiala desde el mismo panel de Supabase, sección Google).
4. Pegá en Supabase el **Client ID** y **Client Secret** de Google y guardá.

### URLs de redirección en Supabase

En **Authentication** → **URL Configuration** → **Redirect URLs** agregá:

- `http://localhost:3000/auth/callback` (desarrollo)
- `https://tudominio.com/auth/callback` (producción)

Así Supabase acepta redirigir a tu app después del login con Google.

Los usuarios de Google ya tienen el email verificado; no pasan por el flujo OTP.
