"""Stage-one integration checks. Run with an existing Playwright Python installation.
Start PORT=4174 npm run dev first; screenshots go outside the checkout by default.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('DREAMSCAPE_TEST_URL', 'http://127.0.0.1:4174')
OUT = Path(os.environ.get('DREAMSCAPE_SCREENSHOT_DIR', '/tmp/dreamscape-review'))
OUT.mkdir(exist_ok=True, parents=True)
passed = []

def record(message):
    passed.append(message)
    print('PASS:', message, flush=True)

def navigate(page, value):
    page.locator('#room-navigation').select_option(value)
    page.wait_for_function('(id) => location.hash === "#" + id && document.querySelector("#room-navigation").value === id', arg=value)

def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), page.evaluate("() => ({route:location.hash, width:document.documentElement.scrollWidth, viewport:innerWidth, nodes:[...document.querySelectorAll('body *')].map(n=>({cl:n.className,right:n.getBoundingClientRect().right})).filter(n=>n.right>innerWidth+1).slice(0,15)})")

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox', '--enable-unsafe-swiftshader'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, accept_downloads=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(BASE, wait_until='networkidle')
    expect(page.locator('.room-door')).to_have_count(9)
    expect(page.locator('.dreamscape-cosmos')).to_have_count(1)
    no_overflow(page)
    page.screenshot(path=str(OUT / 'home-desktop.png'), full_page=True)
    record('Home Hub has exactly nine approved rooms and one shared background')
    page.get_by_role('button', name='Explore a reference reading').click()
    expect(page.locator('.distilled')).to_have_text('Distilled from 2 dreams')
    expect(page.locator('.source-item')).to_have_count(2)
    page.screenshot(path=str(OUT / 'oracle-desktop.png'), full_page=True)
    page.locator('.source-item .source-link').first.click()
    expect(page.locator('dialog')).to_be_visible()
    expect(page.locator('.source-narrative')).to_contain_text('A fox waited beside the hearth')
    page.get_by_role('button', name='Close dialog').click()
    page.get_by_role('button', name='Save this study', exact=True).click()
    expect(page.locator('.history-row')).to_have_count(1)
    page.locator('.card-actions .favourite').click()
    navigate(page, 'collections')
    expect(page.locator('.treasure')).to_have_count(1)
    page.locator('.treasure-title').click()
    expect(page.locator('.distilled')).to_have_text('Distilled from 2 dreams')
    record('Sample reading opens its original sources, saves, favourites and reopens without regeneration')

    page.locator('#period-type').select_option('monthly')
    page.locator('#period-date').fill('2025-04-15')
    page.locator('#period-date').dispatch_event('change')
    page.get_by_role('button', name='Discover a supported thread').click()
    expect(page.locator('.empty')).to_contain_text('No reading has been invented')
    record('Missing April narratives do not produce a fabricated exemplar')

    # All room routes use the same mounted background; provider-dependent rooms disclose limits.
    background = page.locator('.dreamscape-cosmos').element_handle()
    for room in ['statistics', 'podcast', 'oracle', 'dream-journal', 'waking-journal', 'collections', 'luminous', 'insights', 'world']:
        navigate(page, room)
        assert page.locator('.dreamscape-cosmos').evaluate('(node, old) => node === old', background)
        no_overflow(page)
        assert 'tarot' not in page.locator('#room-content').inner_text().lower()
    # WebGL is required here: a fallback is not reported as passing rotating planets.
    page.wait_for_function('() => document.querySelector(".planet-loading").hidden', timeout=20000)
    expect(page.locator('.planet-link')).to_have_count(5)
    page.screenshot(path=str(OUT / 'dream-world-desktop.png'), full_page=True)
    page.get_by_role('button', name='The Hearthlands', exact=True).click()
    expect(page.locator('.territory-painting')).to_be_visible()
    assert page.locator('.territory-painting').evaluate('(img) => img.complete && img.naturalWidth > 0')
    page.get_by_role('button', name='Back to the planets').click()
    expect(page.locator('#world-landscape')).to_be_hidden()
    record('Nine routes preserve background continuity; five actual WebGL planets and Hearthlands painting load')

    page.get_by_role('button', name='Create private journal', exact=True).click()
    page.locator('[name=passphrase]').fill('private-test-journal-passphrase')
    page.locator('[name=repeat]').fill('private-test-journal-passphrase')
    page.get_by_role('button', name='Create my journal').click()
    expect(page.locator('#entry-form')).to_be_visible()
    expect(page.locator('.journal-entry')).to_have_count(0)
    record('Private journal starts empty, isolated from the public sample')

    def add_dream(title, date, narrative, tags='home'):
        form = page.locator('#entry-form')
        form.locator('[name=title]').fill(title)
        form.locator('[name=date]').fill(date)
        form.locator('[name=text]').fill(narrative)
        form.locator('[name=tags]').fill(tags)
        form.get_by_role('button', name='Save dream locally').click()
        expect(page.get_by_role('button', name=title).first).to_be_visible()

    add_dream('Private home A', '2025-04-04', 'I walked into a house. My private test sentence.', 'home, home')
    add_dream('Private home B', '2025-04-18', 'The kitchen opened into my home.')
    add_dream('Private sky', '2025-04-20', 'A bird flew across a dark sky.', 'bird')
    expect(page.locator('.journal-entry')).to_have_count(3)
    form = page.locator('#entry-form')
    form.locator('[name=text]').fill('A draft that should survive immediate navigation.')
    navigate(page, 'statistics')
    navigate(page, 'dream-journal')
    expect(page.locator('[name=text]')).to_have_value('A draft that should survive immediate navigation.')
    record('Private dreams persist; fast room navigation does not lose an unsaved draft')

    navigate(page, 'oracle')
    page.locator('#period-type').select_option('monthly')
    page.locator('#period-date').fill('2025-04-15')
    page.locator('#period-date').dispatch_event('change')
    page.get_by_role('button', name='Discover a supported thread').click()
    expect(page.locator('.distilled')).to_have_text('Distilled from 2 dreams')
    expect(page.locator('.analysed')).to_contain_text('3 dreams examined')
    assert 'Private sky' not in page.locator('.source-dreams').inner_text()
    page.get_by_role('button', name='Save this study', exact=True).click()
    expect(page.locator('.history-row')).to_have_count(1)
    page.locator('.card-actions .favourite').click()
    page.locator('.source-item .source-link').first.click()
    page.get_by_role('button', name='Edit this page').click()
    page.locator('#edit-form [name=text]').fill('I walked into a house. Edited private words.')
    page.get_by_role('button', name='Save changes locally').click()
    expect(page.locator('#reading-stale')).to_be_visible()
    assert 'I walked into a house.' in page.locator('.source-dreams').inner_text()  # Historical excerpt immutable.
    record('Personal Oracle excludes unrelated dreams; edits mark saved evidence stale without rewriting it')

    # Ciphertext contains no narrative and the local key is not persisted.
    stored = page.evaluate('''async () => {
      const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('dreamscape-encrypted-vault',1);r.onsuccess=()=>resolve(r.result);r.onerror=reject});
      const value=await new Promise((resolve,reject)=>{const r=db.transaction('vault').objectStore('vault').get('personal');r.onsuccess=()=>resolve(r.result);r.onerror=reject});db.close();return value;
    }''')
    assert 'private words' not in json.dumps(stored)
    assert set(stored) == {'salt', 'iv', 'ciphertext', 'revision'}
    page.get_by_role('button', name='Lock journal', exact=True).click()
    expect(page.locator('.local-label')).to_have_text('Your private journal is locked')
    assert 'Private home' not in page.locator('body').inner_text()
    page.get_by_role('button', name='Unlock private journal', exact=True).click()
    page.locator('[name=passphrase]').fill('an-incorrect-passphrase')
    page.get_by_role('button', name='Unlock my journal').click()
    expect(page.locator('#vault-error')).to_contain_text('could not unlock')
    page.locator('[name=passphrase]').fill('private-test-journal-passphrase')
    page.get_by_role('button', name='Unlock my journal').click()
    expect(page.locator('.journal-entry')).to_have_count(3)
    record('Vault stores only ciphertext; locking removes visible private data and incorrect passphrases fail safely')

    # Literal markup is text, never HTML execution.
    page.locator('[name=text]').fill('<img src=x onerror=alert(1)> A narrative with literal markup.')
    page.locator('[name=title]').fill('Literal markup')
    page.locator('[name=date]').fill('2025-04-25')
    page.get_by_role('button', name='Save dream locally').click()
    expect(page.locator('.journal-entry')).to_have_count(4)
    assert page.locator('#entry-list img').count() == 0
    with page.expect_download() as download_info:
        page.get_by_role('button', name='Export dreams', exact=True).click()
    exported = json.loads(Path(download_info.value.path()).read_text())
    assert len(exported['dreams']) == 4
    record('Narrative markup is safely escaped and dream export contains all four original records')

    navigate(page, 'waking-journal')
    page.locator('[name=title]').fill('Waking home')
    page.locator('[name=text]').fill('I was awake in my house.')
    page.locator('[name=date]').fill('2025-04-21')
    page.get_by_role('button', name='Save entry locally').click()
    expect(page.locator('.journal-entry')).to_have_count(1)
    navigate(page, 'statistics')
    page.locator('#period-type').select_option('monthly')
    page.locator('#period-date').fill('2025-04-15')
    page.locator('#period-date').dispatch_event('change')
    expect(page.locator('.stat-total strong')).to_have_text('4')
    record('Waking entries are separate and do not inflate dream statistics')

    # Wait for offline shell activation, reload with the network disconnected, unlock locally.
    page.evaluate('navigator.serviceWorker.ready')
    page.wait_for_function('() => !!navigator.serviceWorker.controller')
    context.set_offline(True)
    page.reload(wait_until='domcontentloaded')
    page.get_by_role('button', name='Unlock private journal', exact=True).click()
    page.locator('[name=passphrase]').fill('private-test-journal-passphrase')
    page.get_by_role('button', name='Unlock my journal').click()
    expect(page.locator('.journal-entry')).to_have_count(4)
    add_dream('Offline dream', '2025-04-26', 'My house was full of moonlight.')
    expect(page.locator('.journal-entry')).to_have_count(5)
    context.set_offline(False)
    record('Cached application reloads offline, unlocks and captures an encrypted dream without a server')
    expect(page.locator('#notifications')).to_be_empty(timeout=9000)

    for width, height, suffix in [(390, 844, 'mobile'), (768, 1024, 'tablet')]:
        page.set_viewport_size({'width': width, 'height': height})
        navigate(page, 'home')
        page.screenshot(path=str(OUT / f'home-{suffix}.png'), full_page=True)
        no_overflow(page)
        navigate(page, 'oracle')
        page.locator('.history-row>button').first.click()
        expect(page.locator('.oracle-pair')).to_be_visible()
        no_overflow(page)
        page.screenshot(path=str(OUT / f'oracle-{suffix}.png'), full_page=True)
        page.locator('.oracle-back .card-actions').scroll_into_view_if_needed()
        assert page.locator('.oracle-back .card-actions').is_visible()
        assert page.locator('.mantra').is_visible()
        if width == 390:
            assert page.locator('.oracle-back').bounding_box()['y'] > page.locator('.oracle-front').bounding_box()['y']
    record('Desktop, tablet and mobile cards are readable, scroll to their ends and have no horizontal overflow')

    page.emulate_media(reduced_motion='reduce')
    expect(page.locator('.dreamscape-cosmos')).to_have_attribute('data-paused', 'true')
    assert page.locator('.shooting-star').count() == 0
    page.screenshot(path=str(OUT / 'oracle-mobile-reduced-motion.png'), full_page=True)
    page.emulate_media(reduced_motion='no-preference')
    expect(page.locator('.dreamscape-cosmos')).to_have_attribute('data-paused', 'false')
    # Test a shooting-star instance directly with short intervals; production defaults remain 20–50s.
    result = page.evaluate('''async () => {
      const {DreamscapeCosmosBackground}=await import('/src/app/cosmos.js');
      const test=new DreamscapeCosmosBackground({shootingMin:100,shootingMax:150});
      await new Promise(r=>setTimeout(r,250));const shooting=!!test.element.querySelector('.shooting-star');
      test.dispose();return shooting;
    }''')
    assert result
    expect(page.locator('.dreamscape-cosmos')).to_have_count(1)
    record('Reduced motion disables decoration; timed shooting stars are actually emitted and cleaned up')

    for path, status in [('/.git/config', 404), ('/package.json', 404), ('/src/../.git/config', 404), ('/%E0%A4%A', 400), ('/src/app/app.js', 200), ('/assets/cosmos/original.avif', 200)]:
        response = context.request.get(BASE + path)
        assert response.status == status, (path, response.status)
    assert context.request.post(BASE + '/').status == 405
    record('Static server rejects repository secrets, malformed paths and unsupported writes')

    # Long private test evidence checks are isolated to this disposable browser context.
    page.get_by_role('button', name='Journal privacy and settings').click()
    page.once('dialog', lambda d: d.accept())
    page.get_by_role('button', name='Delete this device’s journal').click()
    expect(page.locator('.local-label')).to_have_text('Your private journal is locked')
    assert not page.evaluate('''async () => {
      const db=await new Promise(r=>{const x=indexedDB.open('dreamscape-encrypted-vault',1);x.onsuccess=()=>r(x.result)});
      return await new Promise(r=>{const x=db.transaction('vault').objectStore('vault').get('personal');x.onsuccess=()=>{db.close();r(!!x.result)}});
    }''')
    assert not errors, errors
    record('Journal deletion removes local ciphertext; no uncaught browser errors occurred')
    browser.close()

(OUT / 'results.json').write_text(json.dumps({'passed': passed, 'screenshots': sorted(p.name for p in OUT.glob('*.png'))}, indent=2))
print(f'{len(passed)} browser integration groups passed. Screenshots: {OUT}', flush=True)
