// =====================================================================
//  GRAFIK
//  Zeichnet alles auf eine Leinwand in voller Bildschirmschärfe.
//  Was sich nie ändert (Hintergrund, Wände, Rampen), wird einmal vorgemalt.
// =====================================================================

const HUDH = 40;                   // Anzeige über dem Tisch (in Tisch-Einheiten)
const VB = TB, VH = TH + HUDH;     // ganze Zeichenfläche
const leinwand = $('bild');
const ctx = leinwand.getContext('2d');
const FARBE = {
  cyan: '#38f3ff', cyanHell: '#b9fbff', violett: '#a066ff', pink: '#ff4fd8', gold: '#ffd84a', gruen: '#4dff9a', rot: '#ff4d6d',
  grund: '#060716', grund2: '#0e0a2c'
};
const RAMPENFARBE = { cyan: ['56,243,255', '#38f3ff'], violett: ['176,102,255', '#b066ff'] };
const SCHRIFT = "'Press Start 2P', 'Courier New', monospace";

let ansicht = { k: 1, ox: 0, oy: 0, dpr: 1, b: 0, h: 0 };
let unten = null, oben = null, ballBild = null;
const glanzCache = new Map();

function passeGroesseAn() {
  const b = window.innerWidth, h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const k = Math.min(b / VB, h / VH);
  ansicht = { k, ox: (b - VB * k) / 2, oy: Math.max(0, (h - VH * k) / 2), dpr, b, h };
  leinwand.width = Math.round(b * dpr);
  leinwand.height = Math.round(h * dpr);
  if (s) baueBilder();
  setzeKnopfPlatz();
}

// Die runden Knöpfe oben rechts sitzen in der Anzeige über dem Tisch
function setzeKnopfPlatz() {
  const kn = document.querySelector('.knoepfchen');
  if (!kn) return;
  kn.style.top = Math.max(8, ansicht.oy + 10) + 'px';
  kn.style.right = Math.max(8, ansicht.ox + 10) + 'px';
}

// Weiches Leuchten als fertiges Bild, je Farbe einmal erzeugt
function glanz(farbe) {
  if (glanzCache.has(farbe)) return glanzCache.get(farbe);
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const v = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  v.addColorStop(0, farbe);
  v.addColorStop(0.25, farbe + 'aa');
  v.addColorStop(0.6, farbe + '22');
  v.addColorStop(1, farbe + '00');
  g.fillStyle = v;
  g.fillRect(0, 0, 128, 128);
  glanzCache.set(farbe, c);
  return c;
}
function leuchte(c, x, y, r, farbe, staerke = 1) {
  if (staerke <= 0.01) return;
  c.globalAlpha = Math.min(1, staerke);
  c.drawImage(glanz(farbe), x - r, y - r, r * 2, r * 2);
  c.globalAlpha = 1;
}

// kp: Bildpunkte pro Tisch-Einheit, versatz: Platz für die Anzeige über dem Tisch
function neueLeinwand(kp, versatz) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(VB * kp));
  c.height = Math.max(1, Math.round((TH + versatz) * kp));
  const g = c.getContext('2d');
  g.setTransform(kp, 0, 0, kp, 0, 0);
  return [c, g];
}

function baueBilder() {
  const kp = ansicht.k * ansicht.dpr;
  unten = malUnten(s.T, s.thema, kp, HUDH);
  oben = malRampen(s.T, s.thema, kp, HUDH);
  ballBild = malBall(s.thema, kp);
}

function pfad(c, p) {
  c.beginPath();
  c.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]);
}

// --------------------------- Hintergrund und Wände ---------------------------

function malUnten(T, th, kp, versatz) {
  const [cv, c] = neueLeinwand(kp, versatz);
  // Anzeige-Hintergrund
  c.fillStyle = '#04040d';
  c.fillRect(0, 0, VB, VH);
  c.translate(0, versatz);

  // Spielfläche: Umriss des Tisches
  const flaeche = () => {
    c.beginPath();
    c.moveTo(20, TH + 10);
    c.lineTo(20, 330);
    c.arc(270, 330, 250, Math.PI, 0);
    c.lineTo(520, TH + 10);
    c.closePath();
  };
  c.save();
  flaeche();
  c.clip();
  const v = c.createLinearGradient(0, 80, 0, TH);
  v.addColorStop(0, th.grund[0]);
  v.addColorStop(0.5, th.grund[1]);
  v.addColorStop(1, th.grund[2]);
  c.fillStyle = v;
  c.fillRect(0, 0, TB, TH + 20);
  th.male(c, T);
  c.restore();

  // Rand-Leuchten um den Tisch
  c.save();
  c.shadowColor = th.rand;
  c.shadowBlur = 24;
  c.strokeStyle = th.rand;
  c.globalAlpha = 0.6;
  c.lineWidth = 3;
  flaeche();
  c.stroke();
  c.restore();

  // Schatten der Rampen auf dem Tisch
  for (const ra of T.rampen) {
    c.save();
    c.translate(7, 9);
    pfad(c, ra.bahn.p);
    c.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    c.lineWidth = 36;
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.stroke();
    c.restore();
  }

  // Abdeckblech unten links und rechts
  for (const sgn of [1, -1]) {
    const X = x => sgn === 1 ? x : spiegel(x);
    c.beginPath();
    c.moveTo(X(20), 1000); c.lineTo(X(20), 905); c.lineTo(X(58), 905); c.lineTo(X(58), 775); c.lineTo(X(150), 822); c.lineTo(X(150), 1000);
    c.closePath();
    const m = c.createLinearGradient(X(20), 820, X(146), 960);
    m.addColorStop(0, th.blech[0]); m.addColorStop(1, th.blech[1]);
    c.fillStyle = m;
    c.fill();
    c.strokeStyle = th.blech[2];
    c.lineWidth = 1.5;
    c.stroke();
  }

  // Wände
  for (const w of T.waende) malWand(c, w, th);

  // Abschussbahn-Rillen
  c.strokeStyle = 'rgba(255,255,255,0.05)';
  for (let y = 360; y < 880; y += 22) { c.beginPath(); c.moveTo(SCHUSS.innen + 6, y); c.lineTo(SCHUSS.aussen - 6, y); c.stroke(); }

  // Schleudern
  for (const sl of T.schleudern) {
    c.beginPath();
    c.moveTo(...sl.A); c.lineTo(...sl.B); c.lineTo(...sl.C); c.closePath();
    const m = c.createLinearGradient(sl.A[0], sl.A[1], sl.C[0], sl.C[1]);
    m.addColorStop(0, th.schleuder[0]); m.addColorStop(1, th.schleuder[1]);
    c.fillStyle = m;
    c.fill();
    c.lineJoin = 'round';
    c.strokeStyle = th.schleuder[2];
    c.lineWidth = 8;
    c.stroke();
    c.strokeStyle = th.schleuder[3];
    c.lineWidth = 4;
    c.stroke();
  }

  // Blech hinter den Fallzielen
  if (T.dach) { pfad(c, T.dach); c.strokeStyle = th.schiene.hell; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke(); }

  // Löcher: dunkler Schacht
  for (const l of T.loecher) {
    const g = c.createRadialGradient(l.x, l.y, 2, l.x, l.y, l.r + 4);
    g.addColorStop(0, '#000');
    g.addColorStop(0.7, '#05050c');
    g.addColorStop(1, th.schiene.dunkel);
    c.fillStyle = g;
    c.beginPath(); c.arc(l.x, l.y, l.r + 4, 0, Math.PI * 2); c.fill();
  }

  // Tunnel unter dem Tisch: gestrichelte Leuchtspur
  c.save();
  c.setLineDash([4, 7]);
  c.strokeStyle = th.f.gruen;
  c.globalAlpha = 0.3;
  c.lineWidth = 3;
  pfad(c, T.tunnel.p);
  c.stroke();
  c.restore();

  // Spinner-Halter
  c.fillStyle = th.schiene.hell;
  for (const x of [22, 64]) { c.beginPath(); c.arc(x, T.spinner.y, 3.5, 0, Math.PI * 2); c.fill(); }
  return cv;
}

function malWand(c, w, th) {
  const sch = th.schiene;
  c.save();
  c.lineCap = 'round'; c.lineJoin = 'round';
  pfad(c, w.p);
  if (w.art === 'gummi') {
    c.strokeStyle = th.gummi[0]; c.lineWidth = w.r * 2 + 8; c.stroke();
    c.strokeStyle = th.gummi[1]; c.lineWidth = w.r * 2; c.stroke();
  } else if (w.art === 'lippe') {
    c.strokeStyle = sch.hell; c.lineWidth = w.r * 2; c.stroke();
    c.strokeStyle = sch.kante; c.lineWidth = 1; c.stroke();
  } else if (w.art === 'stift') {
    c.strokeStyle = sch.glow; c.lineWidth = w.r * 2 + 7; c.stroke();
    c.strokeStyle = sch.kante; c.lineWidth = w.r * 2; c.stroke();
  } else {
    // Schiene im Material der Welt mit leuchtender Kante
    c.strokeStyle = sch.glow; c.lineWidth = w.r * 2 + 9; c.stroke();
    c.strokeStyle = sch.dunkel; c.lineWidth = w.r * 2 + 2; c.stroke();
    c.strokeStyle = sch.hell; c.lineWidth = w.r * 2 - 2; c.stroke();
    c.strokeStyle = sch.kante; c.lineWidth = 1; c.stroke();
  }
  c.restore();
}

// --------------------------- Rampen (oberste Ebene) ---------------------------

function malRampen(T, th, kp, versatz) {
  const [cv, c] = neueLeinwand(kp, versatz);
  c.translate(0, versatz);
  c.lineCap = 'round'; c.lineJoin = 'round';
  // die rechte liegt tiefer und wird zuerst gemalt
  for (const ra of [...T.rampen].reverse()) {
    const { rgb, voll } = th.rampen[ra.nr];
    const p = ra.bahn.p;
    const kanten = [-1, 1].map(seite => p.map((pt, i) => {
      const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [pt[0] - (b[1] - a[1]) / l * 16 * seite, pt[1] + (b[0] - a[0]) / l * 16 * seite];
    }));
    const streben = (farbe, breite, abstand = 26) => {
      c.strokeStyle = farbe; c.lineWidth = breite;
      for (let sPos = 30; sPos < ra.bahn.L - 10; sPos += abstand) {
        const [x, y, tx, ty] = ra.bahn.ort(sPos);
        c.beginPath(); c.moveTo(x - ty * 16, y + tx * 16); c.lineTo(x + ty * 16, y - tx * 16); c.stroke();
      }
    };
    if (th.rampenStil === 'stein') {
      // Steinrinne mit Wasser darin
      pfad(c, p); c.strokeStyle = 'rgba(70,56,36,0.9)'; c.lineWidth = 36; c.stroke();
      pfad(c, p); c.strokeStyle = `rgba(${rgb},0.35)`; c.lineWidth = 16; c.stroke();
      streben('rgba(30,22,12,0.6)', 2, 22);
      for (const q of kanten) { pfad(c, q); c.strokeStyle = '#c9a46a'; c.lineWidth = 4; c.stroke(); pfad(c, q); c.strokeStyle = voll; c.lineWidth = 1; c.stroke(); }
    } else if (th.rampenStil === 'glas') {
      // Glasröhre
      pfad(c, p); c.strokeStyle = `rgba(${rgb},0.12)`; c.lineWidth = 34; c.stroke();
      pfad(c, p); c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 12; c.stroke();
      for (const q of kanten) { pfad(c, q); c.strokeStyle = `rgba(${rgb},0.35)`; c.lineWidth = 6; c.stroke(); pfad(c, q); c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1.5; c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.35)';
      for (let sPos = 20; sPos < ra.bahn.L; sPos += 37) { const [x, y] = ra.bahn.ort(sPos); c.beginPath(); c.arc(x + ((sPos * 7) % 11) - 5, y, 2, 0, Math.PI * 2); c.fill(); }
    } else if (th.rampenStil === 'lava') {
      // Eisenrinne mit glühender Lava
      pfad(c, p); c.strokeStyle = 'rgba(26,16,12,0.92)'; c.lineWidth = 36; c.stroke();
      c.globalCompositeOperation = 'lighter';
      pfad(c, p); c.strokeStyle = `rgba(${rgb},0.25)`; c.lineWidth = 20; c.stroke();
      pfad(c, p); c.strokeStyle = `rgba(${rgb},0.8)`; c.lineWidth = 6; c.stroke();
      c.globalCompositeOperation = 'source-over';
      streben('rgba(90,70,60,0.8)', 2.5, 30);
      for (const q of kanten) { pfad(c, q); c.strokeStyle = '#5a4a44'; c.lineWidth = 4; c.stroke(); pfad(c, q); c.strokeStyle = voll; c.lineWidth = 1; c.stroke(); }
    } else {
      // Neon (Klassik, Weltraum, Cyberpunk)
      pfad(c, p);
      c.strokeStyle = 'rgba(8, 10, 30, 0.55)'; c.lineWidth = 34; c.stroke();
      c.strokeStyle = `rgba(${rgb}, 0.13)`; c.lineWidth = 34; c.stroke();
      streben(`rgba(${rgb}, 0.22)`, 1.5);
      for (const q of kanten) {
        pfad(c, q);
        c.strokeStyle = `rgba(${rgb}, 0.25)`; c.lineWidth = 8; c.stroke();
        c.strokeStyle = voll; c.lineWidth = 2.5; c.stroke();
        c.strokeStyle = '#ffffff'; c.lineWidth = 0.8; c.stroke();
      }
    }
  }
  return cv;
}

// --------------------------- Kugel ---------------------------

function malBall(th, kp) {
  const kb = th.ball;
  const R = PH.ballR, gr = Math.ceil(R * 2 * kp * 1.6) + 4;
  const c = document.createElement('canvas');
  c.width = c.height = gr;
  const g = c.getContext('2d');
  const m = gr / 2, r = gr / 2 - 2;
  // Grundkörper: dunkler Stahl
  let v = g.createRadialGradient(m - r * 0.35, m - r * 0.4, r * 0.05, m, m, r);
  [0, 0.18, 0.5, 0.85, 1].forEach((p, i) => v.addColorStop(p, kb.stops[i]));
  g.fillStyle = v;
  g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.fill();
  // Spiegelung des Tisches: cyan unten, violett seitlich
  g.save();
  g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.clip();
  v = g.createLinearGradient(0, m + r * 0.2, 0, m + r);
  v.addColorStop(0, `rgba(${kb.unten},0)`);
  v.addColorStop(1, `rgba(${kb.unten},0.75)`);
  g.fillStyle = v;
  g.fillRect(0, 0, gr, gr);
  v = g.createLinearGradient(m + r, 0, m + r * 0.3, 0);
  v.addColorStop(0, `rgba(${kb.seite},0.6)`);
  v.addColorStop(1, `rgba(${kb.seite},0)`);
  g.fillStyle = v;
  g.fillRect(0, 0, gr, gr);
  // Horizont-Streifen
  g.fillStyle = 'rgba(255,255,255,0.35)';
  g.beginPath(); g.ellipse(m, m + r * 0.05, r * 0.95, r * 0.12, 0, 0, Math.PI * 2); g.fill();
  g.restore();
  // Glanzpunkt
  g.fillStyle = '#ffffff';
  g.beginPath(); g.ellipse(m - r * 0.36, m - r * 0.42, r * 0.22, r * 0.15, -0.6, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(0,0,0,0.5)';
  g.lineWidth = Math.max(1, r * 0.06);
  g.beginPath(); g.arc(m, m, r - g.lineWidth / 2, 0, Math.PI * 2); g.stroke();
  c.mitte = m;
  return c;
}

function zeichneKugel(c, b, groesse = 1) {
  // Im Bild hat die Kugel den Radius (Breite/2 - 2); das Bild wird passend skaliert
  const halb = PH.ballR * groesse * (ballBild.width / 2) / (ballBild.width / 2 - 2);
  c.drawImage(ballBild, b.x - halb, b.y - halb, halb * 2, halb * 2);
}

// --------------------------- Bewegliche Teile ---------------------------

function zeichneFlipper(c, f, th) {
  const fl = th.flipper;
  const [tx, ty] = f.spitze();
  const w = Math.atan2(ty - f.y, tx - f.x);
  const L = Math.hypot(tx - f.x, ty - f.y);
  c.save();
  c.translate(f.x, f.y);
  c.rotate(w);
  const form = () => {
    const a = Math.asin((f.r0 - f.r1) / L);
    c.beginPath();
    c.arc(0, 0, f.r0, Math.PI / 2 + a, Math.PI * 1.5 - a);
    c.arc(L, 0, f.r1, -Math.PI / 2 - a, Math.PI / 2 + a);
    c.closePath();
  };
  // Leuchten, stärker beim Schlagen
  const aktiv = f.gedrueckt ? 1 : 0.4;
  c.globalCompositeOperation = 'lighter';
  c.shadowBlur = 0;
  form();
  c.strokeStyle = `rgba(${fl.glow},${0.18 * aktiv + 0.08})`;
  c.lineWidth = 9;
  c.stroke();
  c.globalCompositeOperation = 'source-over';
  form();
  const m = c.createLinearGradient(0, -f.r0, 0, f.r0);
  [0, 0.35, 0.6, 1].forEach((p, i) => m.addColorStop(p, fl.stops[i]));
  c.fillStyle = m;
  c.fill();
  c.strokeStyle = fl.kante;
  c.lineWidth = 2;
  c.stroke();
  // Gummi-Leuchtstreifen
  c.strokeStyle = `rgba(${fl.glow},${0.5 + aktiv * 0.5})`;
  c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(4, -f.r0 * 0.25); c.lineTo(L - 6, -f.r1 * 0.2); c.stroke();
  c.fillStyle = '#0b0e1c';
  c.beginPath(); c.arc(0, 0, 4.5, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#e8f0ff'; c.lineWidth = 1.5; c.stroke();
  c.restore();
}

// --------------------------- Bumper je Welt ---------------------------

function malBumper(c, bu, th, zeit) {
  const hell = bu.blitz, r = bu.r, x = bu.x, y = bu.y;
  const B = th.bumper;
  // Schatten
  c.fillStyle = 'rgba(0,0,0,0.45)';
  c.beginPath(); c.arc(x + 3, y + 4, r + 2, 0, Math.PI * 2); c.fill();
  let g;
  if (B.stil === 'planet') {
    const [a, m, d] = B.farben[bu.nr % B.farben.length];
    g = c.createRadialGradient(x - r * 0.4, y - r * 0.4, 2, x, y, r);
    g.addColorStop(0, hell > 0.3 ? '#ffffff' : a); g.addColorStop(0.55, m); g.addColorStop(1, d);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 3;
    c.beginPath(); c.arc(x, y, r * 0.55, 0.3, 2.2); c.stroke();
    c.strokeStyle = hell > 0.2 ? '#ffffff' : B.ring; c.lineWidth = 2.5;
    c.beginPath(); c.ellipse(x, y, r + 8, r * 0.32, -0.35, 0, Math.PI * 2); c.stroke();
  } else if (B.stil === 'holo') {
    const sechs = rr => { c.beginPath(); for (let i = 0; i < 6; i++) { const w = i * Math.PI / 3 + Math.PI / 6; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(w) * rr, y + Math.sin(w) * rr); } c.closePath(); };
    sechs(r); c.fillStyle = hell > 0.3 ? '#ff9ad8' : '#1a0626'; c.fill();
    c.strokeStyle = B.glow; c.lineWidth = 3; c.stroke();
    sechs(r * 0.6); c.strokeStyle = B.ring; c.lineWidth = 2; c.stroke();
    c.save(); c.translate(x, y); c.rotate(zeit * 1.5);
    c.strokeStyle = 'rgba(46,249,255,0.6)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-r * 0.3, 0); c.lineTo(r * 0.3, 0); c.moveTo(0, -r * 0.3); c.lineTo(0, r * 0.3); c.stroke();
    c.restore();
  } else if (B.stil === 'stein') {
    g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r);
    g.addColorStop(0, B.kappe[0]); g.addColorStop(0.6, B.kappe[1]); g.addColorStop(1, B.kappe[2]);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = hell > 0.2 ? '#fff6c0' : B.ring; c.lineWidth = 3;
    c.beginPath(); c.arc(x, y, r - 2, 0, Math.PI * 2); c.stroke();
    // Auge als Glyphe
    c.fillStyle = hell > 0.2 ? '#fff6c0' : B.ring;
    c.beginPath(); c.ellipse(x, y, r * 0.5, r * 0.26, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2a1e10'; c.beginPath(); c.arc(x, y, r * 0.17, 0, Math.PI * 2); c.fill();
  } else if (B.stil === 'qualle') {
    g = c.createRadialGradient(x, y - r * 0.3, 2, x, y, r);
    g.addColorStop(0, hell > 0.3 ? '#ffffff' : 'rgba(230,255,255,0.95)'); g.addColorStop(0.6, 'rgba(127,240,255,0.75)'); g.addColorStop(1, 'rgba(26,106,138,0.85)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2;
    c.beginPath(); c.arc(x, y, r - 1, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = 'rgba(255,143,200,0.8)'; c.lineWidth = 1.5;
    for (let k = -2; k <= 2; k++) {
      c.beginPath(); c.moveTo(x + k * r * 0.22, y - r * 0.1);
      c.quadraticCurveTo(x + k * r * 0.22 + Math.sin(zeit * 3 + k) * 4, y + r * 0.35, x + k * r * 0.18, y + r * 0.7); c.stroke();
    }
  } else if (B.stil === 'magma') {
    c.fillStyle = '#2a1a14';
    c.beginPath();
    for (let k = 0; k < 9; k++) { const w = k / 9 * Math.PI * 2; const rr = r * (0.88 + ((k * 37) % 10) / 80); c[k ? 'lineTo' : 'moveTo'](x + Math.cos(w) * rr, y + Math.sin(w) * rr); }
    c.closePath(); c.fill();
    c.strokeStyle = hell > 0.2 ? '#fff2a0' : B.ring; c.lineWidth = 2.5; c.stroke();
    g = c.createRadialGradient(x, y, 1, x, y, r * 0.6);
    g.addColorStop(0, hell > 0.3 ? '#ffffff' : B.kappe[0]); g.addColorStop(0.6, B.kappe[1]); g.addColorStop(1, 'rgba(58,12,4,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 0.6, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,150,40,0.8)'; c.lineWidth = 1.5;
    for (let k = 0; k < 4; k++) { const w = k * 1.7 + 0.4; c.beginPath(); c.moveTo(x + Math.cos(w) * r * 0.4, y + Math.sin(w) * r * 0.4); c.lineTo(x + Math.cos(w + 0.3) * r * 0.85, y + Math.sin(w + 0.3) * r * 0.85); c.stroke(); }
  } else {
    // Klassik: Metallring mit Leuchtkappe
    g = c.createRadialGradient(x - 8, y - 8, 2, x, y, r);
    g.addColorStop(0, '#f2f5ff'); g.addColorStop(0.6, '#6f7a98'); g.addColorStop(1, '#232840');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    g = c.createRadialGradient(x - 4, y - 5, 1, x, y, r * 0.72);
    g.addColorStop(0, hell > 0.3 ? '#ffffff' : B.kappe[0]);
    g.addColorStop(0.5, hell > 0.3 ? '#d2b4ff' : B.kappe[1]);
    g.addColorStop(1, B.kappe[2]);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 0.72 * (1 - hell * 0.08), 0, Math.PI * 2); c.fill();
    c.strokeStyle = hell > 0.2 ? '#ffffff' : B.ring; c.lineWidth = 2;
    c.beginPath(); c.arc(x, y, r - 1, 0, Math.PI * 2); c.stroke();
  }
}

// --------------------------- Alle Teile auf dem Tisch ---------------------------
// live = false für Vorschaubilder: dann ohne Lichter, die vom Spielstand abhängen

function zeichneTeile(c, zeit, T, th, live) {
  const F = th.f;
  const puls = 0.5 + 0.5 * Math.sin(zeit * 6);
  c.globalCompositeOperation = 'lighter';

  if (live) {
    // Pfeile vor den Schüssen: leuchten, wenn der Schuss gerade zählt
    const ziel = zielArt();
    const pfeil = (x, y, w, farbe, an) => {
      c.save(); c.translate(x, y); c.rotate(w);
      c.beginPath(); c.moveTo(0, -11); c.lineTo(9, 7); c.lineTo(0, 2); c.lineTo(-9, 7); c.closePath();
      c.fillStyle = an ? farbe : 'rgba(150,150,180,0.2)';
      c.globalAlpha = an ? 0.55 + 0.45 * puls : 1;
      c.fill();
      c.globalAlpha = 1;
      c.restore();
      if (an) leuchte(c, x, y, 26, farbe, 0.45 * puls);
    };
    const jackpotAn = s.multiball;
    for (const ra of T.rampen) {
      const an = jackpotAn || ziel === 'rampe' || ziel === 'rampe-' + ra.name || ra.blitz > 0 || (ra.loch && ziel === ra.loch.name);
      pfeil(ra.name === 'links' ? 114 : spiegel(114), 548, ra.name === 'links' ? -0.25 : 0.25, jackpotAn ? F.gold : th.rampen[ra.nr].voll, an);
    }
    pfeil(43, 590, -0.15, F.haupt, ziel === 'orbit' || ziel === 'spin' || ziel === 'orbit-links');
    pfeil(spiegel(43), 590, 0.15, F.haupt, ziel === 'orbit' || ziel === 'orbit-rechts');
    pfeil(MITTE, 548, 0, F.gruen, ziel === 'wurmloch' || ziel === 'fallbank' || (T.fallziele.length > 0 && T.fallziele.every(z => z.unten)));
    pfeil(T.reaktor.x + 12, 476, 0.25, F.pink, s.lockBereit || ziel === 'multiball' || ziel === 'reaktor');
    pfeil(T.kapsel.x - 12, 476, -0.25, F.gold, true);

    // Lock-Lichter und Bonus-Leiter
    for (let i = 0; i < 2; i++) {
      const an = i < s.gesperrt;
      c.fillStyle = an ? F.pink : 'rgba(255,255,255,0.12)';
      c.beginPath(); c.arc(T.reaktor.x - 8 + i * 16, T.reaktor.y + 30, 4, 0, Math.PI * 2); c.fill();
      if (an) leuchte(c, T.reaktor.x - 8 + i * 16, T.reaktor.y + 30, 14, F.pink, 0.7);
    }
    for (let i = 1; i <= 6; i++) {
      const an = s.multi >= i;
      const x = MITTE - 50 + (i - 1) * 20, y = 690;
      c.fillStyle = an ? F.haupt : 'rgba(255,255,255,0.12)';
      c.font = '7px ' + SCHRIFT; c.textAlign = 'center';
      c.fillText(i + 'X', x, y);
      if (an) leuchte(c, x, y - 3, 14, F.haupt, 0.35);
    }
    // Kickback-Lichter in den Außenbahnen
    for (const kb of T.kickback) {
      c.fillStyle = kb.an ? F.gruen : 'rgba(255,255,255,0.12)';
      c.beginPath(); c.moveTo(kb.x, kb.y - 12); c.lineTo(kb.x + 7, kb.y); c.lineTo(kb.x - 7, kb.y); c.closePath(); c.fill();
      if (kb.an || kb.blitz) leuchte(c, kb.x, kb.y - 4, 22, F.gruen, (kb.an ? 0.3 + 0.3 * puls : 0) + kb.blitz);
    }
  }

  // Rollbahnen O R B
  T.roll.forEach((r, i) => {
    const skill = live && s.skill === i && kugelImKolben();
    const an = r.an || skill && puls > 0.5;
    const farbe = skill ? F.gold : F.haupt;
    c.fillStyle = an ? farbe : 'rgba(255,255,255,0.16)';
    c.font = '11px ' + SCHRIFT; c.textAlign = 'center';
    c.fillText(r.buchst, r.x, r.y + 5);
    if (an || r.blitz) leuchte(c, r.x, r.y, 26, farbe, (an ? 0.6 : 0) + r.blitz);
  });

  // Löcher
  const lochFarbe = { kapsel: F.gold, wurmloch: F.gruen, reaktor: F.pink };
  for (const l of T.loecher) {
    const f = lochFarbe[l.name];
    const offen = !live || l.name !== 'reaktor' || s.lockBereit || s.multiball;
    c.save(); c.translate(l.x, l.y); c.rotate(l.dreh);
    c.strokeStyle = f;
    c.globalAlpha = offen ? 0.8 : 0.3;
    c.lineWidth = 2;
    for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(0, 0, l.r + 2, i * Math.PI / 3, i * Math.PI / 3 + 0.6); c.stroke(); }
    c.restore();
    c.globalAlpha = 1;
    leuchte(c, l.x, l.y, 34, f, (offen ? 0.25 + 0.2 * puls : 0.08) + l.blitz);
    c.fillStyle = f; c.font = '6px ' + SCHRIFT; c.textAlign = 'center';
    c.globalAlpha = 0.85;
    c.fillText(l.name.toUpperCase(), l.x, l.y - l.r - 9);
    c.globalAlpha = 1;
  }

  // Bumper und Pfosten
  for (const bu of T.bumper) leuchte(c, bu.x, bu.y, 70, th.bumper.glow, 0.25 + bu.blitz * 0.9);
  for (const p of T.pfosten) if (p.blitz > 0) leuchte(c, p.x, p.y, 34, F.zweit, p.blitz);
  c.globalCompositeOperation = 'source-over';
  for (const bu of T.bumper) malBumper(c, bu, th, zeit);
  for (const p of T.pfosten) {
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.beginPath(); c.arc(p.x + 2, p.y + 3, p.r + 1, 0, Math.PI * 2); c.fill();
    c.fillStyle = th.gummi[1]; c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI * 2); c.fill();
    c.fillStyle = p.blitz > 0.2 ? '#ffffff' : F.zweit; c.beginPath(); c.arc(p.x, p.y, p.r * 0.55, 0, Math.PI * 2); c.fill();
  }

  // Fallziele
  for (const z of T.fallziele) {
    if (z.unten) { c.fillStyle = '#05050c'; c.fillRect(z.x - 14, z.y - 2, 28, 4); continue; }
    c.fillStyle = '#fff8d0';
    c.fillRect(z.x - 14, z.y - 4, 28, 8);
    c.fillStyle = F.gold;
    c.fillRect(z.x - 13, z.y - 1, 26, 5);
  }
  // Stehziele
  for (const z of T.stehziele) {
    c.lineCap = 'round';
    c.strokeStyle = z.an ? '#ffffff' : 'rgba(255,255,255,0.35)';
    c.lineWidth = 8;
    c.beginPath(); c.moveTo(z.ax, z.ay); c.lineTo(z.bx, z.by); c.stroke();
    c.strokeStyle = F.pink; c.lineWidth = 3;
    c.beginPath(); c.moveTo(z.ax, z.ay); c.lineTo(z.bx, z.by); c.stroke();
  }
  // Schleudern blitzen
  c.globalCompositeOperation = 'lighter';
  for (const sl of T.schleudern) {
    if (sl.blitz <= 0) continue;
    c.globalAlpha = sl.blitz;
    c.strokeStyle = F.haupt;
    c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(...sl.A); c.lineTo(...sl.C); c.stroke();
    c.globalAlpha = 1;
    leuchte(c, (sl.A[0] + sl.C[0]) / 2, (sl.A[1] + sl.C[1]) / 2, 60, F.haupt, sl.blitz * 0.8);
  }
  for (const z of [...T.fallziele, ...T.stehziele]) if (z.blitz > 0 || z.an) leuchte(c, z.x, z.y, 30, z.an ? F.pink : F.gold, z.blitz + (z.an ? 0.4 : 0));
  for (const z of T.fallziele) if (!z.unten) leuchte(c, z.x, z.y, 20, F.gold, 0.3);
  c.globalCompositeOperation = 'source-over';

  // Spinner: dreht sich um die waagerechte Achse
  const sp = T.spinner;
  const tiefe = Math.abs(Math.cos(sp.w)) * 9 + 1;
  c.fillStyle = Math.cos(sp.w) > 0 ? th.schiene.kante : th.schiene.hell;
  c.fillRect(24, sp.y - tiefe / 2, 38, tiefe);
  c.strokeStyle = F.haupt; c.lineWidth = 1;
  c.strokeRect(24, sp.y - tiefe / 2, 38, tiefe);
  c.fillStyle = th.schiene.kante; c.fillRect(22, sp.y - 1, 42, 2);
  if (sp.tempo > 2) { c.globalCompositeOperation = 'lighter'; leuchte(c, 43, sp.y, 40, F.haupt, Math.min(0.8, sp.tempo / 40)); c.globalCompositeOperation = 'source-over'; }

  // Kolben
  const kol = T.kolben;
  const ky = kol.ay - (kol.zugAnim || 0) * 20;
  const g = c.createLinearGradient(SCHUSS.innen, 0, SCHUSS.aussen, 0);
  g.addColorStop(0, th.schiene.dunkel); g.addColorStop(0.5, th.schiene.kante); g.addColorStop(1, th.schiene.dunkel);
  c.fillStyle = g;
  c.fillRect(SCHUSS.innen + 4, ky - 3, SCHUSS.aussen - SCHUSS.innen - 8, 7);
  c.fillStyle = th.schiene.hell;
  c.fillRect(SCHUSS.x - 3, ky + 4, 6, 60);
  if (live && s.kolbenZug > 0) {
    c.globalCompositeOperation = 'lighter';
    leuchte(c, SCHUSS.x, ky, 30 + s.kolbenZug * 30, F.gold, s.kolbenZug);
    c.globalCompositeOperation = 'source-over';
  }

  for (const f of T.flipper) zeichneFlipper(c, f, th);
}

// --------------------------- Vorschaubilder für die Auswahl ---------------------------

const vorschauCache = new Map();
function vorschau(levelIndex, breite) {
  const schluessel = levelIndex + ':' + breite;
  if (vorschauCache.has(schluessel)) return vorschauCache.get(schluessel);
  const lv = levelIndex < 0 ? null : LEVEL[levelIndex];
  const th = THEMEN[lv ? lv.welt : 'klassik'];
  const T = baueTisch(lv ? lv.tisch : KLASSIK_PLAN);
  const kp = breite / TB;
  const grund = malUnten(T, th, kp, 0);
  const deckel = malRampen(T, th, kp, 0);
  const c = grund.getContext('2d');
  c.setTransform(kp, 0, 0, kp, 0, 0);
  th.ambient(c, 1.3);
  zeichneTeile(c, 0, T, th, false);
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.drawImage(deckel, 0, 0);
  // nur der Tisch, ohne den leeren unteren Rand
  const bild = document.createElement('canvas');
  bild.width = grund.width; bild.height = Math.round(grund.height * 0.97);
  bild.getContext('2d').drawImage(grund, 0, 0);
  vorschauCache.set(schluessel, bild);
  return bild;
}

// --------------------------- Ein ganzes Bild ---------------------------

function malTeilchen(c, t) {
  const a = 1 - t.zeit / t.leben;
  c.globalAlpha = a;
  c.fillStyle = t.farbe; c.strokeStyle = t.farbe;
  const g = t.groesse;
  if (t.form === 'stern') {
    c.fillRect(t.x - g * 1.5, t.y - 0.6, g * 3, 1.2); c.fillRect(t.x - 0.6, t.y - g * 1.5, 1.2, g * 3);
  } else if (t.form === 'blase') {
    c.lineWidth = 1; c.beginPath(); c.arc(t.x, t.y, g * 1.2, 0, Math.PI * 2); c.stroke();
  } else if (t.form === 'blatt') {
    c.save(); c.translate(t.x, t.y); c.rotate(t.dreh);
    c.beginPath(); c.ellipse(0, 0, g * 1.6, g * 0.7, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  } else if (t.form === 'glut') {
    c.beginPath(); c.arc(t.x, t.y, g * 0.8, 0, Math.PI * 2); c.fill();
  } else {
    c.fillRect(t.x - g / 2, t.y - g / 2, g, g);
  }
}

function zeichne(zeit) {
  const { k, ox, oy, dpr } = ansicht;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#04040d';
  ctx.fillRect(0, 0, leinwand.width, leinwand.height);
  if (!s || !unten) return;
  const th = s.thema;
  let wx = 0, wy = 0;
  if (s.wackeln > 0) { wx = (Math.random() - 0.5) * s.wackeln * 14; wy = (Math.random() - 0.5) * s.wackeln * 14; }
  ctx.setTransform(1, 0, 0, 1, Math.round((ox + wx * k) * dpr), Math.round((oy + wy * k) * dpr));
  ctx.drawImage(unten, 0, 0);
  ctx.setTransform(k * dpr, 0, 0, k * dpr, (ox + wx * k) * dpr, (oy + wy * k + HUDH * k) * dpr);
  const c = ctx;

  th.ambient(c, zeit);
  zeichneTeile(c, zeit, s.T, th, true);

  const baelle = s.welt.baelle;
  // Kugeln im Tunnel: schwach unter dem Tisch
  c.globalCompositeOperation = 'lighter';
  for (const b of baelle) if (b.ort === 'tunnel') leuchte(c, b.x, b.y, 26, th.f.gruen, 0.9);
  // Licht der Kugeln auf dem Tisch
  for (const b of baelle) if (b.ort === 'tisch') leuchte(c, b.x, b.y, 34, th.ball.licht, 0.35);
  // Leuchtspur
  for (const b of baelle) {
    if (b.ort !== 'tisch' && b.ort !== 'rampe') { b.spur.length = 0; continue; }
    b.spur.push([b.x, b.y]);
    if (b.spur.length > 9) b.spur.shift();
    const v = Math.hypot(b.vx || 0, b.vy || 0);
    if (b.ort === 'tisch' && v < 500) continue;
    for (let i = 0; i < b.spur.length - 1; i++) {
      const a = (i + 1) / b.spur.length;
      c.strokeStyle = `rgba(${th.ball.spur},${a * 0.35})`;
      c.lineWidth = PH.ballR * 1.6 * a;
      c.lineCap = 'round';
      c.beginPath(); c.moveTo(b.spur[i][0], b.spur[i][1]); c.lineTo(b.spur[i + 1][0], b.spur[i + 1][1]); c.stroke();
    }
  }
  c.globalCompositeOperation = 'source-over';
  for (const b of baelle) {
    if (b.ort !== 'tisch') continue;
    c.fillStyle = 'rgba(0,0,0,0.45)';
    c.beginPath(); c.ellipse(b.x + 3, b.y + 4, PH.ballR, PH.ballR * 0.9, 0, 0, Math.PI * 2); c.fill();
    zeichneKugel(c, b);
  }
  // Kugeln in Löchern: kurz sichtbar beim Versinken
  for (const b of baelle) if (b.ort === 'loch') { c.globalAlpha = 0.35; zeichneKugel(c, b, 0.7); c.globalAlpha = 1; }

  // Rampen über allem
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, Math.round((ox + wx * k) * dpr), Math.round((oy + wy * k) * dpr));
  ctx.drawImage(oben, 0, 0);
  ctx.restore();
  c.globalCompositeOperation = 'lighter';
  for (const ra of s.T.rampen) {
    if (ra.blitz <= 0) continue;
    pfad(c, ra.bahn.p);
    c.strokeStyle = th.rampen[ra.nr].voll;
    c.globalAlpha = ra.blitz * 0.5;
    c.lineWidth = 30; c.lineCap = 'round'; c.lineJoin = 'round';
    c.stroke();
    c.globalAlpha = 1;
  }
  c.globalCompositeOperation = 'source-over';
  for (const b of baelle) {
    if (b.ort !== 'rampe') continue;
    const g = 1 + b.hoehe * 0.28;
    c.fillStyle = 'rgba(0,0,0,0.4)';
    c.beginPath(); c.ellipse(b.x + 4 + b.hoehe * 8, b.y + 6 + b.hoehe * 10, PH.ballR, PH.ballR * 0.85, 0, 0, Math.PI * 2); c.fill();
    zeichneKugel(c, b, g);
  }

  // Funken, Wellen, Punkte
  c.globalCompositeOperation = 'lighter';
  for (const w of s.wellen) {
    const a = 1 - w.zeit / 0.45;
    c.strokeStyle = w.farbe; c.globalAlpha = a; c.lineWidth = 3 * a;
    c.beginPath(); c.arc(w.x, w.y, w.r * (0.4 + w.zeit / 0.45), 0, Math.PI * 2); c.stroke();
  }
  c.globalAlpha = 1;
  for (const t of s.teilchen) malTeilchen(c, t);
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-over';
  c.textAlign = 'center';
  c.font = '9px ' + SCHRIFT;
  for (const t of s.schrift) {
    c.globalAlpha = Math.min(1, 2 * (1 - t.zeit / t.dauer));
    c.fillStyle = '#000';
    c.fillText(t.text, t.x + 1, t.y + 1);
    c.fillStyle = t.farbe;
    c.fillText(t.text, t.x, t.y);
  }
  c.globalAlpha = 1;

  zeichneMeldung(c, zeit);
  zeichneHud(zeit);
}

function zeichneMeldung(c, zeit) {
  const m = s.meldung, F = s.thema.f;
  if (s.bonusAnzeige) {
    const b = s.bonusAnzeige;
    kasten(c, MITTE, 600, 330, 110, F.haupt);
    c.textAlign = 'center';
    c.fillStyle = F.haupt; c.font = '14px ' + SCHRIFT;
    c.fillText('BONUS', MITTE, 580);
    c.fillStyle = '#fff'; c.font = '11px ' + SCHRIFT;
    const zaehl = Math.min(1, b.zeit / 1.2);
    c.fillText(zahl(b.bonus * zaehl) + ' X ' + b.multi, MITTE, 606);
    c.fillStyle = F.gold;
    if (b.zeit > 1.2) c.fillText('= ' + zahl(b.bonus * b.multi), MITTE, 630);
    return;
  }
  if (!m) return;
  const ein = Math.min(1, m.zeit * 6), aus = Math.min(1, (m.dauer - m.zeit) * 5);
  c.globalAlpha = Math.max(0, Math.min(ein, aus));
  const y = 610;
  kasten(c, MITTE, y, 380, m.text ? 74 : 50, m.farbe);
  c.textAlign = 'center';
  c.font = '15px ' + SCHRIFT;
  c.fillStyle = m.farbe;
  c.fillText(m.titel, MITTE, y + (m.text ? -6 : 7), 360);
  if (m.text) {
    c.font = '600 14px ' + "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    c.fillStyle = '#eef2ff';
    c.fillText(m.text, MITTE, y + 20, 360);
  }
  c.globalAlpha = 1;
}

function kasten(c, x, y, b, h, farbe) {
  const alpha = c.globalAlpha;
  c.fillStyle = 'rgba(6, 6, 22, 0.85)';
  rund(c, x - b / 2, y - h / 2, b, h, 12);
  c.fill();
  c.strokeStyle = farbe; c.lineWidth = 2;
  c.stroke();
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = alpha * 0.3; c.lineWidth = 7;
  c.stroke();
  c.globalAlpha = alpha;
  c.globalCompositeOperation = 'source-over';
}
function rund(c, x, y, b, h, r) {
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + b, y, x + b, y + h, r); c.arcTo(x + b, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + b, y, r); c.closePath();
}

// --------------------------- Anzeige oben ---------------------------

const KOERPER = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
function zeichneHud(zeit) {
  const { k, ox, oy, dpr } = ansicht;
  const c = ctx, F = s.thema.f;
  c.setTransform(k * dpr, 0, 0, k * dpr, ox * dpr, oy * dpr);
  c.textAlign = 'left';
  c.font = '22px ' + SCHRIFT;
  c.fillStyle = F.haupt;
  c.fillText(zahl(s.punkte), 16, 40);
  c.font = '8px ' + SCHRIFT;
  c.fillStyle = '#c4c2dc';
  const multi = s.multi > 1 ? '  BONUS ' + s.multi + 'X' : '';
  if (s.modus === 'level') {
    c.fillText('KUGEL ' + s.ballNr + '/' + BAELLE + multi + '  ' + s.level.name.toUpperCase(), 16, 62, 340);
  } else {
    const extra = s.extraBaelle ? '  +' + s.extraBaelle : '';
    c.fillText('KUGEL ' + s.ballNr + '/' + BAELLE + extra + multi + '  ' + RAENGE[s.rang], 16, 62);
  }

  // Aufgabe oder Auftrag mit Fortschritt
  let titel, text, anteil, rest = 0;
  if (s.modus === 'level') {
    const a = aufgabeJetzt();
    titel = a ? 'AUFGABE ' + (s.schritt + 1) + '/' + s.level.aufgaben.length : 'GESCHAFFT';
    text = a ? aufgabeText(a) : 'Level geschafft!';
    anteil = a ? Math.min(1, s.schrittStand / aufgabeZiel(a)) : 1;
    if (a && a.zeit) rest = Math.max(0, s.schrittZeit);
    if (a && a.art === 'folge') text = a.folge.map((n, i) => (i < s.schrittStand ? '✓ ' : '') + SCHUSS_NAMEN[n]).join(' → ');
  } else {
    titel = 'AUFTRAG';
    text = auftragText();
    anteil = Math.min(1, s.stand / auftragZiel());
  }
  c.fillStyle = F.gold;
  c.font = '8px ' + SCHRIFT;
  c.fillText(titel, 16, 86);
  c.font = '600 13px ' + KOERPER;
  c.fillStyle = '#eef2ff';
  const tx = 16 + c.measureText(titel).width * 0 + (s.modus === 'level' ? 112 : 90);
  // Platz bis x = 322, rechts davon stehen die Kästchen der Spezialfähigkeiten
  c.fillText(text, tx, 87, 322 - tx + (rest ? -40 : 0));
  if (rest) {
    c.textAlign = 'right';
    c.font = '9px ' + SCHRIFT;
    c.fillStyle = rest < 10 && Math.sin(zeit * 12) > 0 ? F.pink : F.gold;
    c.fillText(Math.ceil(rest) + 's', 322, 87);
    c.textAlign = 'left';
  }
  c.fillStyle = 'rgba(255,255,255,0.12)';
  c.fillRect(16, 96, 306, 5);
  c.fillStyle = F.gold;
  c.fillRect(16, 96, 306 * anteil, 5);

  // Spezialfähigkeiten mit Restzeit
  const aktiv = [];
  if (s.schutz > 0 || s.effekt.schild > 0) aktiv.push(['SCHILD', Math.max(s.schutz, s.effekt.schild), F.gruen]);
  if (s.effekt.doppelt > 0) aktiv.push(['2X', s.effekt.doppelt, F.gold]);
  if (s.effekt.zeitlupe > 0) aktiv.push(['ZEIT', s.effekt.zeitlupe, F.pink]);
  if (s.multiball) aktiv.push(['MULTI', 0, F.pink]);
  if (s.kombo >= 2 && s.welt.zeit - s.letzterSchuss < 5) aktiv.push(['KOMBO ' + s.kombo, 5 - (s.welt.zeit - s.letzterSchuss), F.gold]);
  c.font = '7px ' + SCHRIFT;
  c.textAlign = 'center';
  aktiv.slice(0, 3).forEach(([name, rest, f], i) => {
    const y = 76, xx = 360 + i * 58;
    if (xx > 520) return;
    const blink = rest > 0 && rest < 3 && Math.sin(zeit * 20) > 0;
    c.globalAlpha = blink ? 0.4 : 1;
    c.strokeStyle = f; c.lineWidth = 1.5;
    rund(c, xx - 26, y, 52, 26, 6); c.stroke();
    c.fillStyle = f;
    c.fillText(name, xx, y + 11);
    if (rest > 0) c.fillText(Math.ceil(rest) + 's', xx, y + 22);
    c.globalAlpha = 1;
  });
}
