// Código compartido por la invitación (index.html) y el editor (editar.html).
const API = "https://xozsrcnjnugwbrrrwoeb.supabase.co/functions/v1/invitaciones";
const ANON = "sb_publishable_JTpUJ8sS-BQU2dObI_ps7A_Kd_A-Tcx";

async function api(body) {
  let res;
  try {
    res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.");
  }
  let data = {};
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

// Fondos de la portada. `tone` es el color del texto que mejor se lee encima.
const PRESETS = {
  jardin: {
    label: "Jardín",
    tone: "light",
    css: "radial-gradient(120% 80% at 20% 10%, #6FA58A 0%, transparent 60%), radial-gradient(100% 70% at 90% 90%, #2F5D4E 0%, transparent 65%), #3E7563",
  },
  atardecer: {
    label: "Atardecer",
    tone: "light",
    css: "radial-gradient(110% 80% at 80% 0%, #F2A16B 0%, transparent 60%), radial-gradient(100% 80% at 10% 100%, #8E3B64 0%, transparent 65%), #C65D6E",
  },
  noche: {
    label: "Noche",
    tone: "light",
    css: "radial-gradient(100% 70% at 70% 10%, #3C4A8F 0%, transparent 60%), radial-gradient(90% 60% at 10% 100%, #1B2147 0%, transparent 70%), #111634",
  },
  marmol: { label: "Mármol", tone: "dark", css: "linear-gradient(135deg, #ECEAF0 0%, #CFCBD8 45%, #E8E5EE 100%)" },
};

const DEFAULT_CONFIG = {
  n1: "",
  n2: "",
  date: "",
  time: "",
  venue: "",
  city: "",
  mapUrl: "",
  note: "",
  schedule: [],
  bgKind: "preset",
  preset: "jardin",
  image: null,
  overlay: 30,
  tone: "light", // color del texto: "light" (claro) o "dark" (oscuro)
  photos: [],
  photosTitle: "Nuestra sesión de fotos",
  songSrc: "none", // "none", "demo" o "file"
  songUrl: null,
  songTitle: "",
  volume: 60,
  template: "clasico", // estilo del mensaje de WhatsApp
  details: false,
};

function normalizeConfig(c) {
  c = { ...DEFAULT_CONFIG, ...(c || {}) };
  if (!PRESETS[c.preset]) c.preset = "jardin";
  if (c.songSrc !== "none" && c.songSrc !== "demo") c.songSrc = c.songUrl ? "file" : "none";
  if (!Array.isArray(c.schedule)) c.schedule = [];
  if (!Array.isArray(c.photos)) c.photos = [];
  return c;
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

const safeUrl = (u) => (typeof u === "string" && /^https:\/\//i.test(u.trim()) ? u.trim() : "");
const plural = (n) => (n === 1 ? "1 pase" : `${n} pases`);

function coupleShort(c) {
  // "José de Jesús López" → "José de Jesús"; "Cynthia Paola" → "Cynthia"
  const short = (full) => {
    const p = String(full || "").trim().split(/\s+/);
    return p[1] && /^(de|del)$/i.test(p[1]) && p[2] ? p.slice(0, 3).join(" ") : p[0] || "";
  };
  return [short(c.n1), short(c.n2)].filter(Boolean).join(" y ");
}

function parseDate(s) {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return y ? new Date(y, m - 1, d) : null;
}
const fmtLong = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtShort = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" });

function t12(s) {
  if (!s) return "";
  let [h, m] = s.split(":").map(Number);
  const ap = h >= 12 ? "p. m." : "a. m.";
  h = h % 12 || 12;
  return `${h}:${String(m || 0).padStart(2, "0")} ${ap}`;
}
function timeRange(a, b) {
  if (a && b) {
    const x = t12(a), y = t12(b);
    const ax = x.slice(x.indexOf(" ") + 1), ay = y.slice(y.indexOf(" ") + 1);
    return ax === ay ? `${x.slice(0, x.indexOf(" "))} – ${y}` : `${x} – ${y}`;
  }
  return t12(a || b);
}

function countdownText(date) {
  const d = parseDate(date);
  if (!d) return "";
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const days = Math.round((d - t) / 864e5);
  return days > 1 ? `Faltan ${days} días` : days === 1 ? "Es mañana" : days === 0 ? "¡Es hoy!" : "";
}

// ---------- Mensajes de WhatsApp ----------
const MSG_TEMPLATES = {
  clasico: { label: "Clásico", fn: (n, p, u) => `¡Hola ${n}! 💌 Esta es tu invitación (${p}):\n${u}` },
  formal: { label: "Formal", fn: (n, p, u) => `Estimado/a ${n}, con mucho gusto te compartimos tu invitación (${p}):\n${u}` },
  divertido: { label: "Divertido", fn: (n, p, u) => `¡${n}! 🎉 Aparta la fecha, aquí está tu invitación (${p}):\n${u}` },
  recordatorio: { label: "Recordatorio para confirmar", fn: (n, p, u) => `¡Hola ${n}! 💌 Te recordamos confirmar tu asistencia (${p}) aquí:\n${u}` },
};

function buildMessage(c, guest, url) {
  const name = String(guest.nombre || "").trim() || "invitado";
  let msg = (MSG_TEMPLATES[c.template] || MSG_TEMPLATES.clasico).fn(name, plural(Number(guest.pases) || 1), url);
  if (c.details) {
    const d = parseDate(c.date);
    const bits = [];
    if (d) bits.push(fmtShort.format(d) + (c.time ? `, ${c.time} h` : ""));
    const place = [c.venue, c.city].filter(Boolean).join(", ");
    if (place) bits.push(place);
    msg += "\n";
    if (bits.length) msg += `\n📅 ${bits.join(" · ")}`;
    (c.schedule || []).forEach((s) => {
      if (s.label || s.from) msg += `\n• ${timeRange(s.from, s.to)} ${s.label || ""}`.trimEnd();
    });
    if (safeUrl(c.mapUrl)) msg += `\n📍 ${safeUrl(c.mapUrl)}`;
  }
  return msg;
}

// ---------- Invitación ----------
function bgLayers(c) {
  const img = c.bgKind === "image" && safeUrl(c.image);
  const bg = img
    ? `background-image:url("${encodeURI(img).replace(/'/g, "%27")}");background-size:cover;background-position:center`
    : `background:${(PRESETS[c.preset] || PRESETS.jardin).css}`;
  const a = Math.min(80, Math.max(0, Number(c.overlay) || 0)) / 100;
  const shade = c.tone === "dark" ? `rgba(255,255,255,${a})` : `rgba(20,22,40,${a})`;
  return `<div class="bgimg" style='${bg}'></div><div class="shade" style="background:${shade}"></div>`;
}

// Devuelve el HTML de la invitación. `guest` es opcional ({nombre, pases}).
function renderInvitation(c, guest) {
  c = normalizeConfig(c);
  const d = parseDate(c.date);
  const longest = Math.max((c.n1 || "").length, (c.n2 || "").length);
  const namesSize = longest > 22 ? "font-size:clamp(28px,8vw,34px)" : longest > 13 ? "font-size:clamp(34px,10vw,42px)" : "";
  const sched = (c.schedule || []).filter((s) => s && (s.label || s.from));
  const photos = (c.photos || []).map(safeUrl).filter(Boolean);
  const map = safeUrl(c.mapUrl);
  const hasSong = c.songSrc === "demo" || (c.songSrc === "file" && safeUrl(c.songUrl));

  return `
  <article class="inv">
    <section class="card${c.tone === "dark" ? " dark-text" : ""}">
      ${bgLayers(c)}
      ${hasSong ? `<button type="button" class="music-btn" aria-pressed="false">♪ Reproducir</button>` : ""}
      <div class="inner">
        <div class="kicker">Nos casamos</div>
        <h1 class="names" style="${namesSize}"><span>${esc(c.n1 || "Nombre")}</span><span class="amp">&amp;</span><span>${esc(c.n2 || "Nombre")}</span></h1>
        <div class="rule"></div>
        <div class="date">${d ? esc(cap(fmtLong.format(d))) : "Fecha por definir"}</div>
        ${c.time ? `<div class="meta">${esc(c.time)} h</div>` : ""}
        ${c.venue || c.city ? `<div class="meta">${esc([c.venue, c.city].filter(Boolean).join(" · "))}</div>` : ""}
        ${
          sched.length
            ? `<div class="sched">${sched
                .map((s) => `<div><b>${esc(timeRange(s.from, s.to))}</b>${s.label ? ` · ${esc(s.label)}` : ""}</div>`)
                .join("")}</div>`
            : ""
        }
        ${map ? `<a class="maplink" href="${esc(map)}" target="_blank" rel="noopener noreferrer">Ver ubicación</a>` : ""}
        ${c.note ? `<div class="note">${esc(c.note)}</div>` : ""}
        ${countdownText(c.date) ? `<div class="count">${esc(countdownText(c.date))}</div>` : ""}
        <a class="rsvp" href="#confirmar">Confirmar asistencia</a>
        ${guest ? `<div class="pases">✦ ${esc(String(guest.nombre || "").trim() || "Invitado")} · ${plural(Number(guest.pases) || 1)}</div>` : ""}
        ${hasSong ? `<div class="song">♪ ${esc(c.songTitle || "Canción")}</div>` : ""}
      </div>
    </section>

    ${
      photos.length
        ? `<section class="gallery">
        <h2>${esc(c.photosTitle || "")}</h2>
        <div class="gal-grid">${photos
          .map((u, i) => `<button type="button" data-i="${i}" aria-label="Ampliar foto ${i + 1}"><img src="${esc(u)}" alt="" loading="lazy"></button>`)
          .join("")}</div>
      </section>`
        : ""
    }

    <section class="rsvp-slot" id="confirmar"></section>
  </article>`;
}

// Activa la galería y el botón de música dentro de `root`.
function wireInvitation(root, c, player) {
  c = normalizeConfig(c);
  const photos = (c.photos || []).map(safeUrl).filter(Boolean);
  root.querySelectorAll(".gal-grid button").forEach((b) =>
    b.addEventListener("click", () => openLightbox(photos[Number(b.dataset.i)]))
  );
  const mb = root.querySelector(".music-btn");
  if (mb && player) {
    const paint = () => {
      mb.setAttribute("aria-pressed", String(player.playing));
      mb.textContent = player.playing ? "❚❚ Pausar" : "♪ Reproducir";
    };
    player.onchange = paint;
    mb.addEventListener("click", () => player.toggle());
    paint();
  } else if (mb) mb.hidden = true;
}

function openLightbox(src) {
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-label", "Foto ampliada");
  lb.innerHTML = `<img src="${esc(src)}" alt=""><button type="button">Cerrar</button>`;
  const close = () => {
    lb.remove();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => e.key === "Escape" && close();
  lb.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  document.body.appendChild(lb);
  lb.querySelector("button").focus();
}

// ---------- Música ----------
// Reproduce la melodía de ejemplo (sintetizada) o la canción subida.
function createPlayer() {
  const CHORDS = [
    [261.63, 329.63, 392.0, 493.88],
    [220.0, 261.63, 329.63, 392.0],
    [174.61, 220.0, 261.63, 329.63],
    [196.0, 246.94, 293.66, 392.0],
  ];
  const audio = new Audio();
  audio.loop = true;
  audio.preload = "none";
  let ctx = null, master = null, timer = null, chord = 0, loaded = null;
  let src = "none", url = null, volume = 0.6;

  const p = {
    playing: false,
    onchange: null,
    set(cfg) {
      const nextSrc = cfg.songSrc, nextUrl = safeUrl(cfg.songUrl);
      if (nextSrc !== src || nextUrl !== url) p.stop();
      src = nextSrc;
      url = nextUrl;
      p.setVolume((Number(cfg.volume) || 0) / 100);
    },
    setVolume(v) {
      volume = v;
      audio.volume = v;
      if (master) master.gain.value = v * 0.12;
    },
    play() {
      if (src === "demo") {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try {
          ctx = ctx || new AC();
          if (ctx.state === "suspended") ctx.resume();
          master = ctx.createGain();
          master.gain.value = volume * 0.12;
          master.connect(ctx.destination);
          const m = master;
          (function tick() {
            const t = ctx.currentTime;
            CHORDS[chord++ % CHORDS.length].forEach((f) => {
              const o = ctx.createOscillator(), g = ctx.createGain();
              o.type = "sine";
              o.frequency.value = f;
              g.gain.setValueAtTime(0, t);
              g.gain.linearRampToValueAtTime(1, t + 1);
              g.gain.linearRampToValueAtTime(0, t + 4.6);
              o.connect(g);
              g.connect(m);
              o.start(t);
              o.stop(t + 4.7);
            });
            timer = setTimeout(tick, 4000);
          })();
          p.playing = true;
        } catch {
          p.playing = false;
        }
        p.onchange && p.onchange();
      } else if (src === "file" && url) {
        if (loaded !== url) {
          audio.src = url;
          loaded = url;
        }
        audio.volume = volume;
        audio.play().then(
          () => { p.playing = true; p.onchange && p.onchange(); },
          () => { p.playing = false; p.onchange && p.onchange(); }
        );
      }
    },
    stop() {
      clearTimeout(timer);
      if (master && ctx) {
        try { master.gain.setTargetAtTime(0, ctx.currentTime, 0.15); } catch {}
      }
      master = null;
      audio.pause();
      if (p.playing) {
        p.playing = false;
        p.onchange && p.onchange();
      }
    },
    toggle() {
      p.playing ? p.stop() : p.play();
    },
  };
  return p;
}

const INVITATION_CSS = `
.inv{--inv-light:#fff;--inv-dark:#1A1B2E;--paper:#FBFAF7;--paper-ink:#1A1B2E;--paper-muted:#5E6180;--rose:#A8325A;max-width:560px;margin:0 auto;background:var(--paper);color:var(--paper-ink);font-family:'Figtree',system-ui,sans-serif}
.inv .card{position:relative;min-height:100svh;overflow:hidden;isolation:isolate;color:var(--ink,var(--inv-light));display:flex}
.inv .card.dark-text{--ink:var(--inv-dark)}
.inv .card .bgimg,.inv .card .shade{position:absolute;inset:0;z-index:-1}
.inv .card .inner{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;padding:64px 24px 40px}
.inv .kicker{font:600 11px/1 'Figtree',sans-serif;letter-spacing:.28em;text-transform:uppercase;opacity:.85}
.inv .names{font:600 clamp(40px,13vw,54px)/.95 'Cormorant Garamond',Georgia,serif;margin:6px 0 2px;overflow-wrap:anywhere;display:flex;flex-direction:column}
.inv .amp{font:italic 500 26px/1 'Cormorant Garamond',Georgia,serif;opacity:.85;display:block;margin:4px 0}
.inv .rule{width:44px;height:1px;background:currentColor;opacity:.6;margin:6px 0}
.inv .date{font:600 20px/1.2 'Cormorant Garamond',Georgia,serif}
.inv .meta{font-size:14px;opacity:.92}
.inv .sched{display:grid;gap:3px;font-size:13px;padding:8px 0;margin:2px 0;border-block:1px solid color-mix(in srgb,currentColor 35%,transparent);width:100%;max-width:270px}
.inv .sched b{font-weight:600}
.inv .maplink,.inv .rsvp{color:inherit;text-decoration:none;border:1.5px solid currentColor;border-radius:999px}
.inv .maplink{font:600 12px/1 'Figtree',sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:9px 15px;margin-top:2px}
.inv .maplink:hover,.inv .rsvp:hover{background:rgba(255,255,255,.18)}
.inv .note{font:italic 500 18px/1.3 'Cormorant Garamond',Georgia,serif;max-width:26ch;opacity:.95}
.inv .count{font:600 11px/1 'Figtree',sans-serif;letter-spacing:.14em;text-transform:uppercase;opacity:.8}
.inv .rsvp{margin-top:8px;padding:11px 20px;font:600 13px/1 'Figtree',sans-serif}
.inv .pases{font-size:13px;padding:8px 16px;border-radius:999px;border:1px solid currentColor;margin-top:4px}
.inv .song{font-size:12px;letter-spacing:.06em;opacity:.85}
.inv .music-btn{position:absolute;top:14px;right:14px;z-index:2;display:inline-flex;align-items:center;gap:6px;padding:8px 13px;font:600 12px/1 'Figtree',sans-serif;color:inherit;background:rgba(0,0,0,.18);border:1.5px solid currentColor;border-radius:999px;backdrop-filter:blur(4px);cursor:pointer}
.inv .card.dark-text .music-btn{background:rgba(255,255,255,.35)}
.inv .music-btn[aria-pressed=true]{background:rgba(255,255,255,.22)}
.inv .gallery{padding:36px 16px 8px}
.inv .gallery h2{font:600 28px/1.1 'Cormorant Garamond',Georgia,serif;text-align:center;margin:0 0 14px;text-wrap:balance}
.inv .gal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.inv .gal-grid button{padding:0;border:0;border-radius:6px;overflow:hidden;aspect-ratio:1;background:#eceae4;display:block;cursor:zoom-in}
.inv .gal-grid img{width:100%;height:100%;object-fit:cover;display:block}
.inv .rsvp-slot{padding:36px 20px 48px;text-align:center}
.inv .rsvp-slot:empty{display:none}
.inv .rsvp-slot h2{font:600 28px/1.1 'Cormorant Garamond',Georgia,serif;margin:0 0 16px}
.lightbox{position:fixed;inset:0;z-index:100;background:rgba(8,9,20,.9);display:flex;align-items:center;justify-content:center;padding:16px;cursor:zoom-out}
.lightbox img{max-width:94vw;max-height:88vh;border-radius:8px;object-fit:contain}
.lightbox button{position:absolute;top:12px;right:12px;font:500 14px 'Figtree',sans-serif;padding:8px 13px;border-radius:7px;border:0;background:#fff;color:#16182B;cursor:pointer}
`;

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Figtree:wght@400;500;600&display=swap";
