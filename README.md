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
| `/academia` | **Academia CIPRO**: cursos gratuitos con lecciones, mini quizzes, examen final y certificado verificable |
| `/academia/:curso/:leccion` | Reproductor de lecciones (requiere sesión de cipriano) |
| `/academia/certificado/:codigo` | Certificado imprimible (A4) y verificación pública |
| `/admin` | Panel de administración (código universitario + contraseña, cambio de contraseña con 🔑) |

## Base de datos (Supabase, proyecto "CIPRO PAG WEB")
- `periods` (ciclos), `areas`, `members` (datos públicos), `memberships` (integrante ↔ ciclo ↔ área ↔ cargo)
- `member_private`: **DNI**, correo y hash del código de acceso. Solo el admin puede leer esta tabla; nunca se muestra en la web.
- `news`, `projects`, `alliances`, `gallery`, `site_settings` (logo, Scrummy, textos)
- Bucket público `media` para las imágenes. Solo el admin puede subir archivos.
- Edge Function `member-account` (`supabase/functions/member-account`): auto-registro de ciprianos y asignación de contraseñas por el admin. Las cuentas de ciprianos usan el **código Ulima** (`CODIGO@ciprianos.cipro.invalid`) como usuario interno (no se envían correos); el DNI es solo un dato privado.
- Los auto-registros quedan con `status = 'pendiente'` hasta que el admin los apruebe (pestaña Integrantes → ⏳ Solicitudes). Un cipriano no puede cambiar su propio estado ni su DNI (triggers `members_guard` y `member_private_guard`).
- **Código CIPRO**: cada integrante tiene un código único y permanente (tabla `member_codes`, se crea solo al insertar un integrante). El admin lo ve, copia, edita o regenera. Los integrantes que ya estaban en la web lo usan una vez en `/acceso#activar` para crear su cuenta (máx. 10 intentos fallidos por IP/hora).
- Cargos: Presidencia, Vicepresidencia, Past President, Gerente, Subgerente, Coordinación, Project Leader, Mentor, Cipriano Activo, Entry Member, Alumni. Áreas históricas (`is_historical`): Finanzas, Logística y Comunicaciones (2025).
- Ciclos desde 2021-1; el admin crea el siguiente con un clic (pestaña Ciclos) o desde la ficha del integrante.
- Los admins se definen en la tabla `admin_emails` (el login del admin usa el código universitario → `código@aloe.ulima.edu.pe`).

## Desarrollo
```bash
npm install
npm run dev
```
Variables en `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). La clave publicable se puede exponer en el navegador; la seguridad la dan las reglas RLS.

## Publicar
Se puede desplegar en Vercel o Netlify (build `npm run build`, carpeta `dist`). `vercel.json` ya incluye el rewrite para las rutas del frontend.

## Academia CIPRO
- El contenido de los cursos vive en `src/academy/*.ts` (lecciones con bloques, preguntas sin respuestas).
- Las **respuestas correctas solo están en la base de datos** (`academy_quiz_keys`, sin acceso público) y se califican en el servidor (`academy_submit_quiz`). No se guardan en este repositorio.
- Para agregar o cambiar un curso: editar el `.ts`, y registrar sus lecciones y claves en `academy_courses`, `academy_lessons` y `academy_quiz_keys`.
- Avance **secuencial**: cada lección se desbloquea al aprobar la anterior (validado también en el servidor con `academy_unlocked`).
- Lecciones con gráficos (`src/academy/Visuals.tsx`), ejemplos cotidianos y minijuegos de tarjetas.
- Aprobación: 60% por lección y 70% en el examen final. `academy_issue_certificate` emite el certificado solo si todo está aprobado; `academy_verify_certificate` lo valida públicamente.

## Pruebas
Las cuentas de prueba usan códigos Ulima `2999999x`. Al limpiar, borrar **solo esos correos exactos** (`2999999x@ciprianos.cipro.invalid`), nunca por dominio: las cuentas reales de ciprianos usan el mismo dominio interno.
