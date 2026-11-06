// =====================================================================
//  PHYSIK
//  Eigene 2D-Physik für den Flipper. Jeder Physik-Takt wird in so viele
//  Zwischenschritte geteilt, dass sich ein Ball pro Zwischenschritt höchstens
//  ein paar Einheiten bewegt. So kann er nie durch eine Wand rutschen.
// =====================================================================

const PH = {
  takt: 1 / 120,        // fester Physik-Takt in Sekunden
  maxWeg: 3,            // so weit darf sich ein Ball pro Zwischenschritt bewegen
  maxTempo: 2600,       // schneller wird kein Ball
  ballR: 11,
  schwerkraft: 1250     // Neigung des Tisches, wird je nach Stufe angepasst
};

// Materialien: Abprall (0 = tot, 1 = voll) und Reibung entlang der Fläche
const MAT = {
  metall: { e: 0.38, reib: 0.008 },
  gummi: { e: 0.72, reib: 0.03 },
  plastik: { e: 0.3, reib: 0.015 },
  flipper: { e: 0.5, reib: 0.04 },
  bumper: { e: 0.6, reib: 0.0 }
};

// --------- Bausteine ---------

// Eine Wand ist eine Strecke mit Dicke (Kapsel). Optionen: mat, r, kick, einweg, ...
function wand(ax, ay, bx, by, opt = {}) {
  const m = MAT[opt.mat || 'metall'];
  return Object.assign({ art: 'seg', ax, ay, bx, by, r: 3.5, e: m.e, reib: m.reib, aktiv: true, kick: 0, sperre: 0 }, opt);
}
function pfosten(x, y, r, opt = {}) {
  const m = MAT[opt.mat || 'gummi'];
  return Object.assign({ art: 'kreis', x, y, r, e: m.e, reib: m.reib, aktiv: true, kick: 0, sperre: 0 }, opt);
}
// Mehrere Punkte nacheinander verbunden
function linienzug(punkte, opt = {}) {
  const teile = [];
  for (let i = 0; i < punkte.length - 1; i++) teile.push(wand(punkte[i][0], punkte[i][1], punkte[i + 1][0], punkte[i + 1][1], opt));
  return teile;
}
// Punkte auf einem Kreisbogen (Winkel in Grad, y zeigt nach unten)
function bogen(cx, cy, r, von, bis, n) {
  const p = [];
  for (let i = 0; i <= n; i++) {
    const w = (von + (bis - von) * i / n) * Math.PI / 180;
    p.push([cx + r * Math.cos(w), cy + r * Math.sin(w)]);
  }
  return p;
}

// --------- Flipper ---------

class Flipper {
  constructor(x, y, seite, laenge) {
    this.x = x; this.y = y;
    this.s = seite === 'links' ? 1 : -1;
    this.seite = seite;
    this.L = laenge;
    this.r0 = 12.5; this.r1 = 7;
    this.ruhe = 0.52;      // 30 Grad nach unten
    this.oben = -0.45;     // 26 Grad nach oben
    this.w = this.ruhe;
    this.wTempo = 0;       // Drehgeschwindigkeit in rad/s (links-Sicht)
    this.gedrueckt = false;
    this.hochTempo = 30;
    this.runterTempo = 17;
    this.e = MAT.flipper.e; this.reib = MAT.flipper.reib; this.kick = 0; this.sperre = 0;
  }
  spitze() { return [this.x + this.s * this.L * Math.cos(this.w), this.y + this.L * Math.sin(this.w)]; }
  bewegt() { return this.wTempo !== 0; }
  schritt(h) {
    const ziel = this.gedrueckt ? this.oben : this.ruhe;
    if (this.w > ziel) {
      this.wTempo = -this.hochTempo;
      this.w = Math.max(ziel, this.w - this.hochTempo * h);
    } else if (this.w < ziel) {
      this.wTempo = this.runterTempo;
      this.w = Math.min(ziel, this.w + this.runterTempo * h);
    } else this.wTempo = 0;
    if (this.w === ziel) this.wTempo = 0;
  }
}

// --------- Welt ---------

class Welt {
  constructor() {
    this.teile = [];        // feste Hindernisse (Wände, Pfosten, Ziele)
    this.flipper = [];
    this.baelle = [];
    this.linien = [];       // Lichtschranken: melden, wenn ein Ball sie kreuzt
    this.punkte = [];       // Kontaktfelder: melden, wenn ein Ball hineinrollt
    this.raster = null;
    this.zelle = 40;
    this.zeit = 0;
    this.zeitlupe = 1;
  }

  // Raster für die schnelle Suche: Jede Zelle kennt die Hindernisse in ihrer Nähe
  baueRaster(breite, hoehe) {
    const z = this.zelle;
    this.sp = Math.ceil(breite / z) + 2;
    this.ze = Math.ceil(hoehe / z) + 3;
    this.raster = Array.from({ length: this.sp * this.ze }, () => []);
    const rand = PH.ballR + 6;
    for (const t of this.teile) {
      let x0, y0, x1, y1;
      if (t.art === 'seg') {
        x0 = Math.min(t.ax, t.bx) - t.r - rand; x1 = Math.max(t.ax, t.bx) + t.r + rand;
        y0 = Math.min(t.ay, t.by) - t.r - rand; y1 = Math.max(t.ay, t.by) + t.r + rand + (t.beweglich || 0);
      } else {
        x0 = t.x - t.r - rand; x1 = t.x + t.r + rand; y0 = t.y - t.r - rand; y1 = t.y + t.r + rand;
      }
      for (let cy = Math.max(0, Math.floor(y0 / z) + 1); cy <= Math.min(this.ze - 1, Math.floor(y1 / z) + 1); cy++)
        for (let cx = Math.max(0, Math.floor(x0 / z) + 1); cx <= Math.min(this.sp - 1, Math.floor(x1 / z) + 1); cx++)
          this.raster[cy * this.sp + cx].push(t);
    }
  }
  inZelle(x, y) {
    const cx = Math.floor(x / this.zelle) + 1, cy = Math.floor(y / this.zelle) + 1;
    if (cx < 0 || cy < 0 || cx >= this.sp || cy >= this.ze) return [];
    return this.raster[cy * this.sp + cx];
  }

  // Ein fester Physik-Takt
  takt(dt) {
    dt *= this.zeitlupe;
    let schnellster = 0;
    for (const b of this.baelle) if (b.ort === 'tisch') schnellster = Math.max(schnellster, Math.hypot(b.vx, b.vy));
    const flipperLaeuft = this.flipper.some(f => f.gedrueckt ? f.w > f.oben : f.w < f.ruhe);
    let n = Math.ceil(schnellster * dt / PH.maxWeg);
    if (flipperLaeuft) n = Math.max(n, 10);
    n = Math.max(2, Math.min(30, n));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      for (const f of this.flipper) f.schritt(h);
      for (const b of this.baelle) if (b.ort === 'tisch') this.bewegeBall(b, h);
      this.baelleUntereinander();
    }
    for (const t of this.teile) if (t.sperre > 0) t.sperre -= dt;
    this.zeit += dt;
  }

  bewegeBall(b, h) {
    b.vy += PH.schwerkraft * h;
    let v = Math.hypot(b.vx, b.vy);
    if (v > PH.maxTempo) { b.vx *= PH.maxTempo / v; b.vy *= PH.maxTempo / v; }
    // ganz leichte Rollreibung
    b.vx *= 1 - 0.04 * h; b.vy *= 1 - 0.04 * h;
    const altX = b.x, altY = b.y;
    b.x += b.vx * h;
    b.y += b.vy * h;

    // Zweimal prüfen, damit Ecken zwischen zwei Wänden sauber gelöst werden
    for (let runde = 0; runde < 2; runde++) {
      for (const t of this.inZelle(b.x, b.y)) {
        if (!t.aktiv) continue;
        if (t.art === 'seg') this.stossSeg(b, t); else this.stossKreis(b, t);
      }
      for (const f of this.flipper) this.stossFlipper(b, f);
    }

    // Lichtschranken
    for (const l of this.linien) {
      if (!l.aktiv) continue;
      const k = kreuzt(altX, altY, b.x, b.y, l.ax, l.ay, l.bx, l.by);
      if (k) l.melde(b, k);
    }
    for (const p of this.punkte) {
      const drin = (b.x - p.x) ** 2 + (b.y - p.y) ** 2 < p.r * p.r;
      const war = b.in.has(p);
      if (drin && !war) { b.in.add(p); if (p.rein) p.rein(b); }
      else if (!drin && war) { b.in.delete(p); if (p.raus) p.raus(b); }
      if (drin && p.drin) p.drin(b);
    }
  }

  // Ball gegen dicke Strecke
  stossSeg(b, t) {
    const ex = t.bx - t.ax, ey = t.by - t.ay;
    const ll = ex * ex + ey * ey;
    let u = ((b.x - t.ax) * ex + (b.y - t.ay) * ey) / ll;
    u = u < 0 ? 0 : u > 1 ? 1 : u;
    const qx = t.ax + ex * u, qy = t.ay + ey * u;
    let dx = b.x - qx, dy = b.y - qy;
    const grenze = PH.ballR + t.r;
    const d2 = dx * dx + dy * dy;
    if (d2 >= grenze * grenze) return;
    // Einbahn-Tor: blockt nur von einer Seite
    if (t.einweg) {
      // Senkrechte auf die Linie, zur Sperrseite gedreht
      let nx = -ey, ny = ex;
      if (nx * t.einweg[0] + ny * t.einweg[1] < 0) { nx = -nx; ny = -ny; }
      if ((b.x - t.ax) * nx + (b.y - t.ay) * ny < 0) return;
    }
    let d = Math.sqrt(d2);
    if (d < 1e-6) { dx = -ey; dy = ex; d = Math.hypot(dx, dy); }
    const nx = dx / d, ny = dy / d;
    this.loese(b, t, nx, ny, grenze - d, 0, 0);
  }

  stossKreis(b, t) {
    let dx = b.x - t.x, dy = b.y - t.y;
    const grenze = PH.ballR + t.r;
    const d2 = dx * dx + dy * dy;
    if (d2 >= grenze * grenze) return;
    let d = Math.sqrt(d2);
    if (d < 1e-6) { dx = 0; dy = -1; d = 1; }
    this.loese(b, t, dx / d, dy / d, grenze - d, 0, 0);
  }

  stossFlipper(b, f) {
    const [tx, ty] = f.spitze();
    const ex = tx - f.x, ey = ty - f.y;
    const ll = ex * ex + ey * ey;
    let u = ((b.x - f.x) * ex + (b.y - f.y) * ey) / ll;
    u = u < 0 ? 0 : u > 1 ? 1 : u;
    const qx = f.x + ex * u, qy = f.y + ey * u;
    const rr = f.r0 + (f.r1 - f.r0) * u;
    let dx = b.x - qx, dy = b.y - qy;
    const grenze = PH.ballR + rr;
    const d2 = dx * dx + dy * dy;
    if (d2 >= grenze * grenze) return;
    let d = Math.sqrt(d2);
    if (d < 1e-6) { dx = 0; dy = -1; d = 1; }
    const nx = dx / d, ny = dy / d;
    // Geschwindigkeit der Flipperfläche am Berührpunkt (Drehung um den Drehpunkt)
    const om = f.s * f.wTempo;
    const cx = qx + nx * rr - f.x, cy = qy + ny * rr - f.y;
    const sx = -om * cy, sy = om * cx;
    this.loese(b, f, nx, ny, grenze - d, sx, sy);
  }

  // Ball aus dem Hindernis schieben und abprallen lassen
  loese(b, t, nx, ny, tiefe, sx, sy) {
    b.x += nx * tiefe;
    b.y += ny * tiefe;
    const rvx = b.vx - sx, rvy = b.vy - sy;
    const vn = rvx * nx + rvy * ny;
    if (vn >= 0) {
      // schon auf dem Weg weg, aber Kicker können trotzdem auslösen, wenn der Ball nur aufliegt
      return;
    }
    const wucht = -vn;
    let e = t.e;
    if (wucht < 45) e = 0;   // aufliegender Ball zittert nicht
    // Normalanteil umkehren, Tangentialanteil leicht bremsen
    const tx = rvx - vn * nx, ty = rvy - vn * ny;
    let nvx = tx * (1 - t.reib) - e * vn * nx;
    let nvy = ty * (1 - t.reib) - e * vn * ny;
    b.vx = nvx + sx;
    b.vy = nvy + sy;
    // Aktive Teile (Bumper, Schleudern) geben zusätzlich Schwung
    if (t.kick && t.sperre <= 0 && wucht >= (t.kickAb || 0)) {
      const jetzt = b.vx * nx + b.vy * ny;
      if (jetzt < t.kick) {
        const dazu = t.kick - jetzt;
        b.vx += nx * dazu;
        b.vy += ny * dazu;
      }
      t.sperre = t.kickPause || 0.06;
      if (t.beiKick) t.beiKick(b, wucht);
    } else if (t.beiTreffer && wucht > 25) {
      t.beiTreffer(b, wucht);
    }
    if (b.beiStoss) b.beiStoss(wucht, t);
  }

  baelleUntereinander() {
    const L = this.baelle;
    for (let i = 0; i < L.length; i++) {
      const a = L[i];
      if (a.ort !== 'tisch') continue;
      for (let j = i + 1; j < L.length; j++) {
        const c = L[j];
        if (c.ort !== 'tisch') continue;
        const dx = c.x - a.x, dy = c.y - a.y;
        const d2 = dx * dx + dy * dy, g = PH.ballR * 2;
        if (d2 >= g * g || d2 < 1e-6) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
        const tief = (g - d) / 2;
        a.x -= nx * tief; a.y -= ny * tief; c.x += nx * tief; c.y += ny * tief;
        const vn = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
        if (vn < 0) {
          const j2 = -(1 + 0.9) * vn / 2;
          a.vx -= j2 * nx; a.vy -= j2 * ny; c.vx += j2 * nx; c.vy += j2 * ny;
        }
      }
    }
  }
}

// Schneidet die Strecke p0->p1 die Linie a->b? Gibt +1 oder -1 zurück (Seite), sonst 0
function kreuzt(x0, y0, x1, y1, ax, ay, bx, by) {
  const rx = x1 - x0, ry = y1 - y0, sx = bx - ax, sy = by - ay;
  const nenner = rx * sy - ry * sx;
  if (Math.abs(nenner) < 1e-9) return 0;
  const t = ((ax - x0) * sy - (ay - y0) * sx) / nenner;
  const u = ((ax - x0) * ry - (ay - y0) * rx) / nenner;
  if (t < 0 || t > 1 || u < 0 || u > 1) return 0;
  return nenner > 0 ? 1 : -1;
}

// --------- Rampen und Tunnel ---------
// Auf einer Rampe läuft der Ball eine feste Bahn entlang. Bergauf wird er langsamer;
// reicht der Schwung nicht, rollt er zurück. So kann er nie steckenbleiben.

class Bahn {
  constructor(punkte, opt = {}) {
    this.p = glaette(punkte, opt.glatt == null ? 3 : opt.glatt);
    this.len = [0];
    for (let i = 1; i < this.p.length; i++) this.len.push(this.len[i - 1] + Math.hypot(this.p[i][0] - this.p[i - 1][0], this.p[i][1] - this.p[i - 1][1]));
    this.L = this.len[this.len.length - 1];
    this.auf = opt.auf || 0.4;        // Anteil bergauf
    this.ab = opt.ab || 0.35;         // Anteil bergab
    this.bremse = opt.bremse || 1500; // Verzögerung bergauf
    this.schub = opt.schub || 700;    // Beschleunigung bergab
  }
  ort(s) {
    s = Math.max(0, Math.min(this.L, s));
    let lo = 0, hi = this.len.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (this.len[m] <= s) lo = m; else hi = m; }
    const a = this.p[lo], b = this.p[hi];
    const st = this.len[hi] - this.len[lo] || 1;
    const k = (s - this.len[lo]) / st;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, (b[0] - a[0]) / st, (b[1] - a[1]) / st];
  }
  // Höhe 0..1 für die Darstellung
  hoehe(s) {
    const f = s / this.L;
    if (f < this.auf) return f / this.auf;
    if (f > 1 - this.ab) return Math.max(0, (1 - f) / this.ab);
    return 1;
  }
  beschl(s) {
    const f = s / this.L;
    if (f < this.auf) return -this.bremse;
    if (f > 1 - this.ab) return this.schub;
    return -60;
  }
}

// Ecken einer Punktliste abrunden (Chaikin), damit Bahnen weich aussehen
function glaette(p, runden) {
  let q = p.map(x => [x[0], x[1]]);
  for (let r = 0; r < runden; r++) {
    const n = [q[0]];
    for (let i = 0; i < q.length - 1; i++) {
      const a = q[i], b = q[i + 1];
      n.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    n.push(q[q.length - 1]);
    q = n;
  }
  return q;
}
