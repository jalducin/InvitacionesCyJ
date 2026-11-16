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
  floral: {
    label: "Beige floral",
    tone: "dark",
    css: "radial-gradient(80% 55% at 50% 42%, #FBF8F2 0%, transparent 70%), linear-gradient(180deg, #F3EBDF 0%, #EADFCF 100%)",
  },
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
  // Papás de cada uno: p1a/p1b de Nombre 1, p2a/p2b de Nombre 2
  p1a: "",
  p1b: "",
  p2a: "",
  p2b: "",
  // Regalos: se muestran solo si giftsOn. Los datos de transferencia quedan tras un botón.
  // Ubicación
  venuePhoto: null, // foto de la fachada del salón
  address: "",
  parking: false,
  showMap: true, // mapa de Google dentro de la invitación
  // Código de vestimenta
  dressOn: false,
  dressType: "Formal",
  dressText: "Nos encantaría verte elegante para esta ocasión especial. Te pedimos reservar el color blanco para la novia y el beige para el novio.",
  giftsOn: false,
  giftsTitle: "Lluvia de sobres",
  giftsText: "Tu presencia es nuestro mejor regalo. Si además deseas tener un detalle con nosotros, el día de la boda habrá una lluvia de sobres.",
  giftBank: "",
  giftHolder: "",
  giftAccount: "",
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
  // Efectos
  fx: "fade", // animación al bajar: "fade", "zoom", "slide" o "none"
  fxSpeed: "normal", // "lento", "normal" o "rapido"
  coverIn: true, // nombres y fecha de la portada aparecen uno por uno
  parallax: true, // el fondo de la portada se mueve más lento al bajar
  particles: "none", // "none", "petalos", "corazones", "destellos" o "sobres"
  intro: "sobre", // pantalla de entrada: "sobre" (con iniciales) o "simple"
  // Diseño
  theme: "floral", // "floral": fondo beige con marco de flores blancas y sobre rosa; "clasico": el fondo elegido
  bow: true, // novios chibi en la portada (diseño floral)
  chibiImg: "novios.webp", // imagen de los novios chibi (archivo del sitio o link https); vacío = el dibujo incluido
  coverNames: "Jesús & Cynthia", // lo único que dice el sobre y la portada en el diseño floral
  qrOn: false, // pase de entrada con código QR al confirmar
  endText: "Lo nuestro siempre fue amor, y nuestra mayor alegría será compartirlo contigo", // cierre de la invitación; vacío = nombres y año
  menu: true, // menú fijo abajo para brincar entre secciones
  coverVideoOn: true, // video en movimiento, sin sonido, de fondo en la portada
  coverVideo: "portada.mp4", // archivo del repositorio (portada.mp4) o link https a un .mp4
  coverPoster: "portada.jpg", // imagen que se ve mientras carga el video
};
const THEMES = { floral: "Beige floral", clasico: "Clásico (el fondo que elijas)" };

// ---------- Íconos del programa ----------
const ICON_PATHS = {
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  anillos: '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M10 5l2-2 2 2-2 2z"/>',
  civil: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
  iglesia: '<path d="M12 2v4M10 4h4M6 22V11l6-5 6 5v11M10 22v-5h4v5M3 22h18"/>',
  copa: '<path d="M8 3h8v4a4 4 0 0 1-8 0z"/><path d="M12 11v8M8 21h8"/>',
  cubiertos: '<path d="M5 3v5a2 2 0 0 0 4 0V3M7 10v11"/><path d="M17 3c-2.5 2-2.5 7 0 8v10"/>',
  musica: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  pastel: '<path d="M4 21h16M5 21v-7h14v7M7 14v-3h10v3M12 11V8"/><circle cx="12" cy="6" r="1"/>',
  camara: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 7l2-3h4l2 3"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  coche: '<path d="M3 17v-4l2.5-6h13L21 13v4z"/><path d="M3 13h18"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>',
  traje: '<path d="M8 3l4 5 4-5 4 3-2 5h-2v10H8V11H6L4 6z"/><path d="M12 8v13M10 12h.01M10 16h.01"/>',
  vestido: '<path d="M9 3h6l-1 6 5 12H5l5-12z"/><path d="M9.5 9h5"/>',
  rama: '<path d="M12 22V9"/><path d="M12 15c-3.5 0-5.5-2.2-5.5-5.5 3.5 0 5.5 2.2 5.5 5.5zM12 12c3.5 0 5.5-2.2 5.5-5.5-3.5 0-5.5 2.2-5.5 5.5zM12 9c0-2.4 1-4.3 0-6-1 1.7 0 3.6 0 6z"/>',
  sobre: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  corazon: '<path d="M12 20s-7-4.4-9-8.6A5 5 0 0 1 12 7a5 5 0 0 1 9 4.4C19 15.6 12 20 12 20z"/>',
};
const ICON_LABELS = {
  "": "Automático",
  reloj: "Reloj",
  anillos: "Anillos",
  civil: "Firma civil",
  iglesia: "Iglesia",
  copa: "Copa / recepción",
  cubiertos: "Comida / cena",
  musica: "Música / baile",
  pastel: "Pastel",
  camara: "Fotos",
  corazon: "Corazón",
};

// Si no eligieron ícono, se adivina por el nombre del momento.
function guessIcon(label) {
  const t = String(label || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (/civil|firma/.test(t)) return "civil";
  if (/iglesia|misa|religios|templo|parroquia/.test(t)) return "iglesia";
  if (/ceremonia|votos|boda|anillo/.test(t)) return "anillos";
  if (/recepcion|coctel|brindis|bienvenida/.test(t)) return "copa";
  if (/cena|comida|banquete|desayuno|almuerzo|taquiza|botana/.test(t)) return "cubiertos";
  if (/baile|fiesta|dj|vals|musica|grupo|mariachi/.test(t)) return "musica";
  if (/pastel|postre/.test(t)) return "pastel";
  if (/foto|sesion/.test(t)) return "camara";
  return "reloj";
}

function iconSvg(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.reloj}</svg>`;
}

// ---------- Entrada ----------
const INTROS = { sobre: "Sobre con iniciales", kraft: "Sobre kraft (pantalla completa)", simple: "Sencilla" };

function initials(c) {
  const a = String(c.n1 || "").trim().charAt(0).toUpperCase();
  const b = String(c.n2 || "").trim().charAt(0).toUpperCase();
  return [a, b].filter(Boolean).join(" & ") || "♥";
}

// Muestra la pantalla de entrada sobre toda la página. `onTap` corre en el mismo toque
// (ahí empieza la música: Safari solo deja sonar audio dentro del toque) y `onOpen`
// cuando termina de abrirse el sobre (ahí empieza la animación de la portada).
function mountGate(c, onOpen, onTap) {
  c = normalizeConfig(c);
  const gate = document.createElement("div");
  gate.className = "gate" + (c.intro === "sobre" ? " gate-env" : c.intro === "kraft" ? " gate-kraft" : "") + (c.theme === "floral" ? " floral" : "");
  if (c.intro === "kraft") {
    // Sobre de papel kraft a pantalla completa con sello de cera; adentro, la tarjeta con la foto de la pareja.
    const photo = (c.bgKind === "image" && safeUrl(c.image)) || (c.photos || []).map(safeUrl).find(Boolean) || "";
    const bg = photo ? `background-image:url("${encodeURI(photo).replace(/'/g, "%27")}")` : `background:${(PRESETS[c.preset] || PRESETS.jardin).css}`;
    const d = parseDate(c.date);
    const month = d ? new Intl.DateTimeFormat("es-MX", { month: "long" }).format(d) : "";
    gate.innerHTML = `
      <div class="k-card"><div class="k-photo" style='${bg}'></div>
        <div class="k-txt">
          <p class="k-script">Nuestra boda</p>
          <p class="k-small">Junto con nuestras familias</p>
          <p class="k-names">${esc(coupleShort(c))}</p>
          ${
            d
              ? `<p class="k-date"><span>${esc(month)}</span><b>${d.getDate()}</b><span>${d.getFullYear()}</span>${c.time ? `<i></i><span>${esc(t12(c.time))}</span>` : ""}</p>`
              : ""
          }
        </div></div>
      <div class="k-wrap k-left"><div class="k-flap"></div></div>
      <div class="k-wrap k-right"><div class="k-flap"></div></div>
      <div class="k-wrap k-bottom"><div class="k-flap"></div></div>
      <div class="k-wrap k-top"><div class="k-flap"></div></div>
      <button type="button" class="k-seal" aria-label="Abrir la invitación">${iconSvg("anillos")}</button>
      <p class="k-tap">Toca el sello para abrir</p>`;
  } else if (c.intro === "sobre" && c.theme === "floral") {
    const [a, b] = coverPair(c);
    const ini = [a, b].filter(Boolean).map((x) => x.charAt(0).toUpperCase()).join(" & ") || "♥";
    gate.innerHTML = `
      <h2 class="gate-names">${esc(coverText(c))}</h2>
      <div class="env" role="button" tabindex="0" aria-label="Abrir la invitación">
        <div class="env-back"></div>
        <div class="env-letter"><span>${esc(coverText(c))}</span></div>
        <div class="env-pocket"></div>
        <div class="env-flap"></div>
        <div class="env-seal">${esc(ini)}</div>
      </div>
      <p class="gate-tap">Toca el sello para abrir</p>`;
  } else if (c.intro === "sobre") {
    gate.innerHTML = `
      <p class="gate-k">Estás invitado a la boda de</p>
      <h2 class="gate-names">${esc(coupleShort(c))}</h2>
      <div class="env" role="button" tabindex="0" aria-label="Abrir la invitación">
        <div class="env-back"></div>
        <div class="env-letter"><span>${esc(initials(c))}</span><small>Nos casamos</small></div>
        <div class="env-pocket"></div>
        <div class="env-flap"></div>
        <div class="env-seal">${esc(initials(c))}</div>
      </div>
      <p class="gate-tap">Toca el sello para abrir</p>`;
  } else {
    gate.innerHTML = `<p class="gate-k">Estás invitado a la boda de</p><h2 class="gate-names">${esc(coupleShort(c))}</h2><button type="button" class="gate-btn">Toca para entrar</button>`;
  }
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    gate.classList.add("leaving");
    if (onOpen) setTimeout(onOpen, 100);
    setTimeout(() => gate.remove(), 800);
  };
  const open = () => {
    // En el sobre kraft, un segundo toque se salta la pausa con la tarjeta.
    if (gate.classList.contains("opening")) return c.intro === "kraft" && finish();
    gate.classList.add("opening");
    if (onTap) onTap();
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Cuánto dura la apertura antes de mostrar la invitación, según la entrada.
    // El kraft se queda abierto a medias unos segundos para lucir la tarjeta con el sobre.
    const t = still || c.intro === "simple" ? 0 : c.intro === "kraft" ? 4600 : 1400;
    setTimeout(finish, t);
  };
  gate.addEventListener("click", open);
  gate.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && open());
  document.body.appendChild(gate);
  return gate;
}

// Opciones de efectos que ofrece el editor.
const FX = { fade: "Aparecer suave", zoom: "Acercar", slide: "Deslizar de lado", none: "Sin animación" };
const FX_SPEED = { lento: ["Lento", 1.4], normal: ["Normal", 0.9], rapido: ["Rápido", 0.5] };
const PARTICLES = { none: "Ninguna", petalos: "Pétalos", corazones: "Corazones", destellos: "Destellos", sobres: "Lluvia de sobres" };

function particlesHtml(kind) {
  if (kind === "none") return "";
  const ch = kind === "corazones" ? "♥" : kind === "destellos" ? "✦" : kind === "sobres" ? "✉" : "";
  let out = "";
  for (let i = 0; i < 16; i++) {
    // Valores repartidos pero fijos, para que la portada se vea igual en cada carga.
    const x = (i * 61) % 100, dur = 9 + ((i * 7) % 8), delay = -((i * 13) % 17), size = 10 + ((i * 5) % 12);
    const dx = ((i % 2 ? 1 : -1) * (20 + ((i * 11) % 40))) + "px";
    out += `<i style="--x:${x}%;--du:${dur}s;--dl:${delay}s;--sz:${size}px;--dx:${dx}">${ch}</i>`;
  }
  return `<div class="particles ${kind}" aria-hidden="true">${out}</div>`;
}

function normalizeConfig(c) {
  c = { ...DEFAULT_CONFIG, ...(c || {}) };
  if (!PRESETS[c.preset]) c.preset = "jardin";
  if (c.songSrc !== "none" && c.songSrc !== "demo") c.songSrc = c.songUrl ? "file" : "none";
  if (!Array.isArray(c.schedule)) c.schedule = [];
  if (!Array.isArray(c.photos)) c.photos = [];
  if (!FX[c.fx]) c.fx = "fade";
  if (!FX_SPEED[c.fxSpeed]) c.fxSpeed = "normal";
  if (!PARTICLES[c.particles]) c.particles = "none";
  if (!INTROS[c.intro]) c.intro = "sobre";
  if (c.theme === "rosa") c.theme = "floral";
  if (!THEMES[c.theme]) c.theme = "floral";
  return c;
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

const safeUrl = (u) => (typeof u === "string" && /^https:\/\//i.test(u.trim()) ? u.trim() : "");
const plural = (n) => (n === 1 ? "1 pase" : `${n} pases`);

// "José de Jesús López" → "José de Jesús"; "Cynthia Paola" → "Cynthia"
function shortName(full) {
  const p = String(full || "").trim().split(/\s+/);
  return p[1] && /^(de|del)$/i.test(p[1]) && p[2] ? p.slice(0, 3).join(" ") : p[0] || "";
}

// "Jesús & Cynthia" → ["Jesús", "Cynthia"]; si está vacío, los nombres cortos de la pareja.
function coverPair(c) {
  const t = String(c.coverNames || "").trim();
  if (t) {
    const p = t.split(/\s+(?:&|y)\s+/i);
    return p.length > 1 ? [p[0], p.slice(1).join(" & ")] : [t, ""];
  }
  return [shortName(c.n1), shortName(c.n2)];
}
function coverText(c) {
  return coverPair(c).filter(Boolean).join(" & ");
}

function coupleShort(c) {
  const short = shortName;
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

// ---------- Video de fondo ----------
// Acepta un archivo del sitio (portada.mp4, portada.jpg) o un link https. Cualquier otra cosa: "".
function mediaUrl(u) {
  u = String(u || "").trim();
  if (/^[\w-]+\.(mp4|webm|jpe?g|png|webp)$/i.test(u)) return u;
  return safeUrl(u);
}

// ---------- Marco de flores (diseño floral) ----------
// Tira vertical de rosas blancas con hojas beige, botones y perlas. Se repite hacia abajo a cada lado.
function floralStrip(mirror) {
  const W = ["#FFFFFF", "#F6F1E8", "#D3C4AE"], P = ["#FFFDF8", "#EFE7DA", "#C9B89F"];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280), seed / 233280);
  const f = (n) => Math.round(n * 10) / 10;
  const scallop = (x, y, r, n, rot, fill, edge) => {
    let d = "";
    for (let i = 0; i <= n; i++) {
      const a = rot + (i * 2 * Math.PI) / n;
      d += (i ? `A${f(r * 0.6)} ${f(r * 0.6)} 0 0 1 ` : "M") + `${f(x + r * Math.cos(a))} ${f(y + r * Math.sin(a))}`;
    }
    return `<path d="${d}Z" fill="${fill}" stroke="${edge}" stroke-width=".6"/>`;
  };
  const rose = (x, y, r, c) =>
    scallop(x, y, r, 7, rnd() * 3, c[0], c[2]) + scallop(x, y, r * 0.72, 6, rnd() * 3, c[1], c[2]) + scallop(x, y, r * 0.46, 5, rnd() * 3, c[0], c[2]) +
    `<path d="M${f(x - r * 0.2)} ${f(y + r * 0.02)}a${f(r * 0.2)} ${f(r * 0.2)} 0 1 1 ${f(r * 0.32)} ${f(r * 0.12)}" fill="none" stroke="${c[2]}" stroke-width=".7"/>`;
  const leaf = (x, y, len, ang, light) => {
    const w = len * 0.32;
    return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><path d="M0 0Q${f(len / 2)} ${f(-w)} ${f(len)} 0Q${f(len / 2)} ${f(w)} 0 0Z" fill="${light ? "#F7F1E7" : "#EAE0D0"}" stroke="#C9B9A2" stroke-width=".6"/><path d="M1 0L${f(len * 0.85)} 0" stroke="#C9B9A2" stroke-width=".5"/></g>`;
  };
  const bud = (x, y, ang, c) =>
    `<g transform="translate(${x} ${y}) rotate(${ang})"><path d="M0 0C3 -2 4 -7 0 -11C-4 -7 -3 -2 0 0Z" fill="${c[0]}" stroke="${c[2]}" stroke-width=".6"/><path d="M0 1L0 7" stroke="#C9B9A2" stroke-width=".7"/></g>`;
  const roses = [[16, 32, 19, P], [44, 12, 12, W], [7, 70, 12, W], [31, 62, 8, P], [52, 36, 6, P],
    [14, 150, 14, P], [27, 186, 8, W], [22, 240, 10, W], [10, 300, 15, W], [26, 336, 8, P], [22, 378, 11, P], [12, 444, 14, P], [28, 476, 8, W],
    [16, 568, 19, W], [44, 590, 12, P], [7, 528, 12, P], [31, 538, 8, W], [52, 566, 6, W]];
  let leaves = "", flowers = "", buds = "", pearls = "";
  roses.forEach(([x, y, r, c]) => {
    for (let i = 0; i < 3; i++) leaves += leaf(x, y, r * (1.1 + rnd() * 0.5), rnd() * 360, rnd() > 0.5);
    flowers += rose(x, y, r, c);
  });
  for (let i = 0; i < 14; i++) {
    const y = 95 + i * 30;
    leaves += leaf(8 + 8 * Math.sin(y / 40), y, 9 + rnd() * 5, (i % 2 ? 20 : 160) + rnd() * 30, i % 3 === 0);
  }
  [[30, 110, 30, W], [28, 196, -20, P], [34, 268, 40, P], [30, 336, -30, W], [32, 408, 25, W], [30, 480, -15, P], [60, 8, 70, W], [60, 596, 110, P]].forEach(([x, y, a, c]) => (buds += bud(x, y, a, c)));
  for (let i = 0; i < 18; i++) {
    const y = 90 + i * 24;
    pearls += `<circle cx="${f(20 + 9 * Math.sin(y / 33))}" cy="${y}" r="${i % 3 ? 1.1 : 1.6}" fill="#FFFDFB" stroke="#D3C4AE" stroke-width=".5"/>`;
  }
  const vine = `<path d="M9 0C22 60 0 120 12 180S2 300 14 360S0 480 12 540S8 590 9 600" fill="none" stroke="#CDBDA6" stroke-width="1.2"/><path d="M12 120c10 -2 16 6 12 12c-3 4 -9 2 -8 -2M10 260c10 -2 16 6 12 12c-3 4 -9 2 -8 -2M12 400c10 -2 16 6 12 12c-3 4 -9 2 -8 -2" fill="none" stroke="#CDBDA6" stroke-width=".8"/>`;
  const body = vine + leaves + buds + pearls + flowers;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 600"><g${mirror ? ' transform="translate(80 0) scale(-1 1)"' : ""}>${body}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// Novios chibi para la portada.
const CHIBI_SVG = `<svg class="chibi" viewBox="0 0 200 180" aria-hidden="true">
  <g stroke="#5B4636" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
    <path d="M118 44 C150 40 170 70 168 120 C166 150 160 168 150 172 L112 172 C118 140 112 90 118 44Z" fill="#FFFFFF" fill-opacity=".75" stroke="#D9CCBB"/>
    <path d="M98 70 C96 34 162 30 164 70 C166 96 160 118 154 128 C148 120 146 108 146 100 L114 100 C114 110 110 122 104 128 C98 116 98 92 98 70Z" fill="#3B2A22"/>
    <path d="M118 112 L144 112 C150 130 162 150 168 170 C150 176 112 176 94 170 C100 150 112 130 118 112Z" fill="#FFFDF8"/>
    <path d="M116 118 C126 124 136 124 146 118" fill="none" stroke="#D9CCBB"/>
    <path d="M110 140 C122 146 140 146 152 140M104 156 C120 162 142 162 158 156" fill="none" stroke="#E6DACA" stroke-width="1.2"/>
    <path d="M58 150 L58 170 L70 170 L70 150Z M74 150 L74 170 L86 170 L86 150Z" fill="#2B3247"/>
    <path d="M54 170 L71 170 L71 175 L54 175Z M73 170 L90 170 L90 175 L73 175Z" fill="#1E1E24"/>
    <path d="M50 112 L94 112 C98 128 98 142 96 152 L48 152 C46 142 46 128 50 112Z" fill="#2F3A56"/>
    <path d="M64 112 L72 132 L80 112Z" fill="#FFFFFF"/>
    <path d="M66 114 L72 118 L78 114 L78 120 L72 117 L66 120Z" fill="#2B2B33" stroke-width="1.2"/>
    <path d="M72 132 L72 150" fill="none" stroke="#1F2638"/>
    <circle cx="57" cy="122" r="3.2" fill="#FFFFFF" stroke="#D9CCBB" stroke-width="1"/>
    <path d="M92 118 C98 124 102 128 106 130 C110 128 114 124 120 118" fill="none" stroke="#5B4636" stroke-width="7"/>
    <path d="M92 118 C98 124 102 128 106 130" fill="none" stroke="#2F3A56" stroke-width="5"/>
    <path d="M106 130 C110 128 114 124 120 118" fill="none" stroke="#FFFDF8" stroke-width="5"/>
    <circle cx="106" cy="130" r="5" fill="#F6D5BF"/>
    <path d="M150 128 L156 150" fill="none" stroke="#9AA98A" stroke-width="2"/>
    <circle cx="146" cy="124" r="5.5" fill="#FFFFFF"/><circle cx="155" cy="121" r="5.5" fill="#F4E7D6"/><circle cx="153" cy="130" r="5.5" fill="#FFFFFF"/><circle cx="144" cy="132" r="4.5" fill="#EADFCF"/>
    <circle cx="72" cy="74" r="35" fill="#F6D5BF"/>
    <circle cx="131" cy="74" r="35" fill="#F6D5BF"/>
    <path d="M37 74 C34 40 58 30 76 34 C98 36 110 52 107 74 C100 62 92 56 82 54 C80 60 70 64 58 62 C50 64 42 68 37 74Z" fill="#3B2A22"/>
    <path d="M96 76 C94 46 116 36 134 38 C154 40 168 56 166 78 C158 66 150 58 140 54 C132 62 116 66 104 66 C100 70 98 72 96 76Z" fill="#3B2A22"/>
    <circle cx="112" cy="46" r="4.5" fill="#FFFFFF"/><circle cx="122" cy="40" r="5" fill="#FFFFFF"/><circle cx="133" cy="38" r="4.5" fill="#F4E7D6"/><circle cx="144" cy="40" r="5" fill="#FFFFFF"/><circle cx="154" cy="46" r="4.5" fill="#FFFFFF"/>
  </g>
  <g fill="#3B2A22">
    <ellipse cx="60" cy="82" rx="4" ry="5"/><ellipse cx="84" cy="82" rx="4" ry="5"/>
    <ellipse cx="119" cy="82" rx="4" ry="5"/><ellipse cx="143" cy="82" rx="4" ry="5"/>
  </g>
  <g fill="#FFFFFF"><circle cx="61.5" cy="80" r="1.5"/><circle cx="85.5" cy="80" r="1.5"/><circle cx="120.5" cy="80" r="1.5"/><circle cx="144.5" cy="80" r="1.5"/></g>
  <g fill="#F2A9A0" opacity=".55"><ellipse cx="52" cy="92" rx="6" ry="3.5"/><ellipse cx="92" cy="92" rx="6" ry="3.5"/><ellipse cx="111" cy="92" rx="6" ry="3.5"/><ellipse cx="151" cy="92" rx="6" ry="3.5"/></g>
  <g fill="none" stroke="#5B4636" stroke-width="1.6" stroke-linecap="round">
    <path d="M67 94 C70 98 74 98 77 94"/><path d="M126 94 C129 98 133 98 136 94"/>
  </g>
  <path d="M101 22 C97 14 86 16 88 25 C89 31 101 37 101 37 C101 37 113 31 114 25 C116 16 105 14 101 22Z" fill="#E9CFC0" stroke="#B8977A" stroke-width="1.4"/>
</svg>`;

// Íconos del menú de secciones.
const MENU_ICONS = {
  inicio: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
  faltan: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  ubicacion: ICON_PATHS.pin,
  itinerario: ICON_PATHS.reloj,
  fotos: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
  confirmar: ICON_PATHS.corazon,
};
const MENU_LABELS = { inicio: "Inicio", faltan: "Fecha", ubicacion: "Lugar", itinerario: "Programa", fotos: "Fotos", confirmar: "Confirmar" };

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
// Las piezas con clase "rv" aparecen con animación al llegar a ellas con el scroll.
function renderInvitation(c, guest) {
  c = normalizeConfig(c);
  const floral = c.theme === "floral";
  // En el diseño floral la portada usa el fondo beige con flores; la foto de la pareja sigue en el sobre kraft y en la galería.
  const cover = floral ? { ...c, bgKind: "preset", preset: "floral", overlay: 0, tone: "dark" } : c;
  const d = parseDate(c.date);
  const [cn1, cn2] = floral ? coverPair(c) : [c.n1, c.n2];
  const longest = Math.max((cn1 || "").length, (cn2 || "").length);
  const namesSize = floral
    ? (longest > 13 ? "font-size:clamp(40px,12vw,54px)" : "")
    : longest > 22 ? "font-size:clamp(30px,8.5vw,38px)" : longest > 13 ? "font-size:clamp(36px,10.5vw,46px)" : "";
  const vid = c.coverVideoOn ? mediaUrl(c.coverVideo) : "";
  const poster = mediaUrl(c.coverPoster);
  const sched = (c.schedule || []).filter((s) => s && (s.label || s.from));
  const photos = (c.photos || []).map(safeUrl).filter(Boolean);
  const map = safeUrl(c.mapUrl);
  const hasSong = c.songSrc === "demo" || (c.songSrc === "file" && safeUrl(c.songUrl));
  const ornament = `<div class="orn rv" aria-hidden="true"><span></span>✦<span></span></div>`;
  // Encabezado de sección con la ramita encima, como en las invitaciones de referencia.
  const head = (title, eyebrow) =>
    `<div class="sprig rv" aria-hidden="true">${iconSvg("rama")}</div>${eyebrow ? `<p class="eyebrow rv">${esc(eyebrow)}</p>` : ""}<h3 class="sec-title rv">${esc(title)}</h3>${ornament}`;
  const venuePhoto = safeUrl(c.venuePhoto);
  const mapQuery = c.address || [c.venue, c.city].filter(Boolean).join(", ");

  return `
  <article class="inv fx-${c.fx}${c.coverIn ? "" : " no-in"}${floral ? " floral" : ""}" style="--fxdur:${FX_SPEED[c.fxSpeed][1]}s">
    <section class="card${cover.tone === "dark" && !vid ? " dark-text" : ""}${vid ? " has-video" : ""}" id="inicio"${vid && poster ? ` style='--poster:url("${encodeURI(poster)}")'` : ""}>
      ${bgLayers(cover)}
      ${vid ? `<video class="bgvid" src="${esc(vid)}"${poster ? ` poster="${esc(poster)}"` : ""} autoplay muted loop playsinline preload="auto" aria-hidden="true"></video><div class="vidshade"></div>` : ""}
      ${floral ? `<div class="frame" aria-hidden="true"></div>` : ""}
      ${particlesHtml(c.particles)}
      ${hasSong ? `<button type="button" class="music-btn" aria-pressed="false">♪ Reproducir</button>` : ""}
      <div class="inner">
        ${floral ? "" : `<div class="kicker in" style="--d:.1s">Nos casamos</div>`}
        <h1 class="names" style="${namesSize}">
          <span class="in" style="--d:.25s">${esc(cn1 || "Nombre")}</span>
          ${cn2 ? `<span class="amp in" style="--d:.45s">&amp;</span>
          <span class="in" style="--d:.6s">${esc(cn2)}</span>` : ""}
        </h1>
        ${floral ? `${c.bow ? `<div class="chibi-wrap in" style="--d:.9s">${mediaUrl(c.chibiImg) ? `<img class="chibi" src="${esc(mediaUrl(c.chibiImg))}" alt="Los novios">` : CHIBI_SVG}</div>` : ""}` : `
        <div class="rule in" style="--d:.8s"></div>
        <div class="date in" style="--d:.9s">${d ? esc(cap(fmtLong.format(d))) : "Fecha por definir"}</div>
        ${c.time ? `<div class="meta in" style="--d:1s">${esc(c.time)} h</div>` : ""}
        ${guest ? `<div class="pases in" style="--d:1.15s">✦ ${esc(String(guest.nombre || "").trim() || "Invitado")} · ${plural(Number(guest.pases) || 1)}</div>` : ""}
        <a class="rsvp-cta in" style="--d:1.3s" href="#confirmar">${guest && guest.rsvp ? "Ver mi respuesta" : "Confirmar asistencia"}</a>`}
      </div>
      ${c.menu ? "" : `<a class="scroll-hint" href="#detalles" aria-label="Bajar para ver más"><span>Desliza</span><i></i></a>`}
    </section>

    <div class="paper" id="detalles">
      ${
        c.note
          ? `<section class="sec">
        ${ornament}
        <p class="quote rv">${esc(c.note)}</p>
      </section>`
          : ""
      }

      ${
        [c.p1a, c.p1b, c.p2a, c.p2b].some((x) => String(x || "").trim())
          ? `<section class="sec parents">
        ${head("Con la bendición de")}
        <p class="pill rv">${iconSvg("corazon")} Nuestros papás</p>
        <div class="par-list">
          ${[
            [c.n1, c.p1a, c.p1b],
            [c.n2, c.p2a, c.p2b],
          ]
            .filter(([, a, b]) => String(a || "").trim() || String(b || "").trim())
            .map(
              ([who, a, b], i) => `<div class="par-card rv" style="--d:${i * 0.15}s">
            <p class="par-of">Papás de ${esc(shortName(who) || "la pareja")}</p>
            ${[a, b].filter((x) => String(x || "").trim()).map((x) => `<p class="par-name">${esc(String(x).trim())}</p>`).join("")}
            <span class="par-line"></span>
          </div>`
            )
            .join(`<div class="par-heart rv" aria-hidden="true">${iconSvg("corazon")}</div>`)}
        </div>
      </section>`
          : ""
      }

      ${
        d
          ? `<section class="sec" id="faltan">
        <h2 class="rv">Faltan</h2>
        <div class="cd rv" data-date="${esc(c.date)}" data-time="${esc(c.time || "00:00")}">
          <div><b data-u="d">0</b><span>días</span></div>
          <div><b data-u="h">0</b><span>horas</span></div>
          <div><b data-u="m">0</b><span>min</span></div>
          <div><b data-u="s">0</b><span>seg</span></div>
        </div>
        <p class="sub rv">${esc(cap(fmtLong.format(d)))}${c.time ? ` · ${esc(c.time)} h` : ""}</p>
      </section>`
          : ""
      }


      ${
        c.venue || c.city || map
          ? `<section class="sec place" id="ubicacion">
        ${head("Ubicación")}
        ${venuePhoto ? `<figure class="venue-photo rv zoom"><img src="${esc(venuePhoto)}" alt="Fachada de ${esc(c.venue || "el salón")}" loading="lazy"></figure>` : ""}
        <div class="pin rv">${iconSvg("pin")}</div>
        ${c.venue ? `<p class="big rv">${esc(c.venue)}</p>` : ""}
        ${c.time ? `<p class="t-time rv">${iconSvg("reloj")}${esc(c.time)} h</p>` : ""}
        ${c.address || c.city ? `<p class="sub rv">${esc(c.address || c.city)}</p>` : ""}
        ${c.parking ? `<p class="tagline rv">${iconSvg("coche")} Estacionamiento</p>` : ""}
        ${
          c.showMap && mapQuery
            ? `<div class="map rv"><iframe title="Mapa de ${esc(c.venue || "la ubicación")}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&output=embed"></iframe></div>`
            : ""
        }
        ${map ? `<a class="btn rv" href="${esc(map)}" target="_blank" rel="noopener noreferrer">Abrir en Maps</a>` : ""}
      </section>`
          : ""
      }

      ${
        sched.length
          ? `<section class="sec" id="itinerario">
        ${head("Itinerario")}
        <ol class="timeline">${sched
          .map(
            (s, i) =>
              `<li class="rv" style="--d:${(i * 0.12).toFixed(2)}s">
            <span class="t-icon">${iconSvg(ICON_PATHS[s.icon] ? s.icon : guessIcon(s.label))}</span>
            <div class="t-card">
              ${s.from || s.to ? `<span class="t-time">${iconSvg("reloj")}${esc(timeRange(s.from, s.to))}</span>` : ""}
              <p class="t-title">${esc(s.label || "")}</p>
              ${s.place ? `<p class="t-place">${esc(s.place)}</p>` : ""}
            </div>
          </li>`
          )
          .join("")}</ol>
      </section>`
          : ""
      }

      ${
        c.dressOn
          ? `<section class="sec dress">
        ${head("Código de vestimenta", "Etiqueta")}
        <div class="dress-card rv zoom">
          <div class="dress-icons">${iconSvg("traje")}${iconSvg("vestido")}</div>
          <p class="dress-type">${esc(c.dressType || "Formal")}</p>
          <span class="dress-orn" aria-hidden="true"><span></span>✦<span></span></span>
        </div>
        ${c.dressText ? `<p class="g-text rv">${esc(c.dressText)}</p>` : ""}
      </section>`
          : ""
      }

      ${
        photos.length
          ? `<section class="sec gallery" id="fotos">
        ${head(c.photosTitle || "Nuestra sesión de fotos")}
        <div class="gal-grid">${photos
          .map(
            (u, i) =>
              `<button type="button" class="rv zoom" style="--d:${((i % 3) * 0.1).toFixed(2)}s" data-i="${i}" aria-label="Ampliar foto ${i + 1}"><img src="${esc(u)}" alt="" loading="lazy"></button>`
          )
          .join("")}</div>
      </section>`
          : ""
      }

      ${
        c.giftsOn
          ? `<section class="sec gifts">
        <div class="g-icon rv">${iconSvg("sobre")}</div>
        <h3 class="g-title rv">${esc(c.giftsTitle || "Lluvia de sobres")}</h3>
        ${ornament}
        ${c.giftsText ? `<p class="g-text rv">${esc(c.giftsText)}</p>` : ""}
        ${
          String(c.giftAccount || "").trim()
            ? `<button type="button" class="g-toggle rv" aria-expanded="false">Prefiero hacer transferencia</button>
        <div class="g-bank" hidden>
          ${c.giftBank ? `<p><span>Banco</span>${esc(c.giftBank)}</p>` : ""}
          ${c.giftHolder ? `<p><span>A nombre de</span>${esc(c.giftHolder)}</p>` : ""}
          <p><span>Cuenta / CLABE / tarjeta</span><b class="g-acc">${esc(String(c.giftAccount).trim())}</b></p>
          <button type="button" class="g-copy">Copiar número</button>
        </div>`
            : ""
        }
      </section>`
          : ""
      }

      <section class="sec rsvp-sec" id="confirmar">
        ${floral && guest ? `<p class="pases-end rv">✦ ${esc(String(guest.nombre || "").trim() || "Invitado")} · ${plural(Number(guest.pases) || 1)}</p>` : ""}
        <div class="rsvp-slot"></div>
      </section>

      ${hasSong && c.songTitle ? `<p class="song rv">♪ ${esc(c.songTitle)}</p>` : ""}
      ${
        String(c.endText || "").trim()
          ? `<footer class="end end-text rv">${esc(String(c.endText).trim())}</footer>`
          : `<footer class="end rv">${esc(coupleShort(c))}<br><span>${d ? esc(String(d.getFullYear())) : ""}</span></footer>`
      }
    </div>
    ${
      c.menu
        ? `<nav class="menu" aria-label="Secciones de la invitación">${[
            ["inicio", true],
            ["faltan", !!d],
            ["ubicacion", !!(c.venue || c.city || map)],
            ["itinerario", sched.length > 0],
            ["fotos", photos.length > 0],
            ["confirmar", true],
          ]
            .filter(([, on]) => on)
            .map(([k]) => `<a href="#${k}" data-go="${k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MENU_ICONS[k]}</svg><span>${MENU_LABELS[k]}</span></a>`)
            .join("")}</nav>`
        : ""
    }
  </article>`;
}

// Activa la galería, la cuenta regresiva, las animaciones de scroll y el botón de música dentro de `root`.
function wireInvitation(root, c, player) {
  c = normalizeConfig(c);
  const photos = (c.photos || []).map(safeUrl).filter(Boolean);
  root.querySelectorAll(".gal-grid button").forEach((b) =>
    b.addEventListener("click", () => openLightbox(photos[Number(b.dataset.i)]))
  );

  const cd = root.querySelector(".cd");
  clearInterval(root._cdTimer);
  if (cd) {
    const target = new Date(`${cd.dataset.date}T${cd.dataset.time}:00`);
    const tick = () => {
      const ms = Math.max(0, target - Date.now());
      const v = { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 };
      cd.querySelectorAll("[data-u]").forEach((el) => (el.textContent = v[el.dataset.u]));
    };
    tick();
    root._cdTimer = setInterval(tick, 1000);
  }

  // Aparición al hacer scroll.
  const items = root.querySelectorAll(".rv");
  if (root._io) root._io.disconnect();
  if (c.fx !== "none" && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root._io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("shown");
            root._io.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => root._io.observe(el));
  } else items.forEach((el) => el.classList.add("shown"));

  // Efecto parallax suave en el fondo de la portada.
  const bg = root.querySelector(".card .bgimg");
  if (root._onScroll) (root._scroller || window).removeEventListener("scroll", root._onScroll);
  root._onScroll = null;
  if (bg && c.parallax && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const scroller = root.closest(".preview-col") || window;
    const onScroll = () => {
      const y = scroller === window ? window.scrollY : scroller.scrollTop;
      bg.style.transform = `translateY(${Math.min(y, 900) * 0.35}px) scale(1.08)`;
    };
    root._onScroll = onScroll;
    root._scroller = scroller;
    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const gt = root.querySelector(".g-toggle");
  if (gt) {
    const box = root.querySelector(".g-bank");
    gt.addEventListener("click", () => {
      box.hidden = !box.hidden;
      gt.setAttribute("aria-expanded", String(!box.hidden));
    });
    const cp = root.querySelector(".g-copy");
    cp.addEventListener("click", async () => {
      const num = String(c.giftAccount || "").replace(/\s+/g, "");
      try {
        await navigator.clipboard.writeText(num);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = num;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      cp.textContent = "¡Copiado!";
      setTimeout(() => (cp.textContent = "Copiar número"), 1800);
    });
  }

  // Video de fondo de la portada: algunos navegadores no lo arrancan solos; se intenta y, si no, queda la imagen fija.
  const bv = root.querySelector(".card .bgvid");
  if (bv) {
    bv.muted = true;
    const pr = bv.play();
    if (pr && pr.catch) pr.catch(() => {});
    document.addEventListener("click", () => bv.paused && bv.play().catch(() => {}), { once: true });
  }

  // Menú de secciones: lleva a cada parte y marca en cuál vas.
  const menu = root.querySelector(".inv .menu");
  if (root._menuIo) root._menuIo.disconnect();
  if (menu) {
    const links = [...menu.querySelectorAll("a[data-go]")];
    const mark = (k) => links.forEach((a) => (a.dataset.go === k ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    mark("inicio");
    links.forEach((a) =>
      a.addEventListener("click", (e) => {
        const t = root.querySelector(`#${a.dataset.go}`);
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
        mark(a.dataset.go);
      })
    );
    if ("IntersectionObserver" in window) {
      const scroller = root.closest(".preview-col");
      root._menuIo = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && mark(e.target.id)),
        { root: scroller || null, rootMargin: "-45% 0px -50% 0px" }
      );
      links.forEach((a) => {
        const t = root.querySelector(`#${a.dataset.go}`);
        if (t) root._menuIo.observe(t);
      });
    }
  }

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
.inv{--inv-light:#fff;--inv-dark:#1A1B2E;--paper:#FBFAF7;--paper-ink:#1A1B2E;--paper-muted:#5E6180;--rose:#A8325A;--line:#E6E2DA;max-width:560px;margin:0 auto;background:var(--paper);color:var(--paper-ink);font-family:'Figtree',system-ui,sans-serif;overflow:hidden;overflow:clip}
.inv .card{position:relative;min-height:100svh;overflow:hidden;isolation:isolate;color:var(--ink,var(--inv-light));display:flex;flex-direction:column}
.inv .card.dark-text{--ink:var(--inv-dark)}
.inv .card .bgimg,.inv .card .shade{position:absolute;inset:0;z-index:-1}
.inv .card .bgimg{transform:scale(1.08);will-change:transform}
.inv .card .inner{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;padding:64px 24px 96px}
.inv .kicker{font:600 11px/1 'Figtree',sans-serif;letter-spacing:.32em;text-transform:uppercase;opacity:.85}
.inv .names{font:600 clamp(42px,13vw,58px)/.95 'Cormorant Garamond',Georgia,serif;margin:6px 0 2px;overflow-wrap:anywhere;display:flex;flex-direction:column}
.inv .amp{font:italic 500 28px/1 'Cormorant Garamond',Georgia,serif;opacity:.85;display:block;margin:6px 0}
.inv .rule{width:44px;height:1px;background:currentColor;opacity:.6;margin:8px 0}
.inv .date{font:600 21px/1.2 'Cormorant Garamond',Georgia,serif}
.inv .meta{font-size:14px;opacity:.92}
.inv .pases{font-size:13px;padding:8px 16px;border-radius:999px;border:1px solid currentColor;margin-top:10px}
.inv .rsvp-cta{margin-top:6px;padding:12px 22px;border-radius:999px;border:1.5px solid currentColor;color:inherit;text-decoration:none;font:600 13px/1 'Figtree',sans-serif;letter-spacing:.04em}
.inv .rsvp-cta:hover{background:rgba(255,255,255,.18)}
.inv .music-btn{position:absolute;top:14px;right:14px;z-index:5;display:inline-flex;align-items:center;gap:6px;padding:8px 13px;font:600 12px/1 'Figtree',sans-serif;color:inherit;background:rgba(0,0,0,.18);border:1.5px solid currentColor;border-radius:999px;backdrop-filter:blur(4px);cursor:pointer}
.inv .card.dark-text .music-btn{background:rgba(255,255,255,.35)}
.inv .music-btn[aria-pressed=true]{background:rgba(255,255,255,.22)}
.inv .scroll-hint{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;color:inherit;text-decoration:none;font:600 10px/1 'Figtree',sans-serif;letter-spacing:.3em;text-transform:uppercase;opacity:.85}
.inv .scroll-hint i{width:22px;height:34px;border:1.5px solid currentColor;border-radius:12px;position:relative}
.inv .scroll-hint i::after{content:"";position:absolute;left:50%;top:7px;width:3px;height:7px;margin-left:-1.5px;border-radius:2px;background:currentColor;animation:inv-wheel 1.8s ease-in-out infinite}
@keyframes inv-wheel{0%{opacity:0;transform:translateY(0)}30%{opacity:1}100%{opacity:0;transform:translateY(12px)}}

.inv .paper{position:relative;background:var(--paper)}
.inv .sec{padding:56px 24px;text-align:center;border-top:1px solid var(--line)}
.inv .sec:first-child{border-top:0}
.inv .sec h2{font:600 11px/1 'Figtree',sans-serif;letter-spacing:.32em;text-transform:uppercase;color:var(--rose);margin:0 0 20px}
.inv .orn{display:flex;align-items:center;justify-content:center;gap:12px;color:var(--rose);font-size:14px;margin-bottom:18px}
.inv .orn span{width:48px;height:1px;background:currentColor;opacity:.5}
.inv .quote{font:italic 500 clamp(22px,6vw,28px)/1.35 'Cormorant Garamond',Georgia,serif;max-width:24ch;margin:0 auto}
.inv .sprig{color:var(--rose);display:flex;justify-content:center;margin-bottom:8px}
.inv .sprig svg{width:26px;height:26px}
.inv .eyebrow{margin:0 0 8px;font:600 11px/1 'Figtree',sans-serif;letter-spacing:.3em;text-transform:uppercase;color:var(--rose)}
.inv .sec-title{margin:0 0 14px;font:500 clamp(28px,7.5vw,34px)/1.15 'Cormorant Garamond',Georgia,serif}
.inv .pill{display:inline-flex;align-items:center;gap:8px;margin:0 0 20px;padding:8px 16px;border-radius:999px;border:1px solid var(--line);background:#F6F1EA;font:600 11px/1 'Figtree',sans-serif;letter-spacing:.22em;text-transform:uppercase;color:var(--paper-muted)}
.inv .pill svg{width:15px;height:15px;color:var(--rose)}
.inv .par-list{max-width:440px;margin:0 auto}
.inv .par-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px 18px}
.inv .par-card .par-of{color:var(--rose)}
.inv .par-line{display:block;width:32px;height:1px;background:var(--rose);opacity:.5;margin:12px auto 0}
.inv .par-heart{color:var(--rose);display:flex;justify-content:center;margin:10px 0}
.inv .par-heart svg{width:20px;height:20px;fill:currentColor}
.inv .venue-photo{margin:0 auto 22px;max-width:440px;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(26,27,46,.14);position:relative}
.inv .venue-photo img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover}
.inv .venue-photo::before,.inv .venue-photo::after{content:"";position:absolute;width:26px;height:26px;border:2px solid #E6C989;z-index:1}
.inv .venue-photo::before{top:12px;left:12px;border-right:0;border-bottom:0;border-top-left-radius:6px}
.inv .venue-photo::after{bottom:12px;right:12px;border-left:0;border-top:0;border-bottom-right-radius:6px}
.inv .pin{width:52px;height:52px;margin:0 auto 12px;border-radius:50%;border:1px solid var(--line);background:#fff;color:var(--rose);display:flex;align-items:center;justify-content:center}
.inv .pin svg{width:22px;height:22px}
.inv .place .t-time{margin:10px auto 0}
.inv .tagline{display:inline-flex;align-items:center;gap:8px;margin:14px 0 0;padding:7px 14px;border:1px solid var(--line);border-radius:999px;font-size:13px;color:var(--paper-muted);background:#fff}
.inv .tagline svg{width:16px;height:16px;color:var(--rose)}
.inv .map{max-width:440px;margin:20px auto 0;border-radius:16px;overflow:hidden;border:1px solid var(--line);aspect-ratio:4/3;background:#EEE9E0}
.inv .map iframe{display:block;width:100%;height:100%;border:0}
.inv .dress-card{max-width:440px;margin:0 auto 20px;padding:30px 20px 24px;border-radius:22px;background:#F4EFE7;border:1px solid var(--line)}
.inv .dress-icons{display:inline-flex;gap:14px;padding:16px 28px;border-radius:999px;background:var(--rose);color:#fff;box-shadow:0 0 0 8px #F4EFE7,0 0 0 9px var(--line)}
.inv .dress-icons svg{width:34px;height:34px}
.inv .dress-type{margin:22px 0 6px;font:500 clamp(30px,8vw,38px)/1 'Cormorant Garamond',Georgia,serif;color:var(--rose)}
.inv .dress-orn{display:flex;align-items:center;justify-content:center;gap:12px;color:var(--rose);font-size:12px}
.inv .dress-orn span{width:44px;height:1px;background:currentColor;opacity:.5}
.inv .par-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:26px;max-width:480px;margin:0 auto}
.inv .par-of{margin:0 0 8px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--paper-muted)}
.inv .par-name{margin:0;font:600 21px/1.3 'Cormorant Garamond',Georgia,serif}
.inv .big{font:600 clamp(26px,7vw,32px)/1.15 'Cormorant Garamond',Georgia,serif;margin:0}
.inv .sub{color:var(--paper-muted);margin:8px 0 0;font-size:15px}
.inv .btn{display:inline-block;margin-top:20px;padding:12px 24px;border-radius:999px;background:var(--rose);color:#fff;text-decoration:none;font:600 12px/1 'Figtree',sans-serif;letter-spacing:.1em;text-transform:uppercase}
.inv .cd{display:flex;justify-content:center;gap:10px}
.inv .cd div{min-width:66px;padding:12px 6px;border:1px solid var(--line);border-radius:10px;background:#fff}
.inv .cd b{display:block;font:600 30px/1 'Cormorant Garamond',Georgia,serif;font-variant-numeric:tabular-nums}
.inv .cd span{display:block;margin-top:6px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--paper-muted)}
.inv .timeline{list-style:none;margin:0 auto;padding:0;max-width:420px;text-align:left;position:relative}
.inv .timeline::before{content:"";position:absolute;left:23px;top:24px;bottom:24px;width:1.5px;background:linear-gradient(var(--rose),color-mix(in srgb,var(--rose) 25%,transparent))}
.inv .timeline li{position:relative;display:flex;gap:16px;align-items:flex-start;padding-bottom:16px}
.inv .timeline li:last-child{padding-bottom:0}
.inv .t-icon{flex:0 0 48px;height:48px;border-radius:50%;background:#fff;border:1px solid var(--line);color:var(--rose);display:flex;align-items:center;justify-content:center;position:relative;z-index:1;box-shadow:0 2px 8px rgba(26,27,46,.06)}
.inv .t-icon svg{width:22px;height:22px}
.inv .t-card{flex:1;min-width:0;background:#F6F1EA;border:1px solid var(--line);border-radius:14px;padding:14px 16px}
.inv .t-time{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;background:#fff;border:1px solid var(--line);font:600 12px/1 'Figtree',sans-serif;color:var(--rose)}
.inv .t-time svg{width:13px;height:13px}
.inv .t-title{margin:10px 0 0;font:600 23px/1.15 'Cormorant Garamond',Georgia,serif}
.inv .t-place{margin:4px 0 0;font-size:14px;color:var(--paper-muted)}
.inv .gallery{padding-left:12px;padding-right:12px}
.inv .gal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-flow:dense;gap:6px}
.inv .gal-grid button{padding:0;border:0;border-radius:6px;overflow:hidden;aspect-ratio:1;background:#eceae4;display:block;cursor:zoom-in}
.inv .gal-grid button:nth-child(5n+1){grid-column:span 2;grid-row:span 2}
.inv .gal-grid img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
.inv .gal-grid button:hover img{transform:scale(1.05)}
.inv .gifts .g-icon{width:64px;height:64px;margin:0 auto 14px;border-radius:50%;background:#F3EDE3;color:var(--rose);display:flex;align-items:center;justify-content:center}
.inv .gifts .g-icon svg{width:28px;height:28px}
.inv .gifts .g-title{margin:0 0 16px;font:600 clamp(26px,7vw,32px)/1.15 'Cormorant Garamond',Georgia,serif}
.inv .g-text{max-width:34ch;margin:0 auto;color:var(--paper-muted);font-size:16px;line-height:1.6}
.inv .g-toggle{margin-top:20px;padding:11px 20px;border-radius:999px;border:1.5px solid var(--rose);background:transparent;color:var(--rose);font:600 13px/1 'Figtree',sans-serif;cursor:pointer}
.inv .g-bank{max-width:340px;margin:16px auto 0;padding:18px;border:1px solid var(--line);border-radius:14px;background:#fff;text-align:left;display:grid;gap:10px}
.inv .g-bank[hidden]{display:none}
.inv .g-bank p{margin:0;display:grid;gap:2px;font-size:15px}
.inv .g-bank span{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--paper-muted)}
.inv .g-acc{font:600 18px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em;overflow-wrap:anywhere}
.inv .g-copy{justify-self:start;padding:10px 18px;border-radius:999px;border:0;background:var(--rose);color:#fff;font:600 13px/1 'Figtree',sans-serif;cursor:pointer}
.inv .rsvp-slot:empty{display:none}
.inv .rsvp-slot h2{font:600 30px/1.1 'Cormorant Garamond',Georgia,serif;letter-spacing:0;text-transform:none;color:var(--paper-ink);margin:0 0 18px}
.inv .song{margin:0;padding:0 24px 8px;text-align:center;font-size:12px;letter-spacing:.06em;color:var(--paper-muted)}
.inv .end{padding:36px 24px 56px;text-align:center;font:600 26px/1.2 'Cormorant Garamond',Georgia,serif}
.inv .end span{font:500 11px/1 'Figtree',sans-serif;letter-spacing:.3em;color:var(--paper-muted)}

/* Animaciones: portada al cargar, secciones al llegar con el scroll */
.inv .in{opacity:0;transform:translateY(14px);animation:inv-in var(--fxdur,.9s) cubic-bezier(.2,.7,.2,1) forwards;animation-delay:var(--d,0s)}
@keyframes inv-in{to{opacity:1;transform:none}}
.inv .rv{opacity:0;transform:translateY(28px);transition:opacity var(--fxdur,.9s) cubic-bezier(.2,.7,.2,1),transform var(--fxdur,.9s) cubic-bezier(.2,.7,.2,1);transition-delay:var(--d,0s)}
.inv .rv.zoom{transform:scale(.92)}
.inv.fx-zoom .rv{transform:scale(.86)}
.inv.fx-slide .rv{transform:translateX(-44px)}
.inv.fx-slide .sec:nth-child(even) .rv,.inv.fx-slide .gal-grid .rv:nth-child(even){transform:translateX(44px)}
.inv .rv.shown{opacity:1;transform:none}
.inv.waiting .in,.inv.waiting .particles i{animation-play-state:paused}
.inv.fx-none .rv{opacity:1;transform:none;transition:none}
.inv.no-in .in,.inv.fx-none .in{opacity:1;transform:none;animation:none}
.inv .particles{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.inv .particles i{position:absolute;top:-8%;left:var(--x);font-style:normal;font-size:var(--sz);line-height:1;opacity:.75;animation:inv-fall var(--du) linear var(--dl) infinite}
.inv .particles.petalos i{width:var(--sz);height:calc(var(--sz) * .7);background:linear-gradient(135deg,#FBD3DE,#EE9FB4);border-radius:150% 0 150% 0;opacity:.85}
.inv .particles.corazones i{color:#F4A7BB}
.inv .particles.destellos i{color:#FFE7A8;text-shadow:0 0 8px rgba(255,231,168,.8)}
.inv .particles.sobres i{color:#F3E2B8;font-size:calc(var(--sz) + 8px);text-shadow:0 2px 6px rgba(0,0,0,.25)}
@keyframes inv-fall{0%{top:-8%;transform:translateX(0) rotate(0)}100%{top:108%;transform:translateX(var(--dx)) rotate(320deg)}}
@media (prefers-reduced-motion: reduce){
  .inv .particles{display:none}
  .inv .in,.inv .rv{opacity:1;transform:none;animation:none;transition:none}
  .inv .scroll-hint i::after{animation:none}
}

.gate{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;text-align:center;padding:24px;color:#fff;background:rgba(16,18,36,.74);backdrop-filter:blur(8px);font-family:'Figtree',system-ui,sans-serif;cursor:pointer;transition:opacity .8s ease,backdrop-filter .8s ease}
.gate.leaving{opacity:0;backdrop-filter:blur(0);pointer-events:none}
.gate .gate-k{margin:0;letter-spacing:.24em;text-transform:uppercase;font-size:.72rem;opacity:.9}
.gate .gate-names{font:600 2.4rem/1.05 'Cormorant Garamond',Georgia,serif;margin:4px 0 18px}
.gate .gate-btn{padding:13px 28px;border-radius:999px;border:1.5px solid #fff;background:transparent;color:#fff;font:600 .9rem 'Figtree',sans-serif;letter-spacing:.06em;cursor:pointer}
.gate .gate-tap{margin:18px 0 0;font-size:.85rem;letter-spacing:.08em;opacity:.85;animation:gate-pulse 1.8s ease-in-out infinite}
@keyframes gate-pulse{50%{opacity:.45}}
.gate-env .env{position:relative;width:min(300px,78vw);aspect-ratio:3/2;perspective:900px;outline:none}
.env-back,.env-pocket,.env-flap{position:absolute;inset:0;border-radius:6px}
.env-back{background:linear-gradient(160deg,#EFE6D6,#E2D5BE);box-shadow:0 18px 40px rgba(0,0,0,.35)}
.env-letter{position:absolute;left:7%;right:7%;top:8%;bottom:8%;background:#FFFDF8;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#7A5A2B;box-shadow:0 2px 8px rgba(0,0,0,.12);transition:transform 1s cubic-bezier(.3,.7,.2,1) .45s;z-index:1}
.env-letter span{font:600 30px/1 'Cormorant Garamond',Georgia,serif}
.env-letter small{font-size:10px;letter-spacing:.3em;text-transform:uppercase}
.env-pocket{z-index:2;background:linear-gradient(160deg,#F4ECDD,#E8DCC6);clip-path:polygon(0 0,50% 52%,100% 0,100% 100%,0 100%)}
.env-flap{z-index:3;background:linear-gradient(180deg,#E6D8BF,#D9C7A6);clip-path:polygon(0 0,100% 0,50% 58%);transform-origin:top center;transition:transform .7s cubic-bezier(.4,.1,.3,1),z-index 0s .35s}
.env-seal{position:absolute;z-index:4;left:50%;top:58%;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 35% 30%,#C24A70,#8E2346 70%);color:#FBE9EF;font:600 17px/1 'Cormorant Garamond',Georgia,serif;letter-spacing:.02em;box-shadow:0 3px 10px rgba(0,0,0,.35),inset 0 0 0 3px rgba(255,255,255,.12);transition:transform .45s ease,opacity .45s ease;animation:seal-bob 2.4s ease-in-out infinite}
@keyframes seal-bob{50%{transform:scale(1.06)}}
.gate-env.opening .env-seal{animation:none;transform:scale(.4);opacity:0}
.gate-env.opening .env-flap{transform:rotateX(180deg);z-index:0}
.gate-env.opening .env-letter{transform:translateY(-62%)}
.gate-env.opening .gate-tap{opacity:0;animation:none}
.gate .gate-k,.gate .gate-names{transition:opacity .4s ease}
.gate-env.opening .gate-k,.gate-env.opening .gate-names{opacity:0}
@media (prefers-reduced-motion: reduce){.gate .gate-tap,.env-seal{animation:none}.env-letter,.env-flap{transition:none}}
.gate-kraft{padding:0;background:#2a2118;backdrop-filter:none;overflow:hidden}
.k-card{position:absolute;inset:0;overflow:hidden;display:flex;align-items:flex-end;justify-content:center}
.k-card .k-photo{position:absolute;inset:0;background-size:cover;background-position:center 30%;filter:grayscale(1) contrast(1.05);transform:scale(1.08);transition:transform 4s ease-out .3s}
.k-card .k-photo::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 38%,rgba(250,248,244,.55) 58%,rgba(250,248,244,.94) 76%)}
.k-txt{position:relative;width:100%;padding:0 24px calc(10% + env(safe-area-inset-bottom,0px));text-align:center;color:#2B2622}
.k-txt p{margin:0;opacity:0;transform:translateY(12px);transition:opacity .9s ease,transform .9s ease}
.k-script{font:400 clamp(48px,15vw,72px)/1 'Great Vibes',cursive;margin-bottom:6px!important}
.k-small{font:600 10px/1 'Figtree',sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#6B6156;margin-bottom:10px!important}
.k-names{font:500 clamp(26px,7.5vw,34px)/1.1 'Cormorant Garamond',Georgia,serif;margin-bottom:14px!important}
.k-date{display:flex;align-items:center;justify-content:center;gap:10px;font:600 11px/1 'Figtree',sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#6B6156}
.k-date b{font:500 34px/1 'Cormorant Garamond',Georgia,serif;letter-spacing:0;color:#2B2622}
.k-date i{width:1px;height:28px;background:#6B6156;opacity:.6}
.gate-kraft.opening .k-photo{transform:scale(1)}
.gate-kraft.opening .k-txt p{opacity:1;transform:none}
.gate-kraft.opening .k-script{transition-delay:1.1s}
.gate-kraft.opening .k-small{transition-delay:1.35s}
.gate-kraft.opening .k-names{transition-delay:1.55s}
.gate-kraft.opening .k-date{transition-delay:1.75s}
.k-wrap{position:absolute;inset:0;filter:drop-shadow(0 3px 8px rgba(40,24,8,.4));transition:transform 1.1s cubic-bezier(.6,.05,.3,1)}
.k-flap{position:absolute;inset:0;background-color:#C9A57B;background-image:radial-gradient(rgba(90,60,25,.16) 1px,transparent 1.2px),radial-gradient(rgba(255,255,255,.12) 1px,transparent 1.3px),linear-gradient(var(--k-dir,180deg),#D4B389,#BE9868);background-size:7px 7px,11px 11px,100% 100%;background-position:0 0,3px 5px,0 0}
.k-top .k-flap{--k-dir:180deg;clip-path:polygon(0 0,100% 0,50% 54%)}
.k-bottom .k-flap{--k-dir:0deg;clip-path:polygon(0 100%,100% 100%,50% 46%)}
.k-left .k-flap{--k-dir:90deg;clip-path:polygon(0 0,53% 50%,0 100%)}
.k-right .k-flap{--k-dir:270deg;clip-path:polygon(100% 0,47% 50%,100% 100%);background-color:#1F1C1A;background-image:radial-gradient(rgba(255,255,255,.05) 1px,transparent 1.2px),linear-gradient(270deg,#2A2624,#141210);background-size:6px 6px,100% 100%}
.k-top{z-index:4}.k-bottom{z-index:3}.k-left,.k-right{z-index:2}
.k-seal{position:absolute;z-index:6;left:50%;top:50%;width:104px;height:104px;margin:-52px 0 0 -52px;padding:0;border:0;cursor:pointer;color:#7A5A1E;background:radial-gradient(circle at 34% 30%,#F6DD9A,#D9AE55 45%,#A9802F 80%);border-radius:47% 53% 50% 50%/52% 48% 52% 48%;box-shadow:0 6px 14px rgba(0,0,0,.4),inset 0 0 0 7px rgba(255,255,255,.08),inset 0 0 0 9px rgba(122,90,30,.35),inset 0 -6px 12px rgba(110,78,20,.45);display:flex;align-items:center;justify-content:center;transition:transform 1.1s cubic-bezier(.4,.1,.2,1),opacity .5s ease;animation:seal-bob 2.4s ease-in-out infinite}
.k-seal svg{width:52px;height:52px;stroke-width:1.4;filter:drop-shadow(0 1px 0 rgba(255,240,200,.6))}
.k-tap{position:absolute;z-index:6;left:0;right:0;bottom:calc(8% + env(safe-area-inset-bottom,0px));margin:0;text-align:center;color:#fff;font-size:.85rem;letter-spacing:.12em;text-shadow:0 1px 4px rgba(0,0,0,.6);animation:gate-pulse 1.8s ease-in-out infinite}
/* Abierto a medias: arriba y abajo salen, la izquierda (kraft) y la derecha (negra) se quedan en las orillas y el sello queda sobre la foto. */
.gate-kraft.opening .k-seal{animation:none;transform:translate(min(22vw,150px),6vh) scale(.82) rotate(-10deg)}
.gate-kraft.opening .k-tap{opacity:0;animation:none}
.gate-kraft.opening .k-top{transform:translateY(-105%);transition-delay:.2s}
.gate-kraft.opening .k-right{transform:translateX(38%) rotate(4deg);transition-delay:.45s}
.gate-kraft.opening .k-left{transform:translateX(-36%) rotate(-5deg);transition-delay:.6s}
.gate-kraft.opening .k-bottom{transform:translateY(105%);transition-delay:.75s}
@media (prefers-reduced-motion: reduce){.k-seal,.k-tap{animation:none}.k-wrap,.k-card{transition:none}}

/* Menú fijo abajo para brincar entre secciones */
.inv .menu{position:sticky;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:30;display:flex;gap:2px;width:calc(100% - 20px);margin:0 auto 10px;padding:4px;border-radius:16px;background:rgba(255,255,255,.86);border:1px solid var(--line);box-shadow:0 6px 18px rgba(60,30,40,.14);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);overflow-x:auto;scrollbar-width:none}
.inv .menu::-webkit-scrollbar{display:none}
.inv .menu a{flex:1 0 46px;min-width:46px;height:46px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:12px;color:var(--paper-muted);text-decoration:none;font:600 9px/1 'Figtree',sans-serif;letter-spacing:.02em;white-space:nowrap}
.inv .menu a svg{width:19px;height:19px}
.inv .menu a[aria-current]{color:var(--rose);background:color-mix(in srgb,var(--rose) 13%,transparent)}
.inv .menu a:focus-visible{outline:2px solid var(--rose);outline-offset:-2px}

/* Diseño floral: fondo beige y flores blancas */
.inv.floral{--paper:#F4EDE2;--paper-ink:#5A4636;--paper-muted:#857160;--rose:#A4835F;--line:#E4D8C6;--inv-dark:#5A4636}
.inv.floral .frame,.inv.floral .paper::before{position:absolute;inset:0;pointer-events:none;background-image:var(--fl),var(--fr);background-position:left top,right top;background-size:21% auto,21% auto;background-repeat:repeat-y}
.inv.floral .frame{z-index:0}
.inv.floral .paper::before{content:"";z-index:0;opacity:.9}
.inv.floral .sec,.inv.floral .end,.inv.floral .song{position:relative;z-index:1}
.inv.floral .card .inner{padding-left:19%;padding-right:19%}
.inv.floral .sec{padding-left:15%;padding-right:15%}
.inv.floral .gallery{padding-left:14%;padding-right:14%}
.inv.floral .names{font-family:'Great Vibes',cursive;font-weight:400;font-size:clamp(54px,17vw,76px);line-height:1}
.inv.floral .amp{font:400 clamp(30px,9vw,40px)/1 'Great Vibes',cursive;font-style:normal;opacity:.7}
.inv.floral .full{margin:2px 0 0;font:500 15px/1.35 'Cormorant Garamond',Georgia,serif;text-wrap:balance;opacity:.9}
.inv.floral .chibi-wrap{margin:clamp(28px,6svh,56px) 0 0}
.inv.floral .chibi{display:block;width:clamp(170px,52vw,260px);height:auto;filter:drop-shadow(0 6px 10px rgba(0,0,0,.28))}
.inv.floral img.chibi{width:clamp(126px,39vw,203px)}
.inv.floral .card .inner{gap:4px}
.inv .pases-end{display:inline-block;margin:0 0 22px;padding:9px 18px;border-radius:999px;border:1px solid var(--line);background:#fff;font-size:14px;color:var(--paper-ink)}
.inv .end-text{max-width:28ch;margin:0 auto;font:italic 500 clamp(22px,6vw,28px)/1.4 'Cormorant Garamond',Georgia,serif;text-wrap:balance}
.inv.floral .sec-title,.inv.floral .rsvp-slot h2,.inv.floral .gifts .g-title{font-family:'Great Vibes',cursive;font-weight:400;font-size:clamp(40px,11vw,50px)}
.inv.floral .quote,.inv.floral .big,.inv.floral .t-title{color:var(--paper-ink)}
.inv.floral .card .music-btn{background:rgba(255,255,255,.6)}
.inv.floral .cd{gap:6px}
.inv.floral .cd div{min-width:0;flex:1 1 0;max-width:70px;background:rgba(255,255,255,.75)}
.inv.floral .t-card,.inv.floral .dress-card,.inv.floral .pill{background:rgba(255,255,255,.6)}
.inv.floral .rsvp-slot label.opt:has(input:checked),.inv.floral .rsvp-slot .send{background:var(--rose);border-color:var(--rose)}
.inv.floral .rsvp-slot .ghost{border-color:var(--rose);color:var(--rose)}
.inv.floral .menu{background:rgba(251,248,242,.9)}

/* Video de fondo en la portada */
.inv .card .bgvid{position:absolute;inset:0;z-index:-1;width:100%;height:100%;object-fit:cover;object-position:50% 40%;pointer-events:none}
.inv .card .vidshade{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(20,14,18,.45) 0%,rgba(20,14,18,.22) 35%,rgba(20,14,18,.3) 65%,rgba(20,14,18,.6) 100%)}
.inv .card.has-video{--ink:#fff}
.inv .card.has-video .inner{text-shadow:0 2px 12px rgba(0,0,0,.45)}
.inv.floral .card.has-video .music-btn{background:rgba(0,0,0,.25)}
@media (prefers-reduced-motion: reduce){.inv .card .bgvid{display:none}.inv .card.has-video .bgimg{background:var(--poster) center/cover!important}}

/* Tamaños para celular, tableta y computadora */
.inv.floral .frame,.inv.floral .paper::before{background-size:clamp(64px,21%,150px) auto,clamp(64px,21%,150px) auto}
.inv.floral .card .inner{padding-left:clamp(58px,19%,150px);padding-right:clamp(58px,19%,150px)}
.inv.floral .sec{padding-left:clamp(52px,15%,150px);padding-right:clamp(52px,15%,150px)}
.inv.floral .gallery{padding-left:clamp(48px,14%,140px);padding-right:clamp(48px,14%,140px)}
@media (min-width:700px){
  .inv{max-width:760px;box-shadow:0 0 0 1px rgba(0,0,0,.04),0 20px 60px rgba(60,30,40,.12)}
  .inv .card{min-height:min(100svh,980px)}
  .inv .sec{padding-top:72px;padding-bottom:72px}
  .inv .names{font-size:clamp(58px,9vw,78px)}
  .inv.floral .names{font-size:clamp(76px,11vw,104px)}
  .inv .quote{font-size:32px}
  .inv .menu{max-width:560px}
  .inv .menu a{font-size:11px;height:52px}
  .inv .menu a svg{width:21px;height:21px}
  .inv .gal-grid{gap:10px}
}
@media (min-width:1100px){.inv{max-width:880px}}
@media (max-width:360px){
  .inv .menu a{min-width:42px;flex-basis:42px;font-size:8px}
  .inv.floral .names{font-size:clamp(46px,15vw,60px)}
}

/* Sobre de entrada: se queda en tonos rosa */
.gate.floral{background:rgba(110,62,72,.55)}
.gate.floral .env-back{background:linear-gradient(160deg,#F7E3E1,#EBC9C8)}
.gate.floral .env-pocket{background:linear-gradient(160deg,#FBEDEB,#F0D6D4)}
.gate.floral .env-flap{background:linear-gradient(180deg,#EFCFCD,#E2B5B6)}
.gate.floral .env-letter{color:#8B5E62}
.gate.floral .env-letter span{font:400 clamp(24px,7.5vw,32px)/1.1 'Great Vibes',cursive;text-align:center;padding:0 8px}
.inv.floral .rsvp-slot .note-small{color:var(--paper-muted)}
.gate.floral .env-seal{background:radial-gradient(circle at 35% 30%,#ECB3BD,#C27886 70%);color:#FFF4F5}
.gate.floral .gate-names{font-family:'Great Vibes',cursive;font-weight:400;font-size:3rem}
.lightbox{position:fixed;inset:0;z-index:100;background:rgba(8,9,20,.92);display:flex;align-items:center;justify-content:center;padding:16px;cursor:zoom-out;animation:inv-fade .25s ease}
@keyframes inv-fade{from{opacity:0}}
.lightbox img{max-width:94vw;max-height:88vh;border-radius:8px;object-fit:contain}
.lightbox button{position:absolute;top:12px;right:12px;font:500 14px 'Figtree',sans-serif;padding:8px 13px;border-radius:7px;border:0;background:#fff;color:#16182B;cursor:pointer}
`;

// Las tiras de flores se arman una vez y se pasan al CSS como variables.
const INVITATION_CSS_FULL = INVITATION_CSS + `.inv.floral{--fl:${floralStrip(false)};--fr:${floralStrip(true)}}`;

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Figtree:wght@400;500;600&family=Great+Vibes&display=swap";
