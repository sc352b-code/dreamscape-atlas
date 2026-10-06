const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const root=document.querySelector("#app");
const worldData=[
{id:"luminous",label:"Luminous / Numinous",summary:"Awe, revelation and sacred beauty",tarot:["Mountain","Moon","Aurora","Alignment","Golden Cloud","Ray"],pos:[17.7,27.2,31.5],map:"luminous"},
{id:"direct-message",label:"Direct Message",summary:"Clarity, guidance and knowing",tarot:["Message","Temple","Library","Inscription","Path","Knowing"],pos:[50,29,28],map:"direct-message"},
{id:"otherworldly",label:"Otherworldly",summary:"Impossible reality and strange wonder",tarot:["Portal","Floating Land","Strange Structure","Double Dream","Sky","Fragment"],pos:[82.3,27.5,28.5],map:"otherworldly"},
{id:"threshold",label:"Threshold",summary:"Journeys, crossings and states of transition",tarot:["Train","Bridge","Bus","Road","Motorhome","Home"],pos:[18.2,65,29],map:"threshold"},
{id:"integration",label:"Integration / Healing",summary:"Restoration, renewal and embodied wholeness",tarot:["Bee","Water","Spa","Cleansing","Dance","Body"],pos:[50,66.1,30.5],map:"integration"},
{id:"shadow",label:"Shadow",summary:"Confinement, intensity and the possibility of emergence",tarot:["Tower","Labyrinth","Passage","Smoke","Ruins","Escape"],pos:[82,66.1,29],map:null}
];
const glyph={Train:"⌁",Bridge:"⌒",Bus:"◇",Road:"↝",Motorhome:"⌂",Home:"⌂",Bee:"✣",Water:"≋",Spa:"◌",Cleansing:"✧",Dance:"⌁",Body:"◯",Tower:"♜",Labyrinth:"⌘",Passage:"⋄",Smoke:"〰",Ruins:"⌑",Escape:"↗",Portal:"◉","Floating Land":"◒","Strange Structure":"⌬","Double Dream":"◐",Sky:"☾",Fragment:"◆",Mountain:"△",Moon:"☽",Aurora:"⌇",Alignment:"✶","Golden Cloud":"☁",Ray:"✦",Message:"✧",Temple:"⌂",Library:"▤",Inscription:"≡",Path:"⌁",Knowing:"◉"};
const markerPts=[[18,32],[34,60],[49,40],[63,68],[77,35],[85,58]];
root.innerHTML=`
<main class="cosmos" data-state="home">
 <div class="viewport"><div class="stage">
  <img id="art" alt="Natalie’s Dreamscape"/>
  <canvas id="fx"></canvas><div class="depth-glow"></div><canvas id="life"></canvas>
  <div class="hotspots"></div><div class="dimmer"></div>
 </div></div>
 <aside class="panel"><button class="close">×</button><small>Prototype corpus sample · final counts pending</small><h2></h2><p></p><div class="cards"></div><button class="enter">Enter this world <span>→</span></button></aside>
 <section class="flat"><img alt=""><div class="mapfx"></div><header class="mapbar"><button class="back">← Cosmos</button><b></b><button class="tarot">Tarot ✦</button></header><div class="markers"></div></section>
 <aside class="reader"><button class="close">×</button><div class="glyph"></div><h3></h3><p></p></aside>
</main>`;
const shell=document.querySelector(".cosmos"),stage=document.querySelector(".stage"),art=document.querySelector("#art"),integrationMotion=document.querySelector("#integrationMotion"),fx=document.querySelector("#fx"),life=document.querySelector("#life"),hotspots=document.querySelector(".hotspots"),panel=document.querySelector(".panel"),cards=document.querySelector(".cards"),flat=document.querySelector(".flat"),flatImg=flat.querySelector("img"),markers=document.querySelector(".markers"),reader=document.querySelector(".reader");
let selected=null,focusIndex=-1,masterObjectUrl=null,mapObjectUrls={},last=performance.now(),stars=[],dust=[],birds=[],shooting=null,shootingAt=performance.now()+12000;
const lctx=life.getContext("2d");

for(const w of worldData){
 const [x,y,s]=w.pos,b=document.createElement("button");
 b.className="world";b.dataset.id=w.id;b.style.left=x+"%";b.style.top=y+"%";b.style.width=s+"%";
 b.innerHTML='<span class="hint"><b>'+w.label+'</b><em>'+w.summary+'</em></span>';
 b.addEventListener("click",()=>selectWorld(w));
 hotspots.appendChild(b);
}

function selectWorld(w){
 selected=w;focusIndex=worldData.indexOf(w);const [x,y]=w.pos;
 shell.style.setProperty("--fx",x+"%");shell.style.setProperty("--fy",y+"%");stage.style.transformOrigin=x+"% "+y+"%";
 shell.dataset.state="focus";shell.dataset.selected=w.id;hotspots.querySelectorAll(".world").forEach(el=>el.classList.toggle("selected",el.dataset.id===w.id));
 panel.querySelector("h2").textContent=w.label;panel.querySelector("p").textContent=w.summary;cards.innerHTML="";
 w.tarot.forEach(n=>{const b=document.createElement("button");b.className="card";b.innerHTML="<i>"+(glyph[n]||"✦")+"</i><b>"+n+"</b>";b.onclick=e=>{e.stopPropagation();openTarot(n,w)};cards.appendChild(b)});
 setTimeout(()=>panel.classList.add("open"),150);
}
function closeFocus(){panel.classList.remove("open");shell.dataset.state="home";delete shell.dataset.selected;selected=null;focusIndex=-1;hotspots.querySelectorAll(".world").forEach(el=>el.classList.remove("selected"))}
panel.querySelector(".close").onclick=closeFocus;
panel.querySelector(".enter").onclick=async()=>{if(!selected)return;shell.dataset.state="descending";await new Promise(r=>setTimeout(r,reduced?20:950));await openMap(selected)};
function openTarot(name,w){reader.querySelector(".glyph").textContent=glyph[name]||"✦";reader.querySelector("h3").textContent=name;reader.querySelector("p").textContent=name+" is a provisional Tarot symbol within Natalie’s "+w.label+" world. The final corpus build will attach source dreams, recurrence, chronology and evidence-led interpretation.";reader.classList.add("open")}
reader.querySelector(".close").onclick=()=>reader.classList.remove("open");
flat.querySelector(".back").onclick=()=>{flat.classList.remove("open");reader.classList.remove("open");shell.dataset.state="home";delete shell.dataset.selected;selected=null;focusIndex=-1};
flat.querySelector(".tarot").onclick=()=>selected&&openTarot(selected.tarot[0],selected);

async function fetchImageBlob(key){
  let lastError;
  for(let attempt=0;attempt<4;attempt++){
    try{
      const url="/api/natalie-asset?key="+encodeURIComponent(key)+"&v=4&a="+attempt;
      const r=await fetch(url,{cache:attempt===0?"force-cache":"no-store"});
      if(!r.ok) throw Error("asset "+key+" returned "+r.status);
      const blob=await r.blob();
      if(blob.size<1000) throw Error("asset "+key+" was empty");
      return blob;
    }catch(err){
      lastError=err;
      await new Promise(resolve=>setTimeout(resolve,350*(attempt+1)));
    }
  }
  throw lastError||Error("asset "+key);
}
async function openMap(w){
 let url;
 if(w.map){
   if(!mapObjectUrls[w.map])mapObjectUrls[w.map]=URL.createObjectURL(await fetchImageBlob(w.map));
   url=mapObjectUrls[w.map];flatImg.style.objectPosition="center center";
 }else{
   url=masterObjectUrl;flatImg.style.objectPosition=w.pos[0]+"% "+w.pos[1]+"%";
 }
 flatImg.src=url;flat.querySelector(".mapbar b").textContent=w.label;markers.innerHTML="";
 w.tarot.forEach((n,i)=>{const m=document.createElement("button");m.className="marker";m.style.left=markerPts[i][0]+"%";m.style.top=markerPts[i][1]+"%";m.innerHTML="<i>"+(glyph[n]||"✦")+"</i>"+n;m.onclick=()=>openTarot(n,w);markers.appendChild(m)});
 flat.classList.add("open");shell.dataset.state="flat";
}

function initWebGL(img){
 const gl=fx.getContext("webgl2",{alpha:true,premultipliedAlpha:false});
 if(!gl)return null;
 const vs=`#version 300 es
 in vec2 aPos; out vec2 vUv;
 void main(){vUv=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}`;
 const fs=`#version 300 es
 precision highp float; uniform sampler2D uTex; uniform float uTime; uniform vec2 uPointer; uniform float uFocus; in vec2 vUv; out vec4 outColor;
 float ellipse(vec2 p,vec2 c,vec2 r,float soft){float d=length((p-c)/r);return 1.-smoothstep(1.-soft,1.,d);}
 float world(vec2 p,int i){vec2 c[6]=vec2[6](vec2(.177,.272),vec2(.50,.29),vec2(.823,.275),vec2(.182,.65),vec2(.50,.661),vec2(.82,.661));float rr[6]=float[6](.157,.14,.143,.145,.153,.145);return 1.-smoothstep(rr[i]-.012,rr[i],distance(p,c[i]));}
 vec4 sampleShift(vec2 uv,vec2 shift){return texture(uTex,clamp(uv+shift,vec2(.001),vec2(.999)));}
 void main(){
   vec2 p=vec2(vUv.x,1.-vUv.y); vec4 base=texture(uTex,vUv); vec4 c=vec4(0.); float a=0.;
   float t=uTime;
   // cloud drift: sampled from the same painting, confined to cloud-heavy zones
   float cloud=ellipse(p,vec2(.18,.29),vec2(.145,.075),.32)+ellipse(p,vec2(.50,.30),vec2(.13,.07),.3)+ellipse(p,vec2(.82,.29),vec2(.135,.075),.3)+ellipse(p,vec2(.18,.64),vec2(.135,.07),.3)+ellipse(p,vec2(.50,.64),vec2(.145,.075),.3)+ellipse(p,vec2(.82,.63),vec2(.135,.07),.3);
   cloud=clamp(cloud,0.,1.); vec2 cloudShift=vec2(sin(t*.055)*.0024,cos(t*.041)*.0012);
   vec4 cloudTex=sampleShift(vUv,vec2(cloudShift.x,-cloudShift.y));
   c+=cloudTex*(cloud*.18); a+=cloud*.18;
   // water and waterfall flow
   float water=ellipse(p,vec2(.205,.34),vec2(.10,.05),.28)+ellipse(p,vec2(.50,.36),vec2(.09,.045),.28)+ellipse(p,vec2(.175,.73),vec2(.105,.055),.28);
   water=clamp(water,0.,1.);
   vec2 flow=vec2(sin((p.y*85.)+t*.55)*.0014,cos((p.x*74.)+t*.42)*.0012);
   vec4 waterTex=sampleShift(vUv,vec2(flow.x,-flow.y)); c+=waterTex*(water*.28); a+=water*.28;
   float fall=ellipse(p,vec2(.817,.37),vec2(.045,.105),.35)+ellipse(p,vec2(.17,.68),vec2(.035,.09),.35);
   fall=clamp(fall,0.,1.); vec2 fsh=vec2(sin(t*.9+p.y*90.)*.0008,-fract(t*.035)*.006);
   c+=sampleShift(vUv,fsh)*(fall*.22); a+=fall*.22;
   // auroral colour breathing on luminous
   float aur=ellipse(p,vec2(.17,.13),vec2(.14,.09),.4)*world(p,0); float pulse=.5+.5*sin(t*.12);
   c.rgb+=vec3(.10,.20,.24)*aur*(.10+.08*pulse); a+=aur*.06;
   // direct-message temple glow
   float direct=ellipse(p,vec2(.505,.25),vec2(.10,.10),.5)*world(p,1); c.rgb+=vec3(.28,.19,.06)*direct*(.035+.03*sin(t*.16));a+=direct*.04;
   // otherworldly portal breath
   float portal=ellipse(p,vec2(.84,.22),vec2(.028,.055),.28)*world(p,2);c.rgb+=vec3(.10,.16,.32)*portal*(.15+.09*sin(t*.25));a+=portal*.05;
   // shadow ember breathing
   float emb=(ellipse(p,vec2(.79,.70),vec2(.06,.05),.4)+ellipse(p,vec2(.85,.72),vec2(.05,.045),.4))*world(p,5);c.rgb+=vec3(.32,.08,.02)*emb*(.035+.035*sin(t*.42));a+=emb*.03;
   // selected world gets only a slight extra life lift
   if(uFocus>=0.){for(int i=0;i<6;i++){if(abs(uFocus-float(i))<.2){float m=world(p,i);c.rgb+=base.rgb*m*.045;a+=m*.025;}}}
   outColor=vec4(c.rgb,clamp(a,0.,.34));
 }`;
 const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 const prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);
 const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const loc=gl.getAttribLocation(prog,"aPos");gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
 return {gl,prog,uTime:gl.getUniformLocation(prog,"uTime"),uPointer:gl.getUniformLocation(prog,"uPointer"),uFocus:gl.getUniformLocation(prog,"uFocus")};
}
let GL=null;
function resize(){const d=Math.min(devicePixelRatio||1,1.65),r=stage.getBoundingClientRect();for(const c of [fx,life]){c.width=Math.max(1,Math.round(r.width*d));c.height=Math.max(1,Math.round(r.height*d));c.style.width=r.width+"px";c.style.height=r.height+"px"}lctx.setTransform(d,0,0,d,0,0);if(GL){GL.gl.viewport(0,0,fx.width,fx.height)}seedLife(r)}
function seedLife(r){
 stars=Array.from({length:130},()=>{let x,y;do{x=Math.random();y=Math.random()}while(worldData.some(w=>{const dx=x-w.pos[0]/100,dy=y-w.pos[1]/100,rr=w.pos[2]/200;return dx*dx+dy*dy<rr*rr*.95}));return{x:x*r.width,y:y*r.height,r:.25+Math.random()*1.1,a:.08+Math.random()*.36,p:Math.random()*6.28}});
 dust=Array.from({length:28},()=>({x:Math.random()*r.width,y:Math.random()*r.height,r:.4+Math.random()*1.6,a:.04+Math.random()*.11,s:.03+Math.random()*.09,p:Math.random()*6.28}));
 birds=[
  {world:"luminous",period:28,phase:4,y:.235,amp:.012,count:5},
  {world:"threshold",period:33,phase:15,y:.64,amp:.015,count:6},
  {world:"integration",period:39,phase:8,y:.61,amp:.012,count:4}
 ];
}
function drawBird(x,y,s,a){lctx.save();lctx.translate(x,y);lctx.rotate(a);lctx.strokeStyle="rgba(17,20,28,.62)";lctx.lineWidth=Math.max(.7,s*.13);lctx.beginPath();lctx.moveTo(-s,0);lctx.quadraticCurveTo(-s*.45,-s*.65,0,0);lctx.quadraticCurveTo(s*.45,-s*.65,s,0);lctx.stroke();lctx.restore()}
function drawLife(t){
 const r=stage.getBoundingClientRect(),now=t/1000;lctx.clearRect(0,0,r.width,r.height);
 for(const s of stars){const q=.65+Math.sin(t*.0007+s.p)*.25;lctx.fillStyle="rgba(255,246,222,"+(s.a*q)+")";lctx.beginPath();lctx.arc(s.x,s.y,s.r*(.8+q*.25),0,6.283);lctx.fill()}
 for(const d of dust){d.x+=Math.sin(now*.05+d.p)*d.s;d.y-=d.s*.12;if(d.y<-5)d.y=r.height+5;lctx.fillStyle="rgba(236,218,192,"+d.a+")";lctx.beginPath();lctx.arc(d.x,d.y,d.r,0,6.283);lctx.fill()}
 for(const f of birds){const w=worldData.find(x=>x.id===f.world),u=((now+f.phase)%f.period)/f.period; if(u>.42)continue;const k=u/.42,baseX=(w.pos[0]/100-w.pos[2]/220)*r.width,span=w.pos[2]/85*r.width;for(let i=0;i<f.count;i++){const kk=k-i*.025;if(kk<0||kk>1)continue;const x=baseX+span*kk,y=(f.y+Math.sin((kk*5+i*.8))*f.amp)*r.height;drawBird(x,y,2.4+(i%3)*.55,Math.sin(kk*5)*.12)}}
 if(now>shootingAt/1000&&shooting===null){shooting={t:now,x:.07+Math.random()*.72,y:.06+Math.random()*.28};shootingAt=t+18000+Math.random()*26000}
 if(shooting){const u=(now-shooting.t)/1.3;if(u>1)shooting=null;else{const x=(shooting.x+u*.18)*r.width,y=(shooting.y+u*.08)*r.height;const g=lctx.createLinearGradient(x-90,y-35,x,y);g.addColorStop(0,"rgba(255,255,255,0)");g.addColorStop(1,"rgba(255,242,205,"+(1-u)*.7+")");lctx.strokeStyle=g;lctx.lineWidth=1.2;lctx.beginPath();lctx.moveTo(x-90,y-35);lctx.lineTo(x,y);lctx.stroke()}}
}
function addMicroPlanets(img){
 const specs=[{x:.305,y:.118,s:.043,d:115},{x:.666,y:.371,s:.028,d:96},{x:.346,y:.845,s:.03,d:128}];
 specs.forEach(sp=>{const el=document.createElement("div");el.className="microplanet";el.style.left=(sp.x*100)+"%";el.style.top=(sp.y*100)+"%";el.style.width=(sp.s*100)+"%";el.style.aspectRatio="1";el.style.setProperty("--dur",sp.d+"s");const c=document.createElement("canvas");c.width=c.height=160;const cx=c.getContext("2d");const px=(sp.x-sp.s/2)*img.naturalWidth,py=(sp.y-sp.s/2)*img.naturalHeight,ps=sp.s*img.naturalWidth;cx.drawImage(img,px,py,ps,ps,0,0,160,160);el.appendChild(c);stage.appendChild(el)})}
let pointer={x:0,y:0};shell.addEventListener("pointermove",e=>{pointer.x=e.clientX/innerWidth-.5;pointer.y=e.clientY/innerHeight-.5;if(shell.dataset.state==="home"&&!reduced)stage.style.translate=(pointer.x*-3)+"px "+(pointer.y*-2)+"px"});shell.addEventListener("pointerleave",()=>stage.style.translate="0 0");

function animate(t){
 const dt=Math.min(.05,(t-last)/1000);last=t;
 if(GL){GL.gl.useProgram(GL.prog);GL.gl.uniform1f(GL.uTime,t/1000);GL.gl.uniform2f(GL.uPointer,pointer.x,pointer.y);GL.gl.uniform1f(GL.uFocus,focusIndex);GL.gl.drawArrays(GL.gl.TRIANGLES,0,6)}
 drawLife(t);requestAnimationFrame(animate)
}
addEventListener("resize",resize);
(async()=>{
 try{
  const blob=await fetchImageBlob("master");masterObjectUrl=URL.createObjectURL(blob);if(!reduced){integrationMotion.src="/api/natalie-motion?key=integration";integrationMotion.play().catch(()=>{})}art.onload=()=>{GL=initWebGL(art);resize();addMicroPlanets(art);shell.classList.add("ready");requestAnimationFrame(animate)};art.src=masterObjectUrl;
 }catch(e){root.innerHTML='<div class="boot">The approved master artwork could not load. Please refresh.</div>';console.error(e)}
})();