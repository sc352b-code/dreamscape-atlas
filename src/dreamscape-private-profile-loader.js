const LOCAL_PROFILE_KEY='dreamscape.privateProfile.browser.v1';

function safeParse(text){
  try{return JSON.parse(text);}catch{return null;}
}

function labelCount(profile){
  return profile&&profile.semanticLabels&&typeof profile.semanticLabels==='object'
    ? Object.keys(profile.semanticLabels).filter(id=>/^person-\d{2}$/.test(id)&&String(profile.semanticLabels[id]||'').trim()).length
    : 0;
}

function boot(){
  const api=window.DreamscapePrivateProfile||window.__dreamscapePrivateProfile;
  const root=document.querySelector('.atlas');
  const controls=document.querySelector('.territory-v1-controls');
  if(!api||!root||!controls){requestAnimationFrame(boot);return;}
  if(root.dataset.privateProfileLoader==='ready') return;
  root.dataset.privateProfileLoader='ready';

  // Restore a profile previously imported on this browser. It never leaves the browser.
  try{
    const cached=safeParse(localStorage.getItem(LOCAL_PROFILE_KEY)||'');
    if(cached&&labelCount(cached)) api.setProfile(cached);
  }catch{}

  const button=document.createElement('button');
  button.type='button';
  button.className='dreamscape-private-profile-button';
  button.textContent='ID';
  button.title='Load private identities on this browser';
  button.setAttribute('aria-label','Load private identities on this browser');
  controls.appendChild(button);

  function sync(){
    const count=labelCount(api.getProfile?.());
    root.classList.toggle('private-identities-loaded',count>0);
    button.textContent=count>0?'✓':'ID';
    button.title=count>0
      ? `${count} private identities loaded on this browser. Click to replace profile.`
      : 'Load private identities on this browser';
    button.setAttribute('aria-label',button.title);
  }

  button.addEventListener('click',()=>{
    const input=document.createElement('input');
    input.type='file';
    input.accept='application/json,.json';
    input.addEventListener('change',async()=>{
      const file=input.files?.[0];
      if(!file) return;
      const parsed=safeParse(await file.text());
      if(!parsed||!labelCount(parsed)){
        window.alert('That file does not contain a Dreamscape private identity profile.');
        return;
      }
      api.setProfile(parsed);
      try{localStorage.setItem(LOCAL_PROFILE_KEY,JSON.stringify(parsed));}catch{}
      sync();
    },{once:true});
    input.click();
  });

  window.addEventListener('dreamscape-private-profile-change',sync);
  window.addEventListener('hearthlands-private-identities-resolved',sync);
  sync();
}

boot();
