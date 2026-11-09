// =====================================================================
//  BEDIENUNG, MENÜS UND HAUPTSCHLEIFE
// =====================================================================

const body = document.body;
const tippGeraet = window.matchMedia('(pointer: coarse)').matches;

// --------------------------- Spielablauf ---------------------------

let letzterModus = { art: 'klassik' };
function starte(modus = letzterModus) {
  letzterModus = modus;
  ton.an();
  spaeter.length = 0;
  neuesSpiel(modus);
  ton.thema = s.thema.klang;
  baueBilder();
  daten.spiele++;
  speichere();
  schliesseFenster();
  musik.starte();
}

function spielEnde(sieg = false) {
  if (s.phase === 'ende') return;
  s.phase = 'ende';
  s.sieg = sieg;
  if (sieg && s.level) {
    const vorher = daten.sterne[s.level.id] || 0;
    s.neuFrei = false;   // alles ist von Anfang an frei
    daten.sterne[s.level.id] = Math.max(vorher, s.sterne);
  }
  merkeRekord();
  if (!sieg) musik.ende();
  setTimeout(zeigeEnde, sieg ? 600 : 1400);
}

function merkeRekord() {
  if (!s || s.phase === 'menue') return;
  const b = daten.bestwerte[s.tisch] = daten.bestwerte[s.tisch] || {};
  if (s.punkte > (b[s.stufe] || 0)) {
    b[s.stufe] = s.punkte;
    s.neuerRekord = true;
  }
  speichere();
}

function zeigeEnde() {
  const lv = s.level;
  $('eTitel').textContent = s.sieg ? uebersetze('LEVEL GESCHAFFT') : 'GAME OVER';
  $('eTisch').textContent = tischName(s.tisch);
  $('eSterne').hidden = !s.sieg;
  $('eSterne').textContent = '★'.repeat(s.sterne) + '☆'.repeat(3 - s.sterne);
  $('eSterneText').hidden = !s.sieg;
  $('eSterneText').textContent = uebersetze(s.sterne === 3 ? 'Ohne eine Kugel zu verlieren!' : s.sterne === 2 ? 'Nur eine Kugel verloren.' : 'Geschafft! Für mehr Sterne weniger Kugeln verlieren.');
  $('eFrei').hidden = !s.neuFrei;
  if (s.neuFrei) {
    const n = LEVEL[levelNr(lv.id) + 1];
    $('eFrei').textContent = (n.welt !== lv.welt ? uebersetze('Neue Welt frei: {name}!', { name: THEMEN[n.welt].name }) : uebersetze('Neues Level frei: {name}!', { name: n.name }));
  }
  $('ePunkte').textContent = zahl(s.punkte);
  $('eRangZeile').hidden = !!lv;
  $('eRang').textContent = RAENGE[s.rang];
  $('eAuftraegeName').textContent = lv ? uebersetze('Aufgaben') : uebersetze('Aufträge');
  $('eAuftraege').textContent = lv ? uebersetze('{a} von {b}', { a: Math.min(s.schritt, lv.aufgaben.length), b: lv.aufgaben.length }) : s.auftraegeGeschafft;
  $('eRampen').textContent = s.statistik.rampen;
  $('eKombo').textContent = s.statistik.maxKombo > 1 ? 'x' + s.statistik.maxKombo : '–';
  $('eRekord').textContent = zahl(bestwert(s.tisch, s.stufe));
  $('neuerRekord').hidden = !s.neuerRekord;
  const naechstes = lv ? levelNr(lv.id) + 1 : -1;
  $('weiterLevel').hidden = !(lv && naechstes < LEVEL.length && levelFrei(naechstes));
  $('nochmalKnopf').classList.toggle('main', $('weiterLevel').hidden);
  $('zurAuswahl').hidden = !lv;
  const d = offenesDuell;
  const passt = d && d.stufe === s.stufe && d.tisch === s.tisch;
  $('eDuell').hidden = !passt;
  if (passt) {
    $('eDuell').textContent = s.punkte > d.punkte
      ? uebersetze('Geschafft! Du hast {name} mit {du} zu {er} geschlagen.', { name: d.name, du: zahl(s.punkte), er: zahl(d.punkte) })
      : uebersetze('{name} liegt noch vorne: {punkte} Punkte. Versuch es nochmal!', { name: d.name, punkte: zahl(d.punkte) });
  }
  zeigeFenster('fEnde');
  if (!$('weiterLevel').hidden && !tippGeraet) $('weiterLevel').focus({ preventScroll: true });
  if (s.neuerRekord) ton.extra();
}

function pausiere() {
  if (!s || s.phase !== 'lauf' || !$('fenster').hidden) return;
  $('pausePunkte').textContent = zahl(s.punkte);
  loesAlles();
  zeigeFenster('fPause');
  ton.pause();   // Musik und Geräusche anhalten
}
function weiter() {
  ton.an();
  schliesseFenster();
  letzteZeit = performance.now();
}
function zumMenue() {
  if (s && s.phase === 'lauf') merkeRekord();
  musik.stoppe();
  zeigeFenster('fStart');
}

// --------------------------- Fenster ---------------------------

const FENSTER_IDS = ['fStart', 'fWelten', 'fLevel', 'fListe', 'fHilfe', 'fTon', 'fPause', 'fEnde', 'fTeilen'];
const ERSTER_KNOPF = { fStart: 'losKnopf', fPause: 'weiterKnopf', fEnde: 'nochmalKnopf' };

function zeigeFenster(id) {
  for (const f of FENSTER_IDS) $(f).hidden = f !== id;
  $('fenster').hidden = false;
  $('fenster').scrollTop = 0;
  document.querySelector('.tafel').classList.toggle('breit', id === 'fWelten' || id === 'fLevel');
  body.classList.remove('imSpiel');
  if (id === 'fStart') baueStart();
  if (id === 'fListe') baueListe();
  if (id === 'fWelten') baueWelten();
  if (id === 'fLevel') baueLevel();
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
  for (const t of document.querySelectorAll('.js-rekord')) t.textContent = zahl(bestwert('klassik'));
  const offen = !$('fWelten').hidden ? 'fWelten' : !$('fLevel').hidden ? 'fLevel' : '';
  if (offen === 'fWelten') baueWelten();
  if (offen === 'fLevel') baueLevel();
}

// --------------------------- Welt- und Levelauswahl ---------------------------

let gewaehlteWelt = 'weltraum';
function weltLevel(welt) { return LEVEL.map((l, i) => [l, i]).filter(([l]) => l.welt === welt); }
function sterneVon(welt) { return weltLevel(welt).reduce((n, [l]) => n + (daten.sterne[l.id] || 0), 0); }

function bildElement(levelIndex, breite, gesperrt) {
  // Vorschau als <img>, gerendert mit demselben Zeichner und denselben Designdaten wie das Spiel
  const rahmen = document.createElement('span');
  rahmen.className = 'bildRahmen';
  const img = document.createElement('img');
  img.alt = '';
  img.width = breite;
  try { img.src = vorschau(levelIndex, breite * 2).toDataURL('image/jpeg', 0.85); } catch (e) {}
  rahmen.appendChild(img);
  if (gesperrt) {
    const s = document.createElement('span');
    s.className = 'schloss';
    s.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#f2b84b" stroke="#1d1505" stroke-width="1.2" d="M6 10V7a6 6 0 0 1 12 0v3h1.5v12h-15V10H6zm3 0h6V7a3 3 0 0 0-6 0v3z"/></svg>';
    rahmen.appendChild(s);
  }
  return rahmen;
}
// Farbe der Welt für Rahmen, Tönung und Schein der Karte
function weltFarben(el, hex) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  el.style.setProperty('--welt', hex);
  el.style.setProperty('--weltTon', `rgba(${r},${g},${b},0.28)`);
  el.style.setProperty('--weltSchein', `rgba(${r},${g},${b},0.18)`);
}
const SCHLOSS_TEXT = '<svg viewBox="0 0 24 24" width="10" height="10" aria-hidden="true"><path fill="currentColor" d="M6 10V7a6 6 0 0 1 12 0v3h1.5v12h-15V10H6zm3 0h6V7a3 3 0 0 0-6 0v3z"/></svg>' + uebersetze('GESPERRT');

function baueWelten() {
  const liste = $('weltListe');
  liste.textContent = '';
  const gesamt = Object.values(daten.sterne).reduce((a, b) => a + b, 0);
  $('sterneGesamt').textContent = gesamt + ' / ' + LEVEL.length * 3;
  for (const w of WELTEN) {
    const [[, ersterIndex]] = weltLevel(w.id);
    const frei = levelFrei(ersterIndex);
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'weltKarte' + (frei ? '' : ' zu');
    weltFarben(knopf, WELT_DESIGN[w.id].rand);
    knopf.append(bildElement(ersterIndex, 112, !frei));
    const info = document.createElement('span');
    info.className = 'weltInfo';
    const nr = document.createElement('span'); nr.className = 'weltNr'; nr.textContent = uebersetze('WELT {nr}', { nr: WELTEN.indexOf(w) + 1 });
    const name = document.createElement('strong'); name.textContent = w.name.toUpperCase();
    const text = document.createElement('span'); text.textContent = frei ? w.text : w.text + uebersetze(' Schaff zuerst das letzte Level der Welt davor.');
    if (!frei) { const zu = document.createElement('span'); zu.className = 'gesperrt'; zu.innerHTML = SCHLOSS_TEXT; info.append(zu); }
    info.prepend(nr);
    const merkmal = document.createElement('span'); merkmal.className = 'weltMerkmal'; merkmal.textContent = THEMEN[w.id].physik.text;
    const sterne = document.createElement('span'); sterne.className = 'sterneZeile'; sterne.textContent = '★ ' + sterneVon(w.id) + ' / ' + weltLevel(w.id).length * 3;
    info.append(name, text, merkmal, sterne);
    knopf.append(info);
    knopf.disabled = !frei;
    knopf.addEventListener('click', () => { gewaehlteWelt = w.id; ton.an(); ton.klick(); zeigeFenster('fLevel'); });
    liste.appendChild(knopf);
  }
}

function baueLevel() {
  const w = WELTEN.find(x => x.id === gewaehlteWelt);
  const wNr = WELTEN.indexOf(w);
  $('levelOber').textContent = uebersetze('WELT {nr} VON {n}', { nr: wNr + 1, n: WELTEN.length });
  $('levelTitel').textContent = w.name.toUpperCase();
  $('levelText').textContent = w.text + ' ' + THEMEN[w.id].physik.text + uebersetze(' Musik: „{name}“.', { name: LIEDER[w.id].name });
  const kopf = $('weltKopf');
  kopf.textContent = '';
  kopf.append(bildElement(weltLevel(w.id)[0][1], 520));
  const liste = $('levelListe');
  liste.textContent = '';
  for (const [l, i] of weltLevel(w.id)) {
    const frei = levelFrei(i);
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'levelKarte' + (frei ? '' : ' zu');
    weltFarben(knopf, themaFuer(i).rand);
    knopf.append(bildElement(i, 84, !frei));
    const info = document.createElement('span');
    info.className = 'weltInfo';
    const name = document.createElement('strong'); name.textContent = l.id.slice(-1) + '. ' + l.name;
    const auf = document.createElement('span');
    auf.textContent = l.aufgaben.map(a => aufgabeText(a) + (a.zeit ? ' (' + a.zeit + ' s)' : '')).join(' · ') + (frei ? '' : uebersetze(' – Schaff zuerst das Level davor.'));
    if (!frei) { const zu = document.createElement('span'); zu.className = 'gesperrt'; zu.innerHTML = SCHLOSS_TEXT; info.append(zu); }
    const st = daten.sterne[l.id] || 0;
    const zeile = document.createElement('span'); zeile.className = 'sterneZeile';
    zeile.textContent = '★'.repeat(st) + '☆'.repeat(3 - st) + (bestwert(l.id) ? '   ' + uebersetze('Best:') + ' ' + zahl(bestwert(l.id)) : '');
    info.append(name, auf, zeile);
    knopf.append(info);
    knopf.disabled = !frei;
    knopf.addEventListener('click', () => starte({ art: 'level', nr: i }));
    liste.appendChild(knopf);
  }
}

function baueStart() {
  const d = offenesDuell;
  $('duell').hidden = !d;
  if (d) {
    $('duellTitel').textContent = uebersetze('{name} FORDERT DICH HERAUS', { name: d.name });
    $('duellText').textContent = uebersetze('Schlage {punkte} Punkte auf dem Tisch {tisch}, Stufe {stufe}.', { punkte: zahl(d.punkte), tisch: tischName(d.tisch), stufe: STUFEN[d.stufe].name }) + (d.tisch !== 'klassik' && !levelFrei(levelNr(d.tisch)) ? uebersetze(' Dieses Level musst du erst freischalten.') : '');
  }
}

function baueListe() {
  // Auswahl des Tisches: Klassik und alle freigeschalteten Level
  const wahl = $('listeTisch');
  const tische = ['klassik', ...LEVEL.filter((l, i) => levelFrei(i)).map(l => l.id)];
  if (!tische.includes(daten.listeTisch)) daten.listeTisch = 'klassik';
  wahl.textContent = '';
  for (const id of tische) { const o = document.createElement('option'); o.value = id; o.textContent = tischName(id); wahl.appendChild(o); }
  wahl.value = daten.listeTisch;
  const tisch = daten.listeTisch;
  const liste = $('liste');
  liste.textContent = '';
  const zeilen = daten.freunde.filter(x => x.stufe === daten.stufe && x.tisch === tisch).map(x => ({ name: x.name, punkte: x.punkte, ich: false }));
  zeilen.push({ name: daten.name || uebersetze('Du'), punkte: bestwert(tisch), ich: true });
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
      weg.setAttribute('aria-label', uebersetze('{name} entfernen', { name: z.name }));
      weg.textContent = '×';
      weg.addEventListener('click', () => {
        daten.freunde = daten.freunde.filter(x => !(x.name === z.name && x.stufe === daten.stufe && x.tisch === tisch));
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
    ? uebersetze('Linke Bildschirmhälfte: linker Flipper. Rechte Hälfte: rechter Flipper. Mit mehreren Fingern gleichzeitig möglich. Halten hält den Flipper oben.')
    : uebersetze('A oder Pfeil links: linker Flipper. D oder Pfeil rechts: rechter Flipper. P ist Pause, M schaltet den Ton.');
  $('hilfeKolben').textContent = tippGeraet
    ? uebersetze('Liegt die Kugel rechts in der Abschussbahn: Finger auf die schmale Bahn ganz rechts halten zum Spannen, loslassen zum Abschießen. Das löst keinen Flipper aus.')
    : uebersetze('Liegt die Kugel rechts in der Abschussbahn: Leertaste oder Pfeil runter halten zum Spannen, loslassen zum Abschießen.');
}

// --------------------------- Freunde herausfordern ---------------------------

let offenesDuell = null;
let vorTeilen = 'fStart';

function reinerName(text) {
  const sauber = String(text == null ? '' : text).normalize('NFC').replace(/[\p{C}<>]/gu, '').trim();
  return Array.from(sauber).slice(0, 12).join('');
}
let teilTisch = 'klassik';
function linkBauen() {
  const teile = new URLSearchParams({ name: reinerName($('nameFeld').value) || uebersetze('Ein Freund'), punkte: bestwert(teilTisch), stufe: daten.stufe, tisch: teilTisch });
  return SPIEL_ADRESSE + '#' + teile.toString();
}
function oeffneTeilen(zurueck, tisch) {
  vorTeilen = zurueck;
  teilTisch = tisch;
  $('nameFeld').value = daten.name;
  $('teilenStatus').textContent = '';
  $('linkFeld').hidden = true;
  $('teilenText').textContent = uebersetze('Du teilst deinen Rekord auf dem Tisch {tisch}: {punkte} Punkte auf Stufe {stufe}. Wer den Link öffnet, kann dich herausfordern.', { tisch: tischName(tisch), punkte: zahl(bestwert(tisch)), stufe: STUFEN[daten.stufe].name });
  zeigeFenster('fTeilen');
}
async function teile() {
  daten.name = reinerName($('nameFeld').value);
  speichere();
  const adresse = linkBauen();
  const text = uebersetze('Ich habe {punkte} Punkte in Orbitflipper ({tisch}, Stufe {stufe}). Schaffst du mehr?', { punkte: zahl(bestwert(teilTisch)), tisch: tischName(teilTisch), stufe: STUFEN[daten.stufe].name });
  const status = $('teilenStatus');
  status.textContent = '';
  try {
    if (navigator.share) { await navigator.share({ title: 'Orbitflipper', text, url: adresse }); return; }
    await navigator.clipboard.writeText(text + ' ' + adresse);
    status.textContent = uebersetze('Link kopiert! Füge ihn jetzt im Chat ein.');
  } catch (error) {
    if (error.name === 'AbortError') return;
    const feld = $('linkFeld');
    feld.value = adresse; feld.hidden = false; feld.select();
    status.textContent = uebersetze('Kopiere diesen Link:');
  }
}
function leseHerausforderung() {
  if (location.hash.length < 2) return;
  const teile = new URLSearchParams(location.hash.slice(1));
  const name = reinerName(teile.get('name'));
  const punkte = Number(teile.get('punkte'));
  const stufe = teile.get('stufe');
  const tisch = teile.get('tisch') || 'klassik';
  try { history.replaceState(null, '', location.pathname + location.search); } catch (error) {}
  if (!name || !Number.isInteger(punkte) || punkte < 1 || punkte > 999999999) return;
  if (!Object.prototype.hasOwnProperty.call(STUFEN, stufe)) return;
  if (tisch !== 'klassik' && levelNr(tisch) < 0) return;
  const bekannt = daten.freunde.find(f => f.name === name && f.stufe === stufe && f.tisch === tisch);
  if (bekannt) bekannt.punkte = Math.max(bekannt.punkte, punkte);
  else daten.freunde.push({ name, punkte, stufe, tisch });
  daten.freunde.sort((a, b) => b.punkte - a.punkte);
  daten.freunde = daten.freunde.slice(0, 60);
  daten.stufe = stufe;
  daten.listeTisch = tisch;
  speichere();
  offenesDuell = { name, punkte, stufe, tisch };
}

// --------------------------- Ton-Knöpfe ---------------------------

function schalteTon() {
  daten.ton = !daten.ton;
  speichere();
  zeigeTon();
  ton.an();
  ton.lautstaerke();
  ton.klick();
}
function zeigeTon() {
  $('tonKnopf').classList.toggle('stumm', !daten.ton);
  $('tonKnopf').setAttribute('aria-label', daten.ton ? uebersetze('Ton ausschalten') : uebersetze('Ton einschalten'));
}
// Lautstärke-Regler für Musik und Effekte (es gibt sie in der Pause und unter "Ton und Musik")
function zeigeRegler() {
  for (const r of document.querySelectorAll('input[data-laut]')) {
    r.value = daten[r.dataset.laut];
    const anzeige = r.parentElement.querySelector('output');
    if (anzeige) anzeige.textContent = r.value + ' %';
  }
}
for (const r of document.querySelectorAll('input[data-laut]')) {
  r.addEventListener('input', () => {
    daten[r.dataset.laut] = Number(r.value);
    zeigeRegler();
    ton.an();
    ton.lautstaerke();
  });
  r.addEventListener('change', () => {
    speichere();
    if (r.dataset.laut === 'lautEffekte') ton.klick();
  });
}

for (const k of document.querySelectorAll('[data-oeffne]')) {
  k.addEventListener('click', () => {
    if (k.dataset.oeffne === 'fStart' && !$('fEnde').hidden) { zumMenue(); return; }
    zeigeFenster(k.dataset.oeffne);
  });
}
$('losKnopf').addEventListener('click', () => { ton.an(); zeigeFenster('fWelten'); });
$('klassikKnopf').addEventListener('click', () => starte({ art: 'klassik' }));
$('weiterLevel').addEventListener('click', () => starte({ art: 'level', nr: levelNr(s.level.id) + 1 }));
$('zurAuswahl').addEventListener('click', () => { gewaehlteWelt = s.level ? s.level.welt : gewaehlteWelt; zeigeFenster('fLevel'); });
$('listeTisch').addEventListener('change', e => { daten.listeTisch = e.target.value; speichere(); baueListe(); });
$('tonKnopf').addEventListener('click', schalteTon);
$('pauseKnopf').addEventListener('click', () => { ton.an(); pausiere(); });
$('weiterKnopf').addEventListener('click', weiter);

$('pauseNeu').addEventListener('click', () => { merkeRekord(); starte(); });
$('pauseAuswahl').addEventListener('click', () => { merkeRekord(); musik.stoppe(); zeigeFenster(s.level ? 'fLevel' : 'fWelten'); });
$('pauseMenue').addEventListener('click', zumMenue);
$('nochmalKnopf').addEventListener('click', () => starte());
$('endeTeilen').addEventListener('click', () => oeffneTeilen('fEnde', s.tisch));
$('listeTeilen').addEventListener('click', () => oeffneTeilen('fListe', daten.listeTisch));
$('teilenKnopf').addEventListener('click', teile);
$('teilenZurueck').addEventListener('click', () => zeigeFenster(vorTeilen));

// --------------------------- Flipper-Steuerung ---------------------------
// Jeder Finger wird einzeln verfolgt. Ein Flipper ist oben, solange mindestens
// ein Finger (oder eine Taste) auf seiner Seite gedrückt ist.

const finger = new Map();          // pointerId -> 'links' | 'rechts' | 'kolben' (bei Berührung festgelegt)
const tasten = { links: new Set(), rechts: new Set(), kolben: new Set() };

function imSpielAktiv() { return s && s.phase === 'lauf' && $('fenster').hidden; }

function aktualisiereFlipper() {
  if (!s) return;
  const halt = { links: tasten.links.size > 0, rechts: tasten.rechts.size > 0 };
  for (const art of finger.values()) if (art !== 'kolben') halt[art] = true;
  for (const f of s.T.flipper) {
    const neu = imSpielAktiv() && halt[f.seite];
    if (neu && !f.gedrueckt) { ton.flipper(); bahnWechsel(f.seite); }
    f.gedrueckt = neu;
  }
  // Kolben: nur ein Finger auf der Abschussbahn oder die Kolben-Taste, solange die Kugel in der Abschussbahn liegt
  let kolbenFinger = false;
  for (const art of finger.values()) if (art === 'kolben') kolbenFinger = true;
  const kolben = imSpielAktiv() && (kolbenFinger || tasten.kolben.size > 0);
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

// Welche Aktion gehört zu einem Berührungspunkt? Die Abschussbahn (rechter Rand des Tisches)
// bedient nur den Kolben, sonst entscheidet die Bildschirmhälfte. Die Wahl gilt, bis der Finger loslässt.
function aktionFuer(e) {
  const tx = (e.clientX - ansicht.ox) / ansicht.k, ty = (e.clientY - ansicht.oy) / ansicht.k;
  if (tx >= SCHUSS.innen - 40 && tx <= TB + 4 && ty > HUDH + TH * 0.35) return 'kolben';
  return e.clientX < window.innerWidth / 2 ? 'links' : 'rechts';
}
window.addEventListener('pointerdown', e => {
  if (!$('fenster').hidden || (e.target.closest && e.target.closest('button'))) return;
  ton.an();
  if (!imSpielAktiv()) return;
  e.preventDefault();
  finger.set(e.pointerId, aktionFuer(e));
  aktualisiereFlipper();
}, { passive: false });
const fingerWeg = e => { if (finger.delete(e.pointerId)) aktualisiereFlipper(); };
window.addEventListener('pointerup', fingerWeg);
window.addEventListener('pointercancel', fingerWeg);
window.addEventListener('lostpointercapture', fingerWeg);
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

document.addEventListener('visibilitychange', () => { if (document.hidden) { pausiere(); ton.pause(); } });
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

// Sprache und Portal-Version
uebersetzeSeite();
$('spracheKnopf').textContent = Sprache.aktuell === 'de' ? 'English' : 'Deutsch';
$('spracheKnopf').lang = Sprache.aktuell === 'de' ? 'en' : 'de';
$('spracheKnopf').addEventListener('click', () => Sprache.wechsle());
if (PORTAL) {
  // Auf Spieleportalen keine Links nach außen und kein Teilen
  for (const id of ['pixelhafenLink', 'listeKnopf', 'endeTeilen']) $(id).remove();
} else {
  leseHerausforderung();
}
neuesSpiel();
s.phase = 'menue';
zeigeTon();
zeigeRegler();
passeGroesseAn();
zeigeFenster('fStart');
if (document.fonts && document.fonts.load) document.fonts.load("12px 'Press Start 2P'").then(() => { if (s) baueBilder(); }).catch(() => {});
requestAnimationFrame(bild);

if (!PORTAL && 'serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Für automatische Tests
if (TEST) window.spiel = { get s() { return s; }, starte, neuesSpiel, vorschau, levelEreignis, spielEnde, logikSchritt, feuere, kugelImKolben, ballInBahn, neuerBall, PH, regeln, zeichne, baueBilder, aktualisiereFlipper, rampenSchritt };
