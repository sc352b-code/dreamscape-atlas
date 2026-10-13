import { ROOMS, roomById } from './rooms.js';
import { DreamscapeCosmosBackground } from './cosmos.js';
import { periodBounds, selectDreams, validateRecord, importDreams, observations, createEvidenceStudy, corpusVersion, validateEvidence } from './evidence.js';
import { blankData, storedVault, createVault, unlockVault, saveVault, deleteVault } from './vault.js';
import { mountPlanets } from './planets.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
const formatDate = value => new Date(value + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London' });
const PERIODS = ['weekly', 'monthly', 'quarterly', 'six-monthly', 'yearly'];
const root = document.querySelector('#app'), dialog = document.querySelector('#dream-dialog');
const cosmos = new DreamscapeCosmosBackground();
let data = blankData(), session = null, mode = 'locked', hasVault = false, periodType = 'monthly', anchor = today(), reading = null, search = '', cleanup = () => {}, drawNumber = 0, saving = Promise.resolve(), samplePromise;

function notify(message) { const node = document.querySelector('#notifications'); node.textContent = message; clearTimeout(notify.timer); notify.timer = setTimeout(() => { node.textContent = ''; }, 6500); }
function report(error) { notify(error.message || 'That action could not be completed.'); }
const allEntries = () => [...data.dreams, ...data.waking];
const isFavourite = (type, id) => data.favourites.some(f => f.type === type && f.id === id);
const favouriteButton = (type, id) => `<button class="favourite" data-action="favourite" data-type="${type}" data-id="${escape(id)}" aria-label="${isFavourite(type, id) ? 'Remove from' : 'Add to'} favourites" aria-pressed="${isFavourite(type, id)}">${isFavourite(type, id) ? '★' : '☆'}</button>`;
const evidenceLink = record => `<button class="source-link" data-action="source" data-id="${escape(record.id || record.dreamId)}"><span>${formatDate(record.date)}</span><strong>${escape(record.title)}</strong><span aria-hidden="true">↗</span></button>`;
function route() { return location.hash.slice(1) || 'home'; }
function go(id) { if (route() === id) render(); else location.hash = id; }
function currentPeriod() { return periodBounds(periodType, anchor); }
function periodControls() {
  return `<div class="period-controls"><label>Dream period<select id="period-type">${PERIODS.map(p => `<option value="${p}" ${p === periodType ? 'selected' : ''}>${p[0].toUpperCase() + p.slice(1)}</option>`).join('')}</select></label><label>A date within that period<input id="period-date" type="date" min="1900-01-01" max="2200-12-31" value="${anchor}"></label></div>`;
}
function intro(room, extra = '') { return `<header class="room-intro"><p class="eyebrow">${escape(room.name)}</p><h1>${room.title}</h1><p>${room.cue}.</p>${extra}</header>`; }
function localNotice() { return mode === 'sample' ? '<span class="sample-label">Reference sample · not your dreams</span>' : mode === 'private' ? '<span class="local-label">Encrypted on this device · no cloud backup</span>' : '<span class="local-label">Your private journal is locked</span>'; }
function empty(message, actions = '') { return `<section class="empty manuscript"><span class="empty-star" aria-hidden="true">✧</span><h2>A little space for what comes next</h2><p>${message}</p>${actions}</section>`; }
function vaultPrompt() { return empty('Open your private journal to begin, or explore the three clearly labelled reference dreams.', '<button class="gold-button" data-action="vault">Open private journal</button><button class="text-button" data-action="sample">Explore reference sample</button>'); }

async function mutate(change) {
  // Read the newest state inside the queue, preventing rapid actions from overwriting each other.
  const task = saving.catch(() => {}).then(async () => {
    const next = structuredClone(data); change(next);
    if (mode === 'private') await saveVault(next, session);
    else if (mode === 'sample') localStorage.setItem('dreamscape-public-sample-v1', JSON.stringify(next));
    else throw new Error('Open a private journal first.');
    data = next;
  });
  saving = task; return task;
}
function download(value, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function loadSample() {
  if (!samplePromise) samplePromise = fetch('/sample-corpus.json').then(r => { if (!r.ok) throw new Error('The reference sample could not load.'); return r.json(); }).catch(e => { samplePromise = null; throw e; });
  const corpus = await samplePromise;
  let cached; try { cached = JSON.parse(localStorage.getItem('dreamscape-public-sample-v1') || 'null'); } catch { /* Restore the public sample if cache is damaged. */ }
  data = cached?.schema === 1 ? cached : blankData(); data.dreams = corpus.dreams.map(d => validateRecord(d));
  session = null; mode = 'sample'; periodType = 'quarterly'; anchor = '2026-05-14'; reading = null;
}

function home() {
  return `<section class="home-hero"><div class="hero-copy"><p class="eyebrow">A UNIVERSE WITHIN YOU</p><h1>Every dream,<br>a doorway.</h1><p class="hero-description">One dream is a page.<br>Together, they tell your unfolding story.</p><div class="hero-actions"><button class="gold-button" data-action="record">Capture a dream <span aria-hidden="true">↗</span></button><button class="text-button" data-action="sample-reading">Explore a reference reading →</button></div><p class="quiet">Your words. Your meanings. Your Dreamscape.</p></div><div class="hero-artefact"><div class="artefact-orbit" aria-hidden="true"></div><img src="/assets/reference/illuminated-figure.png" alt="Preserved painterly reference: a woman beneath celestial light" fetchpriority="high"><span class="artefact-caption">An illuminated world of your own</span></div></section><section class="room-garden" aria-labelledby="rooms-title"><div class="garden-heading"><span class="gold-rule"></span><p id="rooms-title" class="eyebrow">NINE ROOMS · ONE LIVING COSMOS</p><span class="gold-rule"></span></div><div class="constellation">${ROOMS.map((room, i) => `<a class="room-door door-${i}" href="#${room.id}"><span class="door-sigil" aria-hidden="true">${room.symbol}</span><span class="door-title">${room.name}</span><span class="door-cue">${room.cue}</span></a>`).join('')}</div></section><p class="stage-note">A working first chapter: private local journaling, evidence studies, favourites and the preserved Dream World artwork. Cloud accounts and generated audio and artwork are still to come.</p>`;
}
function oracle() {
  const room = roomById('oracle');
  const selected = selectDreams(data.dreams, currentPeriod());
  let cards = '';
  if (reading?.status === 'complete') {
    cards = `<p id="reading-stale" class="reading-stale" hidden>These cards preserve an earlier version of your dreams. Generate deliberately to create a new study.</p><section class="oracle-pair" aria-label="Oracle front and source companion"><article class="oracle-front illuminated-card"><div class="card-corner corner-left" aria-hidden="true">✦</div><div class="card-corner corner-right" aria-hidden="true">☾</div><p class="card-period">${formatDate(reading.period.start)} – ${formatDate(reading.period.end)}</p><h2>${escape(reading.title)}</h2><p class="common-thread">${escape(reading.thread)}</p><figure class="oracle-art"><img src="${reading.artwork}" alt="Existing painterly reference of a woman in a moonlit garden"><figcaption>Reference artwork · not personalised to these dreams</figcaption></figure><div class="card-section"><h3>Message</h3><p>${escape(reading.message)}</p></div><div class="card-section invitation"><h3>Invitation</h3><p>${escape(reading.invitation)}</p></div><div class="card-section mantra"><h3>Mantra</h3><p>${escape(reading.mantra)}</p></div>${reading.personalAssociation ? `<div class="card-section"><h3>Your association</h3><p>${escape(reading.personalAssociation)}</p></div>` : ''}<p class="card-footnote">An evidence study for reflection. AI interpretation is not connected.</p></article><article class="oracle-back illuminated-card"><div class="evidence-star" aria-hidden="true">✶</div><h2>Dreams Used</h2><p class="distilled">Distilled from ${reading.evidence.length} dreams</p><p class="analysed">${reading.analysedCount} dreams examined · ${reading.evidence.length} supporting sources</p><div class="source-dreams">${reading.evidence.map(item => `<section class="source-item">${evidenceLink(item)}<blockquote>“${escape(item.excerpt)}”</blockquote><p>${escape(item.rationale)}</p></section>`).join('')}</div><div class="method-note"><h3>How this thread was found</h3><p>Every dream in the period was checked for explicit recurring imagery. Only original passages that match this thread are included. This first-stage method cannot identify subtle psychological themes.</p><p>${escape(reading.confidence)}</p><p>Jungian, Adlerian and transpersonal interpretation will be available once the analysis service is connected.</p></div><div class="card-actions"><button class="gold-button" data-action="save-reading">${data.readings.some(r => r.id === reading.id) ? 'Saved in history' : 'Save this study'}</button>${favouriteButton('reading', reading.id)}</div></article></section>`;
  } else if (reading?.status === 'insufficient') cards = empty(escape(reading.reason));
  else cards = empty(selected.length ? 'Choose a period, then discover a thread supported by at least two original narratives. The front holds a reflection; the back opens its sources.' : 'There are no dreams in this period. The April 2025 exemplar needs the actual April narratives; its illustrated list is not source evidence. Choose another period, import dreams or explore the reference sample.', '<button class="text-button" data-action="sample-reading">Explore the reference study →</button>');
  return intro(room) + `<section class="oracle-toolbar manuscript">${periodControls()}<div class="period-summary"><p>${formatDate(currentPeriod().start)} – ${formatDate(currentPeriod().end)}<br><strong>${selected.length}</strong> ${selected.length === 1 ? 'dream' : 'dreams'} available</p><button class="gold-button" data-action="generate" ${mode === 'locked' ? 'disabled' : ''}>Discover a supported thread <span aria-hidden="true">✧</span></button></div></section><p class="method-label">First-stage evidence study · original passages, transparent selection · no paid generation</p>${cards}<section class="reading-history manuscript"><h2>Your saved studies</h2>${data.readings.length ? data.readings.map(r => `<div class="history-row"><button data-action="history" data-id="${r.id}"><span>${formatDate(r.period.start)} – ${formatDate(r.period.end)}</span><strong>${escape(r.title)}</strong></button>${favouriteButton('reading', r.id)}</div>`).join('') : '<p>Save a study to return to it without generating again.</p>'}</section>`;
}
function journal(kind) {
  const waking = kind === 'waking', room = roomById(waking ? 'waking-journal' : 'dream-journal');
  if (mode === 'locked') return intro(room) + vaultPrompt();
  const entries = waking ? data.waking : data.dreams;
  const shown = entries.filter(d => `${d.title} ${d.text} ${d.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date));
  const draft = data.drafts[kind] || {};
  return intro(room) + (mode === 'sample' ? '<p class="notice">You are browsing reference dreams. Open a private journal to write your own.</p><button class="gold-button" data-action="vault">Open private journal</button>' : `<form id="entry-form" class="journal-form manuscript" data-kind="${kind}"><div class="form-row"><label>Title <span class="optional">(or let your first sentence name it)</span><input name="title" value="${escape(draft.title || '')}" maxlength="160" autocomplete="off"></label><label>${waking ? 'Entry' : 'Dream'} date<input name="date" type="date" min="1900-01-01" max="2200-12-31" value="${draft.date || today()}" required></label></div><label class="narrative-label">${waking ? 'What would you like to remember?' : 'What do you remember?'}<textarea name="text" rows="8" maxlength="100000" required placeholder="There is no right way to begin. A place, a feeling, a single image…">${escape(draft.text || '')}</textarea></label><div class="form-row"><label>Tags <span class="optional">(separate with commas)</span><input name="tags" value="${escape(draft.tags || '')}" placeholder="home, water, mother"></label><label>Feelings <span class="optional">(your own words)</span><input name="emotion" value="${escape(draft.emotion || '')}" placeholder="wonder, uncertainty"></label></div>${waking ? '<p class="quiet">Waking entries are kept separate and never counted as dream evidence.</p>' : `<fieldset class="dream-flags"><legend>How you experienced this dream</legend>${[['numinous', 'Numinous'], ['lucid', 'Lucid'], ['directMessage', 'Direct message'], ['significant', 'Personally significant']].map(([key, label]) => `<label><input type="checkbox" name="${key}" ${draft[key] ? 'checked' : ''}>${label}</label>`).join('')}</fieldset>`}<div class="form-bottom"><span id="draft-status" role="status">${draft.text ? 'Draft saved encrypted on this device.' : 'Drafts save on this device as you write.'}</span><button class="gold-button" type="submit">Save ${waking ? 'entry' : 'dream'} locally →</button></div><p class="quiet">No cloud synchronisation is connected. Export a backup to keep a copy elsewhere. Voice, audio, photo and PDF transcription are not available yet.</p></form>`)+ `<section class="journal-shelf manuscript"><div class="shelf-heading"><h2>${waking ? 'Your waking pages' : 'Your dream pages'}</h2><input id="journal-search" aria-label="Search entries" type="search" placeholder="Search your pages…" value="${escape(search)}"><button class="text-button" data-action="export-entries" data-kind="${kind}">Export ${waking ? 'entries' : 'dreams'}</button>${!waking && mode === 'private' ? '<label class="import-button">Import dream JSON<input id="dream-import" type="file" accept="application/json,.json" hidden></label>' : ''}</div><div id="entry-list">${shown.map(d => `<div class="journal-entry">${evidenceLink(d)}<p>${escape(d.text.slice(0, 190))}${d.text.length > 190 ? '…' : ''}</p><div class="entry-tags">${d.tags.map(t => `<span>${escape(t)}</span>`).join('')}${favouriteButton(waking ? 'waking' : 'dream', d.id)}</div></div>`).join('') || '<p>No entries here yet.</p>'}</div></section>`;
}
function statistics(insights = false) {
  const room = roomById(insights ? 'insights' : 'statistics'); const dreams = selectDreams(data.dreams, currentPeriod()), stats = observations(dreams);
  if (mode === 'locked') return intro(room) + vaultPrompt();
  const bars = (items, label) => `<section class="pattern-section"><h2>${label}</h2>${items.length ? items.slice(0, 12).map(item => `<div class="pattern-row"><button data-action="pattern" data-ids="${escape(item.ids.join(','))}" data-label="${escape(item.label)}">${escape(item.label)}<span>${item.count} / ${stats.total} dreams · ${item.percent}%</span></button><div class="pattern-track"><i style="width:${item.percent}%"></i></div></div>`).join('') : '<p>Record your own labels in the journal to see this pattern.</p>'}</section>`;
  return intro(room) + `<section class="manuscript">${periodControls()}<p class="quiet">${formatDate(currentPeriod().start)} – ${formatDate(currentPeriod().end)} · counts use dream dates, not import dates</p></section>${stats.total ? `<section class="manuscript ${insights ? 'insights-manuscript' : 'observatory'}"><div class="stat-total"><strong>${stats.total}</strong><span>dreams in this period</span></div>${insights ? '<p class="insight-intro">Each image is a beginning, rather than an answer. These pages bring together what you recorded, so you can explore your own connections.</p>' : ''}<div class="stat-flags">${[['Numinous', stats.numinous], ['Lucid', stats.lucid], ['Direct message', stats.directMessage]].map(([name, n]) => `<div><strong>${n}</strong><span>${name}</span><small>${Math.round(n / stats.total * 100)}% of ${stats.total} dreams</small></div>`).join('')}</div><p class="quiet">Flags are your own labels. They may overlap; percentages are not parts of a pie.</p>${bars(stats.tags, 'Images that return')}${bars(stats.emotions, 'The feelings you named')}<details><summary>Open every source in this period</summary>${dreams.map(evidenceLink).join('')}</details><p class="quiet">${insights ? 'This is a live factual digest. Interpretive reports, period comparisons and saved report history are still to come.' : 'This first observatory counts recorded tags and feelings. People extraction, interpretive categories and period comparisons are still to come.'}</p></section>` : empty('No dreams in the selected period. Try another date or add a dream.')}`;
}
function collections() {
  const room = roomById('collections');
  const content = data.favourites.map(f => {
    if (f.type === 'reading') { const r = data.readings.find(x => x.id === f.id); return r ? `<article class="treasure"><img src="${r.artwork}" alt="Reference illustration"><div><p class="eyebrow">ORACLE EVIDENCE STUDY</p><button class="treasure-title" data-action="history" data-id="${r.id}">${escape(r.title)}</button><p>${formatDate(r.period.start)} – ${formatDate(r.period.end)}</p>${favouriteButton(f.type, f.id)}</div></article>` : ''; }
    const d = allEntries().find(x => x.id === f.id); return d ? `<article class="treasure manuscript"><div><p class="eyebrow">${d.kind === 'waking' ? 'WAKING PAGE' : 'DREAM PAGE'}</p>${evidenceLink(d)}<p>${escape(d.text.slice(0, 200))}</p>${favouriteButton(f.type, f.id)}</div></article>` : '';
  }).join('');
  return intro(room) + (mode === 'locked' ? vaultPrompt() : content ? `<div class="treasure-shelf">${content}</div><p class="quiet">These favourites link to your saved originals. Named collections and other media types will follow.</p>` : empty('Choose the star beside a dream or a saved Oracle study. Your treasures will gather here.'));
}
function luminous() {
  const room = roomById('luminous'); const dreams = data.dreams.filter(d => d.numinous || d.lucid || d.directMessage || d.significant);
  return intro(room) + (mode === 'locked' ? vaultPrompt() : `<p class="method-label">Significance is yours to name. Dreamscape does not verify a supernatural source.</p>${dreams.length ? `<section class="manuscript luminous-pages">${dreams.sort((a, b) => b.date.localeCompare(a.date)).map(d => `<article>${evidenceLink(d)}<p>${escape(d.text)}</p>${favouriteButton('dream', d.id)}</article>`).join('')}</section>` : empty('Mark a dream as numinous, lucid, direct-message or personally significant in your journal. It will appear here.')}`);
}
function world() {
  return intro(roomById('world')) + `<p class="reference-notice">Preserved Sam geography reference · these five approved worlds are not generated from your local journal.</p><div id="preserved-planets" class="planet-stage"></div><section id="world-landscape" class="landscape manuscript" hidden></section><p class="stage-note">The approved paintings and rotating planets are preserved. Full corpus-derived cartography, Family Home interactions and private source records will be integrated in the next Dream World stage. Oracle Cards remains a separate room.</p>`;
}
function podcast() { return intro(roomById('podcast')) + `<section class="listening-chamber manuscript"><div class="listening-orb" aria-hidden="true">≋</div><h2>A place to listen deeply</h2><p>Personalised audio needs a licensed voice provider and a source-grounded writing service. Neither is connected yet, so no audio has been generated.</p><p>Your dream journal and source evidence are ready for that next stage.</p><a class="gold-button" href="#dream-journal">Return to your dream pages →</a></section>`; }

async function render({ preserveScroll = false } = {}) {
  await cleanup(); cleanup = () => {}; const ticket = ++drawNumber; const previousScroll = scrollY;
  let id = route(); if (id !== 'home' && !roomById(id)) { history.replaceState(null, '', '#home'); id = 'home'; }
  cosmos.setRoom(id); const room = roomById(id);
  document.title = `${room?.name || 'Your living dream universe'} — Dreamscape`;
  let content;
  try {
    content = { home, oracle, 'dream-journal': () => journal('dream'), 'waking-journal': () => journal('waking'), statistics: () => statistics(false), insights: () => statistics(true), collections, luminous, world, podcast }[id]();
  } catch (e) { content = empty('This room could not open. Your saved journal has not changed.'); report(e); }
  root.innerHTML = `<header class="app-header"><a class="wordmark" href="#home" aria-label="Dreamscape Home Hub"><span aria-hidden="true">✦</span><span>DREAMSCAPE<small>YOUR LIVING DREAM UNIVERSE</small></span></a><nav aria-label="Primary navigation"><a class="home-link" href="#home" ${id === 'home' ? 'aria-current="page"' : ''}>Home Hub</a><label class="room-picker"><span class="sr-only">Choose a room</span><select id="room-navigation"><option value="home">Explore the rooms</option>${ROOMS.map(r => `<option value="${r.id}" ${r.id === id ? 'selected' : ''}>${r.name}</option>`).join('')}</select></label><button class="header-record" data-action="record" aria-label="Record a dream">＋ <span>Record a dream</span></button><button class="privacy-button" data-action="privacy" aria-label="Journal privacy and settings">${mode === 'private' ? '◈' : '◇'}</button></nav></header><div class="session-strip">${localNotice()}<button class="text-button" data-action="${mode === 'private' ? 'lock' : 'vault'}">${mode === 'private' ? 'Lock journal' : hasVault ? 'Unlock private journal' : 'Create private journal'}</button></div><main id="room-content" tabindex="-1">${content}</main><footer class="app-footer"><a href="#home">Return to the Home Hub</a><button data-action="guide">A little guidance</button><button data-action="privacy">Your privacy & data</button><span>Made of dreams. Grounded in your words.</span></footer>`;
  if (!preserveScroll) { scrollTo({ top: 0, behavior: 'instant' }); root.querySelector('main').focus({ preventScroll: true }); }
  else scrollTo({ top: previousScroll, behavior: 'instant' });
  bindForms();
  if (id === 'world') cleanup = mountPlanets(root.querySelector('#preserved-planets'), showLandscape);
  if (id === 'oracle' && reading?.version) { const version = await corpusVersion(data.dreams); if (ticket === drawNumber) root.querySelector('#reading-stale').hidden = reading.version === version; }
}
function showLandscape(world) {
  const panel = document.querySelector('#world-landscape'); if (!panel) return;
  panel.hidden = false;
  panel.innerHTML = `<div class="shelf-heading"><h2>${escape(world.name)}</h2><button class="text-button" data-action="back-planets">↑ Back to the planets</button></div>${world.id === 'hearthlands' ? '<img class="territory-painting" src="/assets/hearthlands-flatmap.png" alt="Preserved illustrated Hearthlands landscape"><p>The existing Hearthlands landscape is preserved. Its historical places and symbol evidence are not yet joined to this private journal.</p>' : `<img class="planet-painting" src="/assets/territory-planets/${world.id}-final.png" alt="Approved ${escape(world.name)} planetary texture"><p>This is the approved planet artwork. This territory’s illustrated flat map is still unfinished.</p>`}`;
  panel.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}
function openDialog(markup) { dialog.innerHTML = markup; if (!dialog.open) dialog.showModal(); dialog.querySelector('input,button')?.focus(); }
function closeDialog() { dialog.close(); dialog.replaceChildren(); }
function dialogHeader(title) { return `<div class="dialog-heading"><h2 id="dialog-title">${title}</h2><button data-action="close-dialog" aria-label="Close dialog">×</button></div>`; }
async function vaultDialog() {
  hasVault = Boolean(await storedVault());
  openDialog(dialogHeader(hasVault ? 'Welcome back to your pages' : 'A private place for your dreams') + `<p>Saved encrypted in this browser, on this device. This is a local journal, not a cloud account.</p><form id="vault-form"><label>Journal passphrase<input name="passphrase" type="password" minlength="12" required autocomplete="${hasVault ? 'current-password' : 'new-password'}" placeholder="At least 12 characters"></label>${hasVault ? '' : '<label>Repeat your passphrase<input name="repeat" type="password" minlength="12" required autocomplete="new-password"></label><p class="quiet">Keep this passphrase safe. It cannot be recovered. Losing it or clearing browser storage can lose your journal. Export regular backups.</p>'}<p id="vault-error" role="alert"></p><button class="gold-button" type="submit">${hasVault ? 'Unlock my journal' : 'Create my journal'}</button></form>`);
  dialog.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault(); const button = e.target.querySelector('button'); button.disabled = true;
    const form = new FormData(e.target);
    try {
      if (!hasVault && form.get('passphrase') !== form.get('repeat')) throw new Error('The two passphrases do not match.');
      await saving.catch(() => {}); session = hasVault ? await unlockVault(form.get('passphrase')) : await createVault(form.get('passphrase'));
      data = session.data; mode = 'private'; hasVault = true; reading = null; search = ''; periodType = 'monthly'; anchor = data.dreams.at(-1)?.date || today();
      if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
      closeDialog(); go('dream-journal'); notify('Your encrypted local journal is open.');
    } catch (error) { dialog.querySelector('#vault-error').textContent = error.message; button.disabled = false; }
  });
}
function sourceDialog(id) {
  const d = allEntries().find(d => d.id === id);
  if (!d) {
    const evidence = reading?.evidence.find(e => e.dreamId === id);
    openDialog(dialogHeader('Source no longer in this journal') + `<p>The original dream is unavailable. This saved study keeps its historical excerpt; it does not recreate a deleted source.</p>${evidence ? `<blockquote>${escape(evidence.excerpt)}</blockquote>` : ''}`); return;
  }
  openDialog(dialogHeader(escape(d.title)) + `<p class="eyebrow">${d.kind === 'waking' ? 'WAKING ENTRY' : 'ORIGINAL DREAM'} · ${formatDate(d.date)}</p><div class="source-narrative">${escape(d.text)}</div>${d.originalText !== d.text ? `<details><summary>Preserved original narrative</summary><p class="source-narrative">${escape(d.originalText)}</p></details>` : ''}<div class="entry-tags">${d.tags.map(t => `<span>${escape(t)}</span>`).join('')}</div><div class="dialog-actions">${favouriteButton(d.kind === 'waking' ? 'waking' : 'dream', id)}<button class="text-button" data-action="export-source" data-id="${escape(id)}">Export this page</button>${mode === 'private' ? `<button class="text-button" data-action="edit-source" data-id="${escape(id)}">Edit this page</button><button class="text-button danger" data-action="delete-source" data-id="${escape(id)}">Delete this page</button>` : ''}</div>`);
}
function editDialog(id) {
  const d = allEntries().find(d => d.id === id); if (!d || mode !== 'private') return;
  openDialog(dialogHeader('Edit your page') + `<form id="edit-form"><label>Title<input name="title" value="${escape(d.title)}" maxlength="160" required></label><label>Date<input name="date" type="date" value="${d.date}" required></label><label>Narrative<textarea name="text" rows="10" maxlength="100000" required>${escape(d.text)}</textarea></label><label>Tags<input name="tags" value="${escape(d.tags.join(', '))}"></label><label>Feelings<input name="emotion" value="${escape(d.emotion.join(', '))}"></label><p class="quiet">Your original narrative and saved reading excerpts remain preserved.</p><button class="gold-button">Save changes locally</button></form>`);
  dialog.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault(); const form = new FormData(e.target);
    try {
      const updated = validateRecord({ ...d, title: form.get('title'), date: form.get('date'), text: form.get('text'), tags: form.get('tags').split(',').map(s => s.trim()), emotion: form.get('emotion').split(',').map(s => s.trim()), revision: d.revision + 1, updatedAt: new Date().toISOString() }, d.kind);
      await mutate(next => { const target = d.kind === 'waking' ? next.waking : next.dreams; target[target.findIndex(x => x.id === id)] = updated; });
      closeDialog(); await render({ preserveScroll: true }); notify('Changes saved encrypted on this device.');
    } catch (e) { report(e); }
  });
}
function privacy() {
  openDialog(dialogHeader('Your dreams belong to you') + `<p>${mode === 'private' ? 'Your journal is encrypted with your passphrase and saved in this browser. It is unlocked in memory while you use it.' : 'The reference sample contains public example dreams. Your private journal uses a separate encrypted store.'}</p><p>Personal dreams are not uploaded, shared for research, or sent to AI providers. No remote backup, account, billing or subscription exists yet.</p><p>Exported backups are readable JSON. Store them somewhere you trust. Clearing browser data can remove this device’s journal.</p><div class="dialog-actions">${mode !== 'locked' ? '<button class="gold-button" data-action="export-all">Export all my data</button>' : ''}${mode === 'private' ? '<button class="text-button" data-action="lock">Lock my journal</button><button class="text-button danger" data-action="delete-vault">Delete this device’s journal</button>' : ''}</div><p class="quiet">Using a shared computer? Lock your journal when you finish. Production authentication, server-side isolation and recovery remain part of the next stage.</p>`);
}
function guide() { openDialog(dialogHeader('A little guidance') + '<p>Begin with Dream Journal to capture a dream. Your words stay in your encrypted local journal. Tags and feelings help you explore what returns.</p><p>Oracle Cards finds an explicit recurring thread across a selected period and shows every supporting passage. This first-stage study is deterministic; nuanced AI interpretation and personalised art are not connected yet.</p><p>Dream World holds the preserved planets and paintings. Its people, places and symbols belong to that separate experience.</p><p>Use the room selector to travel, the star to save a treasure, and Home Hub to find your way back. The writing and reading surfaces stay still while the cosmos moves.</p>'); }

function readDraft(form) { const values = new FormData(form); return Object.fromEntries([...values]); }
function bindForms() {
  document.querySelector('#room-navigation')?.addEventListener('change', e => go(e.target.value));
  document.querySelector('#period-type')?.addEventListener('change', e => { periodType = e.target.value; render({ preserveScroll: true }); });
  document.querySelector('#period-date')?.addEventListener('change', e => { if (!e.target.value) return; anchor = e.target.value; render({ preserveScroll: true }); });
  document.querySelector('#journal-search')?.addEventListener('input', e => {
    search = e.target.value; const position = e.target.selectionStart;
    render({ preserveScroll: true }).then(() => { const input = document.querySelector('#journal-search'); input.focus({ preventScroll: true }); input.setSelectionRange(position, position); });
  });
  const form = document.querySelector('#entry-form');
  if (form) {
    let draftTimer, dirty = false, draftGeneration = 0;
    const saveDraft = async () => { try { const generation = draftGeneration, draft = readDraft(form); await mutate(next => { next.drafts[form.dataset.kind] = draft; }); dirty = generation !== draftGeneration; if (form.isConnected && !dirty) document.querySelector('#draft-status').textContent = 'Draft saved encrypted on this device.'; } catch (error) { report(error); } };
    form.addEventListener('input', () => { draftGeneration++; dirty = true; clearTimeout(draftTimer); document.querySelector('#draft-status').textContent = 'Saving draft…'; draftTimer = setTimeout(saveDraft, 350); });
    cleanup = async () => { clearTimeout(draftTimer); if (dirty && mode === 'private') await saveDraft(); };
    form.addEventListener('submit', async e => {
      e.preventDefault(); clearTimeout(draftTimer); const button = form.querySelector('button[type="submit"]'); if (button.disabled) return; button.disabled = true;
      try {
        const values = readDraft(form); const record = validateRecord({ ...values, tags: values.tags.split(','), emotion: values.emotion.split(','), numinous: values.numinous === 'on', lucid: values.lucid === 'on', directMessage: values.directMessage === 'on', significant: values.significant === 'on' }, form.dataset.kind);
        await mutate(next => { (record.kind === 'waking' ? next.waking : next.dreams).push(record); delete next.drafts[record.kind]; });
        dirty = false; await render({ preserveScroll: true }); notify(`${record.kind === 'waking' ? 'Entry' : 'Dream'} saved encrypted on this device. No cloud backup is connected.`);
      } catch (error) { report(error); button.disabled = false; }
    });
  }
  document.querySelector('#dream-import')?.addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('Use a JSON file smaller than 10 MB.');
      const result = importDreams(JSON.parse(await file.text()), data.dreams); await mutate(next => { next.dreams = result.records; });
      if (result.added) anchor = result.records.at(-1).date;
      await render({ preserveScroll: true }); notify(`${result.added} dreams imported locally; ${result.skipped} duplicates skipped. No upload took place.`);
    } catch (error) { report(error); }
  });
}
async function generate() {
  const button = document.querySelector('[data-action="generate"]'); if (button?.disabled) return;
  if (button) { button.disabled = true; button.textContent = 'Reading the original passages…'; }
  try {
    const period = currentPeriod(), version = await corpusVersion(data.dreams);
    const cached = data.readings.find(r => r.version === version && r.period.start === period.start && r.period.end === period.end && r.period.type === period.type);
    reading = cached || await createEvidenceStudy(data.dreams, period, data.associations);
    if (reading.status === 'complete') validateEvidence(reading, data.dreams);
    await render({ preserveScroll: true }); document.querySelector('.oracle-pair,.empty')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  } catch (error) { report(error); if (button) button.disabled = false; }
}
async function handleAction(button) {
  const { action, id, type, kind } = button.dataset;
  switch (action) {
    case 'vault': return vaultDialog();
    case 'sample': await cleanup(); cleanup = () => {}; await saving.catch(() => {}); await loadSample(); closeDialog(); return render();
    case 'sample-reading': await cleanup(); cleanup = () => {}; await saving.catch(() => {}); await loadSample(); reading = await createEvidenceStudy(data.dreams, currentPeriod()); go('oracle'); return;
    case 'record': if (mode !== 'private') return vaultDialog(); go('dream-journal'); return;
    case 'generate': return generate();
    case 'save-reading':
      if (reading?.status !== 'complete') return;
      await mutate(next => { if (!next.readings.some(r => r.id === reading.id)) next.readings.push(structuredClone(reading)); });
      notify(mode === 'private' ? 'Study saved encrypted on this device.' : 'Reference study saved locally.'); return render({ preserveScroll: true });
    case 'favourite':
      await mutate(next => { if (type === 'reading' && reading?.id === id && !next.readings.some(r => r.id === id)) next.readings.push(structuredClone(reading)); const index = next.favourites.findIndex(f => f.type === type && f.id === id); if (index >= 0) next.favourites.splice(index, 1); else next.favourites.push({ type, id }); });
      button.setAttribute('aria-pressed', String(isFavourite(type, id))); button.textContent = isFavourite(type, id) ? '★' : '☆'; notify(isFavourite(type, id) ? 'Added to your treasures.' : 'Removed from favourites.'); return;
    case 'source': return sourceDialog(id);
    case 'history': reading = data.readings.find(r => r.id === id); if (!reading) throw new Error('This study is not available.'); periodType = reading.period.type; anchor = reading.period.start; go('oracle'); return;
    case 'export-source': { const d = allEntries().find(d => d.id === id); if (d) download(d, `dreamscape-${d.id}.json`); return; }
    case 'edit-source': return editDialog(id);
    case 'delete-source':
      if (!confirm('Delete this page? Saved studies retain their historical excerpts.')) return;
      await mutate(next => { next.dreams = next.dreams.filter(d => d.id !== id); next.waking = next.waking.filter(d => d.id !== id); next.favourites = next.favourites.filter(f => f.id !== id); }); closeDialog(); return render({ preserveScroll: true });
    case 'export-entries': download({ dreams: kind === 'waking' ? data.waking : data.dreams }, `dreamscape-${kind}-pages.json`); return;
    case 'export-all': download(data, 'dreamscape-local-backup.json'); notify('Readable backup exported. Keep it somewhere private.'); return;
    case 'privacy': return privacy();
    case 'guide': return guide();
    case 'lock': await cleanup(); cleanup = () => {}; await saving.catch(() => {}); clearTimeout(notify.timer); data = blankData(); session = null; mode = 'locked'; reading = null; search = ''; closeDialog(); await render(); notify('Your journal is locked.'); return;
    case 'delete-vault':
      if (!confirm('Permanently delete all journal data on this device? Export a backup first if you want to keep it.')) return;
      await cleanup(); cleanup = () => {}; await saving.catch(() => {}); await deleteVault(); hasVault = false; data = blankData(); session = null; mode = 'locked'; reading = null; closeDialog(); await render(); notify('This device’s journal has been deleted.'); return;
    case 'close-dialog': return closeDialog();
    case 'back-planets': document.querySelector('#world-landscape').hidden = true; document.querySelector('#preserved-planets').scrollIntoView({ behavior: 'instant' }); return;
    case 'pattern': {
      const ids = button.dataset.ids.split(','); openDialog(dialogHeader(escape(button.dataset.label)) + `<p>${ids.length} dreams carry this recorded label.</p>${data.dreams.filter(d => ids.includes(d.id)).map(evidenceLink).join('')}`); return;
    }
  }
}
document.addEventListener('click', event => { const button = event.target.closest('[data-action]'); if (button && !button.disabled) handleAction(button).catch(report); });
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(); } });
dialog.addEventListener('close', () => dialog.replaceChildren());
addEventListener('hashchange', () => { search = ''; render(); });
hasVault = Boolean(await storedVault().catch(() => null));
await render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => notify('Offline page caching is unavailable. Your journal still saves locally.'));
