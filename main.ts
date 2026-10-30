// Respaldo en Deno Deploy: sirve las mismas páginas que GitHub Pages (index.html, editar.html, acceso.html, common.js).
// GitHub Pages ignora este archivo.
import { serveDir } from "jsr:@std/http@1.0.10/file-server";

const PUBLIC = new Set(["/", "/index.html", "/editar.html", "/acceso.html", "/common.js"]);

Deno.serve((req) => {
  const path = new URL(req.url).pathname;
  if (!PUBLIC.has(path)) return new Response("No encontrado", { status: 404 });
  return serveDir(req, { fsRoot: ".", quiet: true });
});
