# CIPRO · Landing page + panel de administración

Web del Círculo de Gestión de Proyectos (CIPRO). Está hecha con React, Vite, TypeScript y Tailwind CSS, y usa **Supabase** como base de datos y almacenamiento de fotos.

## Páginas
| Ruta | Qué es |
|---|---|
| `/` | Landing: hero con Scrummy, nosotros (misión, visión, pilares y valores), áreas, directiva actual, proyectos, alianzas, noticias, galería y "Únete" |
| `/integrantes` | Integrantes por ciclo (2026-1, 2026-2…) agrupados por área, con foto y botón de LinkedIn |
| `/noticias`, `/noticias/:slug` | Noticias |
| `/acceso` | **Soy cipriano**: ingresar con DNI + contraseña, o **registrarse** (queda pendiente de aprobación) |
| `/mi-perfil` | El cipriano edita su perfil: foto, carrera, ingreso a CIPRO (mes/año), trabajo actual, LinkedIn, celular, descripción y hasta 8 fotos |
| `/cipriano/:id` | Perfil público de cada cipriano aprobado |
| `/admin` | Panel de administración (código universitario + contraseña, cambio de contraseña con 🔑) |

## Base de datos (Supabase, proyecto "CIPRO PAG WEB")
- `periods` (ciclos), `areas`, `members` (datos públicos), `memberships` (integrante ↔ ciclo ↔ área ↔ cargo)
- `member_private`: **DNI**, correo y hash del código de acceso. Solo el admin puede leer esta tabla; nunca se muestra en la web.
- `news`, `projects`, `alliances`, `gallery`, `site_settings` (logo, Scrummy, textos)
- Bucket público `media` para las imágenes. Solo el admin puede subir archivos.
- Edge Function `member-account` (`supabase/functions/member-account`): auto-registro de ciprianos y asignación de contraseñas por el admin. Las cuentas de ciprianos usan `DNI@ciprianos.cipro.invalid` como usuario interno (no se envían correos).
- Los auto-registros quedan con `status = 'pendiente'` hasta que el admin los apruebe (pestaña Integrantes → ⏳ Solicitudes). Un cipriano no puede cambiar su propio estado ni su DNI (triggers `members_guard` y `member_private_guard`).
- Los admins se definen en la tabla `admin_emails` (el login del admin usa el código universitario → `código@aloe.ulima.edu.pe`).

## Desarrollo
```bash
npm install
npm run dev
```
Variables en `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). La clave publicable se puede exponer en el navegador; la seguridad la dan las reglas RLS.

## Publicar
Se puede desplegar en Vercel o Netlify (build `npm run build`, carpeta `dist`). `vercel.json` ya incluye el rewrite para las rutas del frontend.
