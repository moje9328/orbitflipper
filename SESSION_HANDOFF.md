# Orbitflipper – Übergabe

## Runde 9. November 2026 (abends): Deutsch/Englisch und Portal-Version

**Neu:** `quelle/0-sprache.js` mit `uebersetze('deutscher Text', {platzhalter})` (Alias `T`, aber im Spielcode heißt der Tisch auch `T` – darum überall `uebersetze` verwenden!) und dem Wörterbuch `EN`. Sprache: `?lang=en|de` > gespeicherte Wahl (`pixelhafen.sprache`) > Browsersprache. Knopf „English/Deutsch“ im Startmenü. HTML-Texte mit Fettdruck haben `data-en`.
**Portal-Version:** `python3 quelle/baue.py` baut zusätzlich `portal/index.html` + `portal/orbitflipper-portal.zip` (`PORTAL = true`: ohne Pixelhafen-Link, Rangliste/Teilen, Service Worker, Manifest). `portal/` ist nicht in Git. Einreichungsbilder und englische Beschreibung in `portal/einreichung/`.
**Neue Texte** immer mit `uebersetze(...)` schreiben und in `EN` eintragen.

## Runde 9. November 2026: Ballstarter und rechter Flipper getrennt

**Fehler:** Auf dem Handy bewegte sich beim Betätigen des Ballstarters (rechts) auch der rechte Flipper.
**Ursache:** `7-bedienung.js` wertete jeden Finger doppelt aus: Die Bildschirmhälfte entschied über den Flipper, und *jeder* Finger zog zusätzlich den Kolben (`finger.size > 0`). Ein Finger rechts löste also beides aus. Außerdem wechselte ein über die Mitte gezogener Finger die Seite.
**Behebung:** Beim Berühren wird jedem Finger genau eine Aktion zugeordnet (`aktionFuer`): `kolben` (schmale Abschussbahn am rechten Tischrand, ab 40 Einheiten links der Bahn, untere 65 % des Tisches), sonst `links` oder `rechts` nach Bildschirmhälfte. Die Zuordnung bleibt bis zum Loslassen, kein Seitenwechsel beim Ziehen. Der Kolben spannt nur bei einem Bahn-Finger oder der Kolben-Taste. Pause, Fokusverlust und pointercancel lösen alle Finger. Hilfetext angepasst. Cache `orbitflipper-v9`.

**Prüfen:** `python3 quelle/test-bedienung.py` (echte Touch-Ereignisse per DevTools-Protokoll, Chromium; 18 Prüfungen, fängt den alten Fehler mit 7 Fehlschlägen ab). Bauen: `python3 quelle/baue.py`.

**Nicht geprüft:** echtes Handy (Daumengröße der Bahn, Gefühl), iOS-Safari.
