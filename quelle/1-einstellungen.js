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

// Bestwerte gibt es je Tisch (Klassik oder Level) und je Stufe: bestwerte[tisch][stufe]
function ladeDaten() {
  const leer = { name: '', stufe: 'normal', ton: true, musik: true, freunde: [], rekorde: {}, bestwerte: {}, sterne: {}, spiele: 0, listeTisch: 'klassik' };
  let roh = null;
  try { roh = JSON.parse(localStorage.getItem(SPEICHER)); } catch (error) {}
  const d = Object.assign(leer, roh && typeof roh === 'object' ? roh : {});
  if (!Object.prototype.hasOwnProperty.call(STUFEN, d.stufe)) d.stufe = 'normal';
  if (!Array.isArray(d.freunde)) d.freunde = [];
  if (!d.rekorde || typeof d.rekorde !== 'object') d.rekorde = {};
  if (!d.bestwerte || typeof d.bestwerte !== 'object') d.bestwerte = {};
  if (!d.sterne || typeof d.sterne !== 'object') d.sterne = {};
  // Alte Rekorde (vor den Welten) gehören zum Klassik-Tisch
  if (!d.bestwerte.klassik) d.bestwerte.klassik = {};
  for (const stufe of STUFEN_NAMEN) {
    if (Number.isFinite(d.rekorde[stufe])) d.bestwerte.klassik[stufe] = Math.max(d.bestwerte.klassik[stufe] || 0, d.rekorde[stufe]);
  }
  delete d.rekorde;
  for (const f of d.freunde) if (!f.tisch) f.tisch = 'klassik';
  return d;
}
const daten = ladeDaten();
function bestwert(tisch, stufe = daten.stufe) { return (daten.bestwerte[tisch] && daten.bestwerte[tisch][stufe]) || 0; }
function speichere() {
  try { localStorage.setItem(SPEICHER, JSON.stringify(daten)); } catch (error) {}
}

// --------------------------- Ton ---------------------------
// Alle Geräusche werden live erzeugt, es gibt keine Tondateien.

const ton = {
  ctx: null, haupt: null, rauschen: null,
  thema: { welle: 'square', hoch: 1 },     // Klangfarbe der aktuellen Welt
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
    // Die Welt färbt die Effekt-Töne: andere Wellenform, andere Tonlage
    if (art === 'square' && !this.roh) art = this.thema.welle;
    const h = this.roh ? 1 : this.thema.hoch;
    osc.type = art;
    osc.frequency.setValueAtTime(frequenz * h, t);
    if (ziel) osc.frequency.exponentialRampToValueAtTime(ziel * h, t + dauer);
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
  bumper() {
    const k = this.thema;
    if (k.holz) { this.piep(700 + Math.random() * 80, 0.09, 0.08, 'sine'); this.piep(1400, 0.04, 0.03, 'sine'); this.knall(0.03, 0.1, 4500); return; }
    if (k.blub) { this.piep(300, 0.14, 0.07, 'sine', 0, 900); this.piep(500, 0.08, 0.03, 'sine', 0.05, 1200); return; }
    if (k.grollen) { this.knall(0.25, 0.14, 300); this.piep(90, 0.2, 0.07, 'sawtooth', 0, 50); return; }
    this.piep(520 + Math.random() * 60, 0.12, 0.06, 'square', 0, 260); this.knall(0.05, 0.08, 3000);
  },
  schleuder() {
    if (this.thema.holz) { this.knall(0.05, 0.14, 3500); this.piep(260, 0.06, 0.05, 'sine'); return; }
    if (this.thema.blub) { this.piep(220, 0.12, 0.06, 'sine', 0, 600); return; }
    this.piep(300, 0.08, 0.06, 'sawtooth', 0, 140); this.knall(0.05, 0.1, this.thema.grollen ? 800 : 2400);
  },
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

// =====================================================================
//  MUSIK: Ein kleiner Komponist. Jede Welt hat Tonleiter, Tempo und Klangfarben.
//  Daraus entstehen immer neue Stücke: Akkordfolge, Begleitung und eine eigene
//  Melodie (Intro, Melodie A, Melodie B, Variation). Etwa alle 30 bis 40 Sekunden
//  beginnt ein neues Stück, und jedes Level hat seine eigenen.
// =====================================================================

const FOLGEN = [[0, 5, 3, 4], [0, 3, 4, 4], [5, 3, 0, 4], [0, 4, 5, 3], [0, 2, 5, 4], [5, 4, 3, 4], [0, 5, 1, 4], [3, 4, 0, 0], [0, 6, 5, 4], [0, 3, 0, 4]];
const RHYTHMEN = [
  [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0],
  [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
  [1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
  [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
  [1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0]
];
const ARPS = [[0, 2, 4, 7], [7, 4, 2, 0], [0, 4, 2, 4, 7, 4, 2, 4], [0, 7, 2, 4], [0, 2, 4, 2]];

function textZahl(text) { let h = 2166136261; for (const z of text) h = Math.imul(h ^ z.charCodeAt(0), 16777619); return h >>> 0; }

// Ein Stück erfinden. Gleiche Saat ergibt immer dasselbe Stück.
function erfindeStueck(saat) {
  const z = zufall(saat);
  const w = n => Math.floor(z() * n);
  const folge = FOLGEN[w(FOLGEN.length)];
  const arp = ARPS[w(ARPS.length)];
  const tempo = 0.9 + z() * 0.22;
  // Eine Phrase: 4 Takte zu 16 Schritten, im Takt über dem jeweiligen Akkord
  const phrase = (rhythmen) => {
    const noten = new Array(64).fill(null);
    let ton = folge[0] + 7;
    for (let takt = 0; takt < 4; takt++) {
      const r = rhythmen[takt % rhythmen.length];
      const akk = folge[takt];
      for (let i = 0; i < 16; i++) {
        if (!r[i]) continue;
        if (i === 0 || (i === 8 && z() < 0.5)) ton = akk + [0, 2, 4, 7][w(4)];   // auf Akkordtönen beginnen
        else ton += [-2, -1, -1, 1, 1, 2, 0][w(7)];
        ton = Math.max(akk - 2, Math.min(akk + 11, ton));
        noten[takt * 16 + i] = ton;
      }
    }
    noten[63] = null; noten[60] = folge[3] === 4 ? 4 : 0;   // Ende auf einem ruhigen Ton
    return noten;
  };
  const rA = [RHYTHMEN[w(6)], RHYTHMEN[w(6)]];
  const rB = [RHYTHMEN[w(6)], RHYTHMEN[w(6)]];
  const A = phrase(rA), B = phrase(rB);
  const A2 = A.slice(0, 48).concat(phrase(rA).slice(48));   // Variation: anderer Schluss
  return { folge, arp, tempo, teile: [null, A, B, A2], bassSprung: z() < 0.5 };
}

const musik = {
  schritt: 0, naechste: 0, uhr: null, stueck: null, stueckNr: 0, stueckStart: 0, quelle: '',
  starte() {
    this.stoppe();
    if (!ton.ctx) return;
    this.naechste = ton.ctx.currentTime + 0.1;
    this.schritt = 0;
    this.stueck = null;
    this.uhr = setInterval(() => this.takt(), 60);
  },
  stoppe() { if (this.uhr) clearInterval(this.uhr); this.uhr = null; },
  neuesStueck() {
    // Saat aus Tisch und Stücknummer: jedes Level hat seine eigene Reihe von Stücken
    if (this.quelle !== s.tisch) { this.quelle = s.tisch; this.stueckNr = Math.floor(Math.random() * 4); }
    else this.stueckNr++;
    this.stueck = erfindeStueck(textZahl(s.tisch + ':' + this.stueckNr));
    this.stueckStart = this.schritt;
  },
  takt() {
    if (!ton.ctx || ton.ctx.state !== 'running' || !s || s.phase !== 'lauf' || !$('fenster').hidden) {
      if (ton.ctx) this.naechste = ton.ctx.currentTime + 0.05;
      return;
    }
    const m = s.thema.musik;
    if (!this.stueck || this.quelle !== s.tisch || this.schritt - this.stueckStart >= 256) this.neuesStueck();
    const jetzt = ton.ctx.currentTime;
    const dauer = m.takt / this.stueck.tempo * (s.multiball ? 0.8 : 1);
    if (this.naechste < jetzt) this.naechste = jetzt + 0.02;
    while (this.naechste < jetzt + 0.2) {
      if (daten.musik) this.note(this.schritt - this.stueckStart, this.naechste - jetzt, dauer, m);
      this.schritt++;
      this.naechste += dauer;
      if (this.schritt - this.stueckStart >= 256) this.neuesStueck();
    }
  },
  note(k, start, dauer, m) {
    const st = this.stueck;
    const hz = n => 440 * Math.pow(2, (n - 69) / 12);
    // Tonleiterstufe -> Midi-Note
    const stufe = d => { const L = m.skala.length; const o = Math.floor(d / L); return m.grund + m.skala[((d % L) + L) % L] + 12 * o; };
    const mild = n => { while (n > 86) n -= 12; return n; };   // nie schrill
    const teil = Math.floor(k / 64), i = k % 64;
    const akk = st.folge[Math.floor(i / 16)];
    ton.roh = true;   // Musik nicht von der Effekt-Klangfarbe verändern lassen
    // Bass
    if (i % 4 === 0) ton.piep(hz(stufe(akk) - 12 + (st.bassSprung && i % 8 === 4 ? 12 : 0)), dauer * 3, 0.03, m.bassWelle, start);
    // Begleitung (Arpeggio), im Intro etwas leiser
    if (i % 2 === 0) {
      const a = st.arp[(i / 2) % st.arp.length];
      ton.piep(hz(mild(stufe(akk + a) + 12)), dauer * (m.kurz ? 0.5 : 0.9), m.arpLaut * (teil === 0 ? 0.7 : 1), m.arpWelle, start);
    }
    // Melodie
    const mel = st.teile[teil];
    if (mel && mel[i] != null) {
      let lang = 1; while (lang < 4 && i + lang < 64 && mel[i + lang] == null) lang++;
      const n = hz(mild(stufe(mel[i]) + 12));
      ton.piep(n, dauer * lang * (m.kurz ? 0.6 : 0.95), m.leadLaut, m.leadWelle, start);
      if (m.hall) ton.piep(n, dauer * lang, m.leadLaut * 0.35, m.leadWelle, start + dauer * 1.5);
    }
    // Schlagzeug (im Multiball immer)
    if (m.trommel || s.multiball) {
      if (i % 8 === 0) ton.piep(70, 0.15, 0.06, 'sine', start, 40);
      if (i % 8 === 4) ton.knall(0.06, 0.05, 2500, start);
      if (m.hihat && i % 2 === 1) ton.knall(0.02, 0.015, 9000, start);
    }
    ton.roh = false;
  }
};
