"""Verify the exact static artifact intended for Vercel, without a database/API backend."""
import json, os, threading, functools
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parent.parent
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0]=='/dream-world-reference':self.path=self.path.replace('/dream-world-reference','/dream-world-reference.html',1)
        return super().do_GET()
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',4182),functools.partial(Handler,directory=str(ROOT/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--disable-dev-shm-usage'])
    a=browser.new_context(viewport={'width':1440,'height':1050});b=browser.new_context(viewport={'width':390,'height':844})
    page=a.new_page();errors=[];requests=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
    page.goto('http://127.0.0.1:4182');expect(page.locator('.room-door')).to_have_count(9);expect(page.locator('.preview-notice')).to_contain_text('Fictional dreams')
    assert page.locator('#auth-form').count()==0
    for room in ['statistics','podcast','oracle','dream-journal','waking-journal','collections','luminous','insights','account']:
        page.goto('http://127.0.0.1:4182/#'+room);expect(page.locator('h1')).to_be_visible();assert page.locator('#auth-form').count()==0,room
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),room
    page.goto('http://127.0.0.1:4182/#oracle');expect(page.locator('.distilled')).to_have_text('Distilled from 3 dreams');assert '4 dreams analysed' in page.locator('.reading-meta').inner_text()
    page.locator('.evidence-list .source-link').first.click();expect(page.locator('[name=title]')).to_have_value('Demo: The house of lanterns')
    page.locator('[name=title]').fill('Demo: Edited in browser A');page.get_by_role('button',name='Save changes',exact=True).click();expect(page.locator('.entry-list')).to_contain_text('Demo: Edited in browser A')
    page.reload();expect(page.locator('.entry-list')).to_contain_text('Demo: Edited in browser A')
    second=b.new_page();second.goto('http://127.0.0.1:4182/#dream-journal');expect(second.locator('.entry-list')).to_contain_text('Demo: The house of lanterns');assert 'Edited in browser A' not in second.locator('.entry-list').inner_text()
    for room in ['home','oracle','statistics','collections','luminous','podcast','insights','waking-journal']:
        second.goto('http://127.0.0.1:4182/#'+room);expect(second.locator('h1')).to_be_visible();assert not second.evaluate('document.documentElement.scrollWidth>innerWidth'),room
    page.goto('http://127.0.0.1:4182/#account');page.once('dialog',lambda d:d.accept());page.get_by_role('button',name='Restore demonstration data').click()
    page.goto('http://127.0.0.1:4182/#dream-journal');expect(page.locator('.entry-list')).to_contain_text('Demo: The house of lanterns');assert 'Edited in browser A' not in page.locator('.entry-list').inner_text()
    page.goto('http://127.0.0.1:4182/#dream-world');page.locator('iframe').scroll_into_view_if_needed();frame=page.frame_locator('iframe');expect(frame.locator('.territory-world')).to_have_count(5,timeout=30000)
    box=frame.locator('[data-world=hearthlands]').bounding_box();page.mouse.click(box['x']+box['width']/2,box['y']+box['height']/2);expect(frame.locator('.atlas')).to_have_attribute('data-state','hearth',timeout=10000);assert frame.locator('.flatmap-art').evaluate('(e)=>e.complete&&e.naturalWidth>0')
    frame.locator('.return-world').click();expect(frame.locator('.atlas')).to_have_attribute('data-state','orbit',timeout=10000)
    with page.expect_event('framenavigated',predicate=lambda f:'corpus=natalie' in f.url) as navigation:page.get_by_role('button',name='Explore the Natalie reference').click()
    expect(navigation.value.locator('#natalie-gl')).to_be_visible(timeout=30000)
    assert not errors,errors
    assert not any('/api/' in r for r in requests),'Public demo called a backend API'
    assert all(r.startswith('http://127.0.0.1:4182') or r.startswith('blob:') for r in requests),'Unexpected external request'
    artifacts=Path('/tmp/dreamscape-preview-review');artifacts.mkdir(exist_ok=True)
    page.goto('http://127.0.0.1:4182');page.screenshot(path=str(artifacts/'home.png'),full_page=True)
    page.goto('http://127.0.0.1:4182/#oracle');page.screenshot(path=str(artifacts/'oracle.png'),full_page=True)
    print('PASS: exact static deployment artifact; all nine rooms without login; fictional source-backed reading; edits/reload; separate browsers; restore demo; both world renderers/map entry/return; mobile layout; zero API/provider requests or page errors.')
    browser.close()
finally:server.shutdown();server.server_close()
