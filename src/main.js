import "./styles.css";
import { buildWorld } from "../engine/buildWorld.js";

const corpus = await fetch("/corpora/reference-corpus.json").then(r => r.json());
const world = buildWorld(corpus);
const territory = world.territories[0];
const place = territory.places[0];
const app = document.querySelector("#app");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const choreography = {
  focusCardDelay: reduced ? 40 : 1250,
  descentDuration: reduced ? 250 : 3600,
  arrivalCardDelay: reduced ? 80 : 650,
  returnDuration: reduced ? 250 : 1900,
};

app.innerHTML = `
  <section class="dreamscape" data-state="constellation" style="--core:${territory.palette.core};--glow:${territory.palette.glow};--shadow:${territory.palette.shadow};--mist:${territory.palette.mist}">
    <canvas id="stars" aria-hidden="true"></canvas>
    <div class="nebula nebula-a"></div><div class="nebula nebula-b"></div>
    <div class="veil veil-space"></div><div class="veil veil-descent"></div>

    <header class="brand">
      <div class="brand-mark">✦</div><div><div class="brand-name">DREAMSCAPE</div><div class="brand-kicker">A world made from your dreams</div></div>
    </header>

    <nav class="world-breadcrumb" aria-label="Dream world location">
      <span class="crumb active">World</span><i></i><span class="crumb">${territory.name}</span><i></i><span class="crumb">${place.name}</span>
    </nav>

    <div class="constellation-shell" aria-hidden="true">
      <div class="orbit orbit-1"></div><div class="orbit orbit-2"></div>
      <div class="satellite s1">oracle</div><div class="satellite s2">collections</div><div class="satellite s3">insights</div><div class="satellite s4">numinous</div>
    </div>

    <div class="world-stage" id="worldStage">
      <div class="planet-wrap" id="planetWrap">
        <div class="planet-halo"></div>
        <div class="approach-rings" aria-hidden="true"><i></i><i></i><i></i></div>
        <button class="planet" id="planet" aria-label="Enter your Dream Atlas">
          <span class="continent c1"></span><span class="continent c2"></span><span class="continent c3"></span>
          <span class="cloud cloud-1"></span><span class="cloud cloud-2"></span>
          <span class="night-shade"></span><span class="atmosphere-rim"></span>
          <span class="hearth-beacon" id="hearthBeacon"><b></b></span>
        </button>
      </div>

      <div class="descent-tunnel" aria-hidden="true"><i></i><i></i><i></i><i></i></div>

      <div class="landing" id="landing">
        <div class="sky-glow"></div><div class="moon"></div>
        <div class="landscape hills-far"></div><div class="landscape hills-back"></div><div class="landscape hills-mid"></div><div class="landscape hills-front"></div>
        <div class="mist mist-a"></div><div class="mist mist-b"></div>
        <div class="path"></div>
        <button class="house" id="house" aria-label="Enter ${place.name}"><div class="roof"></div><div class="chimney"><i></i></div><div class="house-body"><span></span><span></span><b></b></div></button>
        <div class="ember-field" id="embers"></div>
        <div class="arrival-title"><small>YOU HAVE ARRIVED IN</small><strong>${territory.name}</strong></div>
      </div>
    </div>

    <section class="copy" id="copy">
      <div class="eyebrow" id="eyebrow">YOUR DREAM ATLAS</div>
      <h1 id="title">Not a map of one dream.<br><em>A world formed across many.</em></h1>
      <p id="body">Patterns gather into places. Recurring symbols become landmarks. The world changes as your dream corpus grows.</p>
      <button class="enter" id="enter">Enter the Atlas <span>↗</span></button>
    </section>

    <section class="territory-card" id="territoryCard">
      <div class="eyebrow">A SIGNAL IN YOUR WORLD</div><h2>${territory.name}</h2><p>${territory.subtitle}</p>
      <div class="evidence"><span>${territory.evidence.length}</span> dreams are currently shaping this territory</div>
      <button class="enter" id="descend">Follow the signal <span>↓</span></button>
    </section>

    <section class="place-card" id="placeCard">
      <div class="eyebrow">${territory.name.toUpperCase()} · PLACE</div><h2>${place.name}</h2>
      <p>A dwelling recurring across the corpus. Its light grows stronger as related dreams return, overlap and accumulate.</p>
      <div class="place-actions"><button class="enter" id="enterPlace">Approach the house <span>→</span></button><button class="text-button" id="returnAtlas">Rise back to the Atlas</button></div>
    </section>

    <div class="hint" id="hint">Move gently. The world will meet you.</div>
  </section>`;

const root = document.querySelector(".dreamscape");
const copy = document.querySelector("#copy");
const territoryCard = document.querySelector("#territoryCard");
const placeCard = document.querySelector("#placeCard");
const enter = document.querySelector("#enter");
const planet = document.querySelector("#planet");
const beacon = document.querySelector("#hearthBeacon");
const descend = document.querySelector("#descend");
const returnAtlas = document.querySelector("#returnAtlas");
const embers = document.querySelector("#embers");
const crumbs = [...document.querySelectorAll(".crumb")];
let timer;

function setState(state) { root.dataset.state = state; }
function clearTimer(){ if(timer) clearTimeout(timer); }
function updateCrumbs(index){ crumbs.forEach((c,i)=>c.classList.toggle("active", i <= index)); }

function atlasReveal() {
  clearTimer(); setState("atlas"); updateCrumbs(0);
  copy.querySelector("#eyebrow").textContent = "YOUR LIVING DREAM WORLD";
  copy.querySelector("#title").innerHTML = "The planet remembers.<br><em>Recurring dreams leave geography behind.</em>";
  copy.querySelector("#body").textContent = "A warm signal is gathering on the surface. It is not a notification; it is a place becoming visible because your dreams keep returning there.";
  enter.innerHTML = "Approach the warm signal <span>→</span>";
}

function focusTerritory() {
  if (["focus","descent","hearthlands"].includes(root.dataset.state)) return;
  clearTimer(); setState("focus"); updateCrumbs(1); copy.classList.add("hidden");
  timer = setTimeout(() => territoryCard.classList.add("visible"), choreography.focusCardDelay);
}

function descendTerritory() {
  clearTimer(); territoryCard.classList.remove("visible"); setState("descent"); seedEmbers();
  timer = setTimeout(() => {
    setState("hearthlands"); updateCrumbs(1);
    setTimeout(() => placeCard.classList.add("visible"), choreography.arrivalCardDelay);
  }, choreography.descentDuration);
}

function backToAtlas() {
  clearTimer(); placeCard.classList.remove("visible"); setState("returning"); updateCrumbs(0);
  timer = setTimeout(() => { setState("atlas"); copy.classList.remove("hidden"); territoryCard.classList.remove("visible"); }, choreography.returnDuration);
}

enter.addEventListener("click", () => root.dataset.state === "constellation" ? atlasReveal() : focusTerritory());
planet.addEventListener("click", () => root.dataset.state === "constellation" ? atlasReveal() : focusTerritory());
beacon.addEventListener("click", e => { e.stopPropagation(); focusTerritory(); });
descend.addEventListener("click", descendTerritory);
returnAtlas.addEventListener("click", backToAtlas);

function seedEmbers() {
  if (embers.childElementCount) return;
  for (let i = 0; i < 42; i++) {
    const e = document.createElement("i");
    e.style.left = `${5 + Math.random() * 90}%`; e.style.top = `${55 + Math.random() * 40}%`;
    e.style.animationDelay = `${Math.random() * 5}s`; e.style.animationDuration = `${3 + Math.random() * 5}s`;
    e.style.setProperty("--drift", `${-22 + Math.random()*44}px`); embers.appendChild(e);
  }
}

addEventListener("pointermove", e => {
  if (reduced) return;
  const x = (e.clientX / innerWidth - .5); const y = (e.clientY / innerHeight - .5);
  root.style.setProperty("--mx", x.toFixed(3)); root.style.setProperty("--my", y.toFixed(3));
});

const canvas = document.querySelector("#stars"); const ctx = canvas.getContext("2d"); let stars=[];
function resize(){ const dpr=Math.min(devicePixelRatio||1,2); canvas.width=innerWidth*dpr; canvas.height=innerHeight*dpr; canvas.style.width=`${innerWidth}px`; canvas.style.height=`${innerHeight}px`; ctx.setTransform(dpr,0,0,dpr,0,0); const count=Math.min(230,Math.round(innerWidth*innerHeight/7200)); stars=Array.from({length:count},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.25+.15,a:Math.random()*.7+.2,p:Math.random()*Math.PI*2,d:Math.random()*.8+.2})); }
function draw(t=0){ ctx.clearRect(0,0,innerWidth,innerHeight); const state=root.dataset.state; const fade=["descent","hearthlands"].includes(state)?.18:1; for(const s of stars){ const alpha=(reduced?s.a:s.a*(.72+Math.sin(t*.0005+s.p)*.28))*fade; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fillStyle=`rgba(255,245,230,${Math.max(.02,alpha)})`; ctx.fill(); } requestAnimationFrame(draw); }
resize(); addEventListener("resize",resize); requestAnimationFrame(draw);
