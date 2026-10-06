
const root = document.querySelector("#app");
const blueprint = await (await fetch("/worlds/natalie-world.json", {cache:"no-store"})).json();
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const FIRE_API="https://api.firestorage.ai/dev/file";
const SHARE_ID="n6Ifd8vxttgh";
const fileNames={
  poster:"natalie_s_dreamscape_cosmic_atlas.png",
  luminous:"a_wide_panoramic_fantasy_sci_fi_landscape_scene.png",
  "direct-message":"a_wide_panoramic_fantasy_landscape_scene_ultra_de.png",
  otherworldly:"a_wide_panoramic_high_detail_fantasy_landscape_s.png",
  threshold:"ultra_wide_fantasy_landscape_panorama_a_richly_de.png",
  integration:"ultra_wide_panoramic_fantasy_landscape_illustratio.png"
};
const layout={
  luminous:{x:17.7,y:27.2,size:31.5},
  "direct-message":{x:50,y:29,size:28},
  otherworldly:{x:82.3,y:27.5,size:28.5},
  threshold:{x:18.2,y:65,size:29},
  integration:{x:50,y:66.1,size:30.5},
  shadow:{x:82,y:66.1,size:29}
};
const markerLayouts={
  luminous:[[17,32],[33,60],[51,39],[67,67],[78,31],[86,53]],
  "direct-message":[[18,58],[32,31],[48,69],[62,38],[76,61],[84,27]],
  otherworldly:[[17,35],[31,66],[47,28],[62,59],[77,38],[86,68]],
  threshold:[[15,62],[29,34],[45,71],[59,42],[75,62],[84,29]],
  integration:[[18,35],[31,65],[47,28],[62,58],[76,37],[85,70]],
  shadow:[[18,63],[31,34],[46,72],[61,41],[76,64],[86,29]]
};
const glyphs={Train:"⌁",Bridge:"⌒",Bus:"◇",Road:"↝",Motorhome:"⌂",Home:"⌂",Bee:"✣",Water:"≋",Spa:"◌",Cleansing:"✧",Dance:"⌁",Body:"◯",Tower:"♜",Labyrinth:"⌘",Passage:"⋄",Smoke:"〰",Ruins:"⌑",Escape:"↗",Portal:"◉","Floating Land":"◒","Strange Structure":"⌬","Double Dream":"◐",Sky:"☾",Fragment:"◆",Mountain:"△",Moon:"☽",Aurora:"⌇",Alignment:"✶","Golden Cloud":"☁",Ray:"✦",Message:"✧",Temple:"⌂",Library:"▤",Inscription:"≡",Path:"⌁",Knowing:"◉"};

function esc(v){return String(v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]})}

async function resolveAssets(){
  const r=await fetch(FIRE_API+"/shares/"+SHARE_ID+"/files?maxResults=1000",{cache:"no-store"});
  if(!r.ok) throw new Error("asset list unavailable");
  const data=await r.json(), byName=new Map((data.files||[]).map(function(f){return [f.fileName,f]})), out={};
  for(const entry of Object.entries(fileNames)){
    const key=entry[0], file=byName.get(entry[1]);
    if(!file){out[key]=null;continue}
    const dl=await fetch(FIRE_API+"/shares/"+SHARE_ID+"/files/"+file.fileId+"/download",{method:"POST",cache:"no-store"});
    if(!dl.ok){out[key]=null;continue}
    out[key]=(await dl.json()).downloadUrl||null;
  }
  return out;
}

function motion(id){
  if(id==="luminous") return '<i class="wisp w1"></i><i class="wisp w2"></i><i class="aurora a1"></i><i class="aurora a2"></i><i class="glint g1"></i><i class="glint g2"></i><i class="spark s1"></i><i class="spark s2"></i><i class="spark s3"></i>';
  if(id==="direct-message") return '<i class="wisp w1"></i><i class="wisp w3"></i><i class="temple t1"></i><i class="temple t2"></i><i class="temple t3"></i><i class="pathlight p1"></i><i class="pathlight p2"></i>';
  if(id==="otherworldly") return '<i class="portal pr1"></i><i class="portal pr2"></i><i class="frag f1"></i><i class="frag f2"></i><i class="frag f3"></i><i class="frag f4"></i><i class="fall fs1"></i><i class="fall fs2"></i>';
  if(id==="threshold") return '<svg class="routes" viewBox="0 0 100 100"><path d="M4 73C20 48 27 62 40 46S64 41 78 29S91 24 98 16"/><path d="M7 83C25 70 36 82 49 68S71 65 92 52"/></svg><i class="wisp w2"></i><i class="station l1"></i><i class="station l2"></i><i class="station l3"></i>';
  if(id==="integration") return '<i class="sheen sh1"></i><i class="sheen sh2"></i><i class="heal-fall h1"></i><i class="heal-fall h2"></i><i class="heal-fall h3"></i><i class="honey hg1"></i><i class="honey hg2"></i><i class="bee b1">✦</i><i class="bee b2">✦</i><i class="bee b3">✦</i>';
  return '<i class="smoke sm1"></i><i class="smoke sm2"></i><i class="ember e1"></i><i class="ember e2"></i><i class="ember e3"></i><i class="ember e4"></i><i class="escape ex1"></i>';
}

root.innerHTML='<main class="living-cosmos" data-state="home">  <div class="stage-wrap"><div class="living-stage">    <img class="master-art" alt="Natalie’s Dreamscape: six illustrated dream worlds in a living cosmos">    <canvas class="stars" aria-hidden="true"></canvas>    <div class="neb n1"></div><div class="neb n2"></div><div class="neb n3"></div>    <div class="world-layer"></div>    <button class="poster-enter" aria-label="Enter Natalie’s Dreamscape"></button>    <div class="dimmer"></div>  </div></div>  <aside class="world-focus">    <button class="focus-close" aria-label="Close">×</button>    <div class="provisional">Prototype corpus sample · final counts pending</div>    <h2></h2><p class="focus-summary"></p><p class="focus-atmosphere"></p>    <div class="tarot-strip"></div>    <button class="enter-world">Enter World <span>→</span></button>  </aside>  <section class="flatmap">    <img class="flatmap-art" alt=""><div class="flatmap-crop"></div>    <div class="mist m1"></div><div class="mist m2"></div><canvas class="motes"></canvas>    <header class="mapbar"><button class="map-back">← Cosmos</button><div><small>ENTERED WORLD</small><b></b><em>provisional illustrated map layer</em></div><button class="map-tarot">Tarot ✦</button></header>    <div class="markers"></div><div class="map-caption"><span></span><p></p></div>  </section>  <aside class="tarot-reader"><button class="reader-close">×</button><div class="ornament">☾ ✦ ☽</div><div class="reader-kicker">DREAMSCAPE TAROT · PROVISIONAL SYMBOL</div><div class="reader-glyph"></div><h3></h3><div class="reader-rule"></div><p class="reader-copy"></p><div class="reader-note">The interaction is real. Corpus recurrence, source dreams, chronology and evidence-led interpretations will replace this provisional copy when Natalie’s complete corpus is processed.</div></aside>  <div class="toast" role="status"></div></main>';

const shell=document.querySelector(".living-cosmos"),stage=document.querySelector(".living-stage"),poster=document.querySelector(".master-art"),layer=document.querySelector(".world-layer"),focus=document.querySelector(".world-focus"),tarotStrip=document.querySelector(".tarot-strip"),flatmap=document.querySelector(".flatmap"),flatmapArt=document.querySelector(".flatmap-art"),flatmapCrop=document.querySelector(".flatmap-crop"),markers=document.querySelector(".markers"),reader=document.querySelector(".tarot-reader"),toast=document.querySelector(".toast"),starCanvas=document.querySelector(".stars"),starCtx=starCanvas.getContext("2d"),moteCanvas=document.querySelector(".motes"),moteCtx=moteCanvas.getContext("2d");
let assets={poster:"/assets/worlds/natalie/living-cosmos-poster.webp",threshold:"/assets/worlds/natalie/threshold.svg",integration:"/assets/worlds/natalie/integration.svg",shadow:"/assets/worlds/natalie/shadow.svg","direct-message":"/assets/worlds/natalie/direct-message.svg"},selected=null,stars=[],motes=[],mouse={x:0,y:0},timer=0;
const worldsById=Object.fromEntries(blueprint.worlds.map(function(w){return [w.id,w]}));

function showToast(msg){toast.textContent=msg;toast.classList.add("show");clearTimeout(showToast.t);showToast.t=setTimeout(function(){toast.classList.remove("show")},2200)}

function buildHotspots(){
  blueprint.worlds.forEach(function(w){
    const pos=layout[w.id],b=document.createElement("button");
    b.className="world-hotspot world-"+w.id;b.dataset.world=w.id;b.style.left=pos.x+"%";b.style.top=pos.y+"%";b.style.width=pos.size+"%";b.style.setProperty("--accent",w.artSpec.emissive||"#e5c17d");b.setAttribute("aria-label",w.label+": "+w.summary);
    b.innerHTML='<span class="halo"></span><span class="motion">'+motion(w.id)+'</span><span class="whisper"><b>'+esc(w.label)+'</b><em>'+esc(w.summary)+'</em><small>Click to enter the constellation</small></span>';
    b.addEventListener("click",function(e){e.stopPropagation();selectWorld(w.id)});layer.appendChild(b);
  });
}

function tarotCard(name,w){
  const b=document.createElement("button");b.className="mini-tarot";b.innerHTML="<i>"+(glyphs[name]||"✦")+"</i><b>"+esc(name)+"</b><small>"+esc(w.label)+"</small>";b.addEventListener("click",function(e){e.stopPropagation();openTarot(name,w)});return b;
}

function selectWorld(id){
  const w=worldsById[id];if(!w)return;selected=w;const pos=layout[id];
  shell.style.setProperty("--focus-x",pos.x+"%");shell.style.setProperty("--focus-y",pos.y+"%");stage.style.transformOrigin=pos.x+"% "+pos.y+"%";shell.dataset.state="focus";
  layer.querySelectorAll(".world-hotspot").forEach(function(el){el.classList.toggle("selected",el.dataset.world===id)});
  focus.querySelector("h2").textContent=w.label;focus.querySelector(".focus-summary").textContent=w.summary;focus.querySelector(".focus-atmosphere").textContent=w.artSpec.terrainCharacter+". "+w.artSpec.atmosphere+".";
  tarotStrip.innerHTML="";w.tarotCandidates.forEach(function(n){tarotStrip.appendChild(tarotCard(n,w))});
  clearTimeout(timer);timer=setTimeout(function(){focus.classList.add("ready")},reduced?0:380);
}
function closeFocus(){clearTimeout(timer);focus.classList.remove("ready");shell.dataset.state="home";selected=null;layer.querySelectorAll(".world-hotspot").forEach(function(el){el.classList.remove("selected")})}
function openTarot(name,w){reader.querySelector(".reader-glyph").textContent=glyphs[name]||"✦";reader.querySelector("h3").textContent=name;reader.querySelector(".reader-copy").textContent=name+" is currently an illustrative Tarot candidate inside Natalie’s "+w.label+" world. The finished card will show where it recurs, the dreams it comes from, its associations through time, and carefully separated corpus evidence and interpretive possibilities.";reader.classList.add("open")}
function closeTarot(){reader.classList.remove("open")}
function enterWorld(){if(!selected)return;const w=selected;shell.dataset.state="descending";setTimeout(function(){openFlatmap(w)},reduced?30:900)}
function openFlatmap(w){
  shell.dataset.state="flatmap";flatmap.classList.add("open");flatmap.dataset.world=w.id;flatmap.querySelector(".mapbar b").textContent=w.label;flatmap.querySelector(".map-caption span").textContent=w.label;flatmap.querySelector(".map-caption p").textContent=w.summary;flatmapArt.classList.remove("visible");flatmapCrop.classList.remove("visible");
  const url=assets[w.id];if(url){flatmapArt.src=url;flatmapArt.alt=w.label+" provisional illustrated flat map";flatmapArt.classList.add("visible")}else{flatmapCrop.style.backgroundImage='url("'+assets.poster+'")';flatmapCrop.style.setProperty("--crop-x",layout[w.id].x+"%");flatmapCrop.style.setProperty("--crop-y",layout[w.id].y+"%");flatmapCrop.classList.add("visible")}
  markers.innerHTML="";const coords=markerLayouts[w.id]||markerLayouts.luminous;w.tarotCandidates.forEach(function(name,i){const m=document.createElement("button");m.className="symbol-marker";m.style.left=coords[i][0]+"%";m.style.top=coords[i][1]+"%";m.style.setProperty("--delay",(i*.12)+"s");m.innerHTML="<i>"+(glyphs[name]||"✦")+"</i><b>"+esc(name)+"</b><small>Tarot</small>";m.addEventListener("click",function(){openTarot(name,w)});markers.appendChild(m)});seedMotes(w.id);
}
function closeFlatmap(){reader.classList.remove("open");flatmap.classList.remove("open");shell.dataset.state="home";selected=null;layer.querySelectorAll(".world-hotspot").forEach(function(el){el.classList.remove("selected")})}

document.querySelector(".focus-close").addEventListener("click",closeFocus);document.querySelector(".enter-world").addEventListener("click",enterWorld);document.querySelector(".map-back").addEventListener("click",closeFlatmap);document.querySelector(".reader-close").addEventListener("click",closeTarot);document.querySelector(".map-tarot").addEventListener("click",function(){if(selected)openTarot(selected.tarotCandidates[0],selected)});
document.querySelector(".poster-enter").addEventListener("click",function(){layer.querySelectorAll(".world-hotspot").forEach(function(el,i){setTimeout(function(){el.classList.add("invited")},i*80);setTimeout(function(){el.classList.remove("invited")},1500+i*80)});showToast("Choose one of Natalie’s six dream territories.")});
shell.addEventListener("pointermove",function(e){mouse.x=e.clientX/innerWidth-.5;mouse.y=e.clientY/innerHeight-.5});

function resize(){
  const d=Math.min(devicePixelRatio||1,2),r=stage.getBoundingClientRect();starCanvas.width=Math.max(1,Math.round(r.width*d));starCanvas.height=Math.max(1,Math.round(r.height*d));starCanvas.style.width=r.width+"px";starCanvas.style.height=r.height+"px";starCtx.setTransform(d,0,0,d,0,0);
  stars=Array.from({length:Math.max(180,Math.round(r.width*r.height/6500))},function(){return{x:Math.random()*r.width,y:Math.random()*r.height,r:.35+Math.random()*1.35,a:.08+Math.random()*.58,p:Math.random()*Math.PI*2,z:.2+Math.random()}});
  moteCanvas.width=Math.max(1,Math.round(innerWidth*d));moteCanvas.height=Math.max(1,Math.round(innerHeight*d));moteCanvas.style.width=innerWidth+"px";moteCanvas.style.height=innerHeight+"px";moteCtx.setTransform(d,0,0,d,0,0);
}
addEventListener("resize",resize);
function seedMotes(id){const tones={luminous:[205,235,255],"direct-message":[244,205,130],otherworldly:[180,125,245],threshold:[236,184,105],integration:[175,235,198],shadow:[230,125,85]},rgb=tones[id]||tones.luminous;motes=Array.from({length:52},function(){return{x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:.5+Math.random()*1.8,a:.08+Math.random()*.36,s:.15+Math.random()*.55,p:Math.random()*Math.PI*2,rgb:rgb}})}
function draw(t){
  const r=stage.getBoundingClientRect();starCtx.clearRect(0,0,r.width,r.height);if(!reduced)stars.forEach(function(s){const pulse=.62+(Math.sin(t*.00075+s.p)+1)*.19,x=s.x+mouse.x*8*s.z,y=s.y+mouse.y*5*s.z;starCtx.fillStyle="rgba(255,244,214,"+(s.a*pulse)+")";starCtx.beginPath();starCtx.arc(x,y,s.r*pulse,0,Math.PI*2);starCtx.fill()});
  moteCtx.clearRect(0,0,innerWidth,innerHeight);if(shell.dataset.state==="flatmap"&&!reduced)motes.forEach(function(m){m.y-=m.s*.22;m.x+=Math.sin(t*.00035+m.p)*.08;if(m.y<-10){m.y=innerHeight+10;m.x=Math.random()*innerWidth}const c=m.rgb;moteCtx.fillStyle="rgba("+c[0]+","+c[1]+","+c[2]+","+m.a+")";moteCtx.beginPath();moteCtx.arc(m.x,m.y,m.r,0,Math.PI*2);moteCtx.fill()});requestAnimationFrame(draw);
}

async function boot(){buildHotspots();resize();requestAnimationFrame(draw);poster.src=assets.poster;poster.addEventListener("load",function(){shell.classList.add("art-ready")},{once:true});poster.addEventListener("error",function(){shell.classList.add("asset-error");showToast("The experiment artwork could not be loaded. Refresh once.")},{once:true})}
boot();
