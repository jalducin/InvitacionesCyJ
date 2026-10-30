import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Esta función se autentica sola: los invitados con su token único y el editor con una clave.
// Hay tres tipos de clave: super admin (abre todas las bodas), pareja (abre la suya) y
// recepción (solo ve la lista y registra quién llegó al evento).
// Por eso verify_jwt está desactivado.
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TOKEN = /^[A-Za-z0-9]{16,40}$/;
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const MAX_UPLOAD = 8 * 1024 * 1024;
const MEDIA: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/ogg": "ogg",
};

async function sha256(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function rand(n: number) {
  // 62 * 4 = 248: se descartan los bytes >= 248 para que cada carácter sea igual de probable.
  let out = "";
  while (out.length < n) {
    for (const x of crypto.getRandomValues(new Uint8Array(n * 2))) {
      if (x < 248 && out.length < n) out += ALPHA[x % 62];
    }
  }
  return out;
}
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

async function boda(slug: unknown) {
  if (typeof slug !== "string" || !SLUG.test(slug)) return null;
  const { data } = await sb.from("bodas").select("id, slug, edit_key_hash, checkin_key_hash, config").eq("slug", slug).maybeSingle();
  return data;
}

// Devuelve la boda y el rol de la clave ("admin", "pareja" o "recepcion"), o null si no sirve.
async function bodaConClave(slug: unknown, key: unknown) {
  const b = await boda(slug);
  if (!b || typeof key !== "string" || key.length < 16 || key.length > 128) return null;
  const h = await sha256(key);
  const { data: admin } = await sb.from("boda_admins").select("id").eq("key_hash", h).maybeSingle();
  if (admin) return { b, role: "admin" as const };
  if (h === b.edit_key_hash) return { b, role: "pareja" as const };
  if (b.checkin_key_hash && h === b.checkin_key_hash) return { b, role: "recepcion" as const };
  return null;
}

// Solo admin y pareja pueden editar; la clave de recepción no.
async function bodaEditable(slug: unknown, key: unknown) {
  const a = await bodaConClave(slug, key);
  return a && a.role !== "recepcion" ? a : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ error: "Usa POST" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  try {
    switch (body.action) {
      // ---- Invitado: abre su invitación ----
      case "get": {
        const b = await boda(body.slug);
        const token = body.token;
        if (!b || typeof token !== "string" || !TOKEN.test(token)) return json({ error: "Invitación no encontrada" }, 404);
        const { data: g } = await sb
          .from("boda_invitados")
          .select("id, nombre, pases, rsvp, rsvp_pases")
          .eq("boda_id", b.id)
          .eq("token", token)
          .maybeSingle();
        if (!g) return json({ error: "Invitación no encontrada" }, 404);
        await sb.from("boda_invitados").update({ abierta_at: new Date().toISOString() }).eq("id", g.id);
        return json({
          boda: { slug: b.slug, config: b.config },
          invitado: { nombre: g.nombre, pases: g.pases, rsvp: g.rsvp, rsvp_pases: g.rsvp_pases },
        });
      }

      // ---- Invitado: confirma asistencia ----
      case "rsvp": {
        const b = await boda(body.slug);
        const token = body.token;
        if (!b || typeof token !== "string" || !TOKEN.test(token)) return json({ error: "Invitación no encontrada" }, 404);
        const { data: g } = await sb
          .from("boda_invitados")
          .select("id, pases, rsvp")
          .eq("boda_id", b.id)
          .eq("token", token)
          .maybeSingle();
        if (!g) return json({ error: "Invitación no encontrada" }, 404);
        // La respuesta es definitiva. Para cambiarla, los novios generan un link nuevo desde el editor.
        if (g.rsvp) return json({ error: "Ya habías respondido. Si necesitas cambiar tu respuesta, avísales a los novios." }, 409);
        if (body.rsvp !== "si" && body.rsvp !== "no") return json({ error: "Respuesta inválida" }, 400);
        let n = 0;
        if (body.rsvp === "si") {
          n = Math.floor(Number(body.pases));
          if (!Number.isFinite(n) || n < 1 || n > g.pases) return json({ error: `Elige de 1 a ${g.pases} pases` }, 400);
        }
        const { error } = await sb
          .from("boda_invitados")
          .update({ rsvp: body.rsvp, rsvp_pases: n, rsvp_at: new Date().toISOString() })
          .eq("id", g.id);
        if (error) throw error;
        return json({ ok: true, rsvp: body.rsvp, rsvp_pases: n });
      }

      // ---- Editor: carga la boda con sus invitados y confirmaciones ----
      case "load": {
        const a = await bodaEditable(body.slug, body.editKey);
        if (!a) return json({ error: "Clave de edición incorrecta" }, 403);
        const { data: gs, error } = await sb
          .from("boda_invitados")
          .select("token, nombre, pases, rsvp, rsvp_pases, rsvp_at, abierta_at, llegada_at, llegaron")
          .eq("boda_id", a.b.id)
          .order("created_at", { ascending: true });
        if (error) throw error;
        return json({ slug: a.b.slug, role: a.role, config: a.b.config, invitados: gs });
      }

      // ---- Super admin: genera una clave nueva para la pareja (la anterior deja de servir) ----
      case "clave_pareja": {
        const a = await bodaEditable(body.slug, body.editKey);
        if (!a) return json({ error: "Clave de edición incorrecta" }, 403);
        if (a.role !== "admin") return json({ error: "Solo el administrador puede cambiar la clave de la pareja" }, 403);
        const key = rand(32);
        const { error } = await sb
          .from("bodas")
          .update({ edit_key_hash: await sha256(key), updated_at: new Date().toISOString() })
          .eq("id", a.b.id);
        if (error) throw error;
        return json({ ok: true, clave: key });
      }

      // ---- Admin o pareja: genera la clave de recepción (la anterior deja de servir) ----
      case "clave_recepcion": {
        const a = await bodaEditable(body.slug, body.editKey);
        if (!a) return json({ error: "Clave de edición incorrecta" }, 403);
        const key = rand(32);
        const { error } = await sb.from("bodas").update({ checkin_key_hash: await sha256(key) }).eq("id", a.b.id);
        if (error) throw error;
        return json({ ok: true, clave: key });
      }

      // ---- Control de acceso: lista para la entrada del evento ----
      case "acceso_load": {
        const a = await bodaConClave(body.slug, body.editKey);
        if (!a) return json({ error: "Clave incorrecta" }, 403);
        const { data: gs, error } = await sb
          .from("boda_invitados")
          .select("token, nombre, pases, rsvp, rsvp_pases, llegada_at, llegaron")
          .eq("boda_id", a.b.id)
          .order("nombre", { ascending: true });
        if (error) throw error;
        const c = (a.b.config ?? {}) as Record<string, unknown>;
        return json({
          role: a.role,
          boda: { n1: c.n1 ?? "", n2: c.n2 ?? "", date: c.date ?? "", time: c.time ?? "", venue: c.venue ?? "" },
          invitados: gs,
        });
      }

      // ---- Control de acceso: registra cuántas personas llegaron (0 lo deshace) ----
      case "checkin": {
        const a = await bodaConClave(body.slug, body.editKey);
        if (!a) return json({ error: "Clave incorrecta" }, 403);
        const token = body.token;
        if (typeof token !== "string" || !TOKEN.test(token)) return json({ error: "Invitado no encontrado" }, 404);
        const { data: g } = await sb
          .from("boda_invitados")
          .select("id, pases")
          .eq("boda_id", a.b.id)
          .eq("token", token)
          .maybeSingle();
        if (!g) return json({ error: "Invitado no encontrado" }, 404);
        const n = Math.floor(Number(body.personas));
        if (!Number.isFinite(n) || n < 0 || n > g.pases) return json({ error: `Pueden llegar de 0 a ${g.pases} personas` }, 400);
        const llegada_at = n ? new Date().toISOString() : null;
        const { error } = await sb.from("boda_invitados").update({ llegaron: n || null, llegada_at }).eq("id", g.id);
        if (error) throw error;
        return json({ ok: true, llegaron: n || null, llegada_at });
      }

      // ---- Editor: guarda la boda y sincroniza invitados ----
      case "save": {
        const a = await bodaEditable(body.slug, body.editKey);
        if (!a) return json({ error: "Clave de edición incorrecta" }, 403);
        const b = a.b;
        const config = body.config;
        if (typeof config !== "object" || config === null || Array.isArray(config)) return json({ error: "Config inválida" }, 400);
        if (JSON.stringify(config).length > 200_000) return json({ error: "La configuración es demasiado grande" }, 413);

        const incoming = Array.isArray(body.invitados) ? body.invitados : [];
        if (incoming.length > 500) return json({ error: "Máximo 500 invitados" }, 400);
        const rows: { boda_id: string; token: string; nombre: string; pases: number }[] = [];
        const seen = new Set<string>();
        for (const g of incoming as Record<string, unknown>[]) {
          const token = str(g.token, 40);
          const nombre = str(g.nombre, 120).trim();
          const pases = Math.floor(Number(g.pases));
          if (!TOKEN.test(token) || seen.has(token)) return json({ error: "Código de invitado inválido o repetido" }, 400);
          if (!nombre) return json({ error: "Hay un invitado sin nombre" }, 400);
          if (!Number.isFinite(pases) || pases < 1 || pases > 20) return json({ error: "Los pases deben ser de 1 a 20" }, 400);
          seen.add(token);
          rows.push({ boda_id: b.id, token, nombre, pases });
        }
        if (rows.length) {
          const { data: clash } = await sb
            .from("boda_invitados")
            .select("token")
            .in("token", rows.map((r) => r.token))
            .neq("boda_id", b.id);
          if (clash && clash.length) return json({ error: "Un código ya lo usa otra boda" }, 409);
        }

        const { error: e1 } = await sb
          .from("bodas")
          .update({ config, updated_at: new Date().toISOString() })
          .eq("id", b.id);
        if (e1) throw e1;

        const { data: existing } = await sb.from("boda_invitados").select("token, rsvp, rsvp_pases").eq("boda_id", b.id);
        if (rows.length) {
          const { error: e2 } = await sb.from("boda_invitados").upsert(rows, { onConflict: "token" });
          if (e2) throw e2;
        }
        // Si a alguien que ya confirmó le bajaron los pases, su confirmación no puede pasar del nuevo límite.
        const before = new Map((existing ?? []).map((x) => [x.token, x]));
        for (const r of rows) {
          const old = before.get(r.token);
          if (old?.rsvp === "si" && (old.rsvp_pases ?? 0) > r.pases) {
            const { error: e4 } = await sb
              .from("boda_invitados")
              .update({ rsvp_pases: r.pases })
              .eq("boda_id", b.id)
              .eq("token", r.token);
            if (e4) throw e4;
          }
        }
        const gone = (existing ?? []).map((x) => x.token).filter((t) => !seen.has(t));
        if (gone.length) {
          const { error: e3 } = await sb.from("boda_invitados").delete().eq("boda_id", b.id).in("token", gone);
          if (e3) throw e3;
        }
        return json({ ok: true, invitados: rows.length });
      }

      // ---- Editor: sube una imagen o canción ----
      case "upload": {
        const a = await bodaEditable(body.slug, body.editKey);
        if (!a) return json({ error: "Clave de edición incorrecta" }, 403);
        const type = str(body.contentType, 60);
        const ext = MEDIA[type];
        if (!ext) return json({ error: "Formato no permitido. Usa JPG, PNG, WEBP, MP3 o M4A" }, 400);
        const b64 = str(body.dataBase64, MAX_UPLOAD * 2);
        if (!b64) return json({ error: "Archivo vacío" }, 400);
        let bytes: Uint8Array;
        try {
          bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        } catch {
          return json({ error: "Archivo dañado" }, 400);
        }
        if (bytes.length > MAX_UPLOAD) return json({ error: "El archivo pesa más de 8 MB" }, 413);
        const path = `${a.b.slug}/${rand(14)}.${ext}`;
        const { error } = await sb.storage.from("boda-media").upload(path, bytes, { contentType: type, upsert: false });
        if (error) throw error;
        return json({ url: sb.storage.from("boda-media").getPublicUrl(path).data.publicUrl });
      }

      default:
        return json({ error: "Acción desconocida" }, 400);
    }
  } catch (e) {
    console.error("invitaciones error", e);
    return json({ error: "Error del servidor" }, 500);
  }
});
