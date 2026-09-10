const REGISTRATION_URL='/worlds/reference-world/territories/hearthlands/validation/image-location-ledger.json';

async function loadRegistration(){
  const response=await fetch(REGISTRATION_URL,{cache:'no-store'});
  if(!response.ok) throw new Error(`Registration ledger ${response.status}`);
  return response.json();
}

function waitForTerritory(ledger){
  const root=document.querySelector('.atlas');
  const markers=document.querySelector('.flatmap-markers');
  const controls=document.querySelector('.territory-v1-controls');
  if(!root||!markers||!controls||!window.__hearthlandsTerritoryV1){
    requestAnimationFrame(()=>waitForTerritory(ledger));
    return;
  }
  if(root.dataset.registrationV1==='ready') return;
  root.dataset.registrationV1='ready';

  const byKey=new Map(ledger.entries.map(entry=>[`${entry.kind}:${entry.id}`,entry]));
  const unresolved=[];
  const registered=[];

  markers.querySelectorAll('.territory-hotspot').forEach(button=>{
    const kind=button.dataset.kind;
    const id=button.dataset.id;
    const entry=byKey.get(`${kind}:${id}`);
    if(!entry||entry.registrationStatus!=='registered'){
      button.classList.add('territory-hotspot--unregistered');
      button.dataset.registrationStatus='needs-art-correction';
      button.disabled=true;
      button.tabIndex=-1;
      unresolved.push({kind,id});
      return;
    }

    button.classList.add('territory-hotspot--registered');
    button.dataset.registrationStatus='registered';
    button.style.left=`${entry.x*100}%`;
    button.style.top=`${entry.y*100}%`;
    button.style.setProperty('--registered-hit-w',`${entry.hitArea.width*100}%`);
    button.style.setProperty('--registered-hit-h',`${entry.hitArea.height*100}%`);
    button.style.setProperty('--registered-hit-radius',entry.hitArea.shape==='ellipse'?'50%':'22%');
    button.dataset.visibleFrom=String(entry.activeFromZoom);
    button.setAttribute('aria-label',`${entry.label}, ${entry.kind}`);
    const label=button.querySelector('span');
    if(label) label.textContent=entry.label;
    registered.push({kind,id});
  });

  controls.setAttribute('aria-label','Hearthlands zoom and information controls');
  const zoomIn=controls.querySelector('[data-territory-action="zoom-in"]');
  const zoomOut=controls.querySelector('[data-territory-action="zoom-out"]');
  const reset=controls.querySelector('[data-territory-action="reset"]');
  if(zoomIn) zoomIn.title='Zoom in';
  if(zoomOut) zoomOut.title='Zoom out';
  if(reset){reset.title='Reset / recenter map';reset.setAttribute('aria-label','Reset and recenter map');}

  const observer=new MutationObserver(()=>{
    markers.querySelectorAll('.territory-hotspot--unregistered').forEach(button=>{
      button.disabled=true;
      button.tabIndex=-1;
    });
  });
  observer.observe(root,{attributes:true,attributeFilter:['data-territory-zoom-stage']});

  window.__hearthlandsRegistrationV1={
    counts:{registered:registered.length,unresolved:unresolved.length},
    registered,
    unresolved,
    ledgerVersion:ledger.schemaVersion
  };
}

loadRegistration().then(waitForTerritory).catch(error=>{
  console.error('Hearthlands image registration failed.',error);
  document.querySelector('.atlas')?.classList.add('territory-registration-error');
});
