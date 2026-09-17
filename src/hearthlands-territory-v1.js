const MANIFEST_URL='/worlds/reference-world/territories/hearthlands/territory-manifest.json';
const TAROT_URL='/worlds/reference-world/territories/hearthlands/tarot/tarot-cards.json';

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const escapeHTML=(value)=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

async function json(url){
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok) throw new Error(`${url} ${response.status}`);
  return response.json();
}

function parseCount(text=''){
  const match=String(text).match(/(?:Appears in|^)(?:\s*)(\d+)\s+(?:Hearthlands-associated|source)?\s*dream/i);
  return match?Number(match[1]):null;
}

function displayTitle(item,type,card){
  const provider=window.DreamscapePrivateProfile||window.__dreamscapePrivateProfile;
  const providerLabel=type==='symbol'?provider?.getSemanticLabel?.(item.id):null;
  const privateRecord=type==='symbol'?window.__dreamscapePrivateIdentityMap?.[item.id]:null;
  const mapLabel=typeof privateRecord==='string'?privateRecord:(privateRecord?.label||privateRecord?.semanticLabel||null);
  return providerLabel||mapLabel||card.title||item.name;
}

async function boot(){
  const [manifest,tarots]=await Promise.all([json(MANIFEST_URL),json(TAROT_URL)]);
  const root=document.querySelector('.atlas');
  const scene=document.querySelector('.flatmap-scene');
  const world=document.querySelector('.flatmap-world');
  const artImg=document.querySelector('.flatmap-art');
  const markers=document.querySelector('.flatmap-markers');
  const bar=document.querySelector('.hearth-bar');
  if(!root||!scene||!world||!artImg||!markers||!bar) throw new Error('Hearthlands DOM unavailable');

  root.classList.add('territory-v1');
  root.dataset.territory='hearthlands';
  root.dataset.territoryZoomStage='overview';
  root.dataset.layer='all';
  document.querySelector('.place-sheet')?.classList.remove('open');

  artImg.src=new URL(manifest.flatMap.asset,new URL(MANIFEST_URL,location.href)).href;
  artImg.alt='A richly painted, explorable view of Hearthlands';
  artImg.decoding='async';

  world.querySelector('.painted-motifs')?.remove();
  world.querySelectorAll('.glint').forEach(el=>el.remove());
  markers.innerHTML='';

  const map=document.createElement('div');
  map.className='territory-v1-map';
  map.setAttribute('aria-label','Zoomable Hearthlands territory artwork');
  artImg.parentNode.insertBefore(map,artImg);
  map.appendChild(artImg);
  map.appendChild(markers);

  const heading=bar.querySelector('.hearth-heading');
  if(heading) heading.innerHTML='<b>Hearthlands</b><small>213 dreams</small>';
  const layerSwitch=bar.querySelector('.layer-switch');
  layerSwitch.classList.add('territory-v1-controls');
  layerSwitch.innerHTML=`
    <button type="button" data-territory-action="about">About</button>
    <button type="button" aria-label="Zoom out" data-territory-action="zoom-out">−</button>
    <button type="button" aria-label="Reset map view" data-territory-action="reset">⌂</button>
    <button type="button" aria-label="Zoom in" data-territory-action="zoom-in">+</button>`;

  const arrival=scene.querySelector('.arrival-whisper');
  if(arrival) arrival.innerHTML='<span>HEARTHLANDS</span><b>Look closely. The places and recurring presences of this dream territory are painted into the landscape.</b>';

  const preview=document.createElement('aside');
  preview.className='territory-v1-preview';
  preview.setAttribute('aria-live','polite');
  preview.innerHTML=`
    <button type="button" class="territory-v1-preview-close" aria-label="Close symbol preview">×</button>
    <p class="territory-v1-preview-kicker"></p>
    <h3></h3>
    <p class="territory-v1-preview-grounding"></p>
    <div class="territory-v1-preview-meta"></div>
    <button type="button" class="territory-v1-preview-open">Open tarot <span>→</span></button>`;
  root.appendChild(preview);

  const reader=document.createElement('aside');
  reader.className='territory-v1-reader territory-v1-tarot glass';
  reader.setAttribute('aria-live','polite');
  reader.setAttribute('role','dialog');
  reader.setAttribute('aria-label','Dreamscape tarot');
  reader.innerHTML=`
    <button type="button" class="territory-v1-reader-close" aria-label="Close tarot">×</button>
    <div class="territory-v1-tarot-scroll">
      <p class="territory-v1-kicker"></p>
      <h2></h2>
      <div class="territory-v1-tarot-image" hidden><img alt="" /></div>
      <div class="territory-v1-tarot-stats"></div>
      <section class="territory-v1-tarot-section territory-v1-tarot-geography" hidden><h3>Dream geography</h3><div></div></section>
      <section class="territory-v1-tarot-section"><h3>Corpus grounding</h3><p class="territory-v1-grounding"></p></section>
      <section class="territory-v1-tarot-section territory-v1-functions" hidden><h3>Recurring functions</h3><div></div></section>
      <section class="territory-v1-tarot-section"><h3>Possible meanings</h3><p class="territory-v1-interpretation"></p></section>
      <section class="territory-v1-tarot-section territory-v1-lenses" hidden><h3>Interpretive lenses</h3><div></div></section>
      <section class="territory-v1-tarot-section territory-v1-lesson" hidden><h3>What might this be asking of you?</h3><p></p></section>
      <section class="territory-v1-tarot-section territory-v1-dream-records"><h3>Dream records</h3><p>The private dream-by-dream record for this symbol belongs in the authenticated corpus layer.</p><button type="button" class="territory-v1-records-button" disabled>Dream records not yet connected</button></section>
      <div class="territory-v1-related"></div>
      <p class="territory-v1-method">Interpretive possibilities are hypotheses grounded in recurring dream patterns, not fixed translations.</p>
      <button type="button" class="territory-v1-deeper" data-enter-family-home="true" hidden>Enter Family Home <span>→</span></button>
    </div>`;
  root.appendChild(reader);

  const about=document.createElement('aside');
  about.className='territory-v1-about glass';
  about.setAttribute('aria-live','polite');
  about.innerHTML=`
    <button type="button" class="territory-v1-about-close" aria-label="Close About Hearthlands">×</button>
    <p class="roman">TERRITORY PROVENANCE</p>
    <h2>${escapeHTML(manifest.about.title)}</h2>
    <p>${escapeHTML(manifest.about.summary)}</p>
    <div class="territory-v1-about-stats"><span><b>213</b> associated dreams</span><span><b>6</b> canonical places</span><span><b>76</b> recurring symbols</span><span><b>23</b> spatial motifs</span></div>
    <div class="territory-v1-divider"></div>
    <h3>How it was formed</h3>
    <p>${escapeHTML(manifest.provenance.derivationSummary)}</p>
    <p class="territory-v1-method">The public runtime contains approved derived summaries only. Raw dreams and identifying source material remain outside this layer.</p>`;
  root.appendChild(about);

  const view={scale:manifest.zoom.default,panX:0,panY:0,min:manifest.zoom.min,max:manifest.zoom.max,stage:'overview',dragging:false,lastTap:0,selectedHotspot:null};
  const pointers=new Map();
  let pinchStart=null;
  let previewState=null;

  function fitWorld(){
    const vw=innerWidth;
    const safeTop=8;
    const safeBottom=8;
    const availableHeight=Math.max(240,innerHeight-safeTop-safeBottom);
    const ratio=1.5;
    let width=Math.min(vw,availableHeight*ratio);
    let height=width/ratio;
    if(height>availableHeight){height=availableHeight;width=height*ratio;}
    world.style.width=`${width}px`;
    world.style.height=`${height}px`;
    world.style.left=`${(vw-width)/2}px`;
    world.style.top=`${safeTop+(availableHeight-height)/2}px`;
    clampPan();
    applyTransform();
    if(previewState) positionPreview(previewState.button);
  }

  function stageFor(scale){const s=manifest.zoom.stages;if(scale>=s.detail) return 'detail';if(scale>=s.explore) return 'explore';return 'overview';}
  function clampPan(){
    const rect=world.getBoundingClientRect();
    const extraX=Math.max(0,(rect.width*(view.scale-1))/2);
    const extraY=Math.max(0,(rect.height*(view.scale-1))/2);
    const over=Math.min(rect.width,rect.height)*(manifest.zoom.pan.overscroll||0);
    view.panX=clamp(view.panX,-extraX-over,extraX+over);view.panY=clamp(view.panY,-extraY-over,extraY+over);
  }
  function applyTransform(){
    clampPan();map.style.transform=`translate3d(${view.panX}px,${view.panY}px,0) scale(${view.scale})`;
    view.stage=stageFor(view.scale);root.dataset.territoryZoomStage=view.stage;root.style.setProperty('--territory-zoom',String(view.scale));updateHotspots();
    if(previewState) requestAnimationFrame(()=>positionPreview(previewState.button));
  }
  function zoomTo(next,clientX=innerWidth/2,clientY=innerHeight/2){
    const old=view.scale;next=clamp(next,view.min,view.max);if(Math.abs(next-old)<0.001) return;
    const wr=world.getBoundingClientRect();const cx=clientX-(wr.left+wr.width/2);const cy=clientY-(wr.top+wr.height/2);const ratio=next/old;
    view.panX=(view.panX-cx)*ratio+cx;view.panY=(view.panY-cy)*ratio+cy;view.scale=next;closePreview();applyTransform();
  }
  function resetView(){view.scale=manifest.zoom.default;view.panX=0;view.panY=0;closePreview();applyTransform();}

  function makeHotspot(item,type){
    const placement=type==='place'?item.map:item.map.placements[0];
    const button=document.createElement('button');button.type='button';button.className=`territory-hotspot territory-hotspot--${type}`;button.dataset.kind=type;button.dataset.id=item.id;
    if(type==='place') button.dataset.placeId=item.id; else button.dataset.symbol=item.id;
    button.style.left=`${placement.x*100}%`;button.style.top=`${placement.y*100}%`;
    const radius=type==='place'?item.map.hitRadius:placement.hitRadius;button.style.setProperty('--hit-size',`${clamp(radius*200,2.4,9.5)}%`);button.dataset.visibleFrom=String(item.map.visibleFromZoom);
    button.setAttribute('aria-label',`${item.name}, ${type}`);button.innerHTML=`<span>${escapeHTML(item.name)}</span>`;
    button.addEventListener('click',event=>{event.stopPropagation();openPreview(item,type,button);});markers.appendChild(button);return button;
  }
  manifest.places.forEach(item=>makeHotspot(item,'place'));manifest.symbols.forEach(item=>makeHotspot(item,'symbol'));

  function updateHotspots(){markers.querySelectorAll('.territory-hotspot').forEach(button=>{const threshold=Number(button.dataset.visibleFrom||1);const active=view.scale+0.001>=threshold;button.classList.toggle('active',active);button.tabIndex=active?0:-1;button.disabled=!active;});}
  function selectHotspot(button){view.selectedHotspot?.classList.remove('is-selected');view.selectedHotspot=button||null;view.selectedHotspot?.classList.add('is-selected');}

  function positionPreview(button){
    if(!button||!preview.classList.contains('open')) return;
    const r=button.getBoundingClientRect();const card=preview.getBoundingClientRect();const anchorX=r.left+r.width/2;const anchorY=r.top+r.height/2;
    let left=anchorX-card.width/2;let top=anchorY-card.height-24;left=clamp(left,12,innerWidth-card.width-12);if(top<12) top=clamp(anchorY+24,12,innerHeight-card.height-12);
    preview.style.left=`${left}px`;preview.style.top=`${top}px`;preview.style.setProperty('--preview-anchor-x',`${anchorX-left}px`);
  }
  function closePreview(){preview.classList.remove('open');previewState=null;if(!reader.classList.contains('open')) selectHotspot(null);}
  function openPreview(item,type,button){
    const card=tarots[item.tarotCardRef];if(!card) return;closeReader();about.classList.remove('open');selectHotspot(button);
    const title=displayTitle(item,type,card);const count=card.corpusOverview?.wholeSeriesCount??null;const localCount=card.corpusOverview?.territoryCounts?.hearthlands??parseCount(card.corpusGrounding);
    preview.querySelector('.territory-v1-preview-kicker').textContent=`HEARTHLANDS · ${type.toUpperCase()}`;preview.querySelector('h3').textContent=title;
    preview.querySelector('.territory-v1-preview-grounding').textContent=card.previewSummary||card.corpusGrounding||'Corpus-grounded record available.';
    preview.querySelector('.territory-v1-preview-meta').innerHTML=`${count!=null?`<span><b>${count}</b> series dreams</span>`:''}${localCount!=null?`<span><b>${localCount}</b> Hearthlands dreams</span>`:''}`;
    preview.classList.add('open');previewState={item,type,button,card};requestAnimationFrame(()=>positionPreview(button));
  }

  function renderList(target,items,formatter){
    const section=target.closest('section');if(!Array.isArray(items)||!items.length){section?.setAttribute('hidden','');target.innerHTML='';return;}
    section?.removeAttribute('hidden');target.innerHTML=items.map(formatter).join('');
  }
  function openTarot(item,type,button){
    const card=tarots[item.tarotCardRef];if(!card) return;closePreview();about.classList.remove('open');selectHotspot(button);
    const title=displayTitle(item,type,card);reader.querySelector('.territory-v1-kicker').textContent=`HEARTHLANDS · ${type.toUpperCase()} TAROT`;reader.querySelector('h2').textContent=title;
    const imageWrap=reader.querySelector('.territory-v1-tarot-image');const imageSrc=card.cardImage||card.image||null;imageWrap.hidden=!imageSrc;
    if(imageSrc){const img=imageWrap.querySelector('img');img.src=imageSrc;img.alt=`Tarot artwork for ${title}`;}
    const wholeCount=card.corpusOverview?.wholeSeriesCount??null;const hearthCount=card.corpusOverview?.territoryCounts?.hearthlands??parseCount(card.corpusGrounding);
    reader.querySelector('.territory-v1-tarot-stats').innerHTML=`<span><b>${wholeCount??'—'}</b><small>dreams in whole series${wholeCount==null?' · pending':''}</small></span><span><b>${hearthCount??'—'}</b><small>Hearthlands dreams${hearthCount==null?' · pending':''}</small></span>`;
    const geography=reader.querySelector('.territory-v1-tarot-geography div');const geographyEntries=card.corpusOverview?.territoryCounts?Object.entries(card.corpusOverview.territoryCounts):[];
    renderList(geography,geographyEntries,([territory,count])=>`<div class="territory-v1-geo-row"><span>${escapeHTML(territory.replaceAll('-',' '))}</span><b>${count}</b></div>`);
    reader.querySelector('.territory-v1-grounding').textContent=card.corpusGrounding||'Corpus grounding pending.';
    reader.querySelector('.territory-v1-interpretation').textContent=card.interpretation?.summary||card.interpretation||'A fuller corpus-grounded interpretation is pending.';
    renderList(reader.querySelector('.territory-v1-functions div'),card.recurringFunctions,(entry)=>`<article><b>${escapeHTML(entry.name||entry.label||'Recurring function')}</b><p>${escapeHTML(entry.summary||entry.evidence||'')}</p></article>`);
    renderList(reader.querySelector('.territory-v1-lenses div'),card.interpretiveLenses,(entry)=>`<article><b>${escapeHTML(entry.name||entry.label||'Interpretive lens')}</b><p>${escapeHTML(entry.summary||entry.copy||'')}</p></article>`);
    const lesson=reader.querySelector('.territory-v1-lesson');const lessonText=card.possibleLesson||card.reflectionPrompt||null;lesson.hidden=!lessonText;if(lessonText) lesson.querySelector('p').textContent=lessonText;
    const provider=window.DreamscapePrivateProfile||window.__dreamscapePrivateProfile;const records=provider?.getDreamRecords?.(item.id)||null;const recordButton=reader.querySelector('.territory-v1-records-button');
    recordButton.disabled=!records?.length;recordButton.textContent=records?.length?`Open ${records.length} dream records`:'Dream records not yet connected';recordButton.onclick=records?.length?()=>window.dispatchEvent(new CustomEvent('dreamscape-open-dream-records',{detail:{subjectId:item.id,records}})):null;
    const related=reader.querySelector('.territory-v1-related');related.innerHTML=card.relatedItems?.length?`<b>Related in the derived model</b><p>${card.relatedItems.map(entry=>escapeHTML((typeof entry==='string'?entry:entry.label||entry.id).replaceAll('-',' '))).join(' · ')}</p>`:'';
    const deeper=reader.querySelector('.territory-v1-deeper');deeper.hidden=card.deeperDestination!=='family-home';reader.dataset.card=item.id;reader.classList.add('open');root.classList.add('tarot-open');
  }
  function closeReader(){reader.classList.remove('open');root.classList.remove('tarot-open');if(!preview.classList.contains('open')) selectHotspot(null);}
  function closeAbout(){about.classList.remove('open');}

  preview.querySelector('.territory-v1-preview-close').addEventListener('click',closePreview);
  preview.querySelector('.territory-v1-preview-open').addEventListener('click',()=>{if(previewState) openTarot(previewState.item,previewState.type,previewState.button);});
  reader.querySelector('.territory-v1-reader-close').addEventListener('click',closeReader);about.querySelector('.territory-v1-about-close').addEventListener('click',closeAbout);
  reader.querySelector('.territory-v1-deeper').addEventListener('click',event=>{event.stopPropagation();closeReader();if(typeof window.enterDreamscapeFamilyHome==='function') window.enterDreamscapeFamilyHome();});

  layerSwitch.addEventListener('click',event=>{const action=event.target.closest('button')?.dataset.territoryAction;if(!action) return;if(action==='about'){closePreview();closeReader();about.classList.add('open');}if(action==='zoom-in') zoomTo(view.scale*1.32);if(action==='zoom-out') zoomTo(view.scale/1.32);if(action==='reset') resetView();});
  scene.addEventListener('wheel',event=>{if(root.dataset.state!=='hearth'||root.dataset.familyHomeFocus||reader.classList.contains('open')) return;event.preventDefault();zoomTo(view.scale*Math.exp(-event.deltaY*0.0012),event.clientX,event.clientY);},{passive:false,capture:true});
  map.addEventListener('dblclick',event=>{if(root.dataset.state!=='hearth'||root.dataset.familyHomeFocus||reader.classList.contains('open')) return;event.preventDefault();zoomTo(view.scale*1.48,event.clientX,event.clientY);});
  map.addEventListener('pointerdown',event=>{
    if(root.dataset.state!=='hearth'||root.dataset.familyHomeFocus||reader.classList.contains('open')) return;if(event.target.closest('.territory-hotspot')) return;closePreview();pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});map.setPointerCapture?.(event.pointerId);
    if(pointers.size===1){view.dragging=true;map.dataset.dragging='true';}else if(pointers.size===2){const pts=[...pointers.values()];pinchStart={distance:Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y),scale:view.scale,midpoint:{x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2}};}
  });
  map.addEventListener('pointermove',event=>{
    if(!pointers.has(event.pointerId)||root.dataset.familyHomeFocus) return;const prev=pointers.get(event.pointerId);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.size===1&&view.dragging){view.panX+=event.clientX-prev.x;view.panY+=event.clientY-prev.y;applyTransform();}
    else if(pointers.size===2&&pinchStart){const pts=[...pointers.values()];const distance=Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y);zoomTo(pinchStart.scale*(distance/Math.max(1,pinchStart.distance)),pinchStart.midpoint.x,pinchStart.midpoint.y);}
  });
  function endPointer(event){if(!pointers.has(event.pointerId)) return;pointers.delete(event.pointerId);if(pointers.size<2) pinchStart=null;if(pointers.size===0){view.dragging=false;delete map.dataset.dragging;if(event.pointerType==='touch'){const now=performance.now();if(now-view.lastTap<360&&!event.target.closest('.territory-hotspot')) zoomTo(view.scale*1.45,event.clientX,event.clientY);view.lastTap=now;}}}
  map.addEventListener('pointerup',endPointer);map.addEventListener('pointercancel',endPointer);

  window.addEventListener('keydown',event=>{if(event.key!=='Escape'||root.dataset.familyHomeFocus) return;if(reader.classList.contains('open')){closeReader();event.preventDefault();return;}if(preview.classList.contains('open')){closePreview();event.preventDefault();return;}if(about.classList.contains('open')){closeAbout();event.preventDefault();return;}if(root.dataset.state==='hearth'){document.querySelector('.return-world')?.click();event.preventDefault();}});
  window.addEventListener('resize',fitWorld);

  const stateObserver=new MutationObserver(()=>{
    if(root.dataset.state==='hearth'){requestAnimationFrame(fitWorld);setTimeout(()=>root.classList.add('territory-settled'),2400);}
    else{root.classList.remove('territory-settled','tarot-open');closePreview();closeReader();}
  });
  stateObserver.observe(root,{attributes:true,attributeFilter:['data-state']});

  window.__hearthlandsTerritoryV1={getState:()=>({scale:view.scale,panX:view.panX,panY:view.panY,stage:view.stage}),reset:resetView,counts:{places:manifest.places.length,symbols:manifest.symbols.length},manifestVersion:manifest.schemaVersion};
  fitWorld();applyTransform();if(root.dataset.state==='hearth') setTimeout(()=>root.classList.add('territory-settled'),2400);
}

boot().catch(error=>{console.error('Hearthlands Territory Layer v1 failed to start.',error);document.querySelector('.atlas')?.classList.add('territory-v1-error');});