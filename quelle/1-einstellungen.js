'use strict';
// =====================================================================
//  ORBITFLIPPER – Einstellungen, Speichern und Töne
// =====================================================================

const $ = id => document.getElementById(id);
const SPIEL_ADRESSE = 'https://moje9328.github.io/orbitflipper/';
const SPEICHER = 'orbitflipper';
const begrenzt = (w, a, b) => Math.max(a, Math.min(b, w));
const zahl = n => Math.round(n).toLocaleString('de-DE');
const TEST = location.search.includes('test');

// Schwierigkeit: Neigung des Tisches und wie lange der Ball nach dem Abschuss geschützt ist
const STUFEN = {
  leicht: { name: 'Leicht', schwerkraft: 1100, schutz: 15, text: 'Der Tisch ist flacher, und nach jedem Abschuss bist du 15 Sekunden lang geschützt.' },
  normal: { name: 'Normal', schwerkraft: 1250, schutz: 8, text: 'Wie ein echter Automat in der Spielhalle. 8 Sekunden Schutz nach dem Abschuss.' },
  schwer: { name: 'Schwer', schwerkraft: 1420, schutz: 3, text: 'Steiler Tisch, schnelle Kugel und kaum Schutz. Nur für Profis.' }
};
const STUFEN_NAMEN = Object.keys(STUFEN);
const BAELLE = 3;

// Aufträge: Einer ist immer aktiv. Sind alle geschafft, beginnt die Liste schwerer von vorn.
const AUFTRAEGE = [
  { name: 'RAMPEN-RAUSCH', text: 'Fahr {z} Rampen', art: 'rampe', ziel: 3 },
  { name: 'BUMPER-STURM', text: 'Triff {z}-mal die Bumper', art: 'bumper', ziel: 25 },
  { name: 'WIRBELWIND', text: 'Dreh den Spinner {z}-mal', art: 'spin', ziel: 30 },
  { name: 'ZIELÜBUNG', text: 'Räum die Fallziele {z}-mal ab', art: 'fallbank', ziel: 2 },
  { name: 'UMLAUFBAHN', text: 'Schaff {z} Orbits', art: 'orbit', ziel: 3 },
  { name: 'WURMLOCH', text: 'Versenk die Kugel {z}-mal im Wurmloch', art: 'wurmloch', ziel: 2 },
  { name: 'KOMBO-PILOT', text: 'Schaff eine {z}er-Kombo', art: 'kombo', ziel: 3 },
  { name: 'SCHILDWACHE', text: 'Triff alle 3 Schild-Ziele', art: 'schild', ziel: 1 },
  { name: 'REAKTOR', text: 'Starte den Multiball', art: 'multiball', ziel: 1 }
];
const RAENGE = ['KADETT', 'PILOT', 'KAPITÄN', 'KOMMANDANT', 'ADMIRAL', 'STERNENLEGENDE'];

// Preise der Kapsel, der Reihe nach
const KAPSEL_PREISE = [
  { name: 'ZEITLUPE', art: 'zeitlupe' },
  { name: '25.000 PUNKTE', art: 'punkte' },
  { name: 'SCHILD', art: 'schild' },
  { name: 'DOPPELTE PUNKTE', art: 'doppelt' },
  { name: 'BONUS +1X', art: 'multi' },
  { name: 'LOCK BEREIT', art: 'lock' }
];

// --------------------------- Speichern ---------------------------

function ladeDaten() {
  const leer = { name: '', stufe: 'normal', ton: true, musik: true, freunde: [], rekorde: {}, spiele: 0 };
  let roh = null;
  try { roh = JSON.parse(localStorage.getItem(SPEICHER)); } catch (error) {}
  const d = Object.assign(leer, roh && typeof roh === 'object' ? roh : {});
  if (!Object.prototype.hasOwnProperty.call(STUFEN, d.stufe)) d.stufe = 'normal';
  if (!Array.isArray(d.freunde)) d.freunde = [];
  if (!d.rekorde || typeof d.rekorde !== 'object') d.rekorde = {};
  for (const stufe of STUFEN_NAMEN) if (!Number.isFinite(d.rekorde[stufe])) d.rekorde[stufe] = 0;
  return d;
}
const daten = ladeDaten();
function speichere() {
  try { localStorage.setItem(SPEICHER, JSON.stringify(daten)); } catch (error) {}
}

// --------------------------- Ton ---------------------------
// Alle Geräusche werden live erzeugt, es gibt keine Tondateien.

const ton = {
  ctx: null, haupt: null, rauschen: null,
  an() {
    if (!this.ctx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioClass) return;
      this.ctx = new AudioClass();
      this.haupt = this.ctx.createGain();
      this.haupt.gain.value = 0.8;
      const komp = this.ctx.createDynamicsCompressor();
      this.haupt.connect(komp).connect(this.ctx.destination);
      const n = this.ctx.sampleRate * 0.5;
      this.rauschen = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const k = this.rauschen.getChannelData(0);
      for (let i = 0; i < n; i++) k[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  },
  bereit() { return daten.ton && this.ctx && this.ctx.state === 'running'; },
  piep(frequenz, dauer, laut = 0.05, art = 'square', start = 0, ziel = 0) {
    if (!this.bereit()) return;
    const t = this.ctx.currentTime + start;
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    osc.type = art;
    osc.frequency.setValueAtTime(frequenz, t);
    if (ziel) osc.frequency.exponentialRampToValueAtTime(ziel, t + dauer);
    g.gain.setValueAtTime(laut, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dauer);
    osc.connect(g).connect(this.haupt);
    osc.start(t); osc.stop(t + dauer + 0.02);
  },
  knall(dauer, laut, filter = 1800, start = 0) {
    if (!this.bereit()) return;
    const t = this.ctx.currentTime + start;
    const q = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    q.buffer = this.rauschen;
    f.type = 'lowpass'; f.frequency.value = filter;
    g.gain.setValueAtTime(laut, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dauer);
    q.connect(f).connect(g).connect(this.haupt);
    q.start(t); q.stop(t + dauer + 0.02);
  },
  flipper() { this.knall(0.06, 0.12, 900); this.piep(110, 0.05, 0.04, 'square'); },
  bumper() { this.piep(520 + Math.random() * 60, 0.12, 0.06, 'square', 0, 260); this.knall(0.05, 0.08, 3000); },
  schleuder() { this.piep(300, 0.08, 0.06, 'sawtooth', 0, 140); this.knall(0.05, 0.1, 2400); },
  wand(w) { if (w > 300) this.knall(0.035, Math.min(0.08, w / 12000), 1200); },
  fallziel() { this.piep(200, 0.1, 0.06, 'square', 0, 90); this.knall(0.08, 0.1, 700); },
  stehziel() { this.piep(990, 0.07, 0.05, 'square'); },
  roll() { this.piep(1320, 0.05, 0.04, 'triangle'); this.piep(1760, 0.06, 0.04, 'triangle', 0.05); },
  spin() { this.piep(1600 + Math.random() * 300, 0.025, 0.025, 'square'); },
  rampeRauf() { this.piep(200, 0.45, 0.04, 'sawtooth', 0, 700); },
  rampeRunter() { this.piep(500, 0.35, 0.035, 'sawtooth', 0, 150); },
  rampe() { [660, 880, 1320].forEach((f, i) => this.piep(f, 0.1, 0.05, 'square', i * 0.06)); },
  loch() { this.piep(400, 0.35, 0.06, 'sine', 0, 60); this.knall(0.15, 0.06, 500); },
  auswurf() { this.knall(0.1, 0.12, 900); this.piep(150, 0.12, 0.06, 'square', 0, 400); },
  tunnel() { this.piep(90, 0.8, 0.05, 'sawtooth', 0, 400); },
  kolben(z) { this.piep(80 + z * 200, 0.04, 0.02, 'triangle'); },
  abschuss(z) { this.knall(0.12, 0.12 + z * 0.08, 1500); this.piep(120, 0.2, 0.05, 'sawtooth', 0, 500 + z * 600); },
  orbit() { [523, 784, 1047, 1568].forEach((f, i) => this.piep(f, 0.09, 0.045, 'triangle', i * 0.05)); },
  kombo(n) { for (let i = 0; i < Math.min(n, 6); i++) this.piep(660 * Math.pow(1.122, i * 2), 0.07, 0.045, 'square', i * 0.045); },
  auftrag() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.piep(f, 0.12, 0.055, 'square', i * 0.08)); },
  multiball() { [262, 330, 392, 523, 392, 523, 659, 784, 1047].forEach((f, i) => this.piep(f, 0.11, 0.06, 'square', i * 0.07)); },
  jackpot() { [784, 988, 1175, 1568].forEach((f, i) => { this.piep(f, 0.3, 0.05, 'square', i * 0.09); this.piep(f / 2, 0.3, 0.04, 'triangle', i * 0.09); }); },
  extra() { [392, 523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this.piep(f, 0.14, 0.05, 'triangle', i * 0.07)); },
  verloren() { [392, 330, 262, 196].forEach((f, i) => this.piep(f, 0.2, 0.06, 'square', 0.1 + i * 0.13)); },
  gerettet() { [784, 1047, 784, 1047].forEach((f, i) => this.piep(f, 0.08, 0.05, 'triangle', i * 0.08)); },
  spezial() { this.piep(300, 0.5, 0.05, 'sine', 0, 1200); this.piep(450, 0.5, 0.03, 'triangle', 0.05, 1800); },
  klick() { this.piep(880, 0.05, 0.04, 'square'); }
};

// Leise Synth-Begleitung im Hintergrund
const musik = {
  schritt: 0, naechste: 0, uhr: null,
  bass: [38, 38, 41, 43, 36, 36, 43, 41],
  arp: [62, 65, 69, 72, 69, 65, 62, 57],
  starte() {
    this.stoppe();
    if (!ton.ctx) return;
    this.naechste = ton.ctx.currentTime + 0.1;
    this.uhr = setInterval(() => this.takt(), 60);
  },
  stoppe() { if (this.uhr) clearInterval(this.uhr); this.uhr = null; },
  takt() {
    if (!ton.ctx || ton.ctx.state !== 'running' || !s || s.phase !== 'lauf' || !$('fenster').hidden) {
      if (ton.ctx) this.naechste = ton.ctx.currentTime + 0.05;
      return;
    }
    const jetzt = ton.ctx.currentTime;
    const dauer = s.multiball ? 0.105 : 0.13;
    if (this.naechste < jetzt) this.naechste = jetzt + 0.02;
    while (this.naechste < jetzt + 0.2) {
      if (daten.musik) this.note(this.schritt, this.naechste - jetzt, dauer);
      this.schritt++;
      this.naechste += dauer;
    }
  },
  note(nr, start, dauer) {
    const hz = n => 440 * Math.pow(2, (n - 69) / 12);
    const b = this.bass[Math.floor(nr / 16) % this.bass.length];
    if (nr % 4 === 0) ton.piep(hz(b), dauer * 3, 0.03, 'triangle', start);
    if (nr % 2 === 0) ton.piep(hz(this.arp[(nr / 2) % 8] + (b - 38)), dauer * 0.9, 0.008, 'square', start);
  }
};
