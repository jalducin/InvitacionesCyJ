# InvitacionesCyJ

Invitaciones de boda virtuales con link único por invitado.

- `index.html`: la invitación que abre cada invitado (`?b=<boda>&g=<código>`), con confirmación de asistencia.
- `editar.html`: el editor de la boda (`?b=<boda>`), protegido con la clave de edición.
- `acceso.html`: control de acceso el día del evento (`?b=<boda>`), con la clave de recepción. El QR de cada invitado abre `?b=<boda>&g=<código>`.
- `common.js`: código compartido.

Los datos viven en Supabase, detrás de la función `invitaciones`.

Al cambiar `common.js`, sube el número de `?v=` en `index.html` y `editar.html` para que los navegadores no usen la copia vieja.

## Respaldo en Deno Deploy

`main.ts` sirve las mismas páginas en Deno Deploy, por si GitHub Pages falla. En dash.deno.com: New Project → este repositorio → rama `main` → entrypoint `main.ts`. Los links que se generen desde el editor de esa dirección apuntan a esa dirección.
