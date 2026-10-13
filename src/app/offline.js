let connection;
function db(){return connection ||= new Promise((resolve,reject)=>{const req=indexedDB.open('dreamscape-private-drafts',1);req.onupgradeneeded=()=>req.result.createObjectStore('drafts',{keyPath:'key'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function transact(mode,action){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('drafts',mode),store=tx.objectStore('drafts');let result;const req=action(store);if(req)req.onsuccess=()=>result=req.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);});}
export const saveDraft=(user,record,status='saved locally')=>transact('readwrite',s=>s.put({key:user+':'+record.id,user,record,status,updated:Date.now()}));
export const removeDraft=(user,id)=>transact('readwrite',s=>s.delete(user+':'+id));
export const drafts=async(user)=>(await transact('readonly',s=>s.getAll())).filter(d=>d.user===user);
export async function eraseDrafts(user){for(const d of await drafts(user))await removeDraft(user,d.record.id);}
