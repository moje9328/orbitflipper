// =====================================================================
//  BEDIENUNG, MENÜS UND HAUPTSCHLEIFE
// =====================================================================

const body = document.body;
const tippGeraet = window.matchMedia('(pointer: coarse)').matches;

// --------------------------- Spielablauf ---------------------------

function starte() {
  ton.an();
  spaeter.length = 0;
  neuesSpiel();
  baueBilder();
  daten.spiele++;
  speichere();
  schliesseFenster();
  musik.starte();
}

function spielEnde() {
  s.phase = 'ende';
  merkeRekord();
  musik.stoppe();
  setTimeout(zeigeEnde, 600);
}

function merkeRekord() {
  if (!s) return;
  if (s.punkte > daten.rekorde[s.stufe]) {
    daten.rekorde[s.stufe] = s.punkte;
    s.neuerRekord = true;
    speichere();
  }
}

function zeigeEnde() {
  $('ePunkte').textContent = zahl(s.punkte);
  $('eRang').textContent = RAENGE[s.rang];
  $('eAuftraege').textContent = s.auftraegeGeschafft;
  $('eRampen').textContent = s.statistik.rampen;
  $('eKombo').textContent = s.statistik.maxKombo > 1 ? 'x' + s.statistik.maxKombo : '–';
  $('eRekord').textContent = zahl(daten.rekorde[s.stufe]);
  $('neuerRekord').hidden = !s.neuerRekord;
  const d = offenesDuell;
  $('eDuell').hidden = !(d && d.stufe === s.stufe);
  if (d && d.stufe === s.stufe) {
    $('eDuell').textContent = s.punkte > d.punkte
      ? 'Geschafft! Du hast ' + d.name + ' mit ' + zahl(s.punkte) + ' zu ' + zahl(d.punkte) + ' geschlagen.'
      : d.name + ' liegt noch vorne: ' + zahl(d.punkte) + ' Punkte. Versuch es nochmal!';
  }
  zeigeFenster('fEnde');
  if (s.neuerRekord) ton.extra();
}

function pausiere() {
  if (!s || s.phase !== 'lauf' || !$('fenster').hidden) return;
  $('pausePunkte').textContent = zahl(s.punkte);
  loesAlles();
  zeigeFenster('fPause');
}
function weiter() {
  ton.an();
  schliesseFenster();
  letzteZeit = performance.now();
}
function zumMenue() {
  merkeRekord();
  musik.stoppe();
  zeigeFenster('fStart');
}

// --------------------------- Fenster ---------------------------

const FENSTER_IDS = ['fStart', 'fListe', 'fHilfe', 'fPause', 'fEnde', 'fTeilen'];
const ERSTER_KNOPF = { fStart: 'losKnopf', fPause: 'weiterKnopf', fEnde: 'nochmalKnopf' };

function zeigeFenster(id) {
  for (const f of FENSTER_IDS) $(f).hidden = f !== id;
  $('fenster').hidden = false;
  $('fenster').scrollTop = 0;
  body.classList.remove('imSpiel');
  if (id === 'fStart') baueStart();
  if (id === 'fListe') baueListe();
  if (id === 'fHilfe') baueHilfe();
  baueStufen();
  if (ERSTER_KNOPF[id] && !tippGeraet) $(ERSTER_KNOPF[id]).focus({ preventScroll: true });
}
function schliesseFenster() {
  $('fenster').hidden = true;
  body.classList.add('imSpiel');
  if (document.activeElement) document.activeElement.blur();
}

function baueStufen() {
  for (const gruppe of document.querySelectorAll('.stufen')) {
    gruppe.textContent = '';
    for (const name of STUFEN_NAMEN) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = STUFEN[name].name;
      b.setAttribute('aria-pressed', String(name === daten.stufe));
      b.addEventListener('click', () => {
        daten.stufe = name;
        speichere();
        zeigeFenster(FENSTER_IDS.find(f => !$(f).hidden));
      });
      gruppe.appendChild(b);
    }
  }
  for (const t of document.querySelectorAll('.js-stufentext')) t.textContent = STUFEN[daten.stufe].text;
  for (const t of document.querySelectorAll('.js-rekord')) t.textContent = zahl(daten.rekorde[daten.stufe]);
}

function baueStart() {
  const d = offenesDuell;
  $('duell').hidden = !d;
  if (d) {
    $('duellTitel').textContent = d.name + ' FORDERT DICH HERAUS';
    $('duellText').textContent = 'Schlage ' + zahl(d.punkte) + ' Punkte auf Stufe ' + STUFEN[d.stufe].name + '.';
  }
}

function baueListe() {
  const liste = $('liste');
  liste.textContent = '';
  const zeilen = daten.freunde.filter(x => x.stufe === daten.stufe).map(x => ({ name: x.name, punkte: x.punkte, ich: false }));
  zeilen.push({ name: daten.name || 'Du', punkte: daten.rekorde[daten.stufe], ich: true });
  zeilen.sort((a, b) => b.punkte - a.punkte);
  zeilen.forEach((z, i) => {
    const li = document.createElement('li');
    if (z.ich) li.className = 'ich';
    const platz = document.createElement('span'); platz.className = 'platz'; platz.textContent = i + 1;
    const wer = document.createElement('span'); wer.className = 'wer'; wer.textContent = z.name;
    const wie = document.createElement('span'); wie.className = 'wie'; wie.textContent = zahl(z.punkte);
    li.append(platz, wer, wie);
    if (z.ich) {
      const leer = document.createElement('span'); leer.className = 'platzhalter'; li.appendChild(leer);
    } else {
      const weg = document.createElement('button');
      weg.type = 'button'; weg.className = 'weg';
      weg.setAttribute('aria-label', z.name + ' entfernen');
      weg.textContent = '×';
      weg.addEventListener('click', () => {
        daten.freunde = daten.freunde.filter(x => !(x.name === z.name && x.stufe === daten.stufe));
        speichere();
        baueListe();
      });
      li.appendChild(weg);
    }
    liste.appendChild(li);
  });
}

function baueHilfe() {
  $('hilfeSteuerung').textContent = tippGeraet
    ? 'Linke Bildschirmhälfte: linker Flipper. Rechte Hälfte: rechter Flipper. Halten hält den Flipper oben.'
    : 'A oder Pfeil links: linker Flipper. D oder Pfeil rechts: rechter Flipper. P ist Pause, M schaltet den Ton.';
  $('hilfeKolben').textContent = tippGeraet
    ? 'Liegt die Kugel rechts in der Abschussbahn: Finger halten zum Spannen, loslassen zum Abschießen.'
    : 'Liegt die Kugel rechts in der Abschussbahn: Leertaste oder Pfeil runter halten zum Spannen, loslassen zum Abschießen.';
}

// --------------------------- Freunde herausfordern ---------------------------

let offenesDuell = null;
let vorTeilen = 'fStart';

function reinerName(text) {
  const sauber = String(text == null ? '' : text).normalize('NFC').replace(/[\p{C}<>]/gu, '').trim();
  return Array.from(sauber).slice(0, 12).join('');
}
function linkBauen() {
  const teile = new URLSearchParams({ name: reinerName($('nameFeld').value) || 'Ein Freund', punkte: daten.rekorde[daten.stufe], stufe: daten.stufe });
  return SPIEL_ADRESSE + '#' + teile.toString();
}
function oeffneTeilen(zurueck) {
  vorTeilen = zurueck;
  $('nameFeld').value = daten.name;
  $('teilenStatus').textContent = '';
  $('linkFeld').hidden = true;
  $('teilenText').textContent = 'Du teilst deinen Rekord: ' + zahl(daten.rekorde[daten.stufe]) + ' Punkte auf Stufe ' + STUFEN[daten.stufe].name + '. Wer den Link öffnet, kann dich herausfordern.';
  zeigeFenster('fTeilen');
}
async function teile() {
  daten.name = reinerName($('nameFeld').value);
  speichere();
  const adresse = linkBauen();
  const text = 'Ich habe ' + zahl(daten.rekorde[daten.stufe]) + ' Punkte in Orbitflipper (Stufe ' + STUFEN[daten.stufe].name + '). Schaffst du mehr?';
  const status = $('teilenStatus');
  status.textContent = '';
  try {
    if (navigator.share) { await navigator.share({ title: 'Orbitflipper', text, url: adresse }); return; }
    await navigator.clipboard.writeText(text + ' ' + adresse);
    status.textContent = 'Link kopiert! Füge ihn jetzt im Chat ein.';
  } catch (error) {
    if (error.name === 'AbortError') return;
    const feld = $('linkFeld');
    feld.value = adresse; feld.hidden = false; feld.select();
    status.textContent = 'Kopiere diesen Link:';
  }
}
function leseHerausforderung() {
  if (location.hash.length < 2) return;
  const teile = new URLSearchParams(location.hash.slice(1));
  const name = reinerName(teile.get('name'));
  const punkte = Number(teile.get('punkte'));
  const stufe = teile.get('stufe');
  try { history.replaceState(null, '', location.pathname + location.search); } catch (error) {}
  if (!name || !Number.isInteger(punkte) || punkte < 1 || punkte > 999999999) return;
  if (!Object.prototype.hasOwnProperty.call(STUFEN, stufe)) return;
  const bekannt = daten.freunde.find(f => f.name === name && f.stufe === stufe);
  if (bekannt) bekannt.punkte = Math.max(bekannt.punkte, punkte);
  else daten.freunde.push({ name, punkte, stufe });
  daten.freunde.sort((a, b) => b.punkte - a.punkte);
  daten.freunde = daten.freunde.slice(0, 30);
  daten.stufe = stufe;
  speichere();
  offenesDuell = { name, punkte, stufe };
}

// --------------------------- Ton-Knöpfe ---------------------------

function schalteTon() {
  daten.ton = !daten.ton;
  speichere();
  zeigeTon();
  ton.an();
  ton.klick();
}
function zeigeTon() {
  $('tonKnopf').classList.toggle('stumm', !daten.ton);
  $('tonKnopf').setAttribute('aria-label', daten.ton ? 'Ton ausschalten' : 'Ton einschalten');
}
function zeigeMusikKnopf() { $('pauseMusik').textContent = daten.musik ? 'Musik ausschalten' : 'Musik einschalten'; }

for (const k of document.querySelectorAll('[data-oeffne]')) {
  k.addEventListener('click', () => {
    if (k.dataset.oeffne === 'fStart' && !$('fEnde').hidden) { zumMenue(); return; }
    zeigeFenster(k.dataset.oeffne);
  });
}
$('losKnopf').addEventListener('click', starte);
$('tonKnopf').addEventListener('click', schalteTon);
$('pauseKnopf').addEventListener('click', () => { ton.an(); pausiere(); });
$('weiterKnopf').addEventListener('click', weiter);
$('pauseMusik').addEventListener('click', () => { daten.musik = !daten.musik; speichere(); zeigeMusikKnopf(); });
$('pauseNeu').addEventListener('click', () => { merkeRekord(); starte(); });
$('pauseMenue').addEventListener('click', zumMenue);
$('nochmalKnopf').addEventListener('click', starte);
$('endeTeilen').addEventListener('click', () => oeffneTeilen('fEnde'));
$('listeTeilen').addEventListener('click', () => oeffneTeilen('fListe'));
$('teilenKnopf').addEventListener('click', teile);
$('teilenZurueck').addEventListener('click', () => zeigeFenster(vorTeilen));

// --------------------------- Flipper-Steuerung ---------------------------
// Jeder Finger wird einzeln verfolgt. Ein Flipper ist oben, solange mindestens
// ein Finger (oder eine Taste) auf seiner Seite gedrückt ist.

const finger = new Map();          // pointerId -> 'links' | 'rechts'
const tasten = { links: new Set(), rechts: new Set(), kolben: new Set() };

function imSpielAktiv() { return s && s.phase === 'lauf' && $('fenster').hidden; }

function aktualisiereFlipper() {
  if (!s) return;
  const halt = { links: tasten.links.size > 0, rechts: tasten.rechts.size > 0 };
  for (const seite of finger.values()) halt[seite] = true;
  for (const f of s.T.flipper) {
    const neu = imSpielAktiv() && halt[f.seite];
    if (neu && !f.gedrueckt) { ton.flipper(); bahnWechsel(f.seite); }
    f.gedrueckt = neu;
  }
  // Kolben: Finger irgendwo oder Kolben-Taste, solange die Kugel in der Abschussbahn liegt
  const kolben = imSpielAktiv() && (finger.size > 0 || tasten.kolben.size > 0);
  if (kolben && !s.kolbenHalten && kugelImKolben()) { s.kolbenHalten = true; s.kolbenZug = 0; }
  if (!kolben && s.kolbenHalten) {
    s.kolbenHalten = false;
    if (s.kolbenZug > 0.04) feuere(s.kolbenZug);
    s.kolbenZug = 0;
  }
}

// Mit den Flippern die Lichter der Rollbahnen verschieben (wie am echten Automaten)
function bahnWechsel(seite) {
  const r = s.T.roll;
  const an = r.map(x => x.an);
  if (seite === 'links') an.push(an.shift()); else an.unshift(an.pop());
  r.forEach((x, i) => { x.an = an[i]; });
}

function loesAlles() {
  finger.clear();
  for (const k of Object.keys(tasten)) tasten[k].clear();
  aktualisiereFlipper();
}

window.addEventListener('pointerdown', e => {
  if (!$('fenster').hidden || (e.target.closest && e.target.closest('button'))) return;
  ton.an();
  if (!imSpielAktiv()) return;
  e.preventDefault();
  finger.set(e.pointerId, e.clientX < window.innerWidth / 2 ? 'links' : 'rechts');
  aktualisiereFlipper();
}, { passive: false });
const fingerWeg = e => { if (finger.delete(e.pointerId)) aktualisiereFlipper(); };
window.addEventListener('pointerup', fingerWeg);
window.addEventListener('pointercancel', fingerWeg);
// Ein Finger, der über die Mitte rutscht, wechselt die Seite
window.addEventListener('pointermove', e => {
  if (!finger.has(e.pointerId)) return;
  const seite = e.clientX < window.innerWidth / 2 ? 'links' : 'rechts';
  if (finger.get(e.pointerId) !== seite) { finger.set(e.pointerId, seite); aktualisiereFlipper(); }
});
window.addEventListener('contextmenu', e => { if ($('fenster').hidden) e.preventDefault(); });

const TASTE = {
  ArrowLeft: 'links', a: 'links', A: 'links', ShiftLeft: 'links', y: 'links', z: 'links',
  ArrowRight: 'rechts', d: 'rechts', D: 'rechts', ShiftRight: 'rechts', '-': 'rechts',
  ' ': 'kolben', ArrowDown: 'kolben', Enter: 'kolben', s: 'kolben', S: 'kolben'
};
function tasteName(e) { return e.code === 'ShiftLeft' || e.code === 'ShiftRight' ? e.code : e.key; }
window.addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  const wo = TASTE[tasteName(e)];
  if (wo && imSpielAktiv()) {
    e.preventDefault();
    ton.an();
    tasten[wo].add(tasteName(e));
    aktualisiereFlipper();
    return;
  }
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
    if ($('fenster').hidden) pausiere();
    else if (!$('fPause').hidden) weiter();
  } else if (e.key === 'm' || e.key === 'M') schalteTon();
});
window.addEventListener('keyup', e => {
  const wo = TASTE[tasteName(e)];
  if (!wo) return;
  // Großschreibung kann zwischen Drücken und Loslassen wechseln
  for (const k of Object.keys(tasten)) { tasten[k].delete(tasteName(e)); tasten[k].delete(e.key.toLowerCase()); tasten[k].delete(e.key.toUpperCase()); }
  aktualisiereFlipper();
});

document.addEventListener('visibilitychange', () => { if (document.hidden) pausiere(); });
window.addEventListener('blur', () => { loesAlles(); pausiere(); });
window.addEventListener('resize', passeGroesseAn);
window.addEventListener('orientationchange', passeGroesseAn);

// --------------------------- Hauptschleife ---------------------------
// Physik läuft in festen Takten (120 pro Sekunde), gezeichnet wird so oft der Bildschirm kann.

let letzteZeit = 0, rest = 0;
function bild(jetzt) {
  let dt = Math.min(0.05, (jetzt - letzteZeit) / 1000 || 0);
  letzteZeit = jetzt;
  if (s && s.phase === 'lauf' && $('fenster').hidden) {
    rest += dt;
    let n = 0;
    while (rest >= PH.takt && n < 8) { s.welt.takt(PH.takt); rest -= PH.takt; n++; }
    if (n === 8) rest = 0;
    logikSchritt(dt);
  } else if (s && s.phase === 'ende') {
    logikSchritt(dt);
  }
  zeichne(jetzt / 1000);
  requestAnimationFrame(bild);
}

leseHerausforderung();
neuesSpiel();
s.phase = 'menue';
zeigeTon();
zeigeMusikKnopf();
passeGroesseAn();
zeigeFenster('fStart');
if (document.fonts && document.fonts.load) document.fonts.load("12px 'Press Start 2P'").then(() => { if (s) baueBilder(); }).catch(() => {});
requestAnimationFrame(bild);

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Für automatische Tests
if (TEST) window.spiel = { get s() { return s; }, starte, logikSchritt, feuere, kugelImKolben, ballInBahn, neuerBall, PH, regeln, zeichne, baueBilder, aktualisiereFlipper, rampenSchritt };
