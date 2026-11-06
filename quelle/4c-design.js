// =====================================================================
//  DESIGN DER WELTEN UND LEVEL (zentrale Stelle für alles Aussehen)
//
//  WELT_DESIGN:  Grundpalette, Materialien und Grundmalerei je Welt.
//  LEVEL_DESIGN: je Level ein eigenes Hauptmotiv, eigene Farbgewichtung und
//                Lichtstimmung, die Welt bleibt erkennbar.
//  themaFuer():  setzt beides zusammen. Spiel UND Vorschaubilder benutzen es,
//                deshalb sehen beide immer gleich aus.
//
//  Reihenfolge beim Malen (siehe malUnten in 6-grafik.js):
//  Grundfarbe -> Weltmalerei -> Levelmotiv -> Wände, Schleudern, Schilder.
//  Kugel, Bumper, Ziele und Flipper liegen immer darüber.
// =====================================================================

const WENIG_BEWEGUNG = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- kleine Malhilfen ----------
function flaecheVerlauf(c, y0, y1, stops) {
  const v = c.createLinearGradient(0, y0, 0, y1);
  stops.forEach((f, i) => v.addColorStop(i / (stops.length - 1), f));
  c.fillStyle = v;
  c.fillRect(0, y0, TB, y1 - y0);
}
function fleck(c, x, y, r, farbe, staerke) {
  const v = c.createRadialGradient(x, y, 0, x, y, r);
  v.addColorStop(0, farbe); v.addColorStop(1, farbe.length === 7 ? farbe + '00' : 'rgba(0,0,0,0)');
  c.globalAlpha = staerke; c.fillStyle = v;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.globalAlpha = 1;
}
function vieleck(c, x, y, r, ecken, zz, drehung = 0) {
  c.beginPath();
  for (let k = 0; k < ecken; k++) {
    const w = drehung + k / ecken * Math.PI * 2, rr = r * (zz ? 0.75 + zz() * 0.3 : 1);
    c[k ? 'lineTo' : 'moveTo'](x + Math.cos(w) * rr, y + Math.sin(w) * rr);
  }
  c.closePath();
}
function planetMalen(c, x, y, r, hell, mitte, dunkel, ring) {
  const v = c.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
  v.addColorStop(0, hell); v.addColorStop(0.55, mitte); v.addColorStop(1, dunkel);
  c.fillStyle = v; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  if (ring) { c.strokeStyle = ring; c.lineWidth = r * 0.12; c.beginPath(); c.ellipse(x, y, r * 1.7, r * 0.42, -0.35, 0, Math.PI * 2); c.stroke(); }
}
function sterne(c, saat, anzahl, farbe = '255,255,255') {
  const z = zufall(saat);
  for (let i = 0; i < anzahl; i++) {
    const x = z() * TB, y = 60 + z() * TH, g = z();
    c.fillStyle = `rgba(${farbe},${0.25 + g * 0.6})`;
    const s = g > 0.93 ? 2.2 : 1.2;
    c.fillRect(x, y, s, s);
  }
}
function blatt(c, x, y, laenge, breite, winkel, farbe, ader) {
  c.save(); c.translate(x, y); c.rotate(winkel);
  c.fillStyle = farbe;
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(laenge * 0.5, -breite, laenge, 0); c.quadraticCurveTo(laenge * 0.5, breite, 0, 0); c.fill();
  if (ader) { c.strokeStyle = ader; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(laenge * 0.9, 0); c.stroke(); }
  c.restore();
}
function bluete(c, x, y, r, farbe, mitte) {
  c.fillStyle = farbe;
  for (let k = 0; k < 5; k++) { const w = k / 5 * Math.PI * 2; c.beginPath(); c.ellipse(x + Math.cos(w) * r * 0.7, y + Math.sin(w) * r * 0.7, r * 0.6, r * 0.38, w, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = mitte; c.beginPath(); c.arc(x, y, r * 0.35, 0, Math.PI * 2); c.fill();
}
function koralle(c, x, y, groesse, farbe, saat) {
  const z = zufall(saat);
  c.strokeStyle = farbe; c.lineCap = 'round';
  const ast = (x, y, w, l, tiefe) => {
    if (tiefe === 0) { c.fillStyle = farbe; c.beginPath(); c.arc(x, y, 3.5, 0, Math.PI * 2); c.fill(); return; }
    const x2 = x + Math.cos(w) * l, y2 = y + Math.sin(w) * l;
    c.lineWidth = tiefe * 2.4; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
    ast(x2, y2, w - 0.42 - z() * 0.25, l * 0.74, tiefe - 1);
    ast(x2, y2, w + 0.42 + z() * 0.25, l * 0.74, tiefe - 1);
  };
  ast(x, y, -Math.PI / 2 + (z() - 0.5) * 0.3, groesse, 4);
}
function qualleMalen(c, x, y, r, farbe, zeit = 0) {
  const v = c.createRadialGradient(x, y - r * 0.3, 1, x, y, r);
  v.addColorStop(0, 'rgba(255,255,255,0.75)'); v.addColorStop(0.5, farbe); v.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = v; c.beginPath(); c.arc(x, y, r, Math.PI, 0); c.quadraticCurveTo(x, y + r * 0.35, x - r, y); c.fill();
  c.strokeStyle = farbe; c.lineWidth = 2; c.lineCap = 'round';
  for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * r * 0.3, y + 2); c.quadraticCurveTo(x + k * r * 0.3 + Math.sin(zeit * 2 + k) * 6, y + r * 0.9, x + k * r * 0.25, y + r * 1.7); c.stroke(); }
}
function zieht(zeit, periode, versatz = 0) { return ((zeit + versatz) % periode) / periode; }

// Namensschild auf dem linken Abdeckblech, Symbol auf dem rechten
function schild(c, text, farbe, grund, symbol) {
  c.save();
  c.fillStyle = grund;
  rund(c, 64, 868, 80, 40, 6); c.fill();
  c.strokeStyle = farbe; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = farbe; c.font = '7px ' + SCHRIFT; c.textAlign = 'center';
  const zeilen = text.split('\n');
  zeilen.forEach((z, i) => c.fillText(z, 104, 885 + i * 11 - (zeilen.length - 1) * 4, 72));
  c.translate(spiegel(104), 888);
  c.fillStyle = grund;
  rund(c, -40, -20, 80, 40, 6); c.fill();
  c.strokeStyle = farbe; c.stroke();
  symbol(c);
  c.restore();
}
// Muster in den Schleudern
function schleuderMuster(c, T, f) {
  for (const sl of T.schleudern) {
    const mx = (sl.A[0] + sl.B[0] + sl.C[0]) / 3, my = (sl.A[1] + sl.B[1] + sl.C[1]) / 3;
    c.save();
    c.beginPath(); c.moveTo(...sl.A); c.lineTo(...sl.B); c.lineTo(...sl.C); c.closePath(); c.clip();
    f(c, mx, my, sl.seite === 'links' ? 1 : -1);
    c.restore();
  }
}

// =====================================================================
//  WELTEN
// =====================================================================

const WELT_DESIGN = {
  // ------------------------------------------------------------ KLASSIK (unverändert)
  klassik: {
    name: 'Klassik', rand: '#5b3dff', grund: ['#0b0b2e', '#090620', '#05040f'],
    f: { haupt: '#38f3ff', zweit: '#a066ff', gold: '#ffd84a', gruen: '#4dff9a', pink: '#ff4fd8', text: '#eef2ff', bumper: '#b48cff' },
    schiene: { glow: 'rgba(56,243,255,0.18)', dunkel: '#2b3150', hell: '#a9b6d8', kante: '#eaf2ff' },
    gummi: ['rgba(255,79,216,0.25)', '#f2e8ff'],
    schleuder: ['#2c3456', '#141830', '#d9e2ff', '#3d4666'],
    blech: ['#20263e', '#0d1020', 'rgba(160,180,230,0.35)'],
    rampen: [{ rgb: '56,243,255', voll: '#38f3ff' }, { rgb: '176,102,255', voll: '#b066ff' }], rampenStil: 'neon',
    bumper: { stil: 'klassik', glow: '#7a4dff', ring: '#38f3ff', kappe: ['#e3d3ff', '#9a63ff', '#3b1a8a'] },
    flipper: { stops: ['#f4f8ff', '#a9b5cf', '#4a5470', '#1d2236'], kante: '#38f3ff', glow: '56,243,255' },
    ball: { stops: ['#ffffff', '#dfe7f5', '#7d889f', '#2a3042', '#151a26'], unten: '56,243,255', seite: '176,102,255', licht: '#4a7dff', spur: '80,200,255' },
    teilchen: 'quadrat', ziele: 'standard', treffer: 'ring',
    male(c) { malKlassikKunst(c); },
    ambient() {},
    deko() {},
    klang: { welle: 'square', hoch: 1 }
  },

  // ------------------------------------------------------------ WELTRAUM: Station Orbita
  weltraum: {
    name: 'Weltraum', rand: '#4fa8ff', grund: ['#1b2272', '#151253', '#0b0b33'],
    f: { haupt: '#4fe3ff', zweit: '#ffc94a', gold: '#ffd86a', gruen: '#6dffc4', pink: '#ff7ad9', text: '#eef4ff', bumper: '#9fdcff' },
    schiene: { glow: 'rgba(79,227,255,0.28)', dunkel: '#1d2a5a', hell: '#bfe9ff', kante: '#ffffff' },
    gummi: ['rgba(255,201,74,0.35)', '#fff2d6'],
    schleuder: ['#2a3a8a', '#141c52', '#bfe9ff', '#3a4a9a'],
    blech: ['#26307a', '#121640', 'rgba(191,233,255,0.5)'],
    rampen: [{ rgb: '79,227,255', voll: '#4fe3ff' }, { rgb: '255,201,74', voll: '#ffc94a' }], rampenStil: 'glas',
    bumper: { stil: 'planet', glow: '#4f8dff', ring: '#ffe0a0', farben: [['#ffc58a', '#e0662a', '#4a1606'], ['#a8ecff', '#2a7ce0', '#0a1a4a'], ['#e6c2ff', '#8a4ae0', '#22105a'], ['#b6ffe0', '#22b884', '#06402a']] },
    flipper: { stops: ['#ffffff', '#cfe6ff', '#5f7ab8', '#1c2652'], kante: '#4fe3ff', glow: '79,227,255', streifen: '#ffc94a' },
    ball: { stops: ['#ffffff', '#f2f7ff', '#a8b4d0', '#3d4a70', '#141c34'], unten: '79,227,255', seite: '255,201,74', licht: '#8fd0ff', spur: '140,220,255' },
    teilchen: 'stern', ziele: 'standard', treffer: 'ring',
    male(c, T, th) {
      // Nebelflächen in Violett, Blau und Türkis geben Farbtiefe
      fleck(c, 110, 300, 230, th.nebel[0], 0.55);
      fleck(c, 420, 560, 240, th.nebel[1], 0.5);
      fleck(c, 240, 860, 220, th.nebel[2], 0.45);
      sterne(c, 11, 240);
      // orbitale Energiespuren
      c.strokeStyle = 'rgba(79,227,255,0.22)'; c.lineWidth = 2;
      for (const [rx, ry, w] of [[260, 90, -0.3], [200, 60, 0.4]]) { c.beginPath(); c.ellipse(MITTE, 560, rx, ry, w, 0, Math.PI * 2); c.stroke(); }
      c.strokeStyle = 'rgba(255,201,74,0.25)';
      c.beginPath(); c.ellipse(MITTE, 560, 230, 120, 0.1, 0, Math.PI * 2); c.stroke();
    },
    ambient(c, zeit) {
      funkelSterne(c, zeit);
      // ein Mond zieht oben vorbei, ein Satellit blinkt
      const a = zieht(zeit, 46), x = -60 + a * 660, y = 150 - Math.sin(a * Math.PI) * 40;
      c.globalAlpha = 0.55; planetMalen(c, x, y, 24, '#ffffff', '#b8c4e8', '#4a5480'); c.globalAlpha = 1;
      const b = zieht(zeit, 23, 7), sx = 540 - b * 600, sy = 380 + b * 60;
      c.fillStyle = 'rgba(220,235,255,0.7)'; c.fillRect(sx - 6, sy - 1, 12, 2); c.fillRect(sx - 1, sy - 3, 2, 6);
      if (Math.sin(zeit * 8) > 0.6) { c.fillStyle = '#ffc94a'; c.fillRect(sx + 6, sy - 1, 2, 2); }
    },
    deko(c, T, th) {
      schild(c, 'STATION\nORBITA', th.f.haupt, '#141c52', g => {
        planetMalen(g, 0, 0, 10, '#ffd8a0', '#e07a2a', '#5a1a06', '#ffe0a0');
      });
      schleuderMuster(c, T, (g, x, y) => { g.strokeStyle = 'rgba(191,233,255,0.45)'; g.lineWidth = 1; for (let k = -40; k < 60; k += 9) { g.beginPath(); g.moveTo(x - 40, y + k); g.lineTo(x + 40, y + k); g.stroke(); } g.fillStyle = th.f.zweit; g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); });
    },
    klang: { welle: 'triangle', hoch: 1.15 }
  },

  // ------------------------------------------------------------ CYBERPUNK: Neon City
  cyber: {
    name: 'Cyberpunk', rand: '#ff2bd6', grund: ['#2c0b4a', '#200838', '#0c1446'],
    f: { haupt: '#00e5ff', zweit: '#ff2bd6', gold: '#ffe84a', gruen: '#3dff9a', pink: '#ff2bd6', text: '#fff0fb', bumper: '#ff6fe0' },
    schiene: { glow: 'rgba(255,43,214,0.38)', dunkel: '#1e0a30', hell: '#ff7ae6', kante: '#ffe3f8' },
    gummi: ['rgba(0,229,255,0.4)', '#d9fdff'],
    schleuder: ['#2a0c46', '#120624', '#00e5ff', '#4a1a70'],
    blech: ['#2a0c46', '#0c0620', 'rgba(255,43,214,0.6)'],
    rampen: [{ rgb: '0,229,255', voll: '#00e5ff' }, { rgb: '255,43,214', voll: '#ff2bd6' }], rampenStil: 'neon',
    bumper: { stil: 'holo', glow: '#ff2bd6', ring: '#00e5ff', kappe: ['#ffd1f6', '#ff2bd6', '#4a0a3a'] },
    flipper: { stops: ['#6a6e8a', '#2a2c3c', '#14151f', '#06060c'], kante: '#ff2bd6', glow: '255,43,214', streifen: '#00e5ff' },
    ball: { stops: ['#ffffff', '#f6f0ff', '#a69ec4', '#3a3058', '#141024'], unten: '255,43,214', seite: '0,229,255', licht: '#ff7ae6', spur: '255,120,230' },
    teilchen: 'quadrat', ziele: 'standard', treffer: 'blitz',
    male(c, T, th) {
      // Horizont-Glühen und perspektivischer Rasterboden
      fleck(c, MITTE, 470, 320, th.licht || '#ff2bd6', 0.42);
      fleck(c, 80, 760, 200, '#8b5cff', 0.35);
      fleck(c, 460, 760, 200, '#00e5ff', 0.25);
      c.strokeStyle = 'rgba(255,43,214,0.45)'; c.lineWidth = 1.4;
      for (let i = 0; i < 13; i++) { const y = 480 + Math.pow(i / 12, 1.7) * 480; c.beginPath(); c.moveTo(0, y); c.lineTo(TB, y); c.stroke(); }
      c.strokeStyle = 'rgba(0,229,255,0.35)';
      for (let i = -9; i <= 9; i++) { c.beginPath(); c.moveTo(MITTE + i * 16, 480); c.lineTo(MITTE + i * 120, TH + 20); c.stroke(); }
      // Stadtsilhouette mit leuchtenden Fenstern vor dem Horizont
      const z = zufall(22);
      let x = 6;
      while (x < TB) {
        const b = 24 + z() * 40, h = 90 + z() * 200;
        c.fillStyle = '#12062a';
        c.fillRect(x, 480 - h, b, h);
        c.fillStyle = 'rgba(255,43,214,0.5)'; c.fillRect(x, 480 - h, b, 2);
        for (let fy = 480 - h + 8; fy < 474; fy += 10) for (let fx = x + 4; fx < x + b - 4; fx += 8) {
          if (z() < 0.32) { c.fillStyle = ['rgba(255,43,214,0.7)', 'rgba(0,229,255,0.65)', 'rgba(255,232,74,0.55)', 'rgba(139,92,255,0.7)'][Math.floor(z() * 4)]; c.fillRect(fx, fy, 4, 5); }
        }
        x += b + 3 + z() * 8;
      }
      // Leiterbahnen an den Seiten
      c.strokeStyle = 'rgba(0,229,255,0.45)'; c.lineWidth = 2;
      for (const s of [1, -1]) {
        const X = v => s === 1 ? v : TB - v;
        for (const p of [[[30, 520], [60, 550], [60, 640]], [[30, 680], [50, 700], [50, 760]]]) {
          c.beginPath(); p.forEach(([px, py], i) => c[i ? 'lineTo' : 'moveTo'](X(px), py)); c.stroke();
          const [ex, ey] = p[p.length - 1]; c.fillStyle = '#00e5ff'; c.beginPath(); c.arc(X(ex), ey, 3, 0, Math.PI * 2); c.fill();
        }
      }
    },
    ambient(c, zeit) {
      // fliegende Autos und feiner Regen
      for (const [y, p, v, f] of [[250, 9, 0, '#ffe84a'], [330, 13, 3, '#00e5ff'], [205, 17, 8, '#ff2bd6']]) {
        const a = zieht(zeit, p, v), x = v % 2 ? 560 - a * 600 : -20 + a * 600;
        c.fillStyle = f; c.globalAlpha = 0.8; c.fillRect(x, y, 5, 2); c.fillRect(x + 8, y, 5, 2);
        c.globalAlpha = 0.18; c.fillRect(x - (v % 2 ? -14 : 30), y, 30, 2); c.globalAlpha = 1;
      }
      c.strokeStyle = 'rgba(200,220,255,0.12)'; c.lineWidth = 1; c.beginPath();
      for (let i = 0; i < 34; i++) { const x = (i * 53.7) % TB, y = 80 + ((zeit * 520 + i * 97) % 860); c.moveTo(x, y); c.lineTo(x - 3, y + 14); }
      c.stroke();
    },
    deko(c, T, th) {
      schild(c, 'NEON\nCITY', th.f.zweit, '#1e0838', g => {
        g.strokeStyle = '#00e5ff'; g.lineWidth = 2;
        for (const [x, h] of [[-14, 18], [-4, 26], [6, 14], [14, 22]]) g.strokeRect(x - 4, 12 - h, 8, h);
      });
      schleuderMuster(c, T, (g, x, y, s) => { g.strokeStyle = '#ff2bd6'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - 6 * s, y - 22); g.lineTo(x + 8 * s, y + 4); g.lineTo(x - 8 * s, y + 8); g.lineTo(x + 4 * s, y + 26); g.stroke(); });
    },
    klang: { welle: 'square', hoch: 1.3 }
  },

  // ------------------------------------------------------------ DSCHUNGELTEMPEL
  dschungel: {
    name: 'Dschungeltempel', rand: '#19c878', grund: ['#0f5a42', '#0c4a4c', '#07303a'],
    f: { haupt: '#19c878', zweit: '#20d9c2', gold: '#ffc857', gruen: '#7dff6a', pink: '#ff6f91', text: '#f4fff2', bumper: '#ffc857' },
    schiene: { glow: 'rgba(255,200,87,0.28)', dunkel: '#2c4a3c', hell: '#b8a46a', kante: '#ffe2a0' },
    gummi: ['rgba(25,200,120,0.35)', '#e8ffe0'],
    schleuder: ['#3d6a5a', '#1e3a34', '#ffc857', '#2a4a40'],
    blech: ['#3a6a5a', '#173430', 'rgba(255,200,87,0.6)'],
    rampen: [{ rgb: '32,217,194', voll: '#20d9c2' }, { rgb: '255,200,87', voll: '#ffc857' }], rampenStil: 'stein',
    steinRampe: { grund: 'rgba(70,96,84,0.92)', rand: '#ffc857', streben: 'rgba(20,40,34,0.6)' },
    bumper: { stil: 'maske', glow: '#20d9c2', ring: '#ffc857', kappe: ['#9ab8a8', '#5a7a6c', '#2a3e36'], auge: '#20d9c2' },
    flipper: { stops: ['#ffd9a0', '#c88a46', '#7a4c22', '#3a220e'], kante: '#ffc857', glow: '255,200,87', streifen: '#20d9c2' },
    ball: { stops: ['#ffffff', '#fffaf0', '#c8c4b4', '#4a4a40', '#181a14'], unten: '32,217,194', seite: '255,200,87', licht: '#fff2b0', spur: '255,230,150' },
    teilchen: 'blatt', ziele: 'rune', treffer: 'rune',
    male(c, T, th) {
      // große, ruhige Steinplatten in Grün-Petrol mit hellen Kanten
      const z = zufall(33);
      for (let y = 70; y < TH + 20; y += 64) {
        let x = -z() * 50;
        while (x < TB) {
          const b = 70 + z() * 50;
          c.fillStyle = z() < 0.5 ? th.platte[0] : th.platte[1];
          rund(c, x + 3, y + 3, b - 6, 58, 6); c.fill();
          c.strokeStyle = 'rgba(200,255,220,0.12)'; c.lineWidth = 2; c.stroke();
          x += b;
        }
      }
      fleck(c, MITTE, 520, 300, th.licht || '#19c878', 0.32);
      // Ranken und große Blätter entlang des Rands
      c.strokeStyle = '#0d6a3a'; c.lineWidth = 5; c.lineCap = 'round';
      for (const [x0, y0, x1, y1, x2, y2] of [[22, 330, 74, 440, 30, 560], [518, 340, 456, 450, 500, 570], [36, 150, 110, 170, 150, 110], [504, 150, 430, 170, 390, 110]]) {
        c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
        for (let t = 0.1; t < 1; t += 0.16) {
          const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * x1 + t * t * x2, y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
          blatt(c, x, y, 22, 8, t * 6 + (x0 < 270 ? 0 : Math.PI), t * 10 % 2 < 1 ? '#19c878' : '#12a060', 'rgba(0,60,30,0.5)');
        }
      }
      for (const [x, y, f] of [[48, 560, '#ff6f91'], [492, 560, '#ff8a5c'], [140, 120, '#ff6f91'], [400, 118, '#ffb0d0']]) bluete(c, x, y, 9, f, '#ffc857');
    },
    ambient(c, zeit) {
      // fallende Blätter und Glühwürmchen
      for (let i = 0; i < 4; i++) {
        const a = zieht(zeit, 14 + i * 3, i * 5);
        blatt(c, 80 + i * 110 + Math.sin(a * 12 + i) * 20, 90 + a * 820, 14, 5, Math.sin(a * 9 + i) * 1.4, 'rgba(60,220,120,0.55)');
      }
      c.globalCompositeOperation = 'lighter';
      for (const [x, y, p] of GLUEHWUERMCHEN) leuchte(c, x + Math.sin(zeit * 0.7 + p) * 14, y + Math.cos(zeit * 0.5 + p) * 10, 10, '#ffe066', 0.3 + 0.3 * Math.sin(zeit * 2 + p));
      c.globalCompositeOperation = 'source-over';
    },
    deko(c, T, th) {
      schild(c, 'TEMPEL\nDER AHNEN', th.f.gold, '#173430', g => {
        g.fillStyle = '#ffc857'; g.beginPath(); g.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#20d9c2'; g.beginPath(); g.arc(0, 0, 5, 0, Math.PI * 2); g.fill();
      });
      schleuderMuster(c, T, (g, x, y) => { g.strokeStyle = '#ffc857'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 8, y - 14); g.lineTo(x, y - 22); g.lineTo(x + 8, y - 14); g.moveTo(x - 8, y); g.lineTo(x, y - 8); g.lineTo(x + 8, y); g.stroke(); });
    },
    klang: { welle: 'sine', hoch: 0.9, holz: true }
  },

  // ------------------------------------------------------------ UNTERWASSER: Atlantis
  wasser: {
    name: 'Unterwasser', rand: '#20e0d0', grund: ['#2ab4e0', '#167cd0', '#0c55a8'],
    f: { haupt: '#20e0d0', zweit: '#ff718d', gold: '#ffe08a', gruen: '#7dffc6', pink: '#c27bff', text: '#f0ffff', bumper: '#c8fbff' },
    schiene: { glow: 'rgba(255,255,255,0.25)', dunkel: '#3a5a8a', hell: '#e8f4ff', kante: '#ffffff' },
    gummi: ['rgba(255,113,141,0.4)', '#ffe8ee'],
    schleuder: ['#2a8ad0', '#145aa0', '#fff4e8', '#3a9ae0'],
    blech: ['#e8c890', '#b88a50', 'rgba(255,250,230,0.7)'],
    rampen: [{ rgb: '32,224,208', voll: '#20e0d0' }, { rgb: '255,113,141', voll: '#ff718d' }], rampenStil: 'glas',
    bumper: { stil: 'muschel', glow: '#20e0d0', ring: '#ffffff', kappe: ['#fff6fb', '#ffd0e0', '#d88aa8'] },
    flipper: { stops: ['#ffffff', '#fbeef6', '#d8c4e0', '#8a7aa8'], kante: '#20e0d0', glow: '32,224,208', streifen: '#20e0d0' },
    ball: { stops: ['#ffffff', '#fffaff', '#d6d8e6', '#6a6e90', '#24284a'], unten: '255,113,141', seite: '32,224,208', licht: '#ffffff', spur: '220,255,255' },
    teilchen: 'blase', ziele: 'standard', treffer: 'blasen',
    male(c, T, th) {
      // Lichtstrahlen und Lichtmuster auf dem Grund
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const x = 30 + i * 92;
        const v = c.createLinearGradient(0, 80, 0, 720);
        v.addColorStop(0, 'rgba(255,255,255,0.16)'); v.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = v; c.beginPath(); c.moveTo(x, 80); c.lineTo(x + 36, 80); c.lineTo(x + 140, 720); c.lineTo(x + 70, 720); c.closePath(); c.fill();
      }
      c.strokeStyle = 'rgba(255,255,255,0.09)'; c.lineWidth = 2;
      const z = zufall(44);
      for (let i = 0; i < 70; i++) { const x = z() * TB, y = 300 + z() * 600; c.beginPath(); c.ellipse(x, y, 16 + z() * 14, 6 + z() * 5, z() * 3, 0, Math.PI * 2); c.stroke(); }
      c.globalCompositeOperation = 'source-over';
      // warmer Sand unten
      flaecheVerlauf(c, 760, TH + 20, ['rgba(255,214,150,0)', 'rgba(255,214,150,0.45)']);
      // Korallen und Wasserpflanzen am Rand
      koralle(c, 36, 650, 30, '#ff718d', 1);
      koralle(c, 480, 655, 30, '#ffb34a', 2);
      koralle(c, 30, 960, 26, '#c27bff', 3);
      koralle(c, 500, 962, 28, '#ff718d', 4);
      c.strokeStyle = '#1fbf8a'; c.lineWidth = 4; c.lineCap = 'round';
      for (const [x, y] of [[60, 960], [80, 955], [440, 958], [462, 962]]) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 16, y - 50, x - 4, y - 90); c.stroke(); }
    },
    ambient(c, zeit) {
      // Luftblasen und ein Fischschwarm
      c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.2;
      for (const [x, y0, r, v] of BLASEN) { const y = TH - ((y0 + zeit * v) % 880); c.beginPath(); c.arc(x + Math.sin(zeit * 1.5 + y0) * 4, y, r, 0, Math.PI * 2); c.stroke(); }
      const a = zieht(zeit, 24), rechts = Math.floor(zeit / 24) % 2 === 0;
      const bx = rechts ? -80 + a * 700 : 620 - a * 700, by = 640 + Math.sin(a * 6) * 30, r = rechts ? 1 : -1;
      c.fillStyle = 'rgba(255,224,120,0.7)';
      for (let k = 0; k < 7; k++) {
        const x = bx + (k % 3) * 14 * -r - k * 4, y = by + (k % 4) * 9 - 12;
        c.beginPath(); c.ellipse(x, y, 6, 3, 0, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.moveTo(x - 5 * r, y); c.lineTo(x - 10 * r, y - 3); c.lineTo(x - 10 * r, y + 3); c.closePath(); c.fill();
      }
    },
    deko(c, T, th) {
      schild(c, 'ATLANTIS', '#0a6aa8', '#fff4e0', g => {
        g.fillStyle = '#ff718d';
        g.beginPath(); g.moveTo(0, 12); for (let k = 0; k <= 6; k++) { const w = Math.PI + k / 6 * Math.PI; g.lineTo(Math.cos(w) * 16, Math.sin(w) * 14 + 6); } g.closePath(); g.fill();
        g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, 4, 4, 0, Math.PI * 2); g.fill();
      });
      schleuderMuster(c, T, (g, x, y, s) => { g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1.5; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + 20 * s, y + 30, 14 + k * 8, Math.PI, Math.PI * 1.5); g.stroke(); } });
    },
    klang: { welle: 'sine', hoch: 1.05, blub: true }
  },

  // ------------------------------------------------------------ VULKAN: Glutkern
  vulkan: {
    name: 'Vulkan', rand: '#ff6a00', grund: ['#5a1630', '#3e1222', '#26181e'],
    f: { haupt: '#ff6a00', zweit: '#ffd447', gold: '#ffd447', gruen: '#b6ff4a', pink: '#ff3040', text: '#fff1e6', bumper: '#ff8a2a' },
    schiene: { glow: 'rgba(255,106,0,0.4)', dunkel: '#2a2026', hell: '#6a5a60', kante: '#ffb070' },
    gummi: ['rgba(255,48,64,0.4)', '#ffd9c8'],
    schleuder: ['#3a2a30', '#1a1216', '#ff6a00', '#4a2a2a'],
    blech: ['#3a2a30', '#140c10', 'rgba(255,106,0,0.7)'],
    rampen: [{ rgb: '255,106,0', voll: '#ff6a00' }, { rgb: '255,212,71', voll: '#ffd447' }], rampenStil: 'lava',
    bumper: { stil: 'magma', glow: '#ff6a00', ring: '#ff9a2a', kappe: ['#fff2b0', '#ff6a00', '#3a0c04'] },
    flipper: { stops: ['#9a8e94', '#55494e', '#2a2226', '#100a0c'], kante: '#ff6a00', glow: '255,106,0', streifen: '#ffd447' },
    ball: { stops: ['#ffffff', '#fff6ee', '#bcb0aa', '#4a3c3a', '#181012'], unten: '255,106,0', seite: '255,212,71', licht: '#ffe0b0', spur: '255,170,80' },
    teilchen: 'glut', ziele: 'standard', treffer: 'funken',
    male(c, T, th) {
      // große Basaltplatten mit glühenden Fugen dazwischen
      fleck(c, MITTE, 470, 330, '#ff3040', 0.32);
      fleck(c, 90, 920, 160, '#ff6a00', 0.55);
      fleck(c, 450, 920, 160, '#ff6a00', 0.55);
      fleck(c, 440, 220, 180, '#6a2a8a', 0.35);
      const z = zufall(55);
      vulkanRisse.length = 0;
      for (let y = 90, reihe = 0; y < TH + 40; y += 84, reihe++) {
        for (let x = (reihe % 2) * 49 - 49; x < TB + 50; x += 98) {
          // Fuge (glühend), dann die große dunkle Basaltplatte darauf
          c.fillStyle = th.fuge;
          vieleck(c, x, y, 55, 6, null, Math.PI / 6); c.fill();
          const v = c.createLinearGradient(x, y - 48, x, y + 48);
          v.addColorStop(0, th.platte[1]); v.addColorStop(0.6, th.platte[0]); v.addColorStop(1, '#6a2416');
          c.fillStyle = v;
          vieleck(c, x, y, 50, 6, null, Math.PI / 6); c.fill();
          if (z() < 0.3 && y < 800) vulkanRisse.push([[x - 26, y - 8], [x - 6, y + 4], [x + 8, y - 12], [x + 28, y + 6]]);
        }
      }
      c.lineCap = 'round';
      for (const p of vulkanRisse) { pfad(c, p); c.strokeStyle = 'rgba(255,212,71,0.75)'; c.lineWidth = 2.5; c.stroke(); }
      // warme Lichtreflexe der Lava auf dem Gestein
      c.globalCompositeOperation = 'lighter';
      fleck(c, MITTE, 760, 300, '#ff3a00', 0.32);
      fleck(c, 120, 420, 170, '#ff6a00', 0.18);
      fleck(c, 420, 420, 170, '#ff3040', 0.18);
      c.globalCompositeOperation = 'source-over';
      // warmes Licht von unten
      flaecheVerlauf(c, 700, TH + 20, ['rgba(255,80,0,0)', 'rgba(255,80,0,0.35)']);
    },
    ambient(c, zeit) {
      // Risse glühen auf, Glut steigt
      c.globalCompositeOperation = 'lighter';
      vulkanRisse.forEach((p, i) => {
        const a = 0.15 + 0.15 * Math.sin(zeit * 1.6 + i * 1.3);
        pfad(c, p); c.strokeStyle = `rgba(255,140,40,${a})`; c.lineWidth = 6; c.stroke();
      });
      for (let i = 0; i < 18; i++) {
        const x = (i * 71.3) % 480 + 30 + Math.sin(zeit + i) * 8, y = TH - ((zeit * (40 + (i % 5) * 12) + i * 61) % 860);
        c.fillStyle = `rgba(255,${130 + (i % 3) * 40},40,0.7)`; c.fillRect(x, y, 2, 2);
      }
      c.globalCompositeOperation = 'source-over';
    },
    deko(c, T, th) {
      schild(c, 'GLUT-\nKERN', th.f.gold, '#26121a', g => {
        g.fillStyle = '#ff6a00';
        g.beginPath(); g.moveTo(0, -16); g.quadraticCurveTo(12, 0, 6, 12); g.lineTo(-6, 12); g.quadraticCurveTo(-12, 0, 0, -16); g.fill();
        g.fillStyle = '#ffd447'; g.beginPath(); g.moveTo(0, -4); g.quadraticCurveTo(6, 4, 3, 12); g.lineTo(-3, 12); g.quadraticCurveTo(-6, 4, 0, -4); g.fill();
      });
      schleuderMuster(c, T, (g, x, y) => { g.strokeStyle = '#ff6a00'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - 14, y - 20); g.lineTo(x - 2, y - 4); g.lineTo(x - 8, y + 6); g.lineTo(x + 6, y + 20); g.stroke(); });
    },
    klang: { welle: 'sawtooth', hoch: 0.75, grollen: true }
  }
};
const vulkanRisse = [];
const STERNE_FUNKEL = Array.from({ length: 26 }, (_, i) => { const z = zufall(100 + i); return [z() * TB, 80 + z() * 820, z() * 6]; });
function funkelSterne(c, zeit) {
  c.globalCompositeOperation = 'lighter';
  for (const [x, y, p] of STERNE_FUNKEL) {
    const a = Math.max(0, Math.sin(zeit * 1.7 + p * 3)) * 0.8;
    if (a < 0.05) continue;
    c.fillStyle = `rgba(220,240,255,${a})`;
    c.fillRect(x - 3, y - 0.5, 6, 1); c.fillRect(x - 0.5, y - 3, 1, 6);
  }
  c.globalCompositeOperation = 'source-over';
}
const GLUEHWUERMCHEN = Array.from({ length: 10 }, (_, i) => { const z = zufall(200 + i); return [80 + z() * 380, 140 + z() * 600, z() * 6]; });
const BLASEN = Array.from({ length: 14 }, (_, i) => { const z = zufall(300 + i); return [30 + z() * 470, z() * 900, 2 + z() * 4, 30 + z() * 40]; });

function malKlassikKunst(c) {
  c.strokeStyle = 'rgba(80, 120, 255, 0.07)';
  c.lineWidth = 1;
  const r = 18, hx = r * Math.sqrt(3);
  for (let y = 60, z = 0; y < TH + 40; y += r * 1.5, z++) {
    for (let x = (z % 2) * hx / 2 - hx; x < TB + hx; x += hx) {
      c.beginPath();
      for (let i = 0; i < 6; i++) { const w = Math.PI / 3 * i + Math.PI / 6; c[i ? 'lineTo' : 'moveTo'](x + r * Math.cos(w), y + r * Math.sin(w)); }
      c.closePath(); c.stroke();
    }
  }
  c.globalCompositeOperation = 'lighter';
  for (const [rr, a, f] of [[150, 0.08, '#6a4dff'], [205, 0.06, '#38f3ff'], [95, 0.07, '#ff4fd8']]) {
    c.strokeStyle = f; c.globalAlpha = a; c.lineWidth = 2;
    c.beginPath(); c.ellipse(MITTE, 420, rr, rr * 0.62, -0.25, 0, Math.PI * 2); c.stroke();
  }
  c.globalAlpha = 1;
  leuchte(c, MITTE, 420, 260, '#3b1d9a', 0.35);
  leuchte(c, MITTE, 800, 220, '#0c3a7a', 0.35);
  c.strokeStyle = 'rgba(56, 243, 255, 0.10)';
  c.lineWidth = 1.5;
  for (const p of [[[120, 560], [180, 600], [180, 660]], [[384, 560], [324, 600], [324, 660]], [[252, 540], [252, 600]], [[200, 600], [304, 600]]]) { pfad(c, p); c.stroke(); }
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = 'rgba(56, 243, 255, 0.10)';
  c.font = '12px ' + SCHRIFT; c.textAlign = 'center';
  c.fillText('ORBIT', MITTE, 640);
}

// =====================================================================
//  HAUPTMOTIVE DER LEVEL (unten in der Mitte und im freien Feld, hinter allem)
// =====================================================================

const MOTIVE = {
  // ---- Weltraum
  raumhafen(c, th) {
    // Startplatz mit Leuchtbahnen und Rakete, blau-cyan
    c.save(); c.translate(MITTE, 960);
    c.fillStyle = 'rgba(40,120,220,0.55)'; c.beginPath(); c.moveTo(-120, 0); c.lineTo(-60, -110); c.lineTo(60, -110); c.lineTo(120, 0); c.fill();
    c.strokeStyle = 'rgba(79,227,255,0.8)'; c.lineWidth = 2;
    for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * 50, 0); c.lineTo(k * 24, -110); c.stroke(); }
    c.fillStyle = '#ffc94a'; for (let i = 1; i < 6; i++) { c.fillRect(-60 + i * 2 - 2, -i * 20, 4, 4); c.fillRect(56 - i * 2, -i * 20, 4, 4); }
    c.fillStyle = '#e8f6ff'; c.beginPath(); c.moveTo(0, -150); c.quadraticCurveTo(14, -128, 12, -96); c.lineTo(-12, -96); c.quadraticCurveTo(-14, -128, 0, -150); c.fill();
    c.fillStyle = '#ff7a4a'; c.beginPath(); c.moveTo(-12, -100); c.lineTo(-22, -86); c.lineTo(-10, -92); c.fill(); c.beginPath(); c.moveTo(12, -100); c.lineTo(22, -86); c.lineTo(10, -92); c.fill();
    c.fillStyle = '#4fe3ff'; c.beginPath(); c.arc(0, -126, 4, 0, Math.PI * 2); c.fill();
    c.restore();
    planetMalen(c, 470, 250, 46, '#b8f4ff', '#2a8ae0', '#0a2a6a', 'rgba(79,227,255,0.6)');
  },
  asteroiden(c, th) {
    // kupferne Asteroiden auf goldenen Bahnen
    const z = zufall(77);
    c.strokeStyle = 'rgba(255,201,74,0.4)'; c.lineWidth = 3; c.setLineDash([10, 8]);
    for (const [rx, ry] of [[250, 70], [220, 130]]) { c.beginPath(); c.ellipse(MITTE, 700, rx, ry, -0.15, 0, Math.PI * 2); c.stroke(); }
    c.setLineDash([]);
    for (const [x, y, r] of [[60, 620, 26], [470, 560, 32], [90, 780, 18], [440, 790, 22], [200, 900, 20], [330, 930, 28], [40, 240, 22], [500, 300, 18]]) {
      const v = c.createRadialGradient(x - r * 0.4, y - r * 0.4, 2, x, y, r);
      v.addColorStop(0, '#ffc08a'); v.addColorStop(0.6, '#c06a30'); v.addColorStop(1, '#4a1e0c');
      c.fillStyle = v; vieleck(c, x, y, r, 8, z); c.fill();
      c.fillStyle = 'rgba(60,20,8,0.5)'; c.beginPath(); c.arc(x + r * 0.2, y + r * 0.1, r * 0.22, 0, Math.PI * 2); c.fill();
    }
  },
  station(c, th) {
    // weiß-türkise Raumstation mit Andockarmen
    c.save(); c.translate(MITTE, 900);
    c.strokeStyle = 'rgba(232,251,255,0.85)'; c.lineWidth = 6;
    c.beginPath(); c.ellipse(0, 0, 90, 26, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#2fd6c8'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#e8fbff'; c.fillRect(-14, -50, 28, 74);
    c.fillStyle = '#2fd6c8'; for (let i = 0; i < 5; i++) c.fillRect(-8, -44 + i * 13, 16, 6);
    c.fillStyle = 'rgba(47,214,200,0.75)'; c.fillRect(-150, -10, 54, 20); c.fillRect(96, -10, 54, 20);
    c.strokeStyle = '#e8fbff'; c.lineWidth = 1.5; c.strokeRect(-150, -10, 54, 20); c.strokeRect(96, -10, 54, 20);
    for (const s of [-1, 1]) { c.strokeStyle = '#e8fbff'; c.lineWidth = 3; c.beginPath(); c.moveTo(s * 14, -40); c.lineTo(s * 60, -70); c.stroke(); c.fillStyle = '#ffc94a'; c.beginPath(); c.arc(s * 62, -72, 5, 0, Math.PI * 2); c.fill(); }
    c.restore();
    planetMalen(c, 60, 250, 30, '#d8fff8', '#2fd6c8', '#0a4a5a');
  },
  schwarzesloch(c, th) {
    // violette und magentafarbene Akkretionsringe, orangefarbener heißer Rand
    c.save(); c.translate(MITTE, 880);
    for (const [rx, ry, f] of [[170, 46, 'rgba(139,60,255,0.45)'], [140, 36, 'rgba(255,60,200,0.55)'], [110, 28, 'rgba(255,140,40,0.7)']]) {
      c.strokeStyle = f; c.lineWidth = 12; c.beginPath(); c.ellipse(0, 0, rx, ry, -0.12, 0, Math.PI * 2); c.stroke();
    }
    c.fillStyle = '#05020c'; c.beginPath(); c.arc(0, 0, 34, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#ffb04a'; c.lineWidth = 2.5; c.beginPath(); c.arc(0, 0, 36, 0, Math.PI * 2); c.stroke();
    c.restore();
    fleck(c, MITTE, 880, 220, '#c040ff', 0.35);
  },

  // ---- Cyberpunk
  neonmarkt(c, th) {
    // Marktstände mit gestreiften Neon-Markisen
    const farben = ['#ff2bd6', '#00e5ff', '#ffe84a', '#8b5cff'];
    for (let i = 0; i < 4; i++) {
      const x = 60 + i * 120, y = 870;
      c.fillStyle = '#1a0830'; c.fillRect(x - 40, y, 80, 90);
      for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? farben[i] : '#ffffff'; c.beginPath(); c.moveTo(x - 46 + k * 15.3, y); c.lineTo(x - 46 + (k + 1) * 15.3, y); c.lineTo(x - 46 + (k + 1) * 15.3, y + 14); c.lineTo(x - 46 + k * 15.3, y + 14); c.fill(); }
      c.strokeStyle = farben[(i + 1) % 4]; c.lineWidth = 2; c.strokeRect(x - 28, y + 24, 56, 18);
    }
    c.font = '11px ' + SCHRIFT; c.textAlign = 'center';
    for (const [x, y, t, f, w] of [[120, 300, 'NUDELN', '#ffe84a', -0.1], [400, 340, 'ARCADE', '#00e5ff', 0.1], [MITTE, 760, '24/7', '#ff2bd6', 0]]) {
      c.save(); c.translate(x, y); c.rotate(w);
      const b = c.measureText(t).width + 18;
      c.fillStyle = 'rgba(20,6,40,0.75)'; rund(c, -b / 2, -16, b, 24, 5); c.fill();
      c.strokeStyle = f; c.lineWidth = 2; c.stroke();
      c.fillStyle = f; c.fillText(t, 0, 0);
      c.restore();
    }
  },
  datenautobahn(c, th) {
    // Lichtspuren einer Datenautobahn, alles in Cyan
    c.lineCap = 'round';
    for (let k = 0; k < 9; k++) {
      const x0 = 40 + k * 58;
      c.strokeStyle = k % 3 === 1 ? 'rgba(255,43,214,0.6)' : 'rgba(0,229,255,0.7)'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(MITTE + (x0 - MITTE) * 0.2, 560); c.lineTo(x0, TH + 10); c.stroke();
    }
    c.strokeStyle = 'rgba(0,229,255,0.5)'; c.lineWidth = 2;
    for (let y = 120; y < 460; y += 40) { c.beginPath(); c.moveTo(70, y); c.lineTo(110, y); c.lineTo(130, y + 20); c.stroke(); c.beginPath(); c.moveTo(470, y + 10); c.lineTo(430, y + 10); c.lineTo(410, y + 30); c.stroke(); }
    c.fillStyle = '#00e5ff'; c.font = '9px ' + SCHRIFT; c.textAlign = 'center'; c.fillText('0101 DATA 1010', MITTE, 940);
  },
  hologrammturm(c, th) {
    // hoher Turm mit violettem Hologramm
    c.fillStyle = '#160830'; c.fillRect(MITTE - 30, 640, 60, 330);
    c.strokeStyle = '#8b5cff'; c.lineWidth = 2; c.strokeRect(MITTE - 30, 640, 60, 330);
    c.fillStyle = 'rgba(0,229,255,0.7)'; for (let y = 660; y < 960; y += 18) c.fillRect(MITTE - 20, y, 40, 4);
    c.fillStyle = 'rgba(139,92,255,0.35)';
    c.beginPath(); c.moveTo(MITTE, 560); c.lineTo(MITTE + 70, 640); c.lineTo(MITTE - 70, 640); c.closePath(); c.fill();
    c.strokeStyle = '#c4a8ff'; c.lineWidth = 2; c.stroke();
    c.beginPath(); c.moveTo(MITTE, 560); c.lineTo(MITTE, 640); c.stroke();
  },
  hack(c, th) {
    // Terminalfenster mit Codezeilen, gelbes Warnsymbol
    for (const [x, y, b, h, f] of [[40, 860, 150, 90, '#00e5ff'], [350, 850, 150, 100, '#ff2bd6']]) {
      c.fillStyle = 'rgba(8,4,24,0.85)'; c.fillRect(x, y, b, h);
      c.strokeStyle = f; c.lineWidth = 2; c.strokeRect(x, y, b, h);
      c.fillStyle = f; c.fillRect(x, y, b, 10);
      const z = zufall(x);
      for (let k = 0; k < 6; k++) { c.fillStyle = k % 3 === 2 ? '#ffe84a' : f; c.globalAlpha = 0.8; c.fillRect(x + 8, y + 18 + k * 11, 30 + z() * (b - 50), 4); }
      c.globalAlpha = 1;
    }
    c.save(); c.translate(MITTE, 920);
    c.fillStyle = '#ffe84a'; c.beginPath(); c.moveTo(0, -34); c.lineTo(30, 18); c.lineTo(-30, 18); c.closePath(); c.fill();
    c.fillStyle = '#1a0830'; c.fillRect(-3, -16, 6, 20); c.fillRect(-3, 8, 6, 6);
    c.restore();
  },

  // ---- Dschungel
  ranken(c, th) {
    // dichter Rankenvorhang mit großen Blättern
    for (let i = 0; i < 9; i++) {
      const x = 30 + i * 60;
      c.strokeStyle = '#0d7a44'; c.lineWidth = 4;
      c.beginPath(); c.moveTo(x, 70); c.quadraticCurveTo(x + 20, 170, x - 6, 250 + (i % 3) * 30); c.stroke();
      for (let k = 0; k < 4; k++) blatt(c, x + (k % 2 ? 6 : -6), 100 + k * 40, 20, 7, k % 2 ? 0.6 : 2.5, k % 2 ? '#19c878' : '#2ee08e');
    }
    for (const [x, y, w] of [[MITTE - 80, 930, -2.4], [MITTE + 80, 930, -0.7], [MITTE, 900, -1.57]]) blatt(c, x, y, 90, 28, w, '#19c878', '#0a5a30');
    bluete(c, MITTE, 880, 14, '#ff6f91', '#ffc857');
  },
  wasserfall(c, th) {
    // großer türkiser Wasserfall in ein Becken
    const v = c.createLinearGradient(0, 90, 0, 700);
    v.addColorStop(0, 'rgba(120,250,240,0.55)'); v.addColorStop(1, 'rgba(32,217,194,0.3)');
    c.fillStyle = v; c.fillRect(MITTE - 46, 90, 92, 610);
    c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 2;
    for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(MITTE - 40 + k * 11, 90); c.lineTo(MITTE - 40 + k * 11, 700); c.stroke(); }
    c.fillStyle = 'rgba(32,217,194,0.55)'; c.beginPath(); c.ellipse(MITTE, 900, 150, 50, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(MITTE, 900, 120, 36, 0, 0, Math.PI * 2); c.stroke();
  },
  kammer(c, th) {
    // goldenes Relief einer Tempelkammer mit Fackeln
    c.fillStyle = 'rgba(255,200,87,0.22)';
    c.fillRect(70, 840, 400, 120);
    c.strokeStyle = '#ffc857'; c.lineWidth = 3;
    for (let k = 0; k < 4; k++) c.strokeRect(90 + k * 20, 850 + k * 14, 360 - k * 40, 110 - k * 14);
    c.fillStyle = '#ffc857';
    for (let i = 0; i < 8; i++) { const x = 110 + i * 46; c.fillRect(x, 855, 8, 8); c.fillRect(x - 4, 863, 16, 4); }
    for (const x of [60, 480]) { c.fillStyle = '#5a3a1a'; c.fillRect(x - 3, 840, 6, 40); fleck(c, x, 834, 26, '#ffc857', 0.9); c.fillStyle = '#ff8a3a'; c.beginPath(); c.ellipse(x, 834, 5, 9, 0, 0, Math.PI * 2); c.fill(); }
  },
  goetzenauge(c, th) {
    // riesige Steinmaske mit türkis leuchtenden Augen
    c.save(); c.translate(MITTE, 910);
    c.fillStyle = '#5a7a6c'; rund(c, -90, -70, 180, 130, 30); c.fill();
    c.strokeStyle = '#ffc857'; c.lineWidth = 3; rund(c, -90, -70, 180, 130, 30); c.stroke();
    for (const s of [-1, 1]) {
      c.fillStyle = '#20d9c2'; c.beginPath(); c.ellipse(s * 40, -24, 22, 12, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#e8fffb'; c.beginPath(); c.arc(s * 40, -24, 5, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#ffc857'; c.fillRect(-8, -14, 16, 34);
    c.fillStyle = '#2a3e36'; c.fillRect(-40, 30, 80, 12);
    c.restore();
    fleck(c, MITTE - 40, 886, 40, '#20d9c2', 0.6); fleck(c, MITTE + 40, 886, 40, '#20d9c2', 0.6);
  },

  // ---- Unterwasser
  riff(c, th) {
    // großes buntes Korallenriff
    for (const [x, g, f, z] of [[120, 50, '#ff718d', 11], [200, 40, '#ffb34a', 12], [300, 46, '#c27bff', 13], [390, 54, '#ff718d', 14], [250, 34, '#ffe08a', 15]]) koralle(c, x, 965, g, f, z);
    for (const [x, y, f] of [[150, 860, '#ffe08a'], [360, 880, '#c27bff']]) { c.fillStyle = f; c.beginPath(); c.ellipse(x, y, 24, 14, 0, Math.PI, 0); c.fill(); }
  },
  quallen(c, th) {
    // leuchtende Quallen in Lila und Pink
    for (const [x, y, r, f] of [[110, 320, 30, 'rgba(194,123,255,0.65)'], [420, 260, 26, 'rgba(255,113,141,0.6)'], [MITTE, 880, 40, 'rgba(194,123,255,0.7)'], [400, 760, 22, 'rgba(32,224,208,0.6)']]) qualleMalen(c, x, y, r, f);
  },
  stadt(c, th) {
    // Ruinen der versunkenen Stadt in Perlmutt
    c.save(); c.translate(MITTE, 960);
    c.fillStyle = 'rgba(255,248,240,0.55)';
    c.beginPath(); c.arc(0, -10, 80, Math.PI, 0); c.fill();
    c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.beginPath(); c.arc(0, -10, 80, Math.PI, 0); c.stroke();
    for (const x of [-56, -28, 0, 28, 56]) { c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(x - 5, -64 + Math.abs(x) * 0.5, 10, 54 - Math.abs(x) * 0.5); }
    c.restore();
    for (const [x, y, h] of [[90, 600, 120], [450, 600, 120]]) { c.fillStyle = 'rgba(255,248,240,0.45)'; c.fillRect(x - 12, y, 24, h); c.fillRect(x - 18, y - 8, 36, 8); c.fillRect(x - 18, y + h, 36, 8); }
  },
  graben(c, th) {
    // tiefer Graben mit biolumineszenten Punkten (bleibt blau, nicht schwarz)
    c.fillStyle = 'rgba(10,40,120,0.5)';
    c.beginPath(); c.moveTo(20, 700); c.quadraticCurveTo(140, 760, 160, TH + 10); c.lineTo(20, TH + 10); c.fill();
    c.beginPath(); c.moveTo(520, 700); c.quadraticCurveTo(400, 760, 380, TH + 10); c.lineTo(520, TH + 10); c.fill();
    const z = zufall(91);
    for (let i = 0; i < 60; i++) { const x = z() * TB, y = 500 + z() * 460; fleck(c, x, y, 5 + z() * 6, z() < 0.5 ? '#c27bff' : '#20e0d0', 0.85); }
    qualleMalen(c, MITTE, 890, 32, 'rgba(32,224,208,0.65)');
  },

  // ---- Vulkan
  aschefeld(c, th) {
    // ferner Vulkan mit Aschewolken in Violett-Grau
    c.fillStyle = 'rgba(120,90,130,0.5)';
    for (const [x, y, r] of [[120, 160, 60], [200, 130, 70], [330, 140, 64], [420, 170, 56]]) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
    c.save(); c.translate(MITTE, 960);
    c.fillStyle = '#3a2a34'; c.beginPath(); c.moveTo(-170, 0); c.lineTo(-30, -120); c.lineTo(30, -120); c.lineTo(170, 0); c.fill();
    c.fillStyle = '#ff6a00'; c.beginPath(); c.ellipse(0, -120, 30, 8, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#ffd447'; c.lineWidth = 4; c.beginPath(); c.moveTo(-8, -116); c.quadraticCurveTo(-30, -70, -14, -30); c.quadraticCurveTo(0, -10, -36, 0); c.stroke();
    c.restore();
  },
  lavastrom(c, th) {
    // breiter Lavafluss quer über das untere Feld
    c.lineCap = 'round'; c.lineJoin = 'round';
    const weg = [[20, 600], [140, 660], [120, 760], [260, 820], [380, 800], [520, 900]];
    pfad(c, weg); c.strokeStyle = 'rgba(255,48,64,0.6)'; c.lineWidth = 46; c.stroke();
    pfad(c, weg); c.strokeStyle = 'rgba(255,106,0,0.85)'; c.lineWidth = 30; c.stroke();
    pfad(c, weg); c.strokeStyle = 'rgba(255,212,71,0.8)'; c.lineWidth = 8; c.stroke();
  },
  magmakammer(c, th) {
    // großer roter Magmakern in der Mitte unten
    fleck(c, MITTE, 900, 200, '#ff3040', 0.7);
    c.strokeStyle = 'rgba(255,212,71,0.8)'; c.lineWidth = 3;
    for (const r of [60, 90, 120]) { c.beginPath(); c.arc(MITTE, 920, r, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
    planetMalen(c, MITTE, 930, 40, '#fff2b0', '#ff3040', '#5a0810');
  },
  herz(c, th) {
    // Lava-Tempel: goldene Sonnenscheibe, Säulen und herabfließende Lava
    c.save(); c.translate(MITTE, 960);
    c.fillStyle = '#2a1a22'; c.fillRect(-140, -110, 280, 110);
    c.fillStyle = '#ffd447'; for (const x of [-120, -70, 60, 110]) c.fillRect(x, -100, 12, 100);
    c.fillStyle = '#3a222a'; c.beginPath(); c.moveTo(-160, -110); c.lineTo(0, -160); c.lineTo(160, -110); c.fill();
    c.strokeStyle = '#ffd447'; c.lineWidth = 3; c.stroke();
    planetMalen(c, 0, -60, 34, '#fff6c0', '#ffd447', '#a85a00');
    c.strokeStyle = '#ff6a00'; c.lineWidth = 6;
    for (const x of [-30, 30]) { c.beginPath(); c.moveTo(x, -30); c.quadraticCurveTo(x * 1.4, -10, x, 0); c.stroke(); }
    c.restore();
  }
};

// =====================================================================
//  LEVEL-DESIGNS: eigenes Motiv, eigene Farbgewichtung und Lichtstimmung
// =====================================================================

const LEVEL_DESIGN = {
  'w1-1': { motiv: 'raumhafen', grund: ['#1a3a8a', '#13286a', '#0a1240'], nebel: ['#1e6ad0', '#22c0e0', '#3a4ad0'], rand: '#4fe3ff' },
  'w1-2': { motiv: 'asteroiden', grund: ['#3a1a6a', '#2a1258', '#140a34'], nebel: ['#8a3ad0', '#c06a30', '#5a2aa0'], rand: '#ffc94a',
    rampen: [{ rgb: '255,201,74', voll: '#ffc94a' }, { rgb: '255,150,80', voll: '#ff9650' }],
    bumper: { farben: [['#ffd0a0', '#c06a30', '#4a1e0c'], ['#ffe6a0', '#d8962a', '#5a3008'], ['#f0c0ff', '#9a4ae0', '#2a0e5a']] } },
  'w1-3': { motiv: 'station', grund: ['#164a7a', '#123a64', '#0a2244'], nebel: ['#2fd6c8', '#4fa8ff', '#e8fbff'], rand: '#2fd6c8',
    bumper: { stil: 'reaktor', glow: '#2fd6c8' } },
  'w1-4': { motiv: 'schwarzesloch', grund: ['#3a1260', '#2a0c4a', '#14062a'], nebel: ['#c040ff', '#ff40c0', '#ff8a2a'], rand: '#ff40c0',
    rampen: [{ rgb: '200,90,255', voll: '#c85aff' }, { rgb: '255,140,40', voll: '#ff8c28' }],
    bumper: { farben: [['#ffd0f0', '#e040c0', '#4a0a3a'], ['#ffe0b0', '#ff8a2a', '#5a2006'], ['#e0c8ff', '#8a40ff', '#22085a']] } },

  'w2-1': { motiv: 'neonmarkt', licht: '#ff2bd6', rand: '#ff2bd6' },
  'w2-2': { motiv: 'datenautobahn', licht: '#00e5ff', grund: ['#0c2050', '#0a1844', '#060c30'], rand: '#00e5ff',
    rampen: [{ rgb: '0,229,255', voll: '#00e5ff' }, { rgb: '139,92,255', voll: '#8b5cff' }] },
  'w2-3': { motiv: 'hologrammturm', licht: '#8b5cff', grund: ['#2a1060', '#1e0a4a', '#0c0a3a'], rand: '#8b5cff',
    bumper: { glow: '#8b5cff', ring: '#ff2bd6' } },
  'w2-4': { motiv: 'hack', licht: '#ff2bd6', rand: '#ffe84a',
    rampen: [{ rgb: '255,232,74', voll: '#ffe84a' }, { rgb: '0,229,255', voll: '#00e5ff' }] },

  'w3-1': { motiv: 'ranken', platte: ['#2e6a52', '#356e5a'], licht: '#19c878', rand: '#19c878' },
  'w3-2': { motiv: 'wasserfall', platte: ['#2a6066', '#2e6a6a'], grund: ['#0c5a5a', '#0a4a52', '#073840'], licht: '#20d9c2', rand: '#20d9c2' },
  'w3-3': { motiv: 'kammer', platte: ['#3a5a4a', '#425e4a'], licht: '#ffc857', rand: '#ffc857',
    bumper: { stil: 'edelstein', glow: '#ffc857' } },
  'w3-4': { motiv: 'goetzenauge', platte: ['#2c5a58', '#34625a'], licht: '#20d9c2', rand: '#20d9c2' },

  'w4-1': { motiv: 'riff', rand: '#ff718d' },
  'w4-2': { motiv: 'quallen', grund: ['#3a9ae0', '#2a6ad0', '#1a4ab0'], rand: '#c27bff', bumper: { stil: 'qualle', glow: '#c27bff' } },
  'w4-3': { motiv: 'stadt', grund: ['#3ac0d8', '#1a8ac8', '#0e5aa8'], rand: '#e8f8ff' },
  'w4-4': { motiv: 'graben', grund: ['#1a7ad0', '#1050b0', '#0a3888'], rand: '#168bff', bumper: { stil: 'qualle', glow: '#20e0d0' } },

  'w5-1': { motiv: 'aschefeld', platte: ['#3a3040', '#4a3c4e'], fuge: 'rgba(255,120,40,0.35)', grund: ['#4a2a48', '#3a1e36', '#24181e'], rand: '#ff6a00' },
  'w5-2': { motiv: 'lavastrom', platte: ['#2e262a', '#3a3034'], fuge: 'rgba(255,106,0,0.5)', rand: '#ff6a00' },
  'w5-3': { motiv: 'magmakammer', platte: ['#3a1e22', '#4a262e'], fuge: 'rgba(255,48,64,0.6)', grund: ['#6a1428', '#4a0e1e', '#26101a'], rand: '#ff3040',
    rampen: [{ rgb: '255,48,64', voll: '#ff3040' }, { rgb: '255,212,71', voll: '#ffd447' }] },
  'w5-4': { motiv: 'herz', platte: ['#30262c', '#3e3238'], fuge: 'rgba(255,212,71,0.5)', rand: '#ffd447',
    rampen: [{ rgb: '255,212,71', voll: '#ffd447' }, { rgb: '255,106,0', voll: '#ff6a00' }] }
};
// Grundwerte, falls ein Level eine Angabe nicht selbst setzt
const WELT_GRUNDWERTE = {
  weltraum: { nebel: ['#3a2ad0', '#1a7ad0', '#8a3ad0'] },
  dschungel: { platte: ['#2e6a52', '#2a5e5a'] },
  vulkan: { platte: ['#2e262a', '#3a3036'], fuge: 'rgba(255,106,0,0.55)' }
};

// Thema für ein Level zusammensetzen (Welt + Level). Für Spiel und Vorschau dasselbe.
const themaCache = new Map();
function themaFuer(levelIndex) {
  if (themaCache.has(levelIndex)) return themaCache.get(levelIndex);
  const lv = levelIndex >= 0 ? LEVEL[levelIndex] : null;
  const welt = lv ? lv.welt : 'klassik';
  const basis = WELT_DESIGN[welt];
  const anders = (lv && LEVEL_DESIGN[lv.id]) || {};
  const th = Object.assign({}, basis, WELT_GRUNDWERTE[welt] || {}, anders);
  for (const k of ['f', 'bumper', 'flipper', 'ball', 'schiene']) th[k] = Object.assign({}, basis[k], anders[k] || {});
  th.weltId = welt;
  th.physik = WELT_PHYSIK[welt];
  const male = basis.male;
  th.male = (c, T) => { male(c, T, th); if (th.motiv) MOTIVE[th.motiv](c, th); };
  const ambient = basis.ambient;
  th.ambient = (c, zeit) => ambient(c, WENIG_BEWEGUNG ? 0 : zeit, th);
  const deko = basis.deko;
  th.deko = (c, T) => deko(c, T, th);
  themaCache.set(levelIndex, th);
  return th;
}
// Welt-Grundthemen für Menüs (Farben, Namen, Eigenschaften)
const THEMEN = {};
for (const id of Object.keys(WELT_DESIGN)) THEMEN[id] = Object.assign({}, WELT_DESIGN[id], { physik: WELT_PHYSIK[id] });
