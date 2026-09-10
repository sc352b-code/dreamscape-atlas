const STORAGE_KEY='dreamscape.privateProfile.v1';

function sanitiseProfile(input){
  const source=input&&typeof input==='object'?input:{};
  const labels=source.semanticLabels&&typeof source.semanticLabels==='object'?source.semanticLabels:{};
  const semanticLabels={};
  for(const [id,label] of Object.entries(labels)){
    if(/^person-\\d{2}$/.test(id)&&typeof label==='string'&&label.trim()) semanticLabels[id]=label.trim();
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

function notify(){
  window.dispatchEvent(new CustomEvent('dreamscape-private-profile-change',{detail:{profileId:current.profileId,resolvedIds:Object.keys(current.semanticLabels)}}));
}

const api={
  getProfile:()=>structuredClone(current),
  getSemanticLabel:id=>current.semanticLabels[id]||null,
  setProfile(profile){
    current=sanitiseProfile(profile);
    persist();
    notify();
    return api.getProfile();
  },
  setSemanticLabels(labels,profileId=current.profileId){
    current=sanitiseProfile({profileId,semanticLabels:labels});
    persist();
    notify();
    return api.getProfile();
  },
  clear(){
    current=sanitiseProfile(null);
    try{sessionStorage.removeItem(STORAGE_KEY);}catch{}
    notify();
  }
};

window.DreamscapePrivateProfile=api;
window.__dreamscapePrivateProfile=api;
notify();
