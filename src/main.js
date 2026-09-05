import { buildWorld } from "../engine/buildWorld.js";

const corpus=await fetch("/corpora/reference-corpus.json").then(r=>r.json());
const world=buildWorld(corpus), territory=world.territories[0], place=territory.places[0], summary=world.corpusSummary;
const fox=territory.symbols.find(s=>s.name.toLowerCase()==="fox")??territory.symbols[0];
const dreamById=new Map(corpus.dreams.map(d=>[d.id,d]));
const evidenceDreams=territory.evidence.map(id=>dreamById.get(id)).filter(Boolean);
const recurring=summary.recurringMotifs.slice(0,6);
const app=document.querySelector("#app"), reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const pct=n=>Math.round(n*100);

app.innerHTML=`<main class="dreamscape" data-state="atlas" style="--core:${territory.palette.core};--glow:${territory.palette.glow};--shadow:${territory.palette.shadow};--mist:${territory.palette.mist};--strength:${territory.strength};--mist-level:${territory.atmosphere.mist};--ember-level:${territory.atmosphere.embers}">
<canvas id="stars"></canvas><div class="aurora a1"></div><div class="aurora a2"></div><div class="grain"></div>
<header><div class="sigil">✦</div><div><b>DREAMSCAPE</b><small>YOUR LIVING DREAM WORLD</small></div></header>
<div class="chapter"><span>ATLAS I</span><i></i><span>${summary.dreamCount} DREAMS · ${summary.motifCount} MOTIFS · ${summary.numinousCount} NUMINOUS</span></div>
<section class="intro"><p class="overline">A WORLD FORMED ACROSS MANY DREAMS</p><h1>Your dreams have begun<br>to make a <em>place.</em></h1><p class="lede">Not an interpretation of a single night. This is the geography left behind by repetition — places, feelings and presences gathering weight across your dream corpus.</p><button id="reveal" class="ritual">Reveal what is gathering <span>✦</span></button><div class="whisper">The brighter the world, the stronger the evidence.</div></section>
<section class="world-stage">
 <div class="orbit o1"></div><div class="orbit o2"></div><div class="orbit o3"></div>
 <div class="planet-shell"><div class="planet-glow"></div><button id="planet" class="planet" aria-label="Approach Hearthlands"><span class="land l1"></span><span class="land l2"></span><span class="land l3"></span><span class="cloud c1"></span><span class="cloud c2"></span><span class="terminator"></span><span class="atmosphere"></span><span class="signal"><i></i><b></b></span></button></div>
 <div class="motif m1">${recurring[0]?.name??"home"}<small>${recurring[0]?.recurrence??1} dreams</small></div><div class="motif m2">${recurring[1]?.name??"fox"}<small>${recurring[1]?.recurrence??1} dreams</small></div><div class="motif m3">${recurring[2]?.name??"fire"}<small>${recurring[2]?.recurrence??1} dreams</small></div>
</section>
<aside class="evidence-panel"><p class="overline">CORPUS SIGNAL</p><h2>${territory.name}</h2><p>${territory.subtitle}</p><div class="strength"><span>territory coherence</span><b>${pct(territory.strength)}%</b><i><u style="width:${pct(territory.strength)}%"></u></i></div><div class="motif-list">${territory.evidenceMotifs.slice(0,5).map(m=>`<button data-motif="${m.name}"><span>${m.name}</span><b>${m.recurrence}</b></button>`).join("")}</div><p class="proof">Built from ${territory.evidence.length} of ${summary.dreamCount} dreams · ${summary.numinousCount} carry numinous charge</p><button id="descend" class="ritual compact">Descend into ${territory.name} <span>↓</span></button></aside>
<section class="hearthlands">
 <div class="skyfire"></div><div class="moon"></div><div class="ridge r1"></div><div class="ridge r2"></div><div class="ridge r3"></div><div class="fog f1"></div><div class="fog f2"></div><div class="dream-path"></div>
 <div class="fox" title="Fox — recurring guide"><span>◆</span><i></i></div>
 <button id="house" class="house"><span class="roof"></span><span class="chimney"><i></i></span><span class="walls"><i></i><i></i><b></b></span></button><div id="embers" class="embers"></div>
 <div class="arrival"><p class="overline">A TERRITORY MADE FROM RECURRENCE</p><h2>${territory.name}</h2><p>${territory.evidenceMotifs.slice(0,5).map(m=>m.name).join(" · ")}</p></div>
 <aside class="place-panel"><p class="overline">PLACE · ${place.evidence.length} DREAMS</p><h2>${place.name}</h2><p>This dwelling is not decoration. House, home, kitchen, cottage, hearth and fire converge here, so the world gives their recurrence a single luminous place.</p>${fox?`<div class="symbol-proof"><span class="foxmark">◆</span><div><b>${fox.name}</b><small>returns in ${fox.recurrence} dreams · ${fox.role}</small></div></div>`:""}<button id="showEvidence" class="ritual compact">Open the dream evidence <span>↗</span></button><button id="rise" class="ghost">Rise back to the Atlas</button></aside>
</section>
<section class="evidence-drawer"><button id="closeEvidence" class="close">×</button><p class="overline">WHY THIS PLACE EXISTS</p><h2>Dream evidence</h2><p class="drawer-intro">The Atlas keeps its imagination accountable. Every major landmark can be traced back to the dreams that shaped it.</p><div class="dreams">${evidenceDreams.map((d,i)=>`<article><span>0${i+1}</span><div><small>${d.date} ${d.numinous?"· NUMINOUS":""}</small><h3>${d.title}</h3><p>${d.text}</p><div>${(d.tags??[]).map(t=>`<i>${t}</i>`).join("")}</div></div></article>`).join("")}</div></section>
<div class="cursor-hint">move through the world gently</div></main>`;

const root=document.querySelector(".dreamscape"), evidence=document.querySelector(".evidence-drawer"), embers=document.querySelector("#embers");
function state(s){root.dataset.state=s}
function seedEmbers(){if(embers.children.length)return;const count=Math.round(24+territory.atmosphere.embers*45);for(let i=0;i<count;i++){const e=document.createElement("i");e.style.left=`${Math.random()*100}%`;e.style.top=`${58+Math.random()*40}%`;e.style.animationDelay=`${Math.random()*6}s`;e.style.animationDuration=`${3+Math.random()*5}s`;embers.append(e)}}
function approach(){state("signal")}
function descend(){seedEmbers();state("descent");setTimeout(()=>state("hearthlands"),reduced?100:2100)}
document.querySelector("#reveal").onclick=approach;document.querySelector("#planet").onclick=approach;document.querySelector("#descend").onclick=descend;document.querySelector("#house").onclick=()=>evidence.classList.add("open");document.querySelector("#showEvidence").onclick=()=>evidence.classList.add("open");document.querySelector("#closeEvidence").onclick=()=>evidence.classList.remove("open");document.querySelector("#rise").onclick=()=>state("atlas");
document.querySelectorAll("[data-motif]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-motif]").forEach(x=>x.classList.remove("active"));b.classList.add("active");root.style.setProperty("--pulse","1")});
addEventListener("pointermove",e=>{if(reduced)return;root.style.setProperty("--mx",(e.clientX/innerWidth-.5).toFixed(3));root.style.setProperty("--my",(e.clientY/innerHeight-.5).toFixed(3))});

const canvas=document.querySelector("#stars"),ctx=canvas.getContext("2d");let stars=[];function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;canvas.style.width=`${innerWidth}px`;canvas.style.height=`${innerHeight}px`;ctx.setTransform(d,0,0,d,0,0);stars=Array.from({length:Math.min(330,Math.round(innerWidth*innerHeight/4800))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.2+.15,a:Math.random()*.7+.18,p:Math.random()*6.28}))}function draw(t=0){ctx.clearRect(0,0,innerWidth,innerHeight);for(const s of stars){ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.28);ctx.fillStyle=`rgba(255,239,221,${s.a*(reduced?1:.72+Math.sin(t*.0007+s.p)*.28)})`;ctx.fill()}requestAnimationFrame(draw)}resize();addEventListener("resize",resize);requestAnimationFrame(draw);
