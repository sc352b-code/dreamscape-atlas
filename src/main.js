import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const app = document.querySelector("#app");

async function loadEncodedArtwork(prefix, count) {
  const parts = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      fetch(`/assets/data-avif/${prefix}-${String(i).padStart(2, "0")}.b64`).then(r => {
        if (!r.ok) throw new Error(`Missing ${prefix} artwork chunk ${i}`);
        return r.text();
      })
    )
  );
  const binary = atob(parts.join(""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: "image/avif" }));
}

const [worldAssetUrl, hearthAssetUrl] = await Promise.all([
  loadEncodedArtwork("world", 7),
  loadEncodedArtwork("hearth", 11)
]);

app.innerHTML = `
<main class="atlas" data-state="orbit" data-layer="places">
  <div class="cosmos"></div>
  <div class="globe-stage" aria-label="Interactive Dream Atlas globe">
    <canvas id="globe"></canvas>
    <div class="territory-labels" aria-hidden="false"></div>
    <div class="orbit-title">
      <span class="sigil">✦</span>
      <div><b>DREAMSCAPE</b><small>DREAM ATLAS · 362 DREAMS</small></div>
    </div>
    <div class="orbit-help">Drag to rotate · scroll to move closer</div>
  </div>

  <aside class="focus-panel glass" aria-live="polite">
    <button class="close-focus" aria-label="Close territory">×</button>
    <p class="roman">I · THE DOMESTIC HEART</p>
    <h1>The Hearthlands</h1>
    <p class="subtitle">Where belonging keeps changing shape</p>
    <div class="rule"></div>
    <p class="body">The warm, mutable centre of the dream world: homes, family, intimacy, safety and change gather here.</p>
    <div class="focus-meta"><span><b>213</b> dreams here</span><span>5 mapped places in this slice</span></div>
    <button class="enter">Travel into The Hearthlands <span>→</span></button>
  </aside>

  <div class="descent-copy" aria-hidden="true"><span>TRAVELLING INTO</span><b>THE HEARTHLANDS</b></div>

  <section class="flatmap-scene" aria-label="The Hearthlands flatmap">
    <img class="flatmap-art" src="${hearthAssetUrl}" alt="A richly illustrated map of The Hearthlands" />
    <div class="flatmap-wash"></div>
    <div class="glint g1"></div><div class="glint g2"></div><div class="glint g3"></div><div class="glint g4"></div><div class="glint g5"></div>

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
    <p>This is a named location carried forward from the v57 Atlas. The full evidence-led reading remains separate from the map layer.</p>
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

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
camera.position.set(0, 0, 3.15);

const globeGroup = new THREE.Group();
scene.add(globeGroup);

const textureLoader = new THREE.TextureLoader();
const worldTexture = textureLoader.load(worldAssetUrl, () => root.classList.add("ready"));
worldTexture.colorSpace = THREE.SRGBColorSpace;
worldTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
worldTexture.wrapS = THREE.RepeatWrapping;

const globe = new THREE.Mesh(
  new THREE.SphereGeometry(1, 128, 96),
  new THREE.MeshStandardMaterial({ map: worldTexture, roughness: 0.92, metalness: 0.02 })
);
globeGroup.add(globe);

scene.add(new THREE.HemisphereLight(0xbcc8ff, 0x2b1529, 2.25));
const sun = new THREE.DirectionalLight(0xffd2a3, 2.35);
sun.position.set(-3.5, 2.4, 4.5);
scene.add(sun);
const fill = new THREE.DirectionalLight(0x8599ff, 0.75);
fill.position.set(3, -1, 2);
scene.add(fill);

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(1.075, 96, 64),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: { glowColor: { value: new THREE.Color(0x8ab6ff) }, intensity: { value: 0.72 } },
    vertexShader: `
      varying vec3 vNormal; varying vec3 vWorldPosition;
      void main(){
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPosition = modelMatrix * vec4(position,1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }`,
    fragmentShader: `
      uniform vec3 glowColor; uniform float intensity;
      varying vec3 vNormal; varying vec3 vWorldPosition;
      void main(){
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.1);
        gl_FragColor = vec4(glowColor, fresnel * intensity);
      }`
  })
);
globeGroup.add(atmosphere);

const halo = new THREE.Mesh(
  new THREE.RingGeometry(1.07, 1.14, 128),
  new THREE.MeshBasicMaterial({ color: 0x9a79ff, transparent: true, opacity: 0.1, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
);
halo.rotation.x = Math.PI / 2;
halo.scale.y = 0.93;
globeGroup.add(halo);

const territories = [
  { id: "hearthlands", name: "The Hearthlands", lat: 1, lon: 0, interactive: true },
  { id: "roadlands", name: "The Roadlands", lat: 4, lon: -48 },
  { id: "institutional", name: "Institutional Quarter", lat: 37, lon: 6 },
  { id: "littoral", name: "Littoral Coast", lat: -30, lon: 10 },
  { id: "river", name: "River Country", lat: -1, lon: 43 }
];

function coordinateToVector(lat, lon, radius = 1.035) {
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
const labels = [];
territories.forEach(t => {
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(t.interactive ? 0.025 : 0.017, 24, 18),
    new THREE.MeshBasicMaterial({ color: t.interactive ? 0xffc06d : 0xe9d3a8 })
  );
  marker.position.copy(coordinateToVector(t.lat, t.lon));
  marker.userData.territory = t;
  markerGroup.add(marker);

  const button = document.createElement("button");
  button.className = `territory-label ${t.interactive ? "primary" : ""}`;
  button.innerHTML = `<i></i><span>${t.name}</span>`;
  button.setAttribute("aria-label", t.interactive ? `Explore ${t.name}` : t.name);
  if (t.interactive) button.addEventListener("click", focusHearthlands);
  else button.disabled = true;
  labelLayer.appendChild(button);
  labels.push({ t, marker, button });
});

let state = "orbit";
let rotX = -0.08;
let rotY = -Math.PI / 2;
let velX = 0;
let velY = 0;
let dragging = false;
let dragStart = { x: 0, y: 0 };
let pointerOverGlobe = false;
let orbitDistance = 3.15;
let last = performance.now();
let descentStart = 0;
let descentDuration = reduced ? 180 : 3300;
let descentFromDistance = orbitDistance;
let descentFromRot = { x: rotX, y: rotY };

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

canvas.addEventListener("pointerenter", () => pointerOverGlobe = true);
canvas.addEventListener("pointerleave", () => pointerOverGlobe = false);
canvas.addEventListener("pointerdown", e => {
  if (state !== "orbit") return;
  dragging = true;
  dragStart = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
  root.classList.add("dragging");
});
canvas.addEventListener("pointermove", e => {
  if (!dragging || state !== "orbit") return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  const sx = 0.0045;
  rotY += dx * sx;
  rotX += dy * sx;
  rotX = THREE.MathUtils.clamp(rotX, -0.65, 0.65);
  velY = dx * 0.0009;
  velX = dy * 0.0009;
  dragStart = { x: e.clientX, y: e.clientY };
});
function releaseDrag(){ dragging = false; root.classList.remove("dragging"); }
canvas.addEventListener("pointerup", releaseDrag);
canvas.addEventListener("pointercancel", releaseDrag);
canvas.addEventListener("wheel", e => {
  if (state !== "orbit") return;
  e.preventDefault();
  orbitDistance = THREE.MathUtils.clamp(orbitDistance + e.deltaY * 0.0014, 2.35, 4.0);
}, { passive: false });

function focusHearthlands() {
  if (state !== "orbit") return;
  state = "focus";
  root.dataset.state = "focus";
  pointerOverGlobe = true;
  focusPanel.querySelector(".enter").focus({ preventScroll: true });
}

function closeFocus() {
  if (state !== "focus") return;
  state = "orbit";
  root.dataset.state = "orbit";
  pointerOverGlobe = false;
}

document.querySelector(".close-focus").addEventListener("click", closeFocus);
document.querySelector(".enter").addEventListener("click", beginDescent);

document.querySelector(".return-world").addEventListener("click", () => {
  state = "orbit";
  root.dataset.state = "orbit";
  orbitDistance = 3.15;
  rotX = -0.08;
  rotY = -Math.PI / 2;
  camera.position.set(0, 0, orbitDistance);
  flatmap.style.clipPath = "circle(0% at 50% 50%)";
  placeSheet.classList.remove("open");
});

function beginDescent() {
  state = "descent";
  root.dataset.state = "descent";
  descentStart = performance.now();
  descentFromDistance = camera.position.z;
  descentFromRot = { x: rotX, y: rotY };
  placeSheet.classList.remove("open");
}

function smoothstep(t){ return t * t * (3 - 2 * t); }
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

function updateDescent(now) {
  const raw = Math.min(1, (now - descentStart) / descentDuration);
  const p = easeOutCubic(raw);
  rotX = THREE.MathUtils.lerp(descentFromRot.x, 0.0, smoothstep(Math.min(1, raw * 1.25)));
  rotY = THREE.MathUtils.lerp(descentFromRot.y, -Math.PI / 2, smoothstep(Math.min(1, raw * 1.25)));
  camera.position.z = THREE.MathUtils.lerp(descentFromDistance, 1.12, p);
  camera.fov = THREE.MathUtils.lerp(37, 48, smoothstep(raw));
  camera.updateProjectionMatrix();

  const reveal = raw < 0.58 ? 0 : Math.pow((raw - 0.58) / 0.42, 1.2);
  flatmap.style.clipPath = `circle(${reveal * 82}% at 50% 50%)`;
  flatmap.style.opacity = `${Math.min(1, reveal * 1.2)}`;
  root.style.setProperty("--descent", raw.toFixed(3));

  if (raw >= 1) {
    state = "hearth";
    root.dataset.state = "hearth";
    flatmap.style.clipPath = "circle(150% at 50% 50%)";
    flatmap.style.opacity = "1";
    camera.fov = 37;
    camera.updateProjectionMatrix();
  }
}

function updateLabels() {
  const cameraDir = camera.position.clone().normalize();
  labels.forEach(({ marker, button }) => {
    const world = marker.getWorldPosition(new THREE.Vector3());
    const normal = world.clone().normalize();
    const front = normal.dot(cameraDir) > 0.12;
    const projected = world.project(camera);
    const x = (projected.x * 0.5 + 0.5) * innerWidth;
    const y = (-projected.y * 0.5 + 0.5) * innerHeight;
    button.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    button.style.opacity = front && state !== "hearth" ? "1" : "0";
    button.style.pointerEvents = front && state === "orbit" && !button.disabled ? "auto" : "none";
  });
}

function animate(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (state === "orbit") {
    if (!dragging) {
      rotX += velX;
      rotY += velY;
      velX *= 0.93;
      velY *= 0.93;
      if (!pointerOverGlobe && Math.abs(velX) + Math.abs(velY) < 0.0015) rotY += dt * 0.045;
    }
    rotX = THREE.MathUtils.clamp(rotX, -0.65, 0.65);
    camera.position.z += (orbitDistance - camera.position.z) * Math.min(1, dt * 5.5);
  } else if (state === "focus") {
    rotX += (0 - rotX) * Math.min(1, dt * 2.2);
    rotY += (-Math.PI / 2 - rotY) * Math.min(1, dt * 2.2);
    camera.position.z += (2.7 - camera.position.z) * Math.min(1, dt * 3.2);
  } else if (state === "descent") {
    updateDescent(now);
  }

  globeGroup.rotation.set(rotX, rotY, 0);
  atmosphere.material.uniforms.intensity.value = state === "descent" ? 0.95 : 0.72;
  halo.material.opacity = state === "descent" ? 0.17 : 0.1;
  halo.lookAt(camera.position);

  renderer.render(scene, camera);
  updateLabels();
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

addEventListener("pointermove", e => {
  if (state !== "hearth") return;
  const x = e.clientX / innerWidth - 0.5;
  const y = e.clientY / innerHeight - 0.5;
  flatmapArt.style.transform = `scale(1.035) translate(${(-x * 10).toFixed(1)}px, ${(-y * 7).toFixed(1)}px)`;
});

const layerButtons = [...document.querySelectorAll(".layer-switch button")];
layerButtons.forEach(btn => btn.addEventListener("click", () => {
  root.dataset.layer = btn.dataset.show;
  layerButtons.forEach(b => b.classList.toggle("active", b === btn));
}));

document.querySelectorAll(".map-marker").forEach(marker => marker.addEventListener("click", () => {
  const title = marker.dataset.place;
  placeSheet.querySelector("h2").textContent = title;
  placeSheet.querySelector("p:last-of-type").textContent = title === "Fox"
    ? "A recurring symbolic presence. The full source-dream evidence and reading belong to the evidence layer rather than the painted map itself."
    : "A named place carried forward from the v57 Atlas. The map locates it spatially; the evidence-led reading remains a separate layer.";
  placeSheet.classList.add("open");
}));
document.querySelector(".close-place").addEventListener("click", () => placeSheet.classList.remove("open"));
