import { FAMILY_HOME_SYMBOLS, FAMILY_HOME_ZONE, FAMILY_HOME_LAYOUT, ZOOM_ORDER } from './family-home-pilot-data.js';
import { getV57Reading } from './v57-family-home-readings.js';

const MANIFEST_URL='/assets/family-home-pilot/manifest.json';

const escapeHTML=(value)=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

async function loadManifest(){
  try{
    const response=await fetch(MANIFEST_URL,{cache:'no-store'});
    if(!response.ok)throw new Error(`Manifest ${response.status}`);
    return await response.json();
  }catch(error){console.warn('Family Home asset manifest unavailable.',error);return {symbols:[]};}
}

async function waitForAtlas(manifest){
  const root=document.querySelector('.atlas');
  const world=document.querySelector('.flatmap-world');
  const scene=document.querySelector('.flatmap-scene');
  if(!root||!world||!scene){requestAnimationFrame(()=>waitForAtlas(manifest));return}
  if(world.querySelector('.family-home-painted-layer')) return;

  const manifestById=Object.fromEntries((manifest.symbols??[]).map(item=>[item.id,item]));
  root.dataset.semanticZoom='territory';
  world.style.transformOrigin=`${FAMILY_HOME_ZONE.anchor.x}% ${FAMILY_HOME_ZONE.anchor.y}%`;

  const artLayer=document.createElement('div');
  artLayer.className='family-home-painted-layer';
  artLayer.setAttribute('aria-hidden','true');
  const hotspotLayer=document.createElement('div');
  hotspotLayer.className='family-home-hotspot-layer';
  hotspotLayer.setAttribute('aria-label','Family Home painted dream symbols');
  const reader=createReader(root);

  for(const symbol of FAMILY_HOME_SYMBOLS){
    const p=FAMILY_HOME_LAYOUT[symbol.id];
    const asset=manifestById[symbol.id];
    if(!p||!asset) continue;

    const img=document.createElement('img');
    const regional=asset.assetMode?.includes('regional-tile');
    img.className=`painted-symbol ${regional?'painted-regional-tile':'painted-environmental-sprite'} painted-symbol--${symbol.zoom}`;
    img.dataset.symbol=symbol.id;
    img.dataset.zoom=symbol.zoom;
    img.dataset.assetMode=asset.assetMode||'unknown';
    img.alt='';
    img.decoding='async';
    img.loading='eager';
    img.src=`/assets/family-home-pilot/${asset.expectedAsset}`;

    if(asset.tileRect){
      img.style.left=`${asset.tileRect.leftPct}%`;
      img.style.top=`${asset.tileRect.topPct}%`;
      img.style.width=`${asset.tileRect.widthPct}%`;
      img.style.height=`${asset.tileRect.heightPct}%`;
      img.style.translate='0 0';
      img.style.objectFit='contain';
    }else{
      img.style.left=`${p.x}%`;
      img.style.top=`${p.y}%`;
      if(asset.approxDimensions){
        img.style.width=`${asset.approxDimensions.width}px`;
        img.style.height=`${asset.approxDimensions.height}px`;
      }
    }

    img.addEventListener('load',()=>{
      img.dataset.ready='true';
      const hit=hotspotLayer.querySelector(`[data-symbol="${CSS.escape(symbol.id)}"]`);
      if(hit){hit.disabled=false;hit.dataset.ready='true';}
    });
    img.addEventListener('error',()=>{
      const hit=hotspotLayer.querySelector(`[data-symbol="${CSS.escape(symbol.id)}"]`);
      if(hit){hit.disabled=true;delete hit.dataset.ready;}
      img.remove();
    });
    artLayer.appendChild(img);

    const hotspot=asset.hotspot??{xPct:p.x,yPct:p.y,widthPx:52,heightPx:52};
    const hit=document.createElement('button');
    hit.type='button';
    hit.className=`painted-symbol-hotspot painted-symbol-hotspot--${symbol.zoom}`;
    hit.dataset.symbol=symbol.id;
    hit.dataset.zoom=symbol.zoom;
    hit.style.left=`${hotspot.xPct}%`;
    hit.style.top=`${hotspot.yPct}%`;
    hit.style.width=`${hotspot.widthPx??52}px`;
    hit.style.height=`${hotspot.heightPx??52}px`;
    hit.setAttribute('aria-label',`${symbol.name}, painted into Family Home`);
    hit.disabled=true;
    hit.addEventListener('pointerenter',()=>previewSymbol(root,symbol,hit));
    hit.addEventListener('focus',()=>previewSymbol(root,symbol,hit));
    hit.addEventListener('click',(event)=>{event.stopPropagation();openSymbol(reader,symbol);});
    hotspotLayer.appendChild(hit);
  }

  world.append(artLayer,hotspotLayer);

  function setZoom(next){
    root.dataset.semanticZoom=next;
    const scale=next==='territory'?1:next==='place'?1.08:1.18;
    root.style.setProperty('--hearth-semantic-scale',String(scale));
  }
  function stepZoom(direction){
    const current=ZOOM_ORDER.indexOf(root.dataset.semanticZoom||'territory');
    setZoom(ZOOM_ORDER[Math.max(0,Math.min(ZOOM_ORDER.length-1,current+direction))]);
  }

  scene.addEventListener('wheel',(event)=>{
    if(root.dataset.state!=='hearth') return;
    const rect=world.getBoundingClientRect();
    const px=((event.clientX-rect.left)/rect.width)*100;
    const py=((event.clientY-rect.top)/rect.height)*100;
    const nearFamily=Math.abs(px-FAMILY_HOME_ZONE.anchor.x)<FAMILY_HOME_ZONE.radius.x*1.55&&Math.abs(py-FAMILY_HOME_ZONE.anchor.y)<FAMILY_HOME_ZONE.radius.y*1.55;
    if(!nearFamily) return;
    event.preventDefault();
    stepZoom(event.deltaY<0?1:-1);
  },{passive:false});

  document.addEventListener('click',(event)=>{
    const family=event.target.closest?.('[data-place="Family Home"]');
    if(!family) return;
    const current=root.dataset.semanticZoom||'territory';
    setZoom(current==='territory'?'place':'close');
  },true);

  let lastTouch=0;
  world.addEventListener('pointerup',(event)=>{
    if(event.pointerType!=='touch'||root.dataset.state!=='hearth') return;
    const now=performance.now();
    if(now-lastTouch<420){
      const rect=world.getBoundingClientRect();
      const px=((event.clientX-rect.left)/rect.width)*100;
      const py=((event.clientY-rect.top)/rect.height)*100;
      if(Math.abs(px-FAMILY_HOME_ZONE.anchor.x)<FAMILY_HOME_ZONE.radius.x*1.6&&Math.abs(py-FAMILY_HOME_ZONE.anchor.y)<FAMILY_HOME_ZONE.radius.y*1.6) stepZoom(1);
    }
    lastTouch=now;
  });

  addEventListener('pointermove',(event)=>{
    if(root.dataset.state!=='hearth') return;
    const x=event.clientX/innerWidth-.5;
    const y=event.clientY/innerHeight-.5;
    const scale=Number(getComputedStyle(root).getPropertyValue('--hearth-semantic-scale'))||1;
    world.style.transform=`translate(${(-x*12).toFixed(1)}px, ${(-y*8).toFixed(1)}px) scale(${scale})`;
  });
}

function createReader(root){
  const reader=document.createElement('aside');
  reader.className='family-symbol-reader';
  reader.innerHTML=`<button class="family-reader-close" aria-label="Close symbol reading">×</button><div class="family-reader-card"><img alt="" /></div><p class="family-reader-kicker">HEARTHLANDS · FAMILY HOME</p><h2></h2><p class="family-reader-count"></p><p class="family-reader-source"></p><nav>${['Overview','Where it appears','Recurring patterns','Appears alongside','How it changes','Source dreams','Possible meanings'].map((name,i)=>`<button data-tab="${i}" class="${i===0?'active':''}">${name}</button>`).join('')}</nav><section class="family-reader-body"></section>`;
  reader.querySelector('.family-reader-close').onclick=()=>reader.classList.remove('open');
  reader.querySelectorAll('nav button').forEach(button=>button.onclick=()=>{
    reader.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b===button));
    renderReaderBody(reader,reader._symbol,Number(button.dataset.tab));
  });
  root.appendChild(reader);
  return reader;
}

function previewSymbol(root,symbol,hit){
  if(hit.disabled) return;
  root.querySelectorAll('.painted-symbol').forEach(img=>img.classList.toggle('found',img.dataset.symbol===symbol.id));
}

function loadTarotCard(img,reading,symbol){
  const candidates=[...(reading?.tarotCandidates??[])];
  let index=0;
  img.style.display='none';
  img.alt=`${symbol.name} v57 tarot artwork`;
  const next=()=>{
    if(index>=candidates.length){img.dataset.missing='true';return;}
    img.src=candidates[index++];
  };
  img.onload=()=>{img.style.display='block';img.dataset.ready='true';delete img.dataset.missing;};
  img.onerror=next;
  next();
}

function openSymbol(reader,symbol){
  const reading=getV57Reading(symbol.id);
  reader._symbol=symbol;
  reader.querySelector('h2').textContent=symbol.name;
  reader.querySelector('.family-reader-count').textContent=`${symbol.hearthlandsDreams} Hearthlands dream${symbol.hearthlandsDreams===1?'':'s'} · ${symbol.familyHomeDreams} Family Home source dream${symbol.familyHomeDreams===1?'':'s'}`;
  reader.querySelector('.family-reader-source').textContent=reading?.profile?'v57 authored interpretive profile mounted':'v57 evidence-only record · no authored profile substituted';
  loadTarotCard(reader.querySelector('.family-reader-card img'),reading,symbol);
  reader.querySelectorAll('nav button').forEach((b,i)=>b.classList.toggle('active',i===0));
  renderReaderBody(reader,symbol,0);
  reader.classList.add('open');
}

function renderReaderBody(reader,symbol,tab){
  if(!symbol) return;
  const reading=getV57Reading(symbol.id);
  const profile=reading?.profile;
  const matrixNote=`The v57 matrix records ${symbol.familyHomeDreams} unique Family Home source dream${symbol.familyHomeDreams===1?'':'s'} for ${symbol.name}.`;
  const placeRows=Object.entries(symbol.places??{}).sort((a,b)=>b[1]-a[1]).map(([name,count])=>`<li><b>${escapeHTML(name)}</b><span>${count}</span></li>`).join('');
  const patterns=profile?.constellations?.map(item=>`<article><h4>${escapeHTML(item.name)} <small>${escapeHTML(item.confidence)}</small></h4><p>${escapeHTML(item.evidence)}</p><p><b>Possible reading:</b> ${escapeHTML(item.possibility)}</p><p class="reader-counter"><b>Counterpoint:</b> ${escapeHTML(item.counterpoint)}</p></article>`).join('');
  const dreamIds=[...new Set([...(profile?.constellations??[]).flatMap(item=>item.dreamIds??[]),...Object.values(reading?.lensEvidence??{}).flatMap(item=>item.dreamIds??[])])];
  const lensRows=profile?.jungian?.map(item=>`<article><h4>${escapeHTML(item.name)}</h4><p>${escapeHTML(item.copy)}</p></article>`).join('');
  const altRows=profile?.alternatives?.map(item=>`<article><h4>${escapeHTML(item.name)}</h4><p>${escapeHTML(item.copy)}</p></article>`).join('');
  const lensEvidenceRows=Object.entries(reading?.lensEvidence??{}).map(([name,item])=>`<article><h4>${escapeHTML(name)}</h4><p>${escapeHTML(item.basis)}</p><small>${item.dreamIds.map(escapeHTML).join(' · ')}</small></article>`).join('');

  const content=[
    profile
      ? `<h3>${escapeHTML(reading.complete.subtitle||'Overview')}</h3>${reading.complete.summary?`<p>${escapeHTML(reading.complete.summary)}</p>`:''}<p>${escapeHTML(profile.synthesis)}</p><details><summary>Method note</summary><p>${escapeHTML(profile.methodNote)}</p></details>`
      : `<h3>What the v57 evidence establishes</h3><p>${symbol.name} occurs in ${symbol.hearthlandsDreams} Hearthlands dream${symbol.hearthlandsDreams===1?'':'s'}. ${matrixNote}</p><p>This record is connected to its v57 tarot artwork and complete-symbol identity. No authored interpretive profile is substituted where one is not mounted.</p>`,
    `<h3>Where it appears</h3><ul class="family-place-counts">${placeRows}</ul><p>${matrixNote} A non-zero place intersection supports regional placement, but not a more precise room/garden claim.</p>`,
    profile
      ? `<h3>Recurring patterns</h3><div class="reader-constellations">${patterns}</div>`
      : `<h3>Recurring patterns</h3><p>No authored interpretive profile is mounted for ${escapeHTML(symbol.name)} in this pilot. The application therefore does not fabricate a recurring-pattern narrative from visual placement.</p>`,
    `<h3>Appears alongside</h3><p>The v57 reader calculates co-appearance from the full symbol corpus. This lightweight pilot does not reinterpret nearby painted assets as co-occurrence evidence.</p>`,
    `<h3>How it changes</h3><p>Chronological change belongs to the underlying source-dream series, not to map position. The Family Home pilot preserves that boundary and will use the full source corpus when that layer is mounted.</p>`,
    dreamIds.length
      ? `<h3>Source dreams named by the authored v57 evidence</h3><ul class="family-source-dreams">${dreamIds.map(id=>`<li>${escapeHTML(id)}</li>`).join('')}</ul>${lensEvidenceRows?`<h3>Lens evidence</h3><div class="reader-lens-evidence">${lensEvidenceRows}</div>`:''}`
      : `<h3>Source dreams</h3><p>${matrixNote} This pilot has no authored source-dream list mounted for this record and will not invent one.</p>`,
    profile
      ? `<h3>Possible meanings</h3><p class="reader-personal-meaning">${escapeHTML(profile.personalMeaning||profile.synthesis)}</p><h3>Jungian possibilities</h3><div>${lensRows}</div><h3>Alternative lenses</h3><div>${altRows}</div><aside class="reader-boundary"><b>Boundary</b><p>${escapeHTML(profile.boundary)}</p></aside><aside class="reader-reflection"><b>Question for reflection</b><p>${escapeHTML(profile.reflection)}</p></aside>`
      : `<h3>Possible meanings</h3><p>v57 does not permit visual placement alone to become interpretation. This pilot stays with the recorded Hearthlands and place evidence until a genuine authored/corpus-derived reading is mounted.</p>`
  ];
  reader.querySelector('.family-reader-body').innerHTML=content[tab]||content[0];
}

loadManifest().then(waitForAtlas);
