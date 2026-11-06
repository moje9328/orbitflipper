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

function neueLeinwand() {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(VB * ansicht.k * ansicht.dpr));
  c.height = Math.max(1, Math.round(VH * ansicht.k * ansicht.dpr));
  const g = c.getContext('2d');
  g.setTransform(ansicht.k * ansicht.dpr, 0, 0, ansicht.k * ansicht.dpr, 0, 0);
  return [c, g];
}

function baueBilder() {
  [unten] = malUnten();
  [oben] = malRampen();
  ballBild = malBall();
}

function pfad(c, p) {
  c.beginPath();
  c.moveTo(p[0][0], p[0][1]);
  for (let i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]);
}

// --------------------------- Hintergrund und Wände ---------------------------

function malUnten() {
  const [cv, c] = neueLeinwand();
  // Anzeige-Hintergrund
  c.fillStyle = '#04040d';
  c.fillRect(0, 0, VB, VH);
  c.translate(0, HUDH);

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
  v.addColorStop(0, '#0b0b2e');
  v.addColorStop(0.5, '#090620');
  v.addColorStop(1, '#05040f');
  c.fillStyle = v;
  c.fillRect(0, 0, TB, TH + 20);

  // Sechseck-Raster
  c.strokeStyle = 'rgba(80, 120, 255, 0.07)';
  c.lineWidth = 1;
  const r = 18, hx = r * Math.sqrt(3);
  for (let y = 60, z = 0; y < TH + 40; y += r * 1.5, z++) {
    for (let x = (z % 2) * hx / 2 - hx; x < TB + hx; x += hx) {
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const w = Math.PI / 3 * i + Math.PI / 6;
        c[i ? 'lineTo' : 'moveTo'](x + r * Math.cos(w), y + r * Math.sin(w));
      }
      c.closePath();
      c.stroke();
    }
  }

  // Große Orbit-Ringe als Tisch-Kunst
  c.globalCompositeOperation = 'lighter';
  for (const [rr, a, f] of [[150, 0.08, '#6a4dff'], [205, 0.06, '#38f3ff'], [95, 0.07, '#ff4fd8']]) {
    c.strokeStyle = f; c.globalAlpha = a; c.lineWidth = 2;
    c.beginPath(); c.ellipse(MITTE, 420, rr, rr * 0.62, -0.25, 0, Math.PI * 2); c.stroke();
  }
  c.globalAlpha = 1;
  leuchte(c, MITTE, 420, 260, '#3b1d9a', 0.35);
  leuchte(c, MITTE, 800, 220, '#0c3a7a', 0.35);
  // Leiterbahnen
  c.strokeStyle = 'rgba(56, 243, 255, 0.10)';
  c.lineWidth = 1.5;
  for (const p of [[[120, 560], [180, 600], [180, 660]], [[384, 560], [324, 600], [324, 660]], [[252, 540], [252, 600]], [[200, 600], [304, 600]]]) { pfad(c, p); c.stroke(); }
  c.globalCompositeOperation = 'source-over';

  // Schriftzug unten in der Mitte
  c.fillStyle = 'rgba(56, 243, 255, 0.10)';
  c.font = '12px ' + SCHRIFT;
  c.textAlign = 'center';
  c.fillText('ORBIT', MITTE, 640);
  c.restore();

  // Rand-Leuchten um den Tisch
  c.save();
  c.shadowColor = '#5b3dff';
  c.shadowBlur = 24;
  c.strokeStyle = 'rgba(120, 90, 255, 0.5)';
  c.lineWidth = 3;
  flaeche();
  c.stroke();
  c.restore();

  // Schatten der Rampen auf dem Tisch
  for (const ra of s.T.rampen) {
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
    c.moveTo(X(20), 1000); c.lineTo(X(20), 905); c.lineTo(X(58), 905); c.lineTo(X(58), 775); c.lineTo(X(146), 826); c.lineTo(X(146), 1000);
    c.closePath();
    const m = c.createLinearGradient(X(20), 820, X(146), 960);
    m.addColorStop(0, '#20263e'); m.addColorStop(1, '#0d1020');
    c.fillStyle = m;
    c.fill();
    c.strokeStyle = 'rgba(160, 180, 230, 0.35)';
    c.lineWidth = 1.5;
    c.stroke();
  }

  // Wände
  for (const w of s.T.waende) malWand(c, w);

  // Abschussbahn-Rillen
  c.strokeStyle = 'rgba(255,255,255,0.05)';
  for (let y = 360; y < 880; y += 22) { c.beginPath(); c.moveTo(SCHUSS.innen + 6, y); c.lineTo(SCHUSS.aussen - 6, y); c.stroke(); }

  // Schleudern
  for (const sl of s.T.schleudern) {
    c.beginPath();
    c.moveTo(...sl.A); c.lineTo(...sl.B); c.lineTo(...sl.C); c.closePath();
    const m = c.createLinearGradient(sl.A[0], sl.A[1], sl.C[0], sl.C[1]);
    m.addColorStop(0, '#2c3456'); m.addColorStop(1, '#141830');
    c.fillStyle = m;
    c.fill();
    c.lineJoin = 'round';
    c.strokeStyle = '#d9e2ff';
    c.lineWidth = 8;
    c.stroke();
    c.strokeStyle = '#3d4666';
    c.lineWidth = 4;
    c.stroke();
  }

  // Blech hinter den Fallzielen
  pfad(c, s.T.dach);
  c.strokeStyle = '#5a6488'; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke();

  // Löcher: dunkler Schacht
  for (const l of s.T.loecher) {
    const g = c.createRadialGradient(l.x, l.y, 2, l.x, l.y, l.r + 4);
    g.addColorStop(0, '#000');
    g.addColorStop(0.7, '#05050c');
    g.addColorStop(1, '#2a3050');
    c.fillStyle = g;
    c.beginPath(); c.arc(l.x, l.y, l.r + 4, 0, Math.PI * 2); c.fill();
  }

  // Tunnel unter dem Tisch: gestrichelte Leuchtspur
  c.save();
  c.setLineDash([4, 7]);
  c.strokeStyle = 'rgba(77, 255, 154, 0.25)';
  c.lineWidth = 3;
  pfad(c, s.T.tunnel.p);
  c.stroke();
  c.restore();

  // Spinner-Halter
  c.fillStyle = '#9aa6c8';
  for (const x of [22, 64]) { c.beginPath(); c.arc(x, s.T.spinner.y, 3.5, 0, Math.PI * 2); c.fill(); }
  return [cv, c];
}

function malWand(c, w) {
  c.save();
  c.lineCap = 'round'; c.lineJoin = 'round';
  pfad(c, w.p);
  if (w.art === 'gummi') {
    c.strokeStyle = 'rgba(255, 79, 216, 0.25)'; c.lineWidth = w.r * 2 + 8; c.stroke();
    c.strokeStyle = '#f2e8ff'; c.lineWidth = w.r * 2; c.stroke();
  } else if (w.art === 'lippe') {
    c.strokeStyle = '#c9d2ee'; c.lineWidth = w.r * 2; c.stroke();
  } else if (w.art === 'stift') {
    c.strokeStyle = 'rgba(56, 243, 255, 0.25)'; c.lineWidth = w.r * 2 + 7; c.stroke();
    c.strokeStyle = '#e6f6ff'; c.lineWidth = w.r * 2; c.stroke();
  } else {
    // Metallschiene mit Neonkante
    c.strokeStyle = 'rgba(56, 243, 255, 0.18)'; c.lineWidth = w.r * 2 + 9; c.stroke();
    c.strokeStyle = '#2b3150'; c.lineWidth = w.r * 2 + 2; c.stroke();
    c.strokeStyle = '#a9b6d8'; c.lineWidth = w.r * 2 - 2; c.stroke();
    c.strokeStyle = '#eaf2ff'; c.lineWidth = 1; c.stroke();
  }
  c.restore();
}

// --------------------------- Rampen (oberste Ebene) ---------------------------

function malRampen() {
  const [cv, c] = neueLeinwand();
  c.translate(0, HUDH);
  c.lineCap = 'round'; c.lineJoin = 'round';
  // die rechte (violette) liegt tiefer und wird zuerst gemalt
  for (const ra of [...s.T.rampen].reverse()) {
    const [rgb, voll] = RAMPENFARBE[ra.farbe];
    const p = ra.bahn.p;
    // durchsichtige Fahrbahn
    pfad(c, p);
    c.strokeStyle = 'rgba(8, 10, 30, 0.55)'; c.lineWidth = 34; c.stroke();
    c.strokeStyle = `rgba(${rgb}, 0.13)`; c.lineWidth = 34; c.stroke();
    // Querstreben
    c.strokeStyle = `rgba(${rgb}, 0.22)`;
    c.lineWidth = 1.5;
    for (let sPos = 30; sPos < ra.bahn.L - 10; sPos += 26) {
      const [x, y, tx, ty] = ra.bahn.ort(sPos);
      c.beginPath(); c.moveTo(x - ty * 16, y + tx * 16); c.lineTo(x + ty * 16, y - tx * 16); c.stroke();
    }
    // zwei leuchtende Seitenschienen
    for (const seite of [-1, 1]) {
      const q = p.map((pt, i) => {
        const a = p[Math.max(0, i - 1)], b = p[Math.min(p.length - 1, i + 1)];
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        return [pt[0] - (b[1] - a[1]) / l * 16 * seite, pt[1] + (b[0] - a[0]) / l * 16 * seite];
      });
      pfad(c, q);
      c.strokeStyle = `rgba(${rgb}, 0.25)`; c.lineWidth = 8; c.stroke();
      c.strokeStyle = voll; c.lineWidth = 2.5; c.stroke();
      c.strokeStyle = '#ffffff'; c.lineWidth = 0.8; c.stroke();
    }
  }
  return [cv, c];
}

// --------------------------- Kugel ---------------------------

function malBall() {
  const R = PH.ballR, gr = Math.ceil(R * 2 * ansicht.k * ansicht.dpr * 1.6) + 4;
  const c = document.createElement('canvas');
  c.width = c.height = gr;
  const g = c.getContext('2d');
  const m = gr / 2, r = gr / 2 - 2;
  // Grundkörper: dunkler Stahl
  let v = g.createRadialGradient(m - r * 0.35, m - r * 0.4, r * 0.05, m, m, r);
  v.addColorStop(0, '#ffffff');
  v.addColorStop(0.18, '#dfe7f5');
  v.addColorStop(0.5, '#7d889f');
  v.addColorStop(0.85, '#2a3042');
  v.addColorStop(1, '#151a26');
  g.fillStyle = v;
  g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.fill();
  // Spiegelung des Tisches: cyan unten, violett seitlich
  g.save();
  g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.clip();
  v = g.createLinearGradient(0, m + r * 0.2, 0, m + r);
  v.addColorStop(0, 'rgba(56,243,255,0)');
  v.addColorStop(1, 'rgba(56,243,255,0.75)');
  g.fillStyle = v;
  g.fillRect(0, 0, gr, gr);
  v = g.createLinearGradient(m + r, 0, m + r * 0.3, 0);
  v.addColorStop(0, 'rgba(176,102,255,0.6)');
  v.addColorStop(1, 'rgba(176,102,255,0)');
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
  c.radius = r / (ansicht.k * ansicht.dpr); // Zeichengröße in Tisch-Einheiten passend zum Bild
  c.mitte = m;
  return c;
}

function zeichneKugel(c, b, groesse = 1) {
  const R = PH.ballR * groesse;
  c.drawImage(ballBild, b.x - R * (ballBild.width / 2) / (ballBild.width / 2 - 2), b.y - R * (ballBild.width / 2) / (ballBild.width / 2 - 2),
    R * 2 * (ballBild.width / 2) / (ballBild.width / 2 - 2), R * 2 * (ballBild.width / 2) / (ballBild.width / 2 - 2));
}

// --------------------------- Bewegliche Teile ---------------------------

function zeichneFlipper(c, f) {
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
  c.strokeStyle = `rgba(56,243,255,${0.18 * aktiv + 0.08})`;
  c.lineWidth = 9;
  c.stroke();
  c.globalCompositeOperation = 'source-over';
  form();
  const m = c.createLinearGradient(0, -f.r0, 0, f.r0);
  m.addColorStop(0, '#f4f8ff');
  m.addColorStop(0.35, '#a9b5cf');
  m.addColorStop(0.6, '#4a5470');
  m.addColorStop(1, '#1d2236');
  c.fillStyle = m;
  c.fill();
  c.strokeStyle = FARBE.cyan;
  c.lineWidth = 2;
  c.stroke();
  // Gummi-Leuchtstreifen
  c.strokeStyle = `rgba(185,251,255,${0.5 + aktiv * 0.5})`;
  c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(4, -f.r0 * 0.25); c.lineTo(L - 6, -f.r1 * 0.2); c.stroke();
  c.fillStyle = '#0b0e1c';
  c.beginPath(); c.arc(0, 0, 4.5, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#e8f0ff'; c.lineWidth = 1.5; c.stroke();
  c.restore();
}

function zeichneTeile(c, zeit) {
  const T = s.T;
  const puls = 0.5 + 0.5 * Math.sin(zeit * 6);
  c.globalCompositeOperation = 'lighter';

  // Pfeile vor den Schüssen
  const auftrag = auftragJetzt().art;
  const pfeil = (x, y, w, farbe, an) => {
    c.save(); c.translate(x, y); c.rotate(w);
    c.beginPath(); c.moveTo(0, -11); c.lineTo(9, 7); c.lineTo(0, 2); c.lineTo(-9, 7); c.closePath();
    c.fillStyle = an ? farbe : 'rgba(120,130,170,0.18)';
    c.globalAlpha = an ? 0.55 + 0.45 * puls : 1;
    c.fill();
    c.globalAlpha = 1;
    c.restore();
    if (an) leuchte(c, x, y, 26, farbe, 0.45 * puls);
  };
  const jackpotAn = s.multiball;
  pfeil(114, 548, -0.25, jackpotAn ? FARBE.gold : FARBE.cyan, jackpotAn || auftrag === 'rampe' || T.rampen[0].blitz > 0);
  pfeil(spiegel(114), 548, 0.25, jackpotAn ? FARBE.gold : FARBE.violett, jackpotAn || auftrag === 'rampe' || T.rampen[1].blitz > 0);
  pfeil(43, 590, -0.15, FARBE.cyan, auftrag === 'orbit' || auftrag === 'spin');
  pfeil(spiegel(43), 590, 0.15, FARBE.cyan, auftrag === 'orbit');
  pfeil(MITTE, 548, 0, FARBE.gruen, auftrag === 'wurmloch' || auftrag === 'fallbank' || T.fallziele.every(z => z.unten));
  pfeil(T.reaktor.x + 12, 476, 0.25, FARBE.pink, s.lockBereit || auftrag === 'multiball');
  pfeil(T.kapsel.x - 12, 476, -0.25, FARBE.gold, true);

  // Bonus-Leiter und Lock-Lichter
  for (let i = 0; i < 2; i++) {
    const an = i < s.gesperrt;
    c.fillStyle = an ? FARBE.pink : 'rgba(255,79,216,0.15)';
    c.beginPath(); c.arc(T.reaktor.x - 8 + i * 16, T.reaktor.y + 30, 4, 0, Math.PI * 2); c.fill();
    if (an) leuchte(c, T.reaktor.x - 8 + i * 16, T.reaktor.y + 30, 14, FARBE.pink, 0.7);
  }
  for (let i = 1; i <= 6; i++) {
    const an = s.multi >= i;
    const x = MITTE - 50 + (i - 1) * 20, y = 690;
    c.fillStyle = an ? FARBE.cyan : 'rgba(56,243,255,0.12)';
    c.font = '7px ' + SCHRIFT; c.textAlign = 'center';
    c.fillText(i + 'X', x, y);
    if (an) leuchte(c, x, y - 3, 14, FARBE.cyan, 0.35);
  }

  // Rollbahnen O R B
  T.roll.forEach((r, i) => {
    const skill = s.skill === i && kugelImKolben();
    const an = r.an || skill && puls > 0.5;
    const farbe = skill ? FARBE.gold : FARBE.cyan;
    c.fillStyle = an ? farbe : 'rgba(56,243,255,0.14)';
    c.font = '11px ' + SCHRIFT; c.textAlign = 'center';
    c.fillText(r.buchst, r.x, r.y + 5);
    if (an || r.blitz) leuchte(c, r.x, r.y, 26, farbe, (an ? 0.6 : 0) + r.blitz);
  });

  // Löcher
  const lochFarbe = { kapsel: FARBE.gold, wurmloch: FARBE.gruen, reaktor: FARBE.pink };
  for (const l of T.loecher) {
    const f = lochFarbe[l.name];
    const offen = l.name !== 'reaktor' || s.lockBereit || s.multiball;
    c.save(); c.translate(l.x, l.y); c.rotate(l.dreh);
    c.strokeStyle = f;
    c.globalAlpha = offen ? 0.8 : 0.3;
    c.lineWidth = 2;
    for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(0, 0, l.r + 2, i * Math.PI / 3, i * Math.PI / 3 + 0.6); c.stroke(); }
    c.restore();
    c.globalAlpha = 1;
    leuchte(c, l.x, l.y, 34, f, (offen ? 0.25 + 0.2 * puls : 0.08) + l.blitz);
    c.fillStyle = f; c.font = '6px ' + SCHRIFT; c.textAlign = 'center';
    c.globalAlpha = 0.8;
    c.fillText(l.name.toUpperCase(), l.x, l.y - l.r - 9);
    c.globalAlpha = 1;
  }

  // Bumper
  for (const bu of T.bumper) {
    leuchte(c, bu.x, bu.y, 70, '#7a4dff', 0.25 + bu.blitz * 0.9);
  }
  c.globalCompositeOperation = 'source-over';
  for (const bu of T.bumper) {
    c.fillStyle = '#0a0b18';
    c.beginPath(); c.arc(bu.x + 3, bu.y + 4, bu.r + 2, 0, Math.PI * 2); c.fill();
    // Metallring
    let g = c.createRadialGradient(bu.x - 8, bu.y - 8, 2, bu.x, bu.y, bu.r);
    g.addColorStop(0, '#f2f5ff'); g.addColorStop(0.6, '#6f7a98'); g.addColorStop(1, '#232840');
    c.fillStyle = g;
    c.beginPath(); c.arc(bu.x, bu.y, bu.r, 0, Math.PI * 2); c.fill();
    // Leuchtkappe
    const hell = bu.blitz;
    g = c.createRadialGradient(bu.x - 4, bu.y - 5, 1, bu.x, bu.y, bu.r * 0.72);
    g.addColorStop(0, hell > 0.3 ? '#ffffff' : '#e3d3ff');
    g.addColorStop(0.5, hell > 0.3 ? '#d2b4ff' : '#9a63ff');
    g.addColorStop(1, '#3b1a8a');
    c.fillStyle = g;
    c.beginPath(); c.arc(bu.x, bu.y, bu.r * 0.72 * (1 - hell * 0.08), 0, Math.PI * 2); c.fill();
    c.strokeStyle = hell > 0.2 ? '#ffffff' : FARBE.cyan;
    c.lineWidth = 2;
    c.beginPath(); c.arc(bu.x, bu.y, bu.r - 1, 0, Math.PI * 2); c.stroke();
  }

  // Fallziele
  for (const z of T.fallziele) {
    if (z.unten) {
      c.fillStyle = '#05050c';
      c.fillRect(z.x - 14, z.y - 2, 28, 4);
      continue;
    }
    c.fillStyle = '#fff3b0';
    c.fillRect(z.x - 14, z.y - 4, 28, 8);
    c.fillStyle = FARBE.gold;
    c.fillRect(z.x - 13, z.y - 1, 26, 5);
  }
  // Stehziele
  for (const z of T.stehziele) {
    c.lineCap = 'round';
    c.strokeStyle = z.an ? '#ffd0f4' : '#7a2b6a';
    c.lineWidth = 8;
    c.beginPath(); c.moveTo(z.ax, z.ay); c.lineTo(z.bx, z.by); c.stroke();
    c.strokeStyle = FARBE.pink; c.lineWidth = 3;
    c.beginPath(); c.moveTo(z.ax, z.ay); c.lineTo(z.bx, z.by); c.stroke();
  }
  // Schleudern blitzen
  for (const sl of T.schleudern) {
    if (sl.blitz <= 0) continue;
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = `rgba(56,243,255,${sl.blitz})`;
    c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(...sl.A); c.lineTo(...sl.C); c.stroke();
    leuchte(c, (sl.A[0] + sl.C[0]) / 2, (sl.A[1] + sl.C[1]) / 2, 60, FARBE.cyan, sl.blitz * 0.8);
    c.globalCompositeOperation = 'source-over';
  }
  c.globalCompositeOperation = 'lighter';
  for (const z of [...T.fallziele, ...T.stehziele]) if (z.blitz > 0 || z.an) leuchte(c, z.x, z.y, 30, z.an ? FARBE.pink : FARBE.gold, z.blitz + (z.an ? 0.4 : 0));
  for (const z of T.fallziele) if (!z.unten) leuchte(c, z.x, z.y, 20, FARBE.gold, 0.3);
  c.globalCompositeOperation = 'source-over';

  // Spinner: dreht sich um die waagerechte Achse
  const sp = T.spinner;
  const tiefe = Math.abs(Math.cos(sp.w)) * 9 + 1;
  c.fillStyle = Math.cos(sp.w) > 0 ? '#d7e2ff' : '#7f8bb0';
  c.fillRect(24, sp.y - tiefe / 2, 38, tiefe);
  c.strokeStyle = FARBE.cyan; c.lineWidth = 1;
  c.strokeRect(24, sp.y - tiefe / 2, 38, tiefe);
  c.fillStyle = '#e8f0ff'; c.fillRect(22, sp.y - 1, 42, 2);
  if (sp.tempo > 2) { c.globalCompositeOperation = 'lighter'; leuchte(c, 43, sp.y, 40, FARBE.cyan, Math.min(0.8, sp.tempo / 40)); c.globalCompositeOperation = 'source-over'; }

  // Kolben
  const kol = T.kolben;
  const ky = kol.ay - (kol.zugAnim || 0) * 20;
  const g = c.createLinearGradient(SCHUSS.innen, 0, SCHUSS.aussen, 0);
  g.addColorStop(0, '#596486'); g.addColorStop(0.5, '#eef3ff'); g.addColorStop(1, '#596486');
  c.fillStyle = g;
  c.fillRect(SCHUSS.innen + 4, ky - 3, SCHUSS.aussen - SCHUSS.innen - 8, 7);
  c.fillStyle = '#3a4260';
  c.fillRect(SCHUSS.x - 3, ky + 4, 6, 60);
  if (s.kolbenZug > 0) {
    c.globalCompositeOperation = 'lighter';
    leuchte(c, SCHUSS.x, ky, 30 + s.kolbenZug * 30, FARBE.gold, s.kolbenZug);
    c.globalCompositeOperation = 'source-over';
  }

  for (const f of T.flipper) zeichneFlipper(c, f);
}

// --------------------------- Ein ganzes Bild ---------------------------

function zeichne(zeit) {
  const { k, ox, oy, dpr } = ansicht;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#04040d';
  ctx.fillRect(0, 0, leinwand.width, leinwand.height);
  if (!s || !unten) return;
  let wx = 0, wy = 0;
  if (s.wackeln > 0) { wx = (Math.random() - 0.5) * s.wackeln * 14; wy = (Math.random() - 0.5) * s.wackeln * 14; }
  ctx.setTransform(1, 0, 0, 1, Math.round((ox + wx * k) * dpr), Math.round((oy + wy * k) * dpr));
  ctx.drawImage(unten, 0, 0);
  ctx.setTransform(k * dpr, 0, 0, k * dpr, (ox + wx * k) * dpr, (oy + wy * k + HUDH * k) * dpr);
  const c = ctx;

  zeichneTeile(c, zeit);

  const baelle = s.welt.baelle;
  // Kugeln im Tunnel: schwach unter dem Tisch
  c.globalCompositeOperation = 'lighter';
  for (const b of baelle) if (b.ort === 'tunnel') leuchte(c, b.x, b.y, 26, FARBE.gruen, 0.9);
  // Licht der Kugeln auf dem Tisch
  for (const b of baelle) if (b.ort === 'tisch') leuchte(c, b.x, b.y, 34, '#4a7dff', 0.35);
  // Leuchtspur
  for (const b of baelle) {
    if (b.ort !== 'tisch' && b.ort !== 'rampe') { b.spur.length = 0; continue; }
    b.spur.push([b.x, b.y]);
    if (b.spur.length > 9) b.spur.shift();
    const v = Math.hypot(b.vx || 0, b.vy || 0);
    if (b.ort === 'tisch' && v < 500) continue;
    for (let i = 0; i < b.spur.length - 1; i++) {
      const a = (i + 1) / b.spur.length;
      c.strokeStyle = `rgba(80,200,255,${a * 0.35})`;
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
    c.strokeStyle = RAMPENFARBE[ra.farbe][1];
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
  for (const t of s.teilchen) {
    const a = 1 - t.zeit / t.leben;
    c.fillStyle = t.farbe;
    c.globalAlpha = a;
    c.fillRect(t.x - t.groesse / 2, t.y - t.groesse / 2, t.groesse, t.groesse);
  }
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
  const m = s.meldung;
  if (s.bonusAnzeige) {
    const b = s.bonusAnzeige;
    kasten(c, MITTE, 600, 330, 110, FARBE.cyan);
    c.textAlign = 'center';
    c.fillStyle = FARBE.cyan; c.font = '14px ' + SCHRIFT;
    c.fillText('BONUS', MITTE, 580);
    c.fillStyle = '#fff'; c.font = '11px ' + SCHRIFT;
    const zaehl = Math.min(1, b.zeit / 1.2);
    c.fillText(zahl(b.bonus * zaehl) + ' X ' + b.multi, MITTE, 606);
    c.fillStyle = FARBE.gold;
    if (b.zeit > 1.2) c.fillText('= ' + zahl(b.bonus * b.multi), MITTE, 630);
    return;
  }
  if (!m) return;
  const ein = Math.min(1, m.zeit * 6), aus = Math.min(1, (m.dauer - m.zeit) * 5);
  c.globalAlpha = Math.max(0, Math.min(ein, aus));
  const y = 610;
  kasten(c, MITTE, y, 370, m.text ? 74 : 50, m.farbe);
  c.textAlign = 'center';
  c.font = '15px ' + SCHRIFT;
  c.fillStyle = m.farbe;
  c.fillText(m.titel, MITTE, y + (m.text ? -6 : 7));
  if (m.text) {
    c.font = '600 14px ' + "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    c.fillStyle = '#eef2ff';
    c.fillText(m.text, MITTE, y + 20, 350);
  }
  c.globalAlpha = 1;
}

function kasten(c, x, y, b, h, farbe) {
  c.fillStyle = 'rgba(6, 6, 22, 0.82)';
  rund(c, x - b / 2, y - h / 2, b, h, 12);
  c.fill();
  c.strokeStyle = farbe; c.lineWidth = 2;
  c.stroke();
  c.globalCompositeOperation = 'lighter';
  c.strokeStyle = farbe; c.globalAlpha *= 0.3; c.lineWidth = 7;
  c.stroke();
  c.globalAlpha = Math.min(1, c.globalAlpha / 0.3);
  c.globalCompositeOperation = 'source-over';
}
function rund(c, x, y, b, h, r) {
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + b, y, x + b, y + h, r); c.arcTo(x + b, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + b, y, r); c.closePath();
}

// --------------------------- Anzeige oben ---------------------------

function zeichneHud(zeit) {
  const { k, ox, oy, dpr } = ansicht;
  const c = ctx;
  c.setTransform(k * dpr, 0, 0, k * dpr, ox * dpr, oy * dpr);
  c.textAlign = 'left';
  c.font = '22px ' + SCHRIFT;
  c.fillStyle = FARBE.cyan;
  c.shadowColor = FARBE.cyan; c.shadowBlur = 0;
  c.fillText(zahl(s.punkte), 16, 40);
  c.font = '8px ' + SCHRIFT;
  c.fillStyle = '#b8b2d6';
  const multi = s.multi > 1 ? '  BONUS ' + s.multi + 'X' : '';
  const extra = s.extraBaelle ? '  +' + s.extraBaelle : '';
  c.fillText('KUGEL ' + s.ballNr + '/' + BAELLE + extra + multi + '  ' + RAENGE[s.rang], 16, 62);

  // Auftrag mit Fortschritt
  const a = auftragJetzt();
  const ziel = auftragZiel();
  c.fillStyle = FARBE.gold;
  c.font = '8px ' + SCHRIFT;
  c.fillText('AUFTRAG', 16, 86);
  c.font = '600 13px ' + "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  c.fillStyle = '#eef2ff';
  c.fillText(auftragText(), 90, 87, 300);
  const anteil = Math.min(1, s.stand / ziel);
  c.fillStyle = 'rgba(255,216,74,0.18)';
  c.fillRect(16, 96, 330, 5);
  c.fillStyle = FARBE.gold;
  c.fillRect(16, 96, 330 * anteil, 5);

  // Spezialfähigkeiten mit Restzeit
  const aktiv = [];
  if (s.schutz > 0 || s.effekt.schild > 0) aktiv.push(['SCHILD', Math.max(s.schutz, s.effekt.schild), FARBE.gruen]);
  if (s.effekt.doppelt > 0) aktiv.push(['2X', s.effekt.doppelt, FARBE.gold]);
  if (s.effekt.zeitlupe > 0) aktiv.push(['ZEIT', s.effekt.zeitlupe, FARBE.pink]);
  if (s.multiball) aktiv.push(['MULTI', 0, FARBE.pink]);
  if (s.kombo >= 2 && s.welt.zeit - s.letzterSchuss < 5) aktiv.push(['KOMBO ' + s.kombo, 5 - (s.welt.zeit - s.letzterSchuss), FARBE.gold]);
  let x = 360;
  c.font = '7px ' + SCHRIFT;
  c.textAlign = 'center';
  aktiv.slice(0, 3).forEach(([name, rest, f], i) => {
    const y = 76 + i * 0;
    const xx = x + i * 58;
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
