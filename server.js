import http from 'node:http';
import { readFile, stat, chmod } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { openStore } from './backend/store.js';
import { validDate, periodRange, evidenceReflection, statistics, corpusVersion } from './engine/evidence.js';
const root=path.dirname(fileURLToPath(import.meta.url));
const hashPassword=promisify(scrypt),digest=s=>createHash('sha256').update(s).digest('hex');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.avif':'image/avif','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.b64':'text/plain; charset=utf-8'};
const fail=(status,message)=>Object.assign(new Error(message),{status});
export function createApp({database=process.env.DREAMSCAPE_DB || '/workspace/.dreamscape-data/app.sqlite',origin=process.env.DREAMSCAPE_ORIGIN || 'http://localhost:4173'}={}) {
  const store=openStore(database),limits=new Map();chmod(database,0o600).catch(()=>{});
  const secure=new URL(origin).protocol==='https:';
  const cookie=(token,age)=>`dreamscape_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secure?'; Secure':''}`;
  function limit(req,group,max) {
    const key=(req.socket.remoteAddress||'')+group,now=Date.now();
    if(limits.size>10000)for(const [k,v] of limits)if(v.reset<now)limits.delete(k);
    let v=limits.get(key);if(!v||v.reset<now){v={count:0,reset:now+600000};limits.set(key,v);}if(++v.count>max)throw fail(429,'Too many requests. Please try again later.');
  }
  async function body(req) {
    if(!req.headers['content-type']?.startsWith('application/json'))throw fail(415,'Use JSON for this request.');
    let data='',size=0;for await(const chunk of req){size+=chunk.length;if(size>1024*1024)throw fail(413,'This upload is too large (maximum 1 MB).');data+=chunk;}
    try{const parsed=JSON.parse(data);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error();return parsed;}catch{throw fail(400,'Invalid JSON object.');}
  }
  function sessionToken(req){return(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('dreamscape_session='))?.slice('dreamscape_session='.length);}
  function authenticated(req) {
    const token=sessionToken(req),row=token&&store.db.prepare('SELECT users.id,users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?').get(digest(token),Date.now());
    if(!row)throw fail(401,'Sign in to access your private dreams.');return row;
  }
  function entry(data,kind,previous) {
    if(!['dream','waking'].includes(kind))throw fail(400,'Choose a dream or waking journal.');
    if(!validDate(data.date))throw fail(400,'Choose a valid date.');
    if(typeof data.title!=='string'||!data.title.trim()||data.title.length>200)throw fail(400,'Enter a title of up to 200 characters.');
    if(typeof data.text!=='string'||!data.text.trim()||data.text.length>50000)throw fail(400,'Enter your narrative (up to 50,000 characters).');
    if(!Array.isArray(data.tags)||data.tags.length>30||data.tags.some(t=>typeof t!=='string'||t.length>60))throw fail(400,'Use up to 30 short tags.');
    if(data.associations!=null&&(typeof data.associations!=='string'||data.associations.length>5000))throw fail(400,'Personal associations must be text, up to 5,000 characters.');
    if(data.id!=null&&(typeof data.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(data.id)))throw fail(400,'Invalid entry identifier.');
    if(previous&&data.kind&&data.kind!==previous.kind)throw fail(400,'Dream and waking entries remain separate.');
    return {id:previous?.id||data.id||randomUUID(),kind,date:data.date,title:data.title.trim(),text:data.text,originalText:previous?.originalText||data.text,
      tags:[...new Set(data.tags.map(t=>t.trim().toLowerCase()).filter(Boolean))],associations:data.associations||'',
      flags:{numinous:!!data.flags?.numinous,lucid:!!data.flags?.lucid,directMessage:!!data.flags?.directMessage},
      created:previous?.created||new Date().toISOString(),updated:new Date().toISOString(),revision:(previous?.revision||0)+1,
      history:previous?[...(previous.history||[]),{date:previous.date,title:previous.title,text:previous.text,updated:previous.updated}].slice(-50):[]};
  }
  const server=http.createServer(async(req,res)=>{
    const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'SAMEORIGIN',
      'Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self'; frame-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'"};
    const json=(status,data,extra={})=>{res.writeHead(status,{...headers,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra});res.end(JSON.stringify(data));};
    try {
      const url=new URL(req.url,'http://localhost'),p=url.pathname;
      if(p.startsWith('/api/')) {
        if(!['GET','POST','PUT','DELETE'].includes(req.method))throw fail(405,'Unsupported request method.');
        if(req.method!=='GET'){if(req.headers.origin!==origin)throw fail(403,'This request did not come from this application.');limit(req,'writes',240);}
        if(p==='/api/register'||p==='/api/login') {
          if(req.method!=='POST')throw fail(405,'Use POST.');limit(req,'auth',30);const data=await body(req),email=typeof data.email==='string'?data.email.trim().toLowerCase():'';
          if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof data.password!=='string'||data.password.length<12||data.password.length>128)throw fail(400,'Use a valid email and a password of 12–128 characters.');
          let user=store.db.prepare('SELECT * FROM users WHERE email=?').get(email);
          if(p==='/api/register'){
            if(user)throw fail(409,'This email already has an account. Please sign in.');
            const salt=randomBytes(16).toString('hex'),password=(await hashPassword(data.password,salt,64)).toString('hex');user={id:randomUUID(),email};
            store.db.prepare('INSERT INTO users VALUES(?,?,?,?)').run(user.id,email,`${salt}:${password}`,new Date().toISOString());
          }else{
            const [salt,expected]=(user?.password||'missing:'+ '00'.repeat(64)).split(':'),actual=await hashPassword(data.password,salt,64);
            if(!user||!timingSafeEqual(actual,Buffer.from(expected,'hex')))throw fail(401,'Email or password was not recognised.');
          }
          const token=randomBytes(32).toString('hex');store.db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(digest(token),user.id,Date.now()+7*86400000);
          return json(200,{user:{id:user.id,email:user.email}},{'Set-Cookie':cookie(token,604800)});
        }
        const user=authenticated(req),entries=()=>store.entries(user.id),dreams=()=>entries().filter(d=>d.kind==='dream');
        if(p==='/api/me'&&req.method==='GET')return json(200,{user});
        if(p==='/api/logout'&&req.method==='POST'){store.db.prepare('DELETE FROM sessions WHERE token=?').run(digest(sessionToken(req)));return json(200,{ok:true},{'Set-Cookie':cookie('',0)});}
        if(p==='/api/state'&&req.method==='GET')return json(200,{entries:entries(),readings:store.readings(user.id).map(r=>({...r,stale:r.corpusVersion!==corpusVersion(dreams().filter(d=>d.date>=r.period.start&&d.date<=r.period.end))})),favourites:store.favourites(user.id),capabilities:{ai:false,illustration:false,speech:false,billing:false}});
        if(p==='/api/entries'&&req.method==='POST'){
          const data=await body(req),previous=data.id&&store.entry(user.id,data.id);if(previous)return json(200,{entry:previous});
          const record=entry(data,data.kind);store.saveEntry(user.id,record);return json(201,{entry:record});
        }
        if(p.startsWith('/api/entries/')) {
          const id=decodeURIComponent(p.slice('/api/entries/'.length)),previous=store.entry(user.id,id);if(!previous)throw fail(404,'That journal entry is unavailable.');
          if(req.method==='GET')return json(200,{entry:previous});
          if(req.method==='PUT'){const data=await body(req);if(data.revision!==previous.revision)throw fail(409,'This entry changed elsewhere. Your local draft is preserved; reload the entry before saving.');const record=entry(data,previous.kind,previous);store.saveEntry(user.id,record);return json(200,{entry:record});}
          if(req.method==='DELETE'){store.db.prepare('DELETE FROM entries WHERE user_id=? AND id=?').run(user.id,id);store.db.prepare('DELETE FROM favourites WHERE user_id=? AND id=?').run(user.id,id);return json(200,{ok:true});}
        }
        if(p==='/api/import'&&req.method==='POST'){
          const data=await body(req);if(!Array.isArray(data.entries)||data.entries.length>200)throw fail(400,'Import up to 200 journal entries per file.');
          const records=data.entries.map(d=>entry({...d,id:undefined},d.kind||'dream'));store.db.exec('BEGIN');try{for(const r of records)store.saveEntry(user.id,r);store.db.exec('COMMIT');}catch(e){store.db.exec('ROLLBACK');throw e;}return json(201,{imported:records.length});
        }
        if(p==='/api/readings'&&req.method==='POST'){
          const data=await body(req);let period,reading;try{period=periodRange(data.type,data.anchor);}catch(e){throw fail(400,e.message);}
          try{reading=evidenceReflection(dreams(),period);}catch(e){throw fail(422,e.message);}
          const existing=store.readings(user.id).find(r=>r.corpusVersion===reading.corpusVersion&&r.period.start===period.start&&r.period.end===period.end);
          if(existing)return json(200,{reading:existing,reused:true});reading={...reading,id:randomUUID(),created:new Date().toISOString()};store.saveReading(user.id,reading);return json(201,{reading});
        }
        if(p==='/api/statistics'&&req.method==='GET'){const period=periodRange(url.searchParams.get('type')||'monthly',url.searchParams.get('anchor')||new Date().toISOString().slice(0,10));return json(200,{period,...statistics(dreams().filter(d=>d.date>=period.start&&d.date<=period.end))});}
        if(p==='/api/favourites'&&req.method==='POST'){
          const data=await body(req);if(!['entry','reading'].includes(data.kind))throw fail(400,'Choose a journal entry or reading.');
          const exists=data.kind==='entry'?store.entry(user.id,data.id):store.readings(user.id).find(r=>r.id===data.id);if(!exists)throw fail(404,'That source is unavailable.');
          if(data.saved)store.db.prepare('INSERT OR IGNORE INTO favourites VALUES(?,?,?)').run(user.id,data.kind,data.id);else store.db.prepare('DELETE FROM favourites WHERE user_id=? AND kind=? AND id=?').run(user.id,data.kind,data.id);return json(200,{ok:true});
        }
        if(p==='/api/export'&&req.method==='GET')return json(200,{format:'dreamscape-export-v1',exported:new Date().toISOString(),entries:entries(),readings:store.readings(user.id),favourites:store.favourites(user.id)});
        if(p==='/api/account'&&req.method==='DELETE'){const data=await body(req);if(data.confirm!=='DELETE')throw fail(400,'Type DELETE to confirm.');store.db.prepare('DELETE FROM users WHERE id=?').run(user.id);return json(200,{ok:true},{'Set-Cookie':cookie('',0)});}
        throw fail(404,'This action is unavailable.');
      }
      if(!['GET','HEAD'].includes(req.method))throw fail(405,'Unsupported request method.');
      const clean=decodeURIComponent(p);if(clean.split('/').some(s=>s==='..'||s.startsWith('.')))throw fail(404,'Not found.');const relative=clean==='/'?'index.html':clean==='/dream-world-reference'?'dream-world-reference.html':clean==='/vendor/three.module.js'?'node_modules/three/build/three.module.js':clean==='/vendor/three.core.js'?'node_modules/three/build/three.core.js':clean.replace(/^\/+/, '');
      if(!(relative==='index.html'||relative==='dream-world-reference.html'||relative==='sw.js'||/^(src|assets|worlds)\//.test(relative)||/^node_modules\/three\/build\/three\.(module|core)\.js$/.test(relative)))throw fail(404,'Not found.');
      const target=path.resolve(root,relative);if(!target.startsWith(root+path.sep))throw fail(403,'Forbidden.');if(!types[path.extname(target)])throw fail(404,'Not found.');
      const info=await stat(target);if(!info.isFile())throw fail(404,'Not found.');const data=await readFile(target);
      res.writeHead(200,{...headers,'Content-Type':types[path.extname(target)],'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
    }catch(e){json(e.status||(e.code==='ENOENT'?404:500),{error:e.status||e.code==='ENOENT'?e.message:'The request could not be completed. Please try again.'});}
  });
  server.on('close',()=>store.close());return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||4173);createApp().listen(port,'0.0.0.0',()=>console.log(`Dreamscape development server listening on port ${port}`));
}
