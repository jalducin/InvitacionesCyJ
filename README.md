# InvitacionesCyJ

Invitaciones de boda virtuales con link único por invitado.

- `index.html`: la invitación que abre cada invitado (`?b=<boda>&g=<código>`), con confirmación de asistencia.
- `editar.html`: el editor de la boda (`?b=<boda>`), protegido con la clave de edición.
- `common.js`: código compartido.

Los datos viven en Supabase, detrás de la función `invitaciones`.
