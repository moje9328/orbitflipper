// =====================================================================
//  WELTEN UND LEVEL
//  Jede Welt hat ihr eigenes Aussehen (Hintergrund, Schienen, Bumper, Rampen,
//  Flipper, Kugel, Funken) und ihren eigenen Klang. Jedes Level hat einen
//  eigenen Tischaufbau und eigene Aufgaben.
// =====================================================================

// Immer gleiche "Zufallszahlen", damit ein Hintergrund bei jedem Start gleich aussieht
function zufall(saat) {
  let a = saat >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --------------------------- Gemeinsame Farbnamen ---------------------------
// f.haupt: Punkte und Hauptlicht, f.zweit: zweites Licht, gold/gruen/pink: Ziele

const THEMEN = {
  // ------------------------------------------------------------------ KLASSIK
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
    teilchen: 'quadrat',
    male(c) { malKlassikKunst(c); },
    ambient() {},
    klang: { welle: 'square', hoch: 1 }
  },

  // ------------------------------------------------------------------ WELTRAUM
  weltraum: {
    name: 'Weltraum', rand: '#3d7bff', grund: ['#02030c', '#040818', '#02020a'],
    f: { haupt: '#7fd4ff', zweit: '#ffc35a', gold: '#ffe27a', gruen: '#6dffc4', pink: '#ff7ad9', text: '#eef4ff', bumper: '#9fd0ff' },
    schiene: { glow: 'rgba(110,190,255,0.22)', dunkel: '#1d2740', hell: '#c4d4f0', kante: '#ffffff' },
    gummi: ['rgba(255,195,90,0.3)', '#fff2d6'],
    schleuder: ['#1e2a48', '#0b1124', '#e6eeff', '#33415f'],
    blech: ['#18213a', '#080c18', 'rgba(170,200,255,0.35)'],
    rampen: [{ rgb: '127,212,255', voll: '#7fd4ff' }, { rgb: '255,195,90', voll: '#ffc35a' }], rampenStil: 'neon',
    bumper: { stil: 'planet', glow: '#4f8dff', ring: '#ffe0a0', farben: [['#ffb36b', '#c2552a', '#3a1206'], ['#8fd8ff', '#2a6cc2', '#0a1a3a'], ['#d9b3ff', '#7a3fc2', '#1e0a3a'], ['#9dffcf', '#2aa274', '#06301e']] },
    flipper: { stops: ['#ffffff', '#c6d3ec', '#55688f', '#1a2238'], kante: '#7fd4ff', glow: '127,212,255' },
    ball: { stops: ['#ffffff', '#e8f0ff', '#8a97b4', '#2a3350', '#121a2c'], unten: '127,212,255', seite: '255,195,90', licht: '#5d8cff', spur: '140,210,255' },
    teilchen: 'stern',
    male(c) { malWeltraum(c); },
    ambient(c, zeit) { funkelSterne(c, zeit); },
    klang: { welle: 'triangle', hoch: 1.15 }
  },

  // ------------------------------------------------------------------ CYBERPUNK
  cyber: {
    name: 'Cyberpunk', rand: '#ff2ea6', grund: ['#120420', '#0b0318', '#05020c'],
    f: { haupt: '#ff3db4', zweit: '#2ef9ff', gold: '#fff13a', gruen: '#3dff8e', pink: '#ff3db4', text: '#fff0fb', bumper: '#ff6fd0' },
    schiene: { glow: 'rgba(255,61,180,0.35)', dunkel: '#1a0b24', hell: '#ff8ad6', kante: '#ffe3f5' },
    gummi: ['rgba(46,249,255,0.35)', '#d9feff'],
    schleuder: ['#1d0b2c', '#0b0414', '#2ef9ff', '#3a1650'],
    blech: ['#1c0a2a', '#08030f', 'rgba(255,61,180,0.45)'],
    rampen: [{ rgb: '46,249,255', voll: '#2ef9ff' }, { rgb: '255,241,58', voll: '#fff13a' }], rampenStil: 'neon',
    bumper: { stil: 'holo', glow: '#ff3db4', ring: '#2ef9ff', kappe: ['#ffd1f0', '#ff3db4', '#4a0a3a'] },
    flipper: { stops: ['#5a5d70', '#24262f', '#101118', '#05050a'], kante: '#ff3db4', glow: '255,61,180' },
    ball: { stops: ['#ffffff', '#f0e6ff', '#8f86a8', '#2c2440', '#120c1c'], unten: '255,61,180', seite: '46,249,255', licht: '#ff3db4', spur: '255,90,200' },
    teilchen: 'quadrat',
    male(c) { malCyber(c); },
    ambient(c, zeit) { cyberRegen(c, zeit); },
    klang: { welle: 'square', hoch: 1.3 }
  },

  // ------------------------------------------------------------------ DSCHUNGEL
  dschungel: {
    name: 'Dschungeltempel', rand: '#c9a23a', grund: ['#17241a', '#132014', '#0a120b'],
    f: { haupt: '#ffd25a', zweit: '#5fe0ff', gold: '#ffd25a', gruen: '#7dff6a', pink: '#ff8a5c', text: '#fff6dc', bumper: '#ffd25a' },
    schiene: { glow: 'rgba(255,210,90,0.18)', dunkel: '#3a2814', hell: '#9b7340', kante: '#ffd98a' },
    gummi: ['rgba(125,255,106,0.25)', '#e8ffd6'],
    schleuder: ['#5a4a32', '#2c2418', '#ffd98a', '#4a3b24'],
    blech: ['#4a3d2a', '#1c160e', 'rgba(255,210,120,0.45)'],
    rampen: [{ rgb: '95,224,255', voll: '#5fe0ff' }, { rgb: '255,210,90', voll: '#ffd25a' }], rampenStil: 'stein',
    bumper: { stil: 'stein', glow: '#ffc14a', ring: '#ffd25a', kappe: ['#c9b48e', '#7d6a4c', '#3a2e1e'] },
    flipper: { stops: ['#e2b778', '#a8743c', '#6a4520', '#2e1c0a'], kante: '#ffd25a', glow: '255,210,90' },
    ball: { stops: ['#ffffff', '#fff3d6', '#b8a27a', '#4a3a24', '#1c140a'], unten: '125,255,106', seite: '255,210,90', licht: '#ffd25a', spur: '255,220,120' },
    teilchen: 'blatt',
    male(c) { malDschungel(c); },
    ambient(c, zeit) { dschungelLeben(c, zeit); },
    klang: { welle: 'sine', hoch: 0.9, holz: true }
  },

  // ------------------------------------------------------------------ UNTERWASSER
  wasser: {
    name: 'Unterwasser', rand: '#2ad6c8', grund: ['#06324a', '#04223a', '#03131f'],
    f: { haupt: '#5ff6e8', zweit: '#ff8fc8', gold: '#ffe08a', gruen: '#7dffc6', pink: '#ff8fc8', text: '#e9fffd', bumper: '#9ffff3' },
    schiene: { glow: 'rgba(95,246,232,0.2)', dunkel: '#3a2a1a', hell: '#c98a4a', kante: '#ffd2a0' },
    gummi: ['rgba(255,143,200,0.3)', '#ffe6f2'],
    schleuder: ['#1a4a5a', '#0a2430', '#ffd2a0', '#2a5a6a'],
    blech: ['#c9a87a', '#7a5f3a', 'rgba(255,230,190,0.5)'],
    rampen: [{ rgb: '170,250,255', voll: '#aafaff' }, { rgb: '255,170,220', voll: '#ffaadc' }], rampenStil: 'glas',
    bumper: { stil: 'qualle', glow: '#5ff6e8', ring: '#ffffff', kappe: ['#e6ffff', '#7ff0ff', '#1a6a8a'] },
    flipper: { stops: ['#ffffff', '#ffe0ec', '#e2a6c0', '#8a5a72'], kante: '#ff8fc8', glow: '255,143,200' },
    ball: { stops: ['#ffffff', '#fff6fb', '#d8dbe8', '#8a8fb0', '#4a4f70'], unten: '95,246,232', seite: '255,143,200', licht: '#7ff0ff', spur: '180,255,250' },
    teilchen: 'blase',
    male(c) { malWasser(c); },
    ambient(c, zeit) { wasserLeben(c, zeit); },
    klang: { welle: 'sine', hoch: 1.05, blub: true }
  },

  // ------------------------------------------------------------------ VULKAN
  vulkan: {
    name: 'Vulkan', rand: '#ff5a1a', grund: ['#1c0e0a', '#140906', '#0a0403'],
    f: { haupt: '#ff9a2a', zweit: '#ffd84a', gold: '#ffe066', gruen: '#b6ff4a', pink: '#ff4a3a', text: '#fff1e6', bumper: '#ff8a2a' },
    schiene: { glow: 'rgba(255,110,30,0.3)', dunkel: '#1a1412', hell: '#5a4a44', kante: '#ff9a5a' },
    gummi: ['rgba(255,90,26,0.35)', '#ffd9b8'],
    schleuder: ['#2a1a16', '#120a08', '#ff9a2a', '#3a221a'],
    blech: ['#2a1c18', '#0e0806', 'rgba(255,120,40,0.45)'],
    rampen: [{ rgb: '255,140,40', voll: '#ff8c28' }, { rgb: '255,216,74', voll: '#ffd84a' }], rampenStil: 'lava',
    bumper: { stil: 'magma', glow: '#ff6a1a', ring: '#ff9a2a', kappe: ['#ffe8a0', '#ff6a1a', '#3a0c04'] },
    flipper: { stops: ['#6a5a56', '#3a2e2a', '#1e1614', '#0a0605'], kante: '#ff8a2a', glow: '255,120,40' },
    ball: { stops: ['#ffffff', '#f2ece8', '#9a8f8a', '#3a302c', '#161010'], unten: '255,120,40', seite: '255,216,74', licht: '#ff7a2a', spur: '255,150,60' },
    teilchen: 'glut',
    male(c) { malVulkan(c); },
    ambient(c, zeit) { vulkanGlut(c, zeit); },
    klang: { welle: 'sawtooth', hoch: 0.75, grollen: true }
  }
};

// Deko, Animationen und Eigenschaften den Themen zuordnen (werden weiter unten definiert)
function themaExtras(id) { const th = THEMEN[id]; th.deko = (c, T) => DEKO[id](c, T); const alt = th.ambient; th.ambient = (c, z) => { alt(c, z); BELEBT_EXTRA[id](c, z); }; th.physik = WELT_PHYSIK[id]; }

const WELTEN = [
  { id: 'weltraum', name: 'Weltraum', text: 'Station Orbita zwischen Ringplaneten und Energiebahnen.' },
  { id: 'cyber', name: 'Cyberpunk', text: 'Nachts in Neon City: Hologramme, Regen und fliegende Autos.' },
  { id: 'dschungel', name: 'Dschungeltempel', text: 'Der Tempel der Ahnen: Ruinen, Wasserfall und alte Steinmechanik.' },
  { id: 'wasser', name: 'Unterwasser', text: 'Das versunkene Atlantis mit Korallen, Quallen und Fischschwärmen.' },
  { id: 'vulkan', name: 'Vulkan', text: 'Im Glutkern: glühende Rampen, Lavaströme und fliegende Funken.' }
];

// --------------------------- Level ---------------------------
// tisch: Bauplan (siehe BUMPER_FORMEN, RAMPEN_WEGE, PFOSTEN_FORMEN in 3-tisch.js)
// aufgaben: nacheinander zu schaffen. zeit = Zeitlimit nur für diese Aufgabe.
// neigung: macht den Tisch steiler (schneller), schutz: Anteil der Schutzzeit

const LEVEL = [
  // ---------------- Weltraum: zum Kennenlernen
  { id: 'w1-1', welt: 'weltraum', name: 'Startrampe', neigung: 0.95, schutz: 1.4,
    tisch: { bumper: 'dreieck', rampen: { links: 'kehre', rechts: 'kehre' }, fallziele: true, steh: ['links', 'mitte', 'rechts'], kickback: true, rampenTempo: -80 },
    aufgaben: [{ art: 'rampe', ziel: 2 }, { art: 'bumper', ziel: 15 }, { art: 'fallbank', ziel: 1 }] },
  { id: 'w1-2', welt: 'weltraum', name: 'Asteroidengürtel', neigung: 0.97, schutz: 1.3,
    tisch: { bumper: 'vier', rampen: { links: 'innen', rechts: 'innen' }, fallziele: true, steh: ['links', 'rechts'], kickback: true, rampenTempo: -60 },
    aufgaben: [{ art: 'orbit', ziel: 2 }, { art: 'folge', folge: ['rampe-links', 'rampe-rechts'] }, { art: 'wurmloch', ziel: 1 }] },
  { id: 'w1-3', welt: 'weltraum', name: 'Raumstation', neigung: 1.0, schutz: 1.2,
    tisch: { bumper: 'reihe', rampen: { links: 'loch', rechts: 'loch' }, fallziele: true, steh: ['links', 'mitte', 'rechts'], kickback: false, rampenTempo: -40 },
    aufgaben: [{ art: 'kapsel', ziel: 2 }, { art: 'multiball', ziel: 1 }] },
  { id: 'w1-4', welt: 'weltraum', name: 'Schwarzes Loch', neigung: 1.02, schutz: 1.1,
    tisch: { bumper: 'dreieck', rampen: { links: 'oben', rechts: 'innen' }, fallziele: false, steh: ['links', 'rechts'], pfosten: ['seiten'], rampenTempo: -20 },
    aufgaben: [{ art: 'wurmloch', ziel: 3, zeit: 120 }, { art: 'punkte', ziel: 150000 }] },

  // ---------------- Cyberpunk
  { id: 'w2-1', welt: 'cyber', name: 'Neonmarkt', neigung: 1.02, schutz: 1.1,
    tisch: { bumper: 'reihe', rampen: { links: 'innen', rechts: 'kehre' }, fallziele: true, steh: ['links', 'mitte', 'rechts'], kickback: true },
    aufgaben: [{ art: 'rampe', ziel: 4 }, { art: 'kombo', ziel: 2 }] },
  { id: 'w2-2', welt: 'cyber', name: 'Datenautobahn', neigung: 1.04, schutz: 1.0,
    tisch: { bumper: 'zwei', rampen: { links: 'kehre', rechts: 'innen' }, fallziele: true, steh: ['links', 'rechts'], pfosten: ['seiten'] },
    aufgaben: [{ art: 'spin', ziel: 30 }, { art: 'orbit', ziel: 3, zeit: 150 }] },
  { id: 'w2-3', welt: 'cyber', name: 'Hologramm-Turm', neigung: 1.05, schutz: 1.0,
    tisch: { bumper: 'vier', rampen: { links: 'oben', rechts: 'loch' }, fallziele: true, steh: ['links', 'rechts'] },
    aufgaben: [{ art: 'folge', folge: ['orbit-links', 'rampe-links', 'reaktor'] }, { art: 'multiball', ziel: 1 }] },
  { id: 'w2-4', welt: 'cyber', name: 'Mitternachts-Hack', neigung: 1.07, schutz: 0.9,
    tisch: { bumper: 'tief', rampen: { links: 'innen', rechts: 'innen' }, fallziele: true, steh: ['links', 'rechts'], pfosten: ['seiten'], rampenTempo: 20 },
    aufgaben: [{ art: 'punkte', ziel: 200000, zeit: 120 }, { art: 'jackpot', ziel: 2 }] },

  // ---------------- Dschungeltempel
  { id: 'w3-1', welt: 'dschungel', name: 'Rankenpfad', neigung: 1.05, schutz: 1.0,
    tisch: { bumper: 'dreieck', rampen: { links: 'kehre', rechts: null }, fallziele: true, steh: ['links', 'mitte', 'rechts'], kickback: true, pfosten: ['oben'] },
    aufgaben: [{ art: 'rampe', ziel: 3 }, { art: 'fallbank', ziel: 2 }] },
  { id: 'w3-2', welt: 'dschungel', name: 'Wasserfall', neigung: 1.07, schutz: 0.95,
    tisch: { bumper: 'reihe', rampen: { links: 'oben', rechts: 'innen' }, fallziele: true, steh: ['links', 'rechts'] },
    aufgaben: [{ art: 'orbit', ziel: 2 }, { art: 'rampe', ziel: 3 }, { art: 'schild', ziel: 1 }] },
  { id: 'w3-3', welt: 'dschungel', name: 'Tempelkammer', neigung: 1.08, schutz: 0.9,
    tisch: { bumper: 'vier', rampen: { links: 'loch', rechts: 'loch' }, fallziele: true, steh: ['links', 'rechts'], rampenTempo: 20 },
    aufgaben: [{ art: 'folge', folge: ['kapsel', 'reaktor', 'wurmloch'], zeit: 180 }, { art: 'multiball', ziel: 1 }] },
  { id: 'w3-4', welt: 'dschungel', name: 'Götzenauge', neigung: 1.1, schutz: 0.85,
    tisch: { bumper: 'zwei', rampen: { links: 'innen', rechts: 'innen' }, fallziele: true, steh: ['links', 'mitte', 'rechts'], pfosten: ['flanke', 'oben'], rampenTempo: 40 },
    aufgaben: [{ art: 'kombo', ziel: 3 }, { art: 'jackpot', ziel: 2 }] },

  // ---------------- Unterwasser
  { id: 'w4-1', welt: 'wasser', name: 'Korallenriff', neigung: 1.08, schutz: 0.95,
    tisch: { bumper: 'reihe', rampen: { links: 'kehre', rechts: 'kehre' }, fallziele: true, steh: ['links', 'mitte', 'rechts'], kickback: true, rampenTempo: 20 },
    aufgaben: [{ art: 'bumper', ziel: 30 }, { art: 'rampe', ziel: 4, zeit: 150 }] },
  { id: 'w4-2', welt: 'wasser', name: 'Quallengarten', neigung: 1.1, schutz: 0.9,
    tisch: { bumper: 'vier', rampen: { links: 'oben', rechts: 'loch' }, fallziele: true, steh: ['links', 'rechts'], pfosten: ['seiten'], rampenTempo: 30 },
    aufgaben: [{ art: 'spin', ziel: 40 }, { art: 'multiball', ziel: 1 }] },
  { id: 'w4-3', welt: 'wasser', name: 'Versunkene Stadt', neigung: 1.11, schutz: 0.85,
    tisch: { bumper: 'tief', rampen: { links: 'innen', rechts: 'innen' }, fallziele: false, steh: ['links', 'mitte', 'rechts'], rampenTempo: 40 },
    aufgaben: [{ art: 'wurmloch', ziel: 2 }, { art: 'folge', folge: ['rampe-rechts', 'rampe-links', 'rampe-rechts'], zeit: 120 }] },
  { id: 'w4-4', welt: 'wasser', name: 'Tiefseegraben', neigung: 1.13, schutz: 0.8,
    tisch: { bumper: 'dreieck', rampen: { links: 'kehre', rechts: 'loch' }, fallziele: true, steh: ['links', 'rechts'], pfosten: ['flanke'], rampenTempo: 50 },
    aufgaben: [{ art: 'punkte', ziel: 250000, zeit: 150 }, { art: 'jackpot', ziel: 2 }] },

  // ---------------- Vulkan: am schwersten
  { id: 'w5-1', welt: 'vulkan', name: 'Aschefeld', neigung: 1.11, schutz: 0.85,
    tisch: { bumper: 'reihe', rampen: { links: 'innen', rechts: 'kehre' }, fallziele: true, steh: ['links', 'mitte', 'rechts'], pfosten: ['oben'], rampenTempo: 40 },
    aufgaben: [{ art: 'rampe', ziel: 5 }, { art: 'bumper', ziel: 30 }] },
  { id: 'w5-2', welt: 'vulkan', name: 'Lavastrom', neigung: 1.13, schutz: 0.8,
    tisch: { bumper: 'zwei', rampen: { links: 'kehre', rechts: 'oben' }, fallziele: true, steh: ['links', 'rechts'], pfosten: ['seiten', 'flanke'], rampenTempo: 50 },
    aufgaben: [{ art: 'orbit', ziel: 2, zeit: 180 }, { art: 'kombo', ziel: 3 }] },
  { id: 'w5-3', welt: 'vulkan', name: 'Magmakammer', neigung: 1.14, schutz: 0.75,
    tisch: { bumper: 'vier', rampen: { links: 'loch', rechts: 'loch' }, fallziele: true, steh: ['links', 'mitte', 'rechts'], pfosten: ['flanke'], rampenTempo: 60 },
    aufgaben: [{ art: 'multiball', ziel: 1 }, { art: 'jackpot', ziel: 3 }] },
  { id: 'w5-4', welt: 'vulkan', name: 'Herz des Vulkans', neigung: 1.16, schutz: 0.7,
    tisch: { bumper: 'tief', rampen: { links: 'innen', rechts: 'loch' }, fallziele: true, steh: ['links', 'rechts'], pfosten: ['flanke', 'oben'], rampenTempo: 70 },
    aufgaben: [{ art: 'folge', folge: ['rampe-links', 'orbit-rechts', 'rampe-rechts', 'wurmloch'], zeit: 180 }, { art: 'punkte', ziel: 300000 }, { art: 'jackpot', ziel: 3 }] }
];

const SCHUSS_NAMEN = {
  'rampe-links': 'Rampe links', 'rampe-rechts': 'Rampe rechts', 'orbit-links': 'Orbit links', 'orbit-rechts': 'Orbit rechts',
  wurmloch: 'Wurmloch', kapsel: 'Kapsel', reaktor: 'Reaktor'
};
const AUFGABEN_TEXT = {
  rampe: 'Fahr {z} Rampen', bumper: 'Triff {z}-mal die Bumper', spin: 'Dreh den Spinner {z}-mal', fallbank: 'Räum die Fallziele {z}-mal ab',
  orbit: 'Schaff {z} Orbits', wurmloch: 'Versenk die Kugel {z}-mal im Wurmloch', kapsel: 'Triff {z}-mal die Kapsel', reaktor: 'Triff {z}-mal den Reaktor',
  schild: 'Triff alle Schild-Ziele', multiball: 'Starte den Multiball', jackpot: 'Hol {z} Jackpots im Multiball', kombo: 'Schaff eine {z}er-Kombo',
  punkte: 'Sammle {z} Punkte'
};
function aufgabeText(a) {
  if (a.art === 'folge') return a.folge.map(n => SCHUSS_NAMEN[n]).join(' → ');
  let t = AUFGABEN_TEXT[a.art].replace('{z}', a.art === 'punkte' ? zahl(a.ziel) : a.ziel);
  if (a.ziel === 1) t = t.replace('1-mal ', '').replace('1 Jackpots', '1 Jackpot').replace('1 Rampen', '1 Rampe').replace('1 Orbits', '1 Orbit');
  return t;
}
function aufgabeZiel(a) { return a.art === 'folge' ? a.folge.length : a.ziel; }
function levelNr(id) { return LEVEL.findIndex(l => l.id === id); }
function levelFrei(i) { return i === 0 || (daten.sterne[LEVEL[i - 1].id] || 0) > 0; }
function tischName(id) {
  if (id === 'klassik') return 'Klassik';
  const l = LEVEL[levelNr(id)];
  return l ? THEMEN[l.welt].name + ' ' + l.id.slice(-1) + ': ' + l.name : id;
}

// =====================================================================
//  HINTERGRÜNDE DER WELTEN (einmal vorgemalt, liegen unter allem)
// =====================================================================

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

function malWeltraum(c) {
  const z = zufall(11);
  // Nebel
  c.globalCompositeOperation = 'lighter';
  leuchte(c, 150, 300, 260, '#2a1a7a', 0.5);
  leuchte(c, 400, 620, 240, '#0a4a6a', 0.45);
  leuchte(c, 260, 860, 200, '#4a1a5a', 0.35);
  c.globalCompositeOperation = 'source-over';
  // Sterne
  for (let i = 0; i < 260; i++) {
    const x = z() * TB, y = 60 + z() * TH, g = z();
    c.fillStyle = `rgba(255,255,255,${0.15 + g * 0.55})`;
    c.fillRect(x, y, g > 0.92 ? 2 : 1.2, g > 0.92 ? 2 : 1.2);
  }
  // großer Ringplanet unten links
  c.save();
  c.globalAlpha = 0.55;
  let v = c.createRadialGradient(70, 700, 10, 110, 740, 120);
  v.addColorStop(0, '#3a5a9a'); v.addColorStop(0.7, '#14244a'); v.addColorStop(1, '#060a18');
  c.fillStyle = v; c.beginPath(); c.arc(110, 740, 110, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(255,210,150,0.45)'; c.lineWidth = 6;
  c.beginPath(); c.ellipse(110, 740, 175, 34, -0.35, 0, Math.PI * 2); c.stroke();
  // kleiner, blasser Planet ganz am Rand (darf nicht wie ein Bumper aussehen)
  c.globalAlpha = 0.22;
  v = c.createRadialGradient(470, 860, 4, 476, 866, 30);
  v.addColorStop(0, '#ff9a6a'); v.addColorStop(1, '#4a1408');
  c.fillStyle = v; c.beginPath(); c.arc(476, 866, 26, 0, Math.PI * 2); c.fill();
  c.restore();
  // Energiebahnen
  c.globalCompositeOperation = 'lighter';
  c.strokeStyle = 'rgba(127,212,255,0.12)'; c.lineWidth = 3;
  for (const p of [[[60, 860], [160, 650], [252, 560]], [[444, 860], [344, 650], [252, 560]]]) { pfad(c, p); c.stroke(); }
  c.globalCompositeOperation = 'source-over';
}

function malCyber(c) {
  const z = zufall(22);
  // Hochhäuser als Silhouetten mit Fenstern, nach oben hin dunkler
  for (let reihe = 0; reihe < 2; reihe++) {
    let x = 10;
    while (x < TB) {
      const b = 26 + z() * 46, h = 120 + z() * 220 - reihe * 60;
      const unten = reihe === 0 ? 470 : 380;
      c.fillStyle = reihe === 0 ? '#14081f' : '#0d0517';
      c.fillRect(x, unten - h, b, h);
      for (let fy = unten - h + 8; fy < unten - 6; fy += 10) for (let fx = x + 4; fx < x + b - 4; fx += 8) {
        if (z() < 0.3) { c.fillStyle = ['rgba(255,61,180,0.35)', 'rgba(46,249,255,0.3)', 'rgba(255,241,58,0.25)'][Math.floor(z() * 3)]; c.fillRect(fx, fy, 4, 5); }
      }
      x += b + 4 + z() * 10;
    }
  }
  // Synthwave-Boden
  c.strokeStyle = 'rgba(255,61,180,0.18)'; c.lineWidth = 1.2;
  for (let i = 0; i < 12; i++) { const y = 480 + Math.pow(i / 11, 1.6) * 480; c.beginPath(); c.moveTo(0, y); c.lineTo(TB, y); c.stroke(); }
  for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(MITTE + i * 18, 480); c.lineTo(MITTE + i * 110, TH + 20); c.stroke(); }
  // Holo-Werbetafeln
  c.save();
  c.font = '14px ' + SCHRIFT; c.textAlign = 'center';
  for (const [x, y, w, txt, f] of [[110, 300, -0.12, 'NEON', '#2ef9ff'], [395, 330, 0.1, '24/7', '#fff13a'], [252, 720, 0, 'ORBIT CITY', '#ff3db4']]) {
    c.save(); c.translate(x, y); c.rotate(w);
    c.globalAlpha = 0.22; c.fillStyle = f;
    c.fillText(txt, 0, 0);
    c.globalAlpha = 0.12; c.strokeStyle = f; c.lineWidth = 1;
    c.strokeRect(-c.measureText(txt).width / 2 - 8, -20, c.measureText(txt).width + 16, 28);
    c.restore();
  }
  c.restore();
  c.globalCompositeOperation = 'lighter';
  leuchte(c, MITTE, 470, 280, '#5a0a4a', 0.5);
  c.globalCompositeOperation = 'source-over';
}

function malDschungel(c) {
  const z = zufall(33);
  // Steinplatten
  for (let y = 60; y < TH + 20; y += 34) {
    let x = -z() * 40;
    while (x < TB) {
      const b = 40 + z() * 40;
      const h = 30 + z() * 8;
      const g = 28 + Math.floor(z() * 18);
      c.fillStyle = `rgb(${g + 6},${g + 14},${g})`;
      rund(c, x + 1.5, y + 1.5, b - 3, h - 3, 4); c.fill();
      if (z() < 0.35) { c.fillStyle = 'rgba(80,140,50,0.35)'; c.beginPath(); c.ellipse(x + z() * b, y + z() * h, 10 + z() * 14, 6 + z() * 6, 0, 0, Math.PI * 2); c.fill(); }
      x += b;
    }
  }
  // Wasserfall oben links und Becken
  const wv = c.createLinearGradient(0, 100, 0, 400);
  wv.addColorStop(0, 'rgba(120,220,255,0.45)'); wv.addColorStop(1, 'rgba(60,160,220,0.15)');
  c.fillStyle = wv; c.fillRect(126, 100, 40, 300);
  c.fillStyle = 'rgba(70,170,220,0.35)'; c.beginPath(); c.ellipse(146, 410, 50, 18, 0, 0, Math.PI * 2); c.fill();
  // Glyphen-Ring in der Mitte (antike Mechanik)
  c.save(); c.translate(MITTE, 560);
  c.strokeStyle = 'rgba(255,210,90,0.28)'; c.lineWidth = 3;
  c.beginPath(); c.arc(0, 0, 70, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.arc(0, 0, 48, 0, Math.PI * 2); c.stroke();
  for (let i = 0; i < 16; i++) { c.rotate(Math.PI / 8); c.fillStyle = 'rgba(255,210,90,0.3)'; c.fillRect(52, -4, 14, 8); }
  c.fillStyle = 'rgba(255,210,90,0.22)'; c.beginPath(); c.moveTo(0, -24); c.lineTo(20, 12); c.lineTo(-20, 12); c.closePath(); c.fill();
  c.restore();
  // Ranken an den Rändern
  c.strokeStyle = 'rgba(60,120,40,0.75)'; c.lineWidth = 4; c.lineCap = 'round';
  for (const [x0, y0, x1, y1, x2, y2] of [[20, 340, 70, 420, 30, 520], [520, 360, 460, 450, 500, 560], [40, 140, 120, 160, 160, 110], [500, 150, 420, 170, 380, 110]]) {
    c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
    for (let t = 0.1; t < 1; t += 0.18) {
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2, y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
      c.fillStyle = 'rgba(90,170,60,0.75)'; c.beginPath(); c.ellipse(x + 6, y, 8, 4, t * 5, 0, Math.PI * 2); c.fill();
    }
  }
}

function malWasser(c) {
  const z = zufall(44);
  // Lichtstrahlen von oben
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) {
    const x = 40 + i * 90 + z() * 30;
    const v = c.createLinearGradient(0, 80, 0, 700);
    v.addColorStop(0, 'rgba(160,255,250,0.10)'); v.addColorStop(1, 'rgba(160,255,250,0)');
    c.fillStyle = v;
    c.beginPath(); c.moveTo(x, 80); c.lineTo(x + 40, 80); c.lineTo(x + 140, 700); c.lineTo(x + 60, 700); c.closePath(); c.fill();
  }
  c.globalCompositeOperation = 'source-over';
  // Sand unten
  const sv = c.createLinearGradient(0, 760, 0, TH);
  sv.addColorStop(0, 'rgba(201,168,122,0)'); sv.addColorStop(1, 'rgba(201,168,122,0.35)');
  c.fillStyle = sv; c.fillRect(0, 760, TB, 220);
  // Säulen der versunkenen Stadt
  c.fillStyle = 'rgba(120,190,200,0.16)';
  for (const [x, y, h] of [[120, 220, 140], [384, 220, 140], [200, 540, 90], [304, 540, 90]]) {
    c.fillRect(x - 10, y, 20, h); c.fillRect(x - 16, y - 8, 32, 8); c.fillRect(x - 16, y + h, 32, 8);
  }
  c.strokeStyle = 'rgba(120,190,200,0.16)'; c.lineWidth = 5;
  c.beginPath(); c.arc(MITTE, 230, 132, Math.PI, 0); c.stroke();
  // Korallen an den Rändern
  const koralle = (x, y, f, gr) => {
    c.strokeStyle = f; c.lineCap = 'round';
    const ast = (x, y, w, l, tiefe) => {
      if (tiefe === 0) return;
      const x2 = x + Math.cos(w) * l, y2 = y + Math.sin(w) * l;
      c.lineWidth = tiefe * 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
      ast(x2, y2, w - 0.45 - z() * 0.2, l * 0.72, tiefe - 1);
      ast(x2, y2, w + 0.45 + z() * 0.2, l * 0.72, tiefe - 1);
    };
    ast(x, y, -Math.PI / 2 + (z() - 0.5) * 0.4, gr, 4);
  };
  koralle(40, 640, 'rgba(255,120,150,0.55)', 30);
  koralle(470, 650, 'rgba(255,170,90,0.55)', 30);
  koralle(110, 950, 'rgba(255,143,200,0.5)', 26);
  koralle(400, 955, 'rgba(255,120,150,0.5)', 26);
  // Seegras
  c.strokeStyle = 'rgba(70,170,110,0.4)'; c.lineWidth = 3;
  for (let i = 0; i < 10; i++) {
    const x = 30 + z() * 460, y = 880 + z() * 70;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 14, y - 40, x - 4, y - 70); c.stroke();
  }
}

function malVulkan(c) {
  const z = zufall(55);
  // Gesteinsbrocken
  for (let i = 0; i < 70; i++) {
    const x = z() * TB, y = 60 + z() * TH, r = 12 + z() * 30, g = 22 + Math.floor(z() * 16);
    c.fillStyle = `rgb(${g + 8},${g},${g - 4})`;
    c.beginPath();
    for (let k = 0; k < 7; k++) { const w = k / 7 * Math.PI * 2; const rr = r * (0.7 + z() * 0.3); c[k ? 'lineTo' : 'moveTo'](x + Math.cos(w) * rr, y + Math.sin(w) * rr); }
    c.closePath(); c.fill();
  }
  // Lavarisse
  c.lineCap = 'round'; c.lineJoin = 'round';
  vulkanRisse.length = 0;
  // Risse nur an den Rändern, damit das Spielfeld in der Mitte ruhig bleibt
  for (let i = 0; i < 9; i++) {
    let x = i % 2 ? 30 + z() * 60 : 414 + z() * 60, y = 140 + z() * 700;
    const p = [[x, y]];
    for (let k = 0; k < 6; k++) { x = begrenzt(x + (z() - 0.5) * 50, 24, 516); if (x > 100 && x < 404) x = x < MITTE ? 100 : 404; y += (z() - 0.3) * 50; p.push([x, y]); }
    vulkanRisse.push(p);
    pfad(c, p); c.strokeStyle = 'rgba(255,90,20,0.25)'; c.lineWidth = 8; c.stroke();
    pfad(c, p); c.strokeStyle = 'rgba(255,170,60,0.75)'; c.lineWidth = 2; c.stroke();
  }
  // Lavaseen unten
  c.globalCompositeOperation = 'lighter';
  leuchte(c, 80, 930, 120, '#ff4a0a', 0.55);
  leuchte(c, 430, 930, 120, '#ff4a0a', 0.55);
  leuchte(c, MITTE, 420, 240, '#5a1404', 0.6);
  c.globalCompositeOperation = 'source-over';
}
const vulkanRisse = [];

// =====================================================================
//  BELEBUNG (jedes Bild, sparsam und blass, damit das Spielfeld klar bleibt)
// =====================================================================

const STERNE_FUNKEL = Array.from({ length: 26 }, (_, i) => { const z = zufall(100 + i); return [z() * TB, 80 + z() * 820, z() * 6]; });
function funkelSterne(c, zeit) {
  c.globalCompositeOperation = 'lighter';
  for (const [x, y, p] of STERNE_FUNKEL) {
    const a = Math.max(0, Math.sin(zeit * 1.7 + p * 3)) * 0.8;
    if (a < 0.05) continue;
    c.fillStyle = `rgba(200,230,255,${a})`;
    c.fillRect(x - 3, y - 0.5, 6, 1); c.fillRect(x - 0.5, y - 3, 1, 6);
  }
  // Sternschnuppe alle paar Sekunden
  const t = zeit % 7;
  if (t < 0.8) {
    const x = 60 + t * 500, y = 120 + t * 160;
    const v = c.createLinearGradient(x - 70, y - 22, x, y);
    v.addColorStop(0, 'rgba(255,255,255,0)'); v.addColorStop(1, 'rgba(255,255,255,0.7)');
    c.strokeStyle = v; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x - 70, y - 22); c.lineTo(x, y); c.stroke();
  }
  c.globalCompositeOperation = 'source-over';
}

function cyberRegen(c, zeit) {
  c.strokeStyle = 'rgba(180,220,255,0.10)'; c.lineWidth = 1;
  c.beginPath();
  for (let i = 0; i < 40; i++) {
    const x = (i * 53.7) % TB, y = 80 + ((zeit * 520 + i * 97) % 860);
    c.moveTo(x, y); c.lineTo(x - 3, y + 16);
  }
  c.stroke();
  // Laufende Abtastlinie
  const y = 80 + (zeit * 90) % 880;
  c.fillStyle = 'rgba(46,249,255,0.05)';
  c.fillRect(20, y, 500, 3);
}

const GLUEHWUERMCHEN = Array.from({ length: 10 }, (_, i) => { const z = zufall(200 + i); return [80 + z() * 380, 140 + z() * 600, z() * 6]; });
function dschungelLeben(c, zeit) {
  // fließendes Wasser im Wasserfall
  c.strokeStyle = 'rgba(220,250,255,0.35)'; c.lineWidth = 1.5;
  c.beginPath();
  for (let i = 0; i < 7; i++) {
    const x = 130 + i * 5.5, y = 100 + ((zeit * 160 + i * 41) % 290);
    c.moveTo(x, y); c.lineTo(x, y + 16);
  }
  c.stroke();
  c.globalCompositeOperation = 'lighter';
  for (const [x, y, p] of GLUEHWUERMCHEN) {
    const a = 0.25 + 0.35 * Math.sin(zeit * 2 + p);
    leuchte(c, x + Math.sin(zeit * 0.7 + p) * 14, y + Math.cos(zeit * 0.5 + p) * 10, 10, '#d8ff6a', a);
  }
  c.globalCompositeOperation = 'source-over';
}

const BLASEN = Array.from({ length: 14 }, (_, i) => { const z = zufall(300 + i); return [30 + z() * 470, z() * 900, 2 + z() * 4, 30 + z() * 40]; });
function wasserLeben(c, zeit) {
  // Quallen im Hintergrund
  for (let i = 0; i < 2; i++) {
    const x = 150 + i * 220 + Math.sin(zeit * 0.3 + i * 2) * 40;
    const y = 640 - ((zeit * 12 + i * 300) % 520);
    c.fillStyle = i ? 'rgba(255,143,200,0.12)' : 'rgba(160,240,255,0.12)';
    c.beginPath(); c.arc(x, y, 22, Math.PI, 0); c.closePath(); c.fill();
    c.strokeStyle = c.fillStyle; c.lineWidth = 2;
    for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * 8, y); c.quadraticCurveTo(x + k * 8 + Math.sin(zeit * 2 + k) * 6, y + 20, x + k * 7, y + 40); c.stroke(); }
  }
  // Luftblasen steigen auf
  c.strokeStyle = 'rgba(220,255,255,0.35)'; c.lineWidth = 1;
  for (const [x, y0, r, v] of BLASEN) {
    const y = TH - ((y0 + zeit * v) % 880);
    c.beginPath(); c.arc(x + Math.sin(zeit * 1.5 + y0) * 4, y, r, 0, Math.PI * 2); c.stroke();
  }
}

function vulkanGlut(c, zeit) {
  c.globalCompositeOperation = 'lighter';
  vulkanRisse.forEach((p, i) => {
    const a = 0.12 + 0.12 * Math.sin(zeit * 1.6 + i * 1.3);
    pfad(c, p);
    c.strokeStyle = `rgba(255,120,30,${a})`;
    c.lineWidth = 7; c.stroke();
  });
  // aufsteigende Glut
  for (let i = 0; i < 18; i++) {
    const x = (i * 71.3) % 480 + 30 + Math.sin(zeit + i) * 8;
    const y = TH - ((zeit * (40 + (i % 5) * 12) + i * 61) % 860);
    c.fillStyle = `rgba(255,${120 + (i % 3) * 40},40,0.55)`;
    c.fillRect(x, y, 2, 2);
  }
  c.globalCompositeOperation = 'source-over';
}

// =====================================================================
//  WELT-EIGENSCHAFTEN: Jede Welt spielt sich ein bisschen anders
// =====================================================================
const WELT_PHYSIK = {
  klassik: { schwere: 1, zaeh: 0, bumperKick: 1, schleuderKick: 1 },
  weltraum: { schwere: 0.9, zaeh: 0, bumperKick: 1, schleuderKick: 1, text: 'Weniger Schwerkraft: Die Kugel fliegt länger.' },
  cyber: { schwere: 1, zaeh: 0, bumperKick: 1.18, schleuderKick: 1, text: 'Überladene Neon-Bumper schießen härter.' },
  dschungel: { schwere: 1, zaeh: 0.05, bumperKick: 0.92, schleuderKick: 1.2, text: 'Schwere Steinbumper, kräftige Holzschleudern.' },
  wasser: { schwere: 0.86, zaeh: 0.2, bumperKick: 1, schleuderKick: 1, text: 'Im Wasser schwebt die Kugel langsamer.' },
  vulkan: { schwere: 1.06, zaeh: 0, bumperKick: 1.12, schleuderKick: 1.08, text: 'Steiler Hang und glühend heiße Bumper.' }
};

// =====================================================================
//  GROSSE MOTIVE, SCHILDER UND VERZIERUNGEN (einmal vorgemalt)
// =====================================================================

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

const DEKO = {
  klassik() {},
  weltraum(c, T) {
    // Raumstation unten in der Mitte: Ring, Speichen, Module
    c.save(); c.translate(MITTE, 905);
    c.globalAlpha = 0.55;
    c.strokeStyle = '#9fc8ff'; c.lineWidth = 3;
    c.beginPath(); c.ellipse(0, 0, 62, 20, 0, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#1d2a48'; c.fillRect(-10, -34, 20, 52);
    c.strokeStyle = '#c4d4f0'; c.lineWidth = 1.5; c.strokeRect(-10, -34, 20, 52);
    c.fillStyle = '#7fd4ff';
    for (let i = 0; i < 4; i++) c.fillRect(-4, -28 + i * 11, 8, 4);
    c.fillStyle = '#2a4a8a'; c.fillRect(-58, -6, 34, 12); c.fillRect(24, -6, 34, 12);
    c.strokeStyle = '#c4d4f0'; c.strokeRect(-58, -6, 34, 12); c.strokeRect(24, -6, 34, 12);
    c.restore();
    schild(c, 'STATION\nORBITA', '#7fd4ff', '#0f1830', g => {
      g.fillStyle = '#ffb36b'; g.beginPath(); g.arc(0, 0, 10, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#ffe0a0'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 18, 5, -0.35, 0, Math.PI * 2); g.stroke();
    });
    schleuderMuster(c, T, (g, x, y) => { g.strokeStyle = 'rgba(127,212,255,0.5)'; g.lineWidth = 1; for (let k = -40; k < 60; k += 9) { g.beginPath(); g.moveTo(x - 40, y + k); g.lineTo(x + 40, y + k); g.stroke(); } g.fillStyle = '#ffc35a'; g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); });
  },
  cyber(c, T) {
    // großes Neonschild unten: ORBIT CITY
    c.save();
    c.translate(MITTE, 915);
    c.globalAlpha = 0.85;
    c.strokeStyle = '#ff3db4'; c.lineWidth = 2.5;
    rund(c, -62, -22, 124, 40, 8); c.stroke();
    c.globalAlpha = 0.25; c.lineWidth = 8; c.stroke();
    c.globalAlpha = 0.9;
    c.font = '10px ' + SCHRIFT; c.textAlign = 'center'; c.fillStyle = '#2ef9ff';
    c.fillText('ORBIT', 0, -4); c.fillStyle = '#fff13a'; c.fillText('CITY', 0, 10);
    c.restore();
    schild(c, 'NEON\nCITY', '#ff3db4', '#1a0626', g => {
      g.strokeStyle = '#2ef9ff'; g.lineWidth = 2;
      for (const [x, h] of [[-14, 18], [-4, 26], [6, 14], [14, 22]]) g.strokeRect(x - 4, 12 - h, 8, h);
    });
    schleuderMuster(c, T, (g, x, y, s) => { g.strokeStyle = '#2ef9ff'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 6 * s, y - 22); g.lineTo(x + 8 * s, y + 10); g.lineTo(x - 8 * s, y + 18); g.stroke(); });
  },
  dschungel(c, T) {
    // Stufentempel unten in der Mitte
    c.save(); c.translate(MITTE, 960);
    const stufen = [[120, 18], [96, 18], [72, 18], [48, 18]];
    let y = 0;
    stufen.forEach(([b, h], i) => {
      y -= h;
      c.fillStyle = ['#4a3d26', '#54452c', '#5e4e32', '#685838'][i];
      c.fillRect(-b / 2, y, b, h);
      c.strokeStyle = 'rgba(255,210,120,0.5)'; c.lineWidth = 1; c.strokeRect(-b / 2, y, b, h);
    });
    c.fillStyle = '#1a140a'; c.fillRect(-9, y - 2, 18, 14);
    c.fillStyle = '#ffd25a'; c.beginPath(); c.arc(0, y - 10, 5, 0, Math.PI * 2); c.fill();
    c.restore();
    schild(c, 'TEMPEL\nDER AHNEN', '#ffd25a', '#2a2216', g => {
      g.fillStyle = '#ffd25a'; g.beginPath(); g.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#2a1e10'; g.beginPath(); g.arc(0, 0, 5, 0, Math.PI * 2); g.fill();
    });
    schleuderMuster(c, T, (g, x, y) => { g.strokeStyle = 'rgba(255,210,90,0.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 8, y - 14); g.lineTo(x, y - 22); g.lineTo(x + 8, y - 14); g.moveTo(x - 8, y); g.lineTo(x, y - 8); g.lineTo(x + 8, y); g.stroke(); });
  },
  wasser(c, T) {
    // Kuppel von Atlantis unten in der Mitte
    c.save(); c.translate(MITTE, 960);
    c.fillStyle = 'rgba(170,250,255,0.18)';
    c.beginPath(); c.arc(0, -10, 70, Math.PI, 0); c.fill();
    c.strokeStyle = 'rgba(220,255,255,0.7)'; c.lineWidth = 2;
    c.beginPath(); c.arc(0, -10, 70, Math.PI, 0); c.stroke();
    for (const x of [-48, -24, 0, 24, 48]) { c.fillStyle = 'rgba(230,250,255,0.55)'; c.fillRect(x - 4, -60 + Math.abs(x) * 0.5, 8, 50 - Math.abs(x) * 0.5); }
    c.fillStyle = '#ffd2a0'; c.beginPath(); c.moveTo(0, -96); c.lineTo(5, -80); c.lineTo(-5, -80); c.closePath(); c.fill();
    c.restore();
    schild(c, 'ATLANTIS', '#5ff6e8', '#0a3040', g => {
      g.fillStyle = '#ffe0ec';
      g.beginPath(); g.moveTo(0, 12); for (let k = 0; k <= 6; k++) { const w = Math.PI + k / 6 * Math.PI; g.lineTo(Math.cos(w) * 16, Math.sin(w) * 14 + 6); } g.closePath(); g.fill();
      g.strokeStyle = '#d88aaa'; g.lineWidth = 1; for (let k = 1; k < 6; k++) { const w = Math.PI + k / 6 * Math.PI; g.beginPath(); g.moveTo(0, 12); g.lineTo(Math.cos(w) * 16, Math.sin(w) * 14 + 6); g.stroke(); }
    });
    schleuderMuster(c, T, (g, x, y, s) => { g.strokeStyle = 'rgba(255,210,160,0.6)'; g.lineWidth = 1.5; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + 20 * s, y + 30, 14 + k * 8, Math.PI, Math.PI * 1.5); g.stroke(); } });
  },
  vulkan(c, T) {
    // Vulkankegel unten mit Lavastrom
    c.save(); c.translate(MITTE, 962);
    c.fillStyle = '#2a1a14';
    c.beginPath(); c.moveTo(-110, 0); c.lineTo(-26, -86); c.lineTo(26, -86); c.lineTo(110, 0); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,120,40,0.5)'; c.lineWidth = 1.5; c.stroke();
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(255,90,20,0.55)';
    c.beginPath(); c.ellipse(0, -86, 26, 6, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,150,40,0.75)'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-6, -84); c.quadraticCurveTo(-24, -50, -14, -20); c.quadraticCurveTo(-6, -6, -30, 0); c.stroke();
    c.restore();
    schild(c, 'GLUT-\nKERN', '#ff9a2a', '#1e100a', g => {
      g.fillStyle = '#ff6a1a';
      g.beginPath(); g.moveTo(0, -16); g.quadraticCurveTo(12, 0, 6, 12); g.lineTo(-6, 12); g.quadraticCurveTo(-12, 0, 0, -16); g.fill();
      g.fillStyle = '#ffe066'; g.beginPath(); g.moveTo(0, -4); g.quadraticCurveTo(6, 4, 3, 12); g.lineTo(-3, 12); g.quadraticCurveTo(-6, 4, 0, -4); g.fill();
    });
    schleuderMuster(c, T, (g, x, y) => { g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,120,30,0.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 14, y - 20); g.lineTo(x - 2, y - 4); g.lineTo(x - 8, y + 6); g.lineTo(x + 6, y + 20); g.stroke(); });
  }
};

// =====================================================================
//  VORBEIZIEHENDE ANIMATIONEN (blass, hinter der Kugel)
// =====================================================================
function zieht(zeit, periode, versatz = 0) { return ((zeit + versatz) % periode) / periode; }

const BELEBT_EXTRA = {
  klassik() {},
  weltraum(c, zeit) {
    // ein Mond zieht langsam oben vorbei, ein Satellit blinkt
    const a = zieht(zeit, 46);
    const x = -60 + a * 660, y = 150 + Math.sin(a * Math.PI) * -40;
    const v = c.createRadialGradient(x - 8, y - 8, 2, x, y, 30);
    v.addColorStop(0, 'rgba(230,236,255,0.55)'); v.addColorStop(1, 'rgba(90,100,140,0.25)');
    c.fillStyle = v; c.beginPath(); c.arc(x, y, 26, 0, Math.PI * 2); c.fill();
    const b = zieht(zeit, 23, 7), sx = 540 - b * 600, sy = 380 + b * 60;
    c.fillStyle = 'rgba(200,220,255,0.6)'; c.fillRect(sx - 6, sy - 1, 12, 2); c.fillRect(sx - 1, sy - 3, 2, 6);
    if (Math.sin(zeit * 8) > 0.6) { c.fillStyle = '#ff5a5a'; c.fillRect(sx + 6, sy - 1, 2, 2); }
  },
  cyber(c, zeit) {
    // fliegende Autos: Lichterpaare ziehen quer über die Stadt
    for (const [y, p, v, f] of [[250, 9, 0, '#fff13a'], [330, 13, 4, '#2ef9ff'], [205, 17, 9, '#ff3db4']]) {
      const a = zieht(zeit, p, v), x = v % 2 ? 560 - a * 600 : -20 + a * 600;
      c.fillStyle = f; c.globalAlpha = 0.7;
      c.fillRect(x, y, 5, 2); c.fillRect(x + 8, y, 5, 2);
      c.globalAlpha = 0.15; c.fillRect(x - (v % 2 ? -14 : 30), y, 30, 2);
      c.globalAlpha = 1;
    }
    // Laufschrift unter dem Neonschild
    c.save();
    c.beginPath(); c.rect(190, 932, 124, 12); c.clip();
    c.font = '7px ' + SCHRIFT; c.fillStyle = 'rgba(255,61,180,0.75)';
    const text = 'BUMPER  ·  RAMPEN  ·  JACKPOT  ·  ';
    const x = 314 - (zeit * 30) % 260;
    c.fillText(text, x, 941); c.fillText(text, x + 260, 941);
    c.restore();
  },
  dschungel(c, zeit) {
    // Blätter fallen langsam und drehen sich
    for (let i = 0; i < 4; i++) {
      const a = zieht(zeit, 14 + i * 3, i * 5);
      const x = 80 + i * 110 + Math.sin(a * 12 + i) * 20, y = 90 + a * 820;
      c.save(); c.translate(x, y); c.rotate(Math.sin(a * 9 + i) * 1.2);
      c.fillStyle = 'rgba(110,190,70,0.45)';
      c.beginPath(); c.ellipse(0, 0, 7, 3, 0, 0, Math.PI * 2); c.fill();
      c.restore();
    }
  },
  wasser(c, zeit) {
    // Fischschwarm zieht vorbei
    const a = zieht(zeit, 24);
    const rechts = Math.floor((zeit) / 24) % 2 === 0;
    const bx = rechts ? -80 + a * 700 : 620 - a * 700, by = 640 + Math.sin(a * 6) * 30;
    c.fillStyle = 'rgba(255,224,140,0.45)';
    for (let k = 0; k < 7; k++) {
      const x = bx + (k % 3) * 14 * (rechts ? -1 : 1) - k * 4, y = by + (k % 4) * 9 - 12 + Math.sin(zeit * 4 + k) * 2;
      const r = rechts ? 1 : -1;
      c.beginPath(); c.ellipse(x, y, 6, 3, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(x - 5 * r, y); c.lineTo(x - 10 * r, y - 3); c.lineTo(x - 10 * r, y + 3); c.closePath(); c.fill();
    }
  },
  vulkan(c, zeit) {
    // Lava fließt den Kegel hinunter, ab und zu leuchtet der Krater auf
    c.globalCompositeOperation = 'lighter';
    c.setLineDash([6, 10]);
    c.lineDashOffset = -zeit * 30;
    c.strokeStyle = 'rgba(255,200,80,0.6)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(MITTE - 6, 878); c.quadraticCurveTo(MITTE - 24, 912, MITTE - 14, 942); c.quadraticCurveTo(MITTE - 6, 956, MITTE - 30, 962); c.stroke();
    c.setLineDash([]);
    const glut = Math.max(0, Math.sin(zeit * 0.9)) ** 6;
    if (glut > 0.02) leuchte(c, MITTE, 876, 70, '#ff5a1a', glut * 0.8);
    c.globalCompositeOperation = 'source-over';
  }
};

for (const id of Object.keys(THEMEN)) themaExtras(id);
