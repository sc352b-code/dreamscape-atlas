import { FAMILY_HOME_SYMBOLS, FAMILY_HOME_ZONE, FAMILY_HOME_LAYOUT } from './family-home-pilot-data.js';

const ZOOM_ORDER = ['territory','place','close'];
const ASSET_ROOT = '/assets/family-home-pilot';
const TAROT_ROOT = '/assets/symbol-tarot';

function waitForAtlas(){
  const root=document.querySelector('.atlas');
  const world=document.querySelector('.flatmap-world');
  const scene=document.querySelector('.flatmap-scene');
  if(!root||!world||!scene){requestAnimationFrame(waitForAtlas);return}
  if(world.querySelector('.family-home-painted-layer')) return;

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
    if(!p) continue;

    const img=document.createElement('img');
    img.className=`painted-symbol painted-symbol--${symbol.zoom}`;
    img.dataset.symbol=symbol.id;
    img.dataset.zoom=symbol.zoom;
    img.alt='';
    img.decoding='async';
    img.loading='eager';
    img.src=`${ASSET_ROOT}/${symbol.id}.webp`;
    img.style.left=`${p.x}%`;
    img.style.top=`${p.y}%`;
    img.addEventListener('load',()=>{
      img.dataset.ready='true';
      const hit=hotspotLayer.querySelector(`[data-symbol="${CSS.escape(symbol.id)}"]`);
      if(hit){hit.disabled=false;hit.dataset.ready='true';}
    });
    img.addEventListener('error',()=>{img.remove();});
    artLayer.appendChild(img);

    const hit=document.createElement('button');
    hit.type='button';
    hit.className=`painted-symbol-hotspot painted-symbol-hotspot--${symbol.zoom}`;
    hit.dataset.symbol=symbol.id;
    hit.dataset.zoom=symbol.zoom;
    hit.style.left=`${p.x}%`;
    hit.style.top=`${p.y}%`;
    hit.setAttribute('aria-label',`${symbol.name}, painted into Family Home`);
    hit.disabled=true;
    hit.addEventListener('pointerenter',()=>previewSymbol(root,reader,symbol,hit));
    hit.addEventListener('focus',()=>previewSymbol(root,reader,symbol,hit));
    hit.addEventListener('click',(event)=>{event.stopPropagation();openSymbol(root,reader,symbol);});
    hotspotLayer.appendChild(hit);
  }

  world.append(artLayer,hotspotLayer,reader);

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
  reader.innerHTML=`<button class="family-reader-close" aria-label="Close symbol reading">×</button><div class="family-reader-card"><img alt="" /></div><p class="family-reader-kicker">HEARTHLANDS · FAMILY HOME</p><h2></h2><p class="family-reader-count"></p><nav>${['Overview','Where it appears','Recurring patterns','Appears alongside','How it changes','Source dreams','Possible meanings'].map((name,i)=>`<button data-tab="${i}" class="${i===0?'active':''}">${name}</button>`).join('')}</nav><section class="family-reader-body"></section>`;
  reader.querySelector('.family-reader-close').onclick=()=>reader.classList.remove('open');
  reader.querySelectorAll('nav button').forEach(button=>button.onclick=()=>{
    reader.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b===button));
    renderReaderBody(reader,reader._symbol,Number(button.dataset.tab));
  });
  root.appendChild(reader);
  return reader;
}

function previewSymbol(root,reader,symbol,hit){
  if(hit.disabled) return;
  root.querySelectorAll('.painted-symbol').forEach(img=>img.classList.toggle('found',img.dataset.symbol===symbol.id));
}

function openSymbol(root,reader,symbol){
  reader._symbol=symbol;
  reader.querySelector('h2').textContent=symbol.name;
  reader.querySelector('.family-reader-count').textContent=`${symbol.hearthlandsDreams} Hearthlands dream${symbol.hearthlandsDreams===1?'':'s'} · ${symbol.familyHomeDreams} Family Home source dream${symbol.familyHomeDreams===1?'':'s'}`;
  const card=reader.querySelector('.family-reader-card img');
  card.src=`${TAROT_ROOT}/${symbol.id}-symbol-tarot.webp`;
  card.alt=`${symbol.name} v57 tarot artwork`;
  card.onerror=()=>{card.style.display='none';};
  card.onload=()=>{card.style.display='block';};
  reader.querySelectorAll('nav button').forEach((b,i)=>b.classList.toggle('active',i===0));
  renderReaderBody(reader,symbol,0);
  reader.classList.add('open');
}

function renderReaderBody(reader,symbol,tab){
  if(!symbol) return;
  const matrixNote=`The v57 matrix records ${symbol.familyHomeDreams} unique Family Home source dream${symbol.familyHomeDreams===1?'':'s'} for ${symbol.name}.`;
  const content=[
    `<h3>What the evidence establishes</h3><p>${symbol.name} occurs in ${symbol.hearthlandsDreams} Hearthlands dream${symbol.hearthlandsDreams===1?'':'s'}. ${matrixNote}</p><p>This pilot keeps interpretation separate from the painted scene.</p>`,
    `<h3>Where it appears</h3><p><b>Family Home:</b> ${symbol.familyHomeDreams}</p><p>${matrixNote} A non-zero intersection supports placing this symbol in the Family Home zone, but not a more precise room or garden location.</p>`,
    `<h3>Recurring patterns</h3><p>The full v57 pattern reading is connected through the supplied evidence-led reader architecture. This development branch does not invent a substitute if an authored profile is absent.</p>`,
    `<h3>Appears alongside</h3><p>Co-appearance data belongs to the full v57 symbol corpus, not to visual proximity on this map. Painted neighbours must not be read as corpus co-occurrence unless the data says so.</p>`,
    `<h3>How it changes</h3><p>Chronological change should be derived from the source dreams, as in v57, rather than inferred from its position in the Family Home painting.</p>`,
    `<h3>Source dreams</h3><p>${matrixNote} Source-dream IDs will be exposed by the full v57 reader once the supplied source modules are mounted in the development build.</p>`,
    `<h3>Possible meanings</h3><p>Possible meanings remain evidence-led and revisable. The visual asset is an entry point to the reading, not an interpretation in itself.</p>`
  ];
  reader.querySelector('.family-reader-body').innerHTML=content[tab]||content[0];
}

waitForAtlas();
