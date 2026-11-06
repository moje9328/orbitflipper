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

// Aussehen der Welten und Level: siehe 4c-design.js

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
