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
  // Papás de cada uno: p1a/p1b de Nombre 1, p2a/p2b de Nombre 2
  p1a: "",
  p1b: "",
  p2a: "",
  p2b: "",
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
  particles: "none", // "none", "petalos", "corazones" o "destellos"
};

// Opciones de efectos que ofrece el editor.
const FX = { fade: "Aparecer suave", zoom: "Acercar", slide: "Deslizar de lado", none: "Sin animación" };
const FX_SPEED = { lento: ["Lento", 1.4], normal: ["Normal", 0.9], rapido: ["Rápido", 0.5] };
const PARTICLES = { none: "Ninguna", petalos: "Pétalos", corazones: "Corazones", destellos: "Destellos" };

function particlesHtml(kind) {
  if (kind === "none") return "";
  const ch = kind === "corazones" ? "♥" : kind === "destellos" ? "✦" : "";
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
  const d = parseDate(c.date);
  const longest = Math.max((c.n1 || "").length, (c.n2 || "").length);
  const namesSize = longest > 22 ? "font-size:clamp(30px,8.5vw,38px)" : longest > 13 ? "font-size:clamp(36px,10.5vw,46px)" : "";
  const sched = (c.schedule || []).filter((s) => s && (s.label || s.from));
  const photos = (c.photos || []).map(safeUrl).filter(Boolean);
  const map = safeUrl(c.mapUrl);
  const hasSong = c.songSrc === "demo" || (c.songSrc === "file" && safeUrl(c.songUrl));
  const ornament = `<div class="orn rv" aria-hidden="true"><span></span>✦<span></span></div>`;

  return `
  <article class="inv fx-${c.fx}${c.coverIn ? "" : " no-in"}" style="--fxdur:${FX_SPEED[c.fxSpeed][1]}s">
    <section class="card${c.tone === "dark" ? " dark-text" : ""}">
      ${bgLayers(c)}
      ${particlesHtml(c.particles)}
      ${hasSong ? `<button type="button" class="music-btn" aria-pressed="false">♪ Reproducir</button>` : ""}
      <div class="inner">
        <div class="kicker in" style="--d:.1s">Nos casamos</div>
        <h1 class="names" style="${namesSize}">
          <span class="in" style="--d:.25s">${esc(c.n1 || "Nombre")}</span>
          <span class="amp in" style="--d:.45s">&amp;</span>
          <span class="in" style="--d:.6s">${esc(c.n2 || "Nombre")}</span>
        </h1>
        <div class="rule in" style="--d:.8s"></div>
        <div class="date in" style="--d:.9s">${d ? esc(cap(fmtLong.format(d))) : "Fecha por definir"}</div>
        ${c.time ? `<div class="meta in" style="--d:1s">${esc(c.time)} h</div>` : ""}
        ${guest ? `<div class="pases in" style="--d:1.15s">✦ ${esc(String(guest.nombre || "").trim() || "Invitado")} · ${plural(Number(guest.pases) || 1)}</div>` : ""}
      </div>
      <a class="scroll-hint" href="#detalles" aria-label="Bajar para ver más"><span>Desliza</span><i></i></a>
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
        <h2 class="rv">Con la bendición de nuestros papás</h2>
        <div class="par-grid">
          ${[
            [c.n1, c.p1a, c.p1b],
            [c.n2, c.p2a, c.p2b],
          ]
            .filter(([, a, b]) => String(a || "").trim() || String(b || "").trim())
            .map(
              ([who, a, b], i) => `<div class="rv" style="--d:${i * 0.15}s">
            <p class="par-of">Papás de ${esc(shortName(who) || "la pareja")}</p>
            ${[a, b].filter((x) => String(x || "").trim()).map((x) => `<p class="par-name">${esc(String(x).trim())}</p>`).join("")}
          </div>`
            )
            .join("")}
        </div>
      </section>`
          : ""
      }

      ${
        d
          ? `<section class="sec">
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
          ? `<section class="sec">
        <h2 class="rv">¿Dónde?</h2>
        ${c.venue ? `<p class="big rv">${esc(c.venue)}</p>` : ""}
        ${c.city ? `<p class="sub rv">${esc(c.city)}</p>` : ""}
        ${map ? `<a class="btn rv" href="${esc(map)}" target="_blank" rel="noopener noreferrer">Ver ubicación</a>` : ""}
      </section>`
          : ""
      }

      ${
        sched.length
          ? `<section class="sec">
        <h2 class="rv">Programa</h2>
        <ol class="timeline">${sched
          .map(
            (s, i) =>
              `<li class="rv" style="--d:${(i * 0.12).toFixed(2)}s"><span class="dot"></span><b>${esc(timeRange(s.from, s.to))}</b><span>${esc(s.label || "")}</span></li>`
          )
          .join("")}</ol>
      </section>`
          : ""
      }

      ${
        photos.length
          ? `<section class="sec gallery">
        <h2 class="rv">${esc(c.photosTitle || "Nuestra sesión de fotos")}</h2>
        <div class="gal-grid">${photos
          .map(
            (u, i) =>
              `<button type="button" class="rv zoom" style="--d:${((i % 3) * 0.1).toFixed(2)}s" data-i="${i}" aria-label="Ampliar foto ${i + 1}"><img src="${esc(u)}" alt="" loading="lazy"></button>`
          )
          .join("")}</div>
      </section>`
          : ""
      }

      <section class="sec rsvp-sec">
        <div class="rsvp-slot rv" id="confirmar"></div>
      </section>

      ${hasSong && c.songTitle ? `<p class="song rv">♪ ${esc(c.songTitle)}</p>` : ""}
      <footer class="end rv">${esc(coupleShort(c))}<br><span>${d ? esc(String(d.getFullYear())) : ""}</span></footer>
    </div>
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
.inv{--inv-light:#fff;--inv-dark:#1A1B2E;--paper:#FBFAF7;--paper-ink:#1A1B2E;--paper-muted:#5E6180;--rose:#A8325A;--line:#E6E2DA;max-width:560px;margin:0 auto;background:var(--paper);color:var(--paper-ink);font-family:'Figtree',system-ui,sans-serif;overflow:hidden}
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
.inv .timeline{list-style:none;margin:0 auto;padding:0 0 0 22px;max-width:320px;text-align:left;border-left:1px solid var(--line)}
.inv .timeline li{position:relative;padding:0 0 22px 14px;display:grid;gap:2px}
.inv .timeline li:last-child{padding-bottom:0}
.inv .timeline .dot{position:absolute;left:-28px;top:4px;width:11px;height:11px;border-radius:50%;background:var(--paper);border:2px solid var(--rose)}
.inv .timeline b{font-size:13px;color:var(--paper-muted);font-weight:600}
.inv .timeline span:last-child{font:600 21px/1.2 'Cormorant Garamond',Georgia,serif}
.inv .gallery{padding-left:12px;padding-right:12px}
.inv .gal-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-flow:dense;gap:6px}
.inv .gal-grid button{padding:0;border:0;border-radius:6px;overflow:hidden;aspect-ratio:1;background:#eceae4;display:block;cursor:zoom-in}
.inv .gal-grid button:nth-child(5n+1){grid-column:span 2;grid-row:span 2}
.inv .gal-grid img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
.inv .gal-grid button:hover img{transform:scale(1.05)}
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
@keyframes inv-fall{0%{top:-8%;transform:translateX(0) rotate(0)}100%{top:108%;transform:translateX(var(--dx)) rotate(320deg)}}
@media (prefers-reduced-motion: reduce){
  .inv .particles{display:none}
  .inv .in,.inv .rv{opacity:1;transform:none;animation:none;transition:none}
  .inv .scroll-hint i::after{animation:none}
}

.lightbox{position:fixed;inset:0;z-index:100;background:rgba(8,9,20,.92);display:flex;align-items:center;justify-content:center;padding:16px;cursor:zoom-out;animation:inv-fade .25s ease}
@keyframes inv-fade{from{opacity:0}}
.lightbox img{max-width:94vw;max-height:88vh;border-radius:8px;object-fit:contain}
.lightbox button{position:absolute;top:12px;right:12px;font:500 14px 'Figtree',sans-serif;padding:8px 13px;border-radius:7px;border:0;background:#fff;color:#16182B;cursor:pointer}
`;

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Figtree:wght@400;500;600&display=swap";
