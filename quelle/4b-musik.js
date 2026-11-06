// =====================================================================
//  MUSIK
//  Jede Welt hat ein eigenes, komponiertes Stück: eine nahtlose Schleife aus
//  32 Takten (etwa 60 bis 90 Sekunden), Teil A, B, A, B mit Schluss.
//  Das Stück besteht aus Spuren (Flächen, Bass, Melodie, Arpeggio, leichte
//  Perkussion, volles Schlagzeug, Gegenstimme). Je nach Spielgeschehen werden
//  Spuren an Taktgrenzen weich ein- und ausgeblendet.
//  Alle Klänge werden live erzeugt (Web Audio), es gibt keine Tondateien.
// =====================================================================

// Melodien sind als Bewegungen relativ zum Akkord des Takts notiert (Tonleiterstufen):
// '0' Grundton, '2' Terz, '4' Quinte, '7' Oktave, 'x'/'y'/'z' = -1/-2/-3,
// '.' = Ton klingt weiter, '_' = Pause. Ein Zeichen = eine Sechzehntel, 16 pro Takt.
// Alle Stücke in Dur (oder dem fröhlichen Mixolydisch), mit Pausen in der Melodie,
// damit die Musik atmet. Teil 4 jeder Schleife ist ein ruhiges Zwischenspiel.
const LIEDER = {
  klassik: {
    name: 'Orbit-Fieber', bpm: 118, grund: 48, skala: [0, 2, 4, 5, 7, 9, 11],
    A: { akk: [0, 4, 5, 3, 0, 4, 3, 4], mot: [0, 1, 0, 2, 0, 1, 3, 5] },
    B: { akk: [3, 4, 2, 5, 3, 4, 1, 4], mot: [4, 6, 4, 7, 4, 6, 3, 5] },
    motive: ['4.4.2.0.2...4.__', '7...4.2.4...____', '2.2.0.x.0...____', '4.2.0.2.4.4.4.__', '7.7.9.7.4...2.__', '0.......____....', '9.7.4.__7.4.2.__', '4...2...0...____'],
    schluss: '0.......________',
    klang: { lead: 'weichquadrat', gegen: 'flöte', pad: 'weich', bass: 'warm', arp: 'pluck', perk: 'chip', schlag: 'chip' },
    bassArt: 'ganz', arp: [0, 2, 4, 7], arpTakt: 2
  },
  weltraum: {
    name: 'Sternenstation', bpm: 108, grund: 50, skala: [0, 2, 4, 5, 7, 9, 11],
    A: { akk: [0, 3, 0, 3, 5, 3, 4, 4], mot: [0, 1, 0, 2, 4, 1, 3, 5] },
    B: { akk: [3, 4, 2, 5, 3, 4, 0, 0], mot: [6, 7, 6, 3, 4, 1, 3, 5] },
    motive: ['4...7...6.4.____', '2...4...2.0.____', '4...7...9.7.____', '7.....6.4.......', '0.2.4.7.9...7.__', '4.......____....', '7.6.4.2.0...____', '2.4.2.0.x...0...'],
    schluss: '0.......________',
    klang: { lead: 'glocke', gegen: 'flöte', pad: 'weich', bass: 'warm', arp: 'pluck', perk: 'leicht', schlag: 'leicht' },
    bassArt: 'ganz', arp: [0, 4, 7, 9, 7, 4], arpTakt: 2, hall: 0.22
  },
  cyber: {
    name: 'Neonpuls', bpm: 116, grund: 45, skala: [0, 2, 4, 5, 7, 9, 11],
    A: { akk: [0, 4, 5, 3, 0, 4, 5, 3], mot: [0, 1, 0, 3, 0, 1, 2, 5] },
    B: { akk: [3, 4, 2, 5, 3, 4, 0, 4], mot: [4, 6, 4, 7, 4, 6, 2, 5] },
    motive: ['4.4.4.2.4.__7.__', '4.4.4.2.0...____', '7.7.6.4.6...4.__', '2.2.2.0.2...____', '0.2.4.0.2.4.7.__', '4...2...0...____', '9...7...4.2.4.__', '7.6.4.2.0.......'],
    schluss: '0.......________',
    klang: { lead: 'weichquadrat', gegen: 'glocke', pad: 'weich', bass: 'warm', arp: 'pluck', perk: 'pop', schlag: 'pop' },
    bassArt: 'puls', arp: [0, 2, 4, 7], arpTakt: 2, immerPerk: true
  },
  dschungel: {
    name: 'Tempelpfad', bpm: 104, grund: 55, skala: [0, 2, 4, 5, 7, 9, 10],
    A: { akk: [0, 6, 0, 3, 0, 6, 4, 0], mot: [0, 1, 0, 3, 0, 1, 2, 5] },
    B: { akk: [3, 3, 0, 0, 3, 6, 4, 4], mot: [4, 6, 4, 7, 4, 6, 2, 5] },
    motive: ['0.2.4.__4.2.0.__', '7.6.4.__2...____', '4.4.7.4.2.0.2.__', '0...2...0...____', '7.__7.9.7.4.____', '0.......____....', '4.2.4.7.4.2.0.__', '2...4...2...____'],
    schluss: '0.......________',
    klang: { lead: 'marimba', gegen: 'flöte', pad: 'weich', bass: 'warm', arp: 'marimba', perk: 'trommeln', schlag: 'trommeln' },
    bassArt: 'sync', arp: [0, 4, 2, 7], arpTakt: 2, immerPerk: true
  },
  wasser: {
    name: 'Atlantis', bpm: 96, grund: 53, skala: [0, 2, 4, 5, 7, 9, 11],
    A: { akk: [0, 5, 3, 4, 0, 5, 1, 4], mot: [0, 1, 0, 3, 0, 1, 2, 3] },
    B: { akk: [3, 4, 2, 5, 3, 4, 0, 0], mot: [4, 5, 4, 7, 4, 5, 2, 6] },
    motive: ['4.....2.4...____', '7.....6.4...____', '2.....0.2...____', '4.2.0.........__', '7.6.7.9.7...____', '4.6.4.2.0...____', '0...............', '2.4.2.0.x.0.____'],
    schluss: '0.......________',
    klang: { lead: 'glocke', gegen: 'flöte', pad: 'weich', bass: 'warm', arp: 'tropfen', perk: 'sanft', schlag: 'sanft' },
    bassArt: 'huepf', arp: [0, 2, 4, 7, 4, 2], arpTakt: 2, hall: 0.25
  },
  vulkan: {
    name: 'Glutkern', bpm: 124, grund: 50, skala: [0, 2, 4, 5, 7, 9, 11],
    A: { akk: [0, 4, 3, 4, 0, 4, 5, 4], mot: [0, 1, 0, 1, 2, 1, 3, 5] },
    B: { akk: [3, 4, 5, 3, 3, 4, 0, 0], mot: [4, 6, 4, 7, 4, 6, 3, 5] },
    motive: ['0.0.4.0.7.__4.__', '2.2.4.2.0...____', '4.4.7.4.9.7.4.__', '7...4...2...____', '7.9.7.4.7.9.7.__', '0.......____....', '4.4.4.7.4...2.__', '9.7.4.2.4...____'],
    schluss: '0.......________',
    klang: { lead: 'weichsaege', gegen: 'weichquadrat', pad: 'weich', bass: 'warm', arp: 'pluck', perk: 'pop', schlag: 'pop' },
    bassArt: 'puls', arp: [0, 7, 4, 7], arpTakt: 2, immerPerk: true
  }
};

// Varianten je Level einer Welt: Tonart, Melodie-Abwandlung, Grundausstattung, Tempo
const LIED_VARIANTEN = [
  { trans: 0, art: '', extra: 0, tempo: 1 },
  { trans: 2, art: 'umkehr', extra: 0, tempo: 1.02 },
  { trans: -3, art: 'synkope', extra: 1, tempo: 1.03 },
  { trans: 3, art: 'gegen', extra: 2, tempo: 1.05 }
];

// Welche Spuren in welcher Stufe spielen (0 ruhig, 1 lebhaft, 2 heiß, 3 Multiball)
const STUFEN_SPUREN = [
  { pad: 1, bass: 1, lead: 1, arp: 0, perk: 0, schlag: 0, gegen: 0 },
  { pad: 1, bass: 1, lead: 1, arp: 1, perk: 1, schlag: 0, gegen: 0 },
  { pad: 0.8, bass: 1, lead: 1, arp: 1, perk: 1, schlag: 1, gegen: 0 },
  { pad: 0.8, bass: 1, lead: 1, arp: 1, perk: 1, schlag: 1, gegen: 1 }
];
const SPUREN = ['pad', 'bass', 'lead', 'arp', 'perk', 'schlag', 'gegen'];
const SPUR_LAUT = { pad: 0.3, bass: 0.75, lead: 0.8, arp: 0.32, perk: 0.45, schlag: 0.35, gegen: 0.3 };

const musik = {
  uhr: null, lied: null, variante: null, welt: '', schritt: 0, naechste: 0,
  tempo: 1, stufe: 0, aktiv: 0, intens: 0, spuren: null, stoss: 0, zeitlupe: false,

  // Klangkette: Spuren -> Musik-Bus -> Filter (Zeitlupe) -> Ausgang, dazu ein Echo
  baue() {
    const c = ton.ctx;
    if (this.spuren || !c) return;
    this.filter = c.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 16000;
    this.filter.connect(ton.musikBus);
    this.echo = c.createDelay(1.5);
    this.echoZurueck = c.createGain(); this.echoZurueck.gain.value = 0.35;
    this.echoRein = c.createGain(); this.echoRein.gain.value = 0.12;
    this.filter.connect(this.echoRein).connect(this.echo);
    this.echo.connect(this.echoZurueck).connect(this.echo);
    this.echo.connect(ton.musikBus);
    this.duck = c.createGain();
    this.duck.connect(this.filter);
    this.spuren = {};
    for (const n of SPUREN) { const g = c.createGain(); g.gain.value = 0; g.connect(this.duck); this.spuren[n] = { g, ziel: 0, bis: 0 }; }
  },

  starte() {
    this.stoppe();
    if (!ton.ctx || !s) return;
    this.baue();
    const welt = s.level ? s.level.welt : 'klassik';
    this.lied = LIEDER[welt];
    const nr = s.level ? Number(s.level.id.slice(-1)) - 1 : 0;
    this.variante = LIED_VARIANTEN[nr] || LIED_VARIANTEN[0];
    this.schritt = 0;
    this.tempo = this.variante.tempo;
    this.stufe = 0;
    this.intens = 0; this.aktiv = 0;
    const jetzt = ton.ctx.currentTime;
    this.naechste = jetzt + 0.12;
    this.echo.delayTime.setValueAtTime(60 / this.lied.bpm * 0.75, jetzt);
    this.echoRein.gain.setValueAtTime(this.lied.hall || 0.12, jetzt);
    this.duck.gain.cancelScheduledValues(jetzt);
    this.duck.gain.setValueAtTime(1, jetzt);
    this.setzeSpuren(jetzt, 0.05);
    this.uhr = setInterval(() => this.takt(), 50);
  },
  stoppe() {
    if (this.uhr) clearInterval(this.uhr);
    this.uhr = null;
    if (this.spuren && ton.ctx) for (const n of SPUREN) { const sp = this.spuren[n]; sp.g.gain.cancelScheduledValues(ton.ctx.currentTime); sp.g.gain.setTargetAtTime(0, ton.ctx.currentTime, 0.15); sp.ziel = 0; sp.bis = ton.ctx.currentTime + 0.5; }
  },

  // Zielstufe aus dem Spielgeschehen der letzten Sekunden
  setzeSpuren(zeit, weich) {
    const plan = STUFEN_SPUREN[this.stufe];
    const v = this.variante;
    const ziele = {};
    for (const n of SPUREN) {
      let z = plan[n];
      if (n === 'arp' && v.extra >= 1) z = Math.max(z, 0.7);
      if (n === 'perk' && (v.extra >= 2 || this.lied.immerPerk)) z = Math.max(z, 0.6);
      if (n === 'gegen' && v.art === 'gegen') z = Math.max(z, 0.6);
      ziele[n] = z;
    }
    // Mehr Schichten = voller, aber nicht lauter: Gesamtenergie auf die der ruhigen Stufe ausgleichen
    const energie = zs => SPUREN.reduce((a, n) => a + (zs[n] * SPUR_LAUT[n]) ** 2, 0);
    const ausgleich = Math.sqrt(energie(STUFEN_SPUREN[0]) / Math.max(1e-6, energie(ziele)));
    for (const n of SPUREN) {
      const z = ziele[n];
      const sp = this.spuren[n];
      // bis: solange werden Noten noch geplant (während des Ausblendens)
      if (z > 0) sp.bis = Infinity;
      else sp.bis = sp.ziel > 0 || sp.bis === Infinity ? zeit + weich * 4 : Math.min(sp.bis, zeit + weich * 4);
      sp.ziel = z;
      sp.g.gain.cancelScheduledValues(zeit);
      sp.g.gain.setTargetAtTime(z * SPUR_LAUT[n] * ausgleich, zeit, weich);
    }
  },

  // Vom Spiel: Treffer und Schüsse erhöhen die Spannung
  aktion(gewicht) { this.aktiv += gewicht; },

  aktualisiere(dt) {
    if (!s) return;
    this.aktiv *= Math.exp(-dt / 4);   // über mehrere Sekunden gemittelt
    let tempoKugel = 0, n = 0;
    for (const b of s.welt.baelle) if (b.ort === 'tisch') { tempoKugel += Math.hypot(b.vx, b.vy); n++; }
    const roh = Math.min(1, this.aktiv / 7 + (n ? tempoKugel / n : 0) / 4000 + (s.kombo >= 2 ? 0.25 : 0));
    this.intens += (roh - this.intens) * Math.min(1, dt / 3);
  },

  takt() {
    if (!ton.ctx || ton.ctx.state !== 'running' || !s || s.phase !== 'lauf' || !$('fenster').hidden) {
      if (ton.ctx) this.naechste = ton.ctx.currentTime + 0.05;
      return;
    }
    const L = this.lied;
    const jetzt = ton.ctx.currentTime;
    if (this.naechste < jetzt) this.naechste = jetzt + 0.02;
    // Zeitlupe: weicher (Filter) und räumlicher (mehr Echo)
    const zl = s.effekt.zeitlupe > 0;
    if (zl !== this.zeitlupe) {
      this.zeitlupe = zl;
      this.filter.frequency.setTargetAtTime(zl ? 1400 : 16000, jetzt, 0.4);
      this.echoRein.gain.setTargetAtTime(zl ? 0.5 : (L.hall || 0.12), jetzt, 0.4);
    }
    while (this.naechste < jetzt + 0.25) {
      // Tempo nur sanft und begrenzt ändern (Tonhöhe bleibt gleich, weil alles live erzeugt wird)
      const ziel = this.variante.tempo * (this.stufe === 3 ? 1.04 : 1) * (zl ? 0.93 : 1);
      this.tempo += (begrenzt(ziel, 0.9, 1.1) - this.tempo) * 0.03;
      const dauer = 60 / L.bpm / 4 / this.tempo;
      const pos = this.schritt % 512;
      if (pos % 16 === 0) this.taktgrenze(this.naechste, dauer);
      this.spiele(pos, this.naechste, dauer);
      this.schritt++;
      this.naechste += dauer;
    }
  },

  // An jeder Taktgrenze: Stufe anpassen (mit Abstand nach oben und unten, damit nichts zappelt)
  taktgrenze(zeit, dauer) {
    const alt = this.stufe;
    let neu = alt;
    if (s.multiball) neu = 3;
    else {
      if (alt === 3) neu = 2;
      const hoch = [0.32, 0.62, 2], runter = [-1, 0.22, 0.48];
      if (neu < 2 && this.intens > hoch[neu]) neu++;
      else if (neu > 0 && this.intens < runter[neu]) neu--;
    }
    if (neu !== alt) { this.stufe = neu; this.setzeSpuren(zeit, dauer * 6); }
  },

  spiele(pos, t, d) {
    const L = this.lied, v = this.variante;
    const takt = Math.floor(pos / 16), i = pos % 16;
    const teil = Math.floor(takt / 8), im = takt % 8;
    const abschnitt = teil % 2 === 0 ? L.A : L.B;
    const akk = abschnitt.akk[im];
    const letzter = teil === 3 && im === 7;
    let kontur = letzter ? L.schluss : L.motive[abschnitt.mot[im]];
    const stufe = deg => { const n = L.skala.length; const o = Math.floor(deg / n); return L.grund + v.trans + L.skala[((deg % n) + n) % n] + 12 * o; };
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    const mild = m => { while (m > 81) m -= 12; return m; };   // nie schrill
    const luft = teil === 3 && im < 4;   // Zwischenspiel: Die Melodie macht Pause
    const aktiv = n => this.spuren[n].ziel > 0 || t < this.spuren[n].bis;
    const K = L.klang;

    // Flächen: ganzer Akkord pro Takt
    if (i === 0 && aktiv('pad')) for (const o of [0, 2, 4]) stimme(K.pad, hz(mild(stufe(akk + o) + 12)), t, d * 16, 0.05, this.spuren.pad.g);

    // Bass
    if (aktiv('bass')) {
      const g = this.spuren.bass.g;
      let b = stufe(akk) - 12;
      while (b < 40) b += 12;   // warm, aber nie dröhnend tief
      const art = this.stufe >= 2 && L.bassArt !== 'huepf' ? 'puls' : L.bassArt;
      if (art === 'ganz' && (i === 0 || i === 8)) stimme(K.bass, hz(i === 8 && im % 2 ? b + 7 : b), t, d * 7, 0.22, g);
      if (art === 'puls' && i % 2 === 0) stimme(K.bass, hz(i % 8 === 6 ? b + 12 : b), t, d * 1.6, 0.18, g);
      if (art === 'sync' && [0, 3, 6, 10, 12].includes(i)) stimme(K.bass, hz(i === 6 || i === 12 ? b + 7 : b), t, d * 2.5, 0.2, g);
      if (art === 'huepf' && [0, 6, 8, 14].includes(i)) stimme(K.bass, hz(i >= 8 ? b + 7 : b), t, d * 3, 0.22, g);
    }

    // Arpeggio
    if (aktiv('arp') && i % (luft ? L.arpTakt * 2 : L.arpTakt) === 0) {
      const k = (i / L.arpTakt) % L.arp.length;
      stimme(K.arp, hz(mild(stufe(akk + L.arp[k]) + 12)), t, d * L.arpTakt * 0.9, 0.06, this.spuren.arp.g);
    }

    // Melodie (mit Abwandlung je Level)
    if (v.art === 'synkope' && teil % 2 === 0) kontur = '_' + kontur.slice(0, 15);
    const zeichen = kontur[i];
    if (!luft && zeichen !== '.' && zeichen !== '_') {
      let o = WERT[zeichen];
      if (v.art === 'umkehr' && teil % 2 === 1) o = 7 - o;
      let lang = 1; while (i + lang < 16 && kontur[i + lang] === '.') lang++;
      const m = mild(stufe(akk + o) + 12);
      if (aktiv('lead')) stimme(K.lead, hz(m), t, d * lang * 0.95, 0.09, this.spuren.lead.g);
      if (aktiv('gegen')) stimme(K.gegen, hz(mild(stufe(akk + o + 2) + 12)), t + d * 0.02, d * lang * 0.9, 0.06, this.spuren.gegen.g);
    }

    // Perkussion und Schlagzeug
    if (aktiv('perk')) perkussion(K.perk, i, t, d, this.spuren.perk.g, false, im === 7);
    if (aktiv('schlag')) perkussion(K.schlag, i, t, d, this.spuren.schlag.g, true, im === 7);
  },

  // Kurz und weich leiser, damit wichtige Geräusche (Jackpot, Auftrag, Spezial) vorne stehen,
  // danach langsam zurück. Kommt ein zweites Ereignis, gilt das tiefere und längere.
  ducken(auf = 0.4, sek = 1.0) {
    if (!this.duck || !ton.ctx) return;
    const t = ton.ctx.currentTime;
    if (this.duckBis > t && this.duckAuf <= auf) { auf = this.duckAuf; }
    const bis = Math.max(this.duckBis || 0, t + sek);
    this.duckAuf = auf; this.duckBis = bis;
    this.duck.gain.cancelScheduledValues(t);
    this.duck.gain.setValueAtTime(this.duck.gain.value, t);
    this.duck.gain.setTargetAtTime(auf, t, 0.06);
    this.duck.gain.setTargetAtTime(1, bis, 0.45);
  },

  // Kurze Melodien für besondere Momente, in den Klängen der Welt
  motiv(stufenListe, abstand, laenge, akkordAmEnde) {
    if (!ton.ctx || !this.lied) return;
    this.baue();
    const L = this.lied, v = this.variante || LIED_VARIANTEN[0];
    const t0 = ton.ctx.currentTime + 0.05;
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    const stufe = deg => { const n = L.skala.length; const o = Math.floor(deg / n); return L.grund + v.trans + L.skala[((deg % n) + n) % n] + 12 * o; };
    stufenListe.forEach((deg, k) => {
      const lang = k === stufenListe.length - 1 ? laenge : abstand * 1.2;
      stimme(L.klang.lead, hz(Math.min(81, stufe(deg) + 12)), t0 + k * abstand, lang, 0.09, ton.musikBus);
      if (k % 2 === 0) stimme(L.klang.bass, hz(stufe(0) - 12), t0 + k * abstand, abstand * 2, 0.09, ton.musikBus);
    });
    const tEnde = t0 + (stufenListe.length - 1) * abstand;
    if (akkordAmEnde) for (const o of akkordAmEnde) stimme(L.klang.pad, hz(stufe(o) + 12), tEnde, laenge + 0.4, 0.05, ton.musikBus);
    perkTreffer(L.klang.schlag, tEnde);
  },
  sieg() { this.stoppe(); this.motiv([0, 2, 4, 7, 4, 7, 9, 11], 0.11, 1.2, [7, 9, 11]); },
  kugelWeg() { this.ducken(0.25, 1.4); this.motiv([4, 2, 1, 0], 0.13, 0.5); },
  ende() { this.stoppe(); this.motiv([4, 2, 3, 1, 2, 0], 0.17, 1.2, [0, 2, 4]); }
};
// Ein Schlag zum Abschluss eines Motivs
function perkTreffer(stil, t) {
  if (!ton.ctx) return;
  const art = { pop: 'clap', trommeln: 'conga', sanft: 'rim', chip: 'chipsnare' }[stil] || 'shaker';
  trommel(art, t, 0.4, ton.musikBus);
}
const WERT = { '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, x: -1, y: -2, z: -3 };

// --------------------------- Instrumente ---------------------------

function huelle(c, ziel, t, dauer, laut, an = 0.005, form = 'exp') {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(laut, t + an);
  if (form === 'halten') { g.gain.setValueAtTime(laut, t + Math.max(an, dauer - 0.08)); g.gain.linearRampToValueAtTime(0.0001, t + dauer + 0.12); }
  else g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(an + 0.02, dauer));
  g.connect(ziel);
  return g;
}
function osz(c, art, f, t, ende, ziel, verstimmt = 0) {
  const o = c.createOscillator();
  o.type = art; o.frequency.setValueAtTime(f, t);
  if (verstimmt) o.detune.setValueAtTime(verstimmt, t);
  o.connect(ziel); o.start(t); o.stop(ende + 0.2);
  return o;
}

function stimme(art, f, t, dauer, laut, ziel) {
  const c = ton.ctx;
  if (!c) return;
  const ende = t + dauer;
  let g, fl;
  switch (art) {
    case 'quadrat': g = huelle(c, ziel, t, dauer, laut * 0.7, 0.005, 'halten'); osz(c, 'square', f, t, ende, g); break;
    case 'weichquadrat':
      // Rechteck durch einen Tiefpass: hell, aber nicht spitz
      fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = Math.min(4000, f * 3); fl.Q.value = 0.5; fl.connect(ziel);
      g = huelle(c, fl, t, dauer, laut * 0.6, 0.012, 'halten'); osz(c, 'square', f, t, ende, g); osz(c, 'triangle', f, t, ende, g, 4); break;
    case 'flöte': g = huelle(c, ziel, t, dauer, laut * 0.8, 0.03, 'halten'); osz(c, 'sine', f, t, ende, g); osz(c, 'triangle', f, t, ende, huelle(c, ziel, t, dauer, laut * 0.2, 0.04, 'halten')); break;
    case 'glocke':
      g = huelle(c, ziel, t, Math.max(dauer, 0.7), laut, 0.004); osz(c, 'sine', f, t, ende + 0.7, g);
      osz(c, 'sine', f * 3, t, t + 0.3, huelle(c, ziel, t, 0.3, laut * 0.18, 0.003)); break;
    case 'weichsaege':
      fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = Math.min(3200, f * 2.5); fl.Q.value = 0.4; fl.connect(ziel);
      g = huelle(c, fl, t, dauer, laut * 0.55, 0.015, 'halten'); osz(c, 'sawtooth', f, t, ende, g, -5); osz(c, 'triangle', f, t, ende, g, 5); break;
    case 'quadratkurz': g = huelle(c, ziel, t, Math.min(dauer, 0.12), laut * 0.6); osz(c, 'square', f, t, ende, g); break;
    case 'saege':
      fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(f * 6, t); fl.frequency.exponentialRampToValueAtTime(f * 2, ende); fl.connect(ziel);
      g = huelle(c, fl, t, dauer, laut * 0.6, 0.01, 'halten'); osz(c, 'sawtooth', f, t, ende, g, -6); osz(c, 'sawtooth', f, t, ende, g, 6); break;
    case 'glas':
      g = huelle(c, ziel, t, Math.max(dauer, 0.6), laut); osz(c, 'sine', f, t, ende + 0.6, g);
      osz(c, 'sine', f * 2.76, t, t + 0.25, huelle(c, ziel, t, 0.25, laut * 0.25)); break;
    case 'marimba':
      g = huelle(c, ziel, t, 0.45, laut * 1.2, 0.003); osz(c, 'sine', f, t, t + 0.45, g);
      osz(c, 'sine', f * 4, t, t + 0.08, huelle(c, ziel, t, 0.08, laut * 0.4, 0.002)); break;
    case 'tropfen':
      g = huelle(c, ziel, t, 0.3, laut, 0.003); const o = osz(c, 'sine', f, t, t + 0.3, g); o.frequency.exponentialRampToValueAtTime(f * 1.06, t + 0.3); break;
    case 'pluck': g = huelle(c, ziel, t, Math.min(0.3, dauer + 0.1), laut, 0.003); osz(c, 'triangle', f, t, ende + 0.1, g); break;
    case 'weich': g = huelle(c, ziel, t, dauer, laut, 0.25, 'halten'); osz(c, 'triangle', f, t, ende, g, -6); osz(c, 'sine', f, t, ende, g, 6); break;
    case 'schwebe':
      fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1400; fl.connect(ziel);
      g = huelle(c, fl, t, dauer, laut, 0.35, 'halten'); osz(c, 'sawtooth', f, t, ende, g, -9); osz(c, 'sawtooth', f, t, ende, g, 9); osz(c, 'sine', f / 2, t, ende, g); break;
    case 'synthwave':
      fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 2200; fl.connect(ziel);
      g = huelle(c, fl, t, dauer, laut * 0.8, 0.12, 'halten'); osz(c, 'sawtooth', f, t, ende, g, -12); osz(c, 'sawtooth', f, t, ende, g, 12); break;
    case 'dunkel':
      fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 900; fl.connect(ziel);
      g = huelle(c, fl, t, dauer, laut, 0.2, 'halten'); osz(c, 'sawtooth', f / 2, t, ende, g, -7); osz(c, 'square', f / 2, t, ende, g, 7); break;
    case 'holzflöte': g = huelle(c, ziel, t, dauer, laut * 0.8, 0.12, 'halten'); osz(c, 'sine', f, t, ende, g); osz(c, 'triangle', f * 2, t, ende, huelle(c, ziel, t, dauer, laut * 0.15, 0.2, 'halten')); break;
    case 'sub': g = huelle(c, ziel, t, dauer, laut * 1.2, 0.01, 'halten'); osz(c, 'sine', f, t, ende, g); break;
    case 'dreieck': g = huelle(c, ziel, t, dauer, laut, 0.005, 'halten'); osz(c, 'triangle', f, t, ende, g); break;
    case 'warm':
      // runder, warmer Bass ohne Dröhnen
      fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 900; fl.connect(ziel);
      g = huelle(c, fl, t, dauer, laut, 0.012, 'halten'); osz(c, 'triangle', f, t, ende, g); osz(c, 'sine', f, t, ende, g); break;
    case 'saegebass':
      fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(f * 8, t); fl.frequency.exponentialRampToValueAtTime(f * 1.5, t + Math.min(dauer, 0.2)); fl.connect(ziel);
      g = huelle(c, fl, t, dauer, laut * 0.9, 0.005); osz(c, 'sawtooth', f, t, ende, g); osz(c, 'square', f / 2, t, ende, g); break;
    default: g = huelle(c, ziel, t, dauer, laut); osz(c, 'triangle', f, t, ende, g);
  }
}

// Schlaginstrumente
function trommel(art, t, laut, ziel) {
  const c = ton.ctx;
  const rausch = (dauer, typ, freq, l, q = 1) => {
    const q1 = c.createBufferSource(); q1.buffer = ton.rauschen;
    const f = c.createBiquadFilter(); f.type = typ; f.frequency.value = freq; f.Q.value = q;
    q1.connect(f).connect(huelle(c, ziel, t, dauer, l, 0.002)); q1.start(t); q1.stop(t + dauer + 0.05);
  };
  const ton1 = (von, bis, dauer, l, welle = 'sine') => { const g = huelle(c, ziel, t, dauer, l, 0.002); const o = osz(c, welle, von, t, t + dauer, g); o.frequency.exponentialRampToValueAtTime(bis, t + dauer); };
  switch (art) {
    case 'kick': ton1(120, 55, 0.2, laut * 0.8); break;
    case 'kickhart': ton1(180, 38, 0.38, laut * 1.2); rausch(0.02, 'highpass', 3000, laut * 0.3); break;
    case 'snare': rausch(0.16, 'bandpass', 1800, laut * 0.7, 0.8); ton1(220, 160, 0.08, laut * 0.3); break;
    case 'clap': rausch(0.12, 'bandpass', 1500, laut * 0.6, 1.2); break;
    case 'hat': rausch(0.04, 'highpass', 8000, laut * 0.35); break;
    case 'shaker': rausch(0.06, 'highpass', 6000, laut * 0.22); break;
    case 'rim': ton1(900, 800, 0.03, laut * 0.4, 'triangle'); break;
    case 'conga': ton1(360, 280, 0.12, laut * 0.6); break;
    case 'congatief': ton1(250, 190, 0.15, laut * 0.6); break;
    case 'tom': ton1(140, 80, 0.3, laut); break;
    case 'chipkick': ton1(110, 55, 0.12, laut, 'square'); break;
    case 'chipsnare': rausch(0.07, 'highpass', 2500, laut * 0.5); break;
  }
}

function perkussion(stil, i, t, d, ziel, voll, fill) {
  const L = 1;
  const auf = (n, art, l) => { if (i === n) trommel(art, t, l * L, ziel); };
  switch (stil) {
    case 'chip':
      if (!voll) { if (i % 8 === 0) trommel('chipkick', t, 0.5, ziel); if (i % 4 === 2) trommel('hat', t, 0.4, ziel); }
      else { if (i % 8 === 4) trommel('chipsnare', t, 0.6, ziel); if (fill && i >= 12) trommel('chipsnare', t, 0.4, ziel); }
      break;
    case 'pop':
      // leichter Pop-Rhythmus: weicher Kick, Shaker, später Handclaps
      if (!voll) { if (i === 0 || i === 8) trommel('kick', t, 0.5, ziel); if (i % 4 === 2) trommel('shaker', t, 0.5, ziel); }
      else { auf(4, 'clap', 0.45); auf(12, 'clap', 0.45); if (i % 4 === 2) trommel('hat', t, 0.25, ziel); if (fill && i >= 13) trommel('rim', t, 0.5, ziel); }
      break;
    case 'leicht':
      if (!voll) { auf(0, 'kick', 0.4); if (i % 4 === 2) trommel('shaker', t, 0.6, ziel); }
      else { auf(4, 'rim', 0.8); auf(12, 'clap', 0.35); if (i % 2 === 1) trommel('hat', t, 0.25, ziel); }
      break;
    case 'elektro':
      if (voll) { if (i % 4 === 0) trommel('kick', t, 0.5, ziel); auf(4, 'clap', 0.5); auf(12, 'clap', 0.5); if (i % 2 === 1) trommel('hat', t, 0.4, ziel); }
      break;
    case 'synthwave':
      if (!voll) { if (i % 8 === 0) trommel('kick', t, 0.7, ziel); if (i % 2 === 0) trommel('hat', t, 0.3, ziel); }
      else { auf(4, 'snare', 0.8); auf(12, 'snare', 0.8); if (i % 4 === 0) trommel('kick', t, 0.6, ziel); if (i % 2 === 1) trommel('hat', t, 0.35, ziel); if (fill && i >= 12) trommel('tom', t, 0.6, ziel); }
      break;
    case 'trommeln':
      if (!voll) { if ([0, 3, 6, 10].includes(i)) trommel(i % 2 ? 'conga' : 'congatief', t, 0.5, ziel); if (i % 4 === 2) trommel('shaker', t, 0.4, ziel); }
      else { if ([2, 5, 9, 13].includes(i)) trommel('conga', t, 0.45, ziel); auf(12, 'rim', 0.4); if (fill && i >= 14) trommel('congatief', t, 0.5, ziel); }
      break;
    case 'sanft':
      if (!voll) { auf(0, 'kick', 0.3); auf(10, 'rim', 0.5); }
      else { auf(8, 'kick', 0.3); if (i % 4 === 2) trommel('shaker', t, 0.5, ziel); auf(4, 'rim', 0.5); auf(12, 'rim', 0.5); }
      break;
    case 'hart':
      if (!voll) { if (i % 4 === 0) trommel('kickhart', t, 0.7, ziel); if (i % 2 === 0) trommel('hat', t, 0.3, ziel); }
      else { auf(4, 'snare', 0.9); auf(12, 'snare', 0.9); if (i % 2 === 1) trommel('hat', t, 0.4, ziel); if (i === 14) trommel('kickhart', t, 0.6, ziel); if (fill && i >= 8 && i % 2 === 0) trommel('tom', t, 0.8, ziel); }
      break;
  }
}
