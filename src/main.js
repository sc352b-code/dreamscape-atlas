import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const app = document.querySelector("#app");
const worldAssetUrl = "/assets/world-equirectangular.png";
const hearthAssetUrl = "/assets/hearthlands-flatmap.png";

app.innerHTML = `
<main class="atlas" data-state="orbit" data-layer="places">
  <canvas id="starscape" class="starscape" aria-hidden="true"></canvas>
  <div class="cosmos">
    <div class="nebula n1"></div>
    <div class="nebula n2"></div>
    <div class="nebula n3"></div>
    <div class="nebula n4"></div>
    <div class="planetary p1"></div>
    <div class="planetary p2"></div>
    <div class="dust dust-a"></div>
    <div class="dust dust-b"></div>
  </div>

  <header class="topbar glass-lite">
    <div class="brand"><span class="sigil">✦</span><div><b>DREAMSCAPE</b><small>DREAM ATLAS</small></div></div>
    <nav class="mainnav" aria-label="Primary"><a class="active">World</a><a>Journal</a><a>Insights</a><a>Collections</a></nav>
    <div class="stats"><span>✶ 213 dreams</span><span>☾ 17 places</span></div>
  </header>

  <aside class="left-poem glass-lite">
    <p>A world<br>shaped by your<br>dreams.</p>
    <small>Explore<br>remember<br>belong</small>
  </aside>

  <div class="globe-stage" aria-label="Interactive Dream Atlas globe">
    <canvas id="globe"></canvas>
    <div class="territory-labels" aria-hidden="false"></div>
    <div class="orbit-help">Drag to rotate · click the glowing Hearthlands · scroll to move closer</div>
    <div class="bottom-quote">“The same world, again and again,<br>but always new.”</div>
  </div>

  <aside class="focus-panel glass" aria-live="polite">
    <button class="close-focus" aria-label="Close territory">×</button>
    <p class="roman">I · THE DOMESTIC HEART</p>
    <h1>The Hearthlands</h1>
    <p class="subtitle">Where belonging keeps changing shape</p>
    <div class="rule"></div>
    <p class="body">A warm, memory-rich territory shaped by recurring dream evidence. Houses, gardens, lanes, fields and symbolic presences gather here and form a living map of inner life.</p>
    <div class="focus-meta"><span><b>213</b> dreams here</span><span><b>5</b> mapped places</span><span><b>37</b> symbols</span></div>
    <div class="theme-pills"><span>Home</span><span>Family</span><span>Belonging</span><span>Fox</span><span>Warm Light</span></div>
    <button class="enter">Travel into The Hearthlands <span>→</span></button>
  </aside>

  <div class="descent-copy" aria-hidden="true"><span>TRAVELLING INTO</span><b>THE HEARTHLANDS</b></div>

  <section class="flatmap-scene" aria-label="The Hearthlands flatmap">
    <img class="flatmap-art" src="${hearthAssetUrl}" alt="A richly illustrated map of The Hearthlands" />
    <div class="flatmap-wash"></div>
    <div class="glint g1"></div><div class="glint g2"></div><div class="glint g3"></div><div class="glint g4"></div><div class="glint g5"></div><div class="glint g6"></div>

    <header class="hearth-bar glass-lite">
      <button class="return-world">← Return to the world</button>
      <div class="hearth-heading"><b>The Hearthlands</b><small>213 dreams</small></div>
      <div class="layer-switch" role="group" aria-label="Map layer">
        <button data-show="places" class="active">Places</button><button data-show="symbols">Symbols</button>
      </div>
    </header>

    <button class="map-marker place family" data-place="Family Home"><i></i><span>Family Home</span></button>
    <button class="map-marker place childhood" data-place="Cambridge Road Childhood House"><i></i><span>Cambridge Road Childhood House</span></button>
    <button class="map-marker place present" data-place="Current / Present House"><i></i><span>Current / Present House</span></button>
    <button class="map-marker place many" data-place="The Large Many-Roomed House"><i></i><span>The Large Many-Roomed House</span></button>
    <button class="map-marker place unfamiliar" data-place="The Unfamiliar House"><i></i><span>The Unfamiliar House</span></button>
    <button class="map-marker symbol fox" data-place="Fox"><i></i><span>Fox</span></button>

    <div class="arrival-whisper"><span>THE HEARTHLANDS</span><b>The world becomes more detailed as you enter it.</b></div>
  </section>

  <aside class="place-sheet glass" aria-live="polite">
    <button class="close-place" aria-label="Close place">×</button>
    <p class="roman">THE HEARTHLANDS</p>
    <h2>Family Home</h2>
    <p>This is a named place carried forward from the v57 Atlas. The full evidence-led reading remains separate from the map layer.</p>
  </aside>

  <div class="vignette"></div>
</main>`;

const root = document.querySelector(".atlas");
const canvas = document.querySelector("#globe");
const labelLayer = document.querySelector(".territory-labels");
const focusPanel = document.querySelector(".focus-panel");
const flatmap = document.querySelector(".flatmap-scene");
const flatmapArt = document.querySelector(".flatmap-art");
const placeSheet = document.querySelector(".place-sheet");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Starscape -----------------------------------------------------------
const starsCanvas = document.querySelector("#starscape");
const sctx = starsCanvas.getContext("2d");
let stars = [];
let motes = [];
let shooting = [];

function initStars(){
  const w = innerWidth, h = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  starsCanvas.width = w * dpr;
  starsCanvas.height = h * dpr;
  starsCanvas.style.width = w + 'px';
  starsCanvas.style.height = h + 'px';
  sctx.setTransform(dpr,0,0,dpr,0,0);
  const starCount = Math.max(260, Math.min(720, Math.round((w*h)/4200)));
  const moteCount = Math.max(24, Math.min(70, Math.round((w*h)/30000)));
  stars = Array.from({length: starCount}, () => ({
    x: Math.random()*w,
    y: Math.random()*h,
    r: Math.random()*1.6 + 0.18,
    a: Math.random()*0.6 + 0.12,
    phase: Math.random()*Math.PI*2,
    speed: Math.random()*0.0017 + 0.00025
  }));
  motes = Array.from({length: moteCount}, () => ({
    x: Math.random()*w,
    y: Math.random()*h,
    r: Math.random()*22 + 8,
    a: Math.random()*0.035 + 0.012,
    dx: (Math.random()-.5)*0.02,
    dy: (Math.random()-.5)*0.02
  }));
  shooting = [];
}

function maybeShoot(time){
  if (reduced) return;
  if (Math.random() < 0.004) {
    shooting.push({ x: Math.random()*innerWidth*0.8 + innerWidth*0.1, y: Math.random()*innerHeight*0.35, life: 0, max: 700+Math.random()*500, len: 90+Math.random()*80 });
  }
  shooting = shooting.filter(s => s.life < s.max);
  for (const s of shooting) s.life += 16;
}

function drawStars(time=0){
  const w = innerWidth, h = innerHeight;
  sctx.clearRect(0,0,w,h);

  for (const m of motes) {
    m.x += m.dx; m.y += m.dy;
    if (m.x < -40) m.x = w+40; if (m.x > w+40) m.x = -40;
    if (m.y < -40) m.y = h+40; if (m.y > h+40) m.y = -40;
    const grad = sctx.createRadialGradient(m.x,m.y,0,m.x,m.y,m.r);
    grad.addColorStop(0, `rgba(150,190,255,${m.a})`);
    grad.addColorStop(1, 'rgba(150,190,255,0)');
    sctx.fillStyle = grad;
    sctx.beginPath(); sctx.arc(m.x,m.y,m.r,0,Math.PI*2); sctx.fill();
  }

  for(const s of stars){
    const tw = 0.72 + Math.sin(time*s.speed + s.phase) * 0.42;
    sctx.beginPath();
    sctx.arc(s.x, s.y, Math.max(0.1, s.r * tw), 0, Math.PI*2);
    sctx.fillStyle = `rgba(255,245,222,${(s.a*tw).toFixed(3)})`;
    sctx.fill();
    if (s.r > 1.18 && tw > 0.88) {
      sctx.strokeStyle = `rgba(255,218,160,${(s.a*0.42).toFixed(3)})`;
      sctx.lineWidth = 0.6;
      sctx.beginPath(); sctx.moveTo(s.x - 5, s.y); sctx.lineTo(s.x + 5, s.y); sctx.stroke();
      sctx.beginPath(); sctx.moveTo(s.x, s.y - 5); sctx.lineTo(s.x, s.y + 5); sctx.stroke();
    }
  }

  maybeShoot(time);
  for (const s of shooting) {
    const p = s.life / s.max;
    const x = s.x + p * 180;
    const y = s.y + p * 95;
    const g = sctx.createLinearGradient(x,y,x-s.len,y-s.len*0.45);
    g.addColorStop(0,'rgba(255,245,220,.92)');
    g.addColorStop(1,'rgba(255,245,220,0)');
    sctx.strokeStyle = g;
    sctx.lineWidth = 1.7;
    sctx.beginPath(); sctx.moveTo(x,y); sctx.lineTo(x-s.len,y-s.len*0.45); sctx.stroke();
  }
}

// ---- Real 3D globe -------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 0, 3.2);

const globeGroup = new THREE.Group();
scene.add(globeGroup);

const textureLoader = new THREE.TextureLoader();
const worldTexture = textureLoader.load(worldAssetUrl, () => root.classList.add("ready"));
worldTexture.colorSpace = THREE.SRGBColorSpace;
worldTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
worldTexture.wrapS = THREE.RepeatWrapping;

const globe = new THREE.Mesh(
  new THREE.SphereGeometry(1, 180, 140),
  new THREE.MeshStandardMaterial({ map: worldTexture, roughness: 0.96, metalness: 0.01 })
);
globeGroup.add(globe);

const cloudCanvas = document.createElement('canvas');
cloudCanvas.width = 1024; cloudCanvas.height = 512;
const cctx = cloudCanvas.getContext('2d');
for(let i=0;i<26;i++){
  const x=Math.random()*1024,y=Math.random()*512,r=60+Math.random()*120;
  const g=cctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,'rgba(255,255,255,0.20)'); g.addColorStop(1,'rgba(255,255,255,0)');
  cctx.fillStyle=g; cctx.beginPath(); cctx.arc(x,y,r,0,Math.PI*2); cctx.fill();
}
const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
cloudTexture.wrapS = THREE.RepeatWrapping;
cloudTexture.wrapT = THREE.RepeatWrapping;
const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(1.015, 120, 90),
  new THREE.MeshStandardMaterial({ map: cloudTexture, transparent: true, opacity: 0.18, depthWrite: false })
);
globeGroup.add(clouds);

scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x23131b, 2.6));
const sun = new THREE.DirectionalLight(0xffdfbd, 2.8); sun.position.set(-3.8, 2.5, 4.8); scene.add(sun);
const fill = new THREE.DirectionalLight(0x92a8ff, 1.1); fill.position.set(3.2, -1.3, 2.8); scene.add(fill);

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(1.055, 140, 110),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: { glowColor: { value: new THREE.Color(0x85c1ff) }, rimColor: { value: new THREE.Color(0xb18fff) }, intensity: { value: 0.54 } },
    vertexShader: `varying vec3 vNormal; varying vec3 vWorldPosition; void main(){ vNormal=normalize(normalMatrix*normal); vec4 worldPosition=modelMatrix*vec4(position,1.0); vWorldPosition=worldPosition.xyz; gl_Position=projectionMatrix*viewMatrix*worldPosition;}`,
    fragmentShader: `uniform vec3 glowColor; uniform vec3 rimColor; uniform float intensity; varying vec3 vNormal; varying vec3 vWorldPosition; void main(){ vec3 viewDir=normalize(cameraPosition-vWorldPosition); float fresnel=pow(1.0-max(dot(vNormal,viewDir),0.0),3.0); vec3 c=mix(glowColor,rimColor,clamp(fresnel*.7,0.0,1.0)); gl_FragColor=vec4(c,fresnel*intensity);}`
  })
);
globeGroup.add(atmosphere);

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

const territories = [
  { id: "hearthlands", name: "The Hearthlands", lat: 1, lon: -90, interactive: true },
  { id: "roadlands", name: "The Roadlands", lat: 4, lon: -140 },
  { id: "institutional", name: "Institutional Quarter", lat: 37, lon: -70 },
  { id: "littoral", name: "Littoral Coast", lat: -30, lon: -82 },
  { id: "river", name: "River Country", lat: -1, lon: -35 }
];

function coordinateToVector(lat, lon, radius = 1.032) {
  const u = 0.5 + lon / 360;
  const v = 0.5 - lat / 180;
  const theta = u * Math.PI * 2;
  const phi = v * Math.PI;
  return new THREE.Vector3(-Math.cos(theta) * Math.sin(phi) * radius, Math.cos(phi) * radius, Math.sin(theta) * Math.sin(phi) * radius);
}

const markerGroup = new THREE.Group(); globeGroup.add(markerGroup);
const labels = [];
territories.forEach(t => {
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(t.interactive ? 0.024 : 0.015, 24, 20),
    new THREE.MeshBasicMaterial({ color: t.interactive ? 0xffc579 : 0xe6d4af })
  );
  marker.position.copy(coordinateToVector(t.lat, t.lon));
  marker.userData.territory = t;
  markerGroup.add(marker);

  let glow = null;
  if (t.interactive) {
    glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 24, 20),
      new THREE.MeshBasicMaterial({ color: 0xffc579, transparent: true, opacity: 0.23, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    glow.position.copy(marker.position);
    glow.userData.territory = t;
    markerGroup.add(glow);
  }

  const button = document.createElement("button");
  button.className = `territory-label ${t.interactive ? "primary" : ""}`;
  button.innerHTML = `<i></i><span>${t.name}</span>`;
  button.setAttribute("aria-label", t.interactive ? `Explore ${t.name}` : t.name);
  if (t.interactive) button.addEventListener("click", focusHearthlands);
  else button.disabled = true;
  labelLayer.appendChild(button);
  labels.push({ t, marker, glow, button });
});

let state = "orbit";
let rotX = -0.05;
let rotY = 0;
let velX = 0;
let velY = 0;
let dragging = false;
let dragStart = { x: 0, y: 0 };
let pointerStart = { x: 0, y: 0 };
let orbitDistance = 3.1;
let last = performance.now();
let descentStart = 0;
let descentDuration = reduced ? 200 : 4700;
let descentFromDistance = orbitDistance;
let descentFromRot = { x: rotX, y: rotY };
let lastInteractionAt = 0;
let currentDescentX = 50;
let currentDescentY = 50;

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  initStars();
}
addEventListener("resize", resize);
resize();

canvas.addEventListener("pointerdown", e => {
  if (state !== "orbit") return;
  dragging = true;
  lastInteractionAt = performance.now();
  dragStart = { x: e.clientX, y: e.clientY };
  pointerStart = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
  root.classList.add("dragging");
});
canvas.addEventListener("pointermove", e => {
  if (!dragging || state !== "orbit") return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  const sx = 0.0043;
  rotY += dx * sx;
  rotX += dy * sx;
  rotX = THREE.MathUtils.clamp(rotX, -0.65, 0.65);
  velY = dx * 0.001;
  velX = dy * 0.001;
  dragStart = { x: e.clientX, y: e.clientY };
  lastInteractionAt = performance.now();
});
function releaseDrag(e){
  if (dragging && Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) < 7 && state === 'orbit') {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const intersects = raycaster.intersectObjects(markerGroup.children, false);
    const hit = intersects.find(x => x.object.userData.territory?.interactive);
    if (hit) focusHearthlands();
  }
  dragging = false; root.classList.remove("dragging"); lastInteractionAt = performance.now();
}
canvas.addEventListener("pointerup", releaseDrag);
canvas.addEventListener("pointercancel", e => { dragging = false; root.classList.remove('dragging'); });
canvas.addEventListener("wheel", e => {
  if (state !== "orbit") return;
  e.preventDefault();
  orbitDistance = THREE.MathUtils.clamp(orbitDistance + e.deltaY * 0.00135, 2.15, 4.05);
  lastInteractionAt = performance.now();
}, { passive: false });

function focusHearthlands() {
  if (state !== "orbit") return;
  state = "focus";
  root.dataset.state = "focus";
  focusPanel.querySelector(".enter").focus({ preventScroll: true });
}
function closeFocus() { if (state === 'focus') { state = 'orbit'; root.dataset.state = 'orbit'; } }
document.querySelector(".close-focus").addEventListener("click", closeFocus);
document.querySelector(".enter").addEventListener("click", beginDescent);
document.querySelector(".return-world").addEventListener("click", () => {
  state = "orbit"; root.dataset.state = "orbit"; orbitDistance = 3.1; rotX = -0.05; rotY = 0; camera.position.set(0,0,orbitDistance); camera.fov=34; camera.updateProjectionMatrix(); flatmap.style.clipPath='circle(0% at 50% 50%)'; flatmap.style.opacity='0'; flatmapArt.style.opacity='0.95'; placeSheet.classList.remove('open');
});

function beginDescent() {
  const hearthLabel = labels.find(x => x.t.id === "hearthlands")?.button.getBoundingClientRect();
  if (hearthLabel) {
    currentDescentX = ((hearthLabel.left + hearthLabel.width/2) / innerWidth) * 100;
    currentDescentY = ((hearthLabel.top + hearthLabel.height/2) / innerHeight) * 100;
  }
  state = 'descent'; root.dataset.state = 'descent'; descentStart = performance.now(); descentFromDistance = camera.position.z; descentFromRot = { x: rotX, y: rotY }; placeSheet.classList.remove('open'); root.style.setProperty('--focus-x', currentDescentX.toFixed(2)+'%'); root.style.setProperty('--focus-y', currentDescentY.toFixed(2)+'%');
}

function smoothstep(t){ return t*t*(3-2*t); }
function easeInOutCubic(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
function updateDescent(now) {
  const raw = Math.min(1, (now - descentStart) / descentDuration);
  const p = easeInOutCubic(raw);
  rotX = THREE.MathUtils.lerp(descentFromRot.x, -0.03, smoothstep(Math.min(1, raw * 1.02)));
  rotY = THREE.MathUtils.lerp(descentFromRot.y, 0, smoothstep(Math.min(1, raw * 1.08)));
  camera.position.z = THREE.MathUtils.lerp(descentFromDistance, 0.98, p);
  camera.fov = THREE.MathUtils.lerp(34, 58, smoothstep(raw)); camera.updateProjectionMatrix();
  const reveal = raw < 0.38 ? 0 : Math.pow((raw - 0.38) / 0.62, 1.02);
  flatmap.style.clipPath = `circle(${(reveal*150).toFixed(2)}% at ${currentDescentX.toFixed(2)}% ${currentDescentY.toFixed(2)}%)`;
  flatmap.style.opacity = `${Math.min(1, reveal * 1.1)}`;
  flatmapArt.style.transform = `scale(${(1.15 - reveal*0.11).toFixed(3)})`;
  flatmapArt.style.opacity = `${0.8 + reveal * 0.2}`;
  root.style.setProperty('--descent', raw.toFixed(3));
  if (raw >= 1) { state = 'hearth'; root.dataset.state = 'hearth'; flatmap.style.clipPath='circle(150% at 50% 50%)'; flatmap.style.opacity='1'; flatmapArt.style.transform='scale(1.04)'; camera.fov=34; camera.updateProjectionMatrix(); }
}

function updateLabels(now) {
  const cameraDir = camera.position.clone().normalize();
  labels.forEach(({ t, marker, glow, button }) => {
    const world = marker.getWorldPosition(new THREE.Vector3());
    const normal = world.clone().normalize();
    const front = normal.dot(cameraDir) > (t.interactive ? 0.03 : 0.12);
    const projected = world.project(camera);
    const x = (projected.x * 0.5 + 0.5) * innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * innerHeight;
    button.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    button.style.opacity = front && state !== 'hearth' ? '1' : '0';
    button.style.pointerEvents = front && state === 'orbit' && !button.disabled ? 'auto' : 'none';
    if (glow) {
      glow.material.opacity = front ? (0.20 + (Math.sin(now*0.003)+1)*0.08) : 0.0;
      marker.material.color.set(front ? 0xffcc7f : 0xc9b597);
    }
  });
}

function animate(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; drawStars(now);
  if (state === 'orbit') {
    if (!dragging) {
      rotX += velX; rotY += velY; velX *= 0.93; velY *= 0.93;
      const autoRotateAllowed = now - lastInteractionAt > 1500;
      if (autoRotateAllowed && Math.abs(velX)+Math.abs(velY) < 0.0017) rotY += dt * 0.06;
    }
    rotX = THREE.MathUtils.clamp(rotX, -0.65, 0.65);
    camera.position.z += (orbitDistance - camera.position.z) * Math.min(1, dt * 5.5);
  } else if (state === 'focus') {
    rotX += (-0.03 - rotX) * Math.min(1, dt * 2.2);
    rotY += (0 - rotY) * Math.min(1, dt * 2.2);
    camera.position.z += (2.55 - camera.position.z) * Math.min(1, dt * 3.1);
  } else if (state === 'descent') { updateDescent(now); }
  globeGroup.rotation.set(rotX, rotY, 0);
  clouds.rotation.y += 0.00055;
  atmosphere.material.uniforms.intensity.value = state === 'descent' ? 0.66 : 0.54;
  renderer.render(scene, camera);
  updateLabels(now);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// ---- Hearthlands exploration --------------------------------------------
addEventListener('pointermove', e => { if (state !== 'hearth' || reduced) return; const x = e.clientX/innerWidth - 0.5; const y = e.clientY/innerHeight - 0.5; flatmapArt.style.transform = `scale(1.04) translate(${(-x*14).toFixed(1)}px, ${(-y*9).toFixed(1)}px)`; });
const layerButtons = [...document.querySelectorAll('.layer-switch button')];
layerButtons.forEach(btn => btn.addEventListener('click', ()=>{ root.dataset.layer = btn.dataset.show; layerButtons.forEach(b=>b.classList.toggle('active', b===btn)); }));
document.querySelectorAll('.map-marker').forEach(marker => marker.addEventListener('click', ()=>{ const title = marker.dataset.place; placeSheet.querySelector('h2').textContent = title; placeSheet.querySelector('p:last-of-type').textContent = title === 'Fox' ? 'A recurring symbolic presence. The full source-dream evidence and reading belong to the evidence layer rather than the painted map itself.' : 'A named place carried forward from the v57 Atlas. The map locates it spatially; the evidence-led reading remains a separate layer.'; placeSheet.classList.add('open'); }));
document.querySelector('.close-place').addEventListener('click', ()=> placeSheet.classList.remove('open'));
