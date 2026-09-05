const app = document.querySelector("#app");

app.innerHTML = `
<main class="atlas" data-state="orbit">
  <div class="stars"></div>
  <div class="scene orbit-scene">
    <img class="orbit-art" src="/assets/atlas-v57.jpg" alt="Dream Atlas world" />
    <button class="territory-hit" aria-label="Enter The Hearthlands"><span></span></button>
    <div class="orbit-copy">
      <p class="kicker">DREAM ATLAS</p>
      <h1>A world made<br>from your dreams</h1>
      <p>Choose a territory and descend into the world your dreams have been making.</p>
    </div>
  </div>

  <section class="focus-panel glass">
    <button class="close-focus" aria-label="Close">×</button>
    <p class="roman">I · THE DOMESTIC HEART</p>
    <h2>The<br>Hearthlands</h2>
    <p class="subtitle">Where belonging keeps changing shape</p>
    <div class="rule"></div>
    <p class="body">The warm, mutable centre of the dream world: homes, family, intimacy, safety and change gather here.</p>
    <div class="stats"><span><b>213</b> dreams</span><span>Places and symbols emerge from the v57 corpus map</span></div>
    <button class="enter">Enter The Hearthlands <span>→</span></button>
  </section>

  <div class="descent-copy"><span>DESCENDING INTO</span><b>THE HEARTHLANDS</b></div>

  <div class="scene hearth-scene">
    <img class="hearth-art" src="/assets/hearthlands-v57.jpg" alt="The Hearthlands" />
    <div class="hearth-topbar glass"><button class="return-world">← Return to the world</button><div><b>The Hearthlands</b><small>213 dreams</small></div><button class="about">About Hearthlands</button></div>

    <button class="hotspot family" data-place="family"><i></i><span>Family Home</span></button>
    <button class="hotspot present" data-place="present"><i></i><span>Current / Present House</span></button>
    <button class="hotspot many" data-place="many"><i></i><span>The Large Many-Roomed House</span></button>
    <button class="hotspot childhood" data-place="childhood"><i></i><span>Cambridge Road Childhood House</span></button>
    <button class="hotspot unfamiliar" data-place="unfamiliar"><i></i><span>The Unfamiliar House</span></button>

    <div class="mode-switch glass"><button class="active">Places</button><button>Symbols</button></div>
  </div>

  <aside class="story glass" aria-live="polite">
    <button class="story-close">×</button>
    <p class="roman story-kind">PLACE</p>
    <h3>Family Home</h3>
    <p class="story-text">A recurring centre of warmth and belonging. The house changes shape across dreams, but the pull toward shelter, memory and intimacy remains.</p>
    <div class="story-tabs"><button class="active">Overview</button><button>Evidence</button><button>Possible meanings</button></div>
    <button class="deeper">Follow this thread <span>↗</span></button>
  </aside>

  <div class="grain"></div><div class="vignette"></div>
</main>`;

const root = document.querySelector('.atlas');
const story = document.querySelector('.story');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const stories = {
  family: ['PLACE','Family Home','A recurring centre of warmth and belonging. The house changes shape across dreams, but the pull toward shelter, memory and intimacy remains.'],
  present: ['PLACE','Current / Present House','The house of now: a place where waking identity and dream identity overlap, alter and occasionally exchange rooms.'],
  many: ['PLACE','The Large Many-Roomed House','One of the named Hearthlands places visible in the v57 map. This vertical slice keeps the place encounter deliberately brief until its full source-dream reading is wired in.'],
  childhood: ['PLACE','Cambridge Road Childhood House','One of the named Hearthlands places visible in the v57 map. Its full evidence-led reading will be connected from the original corpus rather than invented here.'],
  unfamiliar: ['PLACE','The Unfamiliar House','One of the named Hearthlands places visible in the v57 map. Its full evidence-led reading will be connected from the original corpus rather than invented here.']
};

function state(next){ root.dataset.state = next; }

document.querySelector('.territory-hit').onclick = () => state('focus');
document.querySelector('.close-focus').onclick = () => state('orbit');
document.querySelector('.enter').onclick = () => {
  state('descent');
  setTimeout(() => state('hearth'), reduced ? 120 : 1900);
};
document.querySelector('.return-world').onclick = () => state('orbit');
document.querySelector('.about').onclick = () => state('focus');
document.querySelector('.story-close').onclick = () => story.classList.remove('open');

document.querySelectorAll('.hotspot').forEach(btn => btn.onclick = () => {
  const [kind,title,text] = stories[btn.dataset.place];
  story.querySelector('.story-kind').textContent = kind;
  story.querySelector('h3').textContent = title;
  story.querySelector('.story-text').textContent = text;
  story.classList.add('open');
});

document.querySelectorAll('.story-tabs button').forEach(btn => btn.onclick = () => {
  document.querySelectorAll('.story-tabs button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
});

addEventListener('pointermove', e => {
  root.style.setProperty('--px', (e.clientX / innerWidth - .5).toFixed(3));
  root.style.setProperty('--py', (e.clientY / innerHeight - .5).toFixed(3));
});
