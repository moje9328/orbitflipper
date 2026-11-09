#!/usr/bin/env python3
# Bedienungstest (Chromium, echte Touch-Ereignisse über das DevTools-Protokoll). Aufruf: python3 quelle/test-bedienung.py
# Prüft: Abschussbahn bedient nur den Kolben, Flipper unabhängig, Mehrfinger, Herausziehen, Pause, Maus, Tastatur.
import asyncio, http.server, pathlib, socketserver, sys, threading
from playwright.async_api import async_playwright

ORDNER = pathlib.Path(__file__).resolve().parent.parent
class Leise(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=str(ORDNER), **k)
    def log_message(self, *a): pass
server = socketserver.TCPServer(('127.0.0.1', 0), Leise)
threading.Thread(target=server.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{server.server_address[1]}/index.html?test'

fehler, geprueft = [], 0
def ok(bed, text):
    global geprueft
    geprueft += 1
    if not bed: fehler.append(text); print('  FEHLER:', text)

STAND = "(() => { const s = window.spiel.s; return { l: s.T.flipper[0].gedrueckt, r: s.T.flipper[1].gedrueckt, kolben: s.kolbenHalten, schuss: s.kolbenZug }; })()"
PUNKTE = """(() => { const w = innerWidth, h = innerHeight, k = Math.min(w / 540, h / 1000), ox = (w - 540 * k) / 2, oy = (h - 1000 * k) / 2;
  return { bahn: [ox + 502 * k, oy + 840 * k], links: [ox + 150 * k, oy + 890 * k], rechts: [ox + 350 * k, oy + 890 * k], linksNah: [ox + 100 * k, oy + 600 * k], taste: [w - 30, 25] }; })()"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); fe = []
        pg.on('pageerror', lambda e: fe.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(400)
        await pg.evaluate("window.spiel.starte({art: 'klassik'})"); await pg.wait_for_timeout(300)
        cdp = await ctx.new_cdp_session(pg)
        pt = await pg.evaluate(PUNKTE)
        async def tippe(typ, punkte):
            await cdp.send('Input.dispatchTouchEvent', {'type': typ, 'touchPoints': [{'x': x, 'y': y, 'id': i} for i, (x, y) in punkte.items()]})
        async def abbruch():
            try: await cdp.send('Input.dispatchTouchEvent', {'type': 'touchCancel', 'touchPoints': []})
            except Exception: pass
        async def stand(): await pg.wait_for_timeout(120); return await pg.evaluate(STAND)

        # 1. Ballstarter allein: nur Kolben
        await tippe('touchStart', {1: pt['bahn']})
        s = await stand()
        ok(s['kolben'] and not s['r'] and not s['l'], f'Ballstarter löst Flipper aus oder spannt nicht: {s}')
        # 2. Zweiter Finger links: linker Flipper dazu, Kolben bleibt
        await tippe('touchStart', {1: pt['bahn'], 2: pt['links']})
        s = await stand()
        ok(s['kolben'] and s['l'] and not s['r'], f'Mehrfinger Bahn+links falsch: {s}')
        # 3. Bahn loslassen: Kolben feuert, linker Flipper bleibt
        await tippe('touchEnd', {1: pt['bahn']})
        s = await stand()
        ok(not s['kolben'] and s['l'] and not s['r'], f'Bahn loslassen falsch: {s}')
        # 4. Links + rechts gleichzeitig, rechts in die Bahn ziehen: Aktion bleibt "rechts"
        await tippe('touchStart', {2: pt['links'], 3: pt['rechts']})
        await tippe('touchMove', {2: pt['links'], 3: pt['bahn']})
        s = await stand()
        ok(s['l'] and s['r'] and not s['kolben'], f'Herausgezogener Finger wechselt die Aktion: {s}')
        # 5. Finger links nach rechts über die Mitte ziehen: bleibt links
        await tippe('touchMove', {2: pt['rechts'], 3: pt['bahn']})
        s = await stand()
        ok(s['l'] and s['r'], f'Wechsel der Seite beim Ziehen: {s}')
        await tippe('touchEnd', {2: pt['rechts']})
        s = await stand()
        ok(s['r'] and not s['l'], f'Loslassen eines Fingers beendet falsche Aktion: {s}')
        await abbruch()
        s = await stand()
        ok(not s['l'] and not s['r'] and not s['kolben'], f'Abbruch lässt Flipper hängen: {s}')
        # 6. Pause während Halten: nichts hängt, auch nach Weiter
        await tippe('touchStart', {5: pt['links'], 6: pt['rechts']})
        await pg.keyboard.press('p')
        s = await stand()
        ok(not s['l'] and not s['r'], f'Flipper hängen in der Pause: {s}')
        await pg.keyboard.press('p'); await tippe('touchEnd', {5: pt['links'], 6: pt['rechts']}); await abbruch()
        s = await stand()
        ok(not s['l'] and not s['r'], f'Flipper hängen nach Pause und Weiter: {s}')
        # 7. Fokusverlust
        await tippe('touchStart', {7: pt['rechts']})
        await pg.evaluate("window.dispatchEvent(new Event('blur'))")
        s = await stand()
        ok(not s['r'], f'Flipper hängt nach Fokusverlust: {s}')
        await abbruch()
        # 8. Pause-Knopf löst keine Aktion aus
        await tippe('touchStart', {8: pt['taste']}); await tippe('touchEnd', {8: pt['taste']})
        s = await stand()
        ok(not s['l'] and not s['r'] and not s['kolben'], f'Knopf löst Spielaktion aus: {s}')
        await pg.keyboard.press('Escape') if await pg.evaluate("!document.getElementById('fenster').hidden") else None
        ok(not fe, f'Seitenfehler: {fe}')
        await ctx.close()

        # Desktop: Maus und Tastatur
        ctx = await b.new_context(viewport={'width': 1100, 'height': 800})
        pg = await ctx.new_page(); fe = []
        pg.on('pageerror', lambda e: fe.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(400)
        await pg.evaluate("window.spiel.starte({art: 'klassik'})"); await pg.wait_for_timeout(300)
        pt = await pg.evaluate(PUNKTE)
        await pg.mouse.move(*pt['rechts']); await pg.mouse.down()
        s = await stand()
        ok(s['r'] and not s['l'] and not s['kolben'], f'Maus rechts: {s}')
        await pg.mouse.up()
        await pg.mouse.move(*pt['bahn']); await pg.mouse.down()
        s = await stand()
        ok(s['kolben'] and not s['r'] and not s['l'], f'Maus auf der Bahn: {s}')
        await pg.mouse.up()
        await pg.keyboard.down('ArrowLeft'); await pg.keyboard.down('ArrowRight')
        s = await stand()
        ok(s['l'] and s['r'] and not s['kolben'], f'Pfeiltasten: {s}')
        await pg.keyboard.up('ArrowLeft'); await pg.keyboard.up('ArrowRight')
        await pg.evaluate("window.spiel.starte({art: 'klassik'})"); await pg.wait_for_timeout(300)
        await pg.keyboard.down('Space')
        s = await stand()
        ok(s['kolben'] and not s['l'] and not s['r'], f'Leertaste: {s}')
        await pg.keyboard.up('Space')
        s = await stand()
        ok(not s['l'] and not s['r'] and not s['kolben'], f'Tasten lassen etwas hängen: {s}')
        ok(not fe, f'Seitenfehler am Desktop: {fe}')
        await b.close()
    print(f'{geprueft} Prüfungen, {len(fehler)} Fehler')
    sys.exit(1 if fehler else 0)
asyncio.run(main())
