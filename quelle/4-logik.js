// =====================================================================
//  SPIELLOGIK
//  Punkte, Bälle, Aufträge, Kombos, Multiball und Spezialfähigkeiten.
//  Die Physik meldet Treffer an "regeln", hier wird entschieden, was passiert.
// =====================================================================

let s = null;       // der ganze Spielstand
let ballNummer = 0;

function neuerBall(x, y) {
  return { id: ++ballNummer, x, y, vx: 0, vy: 0, ort: 'tisch', in: new Set(), hoehe: 0, spur: [], ruhig: 0, lochSperre: 0, orbitStart: null, imSpiel: false,
    beiStoss(w, t) { if (t.art === 'seg' && !t.kick && w > 300) ton.wand(w); } };
}

function neuesSpiel() {
  const stufe = STUFEN[daten.stufe];
  PH.schwerkraft = stufe.schwerkraft;
  const T = baueTisch();
  s = {
    T, welt: T.welt, stufe: daten.stufe, phase: 'lauf',
    punkte: 0, ballNr: 1, extraBaelle: 0,
    multi: 1, bonus: 0, kombo: 0, letzterSchuss: -99, letzteArt: '',
    auftrag: 0, runde: 0, stand: 0, rang: 0, auftraegeGeschafft: 0,
    lockBereit: false, gesperrt: 0, multiball: false, jackpot: 50000, jackpots: 0,
    effekt: { schild: 0, doppelt: 0, zeitlupe: 0 },
    schutz: 0, kapselPreis: 0, spinGesamt: 0, spinFuerZeitlupe: 0,
    skill: -1, skillZeit: 0, kolbenHalten: false, kolbenZug: 0, autoSchuss: 0,
    meldung: null, meldungen: [], schrift: [], teilchen: [], wellen: [], wackeln: 0,
    bonusAnzeige: null, wartet: 0, warteAktion: null,
    statistik: { rampen: 0, orbits: 0, bumper: 0, loecher: 0, multibaelle: 0, jackpots: 0, maxKombo: 0, rettungen: 0, ausserhalb: 0 },
    zeit: 0, neuerRekord: false, fallbankZeit: 0
  };
  baueAuftrag();
  ballInBahn(false);
  melde('ORBITFLIPPER', 'Halten zum Spannen, loslassen zum Abschießen', 3);
}

// --------------------------- Hilfen ---------------------------

function punkte(n, x, y, farbe) {
  const wert = Math.round(n * (s.effekt.doppelt > 0 ? 2 : 1));
  s.punkte += wert;
  if (x != null) s.schrift.push({ x, y, text: zahl(wert), farbe: farbe || '#7ef9ff', zeit: 0, dauer: 1.0 });
  return wert;
}
function bonusDazu(n) { s.bonus += n; }
function melde(titel, text = '', dauer = 2.2, farbe = '#7ef9ff') {
  s.meldungen.push({ titel, text, dauer, farbe });
  if (!s.meldung) naechsteMeldung();
}
function naechsteMeldung() {
  const m = s.meldungen.shift();
  s.meldung = m ? Object.assign({ zeit: 0 }, m) : null;
}
function funken(x, y, farbe, anzahl = 12, tempo = 260) {
  for (let i = 0; i < anzahl; i++) {
    const w = Math.random() * Math.PI * 2, v = tempo * (0.3 + Math.random() * 0.9);
    s.teilchen.push({ x, y, vx: Math.cos(w) * v, vy: Math.sin(w) * v, leben: 0.35 + Math.random() * 0.45, zeit: 0, farbe, groesse: 1.5 + Math.random() * 2.5 });
  }
  if (s.teilchen.length > 500) s.teilchen.splice(0, s.teilchen.length - 500);
}
function welle(x, y, farbe, r = 60) { s.wellen.push({ x, y, farbe, r, zeit: 0 }); }
function aktiveBaelle() { return s.welt.baelle.filter(b => b.ort !== 'weg'); }

// --------------------------- Aufträge ---------------------------

function auftragJetzt() { return AUFTRAEGE[s.auftrag % AUFTRAEGE.length]; }
function auftragZiel() {
  const a = auftragJetzt();
  if (a.art === 'kombo') return a.ziel + s.runde;
  if (a.art === 'schild' || a.art === 'multiball') return 1;
  return Math.ceil(a.ziel * (1 + s.runde * 0.5));
}
function auftragText() { return auftragJetzt().text.replace('{z}', auftragZiel()); }
function baueAuftrag() { s.stand = 0; }

function fortschritt(art, menge = 1, wert) {
  const a = auftragJetzt();
  if (a.art !== art) return;
  if (art === 'kombo') s.stand = Math.max(s.stand, wert);
  else s.stand += menge;
  if (s.stand >= auftragZiel()) auftragGeschafft();
}

function auftragGeschafft() {
  const a = auftragJetzt();
  s.auftraegeGeschafft++;
  const preis = 25000 * s.auftraegeGeschafft;
  punkte(preis);
  bonusDazu(10000);
  ton.auftrag();
  s.wackeln = 0.4;
  const alterRang = s.rang;
  s.rang = Math.min(RAENGE.length - 1, Math.floor(s.auftraegeGeschafft / 2));
  melde('AUFTRAG GESCHAFFT', a.name + ' · +' + zahl(preis * (s.effekt.doppelt > 0 ? 2 : 1)), 2.6, '#ffe46b');
  if (s.rang > alterRang) melde('NEUER RANG', RAENGE[s.rang], 2.2, '#ff7bf2');
  if (s.auftraegeGeschafft % 3 === 0) {
    s.extraBaelle++;
    ton.extra();
    melde('EXTRABALL', 'Du bekommst eine Kugel mehr', 2.6, '#7dff9a');
  }
  s.auftrag++;
  if (s.auftrag % AUFTRAEGE.length === 0) s.runde++;
  baueAuftrag();
  melde('NEUER AUFTRAG', auftragText(), 2.4);
  for (let i = 0; i < 40; i++) funken(MITTE, 420, i % 2 ? '#ffe46b' : '#7ef9ff', 1, 500);
}

// --------------------------- Spezialfähigkeiten ---------------------------

function spezial(art, sekunden) {
  s.effekt[art] = Math.max(s.effekt[art], sekunden);
  ton.spezial();
  const namen = { schild: ['SCHILD AN', 'Verlorene Kugeln kommen zurück'], doppelt: ['DOPPELTE PUNKTE', 'Alles zählt doppelt'], zeitlupe: ['ZEITLUPE', 'Die Zeit läuft langsamer'] };
  melde(namen[art][0], namen[art][1] + ' (' + sekunden + ' s)', 2.2, '#ff7bf2');
}

function kombiSchuss(art, x, y) {
  if (s.welt.zeit - s.letzterSchuss < 5 && s.letzteArt !== '') s.kombo++;
  else s.kombo = 1;
  s.letzterSchuss = s.welt.zeit;
  s.letzteArt = art;
  if (s.kombo >= 2) {
    const p = punkte(5000 * s.kombo, x, y - 22, '#ffe46b');
    ton.kombo(s.kombo);
    melde('KOMBO X' + s.kombo, '+' + zahl(p), 1.4, '#ffe46b');
    s.statistik.maxKombo = Math.max(s.statistik.maxKombo, s.kombo);
    fortschritt('kombo', 0, s.kombo);
  }
}

// --------------------------- Treffer ---------------------------

const regeln = {
  bumper(bu, b) {
    bu.treffer++;
    s.statistik.bumper++;
    punkte(s.multiball ? 300 : 100, bu.x, bu.y - 30, '#b48cff');
    bonusDazu(50);
    ton.bumper();
    funken(b.x, b.y, '#b48cff', 10, 300);
    welle(bu.x, bu.y, '#9b6bff', 50);
    fortschritt('bumper');
  },
  schleuder(sl, b) {
    punkte(10, b.x, b.y - 18, '#7ef9ff');
    ton.schleuder();
    funken(b.x, b.y, '#7ef9ff', 8, 240);
  },
  fallziel(z, b) {
    if (z.unten) return;
    z.unten = true; z.t.aktiv = false; z.blitz = 1;
    punkte(500, z.x, z.y - 20, '#ffe46b');
    bonusDazu(250);
    ton.fallziel();
    funken(z.x, z.y, '#ffe46b', 14, 280);
    if (s.T.fallziele.every(f => f.unten)) {
      punkte(5000);
      melde('WURMLOCH OFFEN', 'Schieß in die Mitte!', 2, '#7dff9a');
      s.fallbankZeit = 25;
      fortschritt('fallbank');
    }
  },
  stehziel(z, b) {
    z.blitz = 1;
    punkte(z.an ? 500 : 1000, z.x, z.y - 18, '#ff7bf2');
    ton.stehziel();
    funken(z.x, z.y, '#ff7bf2', 8, 200);
    if (!z.an) {
      z.an = true;
      if (s.T.stehziele.every(x => x.an)) {
        s.T.stehziele.forEach(x => { x.an = false; x.blitz = 1; });
        spezial('schild', 20);
        punkte(10000);
        fortschritt('schild');
      }
    }
  },
  rollbahn(r, b) {
    r.blitz = 1;
    ton.roll();
    if (s.skill >= 0 && s.T.roll[s.skill] === r && s.welt.zeit - s.skillZeit < 5) {
      s.skill = -1;
      const p = punkte(20000, r.x, r.y + 30, '#ffe46b');
      melde('SKILL SHOT', '+' + zahl(p), 2, '#ffe46b');
      ton.jackpot();
    }
    s.skill = -1;
    if (r.an) { punkte(200, r.x, r.y + 24); return; }
    r.an = true;
    punkte(1000, r.x, r.y + 24);
    if (s.T.roll.every(x => x.an)) {
      s.T.roll.forEach(x => { x.an = false; x.blitz = 1; });
      s.multi = Math.min(6, s.multi + 1);
      spezial('doppelt', 20);
      melde('O-R-B KOMPLETT', 'Bonus jetzt ' + s.multi + 'x', 2, '#7ef9ff');
    }
  },
  spinner(b, k) {
    const sp = s.T.spinner;
    const v = Math.hypot(b.vx, b.vy);
    sp.tempo = Math.min(70, sp.tempo + v * 0.035);
    b.vx *= 0.97; b.vy *= 0.97;
  },
  spinnerHalb() {
    s.statistik.spins = (s.statistik.spins || 0) + 1;
    punkte(s.multiball ? 75 : 25);
    bonusDazu(10);
    ton.spin();
    s.spinFuerZeitlupe++;
    fortschritt('spin');
    if (s.spinFuerZeitlupe >= 40) { s.spinFuerZeitlupe = 0; spezial('zeitlupe', 8); }
  },
  orbit(seite, b) {
    s.statistik.orbits++;
    const p = punkte(4000, seite === 'links' ? 60 : 450, 380, '#7ef9ff');
    bonusDazu(1000);
    ton.orbit();
    melde('ORBIT', '+' + zahl(p), 1.2);
    kombiSchuss('orbit', seite === 'links' ? 80 : 430, 380);
    fortschritt('orbit');
  },
  rampe(ra, b) {
    ra.blitz = 1;
    s.statistik.rampen++;
    ton.rampe();
    const [ex, ey] = ra.bahn.ort(ra.bahn.L);
    if (s.multiball) {
      const p = punkte(s.jackpot, ex, ey - 40, '#ffe46b');
      s.jackpots++; s.statistik.jackpots++;
      s.jackpot += 25000;
      ton.jackpot();
      s.wackeln = 0.5;
      melde('JACKPOT', '+' + zahl(p), 2, '#ffe46b');
      for (let i = 0; i < 30; i++) funken(ex, ey - 40, i % 2 ? '#ffe46b' : '#ff7bf2', 1, 520);
    } else {
      punkte(5000, ex, ey - 40, ra.farbe === 'cyan' ? '#7ef9ff' : '#d08cff');
      if (!s.lockBereit && s.gesperrt < 2) {
        s.lockBereit = true;
        melde('LOCK BEREIT', 'Schieß in den Reaktor rechts', 2, '#ff7bf2');
      }
    }
    bonusDazu(2000);
    kombiSchuss('rampe', ex, ey - 40);
    fortschritt('rampe');
  },
  innenbahn(seite, b) { punkte(250, b.x, b.y - 20); },
  aussenbahn(seite, b) { punkte(500, b.x, b.y - 20, '#ff6b8b'); },
  abgeschossen(b) {
    if (b.imSpiel) return;
    b.imSpiel = true;
    if (!s.multiball && s.schutz <= 0) s.schutz = STUFEN[s.stufe].schutz;
  },

  // Ein Ball rollt über ein Loch
  lochNahe(l, b) {
    if (b.ort !== 'tisch' || s.welt.zeit < b.lochSperre) return;
    const v = Math.hypot(b.vx, b.vy);
    if (v > 1500) return;
    b.ort = 'loch';
    b.x = l.x; b.y = l.y; b.vx = 0; b.vy = 0;
    b.in.clear();
    l.blitz = 1;
    ton.loch();
    welle(l.x, l.y, '#7dff9a', 46);
    funken(l.x, l.y, '#7dff9a', 14, 200);
    s.statistik.loecher++;
    if (l.name === 'wurmloch') {
      punkte(10000, l.x, l.y - 26, '#7dff9a');
      bonusDazu(3000);
      kombiSchuss('wurmloch', l.x, l.y - 30);
      fortschritt('wurmloch');
      melde('WURMLOCH', 'Ab durch den Tunnel!', 1.4, '#7dff9a');
      l.schlange.push({ b, zeit: 0.5, was: 'tunnel' });
    } else if (l.name === 'kapsel') {
      l.schlange.push({ b, zeit: 1.1, was: 'kapsel' });
    } else if (l.name === 'reaktor') {
      l.schlange.push({ b, zeit: 1.0, was: 'reaktor' });
    }
  }
};

// Was ein Loch mit einem gefangenen Ball macht, wenn seine Wartezeit vorbei ist
function lochFertig(l, eintrag) {
  const b = eintrag.b;
  if (eintrag.was === 'auswurf') {
    // Kugel kam aus dem Wurmloch-Tunnel in der Kapsel an
    auswerfen(l, b);
    stelleFallzieleAuf();
    return;
  }
  if (eintrag.was === 'tunnel') {
    b.ort = 'tunnel'; b.s = 0; b.sv = 420; b.bahn = { bahn: s.T.tunnel };
    ton.tunnel();
    return;
  }
  if (eintrag.was === 'kapsel') {
    const preis = KAPSEL_PREISE[s.kapselPreis % KAPSEL_PREISE.length];
    s.kapselPreis++;
    punkte(3000, l.x, l.y - 26, '#ffe46b');
    if (preis.art === 'punkte') punkte(25000);
    else if (preis.art === 'multi') s.multi = Math.min(6, s.multi + 1);
    else if (preis.art === 'lock') s.lockBereit = s.gesperrt < 2;
    else spezial(preis.art, preis.art === 'zeitlupe' ? 8 : 20);
    if (!['schild', 'doppelt', 'zeitlupe'].includes(preis.art)) melde('KAPSEL', preis.name, 1.8, '#ffe46b');
  }
  if (eintrag.was === 'reaktor') {
    if (!s.multiball && s.lockBereit) {
      s.gesperrt++;
      s.lockBereit = false;
      punkte(15000, l.x, l.y - 26, '#ff7bf2');
      if (s.gesperrt >= 2) {
        starteMultiball(l, b);
        return;
      }
      // Ball bleibt im Reaktor, ein neuer kommt in die Abschussbahn
      b.ort = 'weg';
      ton.multiball();
      melde('KUGEL GESPERRT', 'Noch eine für den Multiball', 2, '#ff7bf2');
      ballInBahn(true);
      return;
    }
    punkte(s.multiball ? 25000 : 5000, l.x, l.y - 26, '#ff7bf2');
  }
  auswerfen(l, b);
}

function auswerfen(l, b) {
  b.ort = 'tisch';
  b.x = l.x; b.y = l.y;
  b.vx = l.aus[0] + (Math.random() - 0.5) * 40; b.vy = l.aus[1];
  b.lochSperre = s.welt.zeit + 0.7;
  ton.auswurf();
  funken(l.x, l.y, '#7ef9ff', 10, 220);
}

function starteMultiball(l, b) {
  s.multiball = true;
  s.gesperrt = 0;
  s.jackpot = 50000;
  s.statistik.multibaelle++;
  ton.multiball();
  s.wackeln = 0.6;
  melde('MULTIBALL', 'Rampen bringen Jackpots!', 3, '#ff7bf2');
  fortschritt('multiball');
  auswerfen(l, b);
  s.schutz = 12;
  ballInBahn(true, 0.8);
  ballInBahn(true, 2.2);
}

// Neue Kugel in die Abschussbahn legen. auto: schießt sie selbst ab.
function ballInBahn(auto, verzoegerung = 0) {
  const lege = () => {
    // Liegt schon eine Kugel in der Abschussbahn, kurz warten
    if (s.welt.baelle.some(x => x.ort === 'tisch' && x.x > SCHUSS.innen && x.y > 600)) { setzeSpaeter(0.6, lege); return; }
    const b = neuerBall(SCHUSS.x, SCHUSS.kolbenY - PH.ballR - 4);
    s.welt.baelle.push(b);
    if (auto) b.autoSchuss = 0.7;
    else { s.skill = Math.floor(Math.random() * 3); }
  };
  if (verzoegerung > 0) setzeSpaeter(verzoegerung, lege); else lege();
}

const spaeter = [];
function setzeSpaeter(sek, f) { spaeter.push({ sek, f }); }

function kugelImKolben() {
  return s.welt.baelle.find(b => b.ort === 'tisch' && b.x > SCHUSS.innen && b.y > SCHUSS.kolbenY - 70);
}

// Kolben loslassen
function feuere(zug) {
  const b = kugelImKolben();
  ton.abschuss(zug);
  s.T.kolben.zugAnim = zug;
  if (b) {
    b.vy = -(700 + 1700 * zug);
    b.vx = 0;
    s.skillZeit = s.welt.zeit;
  }
}

// --------------------------- Ball verloren ---------------------------

function ballRaus(b) {
  b.ort = 'weg';
  const rest = aktiveBaelle().length;
  // Schutz: Kugel kommt zurück
  if ((s.schutz > 0 || s.effekt.schild > 0) && !s.multiball) {
    ton.gerettet();
    melde('KUGEL GERETTET', 'Weiter geht\'s!', 1.6, '#7dff9a');
    s.schutz = 0;
    ballInBahn(true, 0.5);
    return;
  }
  if (s.multiball) {
    if (s.schutz > 0) { ballInBahn(true, 0.3); return; }
    if (rest <= 1) {
      s.multiball = false;
      melde('MULTIBALL VORBEI', s.jackpots ? s.jackpots + ' Jackpots!' : 'Nächstes Mal mehr Jackpots', 2, '#b48cff');
      s.jackpots = 0;
    }
    if (rest >= 1) return;
  }
  if (rest > 0) return;
  // letzte Kugel weg: Bonus zählen
  ton.verloren();
  s.kombo = 0;
  const bonus = s.bonus * s.multi;
  s.bonusAnzeige = { bonus: s.bonus, multi: s.multi, zeit: 0 };
  s.punkte += bonus;
  s.bonus = 0;
  s.effekt = { schild: 0, doppelt: 0, zeitlupe: 0 };
  s.welt.zeitlupe = 1;
  s.wartet = 2.6;
  s.warteAktion = () => {
    s.bonusAnzeige = null;
    s.multi = 1;
    if (s.extraBaelle > 0) {
      s.extraBaelle--;
      melde('EXTRABALL', 'Gleiche Kugel noch einmal', 2, '#7dff9a');
      ballInBahn(false);
    } else if (s.ballNr < BAELLE) {
      s.ballNr++;
      melde('KUGEL ' + s.ballNr, s.ballNr === BAELLE ? 'Die letzte Kugel!' : auftragText(), 2);
      ballInBahn(false);
    } else {
      spielEnde();
    }
  };
}

// --------------------------- Takt der Spiellogik ---------------------------

function logikSchritt(dt) {
  const w = s.welt;
  s.zeit += dt;
  const sdt = dt * w.zeitlupe;

  for (let i = spaeter.length - 1; i >= 0; i--) {
    spaeter[i].sek -= dt;
    if (spaeter[i].sek <= 0) { const f = spaeter[i].f; spaeter.splice(i, 1); f(); }
  }
  if (s.wartet > 0) {
    s.wartet -= dt;
    if (s.wartet <= 0 && s.warteAktion) { const f = s.warteAktion; s.warteAktion = null; f(); }
  }

  // Zeiten der Spezialfähigkeiten
  for (const k of Object.keys(s.effekt)) if (s.effekt[k] > 0) s.effekt[k] = Math.max(0, s.effekt[k] - dt);
  w.zeitlupe += ((s.effekt.zeitlupe > 0 ? 0.55 : 1) - w.zeitlupe) * Math.min(1, dt * 4);
  if (s.schutz > 0) s.schutz = Math.max(0, s.schutz - dt);
  if (s.fallbankZeit > 0) {
    s.fallbankZeit -= dt;
    if (s.fallbankZeit <= 0) stelleFallzieleAuf();
  }

  // Kolben spannen
  const imKolben = kugelImKolben();
  if (s.kolbenHalten && imKolben) {
    const vorher = s.kolbenZug;
    s.kolbenZug = Math.min(1, s.kolbenZug + dt / 0.9);
    if (Math.floor(vorher * 8) !== Math.floor(s.kolbenZug * 8)) ton.kolben(s.kolbenZug);
  }
  const kol = s.T.kolben;
  const ky = SCHUSS.kolbenY + s.kolbenZug * 34;
  kol.ay = kol.by = ky;
  if (kol.zugAnim > 0) kol.zugAnim = Math.max(0, kol.zugAnim - dt * 6);

  // Automatischer Abschuss (Multiball, gerettete Kugel)
  for (const b of w.baelle) {
    if (b.autoSchuss > 0 && b.ort === 'tisch') {
      b.autoSchuss -= dt;
      if (b.autoSchuss <= 0 && b.x > SCHUSS.innen) {
        b.vy = -(1500 + Math.random() * 500);
        ton.abschuss(0.8);
        s.T.kolben.zugAnim = 0.8;
      }
    }
  }

  // Löcher abarbeiten
  for (const l of s.T.loecher) {
    l.dreh += dt * (l.schlange.length ? 9 : 1.5);
    if (l.blitz > 0) l.blitz = Math.max(0, l.blitz - dt * 2);
    if (!l.schlange.length) continue;
    l.schlange[0].zeit -= dt;
    if (l.schlange[0].zeit <= 0) lochFertig(l, l.schlange.shift());
  }

  // Bälle auf Rampen und im Tunnel
  for (const b of w.baelle) {
    if (b.ort === 'rampe') rampenSchritt(b, sdt);
    else if (b.ort === 'tunnel') {
      b.s += b.sv * sdt;
      const [x, y] = b.bahn.bahn.ort(b.s);
      b.x = x; b.y = y;
      if (b.s >= b.bahn.bahn.L) {
        b.ort = 'loch';
        const k = s.T.kapsel;
        k.schlange.push({ b, zeit: 0.35, was: 'auswurf' });
        k.blitz = 1;
      }
    }
  }

  // Spinner
  const sp = s.T.spinner;
  if (sp.tempo > 0.2) {
    const vorher = Math.floor(sp.w / Math.PI);
    sp.w += sp.tempo * sdt;
    sp.tempo *= Math.exp(-1.6 * sdt);
    if (Math.floor(sp.w / Math.PI) !== vorher) regeln.spinnerHalb();
  } else sp.tempo = 0;

  // Bälle prüfen: verloren, steckengeblieben oder außerhalb des Tisches
  for (const b of w.baelle) {
    if (b.ort !== 'tisch') continue;
    if (!Number.isFinite(b.x) || !Number.isFinite(b.y) || b.x < 8 || b.x > TB - 8 || b.y < 60) {
      // Sollte nie passieren. Falls doch: Ball sicher zurück in die Abschussbahn.
      s.statistik.ausserhalb++;
      b.x = SCHUSS.x; b.y = SCHUSS.kolbenY - 40; b.vx = 0; b.vy = 0;
      b.autoSchuss = 0.6;
      continue;
    }
    if (b.y > TH + 25) { ballRaus(b); continue; }
    const v = Math.hypot(b.vx, b.vy);
    const imSchuss = b.x > SCHUSS.innen;
    const aufFlipper = b.y > 760;
    if (v < 18 && !imSchuss && !aufFlipper) b.ruhig += dt; else b.ruhig = 0;
    if (b.ruhig > 2.5) {
      b.ruhig = 0;
      s.letzteRettung = [Math.round(b.x), Math.round(b.y)];
      b.vy = -380; b.vx = (Math.random() - 0.5) * 300;
      s.statistik.rettungen++;
      melde('RÜTTELN', 'Der Tisch schubst die Kugel an', 1.2, '#b8b2d6');
      s.wackeln = 0.3;
    }
  }
  w.baelle = w.baelle.filter(b => b.ort !== 'weg');

  // Lichter abklingen
  for (const x of [...s.T.bumper, ...s.T.schleudern, ...s.T.fallziele, ...s.T.stehziele, ...s.T.roll, ...s.T.rampen]) if (x.blitz > 0) x.blitz = Math.max(0, x.blitz - dt * 3);

  // Effekte
  for (const t of s.teilchen) { t.zeit += dt; t.x += t.vx * dt; t.y += t.vy * dt; t.vx *= 1 - 2.5 * dt; t.vy = t.vy * (1 - 2.5 * dt) + 200 * dt; }
  s.teilchen = s.teilchen.filter(t => t.zeit < t.leben);
  for (const t of s.schrift) { t.zeit += dt; t.y -= 40 * dt; }
  s.schrift = s.schrift.filter(t => t.zeit < t.dauer);
  for (const t of s.wellen) t.zeit += dt;
  s.wellen = s.wellen.filter(t => t.zeit < 0.45);
  if (s.wackeln > 0) s.wackeln = Math.max(0, s.wackeln - dt);
  if (s.meldung) {
    s.meldung.zeit += dt;
    if (s.meldung.zeit > s.meldung.dauer || (s.meldungen.length > 2 && s.meldung.zeit > 0.9)) naechsteMeldung();
  }
  if (s.bonusAnzeige) s.bonusAnzeige.zeit += dt;
}

function stelleFallzieleAuf() {
  // Erst hochfahren, wenn keine Kugel darauf liegt
  const frei = s.T.fallziele.every(z => !s.welt.baelle.some(b => b.ort === 'tisch' && Math.abs(b.x - z.x) < 30 && Math.abs(b.y - z.y) < 20));
  if (!frei) { s.fallbankZeit = 0.5; return; }
  s.fallbankZeit = 0;
  for (const z of s.T.fallziele) { z.unten = false; z.t.aktiv = true; z.blitz = 1; }
}
