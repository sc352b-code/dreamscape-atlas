import { buildWorld } from "../engine/buildWorld.js";
const corpus = await fetch("/corpora/reference-corpus.json").then(r=>r.json());
const world = buildWorld(corpus); const t = world.territories[0]; const place=t.places[0];
const dreamsById=new Map(corpus.dreams.map(d=>[d.id,d]));
const recurring=world.corpusSummary.recurringMotifs;
const fox=t.symbols.find(s=>s.name.toLowerCase()==="fox");
const app=document.querySelector("#app");
app.innerHTML=`<main class="dreamscape" data-mode="atlas">
  <canvas id="scene"></canvas><div class="vignette"></div><div class="film"></div>
  <header class="brand"><span class="mark">✦</span><div><b>DREAMSCAPE</b><small>A WORLD MADE FROM YOUR DREAMS</small></div></header>
  <div class="meta"><span>${world.corpusSummary.dreamCount} DREAMS</span><i></i><span>${world.corpusSummary.numinousCount} NUMINOUS</span><i></i><span>${world.corpusSummary.allMotifs.length} MOTIFS</span></div>
  <section class="poem atlas-copy"><p class="eyebrow">YOUR LIVING DREAM ATLAS</p><h1>A dream is a word.<br><em>This is the world<br>the whole book is making.</em></h1><p class="lede">Across your dreams, places return. Feelings gather gravity. Symbols become inhabitants. The Atlas gives those patterns somewhere to live.</p><button class="enter" id="approach">Approach the warm signal <span>✦</span></button><p class="quiet">The brighter a place becomes, the more your dreams have fed it.</p></section>
  <section class="signal-copy"><p class="eyebrow">A TERRITORY IS FORMING</p><h2>${t.name}</h2><p>${t.subtitle}</p><div class="signal-line"><span style="--w:${Math.round(t.strength*100)}%"></span></div><div class="signal-proof"><b>${Math.round(t.strength*100)}%</b> coherence · ${t.evidence.length} dreams shaping this place</div><div class="motifs">${t.evidenceMotifs.slice(0,6).map(m=>`<span>${m.name}<sup>${m.recurrence}</sup></span>`).join("")}</div><button class="enter" id="descend">Descend into ${t.name} <span>↓</span></button></section>
  <section class="arrival-copy"><p class="eyebrow">YOU HAVE ARRIVED IN</p><h2>${t.name}</h2><p class="arrival-whisper">home · hearth · fire · amber · belonging</p></section>
  <aside class="place-card"><p class="eyebrow">A PLACE MADE FROM RECURRENCE</p><h3>${place.name}</h3><p>House, home, kitchen, cottage, hearth and fire converge here. The world turns that repetition into one luminous dwelling.</p>${fox?`<div class="fox-row"><span>◆</span><div><b>${fox.name}</b><small>returns in ${fox.recurrence} dreams · ${fox.role}</small></div></div>`:""}<button class="enter small" id="evidence">See why this place exists <span>↗</span></button><button class="ghost" id="rise">Rise back to the Atlas</button></aside>
  <section class="evidence-drawer"><button id="close" class="close">×</button><p class="eyebrow">THE ATLAS REMEMBERS ITS SOURCES</p><h2>Dream evidence</h2><p class="drawer-intro">Nothing important in this world is arbitrary. These are the dreams currently giving Hearthlands its shape.</p>${t.evidence.map((id,i)=>{const d=dreamsById.get(id);return `<article><span>0${i+1}</span><div><small>${d.date}${d.numinous?" · NUMINOUS":""}</small><h4>${d.title}</h4><p>${d.text}</p><div class="tags">${d.tags.map(x=>`<i>${x}</i>`).join("")}</div></div></article>`}).join("")}</section>
  <div class="orbit-label l1">${recurring[0]?.name||"home"}<small>${recurring[0]?.recurrence||1} dreams</small></div>
  <div class="orbit-label l2">${recurring[1]?.name||"fox"}<small>${recurring[1]?.recurrence||1} dreams</small></div>
  <div class="orbit-label l3">${recurring[2]?.name||"fire"}<small>${recurring[2]?.recurrence||1} dreams</small></div>
</main>`;
const root=document.querySelector('.dreamscape'); const canvas=document.querySelector('#scene'); const ctx=canvas.getContext('2d');
const drawer=document.querySelector('.evidence-drawer'); const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let mode='atlas', target='atlas', start=performance.now(), transition=0, stars=[];
function setMode(next){ target=next; start=performance.now(); transition=0; root.dataset.mode=next; }
function lerp(a,b,x){return a+(b-a)*x} function ease(x){return 1-Math.pow(1-x,3)}
function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(d,0,0,d,0,0);stars=Array.from({length:260},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:.2+Math.random()*1.15,a:.18+Math.random()*.72,p:Math.random()*6.28}))}
function glowCircle(x,y,r,c,a=1){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c.replace('1)',`${a})`));g.addColorStop(.35,c.replace('1)',`${a*.45})`));g.addColorStop(1,c.replace('1)','0)'));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function drawStars(t,fade=1){for(const s of stars){const a=s.a*(reduced?1:.72+.28*Math.sin(t*.0007+s.p))*fade;ctx.fillStyle=`rgba(255,240,226,${a})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.28);ctx.fill()}}
function path(points,fill){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
function planet(t,zoom){const w=innerWidth,h=innerHeight; const x=lerp(w*.68,w*.5,zoom), y=lerp(h*.51,h*.52,zoom), r=lerp(Math.min(w,h)*.235,Math.max(w,h)*.94,zoom);
  glowCircle(x,y,r*1.34,'rgba(235,130,103,1)',.18*(1-zoom)); glowCircle(x-r*.12,y-r*.1,r*.98,'rgba(99,67,120,1)',.2*(1-zoom));
  ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,6.28);ctx.clip();let g=ctx.createRadialGradient(x-r*.32,y-r*.36,r*.05,x,y,r*1.25);g.addColorStop(0,'#9d6d79');g.addColorStop(.35,'#4f6570');g.addColorStop(.7,'#4b344f');g.addColorStop(1,'#0c0b18');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  const spin=t*.000025; ctx.save();ctx.translate(x,y);ctx.rotate(-.2+spin);
  path([[-r*.64,-r*.42],[-r*.28,-r*.66],[r*.12,-r*.53],[r*.22,-r*.18],[-r*.09,r*.02],[-r*.45,-r*.04]],'#be7e72bb');
  path([[r*.08,-r*.03],[r*.55,-r*.2],[r*.7,r*.16],[r*.4,r*.57],[r*.04,r*.45],[-r*.08,r*.14]],'#557d72b5');
  path([[-r*.55,r*.25],[-r*.25,r*.08],[-r*.12,r*.41],[-r*.37,r*.63]],'#737b70aa');ctx.restore();
  for(let i=0;i<4;i++){ctx.strokeStyle=`rgba(240,225,226,${.035+.018*i})`;ctx.lineWidth=r*.055;ctx.beginPath();ctx.ellipse(x+Math.sin(t*.00009+i)*r*.12,y-r*.18+i*r*.15,r*.62,r*.11,.08,0,6.28);ctx.stroke()}
  let shade=ctx.createLinearGradient(x-r,y-r,x+r,y+r);shade.addColorStop(0,'rgba(255,226,199,.13)');shade.addColorStop(.54,'rgba(20,12,27,.08)');shade.addColorStop(1,'rgba(2,2,10,.82)');ctx.fillStyle=shade;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();ctx.strokeStyle='rgba(255,199,163,.18)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,0,6.28);ctx.stroke();
  if(zoom<.75){const sx=x-r*.2, sy=y-r*.08;glowCircle(sx,sy,r*.16,'rgba(255,177,111,1)',.8);ctx.fillStyle='#ffd39e';ctx.beginPath();ctx.arc(sx,sy,3+5*(t%1000)/1000,0,6.28);ctx.fill();for(let k=0;k<3;k++){ctx.strokeStyle=`rgba(255,210,157,${.24-k*.05})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(sx,sy,(18+k*16+(t*.018)%40),0,6.28);ctx.stroke()}}
}
function hearthlands(t,alpha){const w=innerWidth,h=innerHeight;ctx.save();ctx.globalAlpha=alpha;let sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#101026');sky.addColorStop(.47,'#3d2943');sky.addColorStop(.78,'#8d574c');sky.addColorStop(1,'#28262e');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);glowCircle(w*.66,h*.53,h*.34,'rgba(255,137,84,1)',.32);glowCircle(w*.24,h*.18,h*.38,'rgba(103,74,143,1)',.12);
 ctx.fillStyle='rgba(247,215,185,.72)';ctx.beginPath();ctx.arc(w*.84,h*.16,22,0,6.28);ctx.fill();glowCircle(w*.84,h*.16,70,'rgba(247,198,156,1)',.16);
 path([[0,h*.67],[w*.12,h*.43],[w*.24,h*.61],[w*.37,h*.34],[w*.5,h*.6],[w*.64,h*.36],[w*.76,h*.58],[w*.9,h*.4],[w,h*.58],[w,h],[0,h]],'#28253bca');
 path([[0,h*.76],[w*.14,h*.54],[w*.29,h*.68],[w*.42,h*.48],[w*.58,h*.72],[w*.7,h*.51],[w*.86,h*.67],[w,h*.5],[w,h],[0,h]],'#5b3a46');
 path([[0,h*.83],[w*.16,h*.69],[w*.32,h*.82],[w*.49,h*.68],[w*.64,h*.85],[w*.82,h*.66],[w,h*.79],[w,h],[0,h]],'#22242b');
 let mist=ctx.createLinearGradient(0,h*.58,0,h);mist.addColorStop(0,'rgba(236,189,164,0)');mist.addColorStop(.45,'rgba(236,189,164,.13)');mist.addColorStop(1,'rgba(187,135,153,.03)');ctx.fillStyle=mist;ctx.fillRect(0,h*.5,w,h*.5);
 const hx=w*.67,hy=h*.59;glowCircle(hx,hy,110,'rgba(255,144,87,1)',.18);path([[hx-78,hy],[hx,hy-63],[hx+82,hy],[hx+61,hy+12],[hx-61,hy+12]],'#211c25');ctx.fillStyle='#392a2e';ctx.fillRect(hx-52,hy+5,104,67);ctx.fillStyle='#ffd08d';ctx.shadowBlur=18;ctx.shadowColor='#ff9856';ctx.fillRect(hx-35,hy+22,18,24);ctx.fillRect(hx+17,hy+22,18,24);ctx.shadowBlur=0;ctx.fillStyle='#18151a';ctx.fillRect(hx-8,hy+36,18,36);ctx.fillStyle='#211c25';ctx.fillRect(hx+35,hy-40,13,42);
 for(let i=0;i<46;i++){const p=(t*.00008+i*.071)%1;const ex=((i*83)%100)/100*w;const ey=h*(.72+.24*((i*47)%100)/100)-p*90;ctx.fillStyle=`rgba(255,190,119,${(.05+.45*(1-p))*alpha})`;ctx.beginPath();ctx.arc(ex,ey,1.2,0,6.28);ctx.fill()}
 const fx=w*.56,fy=h*.74;ctx.fillStyle='#d58162';ctx.beginPath();ctx.ellipse(fx,fy,12,6,.12,0,6.28);ctx.fill();path([[fx+7,fy-2],[fx+28,fy-9],[fx+23,fy+2]],'#c6745b');path([[fx-9,fy-5],[fx-5,fy-15],[fx,fy-6]],'#d58162');glowCircle(fx,fy,35,'rgba(235,125,82,1)',.12);
 ctx.restore()}
function render(tnow){const dt=Math.min(1,(tnow-start)/(reduced?80:2200));transition=ease(dt);if(target!==mode&&dt>=1)mode=target;ctx.clearRect(0,0,innerWidth,innerHeight);ctx.fillStyle='#07050d';ctx.fillRect(0,0,innerWidth,innerHeight);
 let z=0,ha=0;if(target==='signal')z=.18*transition;else if(target==='descent'){z=transition;ha=Math.max(0,(transition-.45)/.55)}else if(target==='hearthlands'||mode==='hearthlands'){z=1;ha=1}else if(target==='atlas'){z=mode==='hearthlands'?1-transition:0;ha=mode==='hearthlands'?1-transition:0}
 drawStars(tnow,1-ha*.72);planet(tnow,z);if(ha>0)hearthlands(tnow,ha);requestAnimationFrame(render)}
resize();addEventListener('resize',resize);requestAnimationFrame(render);
addEventListener('pointermove',e=>{root.style.setProperty('--mx',(e.clientX/innerWidth-.5).toFixed(3));root.style.setProperty('--my',(e.clientY/innerHeight-.5).toFixed(3))});
document.querySelector('#approach').onclick=()=>setMode('signal');document.querySelector('#descend').onclick=()=>{setMode('descent');setTimeout(()=>setMode('hearthlands'),reduced?120:2300)};document.querySelector('#evidence').onclick=()=>drawer.classList.add('open');document.querySelector('#close').onclick=()=>drawer.classList.remove('open');document.querySelector('#rise').onclick=()=>setMode('atlas');
