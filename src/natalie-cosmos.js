import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const root = document.querySelector("#app");
const response = await fetch("/worlds/natalie-world.json", {cache:"no-store"});
const blueprint = await response.json();
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

root.innerHTML = `<main class="natalie-cosmos">
  <div class="nc-bg"></div><canvas class="nc-stars"></canvas><div class="nc-veil"></div>
  <button class="nc-back">← Sam’s Dreamscape</button>
  <header class="nc-head"><div class="nc-kicker">Dreamscape · corpus prototype</div><h1>${blueprint.title}</h1><p>Six worlds, one provisional exemplar universe.</p></header>
  <div class="nc-badge">Prototype corpus sample · final counts pending</div>
  <div class="nc-stage"><canvas id="natalie-gl"></canvas><div class="nc-labels"></div></div>
  <div class="nc-help">Move through the cosmos · hover a world · click to reveal its Tarot constellation</div>
  <div class="nc-tooltip"></div>
  <section class="nc-focus"><div class="nc-tarots"></div><aside class="nc-focus-card"><button class="nc-close">×</button><div class="provisional">Prototype corpus sample · final count pending</div><h2></h2><p></p><button class="nc-enter">Enter World →</button></aside></section>
  <aside class="nc-reader"><button class="nc-close">×</button><div class="provisional">Dreamscape Tarot · illustrative prototype</div><h3></h3><div class="rule"></div><p></p></aside>
</main>`;

document.querySelector(".nc-back").addEventListener("click",()=>location.href="/");
const shell=document.querySelector(".natalie-cosmos"), canvas=document.querySelector("#natalie-gl"), labels=document.querySelector(".nc-labels"), tooltip=document.querySelector(".nc-tooltip"), focus=document.querySelector(".nc-focus"), tarots=document.querySelector(".nc-tarots"), reader=document.querySelector(".nc-reader");
const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,100);
camera.position.set(0,0,12);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2)); renderer.outputColorSpace=THREE.SRGBColorSpace;
scene.add(new THREE.AmbientLight(0x7883b6,1.25));
const key=new THREE.PointLight(0xffd59e,70,40); key.position.set(-7,6,10); scene.add(key);
const fill=new THREE.PointLight(0x768dff,35,30); fill.position.set(8,-5,8); scene.add(fill);

function seeded(id){let h=2166136261; for(const c of id){h^=c.charCodeAt(0);h=Math.imul(h,16777619)} return ()=>((h=Math.imul(h^h>>>15,1|h)+Math.imul(h^h>>>7,61|h)^h)>>>0)/4294967296}
function textureFor(w){
 const c=document.createElement("canvas"); c.width=768;c.height=384; const x=c.getContext("2d"), r=seeded(w.id);
 const g=x.createLinearGradient(0,0,768,384); g.addColorStop(0,w.palette[0]); g.addColorStop(.38,w.palette[1]); g.addColorStop(.7,w.palette[2]); g.addColorStop(1,w.palette[3]); x.fillStyle=g;x.fillRect(0,0,768,384);
 for(let i=0;i<90;i++){const px=r()*768,py=r()*384,rr=8+r()*70;x.fillStyle=`rgba(${120+Math.floor(r()*120)},${120+Math.floor(r()*120)},${120+Math.floor(r()*120)},${.025+r()*.10})`;x.beginPath();x.ellipse(px,py,rr,rr*(.25+r()*.55),r()*Math.PI,0,Math.PI*2);x.fill()}
 x.globalCompositeOperation="screen"; x.strokeStyle="rgba(240,225,185,.16)";x.lineWidth=2;
 if(w.surfacePreset==="roads"){for(let k=0;k<8;k++){x.beginPath();let y=30+r()*320;x.moveTo(0,y);for(let i=1;i<8;i++)x.lineTo(i*110,y+=(r()-.5)*55);x.stroke()}}
 if(w.surfacePreset==="water"){for(let k=0;k<18;k++){x.beginPath();let y=r()*384;x.moveTo(0,y);for(let i=1;i<12;i++)x.lineTo(i*70,y+=Math.sin(i+r()*4)*8);x.stroke()}}
 if(w.surfacePreset==="luminous"){for(let k=0;k<12;k++){x.fillStyle="rgba(255,244,205,.12)";x.beginPath();x.arc(r()*768,r()*190,10+r()*80,0,Math.PI*2);x.fill()}}
 if(w.surfacePreset==="message"){x.font="18px Georgia";x.fillStyle="rgba(255,244,210,.18)";["LOVE","KNOW","LIVE","EARTH","SEE"].forEach((m,i)=>x.fillText(m,70+i*130,80+(i%2)*120))}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
}
const layout=[[-4.4,1.8],[0,2.4],[4.25,1.25],[-3.7,-2.2],[.3,-1.9],[4.2,-2.6]];
const minW=Math.min(...blueprint.worlds.map(w=>w.visualWeight)), maxW=Math.max(...blueprint.worlds.map(w=>w.visualWeight));
const planets=[];
blueprint.worlds.forEach((w,i)=>{
 const radius=.72+((Math.sqrt(w.visualWeight)-Math.sqrt(minW))/(Math.sqrt(maxW)-Math.sqrt(minW)))*.55;
 const group=new THREE.Group();group.position.set(layout[i][0],layout[i][1],0);
 const mat=new THREE.MeshStandardMaterial({map:textureFor(w),roughness:.82,metalness:.02,emissive:new THREE.Color(w.palette[0]),emissiveIntensity:.12});
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,96,72),mat); mesh.rotation.z=(i-2)*.11;group.add(mesh);
 const atm=new THREE.Mesh(new THREE.SphereGeometry(radius*1.045,64,48),new THREE.MeshBasicMaterial({color:w.palette[1],transparent:true,opacity:.055,side:THREE.BackSide}));group.add(atm);
 if(w.surfacePreset==="otherworldly"){for(let k=0;k<6;k++){const frag=new THREE.Mesh(new THREE.IcosahedronGeometry(.09+rnd(i,k)*.09,0),new THREE.MeshStandardMaterial({color:w.palette[(k+1)%4],roughness:.7})); const a=k/6*Math.PI*2;frag.position.set(Math.cos(a)*radius*1.65,Math.sin(a*.8)*radius*.7,Math.sin(a)*radius*.45);group.add(frag)}}
 scene.add(group);
 const label=document.createElement("button");label.className="nc-label";label.innerHTML=`<b>${w.label}</b><small>provisional world</small>`;labels.appendChild(label);
 planets.push({w,group,mesh,atm,radius,label,base:new THREE.Vector3(...group.position.toArray()),phase:i*.8});
});
function rnd(a,b){return ((Math.sin((a+1)*92.13+(b+1)*17.71)*43758.5453)%1+1)%1}
const ray=new THREE.Raycaster(), pointer=new THREE.Vector2(); let hovered=null,selected=null,mouse={x:0,y:0},last=performance.now();
function screenPos(v){const p=v.clone().project(camera);return{x:(p.x*.5+.5)*innerWidth,y:(-.5*p.y+.5)*innerHeight}}
function hitAt(e){const r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(planets.map(p=>p.mesh),false);return hits[0]?planets.find(p=>p.mesh===hits[0].object):null}
canvas.addEventListener("pointermove",e=>{mouse.x=(e.clientX/innerWidth-.5)*2;mouse.y=(e.clientY/innerHeight-.5)*2;const h=hitAt(e);if(h!==hovered){hovered=h;planets.forEach(p=>p.label.classList.toggle("active",p===h))}if(h){tooltip.innerHTML=`<b>${h.w.label}</b><em>${h.w.summary}</em><span>Prototype corpus sample — final count pending</span>`;tooltip.style.left=Math.min(innerWidth-330,e.clientX+18)+"px";tooltip.style.top=Math.min(innerHeight-130,e.clientY+18)+"px";tooltip.classList.add("show")}else tooltip.classList.remove("show")});
canvas.addEventListener("click",e=>{const h=hitAt(e);if(h)openWorld(h)});
planets.forEach(p=>p.label.addEventListener("click",()=>openWorld(p)));
function openWorld(p){selected=p;focus.classList.add("open");focus.querySelector("h2").textContent=p.w.label;focus.querySelector(".nc-focus-card p").textContent=p.w.summary+". "+p.w.motifs.join(" · ")+".";
 tarots.innerHTML="";p.w.tarotCandidates.forEach((name,i)=>{const b=document.createElement("button");b.className="nc-tarot";b.style.setProperty("--r",((i%2?1:-1)*(2+i%3))+"deg");b.style.setProperty("--d",(i*.07)+"s");b.innerHTML=`<div><i>✦</i><b>${name}</b><small>${p.w.label}</small></div>`;b.addEventListener("click",()=>openTarot(name,p.w));tarots.appendChild(b)})}
function closeWorld(){focus.classList.remove("open");selected=null;reader.classList.remove("open")}
focus.querySelector(".nc-close").addEventListener("click",closeWorld);
focus.addEventListener("click",e=>{if(e.target===focus)closeWorld()});
focus.querySelector(".nc-enter").addEventListener("click",()=>{if(!selected)return;const btn=focus.querySelector(".nc-enter");btn.textContent="Flat-map descent will connect here →";setTimeout(()=>btn.textContent="Enter World →",1800)});
function openTarot(name,w){reader.querySelector("h3").textContent=name;reader.querySelector("p").textContent=`A provisional ${w.label} Tarot drawn from the exemplar motif set. When Natalie’s full corpus is processed, this card will open the existing evidence-led Tarot architecture with recurrence, source dreams, associations and interpretation layers.`;reader.classList.add("open")}
reader.querySelector(".nc-close").addEventListener("click",()=>reader.classList.remove("open"));

const starCanvas=document.querySelector(".nc-stars"),sx=starCanvas.getContext("2d");let stars=[];
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();const d=Math.min(devicePixelRatio||1,2);starCanvas.width=innerWidth*d;starCanvas.height=innerHeight*d;starCanvas.style.width=innerWidth+"px";starCanvas.style.height=innerHeight+"px";sx.setTransform(d,0,0,d,0,0);stars=Array.from({length:Math.min(520,Math.max(220,innerWidth*innerHeight/5000))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:.2+Math.random()*1.3,a:.12+Math.random()*.65,p:Math.random()*6.28}))}
addEventListener("resize",resize);resize();
function animate(t){const dt=Math.min(.05,(t-last)/1000);last=t;sx.clearRect(0,0,innerWidth,innerHeight);stars.forEach(s=>{const a=s.a*(.72+.28*Math.sin(t*.0008+s.p));sx.fillStyle=`rgba(255,244,222,${a})`;sx.beginPath();sx.arc(s.x+mouse.x*4,s.y+mouse.y*3,s.r,0,6.28);sx.fill()});
 planets.forEach((p,i)=>{const isH=hovered===p,isS=selected===p;const targetScale=isS?1.7:isH?1.08:1;p.group.scale.lerp(new THREE.Vector3(targetScale,targetScale,targetScale),Math.min(1,dt*3.2));p.mesh.rotation.y+=reduced?0:p.w.rotationSpeed*(isH?.35:1)*16.67;p.atm.rotation.y-=p.w.rotationSpeed*4; if(!selected){p.group.position.x=p.base.x+Math.sin(t*.00009+p.phase)*.12;p.group.position.y=p.base.y+Math.cos(t*.000075+p.phase)*.08;p.group.position.z=0}else{const target=p===selected?new THREE.Vector3(-1.4,0,2):new THREE.Vector3(p.base.x*1.12,p.base.y*1.08,-2.2);p.group.position.lerp(target,Math.min(1,dt*1.7))}const pos=screenPos(p.group.position.clone());p.label.style.left=pos.x+"px";p.label.style.top=(pos.y+p.radius*56)+"px";p.label.style.opacity=selected&&p!==selected?".16":"1"});
 camera.position.x+=(mouse.x*.18-camera.position.x)*dt*.8;camera.position.y+=(-mouse.y*.12-camera.position.y)*dt*.8;camera.lookAt(0,0,0);renderer.render(scene,camera);requestAnimationFrame(animate)}
requestAnimationFrame(animate);