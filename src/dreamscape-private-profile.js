const STORAGE_KEY='dreamscape.privateProfile.v1';

function sanitiseProfile(input){
  const source=input&&typeof input==='object'?input:{};
  const labels=source.semanticLabels&&typeof source.semanticLabels==='object'?source.semanticLabels:{};
  const semanticLabels={};
  for(const [id,label] of Object.entries(labels)){
    if(/^person-\d{2}$/.test(id)&&typeof label==='string'&&label.trim()) semanticLabels[id]=label.trim();
  }
  return {
    schemaVersion:'1.0.0',
    profileId:typeof source.profileId==='string'?source.profileId:null,
    semanticLabels
  };
}

function readSessionProfile(){
  try{
    const raw=sessionStorage.getItem(STORAGE_KEY);
    return raw?sanitiseProfile(JSON.parse(raw)):sanitiseProfile(null);
  }catch{return sanitiseProfile(null);}
}

let current=sanitiseProfile(window.__DREAMSCAPE_PRIVATE_PROFILE_BOOTSTRAP__||readSessionProfile());

function persist(){
  try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify(current));}catch{}
}

function notify(source='runtime'){
  window.dispatchEvent(new CustomEvent('dreamscape-private-profile-change',{
    detail:{profileId:current.profileId,resolvedIds:Object.keys(current.semanticLabels),source}
  }));
}

function applyProfile(profile,source='runtime'){
  current=sanitiseProfile(profile);
  persist();
  notify(source);
  return api.getProfile();
}

const api={
  getProfile:()=>structuredClone(current),
  getSemanticLabel:id=>current.semanticLabels[id]||null,
  setProfile(profile){return applyProfile(profile,'manual');},
  setSemanticLabels(labels,profileId=current.profileId){
    return applyProfile({profileId,semanticLabels:labels},'manual');
  },
  clear(){
    current=sanitiseProfile(null);
    try{sessionStorage.removeItem(STORAGE_KEY);}catch{}
    notify('clear');
  },
  async hydrateFromProvider(provider=window.__DREAMSCAPE_PRIVATE_PROFILE_PROVIDER__){
    if(!provider||typeof provider.loadProfile!=='function') return api.getProfile();
    const profile=await provider.loadProfile();
    if(profile) applyProfile(profile,'provider');
    if(typeof provider.subscribe==='function'){
      provider.subscribe(next=>{if(next) applyProfile(next,'provider-subscription');});
    }
    return api.getProfile();
  }
};

window.DreamscapePrivateProfile=api;
window.__dreamscapePrivateProfile=api;

async function loadLocalPreviewProvider(){
  if(!['localhost','127.0.0.1','::1'].includes(location.hostname)) return null;
  try{
    const response=await fetch('/__private/profile',{cache:'no-store'});
    if(!response.ok) return null;
    const profile=await response.json();
    return {loadProfile:async()=>profile};
  }catch{return null;}
}

(async()=>{
  const external=window.__DREAMSCAPE_PRIVATE_PROFILE_PROVIDER__;
  if(external){
    await api.hydrateFromProvider(external);
    return;
  }
  const local=await loadLocalPreviewProvider();
  if(local){
    window.__DREAMSCAPE_PRIVATE_PROFILE_PROVIDER__=local;
    await api.hydrateFromProvider(local);
    return;
  }
  notify('session');
})();
