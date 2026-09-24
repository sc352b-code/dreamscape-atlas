import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const root = document.querySelector("#app");
const response = await fetch("/worlds/natalie-world.json", { cache: "no-store" });
const blueprint = await response.json();
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const DPR = Math.min(devicePixelRatio || 1, 2);

root.innerHTML = [
  '<main class="natalie-cosmos" data-mode="orbit">',
  '<div class="nc-bg"><div class="nc-nebula n1"></div><div class="nc-nebula n2"></div><div class="nc-nebula n3"></div></div>',
  '<canvas class="nc-stars"></canvas><div class="nc-veil"></div>',
  '<button class="nc-back">← Sam’s Dreamscape</button>',
  '<header class="nc-head"><div class="nc-kicker">DREAMSCAPE · A WORLD MADE FROM DREAMS</div><h1>' + blueprint.title + '</h1><p>Six dream territories crystallised into one living cosmos.</p></header>',
  '<div class="nc-badge">Prototype corpus sample · final counts pending</div>',
  '<div class="nc-stage"><canvas id="natalie-gl"></canvas><div class="nc-labels"></div></div>',
  '<div class="nc-help"><span>✦</span> Drift closer · hover a world · click to enter its constellation</div>',
  '<div class="nc-tooltip"></div>',
  '<div class="nc-entering"><small>APPROACHING</small><b></b><em>The illustrated flat-map layer will open here.</em></div>',
  '<section class="nc-focus">',
    '<div class="nc-tarots"></div>',
    '<aside class="nc-focus-card">',
      '<button class="nc-close" aria-label="Close world">×</button>',
      '<div class="provisional">Prototype corpus sample · final count pending</div>',
      '<h2></h2><p class="nc-summary"></p>',
      '<div class="nc-motif-line"></div>',
      '<button class="nc-enter">Enter World <span>→</span></button>',
    '</aside>',
  '</section>',
  '<aside class="nc-reader">',
    '<button class="nc-close" aria-label="Close Tarot">×</button>',
    '<div class="nc-reader-ornament">☾ ✦ ☽</div>',
    '<div class="provisional">DREAMSCAPE TAROT · PROVISIONAL SYMBOL</div>',
    '<h3></h3><div class="rule"></div><p></p>',
    '<div class="nc-reader-foot">This card will inherit the full evidence-led Dreamscape Tarot architecture when Natalie’s complete corpus is processed.</div>',
  '</aside>',
  '</main>'
].join("");

document.querySelector(".nc-back").addEventListener("click", function () { location.href = "/"; });

const shell = document.querySelector(".natalie-cosmos");
const canvas = document.querySelector("#natalie-gl");
const labels = document.querySelector(".nc-labels");
const tooltip = document.querySelector(".nc-tooltip");
const focus = document.querySelector(".nc-focus");
const tarots = document.querySelector(".nc-tarots");
const reader = document.querySelector(".nc-reader");
const entering = document.querySelector(".nc-entering");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 12.5);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(DPR);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

scene.add(new THREE.HemisphereLight(0x9fb4df, 0x130d1c, 0.72));
const warmKey = new THREE.DirectionalLight(0xffd6a2, 3.1);
warmKey.position.set(-5.2, 4.2, 7.5);
scene.add(warmKey);
const coolFill = new THREE.DirectionalLight(0x758eea, 1.45);
coolFill.position.set(6.5, -3, 5);
scene.add(coolFill);
const rimLight = new THREE.PointLight(0x9c74d6, 20, 35);
rimLight.position.set(0, 7, -2);
scene.add(rimLight);

function seeded(id) {
  let h = 2166136261;
  for (const c of id) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hexRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: n >> 16 & 255, g: n >> 8 & 255, b: n & 255 };
}

function rgba(hex, a) {
  const c = hexRgb(hex);
  return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")";
}

function softBlob(ctx, x, y, rx, ry, color, alpha, blur) {
  ctx.save();
  ctx.filter = "blur(" + blur + "px)";
  ctx.fillStyle = rgba(color, alpha);
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function lineGlow(ctx, points, color, width, alpha) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = width;
  ctx.shadowColor = color;
  ctx.shadowBlur = width * 4;
  ctx.beginPath();
  points.forEach(function (p, i) {
    if (i === 0) ctx.moveTo(p[0], p[1]);
    else ctx.lineTo(p[0], p[1]);
  });
  ctx.stroke();
  ctx.restore();
}

function painterlyBase(ctx, w, r) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.fillStyle = w.palette[0];
  ctx.fillRect(0, 0, W, H);

  for (let band = 0; band < 8; band += 1) {
    const y = band * H / 8;
    const g = ctx.createLinearGradient(0, y, W, y + H / 5);
    g.addColorStop(0, rgba(w.palette[band % w.palette.length], 0.18));
    g.addColorStop(0.5, rgba(w.palette[(band + 1) % w.palette.length], 0.34));
    g.addColorStop(1, rgba(w.palette[(band + 2) % w.palette.length], 0.12));
    ctx.fillStyle = g;
    ctx.fillRect(0, y, W, H / 5 + 1);
  }

  ctx.globalCompositeOperation = "soft-light";
  for (let i = 0; i < 520; i += 1) {
    const x = r() * W;
    const y = r() * H;
    const rx = 6 + r() * 72;
    const ry = 3 + r() * 30;
    ctx.fillStyle = "rgba(255,245,225," + (0.015 + r() * 0.045) + ")";
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, r() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  const shade = ctx.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, "rgba(9,12,28,.22)");
  shade.addColorStop(0.45, "rgba(255,245,218,.035)");
  shade.addColorStop(1, "rgba(2,4,14,.34)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, W, H);
}

function paintMountains(ctx, r, colors, count, yMin, yMax) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  for (let i = 0; i < count; i += 1) {
    const cx = 100 + r() * (W - 200);
    const baseY = yMin * H + r() * (yMax - yMin) * H;
    const width = 70 + r() * 160;
    const height = 45 + r() * 150;
    const g = ctx.createLinearGradient(cx, baseY - height, cx, baseY);
    g.addColorStop(0, rgba(colors[2], 0.92));
    g.addColorStop(0.35, rgba(colors[1], 0.84));
    g.addColorStop(1, rgba(colors[0], 0.82));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(cx - width, baseY);
    ctx.lineTo(cx - width * 0.35, baseY - height * 0.4);
    ctx.lineTo(cx, baseY - height);
    ctx.lineTo(cx + width * 0.27, baseY - height * 0.52);
    ctx.lineTo(cx + width, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(colors[3], 0.16);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function paintLuminous(ctx, em, cloud, w, r) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  paintMountains(ctx, r, w.palette, 28, 0.3, 0.86);

  for (let i = 0; i < 14; i += 1) {
    const x = r() * W, y = H * (0.24 + r() * 0.52);
    softBlob(ctx, x, y, 90 + r() * 180, 18 + r() * 46, "#e9edf3", 0.16, 14);
    softBlob(cloud, x / 2, y / 2, 55 + r() * 90, 9 + r() * 25, "#ffffff", 0.2, 10);
  }

  const lake = ctx.createLinearGradient(0, H * 0.6, 0, H);
  lake.addColorStop(0, "rgba(164,202,217,.12)");
  lake.addColorStop(1, "rgba(22,59,84,.5)");
  ctx.fillStyle = lake;
  ctx.fillRect(W * 0.18, H * 0.68, W * 0.28, H * 0.15);

  for (let i = 0; i < 8; i += 1) {
    const x = W * (0.1 + i * 0.105);
    lineGlow(ctx, [[x, H * 0.18], [x + 50, H * 0.43]], i % 2 ? "#db9fd1" : "#8fc8e7", 5, 0.13);
    lineGlow(em, [[x / 2, H * 0.09], [(x + 50) / 2, H * 0.215]], i % 2 ? "#e4a8d9" : "#aadcf0", 2, 0.3);
  }
  softBlob(ctx, W * 0.74, H * 0.34, W * 0.17, H * 0.12, "#dfb767", 0.18, 32);
  softBlob(em, W * 0.37, H * 0.17, W * 0.1, H * 0.06, "#f2d58c", 0.25, 16);
}

function paintMessage(ctx, em, cloud, w, r) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  for (let i = 0; i < 24; i += 1) {
    const y = H * (0.22 + r() * 0.62);
    const x = 60 + r() * (W - 120);
    const ww = 45 + r() * 100;
    const hh = 16 + r() * 40;
    ctx.fillStyle = rgba(i % 2 ? w.palette[2] : w.palette[1], 0.2);
    ctx.fillRect(x, y, ww, hh);
    ctx.fillStyle = rgba("#d8caa4", 0.22);
    ctx.fillRect(x + ww * 0.2, y - hh * 1.7, ww * 0.6, hh * 1.7);
    ctx.beginPath();
    ctx.moveTo(x + ww * 0.13, y - hh * 1.7);
    ctx.lineTo(x + ww * 0.5, y - hh * 2.6);
    ctx.lineTo(x + ww * 0.87, y - hh * 1.7);
    ctx.fill();
  }
  for (let k = 0; k < 13; k += 1) {
    const pts = [];
    const y0 = H * (0.22 + r() * 0.58);
    for (let i = 0; i < 8; i += 1) pts.push([i * W / 7, y0 + Math.sin(i * 0.9 + k) * (12 + k)]);
    lineGlow(ctx, pts, "#d8c27e", 2.4, 0.16);
    lineGlow(em, pts.map(function (p) { return [p[0] / 2, p[1] / 2]; }), "#e9d18d", 1.5, 0.38);
  }
  for (let i = 0; i < 60; i += 1) {
    const x = r() * W, y = r() * H;
    em.fillStyle = "rgba(241,226,174," + (0.12 + r() * 0.22) + ")";
    em.fillRect(x / 2, y / 2, 1.5, 1.5);
  }
  for (let i = 0; i < 9; i += 1) softBlob(cloud, r() * W / 2, r() * H / 2, 70 + r() * 100, 10 + r() * 30, "#dce5d7", 0.1, 12);
}

function paintOtherworldly(ctx, em, cloud, w, r) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  for (let i = 0; i < 28; i += 1) {
    const x = r() * W, y = H * (0.15 + r() * 0.72);
    const ww = 50 + r() * 150, hh = 16 + r() * 55;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((r() - 0.5) * 0.65);
    const g = ctx.createLinearGradient(-ww, 0, ww, 0);
    g.addColorStop(0, rgba(w.palette[0], 0.25));
    g.addColorStop(0.5, rgba(w.palette[2], 0.6));
    g.addColorStop(1, rgba(w.palette[3], 0.18));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-ww, 0);
    ctx.quadraticCurveTo(-ww * 0.4, -hh, 0, -hh * 0.55);
    ctx.quadraticCurveTo(ww * 0.55, -hh, ww, 0);
    ctx.quadraticCurveTo(ww * 0.45, hh * 0.9, 0, hh * 0.35);
    ctx.quadraticCurveTo(-ww * 0.4, hh * 0.9, -ww, 0);
    ctx.fill();
    ctx.restore();
  }
  for (let i = 0; i < 8; i += 1) {
    const x = W * (0.1 + r() * 0.8), y = H * (0.2 + r() * 0.58);
    ctx.strokeStyle = rgba(i % 2 ? "#b995d5" : "#87dbe4", 0.5);
    ctx.lineWidth = 4 + r() * 4;
    ctx.beginPath();
    ctx.ellipse(x, y, 20 + r() * 45, 55 + r() * 85, r() * 2, 0, Math.PI * 2);
    ctx.stroke();
    em.strokeStyle = rgba("#9ce3eb", 0.52);
    em.lineWidth = 2;
    em.beginPath();
    em.ellipse(x / 2, y / 2, 12 + r() * 23, 28 + r() * 40, r() * 2, 0, Math.PI * 2);
    em.stroke();
  }
  for (let i = 0; i < 15; i += 1) {
    const x = r() * W;
    const pts = [[x, H * 0.18], [x + 30, H * 0.42], [x - 20, H * 0.7]];
    lineGlow(ctx, pts, "#80cbd7", 3, 0.12);
  }
  for (let i = 0; i < 14; i += 1) softBlob(cloud, r() * W / 2, r() * H / 2, 50 + r() * 100, 14 + r() * 35, i % 2 ? "#8155a8" : "#4fa8b8", 0.13, 16);
}

function paintThreshold(ctx, em, cloud, w, r) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  paintMountains(ctx, r, [w.palette[0], "#31566c", "#718a7d", w.palette[3]], 18, 0.35, 0.88);
  for (let k = 0; k < 9; k += 1) {
    const pts = [];
    const y0 = H * (0.22 + r() * 0.6);
    for (let i = 0; i <= 18; i += 1) {
      const x = i * W / 18;
      const y = y0 + Math.sin(i * 0.62 + k * 1.3) * (14 + k * 2) + Math.sin(i * 0.17) * 18;
      pts.push([x, y]);
    }
    lineGlow(ctx, pts, k % 3 === 0 ? "#e2c28a" : "#c7c1ad", k % 3 === 0 ? 5 : 2.2, k % 3 === 0 ? 0.28 : 0.18);
    if (k % 3 === 0) lineGlow(em, pts.map(function (p) { return [p[0] / 2, p[1] / 2]; }), "#e7bd78", 1.8, 0.65);
  }
  for (let i = 0; i < 12; i += 1) {
    const x = 80 + r() * (W - 160), y = H * (0.28 + r() * 0.58);
    ctx.fillStyle = rgba("#d6ccb1", 0.28);
    ctx.fillRect(x, y, 22 + r() * 40, 9 + r() * 20);
    em.fillStyle = "rgba(242,188,103,.72)";
    em.fillRect(x / 2 + 2, y / 2 + 2, 3, 2);
  }
  for (let i = 0; i < 15; i += 1) softBlob(cloud, r() * W / 2, r() * H / 2, 50 + r() * 90, 12 + r() * 30, "#c8d8df", 0.12, 15);
}

function paintHealing(ctx, em, cloud, w, r) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  for (let k = 0; k < 12; k += 1) {
    const pts = [];
    const y0 = H * (0.18 + r() * 0.64);
    for (let i = 0; i <= 20; i += 1) pts.push([i * W / 20, y0 + Math.sin(i * 0.48 + k) * (12 + r() * 30)]);
    lineGlow(ctx, pts, k % 2 ? "#66c9c4" : "#8dd7cb", 8 + r() * 8, 0.28);
    if (k % 3 === 0) lineGlow(em, pts.map(function (p) { return [p[0] / 2, p[1] / 2]; }), "#93ddd5", 2, 0.24);
  }
  for (let i = 0; i < 36; i += 1) {
    const x = r() * W, y = H * (0.22 + r() * 0.66);
    ctx.fillStyle = rgba(i % 3 ? "#6c9e6d" : "#9bbf7b", 0.34);
    ctx.beginPath();
    ctx.arc(x, y, 8 + r() * 35, 0, Math.PI * 2);
    ctx.fill();
  }
  const hx = W * 0.72, hy = H * 0.54;
  ctx.strokeStyle = rgba("#e0b86e", 0.5);
  ctx.lineWidth = 3;
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const x = hx + col * 27 + (row % 2) * 13, y = hy + row * 24;
      ctx.beginPath();
      for (let p = 0; p < 6; p += 1) {
        const a = Math.PI / 3 * p;
        const px = x + Math.cos(a) * 14, py = y + Math.sin(a) * 14;
        if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
    }
  }
  softBlob(ctx, W * 0.35, H * 0.58, W * 0.11, H * 0.08, "#7ce0d6", 0.18, 18);
  softBlob(em, W * 0.18, H * 0.29, W * 0.07, H * 0.05, "#a4eee5", 0.2, 13);
  for (let i = 0; i < 12; i += 1) softBlob(cloud, r() * W / 2, r() * H / 2, 55 + r() * 80, 12 + r() * 26, "#d4efe7", 0.12, 12);
}

function paintShadow(ctx, em, cloud, w, r) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.save();
  ctx.strokeStyle = "rgba(139,102,119,.22)";
  ctx.lineWidth = 4;
  for (let y = H * 0.22; y < H * 0.83; y += 34) {
    ctx.beginPath();
    for (let x = W * 0.08; x < W * 0.92; x += 34) {
      const jx = x + Math.sin(y * 0.04 + x * 0.01) * 10;
      if (x === W * 0.08) ctx.moveTo(jx, y); else ctx.lineTo(jx, y);
    }
    ctx.stroke();
  }
  for (let x = W * 0.1; x < W * 0.9; x += 47) {
    ctx.beginPath(); ctx.moveTo(x, H * 0.22); ctx.lineTo(x + Math.sin(x) * 12, H * 0.83); ctx.stroke();
  }
  ctx.restore();
  for (let i = 0; i < 22; i += 1) {
    const x = 70 + r() * (W - 140), y = H * (0.32 + r() * 0.52);
    const ww = 18 + r() * 52, hh = 25 + r() * 120;
    ctx.fillStyle = rgba(i % 3 === 0 ? "#6b3445" : "#23233b", 0.72);
    ctx.fillRect(x, y - hh, ww, hh);
    if (i % 4 === 0) {
      em.fillStyle = "rgba(218,144,92,.58)";
      em.fillRect(x / 2 + 3, (y - hh * 0.6) / 2, 2.5, 2);
    }
  }
  for (let i = 0; i < 16; i += 1) softBlob(cloud, r() * W / 2, r() * H / 2, 70 + r() * 120, 20 + r() * 40, i % 2 ? "#33283e" : "#6a4b5d", 0.16, 18);
  lineGlow(em, [[W * 0.07, H * 0.4], [W * 0.18, H * 0.37], [W * 0.28, H * 0.42]], "#c48164", 1.8, 0.35);
}

function createWorldMaps(w) {
  const r = seeded(w.id + "-paint");
  const color = document.createElement("canvas");
  color.width = 2048; color.height = 1024;
  const ctx = color.getContext("2d");

  const emissive = document.createElement("canvas");
  emissive.width = 1024; emissive.height = 512;
  const em = emissive.getContext("2d");
  em.fillStyle = "#000"; em.fillRect(0, 0, emissive.width, emissive.height);

  const cloud = document.createElement("canvas");
  cloud.width = 1024; cloud.height = 512;
  const cl = cloud.getContext("2d");
  cl.clearRect(0, 0, cloud.width, cloud.height);

  painterlyBase(ctx, w, r);
  if (w.surfacePreset === "luminous") paintLuminous(ctx, em, cl, w, r);
  if (w.surfacePreset === "message") paintMessage(ctx, em, cl, w, r);
  if (w.surfacePreset === "otherworldly") paintOtherworldly(ctx, em, cl, w, r);
  if (w.surfacePreset === "roads") paintThreshold(ctx, em, cl, w, r);
  if (w.surfacePreset === "water") paintHealing(ctx, em, cl, w, r);
  if (w.surfacePreset === "shadow") paintShadow(ctx, em, cl, w, r);

  const bump = document.createElement("canvas");
  bump.width = 1024; bump.height = 512;
  const bx = bump.getContext("2d");
  const img = bx.createImageData(bump.width, bump.height);
  const br = seeded(w.id + "-relief");
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(70 + br() * 130);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  bx.putImageData(img, 0, 0);
  bx.globalCompositeOperation = "soft-light";
  for (let i = 0; i < 180; i += 1) {
    bx.fillStyle = "rgba(255,255,255," + (0.03 + br() * 0.08) + ")";
    bx.beginPath();
    bx.ellipse(br() * bump.width, br() * bump.height, 10 + br() * 80, 4 + br() * 30, br() * Math.PI, 0, Math.PI * 2);
    bx.fill();
  }

  function tex(c, colorSpace) {
    const t = new THREE.CanvasTexture(c);
    if (colorSpace) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = true;
    return t;
  }

  return { color: tex(color, true), emissive: tex(emissive, true), bump: tex(bump, false), cloud: tex(cloud, true) };
}

const atmosphereVertex = [
  "varying vec3 vNormal;",
  "varying vec3 vWorld;",
  "void main(){",
  "vNormal = normalize(mat3(modelMatrix) * normal);",
  "vec4 worldPosition = modelMatrix * vec4(position,1.0);",
  "vWorld = worldPosition.xyz;",
  "gl_Position = projectionMatrix * viewMatrix * worldPosition;",
  "}"
].join("\n");

const atmosphereFragment = [
  "uniform vec3 glowColor;",
  "uniform float strength;",
  "varying vec3 vNormal;",
  "varying vec3 vWorld;",
  "void main(){",
  "vec3 viewDirection = normalize(cameraPosition - vWorld);",
  "float rim = pow(1.0 - max(dot(vNormal, viewDirection), 0.0), 2.8);",
  "gl_FragColor = vec4(glowColor, rim * strength);",
  "}"
].join("\n");

function makeAtmosphere(radius, color, strength) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.075, 96, 72),
    new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(color) }, strength: { value: strength } },
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    })
  );
}

function spherical(lat, lon, radius) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  ).multiplyScalar(radius);
}

function placeOutward(obj, lat, lon, radius) {
  const p = spherical(lat, lon, radius);
  obj.position.copy(p);
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().normalize());
  return obj;
}

function landmarkMaterial(color, emissive, opacity) {
  return new THREE.MeshStandardMaterial({
    color: color,
    emissive: emissive || color,
    emissiveIntensity: 0.18,
    roughness: 0.8,
    metalness: 0,
    transparent: opacity < 1,
    opacity: opacity
  });
}

function addPeaks(group, radius, w) {
  const coords = [[24,-10],[10,28],[-18,74],[38,112],[-5,145],[15,-145],[-26,-72]];
  coords.forEach(function (c, i) {
    const h = radius * (0.09 + (i % 3) * 0.018);
    const peak = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.045, h, 7), landmarkMaterial(i % 2 ? w.palette[2] : w.palette[1], w.artSpec.emissive, 0.92));
    placeOutward(peak, c[0], c[1], radius * 1.015 + h * 0.42);
    group.add(peak);
  });
}

function addTempleForms(group, radius, w) {
  const coords = [[22,-18],[-8,44],[14,96],[-28,142],[35,-118]];
  coords.forEach(function (c, i) {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.035, radius * 0.055, radius * 0.055, 10), landmarkMaterial(w.palette[2], w.artSpec.emissive, 0.9));
    placeOutward(base, c[0], c[1], radius * 1.028);
    group.add(base);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.026, radius * 0.12, 8), landmarkMaterial(w.palette[3], w.artSpec.emissive, 0.88));
    placeOutward(spire, c[0], c[1], radius * 1.075);
    group.add(spire);
    if (i < 3) {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.006, radius * 0.006, radius * 0.28, 6), new THREE.MeshBasicMaterial({ color: w.artSpec.emissive, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
      placeOutward(beam, c[0], c[1], radius * 1.18);
      group.add(beam);
    }
  });
}

function addShadowArchitecture(group, radius, w) {
  const coords = [[18,-20],[-16,25],[30,72],[-24,120],[11,158],[-34,-105],[36,-145]];
  coords.forEach(function (c, i) {
    const h = radius * (0.11 + (i % 4) * 0.03);
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * (0.025 + (i % 2) * 0.01), radius * 0.04, h, 6),
      landmarkMaterial(i % 3 === 0 ? w.palette[2] : "#22243a", i % 3 === 0 ? w.artSpec.emissive : "#30233d", 0.9)
    );
    placeOutward(tower, c[0], c[1], radius * 1.018 + h * 0.42);
    group.add(tower);
  });
}

function addHealingDetails(group, radius, w) {
  const coords = [[16,-8],[-20,38],[28,86],[-8,132],[35,-112]];
  coords.forEach(function (c, i) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.055, radius * 0.008, 6, 24),
      new THREE.MeshBasicMaterial({ color: i % 2 ? "#e3bc72" : "#75d5ca", transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    placeOutward(ring, c[0], c[1], radius * 1.04);
    ring.rotateX(Math.PI / 2);
    group.add(ring);
  });
}

function createSurfaceCurve(radius, lat, startLon, endLon, wave) {
  const points = [];
  for (let i = 0; i <= 42; i += 1) {
    const t = i / 42;
    points.push(spherical(lat + Math.sin(t * Math.PI * 2) * wave, THREE.MathUtils.lerp(startLon, endLon, t), radius));
  }
  return new THREE.CatmullRomCurve3(points);
}

function addThresholdRoutes(group, radius, w, travelers) {
  const routes = [
    createSurfaceCurve(radius * 1.015, 18, -145, 145, 7),
    createSurfaceCurve(radius * 1.02, -19, -115, 130, 5),
    createSurfaceCurve(radius * 1.018, 39, -75, 115, 3)
  ];
  routes.forEach(function (curve, i) {
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 120, radius * (i === 0 ? 0.008 : 0.0045), 5, false),
      new THREE.MeshBasicMaterial({ color: i === 0 ? "#e8c47f" : "#a9c4cd", transparent: true, opacity: i === 0 ? 0.52 : 0.3, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    group.add(tube);
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.018, 10, 8),
      new THREE.MeshBasicMaterial({ color: "#ffd797", transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending })
    );
    group.add(light);
    travelers.push({ mesh: light, curve: curve, speed: 0.000025 + i * 0.000008, offset: i * 0.31 });
  });
}

function addOtherworldlyDetails(group, radius, w, animated) {
  for (let i = 0; i < 11; i += 1) {
    const frag = new THREE.Mesh(
      new THREE.IcosahedronGeometry(radius * (0.045 + (i % 4) * 0.014), 1),
      landmarkMaterial(w.palette[(i + 1) % w.palette.length], i % 2 ? "#7bd2dc" : "#a77ac4", 0.9)
    );
    const a = i / 11 * Math.PI * 2;
    const d = radius * (1.45 + (i % 3) * 0.17);
    frag.position.set(Math.cos(a) * d, Math.sin(a * 1.7) * radius * 0.52, Math.sin(a) * d * 0.55);
    frag.rotation.set(a * 0.3, a, a * 0.15);
    group.add(frag);
    animated.push({ obj: frag, base: frag.position.clone(), phase: a, kind: "fragment" });
  }

  [[15,-25],[-22,68]].forEach(function (c, i) {
    const portal = new THREE.Mesh(
      new THREE.TorusGeometry(radius * (0.14 + i * 0.02), radius * 0.016, 8, 48),
      new THREE.MeshBasicMaterial({ color: i ? "#c58ac5" : "#77d8df", transparent: true, opacity: 0.64, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    placeOutward(portal, c[0], c[1], radius * 1.09);
    portal.rotateX(Math.PI / 2);
    group.add(portal);
    animated.push({ obj: portal, phase: i * 1.8, kind: "portal" });
  });
}

function addAurora(group, radius, w, animated) {
  for (let i = 0; i < 3; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius * (1.13 + i * 0.035), radius * (0.012 + i * 0.004), 8, 128, Math.PI * 1.55),
      new THREE.MeshBasicMaterial({ color: i === 1 ? "#d99ac9" : "#82c8df", transparent: true, opacity: 0.16 - i * 0.02, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    ring.rotation.set(1.2 + i * 0.22, 0.2 + i * 0.8, i * 0.45);
    group.add(ring);
    animated.push({ obj: ring, phase: i * 1.3, kind: "aurora" });
  }
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.16, 32, 24),
    new THREE.MeshStandardMaterial({ color: "#e7e2d7", emissive: "#b8c8da", emissiveIntensity: 0.3, roughness: 1 })
  );
  moon.position.set(radius * 1.7, radius * 0.7, -radius * 0.4);
  group.add(moon);
}

function createParticleHalo(radius, color, count, seed, spread) {
  const r = seeded(seed);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const theta = r() * Math.PI * 2;
    const phi = Math.acos(2 * r() - 1);
    const d = radius * (1.08 + r() * spread);
    positions[i * 3] = Math.sin(phi) * Math.cos(theta) * d;
    positions[i * 3 + 1] = Math.cos(phi) * d;
    positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * d;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: color,
    size: radius * 0.026,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });
  return new THREE.Points(geo, mat);
}

const layout = [[-4.25,1.75],[0,2.15],[4.15,1.35],[-3.9,-2.15],[0.15,-2.05],[4.15,-2.45]];
const minW = Math.min.apply(null, blueprint.worlds.map(function (w) { return w.visualWeight; }));
const maxW = Math.max.apply(null, blueprint.worlds.map(function (w) { return w.visualWeight; }));
const planets = [];
const travelers = [];
const animatedDetails = [];

blueprint.worlds.forEach(function (w, i) {
  const radius = 0.74 + ((Math.sqrt(w.visualWeight) - Math.sqrt(minW)) / (Math.sqrt(maxW) - Math.sqrt(minW))) * 0.47;
  const maps = createWorldMaps(w);
  const group = new THREE.Group();
  group.position.set(layout[i][0], layout[i][1], 0);

  const material = new THREE.MeshStandardMaterial({
    map: maps.color,
    bumpMap: maps.bump,
    bumpScale: radius * 0.035,
    emissive: new THREE.Color(w.artSpec.emissive),
    emissiveMap: maps.emissive,
    emissiveIntensity: 0.65,
    roughness: 0.88,
    metalness: 0.01
  });

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 144, 108), material);
  mesh.rotation.z = (i - 2) * 0.085;
  group.add(mesh);

  const cloudOpacity = w.surfacePreset === "shadow" ? 0.24 : w.surfacePreset === "otherworldly" ? 0.2 : 0.16;
  const cloudShell = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.018, 96, 72),
    new THREE.MeshStandardMaterial({
      map: maps.cloud,
      color: w.surfacePreset === "shadow" ? "#5a4b64" : "#e5edf0",
      transparent: true,
      opacity: cloudOpacity,
      roughness: 1,
      depthWrite: false
    })
  );
  group.add(cloudShell);

  const atmosphere = makeAtmosphere(radius, w.palette[1], w.surfacePreset === "luminous" ? 0.62 : 0.42);
  group.add(atmosphere);

  const silhouette = new THREE.Group();
  group.add(silhouette);

  if (w.surfacePreset === "luminous") {
    addPeaks(silhouette, radius, w);
    addAurora(group, radius, w, animatedDetails);
  } else if (w.surfacePreset === "message") {
    addTempleForms(silhouette, radius, w);
  } else if (w.surfacePreset === "otherworldly") {
    addOtherworldlyDetails(group, radius, w, animatedDetails);
  } else if (w.surfacePreset === "roads") {
    addThresholdRoutes(group, radius, w, travelers);
  } else if (w.surfacePreset === "water") {
    addHealingDetails(silhouette, radius, w);
  } else if (w.surfacePreset === "shadow") {
    addShadowArchitecture(silhouette, radius, w);
  }

  const particleColor = w.surfacePreset === "shadow" ? "#b77b68" :
    w.surfacePreset === "water" ? "#e6c06e" :
    w.surfacePreset === "luminous" ? "#f1e3bd" :
    w.surfacePreset === "otherworldly" ? "#8edee3" : w.artSpec.emissive;
  const particles = createParticleHalo(radius, particleColor, w.surfacePreset === "water" ? 42 : 24, w.id + "-particles", w.surfacePreset === "otherworldly" ? 0.62 : 0.2);
  particles.material.opacity = w.surfacePreset === "water" ? 0.48 : 0.28;
  group.add(particles);

  scene.add(group);

  const label = document.createElement("button");
  label.className = "nc-label";
  label.innerHTML = '<span class="nc-label-mark">✦</span><b>' + w.label + '</b><small>provisional world</small>';
  labels.appendChild(label);

  planets.push({
    w: w,
    group: group,
    mesh: mesh,
    cloudShell: cloudShell,
    atmosphere: atmosphere,
    particles: particles,
    radius: radius,
    label: label,
    base: new THREE.Vector3(layout[i][0], layout[i][1], 0),
    phase: i * 0.83,
    maps: maps
  });
});

const ray = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;
let selected = null;
let mouse = { x: 0, y: 0 };
let last = performance.now();
let cardsTimer = null;
let enterTimer = null;

function screenPos(v) {
  const p = v.clone().project(camera);
  return { x: (p.x * 0.5 + 0.5) * innerWidth, y: (-p.y * 0.5 + 0.5) * innerHeight };
}

function hitAt(e) {
  const r = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(pointer, camera);
  const hits = ray.intersectObjects(planets.map(function (p) { return p.mesh; }), false);
  return hits[0] ? planets.find(function (p) { return p.mesh === hits[0].object; }) : null;
}

function showTooltip(p, e) {
  tooltip.innerHTML = '<div class="nc-tooltip-mark">✦</div><b>' + p.w.label + '</b><span>Prototype corpus sample — final count pending</span><em>' + p.w.summary + '</em>';
  tooltip.style.left = Math.min(innerWidth - 340, e.clientX + 20) + "px";
  tooltip.style.top = Math.min(innerHeight - 155, e.clientY + 18) + "px";
  tooltip.classList.add("show");
}

canvas.addEventListener("pointermove", function (e) {
  mouse.x = (e.clientX / innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / innerHeight - 0.5) * 2;
  if (selected) return;
  const h = hitAt(e);
  if (h !== hovered) {
    hovered = h;
    planets.forEach(function (p) { p.label.classList.toggle("active", p === h); });
  }
  if (h) showTooltip(h, e);
  else tooltip.classList.remove("show");
});

canvas.addEventListener("click", function (e) {
  if (selected) return;
  const h = hitAt(e);
  if (h) openWorld(h);
});

planets.forEach(function (p) {
  p.label.addEventListener("mouseenter", function (e) {
    if (!selected) {
      hovered = p;
      p.label.classList.add("active");
      const box = p.label.getBoundingClientRect();
      showTooltip(p, { clientX: box.right, clientY: box.top });
    }
  });
  p.label.addEventListener("mouseleave", function () {
    if (!selected) {
      hovered = null;
      p.label.classList.remove("active");
      tooltip.classList.remove("show");
    }
  });
  p.label.addEventListener("click", function () {
    if (!selected) openWorld(p);
  });
});

function tarotGlyph(name) {
  const map = {
    "Train":"⌁","Bridge":"⌒","Bus":"◇","Road":"↝","Motorhome":"⌂","Home":"⌂",
    "Bee":"✣","Water":"≋","Spa":"◌","Cleansing":"✧","Dance":"⌁","Body":"◯",
    "Tower":"♜","Labyrinth":"⌘","Passage":"⋄","Smoke":"〰","Ruins":"⌑","Escape":"↗",
    "Portal":"◉","Floating Land":"◒","Strange Structure":"⌬","Double Dream":"◐","Sky":"☾","Fragment":"◆",
    "Mountain":"△","Moon":"☽","Aurora":"⌇","Alignment":"✶","Golden Cloud":"☁","Ray":"✦",
    "Message":"✧","Temple":"⌂","Library":"▤","Inscription":"≡","Path":"⌁","Knowing":"◉"
  };
  return map[name] || "✦";
}

const tarotPositions = [
  [7,18,-5],[24,10,3],[7,57,4],[25,67,-3],[43,16,4],[45,58,-4]
];

function openWorld(p) {
  selected = p;
  hovered = null;
  clearTimeout(cardsTimer);
  tooltip.classList.remove("show");
  shell.dataset.mode = "focus";
  focus.classList.add("open");
  focus.classList.remove("cards-ready");
  focus.querySelector("h2").textContent = p.w.label;
  focus.querySelector(".nc-summary").textContent = p.w.summary;
  focus.querySelector(".nc-motif-line").textContent = p.w.artSpec.terrainCharacter + " · " + p.w.artSpec.atmosphere;
  tarots.innerHTML = "";

  p.w.tarotCandidates.forEach(function (name, i) {
    const pos = tarotPositions[i];
    const b = document.createElement("button");
    b.className = "nc-tarot";
    b.style.setProperty("--x", pos[0] + "vw");
    b.style.setProperty("--y", pos[1] + "vh");
    b.style.setProperty("--r", pos[2] + "deg");
    b.style.setProperty("--d", (i * 0.08) + "s");
    b.innerHTML = '<span class="corner c1">✦</span><span class="corner c2">☾</span><div class="nc-tarot-inner"><i>' + tarotGlyph(name) + '</i><b>' + name + '</b><small>' + p.w.label + '</small></div>';
    b.addEventListener("click", function () { openTarot(name, p.w); });
    tarots.appendChild(b);
  });

  cardsTimer = setTimeout(function () { focus.classList.add("cards-ready"); }, reduced ? 50 : 950);
}

function closeWorld() {
  clearTimeout(cardsTimer);
  clearTimeout(enterTimer);
  focus.classList.remove("cards-ready");
  focus.classList.remove("open");
  reader.classList.remove("open");
  entering.classList.remove("show");
  shell.dataset.mode = "orbit";
  selected = null;
}

focus.querySelector(".nc-close").addEventListener("click", closeWorld);
focus.addEventListener("click", function (e) { if (e.target === focus) closeWorld(); });

focus.querySelector(".nc-enter").addEventListener("click", function () {
  if (!selected) return;
  shell.dataset.mode = "entering";
  entering.querySelector("b").textContent = selected.w.label;
  entering.classList.add("show");
  clearTimeout(enterTimer);
  enterTimer = setTimeout(function () {
    entering.querySelector("em").textContent = "The flat-map descent is the next authored layer for this territory.";
  }, reduced ? 50 : 1100);
});

function openTarot(name, w) {
  reader.querySelector("h3").textContent = name;
  reader.querySelector("p").textContent = name + " belongs to the provisional " + w.label + " symbol constellation. In the completed corpus model this opens recurrence, source dreams, associations, chronology and interpretation while preserving the same ornate Dreamscape card architecture.";
  reader.classList.add("open");
}

reader.querySelector(".nc-close").addEventListener("click", function () { reader.classList.remove("open"); });

const starCanvas = document.querySelector(".nc-stars");
const sx = starCanvas.getContext("2d");
let stars = [];
let dust = [];

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  const d = Math.min(devicePixelRatio || 1, 2);
  starCanvas.width = innerWidth * d;
  starCanvas.height = innerHeight * d;
  starCanvas.style.width = innerWidth + "px";
  starCanvas.style.height = innerHeight + "px";
  sx.setTransform(d, 0, 0, d, 0, 0);

  stars = Array.from({ length: Math.min(620, Math.max(280, Math.round(innerWidth * innerHeight / 4200))) }, function () {
    return { x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: 0.2 + Math.random() * 1.45, a: 0.1 + Math.random() * 0.7, p: Math.random() * Math.PI * 2, z: 0.25 + Math.random() * 1.2 };
  });
  dust = Array.from({ length: 34 }, function () {
    return { x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: 16 + Math.random() * 58, a: 0.006 + Math.random() * 0.022, p: Math.random() * Math.PI * 2 };
  });
}

addEventListener("resize", resize);
resize();

function drawStars(t) {
  sx.clearRect(0, 0, innerWidth, innerHeight);
  dust.forEach(function (d, i) {
    const x = d.x + mouse.x * (4 + i % 3 * 2);
    const y = d.y + mouse.y * (3 + i % 4);
    const g = sx.createRadialGradient(x, y, 0, x, y, d.r);
    g.addColorStop(0, "rgba(127,155,215," + d.a + ")");
    g.addColorStop(1, "rgba(127,155,215,0)");
    sx.fillStyle = g;
    sx.beginPath(); sx.arc(x, y, d.r, 0, Math.PI * 2); sx.fill();
  });
  stars.forEach(function (s) {
    const pulse = 0.74 + Math.sin(t * 0.00045 + s.p) * 0.26;
    const x = s.x + mouse.x * 8 * s.z;
    const y = s.y + mouse.y * 5 * s.z;
    sx.fillStyle = "rgba(255,245,224," + (s.a * pulse) + ")";
    sx.beginPath(); sx.arc(x, y, Math.max(0.12, s.r * pulse), 0, Math.PI * 2); sx.fill();
    if (s.r > 1.1 && pulse > 0.9) {
      sx.strokeStyle = "rgba(244,218,171," + (s.a * 0.22) + ")";
      sx.lineWidth = 0.45;
      sx.beginPath(); sx.moveTo(x - 4, y); sx.lineTo(x + 4, y); sx.moveTo(x, y - 4); sx.lineTo(x, y + 4); sx.stroke();
    }
  });
}

function animateDetails(t, dt) {
  travelers.forEach(function (item) {
    const u = (t * item.speed + item.offset) % 1;
    item.mesh.position.copy(item.curve.getPointAt(u));
  });

  animatedDetails.forEach(function (item) {
    if (item.kind === "fragment") {
      item.obj.position.x = item.base.x + Math.sin(t * 0.00032 + item.phase) * 0.08;
      item.obj.position.y = item.base.y + Math.cos(t * 0.00027 + item.phase) * 0.06;
      item.obj.rotation.y += dt * 0.12;
    } else if (item.kind === "portal") {
      const pulse = 1 + Math.sin(t * 0.001 + item.phase) * 0.035;
      item.obj.scale.setScalar(pulse);
      item.obj.rotation.z += dt * 0.035;
    } else if (item.kind === "aurora") {
      item.obj.material.opacity = 0.11 + (Math.sin(t * 0.0005 + item.phase) + 1) * 0.035;
      item.obj.rotation.z += dt * 0.018;
    }
  });
}

function animate(t) {
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;
  drawStars(t);
  animateDetails(t, dt);

  planets.forEach(function (p) {
    const isH = hovered === p;
    const isS = selected === p;
    const targetScale = isS ? (shell.dataset.mode === "entering" ? 2.45 : 1.82) : isH ? 1.065 : 1;
    const target = new THREE.Vector3(targetScale, targetScale, targetScale);
    p.group.scale.lerp(target, Math.min(1, dt * (isS ? 1.5 : 2.8)));

    if (!reduced) {
      p.mesh.rotation.y += p.w.rotationSpeed * (isH ? 0.42 : isS ? 0.55 : 1) * 16.67;
      p.cloudShell.rotation.y -= p.w.rotationSpeed * 5.4;
      p.cloudShell.rotation.x += p.w.rotationSpeed * 0.55;
      p.particles.rotation.y += dt * (p.w.surfacePreset === "water" ? 0.06 : 0.025);
    }

    if (!selected) {
      p.group.position.x += ((p.base.x + Math.sin(t * 0.000075 + p.phase) * 0.10) - p.group.position.x) * Math.min(1, dt * 1.2);
      p.group.position.y += ((p.base.y + Math.cos(t * 0.000061 + p.phase) * 0.07) - p.group.position.y) * Math.min(1, dt * 1.2);
      p.group.position.z += (0 - p.group.position.z) * Math.min(1, dt * 2);
    } else {
      const targetPos = p === selected
        ? new THREE.Vector3(-2.0, 0.05, shell.dataset.mode === "entering" ? 3.1 : 1.65)
        : new THREE.Vector3(p.base.x * 1.13, p.base.y * 1.08, -3.8);
      p.group.position.lerp(targetPos, Math.min(1, dt * 1.45));
    }

    const pos = screenPos(p.group.position.clone());
    p.label.style.left = pos.x + "px";
    p.label.style.top = (pos.y + p.radius * 63) + "px";
    p.label.style.opacity = selected ? (p === selected ? "0" : "0.08") : "1";
    p.label.style.pointerEvents = selected ? "none" : "auto";
  });

  const cameraTargetZ = shell.dataset.mode === "entering" ? 10.65 : 12.5;
  camera.position.z += (cameraTargetZ - camera.position.z) * Math.min(1, dt * 1.2);
  camera.position.x += ((selected ? 0 : mouse.x * 0.16) - camera.position.x) * dt * 0.6;
  camera.position.y += ((selected ? 0 : -mouse.y * 0.10) - camera.position.y) * dt * 0.6;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
