import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const WORLDS=[
  {
    id:'littoral',name:'Littoral Coast',cue:'Tides · islands · shorelines',
    texture:'/assets/territory-planets/littoral.webp',
    position:[-2.55,1.18,-.42],radius:.50,spin:.105,tilt:-.13,tint:0xbbeeff,offset:.20,dreams:null
  },
  {
    id:'roadlands',name:'The Roadlands',cue:'Journeys · crossings · movement',
    texture:'/assets/territory-planets/roadlands.webp',
    position:[2.40,.82,-.72],radius:.52,spin:.076,tilt:.16,tint:0xffd19b,offset:.10,dreams:null
  },
  {
    id:'hearthlands',name:'The Hearthlands',cue:'Home · gardens · belonging',
    texture:'/assets/territory-planets/hearthlands.webp',
    live:true,position:[-.12,-.02,.16],radius:.60,spin:.088,tilt:-.08,tint:0xffebc2,offset:.02,hearth:true,dreams:213
  },
  {
    id:'institutional',name:'Institutional Quarter',cue:'Structure · authority · public space',
    texture:'/assets/territory-planets/institutional.webp',
    position:[-1.68,-1.48,-.82],radius:.47,spin:.061,tilt:.11,tint:0xdbe1ff,offset:.08,dreams:null
  },
  {
    id:'river',name:'River Country',cue:'Waterways · bridges · flow',
    texture:'/assets/territory-planets/river.webp',
    position:[2.06,-1.38,-.50],radius:.52,spin:.112,tilt:-.18,tint:0xbcebdc,offset:.16,dreams:null
  },
];

// Portrait phones use their own compact orrery rather than desktop coordinates squeezed
// into a narrow viewport. All five worlds remain visible at once, with asymmetry and depth.
const MOBILE_POSITIONS={
  littoral:[-.66,.86,-.40],
  roadlands:[.63,.70,-.55],
  hearthlands:[0,.04,.05],
  institutional:[-.58,-.70,-.55],
  river:[.58,-.88,-.42],
};

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const isPortraitMobile=()=>innerWidth<=800&&innerHeight>innerWidth*1.12;

// Authoritative counts may influence planet size, but only gently. Unknown counts keep
// authored visual sizes; no corpus evidence is invented.
function radiusFor(world){
  if(!Number.isFinite(world.dreams))return world.radius;
  return clamp(.48+Math.sqrt(world.dreams)/90,.50,.70);
}

function layoutFor(world){
  const mobile=isPortraitMobile();
  return {
    position:mobile?MOBILE_POSITIONS[world.id]:world.position,
    radius:radiusFor(world)*(mobile?.50:1),
    drift:mobile?.34:1,
  };
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
      <button class="territory-world" data-world="${world.id}" type="button"
        aria-label="${world.name}${world.live?' — enter territory map':' — territory world preview'}">
        <span class="territory-world__sphere" aria-hidden="true"></span>
        <span class="territory-world__name">${world.name}</span>
        <span class="territory-world__cue">${world.cue}</span>
      </button>`).join('')}
    <div class="territory-cosmos__status" aria-live="polite"></div>
    <div class="territory-cosmos__hint">Select a world · Hearthlands is mapped first</div>
    <div class="territory-cosmos__blackout" aria-hidden="true"></div>`;
  root.appendChild(section);

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
  const warm=new THREE.DirectionalLight(0xffd6a8,2.35);
  warm.position.set(-4,3,6);
  scene.add(warm);
  const cool=new THREE.DirectionalLight(0x779cff,.95);
  cool.position.set(4,-2,5);
  scene.add(cool);

  const loader=new THREE.TextureLoader();
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

  // Quick twinkling passage retained from the approved transition pass.
  const tunnelCount=380;
  const tunnelStars=Array.from({length:tunnelCount},()=>({
    angle:Math.random()*Math.PI*2,
    radius:.30+Math.pow(Math.random(),.56)*5.0,
    z:-10+Math.random()*17,
    length:.09+Math.random()*.45,
    speed:.82+Math.random()*1.08,
  }));
  const tunnelPositions=new Float32Array(tunnelCount*2*3);
  const tunnelGeometry=new THREE.BufferGeometry();
  tunnelGeometry.setAttribute('position',new THREE.BufferAttribute(tunnelPositions,3));
  const tunnelMaterial=new THREE.LineBasicMaterial({
    color:0xe8f1ff,transparent:true,opacity:0,
    blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,
  });
  const tunnelLines=new THREE.LineSegments(tunnelGeometry,tunnelMaterial);
  tunnelLines.position.set(-.12,-.02,0);
  tunnelLines.renderOrder=20;
  scene.add(tunnelLines);

  function updateTunnel(dt,p,now){
    const intensity=clamp((p-.025)/.22,0,1)*(1-clamp((p-.86)/.14,0,1));
    const twinkle=.83+.17*Math.sin(now*.035);
    tunnelMaterial.opacity=.10+.84*intensity*twinkle;
    for(let i=0;i<tunnelStars.length;i++){
      const star=tunnelStars[i];
      star.z+=dt*(14+50*p)*star.speed;
      if(star.z>7.2){
        star.z=-11-Math.random()*4;
        star.angle=Math.random()*Math.PI*2;
        star.radius=.30+Math.pow(Math.random(),.56)*5.0;
      }
      const x=Math.cos(star.angle)*star.radius;
      const y=Math.sin(star.angle)*star.radius*.64;
      const stretch=star.length*(1+10*p);
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

  function baseAtmosphere(world){return world.hearth?.078:.068}
  function baseEmissive(world){return world.hearth?.064:.054}

  for(const world of WORLDS){
    // Every world has its own full equirectangular surface. No shared fallback texture is
    // used in the normal render path, so each rotating sphere preserves territory identity.
    const texture=configureTexture(loader.load(world.texture),world);
    const tint=new THREE.Color(world.tint);
    const spec=layoutFor(world);
    const material=new THREE.MeshStandardMaterial({
      map:texture,
      color:new THREE.Color(0xffffff),
      emissive:tint,
      emissiveMap:texture,
      emissiveIntensity:baseEmissive(world),
      roughness:.94,
      metalness:0,
      transparent:true,
      opacity:1,
    });

    const group=new THREE.Group();
    const mesh=new THREE.Mesh(planetGeometry,material);
    mesh.scale.setScalar(spec.radius);
    mesh.rotation.x=world.tilt;
    group.add(mesh);

    const atmosphereMaterial=new THREE.MeshBasicMaterial({
      color:tint,transparent:true,opacity:baseAtmosphere(world),
      side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false,
    });
    const atmosphere=new THREE.Mesh(atmosphereGeometry,atmosphereMaterial);
    atmosphere.scale.setScalar(spec.radius);
    group.add(atmosphere);

    const base=new THREE.Vector3(...spec.position);
    group.position.copy(base);
    scene.add(group);
    rendered.set(world.id,{
      world,radius:spec.radius,drift:spec.drift,group,mesh,atmosphere,material,
      atmosphereMaterial,base,phase:Math.random()*Math.PI*2
    });
  }

  function applyResponsiveLayout(){
    for(const item of rendered.values()){
      const spec=layoutFor(item.world);
      item.radius=spec.radius;
      item.drift=spec.drift;
      item.base.set(...spec.position);
      item.mesh.scale.setScalar(spec.radius);
      item.atmosphere.scale.setScalar(spec.radius);
      if(!entering)item.group.position.copy(item.base);
    }
  }

  function applyCameraForViewport(){
    const mobile=isPortraitMobile();
    camera.fov=mobile?42:34;
    initialCamera.z=mobile?8.65:7.55;
    if(!entering){
      camera.position.z=initialCamera.z;
      camera.position.x=0;
      camera.position.y=0;
    }
    camera.updateProjectionMatrix();
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
    const radiusPx=Math.max(isPortraitMobile()?24:42,Math.abs(edge.x-center.x)*.5*innerWidth);
    const button=section.querySelector(`[data-world="${item.world.id}"]`);
    if(button){
      button.style.left=`${x}px`;
      button.style.top=`${y}px`;
      button.style.setProperty('--hit-size',`${radiusPx*2.12}px`);
      const depth=clamp(1-(item.group.position.z+1.3)/4,.68,1.04);
      button.style.setProperty('--depth-opacity',depth.toFixed(2));
    }
  }

  function enterHearthlands(button){
    if(entering)return;
    entering=true;
    enterStarted=performance.now();
    didFocus=false;didDescent=false;didBlackout=false;didReveal=false;
    root.classList.remove('fast-hearth-reveal');
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
    showMessage(`${world?.name||'This territory'} has its own world surface. Its painted flat map follows the Hearthlands pilot.`);
    section.querySelectorAll('.territory-world').forEach(item=>item.classList.toggle('is-preview-selected',item===button));
  });

  function resetCosmos(){
    entering=false;enterStarted=0;didFocus=false;didDescent=false;didBlackout=false;didReveal=false;hovered=null;
    window.__dreamscapeFastTerritoryEntry=false;
    root.classList.remove('fast-hearth-reveal');
    tunnelMaterial.opacity=0;
    section.classList.remove('is-entering','is-blackout','map-reveal');
    section.querySelectorAll('.territory-world').forEach(item=>item.classList.remove('is-selected','is-preview-selected'));
    camera.position.copy(initialCamera);
    camera.lookAt(0,0,0);
    applyResponsiveLayout();
    for(const item of rendered.values()){
      item.group.position.copy(item.base);
      item.group.scale.setScalar(1);
      item.material.opacity=1;
      item.material.emissiveIntensity=baseEmissive(item.world);
      item.atmosphereMaterial.opacity=baseAtmosphere(item.world);
    }
  }

  function returnToCosmos(){
    if(returnButton)returnButton.click();
    else root.dataset.state='orbit';
    setTimeout(resetCosmos,0);
  }

  returnButton?.addEventListener('click',()=>setTimeout(resetCosmos,0));
  cosmosReturn.addEventListener('click',returnToCosmos);
  addEventListener('keydown',event=>{
    if(event.key==='Escape'&&(root.dataset.state==='hearth'||root.classList.contains('fast-hearth-reveal')))returnToCosmos();
  });

  const observer=new MutationObserver(()=>{
    if(root.dataset.state==='orbit'&&entering)resetCosmos();
  });
  observer.observe(root,{attributes:true,attributeFilter:['data-state']});

  function resize(){
    renderer.setSize(innerWidth,innerHeight,false);
    camera.aspect=innerWidth/innerHeight;
    applyCameraForViewport();
    applyResponsiveLayout();
  }
  addEventListener('resize',resize);
  resize();

  addEventListener('pointermove',event=>{
    if(isPortraitMobile())return;
    pointer.x=(event.clientX/innerWidth-.5)*2;
    pointer.y=(event.clientY/innerHeight-.5)*2;
  },{passive:true});

  function animate(now){
    const dt=Math.min(.05,(now-lastFrame)/1000);
    lastFrame=now;
    const time=now*.001;

    if(!entering){
      tunnelMaterial.opacity=0;
      const mobile=isPortraitMobile();
      const pointerX=mobile?0:pointer.x*.09;
      const pointerY=mobile?0:-pointer.y*.055;
      camera.position.x+=(pointerX-camera.position.x)*Math.min(1,dt*1.4);
      camera.position.y+=(pointerY-camera.position.y)*Math.min(1,dt*1.4);
      camera.position.z+=(initialCamera.z-camera.position.z)*Math.min(1,dt*1.8);
      camera.lookAt(0,0,0);

      for(const item of rendered.values()){
        const {world,base,group,mesh,phase,material,atmosphereMaterial}=item;
        mesh.rotation.y+=dt*world.spin;
        const driftX=Math.sin(time*(.075+world.spin*.12)+phase)*.12*item.drift;
        const driftY=Math.cos(time*(.061+world.spin*.09)+phase)*.085*item.drift;
        group.position.x=base.x+driftX;
        group.position.y=base.y+driftY;
        group.position.z=base.z+Math.sin(time*.052+phase)*.055*item.drift;
        const hover=hovered===world.id;
        const targetScale=hover?1.055:1;
        group.scale.x+=(targetScale-group.scale.x)*Math.min(1,dt*5);
        group.scale.y=group.scale.z=group.scale.x;
        const targetEmissive=hover?.105:baseEmissive(world);
        const targetAtmosphere=hover?.115:baseAtmosphere(world);
        material.emissiveIntensity+=(targetEmissive-material.emissiveIntensity)*Math.min(1,dt*4);
        atmosphereMaterial.opacity+=(targetAtmosphere-atmosphereMaterial.opacity)*Math.min(1,dt*4);
      }
    }else{
      const hearth=rendered.get('hearthlands');
      const elapsed=now-enterStarted;
      const t=clamp(elapsed/1080,0,1);
      const p=ease(t);
      const target=hearth.group.position.clone();
      const startZ=isPortraitMobile()?8.65:7.55;
      const desired=new THREE.Vector3(target.x*.045,target.y*.045,THREE.MathUtils.lerp(startZ,1.22,p));
      camera.position.lerp(desired,Math.min(1,dt*8.4));
      camera.lookAt(target);
      updateTunnel(dt,p,now);
      hearth.mesh.rotation.y+=dt*.21;
      hearth.group.scale.setScalar(1+2.25*p);
      if(p>.72){
        const fade=clamp((p-.72)/.28,0,1);
        hearth.material.opacity=1-fade*.90;
        hearth.atmosphereMaterial.opacity=baseAtmosphere(hearth.world)*(1-fade);
      }
      for(const [id,item] of rendered){
        if(id==='hearthlands')continue;
        item.mesh.rotation.y+=dt*item.world.spin*.55;
        item.material.opacity=1-p;
        item.atmosphereMaterial.opacity=baseAtmosphere(item.world)*(1-p);
      }
      if(elapsed>80&&!didFocus){
        didFocus=true;
        document.querySelector('.territory-label.primary')?.click();
      }
      if(elapsed>160&&!didDescent){
        didDescent=true;
        document.querySelector('.focus-panel .enter')?.click();
      }
      if(elapsed>760&&!didBlackout){
        didBlackout=true;
        section.classList.add('is-blackout');
      }
      if(elapsed>1120&&!didReveal){
        didReveal=true;
        root.classList.add('fast-hearth-reveal');
        section.classList.add('map-reveal');
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
    worlds:WORLDS.map(({id,name,cue,live,dreams,texture})=>({id,name,cue,live:!!live,dreams,texture}))
  };
  return true;
}

if(!mountTerritoryCosmos()){
  const timer=setInterval(()=>{if(mountTerritoryCosmos())clearInterval(timer)},80);
  setTimeout(()=>clearInterval(timer),10000);
}
