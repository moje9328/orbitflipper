'use strict';
// =====================================================================
//  ORBITFLIPPER – Einstellungen, Speichern und Töne
// =====================================================================

const $ = id => document.getElementById(id);
const SPIEL_ADRESSE = 'https://moje9328.github.io/orbitflipper/';
const SPEICHER = 'orbitflipper';
const begrenzt = (w, a, b) => Math.max(a, Math.min(b, w));
const zahl = n => Math.round(n).toLocaleString(Sprache.aktuell === 'en' ? 'en-US' : 'de-DE');
const TEST = location.search.includes('test');

// Schwierigkeit: Neigung des Tisches und wie lange der Ball nach dem Abschuss geschützt ist
const STUFEN = {
  leicht: { name: uebersetze('Leicht'), schwerkraft: 1100, schutz: 15, text: uebersetze('Der Tisch ist flacher, und nach jedem Abschuss bist du 15 Sekunden lang geschützt.') },
  normal: { name: uebersetze('Normal'), schwerkraft: 1250, schutz: 8, text: uebersetze('Wie ein echter Automat in der Spielhalle. 8 Sekunden Schutz nach dem Abschuss.') },
  schwer: { name: uebersetze('Schwer'), schwerkraft: 1420, schutz: 3, text: uebersetze('Steiler Tisch, schnelle Kugel und kaum Schutz. Nur für Profis.') }
};
const STUFEN_NAMEN = Object.keys(STUFEN);
const BAELLE = 3;

// Aufträge: Einer ist immer aktiv. Sind alle geschafft, beginnt die Liste schwerer von vorn.
const AUFTRAEGE = [
  { name: uebersetze('RAMPEN-RAUSCH'), text: uebersetze('Fahr {z} Rampen'), art: 'rampe', ziel: 3 },
  { name: uebersetze('BUMPER-STURM'), text: uebersetze('Triff {z}-mal die Bumper'), art: 'bumper', ziel: 25 },
  { name: uebersetze('WIRBELWIND'), text: uebersetze('Dreh den Spinner {z}-mal'), art: 'spin', ziel: 30 },
  { name: uebersetze('ZIELÜBUNG'), text: uebersetze('Räum die Fallziele {z}-mal ab'), art: 'fallbank', ziel: 2 },
  { name: uebersetze('UMLAUFBAHN'), text: uebersetze('Schaff {z} Orbits'), art: 'orbit', ziel: 3 },
  { name: uebersetze('WURMLOCH'), text: uebersetze('Versenk die Kugel {z}-mal im Wurmloch'), art: 'wurmloch', ziel: 2 },
  { name: uebersetze('KOMBO-PILOT'), text: uebersetze('Schaff eine {z}er-Kombo'), art: 'kombo', ziel: 3 },
  { name: uebersetze('SCHILDWACHE'), text: uebersetze('Triff alle 3 Schild-Ziele'), art: 'schild', ziel: 1 },
  { name: uebersetze('REAKTOR'), text: uebersetze('Starte den Multiball'), art: 'multiball', ziel: 1 }
];
const RAENGE = ['KADETT', 'PILOT', 'KAPITÄN', 'KOMMANDANT', 'ADMIRAL', 'STERNENLEGENDE'].map(r => uebersetze(r));

// Preise der Kapsel, der Reihe nach
const KAPSEL_PREISE = [
  { name: uebersetze('ZEITLUPE'), art: 'zeitlupe' },
  { name: uebersetze('25.000 PUNKTE'), art: 'punkte' },
  { name: uebersetze('SCHILD'), art: 'schild' },
  { name: uebersetze('DOPPELTE PUNKTE'), art: 'doppelt' },
  { name: uebersetze('BONUS +1X'), art: 'multi' },
  { name: uebersetze('LOCK BEREIT'), art: 'lock' }
];

// --------------------------- Speichern ---------------------------

// Bestwerte gibt es je Tisch (Klassik oder Level) und je Stufe: bestwerte[tisch][stufe]
function ladeDaten() {
  const leer = { name: '', stufe: 'normal', ton: true, musik: true, freunde: [], rekorde: {}, bestwerte: {}, sterne: {}, spiele: 0, listeTisch: 'klassik', lautMusik: 30, lautEffekte: 80, tonStand: 2 };
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
  if (d.musik === false) { d.lautMusik = 0; d.musik = true; }   // früher: Musik aus
  // Neue Abmischung: Wer die alten Grundwerte nie verändert hat, bekommt die neuen (Musik leiser)
  if (!(roh && roh.tonStand >= 2)) { if (d.lautMusik === 70) d.lautMusik = 30; if (d.lautEffekte === 85) d.lautEffekte = 80; d.tonStand = 2; }
  for (const k of ['lautMusik', 'lautEffekte']) d[k] = Number.isFinite(d[k]) ? begrenzt(Math.round(d[k]), 0, 100) : leer[k];
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
      // Zwei getrennte Wege mit eigener Lautstärke: Effekte (haupt) und Musik.
      // Jeder Weg hat einen eigenen Begrenzer, am Ende sitzt ein harter Begrenzer gegen Übersteuern.
      const c = this.ctx;
      const begrenzer = (schwelle, knie, verhaeltnis, an, aus) => {
        const k = c.createDynamicsCompressor();
        k.threshold.value = schwelle; k.knee.value = knie; k.ratio.value = verhaeltnis; k.attack.value = an; k.release.value = aus;
        return k;
      };
      const ende = begrenzer(-3, 0, 20, 0.001, 0.1);
      ende.connect(c.destination);
      const effektKomp = begrenzer(-10, 6, 4, 0.002, 0.12);
      const musikKomp = begrenzer(-24, 10, 3, 0.01, 0.3);
      effektKomp.connect(ende);
      musikKomp.connect(ende);
      this.haupt = c.createGain();
      this.musikBus = c.createGain();
      this.haupt.connect(effektKomp);
      this.musikBus.connect(musikKomp);
      this.lautstaerke();
      const n = this.ctx.sampleRate * 0.5;
      this.rauschen = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const k = this.rauschen.getChannelData(0);
      for (let i = 0; i < n; i++) k[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  },
  bereit() { return daten.ton && this.ctx && this.ctx.state === 'running'; },
  lautstaerke() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const an = daten.ton ? 1 : 0;
    this.haupt.gain.setTargetAtTime(an * 2.6 * Math.pow(daten.lautEffekte / 100, 1.5), t, 0.03);
    this.musikBus.gain.setTargetAtTime(an * 0.8 * Math.pow(daten.lautMusik / 100, 1.5), t, 0.03);
  },
  pause() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {}); },

  // Gegen Lärm im Multiball: Gleiche Geräusche kurz hintereinander werden ausgedünnt,
  // und es klingen nie zu viele gleichzeitig. Wichtige Geräusche (prio) kommen immer durch.
  stimmen: 0, zuletzt: {}, prio: false,
  oft(name, ms) {
    const jetzt = performance.now();
    if (jetzt - (this.zuletzt[name] || 0) < ms) return false;
    this.zuletzt[name] = jetzt;
    return true;
  },
  wichtig(f) { this.prio = true; try { f(); } finally { this.prio = false; } if (typeof musik !== 'undefined') musik.ducken(0.3, 1.3); },
  zuViel() { return !this.prio && this.stimmen > 26; },
  gezaehlt(knoten) { this.stimmen++; knoten.onended = () => { this.stimmen--; }; },
  piep(frequenz, dauer, laut = 0.05, art = 'square', start = 0, ziel = 0) {
    if (!this.bereit() || this.zuViel()) return;
    if (this.prio) laut *= 1.25;
    const t = this.ctx.currentTime + start;
    const osc = this.ctx.createOscillator(), g = this.ctx.createGain();
    // Die Welt färbt die Effekt-Töne: andere Wellenform, andere Tonlage
    if (art === 'square') art = this.thema.welle;
    const h = this.thema.hoch;
    osc.type = art;
    osc.frequency.setValueAtTime(frequenz * h, t);
    if (ziel) osc.frequency.exponentialRampToValueAtTime(ziel * h, t + dauer);
    g.gain.setValueAtTime(laut, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dauer);
    osc.connect(g).connect(this.haupt);
    this.gezaehlt(osc);
    osc.start(t); osc.stop(t + dauer + 0.02);
  },
  knall(dauer, laut, filter = 1800, start = 0) {
    if (!this.bereit() || this.zuViel()) return;
    const t = this.ctx.currentTime + start;
    const q = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    q.buffer = this.rauschen;
    f.type = 'lowpass'; f.frequency.value = filter;
    g.gain.setValueAtTime(laut, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dauer);
    q.connect(f).connect(g).connect(this.haupt);
    this.gezaehlt(q);
    q.start(t); q.stop(t + dauer + 0.02);
  },
  flipper() { this.knall(0.06, 0.12, 900); this.piep(110, 0.05, 0.04, 'square'); },
  bumper() {
    if (!this.oft('bumper', 45)) return;
    const k = this.thema;
    if (k.holz) { this.piep(700 + Math.random() * 80, 0.09, 0.08, 'sine'); this.piep(1400, 0.04, 0.03, 'sine'); this.knall(0.03, 0.1, 4500); return; }
    if (k.blub) { this.piep(300, 0.14, 0.07, 'sine', 0, 900); this.piep(500, 0.08, 0.03, 'sine', 0.05, 1200); return; }
    if (k.grollen) { this.knall(0.25, 0.14, 300); this.piep(90, 0.2, 0.07, 'sawtooth', 0, 50); return; }
    this.piep(520 + Math.random() * 60, 0.12, 0.06, 'square', 0, 260); this.knall(0.05, 0.08, 3000);
  },
  schleuder() {
    if (!this.oft('schleuder', 50)) return;
    if (this.thema.holz) { this.knall(0.05, 0.14, 3500); this.piep(260, 0.06, 0.05, 'sine'); return; }
    if (this.thema.blub) { this.piep(220, 0.12, 0.06, 'sine', 0, 600); return; }
    this.piep(300, 0.08, 0.06, 'sawtooth', 0, 140); this.knall(0.05, 0.1, this.thema.grollen ? 800 : 2400);
  },
  wand(w) { if (w > 300 && this.oft('wand', 60)) this.knall(0.035, Math.min(0.08, w / 12000), 1200); },
  fallziel() { if (!this.oft('fallziel', 40)) return; this.piep(200, 0.1, 0.06, 'square', 0, 90); this.knall(0.08, 0.1, 700); },
  stehziel() { if (!this.oft('stehziel', 40)) return; this.piep(990, 0.07, 0.05, 'square'); },
  roll() { if (!this.oft('roll', 50)) return; this.piep(1320, 0.05, 0.04, 'triangle'); this.piep(1760, 0.06, 0.04, 'triangle', 0.05); },
  spin() { if (!this.oft('spin', 35)) return; this.piep(1600 + Math.random() * 300, 0.025, 0.025, 'square'); },
  rampeRauf() { this.piep(200, 0.45, 0.04, 'sawtooth', 0, 700); },
  rampeRunter() { this.piep(500, 0.35, 0.035, 'sawtooth', 0, 150); },
  rampe() { if (!this.oft('rampe', 150)) return; [660, 880, 1320].forEach((f, i) => this.piep(f, 0.1, 0.06, 'square', i * 0.06)); if (typeof musik !== 'undefined') musik.ducken(0.6, 0.6); },
  loch() { if (!this.oft('loch', 60)) return; this.piep(400, 0.35, 0.06, 'sine', 0, 60); this.knall(0.15, 0.06, 500); },
  auswurf() { if (!this.oft('auswurf', 60)) return; this.knall(0.1, 0.12, 900); this.piep(150, 0.12, 0.06, 'square', 0, 400); },
  tunnel() { this.piep(90, 0.8, 0.05, 'sawtooth', 0, 400); },
  kolben(z) { this.piep(80 + z * 200, 0.04, 0.02, 'triangle'); },
  abschuss(z) { this.knall(0.12, 0.12 + z * 0.08, 1500); this.piep(120, 0.2, 0.05, 'sawtooth', 0, 500 + z * 600); },
  orbit() { if (!this.oft('orbit', 150)) return; [523, 784, 1047, 1568].forEach((f, i) => this.piep(f, 0.09, 0.055, 'triangle', i * 0.05)); if (typeof musik !== 'undefined') musik.ducken(0.6, 0.6); },
  kombo(n) { if (!this.oft('kombo', 120)) return; this.wichtig(() => { for (let i = 0; i < Math.min(n, 6); i++) this.piep(660 * Math.pow(1.122, i * 2), 0.07, 0.045, 'square', i * 0.045); }); },
  auftrag() { this.wichtig(() => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.piep(f, 0.12, 0.055, 'square', i * 0.08)); }); },
  multiball() { this.wichtig(() => { [262, 330, 392, 523, 392, 523, 659, 784, 1047].forEach((f, i) => this.piep(f, 0.11, 0.06, 'square', i * 0.07)); }); },
  jackpot() { this.wichtig(() => { [784, 988, 1175, 1568].forEach((f, i) => { this.piep(f, 0.3, 0.05, 'square', i * 0.09); this.piep(f / 2, 0.3, 0.04, 'triangle', i * 0.09); }); }); },
  extra() { this.wichtig(() => { [392, 523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this.piep(f, 0.14, 0.05, 'triangle', i * 0.07)); }); },
  verloren() { [392, 330, 262, 196].forEach((f, i) => this.piep(f, 0.2, 0.06, 'square', 0.1 + i * 0.13)); },
  gerettet() { this.wichtig(() => { [784, 1047, 784, 1047].forEach((f, i) => this.piep(f, 0.08, 0.05, 'triangle', i * 0.08)); }); },
  spezial() { this.wichtig(() => { this.piep(300, 0.5, 0.05, 'sine', 0, 1200); this.piep(450, 0.5, 0.03, 'triangle', 0.05, 1800); }); },
  klick() { this.piep(880, 0.05, 0.04, 'square'); }
};
