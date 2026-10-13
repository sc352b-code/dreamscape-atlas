"""Exercise real browser behaviour against an isolated temporary Dreamscape database.
Requires Python Playwright and system Chromium; no TLS verification bypasses.
"""
import json, os, subprocess, tempfile, time
from pathlib import Path
from urllib.request import urlopen
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parent.parent
ARTIFACTS=Path('/tmp/dreamscape-review');ARTIFACTS.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix='dreamscape-browser-') as temp:
    env=dict(os.environ,PORT='4181',DREAMSCAPE_ORIGIN='http://localhost:4181',DREAMSCAPE_DB=str(Path(temp)/'app.sqlite'))
    server=subprocess.Popen(['node','server.js'],cwd=ROOT,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    try:
        for _ in range(60):
            try:
                urlopen('http://localhost:4181',timeout=1).close();break
            except Exception:time.sleep(.1)
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage'])
            context=browser.new_context(viewport={'width':1440,'height':1050})
            page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto('http://localhost:4181');expect(page.locator('.room-door')).to_have_count(9)
            page.screenshot(path=str(ARTIFACTS/'home-desktop.png'),full_page=True)
            page.get_by_role('link',name='DREAM JOURNAL',exact=True).first.click()
            page.locator('[name=email]').fill('browser-fixture@example.test');page.locator('[name=password]').fill('browser fixture passphrase')
            page.get_by_role('button',name='Create account',exact=True).click();expect(page.get_by_role('button',name='＋ Record a dream')).to_be_visible()
            page.get_by_role('button',name='＋ Record a dream').click()
            page.locator('[name=title]').fill('QA: The lantern house');page.locator('[name=date]').fill('2025-04-01')
            page.locator('[name=text]').fill('I found a house with amber windows. I felt curious.')
            page.locator('[name=tags]').fill('house, amber');page.locator('[name=numinous]').check()
            page.get_by_role('button',name='Save this dream',exact=True).click();expect(page.locator('.journal-entry')).to_have_count(1)
            fixture={'entries':[
                {'kind':'dream','date':'2025-04-02','title':'QA: A quiet kitchen','text':'I entered a kitchen and saw bread on the table.','tags':['kitchen'],'flags':{}},
                {'kind':'dream','date':'2025-04-03','title':'QA: A cottage','text':'I walked towards a cottage beside a field.','tags':['cottage'],'flags':{}},
                {'kind':'dream','date':'2025-04-04','title':'QA: The concert','text':'I listened to music in a theatre.','tags':['music'],'flags':{}}]}
            page.locator('#import-file').set_input_files({'name':'qa-fixture.json','mimeType':'application/json','buffer':json.dumps(fixture).encode()})
            expect(page.locator('.journal-entry')).to_have_count(4)
            page.screenshot(path=str(ARTIFACTS/'journal-desktop.png'),full_page=True)
            page.goto('http://localhost:4181/#oracle');page.locator('[name=anchor]').fill('2025-04-15')
            page.get_by_role('button',name='Create evidence reflection').click();expect(page.locator('.oracle-pair')).to_be_visible()
            expect(page.locator('.distilled')).to_have_text('Distilled from 3 dreams')
            expect(page.locator('.evidence-list article')).to_have_count(3)
            assert '4 dreams analysed' in page.locator('.reading-meta').inner_text()
            assert 'QA: The concert' not in page.locator('.evidence-list').inner_text()
            page.screenshot(path=str(ARTIFACTS/'oracle-desktop.png'),full_page=True)
            page.locator('.reading-meta .favourite').click();expect(page.locator('.reading-meta .favourite')).to_have_attribute('aria-pressed','true')
            page.locator('.evidence-list .source-link').first.click();expect(page.locator('[name=text]')).to_have_value('I found a house with amber windows. I felt curious.')
            page.goto('http://localhost:4181/#oracle');page.locator('.reading-history button[data-action=reading]').first.click();expect(page.locator('.distilled')).to_have_text('Distilled from 3 dreams')
            # Long lists remain scrollable and all source links exist.
            long_fixture={'entries':[{'kind':'dream','date':f'2025-04-{i:02}','title':f'QA: Long source {i}','text':'I visited a house and stayed in a kitchen. '+('Detailed memory. '*30),'tags':['house']} for i in range(5,29)]}
            page.evaluate("async data => {const r=await fetch('/api/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw Error(await r.text());}",long_fixture)
            page.reload();page.locator('[name=anchor]').fill('2025-04-15');page.get_by_role('button',name='Create evidence reflection').click()
            expect(page.locator('.evidence-list article')).to_have_count(27)
            assert page.locator('.evidence-list').evaluate('(e)=>e.scrollHeight>e.clientHeight')
            page.locator('.evidence-list').evaluate('(e)=>e.scrollTop=e.scrollHeight')
            expect(page.locator('.evidence-list article').last).to_be_visible()
            # All rooms resolve; no invented Tarot navigation.
            for route in ['statistics','insights','collections','luminous','podcast']:
                page.goto('http://localhost:4181/#'+route);expect(page.locator('h1')).to_be_visible()
                assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
            page.goto('http://localhost:4181/#statistics');page.locator('[name=anchor]').fill('2025-04-15');page.get_by_role('button',name='Explore this period').click()
            expect(page.locator('.stat-constellation div').first.locator('b')).to_have_text('28')
            page.screenshot(path=str(ARTIFACTS/'statistics-desktop.png'),full_page=True)
            # User-owned offline draft is persisted across reload and synced exactly once.
            page.goto('http://localhost:4181/#dream-journal');page.get_by_role('button',name='＋ Record a dream').click()
            context.set_offline(True);page.locator('[name=title]').fill('QA: Captured offline');page.locator('[name=date]').fill('2025-04-29');page.locator('[name=text]').fill('I found a house beneath the stars.')
            page.get_by_role('button',name='Save this dream',exact=True).click();expect(page.locator('.local-drafts')).to_contain_text('waiting to synchronise')
            page.reload();expect(page.locator('.offline-banner')).to_be_visible();expect(page.locator('.local-drafts')).to_contain_text('QA: Captured offline')
            context.set_offline(False);expect(page.locator('.journal-entry').filter(has_text='QA: Captured offline')).to_have_count(1,timeout=10000)
            expect(page.locator('.local-drafts')).to_have_count(0)
            # Preserved rotating planets execute with packaged renderer and shared outer cosmos.
            page.goto('http://localhost:4181/#dream-world');frame=page.frame_locator('iframe');expect(frame.locator('.territory-cosmos__gl')).to_be_visible(timeout=30000);expect(frame.locator('.territory-world')).to_have_count(5)
            page.wait_for_timeout(1800);page.screenshot(path=str(ARTIFACTS/'dream-world-desktop.png'),full_page=True)
            assert frame.locator('.cosmic-art').evaluate('(e)=>getComputedStyle(e).display')=='none'
            box=frame.locator('[data-world=hearthlands]').bounding_box();page.mouse.click(box['x']+box['width']/2,box['y']+box['height']/2);expect(frame.locator('.atlas')).to_have_attribute('data-state','hearth',timeout=10000);assert frame.locator('.flatmap-art').evaluate('(e)=>e.complete && e.naturalWidth>0')
            frame.locator('.return-world').click();expect(frame.locator('.territory-cosmos__gl')).to_be_visible(timeout=10000)
            with page.expect_event('framenavigated',predicate=lambda f:'corpus=natalie' in f.url) as navigation:
                page.get_by_role('button',name='Explore the Natalie reference').click()
            natalie_frame=navigation.value
            expect(natalie_frame.locator('#natalie-gl')).to_be_visible(timeout=30000)
            page.wait_for_timeout(1800)
            assert 'TAROT' not in natalie_frame.locator('body').inner_text().upper()
            page.screenshot(path=str(ARTIFACTS/'natalie-desktop.png'),full_page=True)
            # Mobile overflow, full card text, bottom-of-page access and reduced motion.
            page.set_viewport_size({'width':390,'height':844})
            for route in ['home','oracle','dream-journal','statistics','collections','dream-world','account']:
                page.goto('http://localhost:4181/#'+route);expect(page.locator('h1')).to_be_visible()
                if route=='oracle':page.locator('.reading-history button[data-action=reading]').last.click()
                if route=='dream-world':
                    page.get_by_role('button',name='Explore the Sam reference').click();page.locator('iframe').scroll_into_view_if_needed();expect(page.frame_locator('iframe').locator('.territory-world')).to_have_count(5,timeout=30000);page.wait_for_timeout(1800)
                page.locator('h1').click()
                assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'),route
                page.screenshot(path=str(ARTIFACTS/(route+'-mobile.png')),full_page=True)
            page.emulate_media(reduced_motion='reduce');page.goto('http://localhost:4181/#home')
            assert page.locator('.cosmos-art').evaluate('(e)=>getComputedStyle(e).animationName')=='none'
            assert page.locator('.shooting-star').count()==0
            keyboard_page=context.new_page();keyboard_page.goto('http://localhost:4181/#oracle');expect(keyboard_page.locator('h1')).to_have_text('Oracle Cards');keyboard_page.keyboard.press('Tab');expect(keyboard_page.locator('.skip-link')).to_be_focused();keyboard_page.keyboard.press('Enter');expect(keyboard_page.locator('#room')).to_be_focused();assert keyboard_page.url.endswith('#oracle');keyboard_page.close()
            assert not errors,errors
            browser.close()
            print('PASS: browser journal/import → 3-of-4 evidence reflection → original source → saved history/favourites; long-list scrolling; counts; all room routes; offline reload/sync; both preserved worlds; desktop/mobile; reduced motion; keyboard skip link. No page errors.')
            print('Screenshots:',ARTIFACTS)
    finally:
        server.terminate()
        try:server.wait(timeout=5)
        except subprocess.TimeoutExpired:server.kill();server.wait()
