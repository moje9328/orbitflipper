#!/usr/bin/env python3
# Baut aus den Teilen in diesem Ordner die fertige index.html. Aufruf: python3 quelle/baue.py
# Baut außerdem portal/index.html: dieselbe Datei für Spieleportale (CrazyGames, Poki)
# ohne Links nach außen, Teilen und Offline-Speicher, plus portal/orbitflipper-portal.zip zum Hochladen.
import pathlib, zipfile
q = pathlib.Path(__file__).parent
TEILE = ['0-sprache.js', '1-einstellungen.js', '2-physik.js', '3-tisch.js', '4-welten.js', '4c-design.js', '4b-musik.js', '5-logik.js', '6-grafik.js', '7-bedienung.js']
kopf = (q / 'kopf.html').read_text()
spiel = '\n'.join((q / n).read_text() for n in TEILE)
fertig = kopf.replace('%%SCHRIFT%%', (q / 'schrift.txt').read_text().strip()).replace('%%SPIEL%%', spiel)
(q.parent / 'index.html').write_text(fertig)
print('index.html:', len(fertig) // 1024, 'KB')

portal = fertig.replace('const PORTAL = /*PORTAL*/false;', 'const PORTAL = true;', 1)
assert portal != fertig
for zeile in ['<link rel="manifest" href="manifest.webmanifest">\n',
              '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n',
              '<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">\n']:
    assert zeile in portal, zeile
    portal = portal.replace(zeile, '')
ordner = q.parent / 'portal'
ordner.mkdir(exist_ok=True)
(ordner / 'index.html').write_text(portal)
with zipfile.ZipFile(ordner / 'orbitflipper-portal.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    z.write(ordner / 'index.html', 'index.html')
print('portal/index.html:', len(portal) // 1024, 'KB')
