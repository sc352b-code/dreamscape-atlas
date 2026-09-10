
const MANIFEST_URL='/worlds/reference-world/territories/hearthlands/territory-manifest.json';
const TAROT_URL='/worlds/reference-world/territories/hearthlands/tarot/tarot-cards.json';

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const escapeHTML=(value)=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

async function json(url){
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok) throw new Error(`${url} ${response.status}`);
  return response.json();
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
  if(arrival){
    arrival.innerHTML='<span>HEARTHLANDS</span><b>Look closely. The places and recurring presences of this dream territory are painted into the landscape.</b>';
  }

  const reader=document.createElement('aside');
  reader.className='territory-v1-reader glass';
  reader.setAttribute('aria-live','polite');
  reader.innerHTML=`
    <button type="button" class="territory-v1-reader-close" aria-label="Close card">×</button>
    <p class="territory-v1-kicker"></p>
    <h2></h2>
    <p class="territory-v1-grounding"></p>
    <div class="territory-v1-divider"></div>
    <p class="territory-v1-interpretation"></p>
    <div class="territory-v1-related"></div>
    <button type="button" class="territory-v1-deeper" data-enter-family-home="true" hidden>Enter Family Home <span>→</span></button>`;
  root.appendChild(reader);

  const about=document.createElement('aside');
  about.className='territory-v1-about glass';
  about.setAttribute('aria-live','polite');
  about.innerHTML=`
    <button type="button" class="territory-v1-about-close" aria-label="Close About Hearthlands">×</button>
    <p class="roman">TERRITORY PROVENANCE</p>
    <h2>${escapeHTML(manifest.about.title)}</h2>
    <p>${escapeHTML(manifest.about.summary)}</p>
    <div class="territory-v1-about-stats">
      <span><b>213</b> associated dreams</span>
      <span><b>6</b> canonical places</span>
      <span><b>76</b> recurring symbols</span>
      <span><b>23</b> spatial motifs</span>
    </div>
    <div class="territory-v1-divider"></div>
    <h3>How it was formed</h3>
    <p>${escapeHTML(manifest.provenance.derivationSummary)}</p>
    <p class="territory-v1-method">The public runtime contains approved derived summaries only. Raw dreams and identifying source material remain outside this layer.</p>`;
  root.appendChild(about);

  const view={
    scale:manifest.zoom.default,panX:0,panY:0,
    min:manifest.zoom.min,max:manifest.zoom.max,
    stage:'overview',dragging:false,lastTap:0
  };
  const pointers=new Map();
  let pinchStart=null;

  function fitWorld(){
    const vw=innerWidth, vh=innerHeight, ratio=1.5;
    let width=vw, height=width/ratio;
    if(height<vh){height=vh;width=height*ratio;}
    world.style.width=`${width}px`;
    world.style.height=`${height}px`;
    world.style.left=`${(vw-width)/2}px`;
    world.style.top=`${(vh-height)/2}px`;
    clampPan();
    applyTransform();
  }

  function stageFor(scale){
    const s=manifest.zoom.stages;
    if(scale>=s.detail) return 'detail';
    if(scale>=s.explore) return 'explore';
    return 'overview';
  }

  function clampPan(){
    const rect=world.getBoundingClientRect();
    const extraX=Math.max(0,(rect.width*(view.scale-1))/2);
    const extraY=Math.max(0,(rect.height*(view.scale-1))/2);
    const over=Math.min(rect.width,rect.height)*(manifest.zoom.pan.overscroll||0);
    view.panX=clamp(view.panX,-extraX-over,extraX+over);
    view.panY=clamp(view.panY,-extraY-over,extraY+over);
  }

  function applyTransform(){
    clampPan();
    map.style.transform=`translate3d(${view.panX}px,${view.panY}px,0) scale(${view.scale})`;
    view.stage=stageFor(view.scale);
    root.dataset.territoryZoomStage=view.stage;
    root.style.setProperty('--territory-zoom',String(view.scale));
    updateHotspots();
  }

  function zoomTo(next,clientX=innerWidth/2,clientY=innerHeight/2){
    const old=view.scale;
    next=clamp(next,view.min,view.max);
    if(Math.abs(next-old)<0.001) return;
    const wr=world.getBoundingClientRect();
    const cx=clientX-(wr.left+wr.width/2);
    const cy=clientY-(wr.top+wr.height/2);
    const ratio=next/old;
    view.panX=(view.panX-cx)*ratio+cx;
    view.panY=(view.panY-cy)*ratio+cy;
    view.scale=next;
    applyTransform();
  }

  function resetView(){
    view.scale=manifest.zoom.default;view.panX=0;view.panY=0;applyTransform();
  }

  function makeHotspot(item,type){
    const placement=type==='place'?item.map:item.map.placements[0];
    const button=document.createElement('button');
    button.type='button';
    button.className=`territory-hotspot territory-hotspot--${type}`;
    button.dataset.kind=type;
    button.dataset.id=item.id;
    if(type==='place') button.dataset.placeId=item.id;
    else button.dataset.symbol=item.id;
    button.style.left=`${placement.x*100}%`;
    button.style.top=`${placement.y*100}%`;
    const radius=type==='place'?item.map.hitRadius:placement.hitRadius;
    button.style.setProperty('--hit-size',`${clamp(radius*200,2.4,9.5)}%`);
    button.dataset.visibleFrom=String(item.map.visibleFromZoom);
    button.setAttribute('aria-label',`${item.name}, ${type}`);
    button.innerHTML=`<span>${escapeHTML(item.name)}</span>`;
    button.addEventListener('click',event=>{
      event.stopPropagation();
      openTarot(item,type);
    });
    markers.appendChild(button);
    return button;
  }

  manifest.places.forEach(item=>makeHotspot(item,'place'));
  manifest.symbols.forEach(item=>makeHotspot(item,'symbol'));

  function updateHotspots(){
    markers.querySelectorAll('.territory-hotspot').forEach(button=>{
      const threshold=Number(button.dataset.visibleFrom||1);
      const active=view.scale+0.001>=threshold;
      button.classList.toggle('active',active);
      button.tabIndex=active?0:-1;
      button.disabled=!active;
    });
  }

  function openTarot(item,type){
    const card=tarots[item.tarotCardRef];
    if(!card) return;
    about.classList.remove('open');
    reader.querySelector('.territory-v1-kicker').textContent=`HEARTHLANDS · ${type.toUpperCase()}`;
    const provider=window.DreamscapePrivateProfile||window.__dreamscapePrivateProfile;
    const providerLabel=type==='symbol'?provider?.getSemanticLabel?.(item.id):null;
    const privateRecord=type==='symbol'?window.__dreamscapePrivateIdentityMap?.[item.id]:null;
    const mapLabel=typeof privateRecord==='string'?privateRecord:(privateRecord?.label||privateRecord?.semanticLabel||null);
    reader.querySelector('h2').textContent=providerLabel||mapLabel||card.title;
    reader.querySelector('.territory-v1-grounding').textContent=card.corpusGrounding;
    reader.querySelector('.territory-v1-interpretation').textContent=card.interpretation;
    const related=reader.querySelector('.territory-v1-related');
    related.innerHTML=card.relatedItems?.length
      ? `<b>Related in the derived model</b><p>${card.relatedItems.map(id=>escapeHTML(id.replaceAll('-',' '))).join(' · ')}</p>`
      : '';
    const deeper=reader.querySelector('.territory-v1-deeper');
    deeper.hidden=card.deeperDestination!=='family-home';
    reader.dataset.card=item.id;
    reader.classList.add('open');
  }

  function closeReader(){reader.classList.remove('open');}
  function closeAbout(){about.classList.remove('open');}

  reader.querySelector('.territory-v1-reader-close').addEventListener('click',closeReader);
  about.querySelector('.territory-v1-about-close').addEventListener('click',closeAbout);
  reader.querySelector('.territory-v1-deeper').addEventListener('click',event=>{
    event.stopPropagation();
    closeReader();
    if(typeof window.enterDreamscapeFamilyHome==='function') window.enterDreamscapeFamilyHome();
  });

  layerSwitch.addEventListener('click',event=>{
    const action=event.target.closest('button')?.dataset.territoryAction;
    if(!action) return;
    if(action==='about'){closeReader();about.classList.add('open');}
    if(action==='zoom-in') zoomTo(view.scale*1.32);
    if(action==='zoom-out') zoomTo(view.scale/1.32);
    if(action==='reset') resetView();
  });

  scene.addEventListener('wheel',event=>{
    if(root.dataset.state!=='hearth'||root.dataset.familyHomeFocus) return;
    event.preventDefault();
    zoomTo(view.scale*Math.exp(-event.deltaY*0.0012),event.clientX,event.clientY);
  },{passive:false,capture:true});

  map.addEventListener('dblclick',event=>{
    if(root.dataset.state!=='hearth'||root.dataset.familyHomeFocus) return;
    event.preventDefault();
    zoomTo(view.scale*1.48,event.clientX,event.clientY);
  });

  map.addEventListener('pointerdown',event=>{
    if(root.dataset.state!=='hearth'||root.dataset.familyHomeFocus) return;
    if(event.target.closest('.territory-hotspot')) return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    map.setPointerCapture?.(event.pointerId);
    if(pointers.size===1){
      view.dragging=true;
      map.dataset.dragging='true';
    }else if(pointers.size===2){
      const pts=[...pointers.values()];
      pinchStart={
        distance:Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y),
        scale:view.scale,
        midpoint:{x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2}
      };
    }
  });

  map.addEventListener('pointermove',event=>{
    if(!pointers.has(event.pointerId)||root.dataset.familyHomeFocus) return;
    const prev=pointers.get(event.pointerId);
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.size===1&&view.dragging){
      view.panX+=event.clientX-prev.x;
      view.panY+=event.clientY-prev.y;
      applyTransform();
    }else if(pointers.size===2&&pinchStart){
      const pts=[...pointers.values()];
      const distance=Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y);
      zoomTo(pinchStart.scale*(distance/Math.max(1,pinchStart.distance)),pinchStart.midpoint.x,pinchStart.midpoint.y);
    }
  });

  function endPointer(event){
    if(!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    if(pointers.size<2) pinchStart=null;
    if(pointers.size===0){
      view.dragging=false;
      delete map.dataset.dragging;
      if(event.pointerType==='touch'){
        const now=performance.now();
        if(now-view.lastTap<360&&!event.target.closest('.territory-hotspot')) zoomTo(view.scale*1.45,event.clientX,event.clientY);
        view.lastTap=now;
      }
    }
  }
  map.addEventListener('pointerup',endPointer);
  map.addEventListener('pointercancel',endPointer);

  window.addEventListener('keydown',event=>{
    if(event.key!=='Escape') return;
    if(root.dataset.familyHomeFocus) return;
    if(reader.classList.contains('open')){closeReader();event.preventDefault();return;}
    if(about.classList.contains('open')){closeAbout();event.preventDefault();return;}
    if(root.dataset.state==='hearth'){document.querySelector('.return-world')?.click();event.preventDefault();}
  });

  window.addEventListener('resize',fitWorld);

  // Expose a tiny diagnostics surface for integrity checks/manual QA, not private corpus data.
  window.__hearthlandsTerritoryV1={
    getState:()=>({scale:view.scale,panX:view.panX,panY:view.panY,stage:view.stage}),
    reset:resetView,
    counts:{places:manifest.places.length,symbols:manifest.symbols.length},
    manifestVersion:manifest.schemaVersion
  };

  fitWorld();
  applyTransform();
}

boot().catch(error=>{
  console.error('Hearthlands Territory Layer v1 failed to start.',error);
  document.querySelector('.atlas')?.classList.add('territory-v1-error');
});
