const REGISTRATION_URL='/worlds/reference-world/territories/hearthlands/validation/image-location-ledger.json';
const IDENTITY_REGISTRATION_URL='/worlds/reference-world/territories/hearthlands/validation/human-identity-registration.json';

async function loadJSON(url){
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok) throw new Error(`${url} ${response.status}`);
  return response.json();
}

async function loadRegistration(){
  const [ledger,identityRegistration]=await Promise.all([
    loadJSON(REGISTRATION_URL),
    loadJSON(IDENTITY_REGISTRATION_URL)
  ]);
  return {ledger,identityRegistration};
}

function waitForTerritory(payload){
  const {ledger,identityRegistration}=payload;
  const root=document.querySelector('.atlas');
  const markers=document.querySelector('.flatmap-markers');
  const controls=document.querySelector('.territory-v1-controls');
  if(!root||!markers||!controls||!window.__hearthlandsTerritoryV1){
    requestAnimationFrame(()=>waitForTerritory(payload));
    return;
  }
  if(root.dataset.registrationV1==='ready') return;
  root.dataset.registrationV1='ready';

  const byKey=new Map(ledger.entries.map(entry=>[`${entry.kind}:${entry.id}`,entry]));
  const privateIdentityById=new Map(identityRegistration.entries.map(entry=>[entry.id,entry]));
  const unresolved=[];
  const registered=[];

  function suppress(button,status){
    button.classList.add('territory-hotspot--unregistered');
    button.classList.remove('territory-hotspot--registered');
    button.dataset.registrationStatus=status;
    button.disabled=true;
    button.tabIndex=-1;
  }

  function activate(button,entry,label){
    button.classList.remove('territory-hotspot--unregistered');
    button.classList.add('territory-hotspot--registered');
    button.dataset.registrationStatus='registered';
    button.style.left=`${entry.x*100}%`;
    button.style.top=`${entry.y*100}%`;
    button.style.setProperty('--registered-hit-w',`${entry.hitArea.width*100}%`);
    button.style.setProperty('--registered-hit-h',`${entry.hitArea.height*100}%`);
    button.style.setProperty('--registered-hit-radius',entry.hitArea.shape==='ellipse'?'50%':'22%');
    button.dataset.visibleFrom=String(entry.activeFromZoom);
    button.setAttribute('aria-label',`${label}, ${entry.kind}`);
    const span=button.querySelector('span');
    if(span) span.textContent=label;
    const state=window.__hearthlandsTerritoryV1?.getState?.();
    const active=(state?.scale??1)+0.001>=entry.activeFromZoom;
    button.disabled=!active;
    button.tabIndex=active?0:-1;
    button.classList.toggle('active',active);
  }

  markers.querySelectorAll('.territory-hotspot').forEach(button=>{
    const kind=button.dataset.kind;
    const id=button.dataset.id;
    const identityEntry=privateIdentityById.get(id);
    if(identityEntry){
      suppress(button,'private-label-required');
      button.dataset.privateIdentity='true';
      unresolved.push({kind,id,status:'private-label-required'});
      return;
    }

    const entry=byKey.get(`${kind}:${id}`);
    if(!entry||entry.registrationStatus!=='registered'){
      suppress(button,'needs-art-correction');
      unresolved.push({kind,id,status:'needs-art-correction'});
      return;
    }
    activate(button,entry,entry.label);
    registered.push({kind,id});
  });

  function resolvePrivateIdentities(map={}){
    window.__dreamscapePrivateIdentityMap=map;
    const resolved=[];
    const pending=[];
    for(const entry of identityRegistration.entries){
      const button=markers.querySelector(`.territory-hotspot[data-kind="symbol"][data-id="${entry.id}"]`);
      if(!button) continue;
      const privateRecord=map[entry.id];
      const label=typeof privateRecord==='string'
        ? privateRecord
        : privateRecord?.label||privateRecord?.semanticLabel||null;
      if(!label){
        suppress(button,'private-label-required');
        pending.push(entry.id);
        continue;
      }
      activate(button,entry,label);
      button.dataset.privateLabelResolved='true';
      button.dataset.privateLabel=label;
      if(!button.dataset.privateTarotPatch){
        button.dataset.privateTarotPatch='true';
        button.addEventListener('click',()=>{
          const activeLabel=button.dataset.privateLabel;
          setTimeout(()=>{
            const reader=document.querySelector('.territory-v1-reader');
            if(!reader||reader.dataset.card!==entry.id) return;
            const heading=reader.querySelector('h2');
            if(heading&&activeLabel) heading.textContent=activeLabel;
          },0);
        },true);
      }
      resolved.push(entry.id);
    }
    window.__hearthlandsRegistrationV1.privateIdentity={resolved,pending};
    return {resolved,pending};
  }

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
    counts:{
      registered:registered.length,
      unresolved:unresolved.length,
      technicalPrivateIdentityRegistrations:identityRegistration.entries.length
    },
    registered,
    unresolved,
    privateIdentity:{resolved:[],pending:identityRegistration.entries.map(x=>x.id)},
    ledgerVersion:ledger.schemaVersion,
    identityRegistrationVersion:identityRegistration.schemaVersion
  };
  window.resolveHearthlandsPrivateIdentities=resolvePrivateIdentities;
  resolvePrivateIdentities(window.__dreamscapePrivateIdentityMap||{});
}

loadRegistration().then(waitForTerritory).catch(error=>{
  console.error('Hearthlands image registration failed.',error);
  document.querySelector('.atlas')?.classList.add('territory-registration-error');
});
