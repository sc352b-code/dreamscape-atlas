import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const WORLDS=[
  {id:'littoral',name:'Littoral Coast',cue:'Tides · islands · shorelines',position:[-2.7,1.25,-.45],radius:.49,spin:.105,tilt:-.13,tint:0xbbeeff,offset:.13,dreams:null},
  {id:'roadlands',name:'The Roadlands',cue:'Journeys · crossings · movement',position:[2.55,.82,-.85],radius:.52,spin:.076,tilt:.16,tint:0xffd19b,offset:.42,dreams:null},
  {id:'hearthlands',name:'The Hearthlands',cue:'Home · gardens · belonging',live:true,position:[-.18,-.02,.22],radius:.78,spin:.088,tilt:-.08,tint:0xffebc2,offset:.02,hearth:true,dreams:213},
  {id:'institutional',name:'Institutional Quarter',cue:'Structure · authority · public space',position:[-1.72,-1.58,-1.0],radius:.44,spin:.061,tilt:.11,tint:0xdbe1ff,offset:.63,dreams:null},
  {id:'river',name:'River Country',cue:'Waterways · bridges · flow',position:[2.18,-1.46,-.58],radius:.55,spin:.112,tilt:-.18,tint:0xbcebdc,offset:.81,dreams:null},
];

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

// Authoritative dream counts can drive apparent planet size without exaggerating differences.
// Unknown counts retain the current design radius rather than inventing corpus evidence.
function radiusFor(world){
  if(!Number.isFinite(world.dreams))return world.radius;
  return clamp(.38+Math.sqrt(world.dreams)/34,.42,.82);
}

function mountTerritoryCosmos(){
  const root=document.querySelector('.atlas');
  if(!root||root.querySelector('.territory-cosmos'))return false;
  root.classList.add('territory-worlds-mode');

  const section=document.createElement('section');
  section.className='territory-cosmos';
  section.setAttribute('aria-label','Choose a dream territory');
  section.innerHTML=`
    <canvas class="territory-cosmos__gl" aria-hidden="true"></canvas>
    <div class="territory-cosmos__tunnel-vignette" aria-hidden="true"></div>
    <div class="territory-cosmos__heading">
      <small>Your living dream atlas</small>
      <h1>Dream Atlas</h1>
      <p>Five territories, suspended in the same dreaming cosmos.</p>
    </div>
    ${WORLDS.map(world=>`
      <button class="territory-world" data-world="${world.id}" type="button" aria-label="${world.name}${world.live?' — enter territory map':' — territory world preview'}">
        <span class="territory-world__sphere" aria-hidden="true"></span>
        <span class="territory-world__name">${world.name}</span>
        <span class="territory-world__cue">${world.cue}</span>
      </button>`).join('')}
    <div class="territory-cosmos__status" aria-live="polite"></div>
    <div class="territory-cosmos__hint">Select a world · Hearthlands is mapped first</div>
    <div class="territory-cosmos__blackout" aria-hidden="true"></div>`;
  root.appendChild(section);

  // A dedicated fixed return control makes the route back to the territory cosmos explicit
  // and independent of the older flat-map header button.
  const cosmosReturn=document.createElement('button');
  cosmosReturn.type='button';
  cosmosReturn.className='territory-cosmos-return';
  cosmosReturn.textContent='← Back to Worlds';
  cosmosReturn.setAttribute('aria-label','Return to the territory worlds');
  root.appendChild(cosmosReturn);

  const returnButton=document.querySelector('.return-world');
  if(returnButton){
    returnButton.textContent='← Back to Dream Atlas';
    returnButton.setAttribute('aria-label','Return to the territory worlds');
  }

  const canvas=section.querySelector('.territory-cosmos__gl');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2.25));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000,0);

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.1,40);
  const initialCamera=new THREE.Vector3(0,0,7.55);
  camera.position.copy(initialCamera);

  scene.add(new THREE.HemisphereLight(0xcbd8ff,0x160d22,2.15));
  const warm=new THREE.DirectionalLight(0xffd6a8,2.6);warm.position.set(-4,3,6);scene.add(warm);
  const cool=new THREE.DirectionalLight(0x779cff,1.05);cool.position.set(4,-2,5);scene.add(cool);

  const loader=new THREE.TextureLoader();
  const sourceWorld='/assets/world-equirectangular-hd.webp';
  const sourceHearth='/assets/hearthlands-globe-4k.webp';
  const planetGeometry=new THREE.SphereGeometry(1,128,96);
  const atmosphereGeometry=new THREE.SphereGeometry(1.045,96,72);
  const rendered=new Map();
  const pointer={x:0,y:0};
  let hovered=null;
  let entering=false;
  let enterStarted=0;
  let lastFrame=performance.now();
  let didFocus=false;
  let didDescent=false;
  let didBlackout=false;
  let didReveal=false;

  // Real 3D star corridor. The quicker timings below make it feel like a brief twinkling
  // journey through the cosmos instead of a long transition/loading sequence.
  const tunnelCount=340;
  const tunnelStars=Array.from({length:tunnelCount},()=>({
    angle:Math.random()*Math.PI*2,
    radius:.34+Math.pow(Math.random(),.58)*4.9,
    z:-9+Math.random()*15,
    length:.10+Math.random()*.48,
    speed:.78+Math.random()*1.02,
  }));
  const tunnelPositions=new Float32Array(tunnelCount*2*3);
  const tunnelGeometry=new THREE.BufferGeometry();
  tunnelGeometry.setAttribute('position',new THREE.BufferAttribute(tunnelPositions,3));
  const tunnelMaterial=new THREE.LineBasicMaterial({
    color:0xe4edff,transparent:true,opacity:0,
    blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,
  });
  const tunnelLines=new THREE.LineSegments(tunnelGeometry,tunnelMaterial);
  tunnelLines.position.set(-.18,-.02,0);
  tunnelLines.renderOrder=20;
  scene.add(tunnelLines);

  function updateTunnel(dt,p,now){
    const intensity=clamp((p-.05)/.28,0,1)*(1-clamp((p-.84)/.16,0,1));
    const twinkle=.88+.12*Math.sin(now*.026);
    tunnelMaterial.opacity=.08+.78*intensity*twinkle;
    for(let i=0;i<tunnelStars.length;i++){
      const star=tunnelStars[i];
      star.z+=dt*(8+30*p)*star.speed;
      if(star.z>7.1){
        star.z=-10-Math.random()*3;
        star.angle=Math.random()*Math.PI*2;
        star.radius=.34+Math.pow(Math.random(),.58)*4.9;
      }
      const x=Math.cos(star.angle)*star.radius;
      const y=Math.sin(star.angle)*star.radius*.64;
      const stretch=star.length*(1+7.4*p);
      const j=i*6;
      tunnelPositions[j]=x;tunnelPositions[j+1]=y;tunnelPositions[j+2]=star.z-stretch;
      tunnelPositions[j+3]=x;tunnelPositions[j+4]=y;tunnelPositions[j+5]=star.z;
    }
    tunnelGeometry.attributes.position.needsUpdate=true;
  }

  function configureTexture(texture,world){
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
    texture.wrapS=THREE.RepeatWrapping;
    texture.wrapT=THREE.ClampToEdgeWrapping;
    texture.offset.x=world.offset||0;
    texture.minFilter=THREE.LinearMipmapLinearFilter;
    texture.magFilter=THREE.LinearFilter;
    texture.generateMipmaps=true;
    return texture;
  }

  for(const world of WORLDS){
    const texture=configureTexture(loader.load(world.hearth?sourceHearth:sourceWorld),world);
    const tint=new THREE.Color(world.tint);
    const radius=radiusFor(world);
    const material=new THREE.MeshStandardMaterial({
      map:texture,
      color:tint.clone().lerp(new THREE.Color(0xffffff),world.hearth?.82:.63),
      emissive:tint,
      emissiveMap:texture,
      emissiveIntensity:world.hearth?.09:.075,
      roughness:.94,
      metalness:0,
      transparent:true,
      opacity:1,
    });
    const group=new THREE.Group();
    const mesh=new THREE.Mesh(planetGeometry,material);
    mesh.scale.setScalar(radius);
    mesh.rotation.x=world.tilt;
    group.add(mesh);

    const atmosphereMaterial=new THREE.MeshBasicMaterial({
      color:tint,transparent:true,opacity:world.hearth?.085:.075,
      side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false,
    });
    const atmosphere=new THREE.Mesh(atmosphereGeometry,atmosphereMaterial);
    atmosphere.scale.setScalar(radius);
    group.add(atmosphere);

    const base=new THREE.Vector3(...world.position);
    group.position.copy(base);
    scene.add(group);
    rendered.set(world.id,{world,radius,group,mesh,material,atmosphereMaterial,base,phase:Math.random()*Math.PI*2});
  }

  const status=section.querySelector('.territory-cosmos__status');
  let messageTimer=0;
  function showMessage(text){
    clearTimeout(messageTimer);
    status.textContent=text;
    section.dataset.message='true';
    messageTimer=setTimeout(()=>{section.dataset.message='false'},2600);
  }

  function projectWorld(item){
    const center=item.group.position.clone().project(camera);
    const edge=item.group.position.clone().add(new THREE.Vector3(item.radius,0,0)).project(camera);
    const x=(center.x*.5+.5)*innerWidth;
    const y=(-center.y*.5+.5)*innerHeight;
    const radiusPx=Math.max(42,Math.abs(edge.x-center.x)*.5*innerWidth);
    const button=section.querySelector(`[data-world="${item.world.id}"]`);
    if(button){
      button.style.left=`${x}px`;
      button.style.top=`${y}px`;
      button.style.setProperty('--hit-size',`${radiusPx*2.08}px`);
      const depth=clamp(1-(item.group.position.z+1.3)/4,.68,1.04);
      button.style.setProperty('--depth-opacity',depth.toFixed(2));
    }
  }

  function enterHearthlands(button){
    if(entering)return;
    entering=true;
    enterStarted=performance.now();
    didFocus=false;didDescent=false;didBlackout=false;didReveal=false;
    window.__dreamscapeFastTerritoryEntry=true;
    window.dispatchEvent(new CustomEvent('dreamscape:cosmic-tunnel',{detail:{territory:'hearthlands'}}));
    section.classList.add('is-entering');
    button.classList.add('is-selected');
  }

  section.addEventListener('pointerover',event=>{
    const button=event.target.closest('.territory-world');
    if(!button||entering)return;
    hovered=button.dataset.world;
  });
  section.addEventListener('pointerout',event=>{
    if(event.target.closest('.territory-world'))hovered=null;
  });
  section.addEventListener('click',event=>{
    const button=event.target.closest('.territory-world');
    if(!button)return;
    const id=button.dataset.world;
    if(id==='hearthlands')return enterHearthlands(button);
    const world=WORLDS.find(item=>item.id===id);
    showMessage(`${world?.name||'This territory'} is already part of the atlas. Its painted map follows the Hearthlands pilot.`);
    section.querySelectorAll('.territory-world').forEach(item=>item.classList.toggle('is-preview-selected',item===button));
  });

  function resetCosmos(){
    entering=false;enterStarted=0;didFocus=false;didDescent=false;didBlackout=false;didReveal=false;hovered=null;
    window.__dreamscapeFastTerritoryEntry=false;
    tunnelMaterial.opacity=0;
    section.classList.remove('is-entering','is-blackout','map-reveal');
    section.querySelectorAll('.territory-world').forEach(item=>item.classList.remove('is-selected','is-preview-selected'));
    camera.position.copy(initialCamera);camera.lookAt(0,0,0);
    for(const item of rendered.values()){
      item.group.position.copy(item.base);item.group.scale.setScalar(1);
      item.material.opacity=1;item.atmosphereMaterial.opacity=item.world.hearth?.085:.075;
    }
  }

  function returnToCosmos(){
    if(returnButton) returnButton.click();
    else root.dataset.state='orbit';
    setTimeout(resetCosmos,0);
  }

  returnButton?.addEventListener('click',()=>setTimeout(resetCosmos,0));
  cosmosReturn.addEventListener('click',returnToCosmos);
  addEventListener('keydown',event=>{
    if(event.key==='Escape'&&root.dataset.state==='hearth')returnToCosmos();
  });

  const observer=new MutationObserver(()=>{
    if(root.dataset.state==='orbit'&&entering)resetCosmos();
  });
  observer.observe(root,{attributes:true,attributeFilter:['data-state']});

  function resize(){
    renderer.setSize(innerWidth,innerHeight,false);
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize',resize);resize();

  addEventListener('pointermove',event=>{
    pointer.x=(event.clientX/innerWidth-.5)*2;
    pointer.y=(event.clientY/innerHeight-.5)*2;
  },{passive:true});

  function animate(now){
    const dt=Math.min(.05,(now-lastFrame)/1000);lastFrame=now;
    const time=now*.001;

    if(!entering){
      tunnelMaterial.opacity=0;
      camera.position.x+=(pointer.x*.09-camera.position.x)*Math.min(1,dt*1.4);
      camera.position.y+=(-pointer.y*.055-camera.position.y)*Math.min(1,dt*1.4);
      camera.position.z+=(initialCamera.z-camera.position.z)*Math.min(1,dt*1.8);
      camera.lookAt(0,0,0);
      for(const item of rendered.values()){
        const {world,base,group,mesh,phase,material,atmosphereMaterial}=item;
        mesh.rotation.y+=dt*world.spin;
        const driftX=Math.sin(time*(.075+world.spin*.12)+phase)*.12;
        const driftY=Math.cos(time*(.061+world.spin*.09)+phase)*.085;
        group.position.x=base.x+driftX;
        group.position.y=base.y+driftY;
        group.position.z=base.z+Math.sin(time*.052+phase)*.055;
        const hover=hovered===world.id;
        const targetScale=hover?1.055:1;
        group.scale.x+=(targetScale-group.scale.x)*Math.min(1,dt*5);
        group.scale.y=group.scale.z=group.scale.x;
        material.emissiveIntensity+=( (hover?(world.hearth?.14:.14):(world.hearth?.09:.075))-material.emissiveIntensity)*Math.min(1,dt*4);
        atmosphereMaterial.opacity+=( (hover?(world.hearth?.13:.13):(world.hearth?.085:.075))-atmosphereMaterial.opacity)*Math.min(1,dt*4);
      }
    }else{
      const hearth=rendered.get('hearthlands');
      const elapsed=now-enterStarted;
      const t=clamp(elapsed/1550,0,1);
      const p=ease(t);
      const target=hearth.group.position.clone();
      const desired=new THREE.Vector3(target.x*.06,target.y*.06,THREE.MathUtils.lerp(7.55,1.34,p));
      camera.position.lerp(desired,Math.min(1,dt*6.2));
      camera.lookAt(target);
      updateTunnel(dt,p,now);
      hearth.mesh.rotation.y+=dt*.18;
      hearth.group.scale.setScalar(1+2.05*p);
      if(p>.70){
        const fade=clamp((p-.70)/.30,0,1);
        hearth.material.opacity=1-fade*.86;
        hearth.atmosphereMaterial.opacity=.085*(1-fade);
      }
      for(const [id,item] of rendered){
        if(id==='hearthlands')continue;
        item.mesh.rotation.y+=dt*item.world.spin*.55;
        item.material.opacity=1-p;
        item.atmosphereMaterial.opacity=.075*(1-p);
      }
      if(elapsed>140&&!didFocus){
        didFocus=true;
        document.querySelector('.territory-label.primary')?.click();
      }
      if(elapsed>280&&!didDescent){
        didDescent=true;
        document.querySelector('.focus-panel .enter')?.click();
      }
      if(elapsed>1080&&!didBlackout){
        didBlackout=true;section.classList.add('is-blackout');
      }
      if(elapsed>1580&&!didReveal){
        didReveal=true;section.classList.add('map-reveal');
      }
    }

    for(const item of rendered.values())projectWorld(item);
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  window.dreamscapeTerritoryWorlds={
    enterHearthlands:()=>enterHearthlands(section.querySelector('[data-world="hearthlands"]')),
    reset:resetCosmos,
    back:returnToCosmos,
    worlds:WORLDS.map(({id,name,cue,live,dreams})=>({id,name,cue,live:!!live,dreams}))
  };
  return true;
}

if(!mountTerritoryCosmos()){
  const timer=setInterval(()=>{if(mountTerritoryCosmos())clearInterval(timer)},80);
  setTimeout(()=>clearInterval(timer),10000);
}
