# CIPRO · Landing page + panel de administración

Web del Círculo de Gestión de Proyectos (CIPRO). Está hecha con React, Vite, TypeScript y Tailwind CSS, y usa **Supabase** como base de datos y almacenamiento de fotos.

## Páginas
| Ruta | Qué es |
|---|---|
| `/` | Landing: hero con Scrummy, nosotros (misión, visión, pilares y valores), áreas, directiva actual, proyectos, alianzas, noticias, galería y "Únete" |
| `/integrantes` | Integrantes por ciclo (2026-1, 2026-2…) agrupados por área, con foto y botón de LinkedIn |
| `/noticias`, `/noticias/:slug` | Noticias |
| `/acceso` | Acceso de ciprianos con **DNI + código de acceso** |
| `/admin` | Panel de administración (correo + contraseña) |

## Base de datos (Supabase, proyecto "CIPRO PAG WEB")
- `periods` (ciclos), `areas`, `members` (datos públicos), `memberships` (integrante ↔ ciclo ↔ área ↔ cargo)
- `member_private`: **DNI**, correo y hash del código de acceso. Solo el admin puede leer esta tabla; nunca se muestra en la web.
- `news`, `projects`, `alliances`, `gallery`, `site_settings` (logo, Scrummy, textos)
- Bucket público `media` para las imágenes. Solo el admin puede subir archivos.
- RPC `member_login(dni, código)` (bloquea tras 5 intentos fallidos en 15 minutos) y `admin_set_member_access`.
- Los admins se definen en la tabla `admin_emails`.

## Desarrollo
```bash
npm install
npm run dev
```
Variables en `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). La clave publicable se puede exponer en el navegador; la seguridad la dan las reglas RLS.

## Publicar
Se puede desplegar en Vercel o Netlify (build `npm run build`, carpeta `dist`). `vercel.json` ya incluye el rewrite para las rutas del frontend.
