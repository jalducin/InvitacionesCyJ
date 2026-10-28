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

const PRESETS = {
  jardin: { label: "Jardín", bg: "linear-gradient(160deg,#e8efe2 0%,#c9d8bd 45%,#9db58c 100%)", tone: "light" },
  dorado: { label: "Dorado", bg: "linear-gradient(160deg,#fbf3e4 0%,#ecd6a8 55%,#c9a464 100%)", tone: "light" },
  rosa: { label: "Rosa palo", bg: "linear-gradient(160deg,#fbeef0 0%,#f0cfd5 50%,#d9a2ad 100%)", tone: "light" },
  marfil: { label: "Marfil", bg: "linear-gradient(160deg,#fffdf8 0%,#f3ece0 100%)", tone: "light" },
  noche: { label: "Noche", bg: "linear-gradient(160deg,#1d2433 0%,#2c3550 55%,#4a3f5c 100%)", tone: "dark" },
  vino: { label: "Vino", bg: "linear-gradient(160deg,#3a1420 0%,#5e2333 60%,#7d3a48 100%)", tone: "dark" },
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
  template: "clasico",
  bgKind: "preset",
  preset: "jardin",
  image: null,
  overlay: 30,
  tone: "light",
  photos: [],
  photosTitle: "Nuestra sesión de fotos",
  songSrc: "none",
  songUrl: null,
  songTitle: "",
  volume: 60,
  details: false,
};

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const firstName = (full) => String(full || "").trim().split(/\s+/)[0] || "";

function coupleShort(c) {
  const a = firstName(c.n1);
  const b = firstName(c.n2);
  // "José de Jesús" se acorta mal a "José"; si el segundo nombre empieza con "de", se conserva.
  const keep = (full, f) => {
    const parts = String(full || "").trim().split(/\s+/);
    return parts[1] && /^(de|del)$/i.test(parts[1]) && parts[2] ? parts.slice(0, 3).join(" ") : f;
  };
  return [keep(c.n1, a), keep(c.n2, b)].filter(Boolean).join(" y ");
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  if (isNaN(d)) return "";
  const s = d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (!Number.isFinite(h)) return "";
  const ap = h < 12 ? "a. m." : "p. m.";
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")} ${ap}`;
}

const safeUrl = (u) => (typeof u === "string" && /^https:\/\//i.test(u) ? u : "");

function bgStyle(c) {
  if (c.bgKind === "image" && safeUrl(c.image)) {
    const o = Math.min(85, Math.max(0, Number(c.overlay) || 0)) / 100;
    const shade = c.tone === "dark" ? `rgba(15,15,25,${o})` : `rgba(255,252,246,${o})`;
    return `background:linear-gradient(${shade},${shade}),url("${encodeURI(c.image).replace(/'/g, "%27")}") center/cover no-repeat`;
  }
  const p = PRESETS[c.preset] || PRESETS.jardin;
  return `background:${p.bg}`;
}

function toneOf(c) {
  if (c.bgKind === "image") return c.tone === "dark" ? "dark" : "light";
  return (PRESETS[c.preset] || PRESETS.jardin).tone;
}

// Devuelve el HTML de la invitación. `guest` es opcional ({nombre, pases}).
function renderInvitation(c, guest) {
  c = { ...DEFAULT_CONFIG, ...c };
  const tone = toneOf(c);
  const names = [c.n1, c.n2].filter(Boolean);
  const schedule = (c.schedule || []).filter((s) => s && (s.label || s.from));
  const photos = (c.photos || []).map(safeUrl).filter(Boolean);
  const map = safeUrl(c.mapUrl);
  const place = [c.venue, c.city].filter(Boolean).join(", ");

  return `
  <article class="inv tpl-${esc(c.template)} tone-${tone}">
    <section class="cover" style='${bgStyle(c)}'>
      <div class="cover-inner">
        <p class="kicker">Nuestra boda</p>
        <h1 class="names">${names.map((n) => `<span>${esc(n)}</span>`).join('<span class="amp">&amp;</span>') || "Nombres de la pareja"}</h1>
        ${c.note ? `<p class="note">${esc(c.note)}</p>` : ""}
        ${c.date ? `<p class="date">${esc(fmtDate(c.date))}</p>` : ""}
        ${c.time ? `<p class="time">${esc(fmtTime(c.time))}</p>` : ""}
        ${guest ? `<div class="guest"><p>Invitación para</p><strong>${esc(guest.nombre)}</strong><p>${guest.pases} ${guest.pases === 1 ? "pase" : "pases"}</p></div>` : ""}
      </div>
    </section>

    ${
      c.date
        ? `<section class="block countdown" data-date="${esc(c.date)}" data-time="${esc(c.time || "00:00")}">
        <h2>Faltan</h2><div class="cd"></div></section>`
        : ""
    }

    ${
      place || map
        ? `<section class="block place">
        <h2>Lugar</h2>
        ${c.venue ? `<p class="venue">${esc(c.venue)}</p>` : ""}
        ${c.city ? `<p class="muted">${esc(c.city)}</p>` : ""}
        ${map ? `<a class="btn" href="${esc(map)}" target="_blank" rel="noopener">Ver ubicación</a>` : ""}
      </section>`
        : ""
    }

    ${
      schedule.length
        ? `<section class="block schedule">
        <h2>Programa</h2>
        <ol>${schedule
          .map(
            (s) =>
              `<li><span class="hr">${esc(fmtTime(s.from))}${s.to ? ` – ${esc(fmtTime(s.to))}` : ""}</span><span class="lb">${esc(s.label)}</span></li>`
          )
          .join("")}</ol>
      </section>`
        : ""
    }

    ${
      photos.length
        ? `<section class="block photos">
        <h2>${esc(c.photosTitle || "Nuestra sesión de fotos")}</h2>
        <div class="grid">${photos
          .map((u, i) => `<button class="ph" data-i="${i}" aria-label="Ver foto ${i + 1}"><img src="${esc(u)}" alt="" loading="lazy"></button>`)
          .join("")}</div>
      </section>`
        : ""
    }

    <section class="block rsvp-slot"></section>
  </article>`;
}

// Activa la cuenta regresiva y la galería dentro de `root`.
function wireInvitation(root, c) {
  const cd = root.querySelector(".countdown");
  if (cd) {
    const target = new Date(`${cd.dataset.date}T${cd.dataset.time}:00`);
    const box = cd.querySelector(".cd");
    const tick = () => {
      const ms = target - Date.now();
      if (ms <= 0) {
        box.innerHTML = `<p class="today">¡Llegó el gran día!</p>`;
        return;
      }
      const d = Math.floor(ms / 864e5),
        h = Math.floor((ms / 36e5) % 24),
        m = Math.floor((ms / 6e4) % 60),
        s = Math.floor((ms / 1e3) % 60);
      box.innerHTML = [
        [d, "días"],
        [h, "horas"],
        [m, "min"],
        [s, "seg"],
      ]
        .map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`)
        .join("");
    };
    tick();
    clearInterval(root._cd);
    root._cd = setInterval(tick, 1000);
  }

  const photos = (c.photos || []).map(safeUrl).filter(Boolean);
  root.querySelectorAll(".ph").forEach((b) =>
    b.addEventListener("click", () => openLightbox(photos[Number(b.dataset.i)]))
  );
}

function openLightbox(src) {
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = `<img src="${esc(src)}" alt="">`;
  const close = () => {
    lb.remove();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => e.key === "Escape" && close();
  lb.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  document.body.appendChild(lb);
}

const INVITATION_CSS = `
.inv{--ink:#2b2a28;--muted:#6d6a64;--accent:#8a6d3b;--card:#fffdf9;max-width:560px;margin:0 auto;background:var(--card);color:var(--ink);font-family:"Cormorant Garamond",Georgia,serif;box-shadow:0 10px 40px rgba(0,0,0,.12);overflow:hidden}
.inv .cover{min-height:88vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:48px 24px}
.inv.tone-dark .cover{color:#fbf6ee}
.inv .cover-inner{max-width:440px}
.inv .kicker{font-family:"Montserrat",system-ui,sans-serif;letter-spacing:.35em;text-transform:uppercase;font-size:.72rem;margin:0 0 18px;opacity:.8}
.inv .names{font-family:"Great Vibes","Cormorant Garamond",cursive;font-weight:400;font-size:clamp(2.6rem,11vw,4rem);line-height:1.05;margin:0 0 18px;display:flex;flex-direction:column;gap:4px}
.inv .names .amp{font-size:.6em;opacity:.75}
.inv .note{font-size:1.25rem;font-style:italic;margin:0 0 22px}
.inv .date{font-size:1.3rem;margin:0;font-weight:600}
.inv .time{font-size:1.15rem;margin:4px 0 0}
.inv .guest{margin-top:28px;padding:16px 20px;border:1px solid currentColor;border-radius:4px;opacity:.95}
.inv .guest p{margin:0;font-family:"Montserrat",system-ui,sans-serif;font-size:.75rem;letter-spacing:.15em;text-transform:uppercase}
.inv .guest strong{display:block;font-size:1.6rem;font-weight:600;margin:6px 0}
.inv .block{padding:40px 24px;text-align:center;border-top:1px solid #eee5d6}
.inv .block h2{font-family:"Montserrat",system-ui,sans-serif;font-weight:500;letter-spacing:.3em;text-transform:uppercase;font-size:.8rem;color:var(--accent);margin:0 0 18px}
.inv .venue{font-size:1.5rem;margin:0}
.inv .muted{color:var(--muted);margin:4px 0 0}
.inv .btn,.inv button.btn{display:inline-block;margin-top:18px;padding:12px 26px;border-radius:999px;background:var(--accent);color:#fff;text-decoration:none;font-family:"Montserrat",system-ui,sans-serif;font-size:.85rem;letter-spacing:.08em;border:0;cursor:pointer}
.inv .btn.ghost{background:transparent;color:var(--accent);border:1px solid var(--accent)}
.inv .cd{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}
.inv .cd div{min-width:64px}
.inv .cd b{display:block;font-size:2rem;font-weight:600}
.inv .cd span{font-family:"Montserrat",system-ui,sans-serif;font-size:.7rem;text-transform:uppercase;letter-spacing:.15em;color:var(--muted)}
.inv .today{font-size:1.4rem;margin:0}
.inv .schedule ol{list-style:none;margin:0 auto;padding:0;max-width:360px}
.inv .schedule li{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px dashed #e4d9c6;font-size:1.15rem;text-align:left}
.inv .schedule .hr{color:var(--muted);white-space:nowrap;font-size:1rem}
.inv .photos .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.inv .ph{padding:0;border:0;background:#eee;aspect-ratio:1;cursor:zoom-in;overflow:hidden}
.inv .ph img{width:100%;height:100%;object-fit:cover;display:block}
.inv .rsvp-slot:empty{display:none}
.inv.tpl-moderno{font-family:"Montserrat",system-ui,sans-serif}
.inv.tpl-moderno .names{font-family:"Montserrat",system-ui,sans-serif;font-weight:300;letter-spacing:.04em;font-size:clamp(2rem,8vw,3rem)}
.lightbox{position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;z-index:100;cursor:zoom-out;padding:16px}
.lightbox img{max-width:100%;max-height:100%;object-fit:contain}
`;

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Great+Vibes&family=Montserrat:wght@300;400;500&display=swap";
