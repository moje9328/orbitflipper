// =====================================================================
//  TISCH
//  Alle Bauteile des Spielfelds mit ihren Maßen. Das Feld ist 540 x 960
//  Einheiten groß (Hochformat 9:16). Die Mitte der Spielfläche liegt bei x = 252.
// =====================================================================

const TB = 540, TH = 960;
const MITTE = 252;
const spiegel = x => 2 * MITTE - x;

// Abschussbahn rechts
const SCHUSS = { innen: 484, aussen: 520, x: 502, kolbenY: 900 };

// ---------- Baukasten für die Tische der Level ----------
// Bumper-Anordnungen: [x, y, Radius]. Abstände sind so gewählt, dass zwischen
// zwei Bumpern immer eine Kugel durchpasst (keine Falle, in der sie festsitzt).
const BUMPER_FORMEN = {
  dreieck: [[200, 262, 25], [304, 262, 25], [252, 338, 25]],
  reihe: [[178, 285, 24], [252, 255, 24], [326, 285, 24]],
  vier: [[182, 272, 22], [322, 272, 22], [252, 236, 22], [252, 336, 22]],
  zwei: [[205, 280, 27], [299, 280, 27]],
  tief: [[188, 300, 24], [316, 300, 24], [252, 236, 24]]
};
// Kleine Schlagpfosten als zusätzliche Hindernisse
const PFOSTEN_FORMEN = {
  flanke: [[176, 566], [328, 566]],
  seiten: [[132, 356], [372, 356]],
  mitte: [[252, 610]],
  oben: [[150, 205], [354, 205]]
};
// Wege der Rampen. Rechts ist (außer bei "innen") das Spiegelbild von links.
const RAMPEN_WEGE = {
  innen: [[114, 505], [114, 360], [116, 250], [140, 152], [252, 104], [364, 152], [418, 250], [426, 360], [426, 560], [424, 628]],
  kehre: [[114, 505], [114, 300], [116, 222], [97, 190], [78, 222], [79, 300], [80, 560], [80, 628]],
  loch: [[114, 505], [114, 340], [124, 240], [160, 214], [180, 262], [171, 350], [166, 412]],
  oben: [[114, 505], [114, 330], [128, 222], [175, 142], [228, 114], [252, 118]]
};
const RAMPEN_WEG_RECHTS_INNEN = [[spiegel(114), 505], [spiegel(114), 380], [372, 268], [330, 222], [252, 208], [174, 222], [118, 268], [82, 360], [80, 560], [80, 628]];
// Anteil bergauf und bergab je Weg
const RAMPEN_PROFIL = { innen: [0.42, 0.4], kehre: [0.45, 0.42], loch: [0.5, 0.35], oben: [0.8, 0.12] };

// Der bisherige ORBITFLIPPER-Tisch
const KLASSIK_PLAN = {
  bumper: 'dreieck', rampen: { links: 'innen', rechts: 'innen' }, fallziele: true,
  steh: ['links', 'mitte', 'rechts'], pfosten: [], kickback: false, rampenTempo: 0
};

function baueTisch(plan = KLASSIK_PLAN) {
  const welt = new Welt();
  const T = {
    welt, plan,
    waende: [],      // zum Zeichnen: Linienzüge
    bumper: [], schleudern: [], fallziele: [], stehziele: [], roll: [], loecher: [], rampen: [], pfosten: [], kickback: [],
    spinner: null, tore: [], kolben: null, lichter: {}, dach: null
  };
  const neu = t => { welt.teile.push(t); return t; };
  const zug = (punkte, opt = {}) => {
    for (const t of linienzug(punkte, opt)) neu(t);
    T.waende.push({ p: punkte, art: opt.zeichne || 'schiene', r: opt.r || 3.5 });
  };

  // ---------- Außenwände ----------
  const oben = bogen(270, 330, 250, 180, 360, 64);
  zug([[20, 1010], [20, 330], ...oben.slice(1, -1), [520, 330], [520, 1010]], { r: 4, zeichne: 'rand' });

  // Innenwand der Abschussbahn und Einbahn-Tor oben
  zug([[SCHUSS.innen, 336], [SCHUSS.innen, 1010]], { r: 3, zeichne: 'schiene' });
  const tor1 = neu(wand(SCHUSS.innen, 334, 521, 298, { r: 2, einweg: norm(-1, -1), mat: 'plastik' }));
  T.tore.push({ t: tor1, ax: SCHUSS.innen, ay: 334, bx: 521, by: 298 });

  // Abschusskolben
  T.kolben = neu(wand(SCHUSS.innen + 3, SCHUSS.kolbenY, SCHUSS.aussen - 3, SCHUSS.kolbenY, { r: 3, mat: 'gummi', e: 0.1, beweglich: 50 }));
  T.kolben.zug = 0;

  // ---------- Orbits links und rechts ----------
  const fuehrL = [[66, 498], [66, 330], ...bogen(270, 330, 204, 180, 212, 8).slice(1)];
  zug(fuehrL, { r: 3.5 });
  const lEnde = fuehrL[fuehrL.length - 1];
  const lAussen = [270 + 250 * Math.cos(212 * Math.PI / 180), 330 + 250 * Math.sin(212 * Math.PI / 180)];
  const torL = neu(wand(lEnde[0], lEnde[1], lAussen[0], lAussen[1], { r: 2, mat: 'plastik', einweg: tangenteBei(212) }));
  T.tore.push({ t: torL, ax: lEnde[0], ay: lEnde[1], bx: lAussen[0], by: lAussen[1] });

  // rechte Führung: gleicher Bogen um (270,330) mit passendem Radius
  const rR = spiegel(66) - 270;
  const fuehrR = [[spiegel(66), 498], [spiegel(66), 330], ...bogen(270, 330, rR, 360, 330, 8).slice(1)];
  zug(fuehrR, { r: 3.5 });

  // Abweiser unten an den Orbits: Ein Ball, der herunterkommt, rollt zur Innenbahn
  zug([[20, 572], [44, 602]], { r: 4, mat: 'gummi', zeichne: 'gummi' });
  zug([[SCHUSS.innen, 572], [spiegel(44), 602]], { r: 4, mat: 'gummi', zeichne: 'gummi' });

  // ---------- Untere Hälfte: Bahnen, Schleudern, Flipper ----------
  for (const s of [1, -1]) {
    const X = x => s === 1 ? x : spiegel(x);
    zug([[X(58), 640], [X(58), 770], [X(140), 818]], { r: 3.5 });
    neu(pfosten(X(58), 640, 5, { mat: 'gummi' }));

    // Schleuder: Dreieck, die lange Seite schießt den Ball weg
    const A = [X(102), 650], B = [X(102), 730], C = [X(144), 756];
    const kick = neu(wand(A[0], A[1], C[0], C[1], { r: 5, mat: 'gummi', kick: 880, kickAb: 110, kickPause: 0.12 }));
    neu(wand(A[0], A[1], B[0], B[1], { r: 5, mat: 'gummi' }));
    neu(wand(B[0], B[1], C[0], C[1], { r: 5, mat: 'gummi' }));
    const sl = { A, B, C, t: kick, blitz: 0, seite: s === 1 ? 'links' : 'rechts' };
    kick.beiKick = (b, w) => { sl.blitz = 1; regeln.schleuder(sl, b); };
    T.schleudern.push(sl);
  }
  welt.flipper.push(new Flipper(152, 828, 'links', 82), new Flipper(spiegel(152), 828, 'rechts', 82));
  T.flipper = welt.flipper;

  // ---------- Obere Rollbahnen O R B ----------
  for (const x of [178, 228, 278, 328]) {
    zug([[x, 142], [x, 188]], { r: 3, zeichne: 'stift' });
  }
  ['O', 'R', 'B'].forEach((buchst, i) => {
    const r = { x: 203 + i * 50, y: 168, buchst, an: false, blitz: 0 };
    welt.punkte.push({ x: r.x, y: r.y, r: 13, rein: b => regeln.rollbahn(r, b) });
    T.roll.push(r);
  });

  // ---------- Bumper ----------
  BUMPER_FORMEN[plan.bumper].forEach(([x, y, r], i) => {
    const bu = { x, y, r, blitz: 0, treffer: 0, nr: i };
    const t = neu(pfosten(x, y, r, { mat: 'bumper', kick: 820, kickAb: 0, kickPause: 0.05 }));
    t.beiKick = (b, w) => { bu.blitz = 1; regeln.bumper(bu, b); };
    T.bumper.push(bu);
  });

  // Schlagpfosten
  for (const name of plan.pfosten || []) {
    for (const [x, y] of PFOSTEN_FORMEN[name]) {
      const p = { x, y, r: 10, blitz: 0 };
      const t = neu(pfosten(x, y, 10, { mat: 'gummi', kick: 520, kickAb: 60, kickPause: 0.1 }));
      t.beiKick = (b, w) => { p.blitz = 1; regeln.pfosten(p, b); };
      T.pfosten.push(p);
    }
  }

  // ---------- Fallziele vor dem Wurmloch ----------
  if (plan.fallziele) [218, 252, 286].forEach((x, i) => {
    const t = neu(wand(x - 14, 505, x + 14, 505, { r: 4, mat: 'plastik' }));
    const z = { x, y: 505, t, unten: false, blitz: 0, nr: i };
    t.beiTreffer = (b, w) => { if (w > 120) regeln.fallziel(z, b); };
    T.fallziele.push(z);
  });
  // Dach hinter den Fallzielen: Eine Kugel von oben rollt seitlich ab statt liegenzubleiben.
  // Von unten (durch ein abgeräumtes Ziel) lässt es die Kugel durch.
  if (plan.fallziele) {
    for (const t of linienzug([[200, 501], [252, 487], [304, 501]], { r: 2, mat: 'metall', einweg: [0, -1] })) neu(t);
    T.dach = [[200, 501], [252, 487], [304, 501]];
  }

  // ---------- Stehziele S C H I L D ----------
  const STEH = {
    links: { x: 70, y: 455, ax: 70, ay: 438, bx: 70, by: 472, n: [1, 0] },
    mitte: { x: 252, y: 384, ax: 238, ay: 384, bx: 266, by: 384, n: [0, 1] },
    rechts: { x: spiegel(70), y: 455, ax: spiegel(70), ay: 438, bx: spiegel(70), by: 472, n: [-1, 0] }
  };
  (plan.steh || []).map(n => STEH[n]).forEach((s, i) => {
    const t = neu(wand(s.ax, s.ay, s.bx, s.by, { r: 4, mat: 'plastik' }));
    const z = Object.assign({ t, an: false, blitz: 0, nr: i }, s);
    t.beiTreffer = (b, w) => { if (w > 90) regeln.stehziel(z, b); };
    T.stehziele.push(z);
    // Liegt das Ziel waagerecht, bekommt es ein spitzes Dach: Eine Kugel von oben rollt ab statt liegenzubleiben
    if (s.ay === s.by) for (const d of linienzug([[s.ax - 4, s.ay - 1], [s.x, s.ay - 9], [s.bx + 4, s.ay - 1]], { r: 2, einweg: [0, -1] })) neu(d);
  });

  // ---------- Löcher ----------
  // Kapsel (links): startet Aufträge. Wurmloch (Mitte): schickt den Ball durch den Tunnel.
  // Reaktor (rechts): fängt Bälle für den Multiball.
  const loch = (name, x, y, aus) => {
    const l = { name, x, y, r: 15, aus, schlange: [], blitz: 0, dreh: 0, frei: true };
    welt.punkte.push({ x, y, r: 12, drin: b => regeln.lochNahe(l, b) });
    T.loecher.push(l);
    return l;
  };
  T.kapsel = loch('kapsel', 166, 418, [70, 430]);
  T.wurmloch = loch('wurmloch', 252, 444, null);
  T.reaktor = loch('reaktor', spiegel(166), 418, [-70, 430]);
  // Tunnel unter dem Tisch: vom Wurmloch zur Kapsel
  T.tunnel = new Bahn([[252, 444], [252, 470], [215, 470], [190, 450], [166, 418]], { glatt: 2 });

  // ---------- Spinner in der linken Orbit-Bahn ----------
  T.spinner = { x: 43, y: 440, w: 0, tempo: 0, halbe: 0 };
  welt.linien.push({ ax: 20, ay: 440, bx: 66, by: 440, aktiv: true, melde: (b, k) => regeln.spinner(b, k) });

  // Orbit-Schranken: Unten merkt sich die Kugel, in welche Bahn sie hineinfährt.
  // Ein Orbit zählt, sobald sie es oben über die Kuppe der Bahn schafft.
  welt.linien.push({ ax: 20, ay: 480, bx: 66, by: 480, aktiv: true, melde: (b, k) => { if (b.vy < 0) b.orbitStart = { seite: 'links', zeit: welt.zeit }; } });
  welt.linien.push({ ax: spiegel(66), ay: 480, bx: SCHUSS.innen, by: 480, aktiv: true, melde: (b, k) => { if (b.vy < 0) b.orbitStart = { seite: 'rechts', zeit: welt.zeit }; } });
  const ueberKuppe = seite => b => {
    if (b.orbitStart && b.orbitStart.seite === seite && welt.zeit - b.orbitStart.zeit < 3) { b.orbitStart = null; regeln.orbit(seite, b); }
  };
  // links: durch das Einbahn-Tor oben aus der Bahn hinaus
  welt.linien.push({ ax: lEnde[0], ay: lEnde[1], bx: lAussen[0], by: lAussen[1], aktiv: true, melde: ueberKuppe('links') });
  // rechts: über das obere Ende der rechten Führung
  const rEnde = fuehrR[fuehrR.length - 1];
  welt.linien.push({ ax: rEnde[0], ay: rEnde[1], bx: 270 + 250 * Math.cos(-30 * Math.PI / 180), by: 330 + 250 * Math.sin(-30 * Math.PI / 180), aktiv: true, melde: ueberKuppe('rechts') });

  // Abschussbahn verlassen
  welt.linien.push({ ax: SCHUSS.innen, ay: 334, bx: 521, by: 298, aktiv: true, melde: (b, k) => { if (b.vy < 0) regeln.abgeschossen(b); } });

  // Innenbahnen (für Kombos und Licht)
  for (const s of [1, -1]) {
    const X = x => s === 1 ? x : spiegel(x);
    welt.punkte.push({ x: X(80), y: 700, r: 12, rein: b => regeln.innenbahn(s === 1 ? 'links' : 'rechts', b) });
    welt.punkte.push({ x: X(39), y: 700, r: 12, rein: b => regeln.aussenbahn(s === 1 ? 'links' : 'rechts', b) });
    if (plan.kickback) {
      const kb = { seite: s === 1 ? 'links' : 'rechts', x: X(39), y: 820, an: true, blitz: 0 };
      welt.punkte.push({ x: kb.x, y: 812, r: 14, rein: b => regeln.kickback(kb, b) });
      T.kickback.push(kb);
    }
  }

  // ---------- Rampen ----------
  // "innen": über den Tisch in die gegenüberliegende Innenbahn
  // "kehre": Haarnadelkurve zurück in die eigene Innenbahn
  // "loch": endet direkt in der Kapsel (links) oder im Reaktor (rechts)
  // "oben": wirft die Kugel oben in die Rollbahnen
  const mundBreite = 36;
  ['links', 'rechts'].forEach((name, nr) => {
    const art = plan.rampen[name];
    if (!art) return;
    let punkte = RAMPEN_WEGE[art];
    if (name === 'rechts') punkte = art === 'innen' ? RAMPEN_WEG_RECHTS_INNEN : punkte.map(([x, y]) => [spiegel(x), y]);
    const [auf, ab] = name === 'rechts' && art === 'innen' ? [0.36, 0.44] : RAMPEN_PROFIL[art];
    const probe = new Bahn(punkte, { auf, ab });
    // Bremsung so, dass etwa ein Schuss mit "noetig" Einheiten/s gerade hinaufreicht
    const noetig = 1180 + (plan.rampenTempo || 0);
    const bremse = KLASSIK_PLAN === plan
      ? (name === 'links' ? 1250 : 1500)
      : noetig * noetig / (2 * probe.L * auf);
    const bahn = new Bahn(punkte, { auf, ab, bremse, schub: 600 });
    const [mx, my] = bahn.ort(0);
    const loch = art === 'loch' ? (name === 'links' ? T.kapsel : T.reaktor) : null;
    const ra = { name, nr, art, bahn, mx, my, blitz: 0, loch };
    // Innere Lippe: geht unten nach außen auseinander (Trichter) und lenkt knappe Schüsse in den Eingang
    const innen = name === 'links' ? 1 : -1;
    zug([[mx + innen * mundBreite, my], [mx + innen * (mundBreite + 20), my + 32]], { r: 3.5, zeichne: 'lippe' });
    welt.linien.push({ ax: mx - mundBreite + 3, ay: my, bx: mx + mundBreite - 3, by: my, aktiv: true, melde: (b, k) => {
      if (b.vy < -60 && b.ort === 'tisch') faehrtRampe(b, ra);
    } });
    // Äußere Ecke direkt mit dem unteren Ende der Orbit-Führung verbunden: keine Lücke, in der eine
    // Kugel liegenbleibt, und der Orbit-Eingang darunter bleibt für flache Schüsse frei
    const aussen = name === 'links' ? [66, 494, mx - mundBreite, my] : [spiegel(66), 494, mx + mundBreite, my];
    zug([[aussen[0], aussen[1]], [aussen[2], aussen[3]]], { r: 3.5, zeichne: 'lippe' });
    T.rampen.push(ra);
  });

  welt.baueRaster(TB, TH + 60);
  return T;
}

function norm(x, y) { const l = Math.hypot(x, y); return [x / l, y / l]; }
// Richtung entlang des oberen Bogens (im Uhrzeigersinn am Bildschirm, also links hoch)
function tangenteBei(grad) { const w = grad * Math.PI / 180; return [-Math.sin(w), Math.cos(w)]; }

// Ball fährt auf eine Rampe
function faehrtRampe(b, ra) {
  const [, , tx, ty] = ra.bahn.ort(0);
  const v = b.vx * tx + b.vy * ty;
  if (v < 100) return;
  b.ort = 'rampe';
  b.bahn = ra;
  b.s = 0;
  b.sv = v * 0.94;
  b.in.clear();
  ton.rampeRauf();
}

// Ball auf einer Rampe oder im Tunnel ein Stück weiterbewegen
function rampenSchritt(b, dt) {
  const ra = b.bahn, bahn = ra.bahn;
  b.sv += bahn.beschl(b.s) * dt;
  b.sv *= 1 - 0.25 * dt;
  b.s += b.sv * dt;
  const [x, y] = bahn.ort(b.s);
  b.x = x; b.y = y;
  b.hoehe = bahn.hoehe(b.s);
  if (b.s >= bahn.L) {
    // oben drüber geschafft: unten in die Innenbahn fallen lassen
    const [ex, ey, tx, ty] = bahn.ort(bahn.L);
    const v = Math.min(650, Math.max(250, b.sv));
    b.ort = 'tisch'; b.hoehe = 0;
    b.x = ex; b.y = ey; b.vx = tx * v; b.vy = ty * v;
    regeln.rampe(ra, b);
    if (ra.loch) fangeImLoch(ra.loch, b);
  } else if (b.s <= 0 && b.sv < 0) {
    // zu wenig Schwung: zurück auf den Tisch, nach unten
    const [ex, ey, tx, ty] = bahn.ort(0);
    b.ort = 'tisch'; b.hoehe = 0;
    b.x = ex - tx * 6; b.y = ey - ty * 6;
    b.vx = tx * b.sv * 0.7; b.vy = ty * b.sv * 0.7;
    ton.rampeRunter();
  }
}
