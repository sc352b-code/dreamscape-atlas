const STORAGE_KEY='dreamscape.privateProfile.v1';

function sanitiseDreamRecord(record){
  if(!record||typeof record!=='object') return null;
  const id=typeof record.id==='string'?record.id.trim():'';
  if(!id) return null;
  return {
    id,
    title:typeof record.title==='string'?record.title:null,
    date:typeof record.date==='string'?record.date:null,
    territoryIds:Array.isArray(record.territoryIds)?record.territoryIds.filter(x=>typeof x==='string'):[],
    excerpt:typeof record.excerpt==='string'?record.excerpt:null,
    privateRecordRef:typeof record.privateRecordRef==='string'?record.privateRecordRef:null
  };
}

function sanitiseProfile(input){
  const source=input&&typeof input==='object'?input:{};
  const labels=source.semanticLabels&&typeof source.semanticLabels==='object'?source.semanticLabels:{};
  const semanticLabels={};
  for(const [id,label] of Object.entries(labels)){
    if(/^person-\d{2}$/.test(id)&&typeof label==='string'&&label.trim()) semanticLabels[id]=label.trim();
  }

  const dreamRecordsBySubject={};
  const recordSource=source.dreamRecordsBySubject&&typeof source.dreamRecordsBySubject==='object'?source.dreamRecordsBySubject:{};
  for(const [subjectId,records] of Object.entries(recordSource)){
    if(!Array.isArray(records)) continue;
    const clean=records.map(sanitiseDreamRecord).filter(Boolean);
    if(clean.length) dreamRecordsBySubject[subjectId]=clean;
  }

  return {
    schemaVersion:'1.1.0',
    profileId:typeof source.profileId==='string'?source.profileId:null,
    semanticLabels,
    dreamRecordsBySubject
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
    detail:{
      profileId:current.profileId,
      resolvedIds:Object.keys(current.semanticLabels),
      dreamRecordSubjects:Object.keys(current.dreamRecordsBySubject),
      source
    }
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
  getDreamRecords:subjectId=>structuredClone(current.dreamRecordsBySubject[subjectId]||[]),
  setProfile(profile){return applyProfile(profile,'manual');},
  setSemanticLabels(labels,profileId=current.profileId){
    return applyProfile({
      profileId,
      semanticLabels:labels,
      dreamRecordsBySubject:current.dreamRecordsBySubject
    },'manual');
  },
  setDreamRecords(subjectId,records){
    const next=structuredClone(current);
    next.dreamRecordsBySubject[subjectId]=Array.isArray(records)?records:[];
    return applyProfile(next,'manual-records');
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
  let provider=window.__DREAMSCAPE_PRIVATE_PROFILE_PROVIDER__;
  if(!provider) provider=await loadLocalPreviewProvider();
  if(provider){
    window.__DREAMSCAPE_PRIVATE_PROFILE_PROVIDER__=provider;
    await api.hydrateFromProvider(provider);
    return;
  }
  notify('session');
})();
