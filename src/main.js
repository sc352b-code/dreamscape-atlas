import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const COSMIC_CHUNKS = [
  "/assets/generated/cosmic-00.b64",
  "/assets/generated/cosmic-01.b64",
  "/assets/generated/cosmic-02.b64",
  "/assets/generated/cosmic-03.b64",
];

async function imageFromChunks(paths, mime = "image/avif") {
  const parts = await Promise.all(paths.map(async (path) => {
    const response = await fetch(path, { cache: "force-cache" });
    if (!response.ok) throw new Error(`Missing visual asset ${path}`);
    return (await response.text()).trim();
  }));
  const raw = atob(parts.join(""));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

const ASSETS = {
  world: "/assets/world-equirectangular.png",
  hearthlands: "/assets/hearthlands-flatmap.png",
};

// Corpus-derived territory model. The art coordinates deliberately map each analytical
// territory to a visual region with matching character rather than arbitrary decoration.
const TERRITORIES = [
  {
    id: "hearthlands",
    name: "The Hearthlands",
    subtitle: "Where belonging keeps changing shape",
    dreams: 213,
    lat: 25,
    lon: 0,
    interactive: true,
    cues: ["homes", "gardens", "warm light", "family", "belonging"],
  },
  {
    id: "roadlands",
    name: "The Roadlands",
    lat: 15,
    lon: 36,
    cues: ["roads", "journeys", "movement", "crossings"],
  },
  {
    id: "institutional",
    name: "Institutional Quarter",
    lat: 58,
    lon: 68,
    cues: ["formal buildings", "systems", "authority", "public space"],
  },
  {
    id: "littoral",
    name: "Littoral Coast",
    lat: -29,
    lon: 119,
    cues: ["coast", "islands", "shorelines", "sea"],
  },
  {
    id: "river",
    name: "River Country",
    lat: 15,
    lon: -79,
    cues: ["rivers", "bridges", "waterways", "flow"],
  },
];

const HEARTHLANDS_PLACES = [
  { id: "family", name: "Family Home", x: 12, y: 58, kind: "place" },
  { id: "childhood", name: "Cambridge Road Childhood House", x: 29, y: 47, kind: "place" },
  { id: "present", name: "Current / Present House", x: 45, y: 61, kind: "place" },
  { id: "many", name: "The Large Many-Roomed House", x: 62, y: 19, kind: "place" },
  { id: "unfamiliar", name: "The Unfamiliar House", x: 83, y: 45, kind: "place" },
  { id: "fox", name: "Fox", x: 8, y: 78, kind: "symbol" },
];

const app = document.querySelector("#app");
app.innerHTML = `
<main class="atlas" data-state="orbit" data-layer="places">
  <div class="cosmic-art" aria-hidden="true"><img alt="" /></div>
  <canvas id="starscape" class="starscape" aria-hidden="true"></canvas>
  <div class="cosmic-veil" aria-hidden="true"></div>

  <header class="topbar glass-lite">
    <div class="brand"><span class="sigil">✦</span><div><b>DREAMSCAPE</b><small>DREAM ATLAS</small></div></div>
    <nav class="mainnav" aria-label="Primary"><a class="active">World</a><a>Journal</a><a>Insights</a><a>Collections</a></nav>
    <div class="stats"><span>✶ 213 dreams</span><span>☾ 5 mapped places</span></div>
  </header>

  <aside class="left-poem glass-lite">
    <p>A world<br>shaped by your<br>dreams.</p>
    <small>Explore<br>remember<br>belong</small>
  </aside>

  <div class="globe-stage" aria-label="Interactive Dream Atlas globe">
    <canvas id="globe"></canvas>
    <div class="territory-labels"></div>
    <div class="orbit-help">Drag to rotate · scroll to move closer · select a territory to enter</div>
    <div class="bottom-quote">“The same world, again and again,<br>but always new.”</div>
  </div>

  <aside class="focus-panel glass" aria-live="polite">
    <button class="close-focus" aria-label="Close territory">×</button>
    <p class="roman">I · THE DOMESTIC HEART</p>
    <h1>The Hearthlands</h1>
    <p class="subtitle">Where belonging keeps changing shape</p>
    <div class="rule"></div>
    <p class="body">A warm domestic territory shaped from recurring homes, gardens, family settings, firelight, memory and belonging across the dream corpus.</p>
    <div class="focus-meta"><span><b>213</b> dreams here</span><span><b>5</b> mapped places</span><span><b>37</b> recurring symbols</span></div>
    <div class="theme-pills"><span>Home</span><span>Family</span><span>Gardens</span><span>Warm light</span><span>Fox</span></div>
    <button class="enter">Travel into The Hearthlands <span>→</span></button>
  </aside>

  <div class="descent-copy" aria-hidden="true"><span>TRAVELLING INTO</span><b>THE HEARTHLANDS</b></div>

  <section class="flatmap-scene" aria-label="The Hearthlands flatmap">
    <div class="flatmap-world">
      <img class="flatmap-art" src="${ASSETS.hearthlands}" alt="A richly illustrated view of The Hearthlands" />
      <div class="flatmap-wash"></div>
      <div class="painted-motifs" aria-hidden="true">
        <span class="painted-motif motif-window"><svg viewBox="0 0 32 32"><rect x="7" y="5" width="18" height="22" rx="2"/><path d="M16 5v22M7 16h18"/></svg></span>
        <span class="painted-motif motif-lantern"><svg viewBox="0 0 32 32"><path d="M11 9h10l3 5-2 12H10L8 14zM12 9c0-5 8-5 8 0M13 14h6v8h-6z"/></svg></span>
        <span class="painted-motif motif-gate"><svg viewBox="0 0 32 32"><path d="M7 27V12c5-8 13-8 18 0v15M11 27V14c3-5 7-5 10 0v13"/></svg></span>
        <span class="painted-motif motif-bridge"><svg viewBox="0 0 32 32"><path d="M4 23c7-13 17-13 24 0M4 23h24M9 19v4M16 15v8M23 19v4"/></svg></span>
      </div>
      <div class="glint g1"></div><div class="glint g2"></div><div class="glint g3"></div><div class="glint g4"></div>
      <div class="flatmap-markers"></div>
    </div>

    <header class="hearth-bar glass-lite">
      <button class="return-world">← Return to the world</button>
      <div class="hearth-heading"><b>The Hearthlands</b><small>213 dreams</small></div>
      <div class="layer-switch" role="group" aria-label="Map layer">
        <button data-show="places" class="active">Places</button><button data-show="symbols">Symbols</button>
      </div>
    </header>

    <div class="arrival-whisper"><span>THE HEARTHLANDS</span><b>Homes, gardens, paths and warm lights gather into one remembered landscape.</b></div>
  </section>

  <aside class="place-sheet glass" aria-live="polite">
    <button class="close-place" aria-label="Close place">×</button>
    <p class="roman">THE HEARTHLANDS</p>
    <h2>Family Home</h2>
    <p>The map locates this recurring place spatially. Its full evidence-led reading remains a separate layer.</p>
  </aside>

  <div class="vignette"></div>
</main>`;

const root = document.querySelector(".atlas");
const canvas = document.querySelector("#globe");
const labelLayer = document.querySelector(".territory-labels");
const focusPanel = document.querySelector(".focus-panel");
const flatmapScene = document.querySelector(".flatmap-scene");
const flatmapWorld = document.querySelector(".flatmap-world");
const flatmapArt = document.querySelector(".flatmap-art");
const flatmapMarkers = document.querySelector(".flatmap-markers");
const placeSheet = document.querySelector(".place-sheet");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const cosmicImage = document.querySelector(".cosmic-art img");
imageFromChunks(COSMIC_CHUNKS).then((url) => { cosmicImage.src = url; }).catch((error) => {
  console.warn("Cosmic artwork unavailable; live starfield fallback remains active.", error);
});

// -------------------------------------------------------------------------
// Celestial surround: authored art + live twinkling stars.
// --------------------------------------------------------------------------------
const starsCanvas = document.querySelector("#starscape");
const sctx = starsCanvas.getContext("2d");
let stars = [];
let dust = [];
let shootingStars = [];
let cosmicPointer = { x: 0, y: 0 };

function initStars() {
  const w = innerWidth;
  const h = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  starsCanvas.width = w * dpr;
  starsCanvas.height = h * dpr;
  starsCanvas.style.width = `${w}px`;
  starsCanvas.style.height = `${h}px`;
  sctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.max(220, Math.min(620, Math.round((w * h) / 4800)));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.2 + Math.random() * 1.5,
    alpha: 0.12 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
    speed: 0.00025 + Math.random() * 0.0015,
    depth: 0.25 + Math.random() * 0.9,
  }));

  dust = Array.from({ length: 24 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 12 + Math.random() * 34,
    alpha: 0.012 + Math.random() * 0.026,
    dx: (Math.random() - 0.5) * 0.018,
    dy: (Math.random() - 0.5) * 0.012,
  }));
  shootingStars = [];
}

function drawStars(time) {
  const w = innerWidth;
  const h = innerHeight;
  sctx.clearRect(0, 0, w, h);

  for (const d of dust) {
    d.x += d.dx; d.y += d.dy;
    if (d.x < -60) d.x = w + 60; if (d.x > w + 60) d.x = -60;
    if (d.y < -60) d.y = h + 60; if (d.y > h + 60) d.y = -60;
    const dx = d.x + cosmicPointer.x * 7;
    const dy = d.y + cosmicPointer.y * 5;
    const g = sctx.createRadialGradient(dx, dy, 0, dx, dy, d.r);
    g.addColorStop(0, `rgba(160,205,255,${d.alpha})`);
    g.addColorStop(1, "rgba(160,205,255,0)");
    sctx.fillStyle = g;
    sctx.beginPath();
    sctx.arc(dx, dy, d.r, 0, Math.PI * 2);
    sctx.fill();
  }

  for (const s of stars) {
    const pulse = 0.68 + Math.sin(time * s.speed + s.phase) * 0.36;
    const r = Math.max(0.1, s.r * pulse);
    const sx = s.x + cosmicPointer.x * 10 * s.depth;
    const sy = s.y + cosmicPointer.y * 7 * s.depth;
    sctx.fillStyle = `rgba(255,245,220,${Math.max(0.04, s.alpha * pulse)})`;
    sctx.beginPath();
    sctx.arc(sx, sy, r, 0, Math.PI * 2);
    sctx.fill();

    if (s.r > 1.2 && pulse > 0.86) {
      sctx.strokeStyle = `rgba(255,218,158,${s.alpha * 0.38})`;
      sctx.lineWidth = 0.55;
      sctx.beginPath();
      sctx.moveTo(sx - 5, sy);
      sctx.lineTn(sx + 5, sy);
      sctx.moveTo(sx, sy - 5);
      sctx.lineTo(sx, sy + 5);
      sctx.stroke();
    }
  }

  if (!reduced && Math.random() < 0.0018 && shootingStars.length < 2) {
    shootingStars.push({ x: Math.random() * w * 0.75, y: Math.random() * h * 0.36, life: 0, speed: 12 + Math.random() * 6, len: 70 + Math.random() * 70 });
  }
  shootingStars = shootingStars.filter((shot) => shot.life < 1);
  for (const shot of shootingStars) {
    shot.life += 0.018;
    const x = shot.x + shot.life * shot.speed * 12;
    const y = shot.y + shot.life * shot.speed * 5;
    const grad = sctx.createLinearGradient(x, y, x - shot.len, y - shot.len * 0.42);
    grad.addColorStop(0, `rgba(255,244,220,${1 - shot.life})`);
    grad.addColorStop(1, "rgba(255,244,220,0)");
    sctx.strokeStyle = grad; sctx.lineWidth = 1.25;
    sctx.beginPath(); sctx.moveTo(x, y); sctx.lineTo(x - shot.len, y - shot.len * 0.42); sctx.stroke();
  }
}

// -------------------------------------------------------------------------
// Real 3D globe. No ring, halo, atmosphere shell, or geometry around it.
// --------------------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 0, 3.05);

const globeGroup = new THREE.Group();
scene.add(globeGroup);

const textureLoader = new THREE.TextureLoader();
const worldTexture = textureLoader.load(ASSETS.world, () => root.classList.add("ready"));
worldTexture.colorSpace = THREE.SRGBColorSpace;
worldTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
worldTexture.wrapS = THREE.RepeatWrapping;
worldTexture.minFilter = THREE.LinearMipmapLinearFilter;
worldTexture.magFilter = THREE.LinearFilter;
worldTexture.generateMipmaps = true;

const globeMaterial = new THREE.MeshStandardMaterial({
  map: worldTexture,
  emissive: new THREE.Color(0xffffff),
  emissiveMap: worldTexture,
  emissiveIntensity: 0.12,
  roughness: 0.93,
  metalness: 0,
});
const globe = new THREE.Mesh(new THREE.SphereGeometry(1, 192, 144), globeMaterial);
globeGroup.add(globe);

scene.add(new THREE.HemisphereLight(0xc9d8ff, 0x20111c, 2.3));
const keyLight = new THREE.DirectionalLight(0xffddb7, 2.4);
keyLight.position.set(-3.6, 2.8, 4.8);
scene.add(keyLight);
const coolFill = new THREE.DirectionalLight(0x8ba6ff, 0.7);
coolFill.position.set(3.2, -1.4, 2.7);
scene.add(coolFill);
function coordinateToVector(lat, lon, radius = 1.022) {
  const u = 0.5 + lon / 360;
  const v = 0.5 - lat / 180;
  const theta = u * Math.PI * 2;
  const phi = v * Math.PI;
  return new THREE.Vector3(
    -Math.cos(theta) * Math.sin(phi) * radius,
    Math.cos(phi) * radius,
    Math.sin(theta) * Math.sin(phi) * radius
  );
}

const markerGroup = new THREE.Group();
globeGroup.add(markerGroup);
const markers = [];

for (const territory of TERRITORIES) {
  const anchor = coordinateToVector(territory.lat, territory.lon);
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(territory.interactive ? 0.022 : 0.014, 20, 16),
    new THREE.MeshBasicMaterial({ color: territory.interactive ? 0xffc777 : 0xe9dabf })
  );
  dot.position.copy(anchor);
  dot.userData.territory = territory;
  markerGroup.add(dot);

  // Larger invisible hit target makes Hearthlands reliable without changing the visual marker.
  let hit = null;
  if (territory.interactive) {
    hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 24, 20),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hit.position.copy(anchor);
    hit.userData.territory = territory;
    markerGroup.add(hit);
  }

  const label = document.createElement("button");
  label.className = `territory-label ${territory.interactive ? "primary" : ""}`;
  label.innerHTML = `<di></i><span>${territory.name}</span>`;
  label.disabled = !territory.interactive;
  label.title = territory.cues.join("·");
  if (territory.interactive) label.addEventListener("click", focusHearthlands);
  labelLayer.appendChild(label);
  markers.push({ territory, dot, hit, label });
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let state = "orbit";
let rotX = -0.06;
let rotY = -Math.PI / 2;
let velX = 0;
let velY = 0;
let dragging = false;
let dragStart = { x: 0, y: 0 };
let pointerStart = { x: 0, y: 0 };
let orbitDistance = 3.05;
let lastInteractionAt = 0;
let lastFrame = performance.now();
let descentStart = 0;
let descentFrom = { distance: orbitDistance, rotX, rotY };
const descentDuration = reduced ? 200 : 4500;
let descentPoint = { x: 50, y: 50 };

function targetWorldPoint(marker) {
  return marker.dot.getWorldPosition(new THREE.Vector3());
}

function projectPoint(world) {
  const p = world.clone().project(camera);
  return {
    x: (p.x * 0.5 + 0.5) * innerWidth,
    y: (-p.y * 0.5 + 0.5) * innerHeight,
  };
}

function markerVisible(world) {
  const normal = world.clone().normalize();
  const viewDir = camera.position.clone().sub(world).normalize();
  return normal.dot(viewDir) > 0.03;
}

function updateTerritoryLabels(now) {
  for (const item of markers) {
    const world = targetWorldPoint(item);
    const screen = projectPoint(world);
    const visible = markerVisible(world) && state !== "hearth";
    item.label.style.left = `${screen.x}px`;
    item.label.style.top = `${screen.y}px`;
    item.label.style.opacity = visible ? "1" : "0";
    item.label.style.pointerEvents = visible && state === "orbit" && item.territory.interactive ? "auto" : "none";
    if (item.territory.interactive) {
      const pulse = 0.84 + Math.sin(now * 0.0035) * 0.16;
      item.dot.scale.setScalar(pulse);
    }
  }
}

function focusHearthlands() {
  if (state !== "orbit") return;
  state = "focus";
  root.dataset.state = "focus";
  lastInteractionAt = performance.now();
}

function beginDescent() {
  if (state !== "focus") return;
  const hearth = markers.find((m) => m.territory.id === "hearthlands");
  const p = projectPoint(targetWorldPoint(hearth));
  descentPoint = { x: (p.x / innerWidth) * 100, y: (p.y / innerHeight) * 100 };
  root.style.setProperty("--focus-x", `${descentPoint.x}%`);
  root.style.setProperty("--focus-y", `${descentPoint.y}%`);
  descentFrom = { distance: camera.position.z, rotX, rotY };
  descentStart = performance.now();
  state = "descent";
  root.dataset.state = "descent";
}

function returnToWorld() {
  state = "orbit";
  root.dataset.state = "orbit";
  rotX = -0.06;
  rotY = -Math.PI / 2;
  orbitDistance = 3.05;
  camera.position.z = orbitDistance;
  camera.fov = 34;
  camera.updateProjectionMatrix();
  flatmapScene.style.opacity = "0";
  flatmapScene.style.clipPath = "circle(0% at 50% 50%)";
  placeSheet.classList.remove("open");
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function updateDescent(now) {
  const raw = Math.min(1, (now - descentStart) / descentDuration);
  const p = easeInOutCubic(raw);
  rotX = THREE.MathUtils.lerp(descentFrom.rotX, -0.06, p);
  rotY = THREE.MathUtils.lerp(descentFrom.rotY, -Math.PI / 2, p);
  camera.position.z = THREE.MathUtils.lerp(descentFrom.distance, 1.02, p);
  camera.fov = THREE.MathUtils.lerp(34, 55, p);
  camera.updateProjectionMatrix();
  const reveal = raw < 0.38 ? 0 : Math.pow((raw - 0.38) / 0.62, 1.06);
  flatmapScene.style.opacity = `${Math.min(1, reveal * 1.1)}`;
  flatmapScene.style.clipPath = `circle(${reveal * 150}% at ${descentPoint.x}% ${descentPoint.y}%)`;
  root.style.setProperty("--descent", raw.toFixed(3));
  if (raw >= 1) {
    state = "hearth";
    root.dataset.state = "hearth";
    flatmapScene.style.opacity = "1";
    flatmapScene.style.clipPath = "circle(150% at 50% 50%)";
    layoutFlatmap();
  }
}

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  initStars();
  layoutFlatmap();
}
addEventListener("resize", resize);

canvas.addEventListener("pointerdown", (event) => {
  if (state !== "orbit") return;
  dragging = true;
  dragStart = { x: event.clientX, y: event.clientY };
  pointerStart = { ...dragStart };
  lastInteractionAt = performance.now();
  canvas.setPointerCapture(event.pointerId);
  root.classList.add("dragging");
});

canvas.addEventListener("pointermove", (event) => {
  if (!dragging || state !== "orbit") return;
  const dx = event.clientX - dragStart.x;
  const dy = event.clientY - dragStart.y;
  rotY += dx * 0.0042;
  rotX += dy * 0.0042;
  rotX = THREE.MathUtils.clamp(rotX, -0.68, 0.68);
  velY = dx * 0.001;
  velX = dy * 0.001;
  dragStart = { x: event.clientX, y: event.clientY };
  lastInteractionAt = performance.now();
});

function finishPointer(event) {
  if (!dragging) return;
  const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
  dragging = false;
  root.classList.remove("dragging");
  lastInteractionAt = performance.now();
  if (moved > 8 || state !== "orbit") return;
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hearth = markers.find((m) => m.territory.id === "hearthlands");
  const hits = raycaster.intersectObjects([hearth.hit, hearth.dot].filter(Boolean), false);
  if (hits.length) focusHearthlands();
}
canvas.addEventListener("pointerup", finishPointer);
canvas.addEventListener("pointercancel", () => {
  dragging = false;
  root.classList.remove("dragging");
});

canvas.addEventListener("wheel", (event) => {
  if (state !== "orbit") return;
  event.preventDefault();
  orbitDistance = THREE.MathUtils.clamp(orbitDistance + event.deltaY * 0.00135, 2.15, 4.05);
  lastInteractionAt = performance.now();
}, { passive: false });

document.querySelector(".close-focus").addEventListener("click", () => {
  if (state === "focus") {
    state = "orbit";
    root.dataset.state = "orbit";
  }
});
document.querySelector(".enter").addEventListener("click", beginDescent);
document.querySelector(".return-world").addEventListener("click", returnToWorld);

for (const place of HEARTHLANDS_PLACES) {
  const button = document.createElement("button");
  button.className = `map-marker ${place.kind}`;
  button.dataset.place = place.name;
  button.style.left = `${place.x}%`;
  button.style.top = `${place.y}%`;
  button.innerHTML = `<i></i><span>${place.name}</span>`;
  button.addEventListener("click", () => {
    placeSheet.querySelector("h2").textContent = place.name;
    placeSheet.querySelector("p:last-of-type").textContent = place.kind === "symbol"
      ? "A recurring symbolic presence. The full source-dream evidence and reading remain separate from the painted map layer."
      : "A named recurring place from the Hearthlands corpus. The painted map locates it spatially; its evidence-led reading remains a separate layer.";
    placeSheet.classList.add("open");
  });
  flatmapMarkers.appendChild(button);
}

document.querySelector(".close-place").addEventListener("click", () => placeSheet.classList.remove("open"));
const layerButtons = [...document.querySelectorAll(".layer-switch button")];
layerButtons.forEach((button) => button.addEventListener("click", () => {
  root.dataset.layer = button.dataset.show;
  layerButtons.forEach((b) => b.classList.toggle("active", b === button));
}));

function layoutFlatmap() {
  const ratio = 1672 / 941;
  const vw = innerWidth;
  const vh = innerHeight;
  let width = vw;
  let height = width / ratio;
  if (height < vh) {
    height = vh;
    width = height * ratio;
  }
  flatmapWorld.style.width = `${width * 1.02}px`;
  flatmapWorld.style.height = `${height * 1.02}px`;
  flatmapWorld.style.left = `${(vw - width * 1.02) / 2}px`;
  flatmapWorld.style.top = `${(vh - height * 1.02) / 2}px`;
}

addEventListener("pointermove", (event) => {
  cosmicPointer.x = (event.clientX / innerWidth - 0.5) * 2;
  cosmicPointer.y = (event.clientY / innerHeight - 0.5) * 2;
  root.style.setProperty("--cosmic-x", `${(-cosmicPointer.x * 9).toFixed(1)}px`);
  root.style.setProperty("--cosmic-y", `${(-cosmicPointer.y * 6).toFixed(1)}px`);
});

addEventListener("pointermove", (event) => {
  if (state !== "hearth" || reduced) return;
  const x = event.clientX / innerWidth - 0.5;
  const y = event.clientY / innerHeight - 0.5;
  flatmapWorld.style.transform = `translate(${(-x * 12).toFixed(1)}px, ${(-y * 8).toFixed(1)}px)`;
});

function animate(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  drawStars(now);
  if (state === "orbit") {
    if (!dragging) {
      rotX += velX;
      rotY += velY;
      velX *= 0.93;
      velY *= 0.93;
      if (now - lastInteractionAt > 1500 && Math.abs(velX) + Math.abs(velY) < 0.0018) {
        rotY += dt * 0.055;
      }
    }
    rotX = THREE.MathUtils.clamp(rotX, -0.68, 0.68);
    camera.position.z += (orbitDistance - camera.position.z) * Math.min(1, dt * 5.5);
  } else if (state === "focus") {
    rotX += (-0.06 - rotX) * Math.min(1, dt * 2.2);
    rotY += (-Math.PI / 2 - rotY) * Math.min(1, dt * 2.2);
    camera.position.z += (2.55 - camera.position.z) * Math.min(1, dt * 3.1);
  } else if (state === "descent") {
    updateDescent(now);
  }
  globeGroup.rotation.set(rotX, rotY, 0);
  renderer.render(scene, camera);
  updateTerritoryLabels(now);
  requestAnimationFrame(animate);
}

resize();
requestAnimationFrame(animate);
