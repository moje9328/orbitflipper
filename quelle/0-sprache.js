// ===================================================================
// 0 · SPRACHE (Deutsch / Englisch)
// Alle Texte stehen im Code auf Deutsch. T('deutscher Text') liefert im
// englischen Modus die Übersetzung aus EN (unten), sonst den Text selbst.
// Platzhalter: T('Level {nr}', { nr: 3 }).
// Die Sprache kommt aus der gespeicherten Wahl, sonst aus dem Browser:
// Deutsch für deutschsprachige Browser, für alle anderen Englisch.
// PORTAL ist nur in der Version für Spieleportale (CrazyGames, Poki) wahr:
// dort fehlen Links nach außen, Teilen und der Offline-Speicher.
// ===================================================================

const PORTAL = /*PORTAL*/false;

const Sprache = (() => {
  const SCHLUESSEL = 'pixelhafen.sprache';
  function gespeichert() {
    // ?lang=en in der Adresse geht vor (falls der Browser den Speicher sperrt)
    try { const u = new URLSearchParams(location.search).get('lang'); if (u === 'de' || u === 'en') return u; } catch (e) { /* weiter */ }
    try { const w = window.localStorage.getItem(SCHLUESSEL); return w === 'de' || w === 'en' ? w : ''; } catch (e) { return ''; }
  }
  function ausBrowser() {
    try {
      const liste = (typeof navigator !== 'undefined' && (navigator.languages || [navigator.language])) || [];
      return String(liste[0] || 'de').toLowerCase().startsWith('de') ? 'de' : 'en';
    } catch (e) { return 'de'; }
  }
  // Ohne Browser (automatische Tests) immer Deutsch
  const aktuell = typeof document === 'undefined' ? 'de' : (gespeichert() || ausBrowser());
  return {
    aktuell,
    wechsle() {
      const neu = aktuell === 'de' ? 'en' : 'de';
      try { window.localStorage.setItem(SCHLUESSEL, neu); } catch (e) { /* dann nur über die Adresse */ }
      const u = new URL(location.href);
      u.searchParams.set('lang', neu);
      location.replace(u.href);
    },
  };
})();

function T(de, werte) {
  let text = (Sprache.aktuell === 'en' && Object.prototype.hasOwnProperty.call(EN, de)) ? EN[de] : de;
  if (werte) text = text.replace(/\{(\w+)\}/g, (m, k) => (k in werte ? werte[k] : m));
  return text;
}

// Zweiter Name für T, wo im Spielcode eine Variable T (der Tisch) die Funktion verdeckt
const uebersetze = T;

// Übersetzt die festen Texte im HTML: Elemente mit data-en bekommen deren Inhalt
// (für Texte mit Fettdruck darin), sonst werden einzelne Textstücke und die
// Attribute aria-label, title und content (Beschreibung) über EN ersetzt.
function uebersetzeSeite() {
  document.documentElement.lang = Sprache.aktuell;
  if (Sprache.aktuell !== 'en') return;
  for (const el of document.querySelectorAll('[data-en]')) el.innerHTML = el.dataset.en;
  const gang = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const stuecke = [];
  while (gang.nextNode()) stuecke.push(gang.currentNode);
  for (const n of stuecke) {
    const roh = n.nodeValue;
    const kern = roh.trim();
    if (kern && Object.prototype.hasOwnProperty.call(EN, kern)) n.nodeValue = roh.replace(kern, EN[kern]);
  }
  for (const el of document.querySelectorAll('[aria-label], [title], [placeholder], meta[name="description"]')) {
    for (const a of ['aria-label', 'title', 'placeholder', 'content']) {
      const w = el.getAttribute(a);
      if (w && Object.prototype.hasOwnProperty.call(EN, w)) el.setAttribute(a, EN[w]);
    }
  }
  if (Object.prototype.hasOwnProperty.call(EN, document.title)) document.title = EN[document.title];
}

const EN = {
  // ---------- Seite ----------
  'Orbitflipper – Pixelhafen': 'Orbitflipper – Pixelhafen',
  'Ein Flipper aus der Zukunft: 5 Welten mit 20 Leveln, echte Kugel-Physik, Rampen, Wurmloch, Multiball und ein Klassik-Tisch. Kostenlos, ohne Anmeldung, ohne Werbung.':
    'A pinball machine from the future: 5 worlds with 20 levels, real ball physics, ramps, a wormhole, multiball and a classic table.',
  'Flippertisch von Orbitflipper': 'Orbitflipper pinball table',
  'Ton an oder aus': 'Sound on or off',
  'Ton ausschalten': 'Mute sound',
  'Ton einschalten': 'Unmute sound',
  'Pause': 'Pause',
  'Ein Flipper aus der Zukunft. Fünf Welten mit 20 Leveln, Rampen, Wurmloch und Multiball – oder der klassische Tisch für Highscore-Jagd.':
    'A pinball machine from the future. Five worlds with 20 levels, ramps, a wormhole and multiball – or the classic table for chasing high scores.',
  'Schwierigkeit': 'Difficulty',
  'REKORD KLASSIK': 'CLASSIC BEST',
  'Welten & Level': 'Worlds & levels',
  'Klassik spielen': 'Play classic',
  'Rangliste': 'Leaderboard',
  "So geht's": 'How to play',
  'Ton und Musik': 'Sound & music',
  'Zur Pixelhafen-Seite': 'More Pixelhafen games',
  'LEVEL WÄHLEN': 'CHOOSE A LEVEL',
  'WELTEN': 'WORLDS',
  'STERNE': 'STARS',
  'Zurück': 'Back',
  'Zu den Welten': 'Back to worlds',
  'RANGLISTE': 'LEADERBOARD',
  'Tisch': 'Table',
  'Schick deinen Link an Freunde. Schicken sie dir ihren zurück, stehen sie hier in deiner Liste. Alles bleibt auf deinem Gerät.':
    'Send your link to friends. When they send theirs back, they show up in your list. Everything stays on your device.',
  'Freunde herausfordern': 'Challenge friends',
  "SO GEHT'S": 'HOW TO PLAY',
  'Fällt die Kugel unten durch, ist sie weg. Du hast 3 Kugeln. Kurz nach dem Abschuss schützt dich ein Schild.':
    'If the ball drains at the bottom, it is gone. You have 3 balls. Right after launch a shield protects you.',
  'DER TISCH': 'THE TABLE',
  'WELTEN UND LEVEL': 'WORLDS AND LEVELS',
  'TON UND MUSIK': 'SOUND AND MUSIC',
  'Jede Welt hat ihr eigenes fröhliches Stück. Es begleitet dich leise im Hintergrund und wird lebhafter, je mehr auf dem Tisch los ist, ohne lauter zu werden. Bei Jackpots und Spezial-Geräuschen tritt die Musik kurz zurück.':
    'Every world has its own cheerful tune. It plays quietly in the background and gets livelier the more is happening on the table, without getting louder. During jackpots and special sounds the music briefly steps back.',
  'Musik': 'Music',
  'Effekte': 'Effects',
  'PAUSE': 'PAUSE',
  'PUNKTE': 'SCORE',
  'Weiterspielen': 'Continue',
  'Neu starten': 'Restart',
  'Levelauswahl': 'Select level',
  'Spiel beenden': 'Quit game',
  'NEUER REKORD!': 'NEW BEST!',
  'Punkte': 'Score',
  'Rang': 'Rank',
  'Aufträge': 'Missions',
  'Aufgaben': 'Tasks',
  'Rampen': 'Ramps',
  'Beste Kombo': 'Best combo',
  'Dein Rekord': 'Your best',
  'Nächstes Level': 'Next level',
  'Nochmal': 'Play again',
  'Zum Menü': 'Main menu',
  'HERAUSFORDERN': 'CHALLENGE',
  'Dein Name für den Link': 'Your name for the link',
  'zum Beispiel Sam': 'for example Sam',
  'Dein Name und deine Punkte stehen im Link. Mehr nicht, und du entscheidest, wem du ihn schickst.':
    'The link contains your name and your score. Nothing else, and you decide who gets it.',
  'Dein Link zum Kopieren': 'Your link to copy',
  'Link teilen': 'Share link',
  'Bitte dreh dein Handy hochkant.': 'Please turn your phone upright.',
  'Der Flipper ist ein Hochformat-Tisch.': 'This pinball table is played in portrait.',
  // ---------- Stufen ----------
  'Leicht': 'Easy',
  'Normal': 'Normal',
  'Schwer': 'Hard',
  'Der Tisch ist flacher, und nach jedem Abschuss bist du 15 Sekunden lang geschützt.': 'The table is flatter, and after every launch you are protected for 15 seconds.',
  'Wie ein echter Automat in der Spielhalle. 8 Sekunden Schutz nach dem Abschuss.': 'Like a real arcade machine. 8 seconds of protection after launch.',
  'Steiler Tisch, schnelle Kugel und kaum Schutz. Nur für Profis.': 'Steep table, fast ball and hardly any protection. For pros only.',
  // ---------- Aufträge, Ränge, Kapsel ----------
  'RAMPEN-RAUSCH': 'RAMP RUSH',
  'BUMPER-STURM': 'BUMPER STORM',
  'WIRBELWIND': 'WHIRLWIND',
  'ZIELÜBUNG': 'TARGET PRACTICE',
  'UMLAUFBAHN': 'ORBITAL PATH',
  'WURMLOCH': 'WORMHOLE',
  'KOMBO-PILOT': 'COMBO PILOT',
  'SCHILDWACHE': 'SHIELD GUARD',
  'REAKTOR': 'REACTOR',
  'Fahr {z} Rampen': 'Ride {z} ramps',
  'Triff {z}-mal die Bumper': 'Hit the bumpers {z} times',
  'Dreh den Spinner {z}-mal': 'Spin the spinner {z} times',
  'Räum die Fallziele {z}-mal ab': 'Clear the drop targets {z} times',
  'Schaff {z} Orbits': 'Make {z} orbits',
  'Versenk die Kugel {z}-mal im Wurmloch': 'Sink the ball in the wormhole {z} times',
  'Schaff eine {z}er-Kombo': 'Get a {z}x combo',
  'Triff alle 3 Schild-Ziele': 'Hit all 3 shield targets',
  'Starte den Multiball': 'Start multiball',
  'Triff {z}-mal die Kapsel': 'Hit the capsule {z} times',
  'Triff {z}-mal den Reaktor': 'Hit the reactor {z} times',
  'Triff alle Schild-Ziele': 'Hit all shield targets',
  'Hol {z} Jackpots im Multiball': 'Score {z} jackpots in multiball',
  'Sammle {z} Punkte': 'Score {z} points',
  'KADETT': 'CADET',
  'PILOT': 'PILOT',
  'KAPITÄN': 'CAPTAIN',
  'KOMMANDANT': 'COMMANDER',
  'ADMIRAL': 'ADMIRAL',
  'STERNENLEGENDE': 'STAR LEGEND',
  'ZEITLUPE': 'SLOW-MO',
  '25.000 PUNKTE': '25,000 POINTS',
  'SCHILD': 'SHIELD',
  'DOPPELTE PUNKTE': 'DOUBLE POINTS',
  'BONUS +1X': 'BONUS +1X',
  'LOCK BEREIT': 'LOCK READY',
  // ---------- Welten und Level ----------
  'Klassik': 'Classic',
  'Weltraum': 'Space',
  'Cyberpunk': 'Cyberpunk',
  'Dschungeltempel': 'Jungle Temple',
  'Unterwasser': 'Underwater',
  'Vulkan': 'Volcano',
  'Station Orbita zwischen Ringplaneten und Energiebahnen.': 'Station Orbita among ringed planets and energy lanes.',
  'Nachts in Neon City: Hologramme, Regen und fliegende Autos.': 'Night in Neon City: holograms, rain and flying cars.',
  'Der Tempel der Ahnen: Ruinen, Wasserfall und alte Steinmechanik.': 'The Temple of the Ancestors: ruins, a waterfall and ancient stone machinery.',
  'Das versunkene Atlantis mit Korallen, Quallen und Fischschwärmen.': 'Sunken Atlantis with corals, jellyfish and schools of fish.',
  'Im Glutkern: glühende Rampen, Lavaströme und fliegende Funken.': 'In the molten core: glowing ramps, lava flows and flying sparks.',
  'Startrampe': 'Launch Pad',
  'Asteroidengürtel': 'Asteroid Belt',
  'Raumstation': 'Space Station',
  'Schwarzes Loch': 'Black Hole',
  'Neonmarkt': 'Neon Market',
  'Datenautobahn': 'Data Highway',
  'Hologramm-Turm': 'Hologram Tower',
  'Mitternachts-Hack': 'Midnight Hack',
  'Rankenpfad': 'Vine Path',
  'Wasserfall': 'Waterfall',
  'Tempelkammer': 'Temple Chamber',
  'Götzenauge': 'Idol’s Eye',
  'Korallenriff': 'Coral Reef',
  'Quallengarten': 'Jellyfish Garden',
  'Versunkene Stadt': 'Sunken City',
  'Tiefseegraben': 'Deep Sea Trench',
  'Aschefeld': 'Ash Field',
  'Lavastrom': 'Lava Flow',
  'Magmakammer': 'Magma Chamber',
  'Herz des Vulkans': 'Heart of the Volcano',
  'Rampe links': 'Left ramp',
  'Rampe rechts': 'Right ramp',
  'Orbit links': 'Left orbit',
  'Orbit rechts': 'Right orbit',
  'Wurmloch': 'Wormhole',
  'Kapsel': 'Capsule',
  'Reaktor': 'Reactor',
  'Weniger Schwerkraft: Die Kugel fliegt länger.': 'Less gravity: the ball flies longer.',
  'Überladene Neon-Bumper schießen härter.': 'Overcharged neon bumpers kick harder.',
  'Schwere Steinbumper, kräftige Holzschleudern.': 'Heavy stone bumpers, strong wooden slingshots.',
  'Im Wasser schwebt die Kugel langsamer.': 'Under water the ball drifts more slowly.',
  'Steiler Hang und glühend heiße Bumper.': 'A steep slope and red-hot bumpers.',
  'Orbit-Fieber': 'Orbit Fever',
  'Sternenstation': 'Star Station',
  'Neonpuls': 'Neon Pulse',
  'Tempelpfad': 'Temple Trail',
  'Atlantis': 'Atlantis',
  'Glutkern': 'Molten Core',
  'TEMPEL\nDER AHNEN': 'TEMPLE OF\nANCESTORS',
  'GLUT-\nKERN': 'MOLTEN\nCORE',
  'NUDELN': 'NOODLES',
  // ---------- Meldungen im Spiel ----------
  'AUFGABE': 'TASK',
  'AUFTRAG': 'MISSION',
  'GESCHAFFT': 'DONE',
  'Level geschafft!': 'Level complete!',
  ' (in {z} s)': ' (within {z} s)',
  'Halten zum Spannen, loslassen zum Abschießen': 'Hold to pull back, release to launch',
  'AUFTRAG GESCHAFFT': 'MISSION COMPLETE',
  'NEUER RANG': 'NEW RANK',
  'EXTRABALL': 'EXTRA BALL',
  'Du bekommst eine Kugel mehr': 'You get one more ball',
  'NEUER AUFTRAG': 'NEW MISSION',
  'RICHTIG!': 'CORRECT!',
  'Jetzt:': 'Next:',
  'LEVEL GESCHAFFT': 'LEVEL COMPLETE',
  'ZEIT UM': 'TIME UP',
  'Die Aufgabe beginnt von vorn': 'The task starts over',
  'SCHILD AN': 'SHIELD ON',
  'Verlorene Kugeln kommen zurück': 'Lost balls come back',
  'Alles zählt doppelt': 'Everything counts double',
  'Die Zeit läuft langsamer': 'Time runs slower',
  'Schild-Ziele laden ihn wieder auf': 'Shield targets recharge it',
  'WURMLOCH OFFEN': 'WORMHOLE OPEN',
  'Schieß in die Mitte!': 'Shoot up the middle!',
  'O-R-B KOMPLETT': 'O-R-B COMPLETE',
  'Bonus jetzt {x}x': 'Bonus now {x}x',
  'Schieß in den Reaktor rechts': 'Shoot into the reactor on the right',
  'Ab durch den Tunnel!': 'Off through the tunnel!',
  'KAPSEL': 'CAPSULE',
  'KUGEL GESPERRT': 'BALL LOCKED',
  'Noch eine für den Multiball': 'One more for multiball',
  'Rampen bringen Jackpots!': 'Ramps score jackpots!',
  'KUGEL GERETTET': 'BALL SAVED',
  "Weiter geht's!": 'Keep going!',
  'MULTIBALL VORBEI': 'MULTIBALL OVER',
  'Nächstes Mal mehr Jackpots': 'More jackpots next time',
  'Gleiche Kugel noch einmal': 'Same ball again',
  'KUGEL': 'BALL',
  'Die letzte Kugel!': 'Last ball!',
  'RÜTTELN': 'TILT',
  'Der Tisch schubst die Kugel an': 'The table nudges the ball',
  'ZEIT': 'TIME',
  'KOMBO X': 'COMBO X',
  'KOMBO': 'COMBO',
  // ---------- Menüs ----------
  'Ohne eine Kugel zu verlieren!': 'Without losing a single ball!',
  'Nur eine Kugel verloren.': 'Only one ball lost.',
  'Geschafft! Für mehr Sterne weniger Kugeln verlieren.': 'Done! Lose fewer balls for more stars.',
  'Neue Welt frei: {name}!': 'New world unlocked: {name}!',
  'Neues Level frei: {name}!': 'New level unlocked: {name}!',
  '{a} von {b}': '{a} of {b}',
  'Geschafft! Du hast {name} mit {du} zu {er} geschlagen.': 'You did it! You beat {name} {du} to {er}.',
  '{name} liegt noch vorne: {punkte} Punkte. Versuch es nochmal!': '{name} is still ahead: {punkte} points. Try again!',
  'GESPERRT': 'LOCKED',
  'WELT {nr}': 'WORLD {nr}',
  'WELT {nr} VON {n}': 'WORLD {nr} OF {n}',
  ' Schaff zuerst das letzte Level der Welt davor.': ' First beat the last level of the previous world.',
  ' – Schaff zuerst das Level davor.': ' – First beat the level before.',
  ' Musik: „{name}“.': ' Music: “{name}”.',
  'Best:': 'Best:',
  '{name} FORDERT DICH HERAUS': '{name} CHALLENGES YOU',
  'Schlage {punkte} Punkte auf dem Tisch {tisch}, Stufe {stufe}.': 'Beat {punkte} points on the {tisch} table, {stufe} difficulty.',
  ' Dieses Level musst du erst freischalten.': ' You need to unlock this level first.',
  'Du': 'You',
  '{name} entfernen': 'Remove {name}',
  'Linke Bildschirmhälfte: linker Flipper. Rechte Hälfte: rechter Flipper. Mit mehreren Fingern gleichzeitig möglich. Halten hält den Flipper oben.':
    'Left half of the screen: left flipper. Right half: right flipper. Works with several fingers at once. Hold to keep the flipper up.',
  'A oder Pfeil links: linker Flipper. D oder Pfeil rechts: rechter Flipper. P ist Pause, M schaltet den Ton.':
    'A or Left arrow: left flipper. D or Right arrow: right flipper. P pauses, M toggles sound.',
  'Liegt die Kugel rechts in der Abschussbahn: Finger auf die schmale Bahn ganz rechts halten zum Spannen, loslassen zum Abschießen. Das löst keinen Flipper aus.':
    'When the ball sits in the launch lane on the right: hold your finger on the narrow lane at the far right to pull back, release to launch. This does not move a flipper.',
  'Liegt die Kugel rechts in der Abschussbahn: Leertaste oder Pfeil runter halten zum Spannen, loslassen zum Abschießen.':
    'When the ball sits in the launch lane on the right: hold Space or Down arrow to pull back, release to launch.',
  'Ein Freund': 'A friend',
  'Du teilst deinen Rekord auf dem Tisch {tisch}: {punkte} Punkte auf Stufe {stufe}. Wer den Link öffnet, kann dich herausfordern.':
    'You are sharing your best on the {tisch} table: {punkte} points on {stufe}. Anyone who opens the link can challenge you.',
  'Ich habe {punkte} Punkte in Orbitflipper ({tisch}, Stufe {stufe}). Schaffst du mehr?': 'I scored {punkte} points in Orbitflipper ({tisch}, {stufe}). Can you beat that?',
  'Link kopiert! Füge ihn jetzt im Chat ein.': 'Link copied! Paste it into a chat now.',
  'Kopiere diesen Link:': 'Copy this link:',
};
