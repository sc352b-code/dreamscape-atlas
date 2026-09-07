function waitForAtlas() {
  const root = document.querySelector('.atlas');
  if (!root) { requestAnimationFrame(waitForAtlas); return; }
  if (root.querySelector('.cosmic-spark-layer')) return;

  const style = document.createElement('style');
  style.textContent = `
    .cosmic-spark-layer{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}
    .bright-twinkle{position:absolute;left:var(--x);top:var(--y);width:2px;height:2px;border-radius:50%;background:rgba(255,250,232,.96);opacity:.035;box-shadow:0 0 4px rgba(255,245,218,.52);animation:brightTwinkle var(--d) ease-in-out var(--delay) infinite}
    .bright-twinkle::before,.bright-twinkle::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);opacity:0}
    .bright-twinkle::before{width:26px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,234,195,.94),transparent)}
    .bright-twinkle::after{width:1px;height:26px;background:linear-gradient(180deg,transparent,rgba(255,234,195,.86),transparent)}
    .bright-twinkle.glisten::before,.bright-twinkle.glisten::after{animation:glintCross var(--d) ease-in-out var(--delay) infinite}
    .cinematic-shooting-star{position:absolute;width:180px;height:1px;transform-origin:right center;background:linear-gradient(90deg,transparent,rgba(198,219,255,.18),rgba(255,237,203,.46),rgba(255,252,241,.98));filter:drop-shadow(0 0 5px rgba(255,228,181,.66));opacity:0;animation:shootAcross 1.8s cubic-bezier(.18,.58,.3,1) forwards}
    .cosmic-sound-toggle{position:fixed;right:20px;bottom:18px;z-index:80;display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:999px;border:1px solid rgba(240,204,151,.2);background:rgba(6,7,18,.64);backdrop-filter:blur(13px);box-shadow:0 9px 30px rgba(0,0,0,.25);color:#cbb9b3;font:600 9px/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:background .2s ease,border-color .2s ease,color .2s ease}
    .cosmic-sound-toggle:hover{background:rgba(20,14,33,.76);border-color:rgba(240,204,151,.38);color:#efd8bd}
    .cosmic-sound-toggle i{display:block;width:8px;height:8px;border-radius:50%;background:#756d7c;transition:.2s ease}
    .cosmic-sound-toggle[aria-pressed="true"] i{background:#e4bc80;box-shadow:0 0 12px rgba(228,188,128,.6)}
    .cosmic-sound-toggle .state{opacity:.68;font-weight:500}
    @keyframes brightTwinkle{0%,82%,100%{opacity:.025;transform:scale(.65)}87%{opacity:.22;transform:scale(1.15)}90%{opacity:1;transform:scale(2.35);box-shadow:0 0 8px rgba(255,247,223,.95),0 0 24px rgba(255,205,137,.48)}94%{opacity:.12;transform:scale(.84)}}
    @keyframes glintCross{0%,85%,100%{opacity:0;transform:translate(-50%,-50%) scale(.35)}90%{opacity:.9;transform:translate(-50%,-50%) scale(1.15)}94%{opacity:0;transform:translate(-50%,-50%) scale(.7)}}
    @keyframes shootAcross{0%{opacity:0;transform:translate3d(0,0,0) rotate(var(--angle)) scaleX(.25)}9%{opacity:.96}100%{opacity:0;transform:translate3d(460px,180px,0) rotate(var(--angle)) scaleX(1.2)}}
    @media(max-width:800px){.cosmic-sound-toggle{right:10px;bottom:10px;padding:9px}.cosmic-sound-toggle .label{display:none}}
    @media(prefers-reduced-motion:reduce){.bright-twinkle,.bright-twinkle::before,.bright-twinkle::after{animation:none!important}.cinematic-shooting-star{display:none!important}}
  `;
  document.head.appendChild(style);

  const sparks = document.createElement('div');
  sparks.className = 'cosmic-spark-layer';
  for (let i = 0; i < 18; i += 1) {
    const star = document.createElement('i');
    star.className = `bright-twinkle${i % 4 === 0 ? ' glisten' : ''}`;
    star.style.setProperty('--x', `${3 + Math.random() * 94}%`);
    star.style.setProperty('--y', `${4 + Math.random() * 88}%`);
    star.style.setProperty('--d', `${11 + Math.random() * 12}s`);
    star.style.setProperty('--delay', `${-Math.random() * 20}s`);
    sparks.appendChild(star);
  }
  root.appendChild(sparks);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function shoot() {
    if (reduced || document.hidden) return;
    const s = document.createElement('i');
    s.className = 'cinematic-shooting-star';
    s.style.left = `${-10 + Math.random() * 46}%`;
    s.style.top = `${6 + Math.random() * 30}%`;
    s.style.setProperty('--angle', `${14 + Math.random() * 8}deg`);
    sparks.appendChild(s);
    setTimeout(() => s.remove(), 2200);
  }
  let shootingTimer = null;
  function scheduleShootingStar() {
    clearTimeout(shootingTimer);
    shootingTimer = setTimeout(() => { shoot(); scheduleShootingStar(); }, 35000 + Math.random() * 40000);
  }
  setTimeout(shoot, 17000 + Math.random() * 9000);
  scheduleShootingStar();

  const toggle = document.createElement('button');
  toggle.className = 'cosmic-sound-toggle';
  toggle.type = 'button';
  toggle.innerHTML = '<i></i><span class="label">Cosmic bowl</span><span class="state">ready</span>';
  toggle.setAttribute('aria-label', 'Toggle ambient cosmic tones');
  toggle.setAttribute('aria-pressed', 'false');
  document.body.appendChild(toggle);

  const stored = localStorage.getItem('dreamscape-cosmic-sound');
  let wanted = stored !== 'off';
  let started = false;
  let audio = null;

  function buildAudio() {
    if (audio) return audio;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC({ latencyHint: 'interactive' });

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -28;
    compressor.knee.value = 24;
    compressor.ratio.value = 2.1;
    compressor.attack.value = .12;
    compressor.release.value = 1.35;
    compressor.connect(ctx.destination);

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(compressor);

    // A very quiet harmonic floor: tonal only, never broadband noise.
    const bed = ctx.createGain();
    bed.gain.value = .16;
    bed.connect(master);
    [55, 82.41].forEach((frequency,index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.value = index === 0 ? .012 : .006;
      osc.connect(gain); gain.connect(bed); osc.start();
    });

    // Bowl bus with a small feedback delay to make the resonance feel spatial rather than melodic.
    const bowlBus = ctx.createGain();
    bowlBus.gain.value = .82;
    bowlBus.connect(master);
    const delay = ctx.createDelay(1.5);
    delay.delayTime.value = .43;
    const feedback = ctx.createGain();
    feedback.gain.value = .24;
    const wet = ctx.createGain();
    wet.gain.value = .22;
    bowlBus.connect(delay);
    delay.connect(feedback); feedback.connect(delay);
    delay.connect(wet); wet.connect(master);

    function playBowlStrike() {
      if (!wanted || document.hidden || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const base = 146.83 * Math.pow(2, ((Math.random() * 5) - 2.5) / 1200);
      const partials = [
        { ratio:1, gain:.052, decay:8.8 },
        { ratio:2.01, gain:.021, decay:7.3 },
        { ratio:2.72, gain:.011, decay:6.2 },
        { ratio:3.93, gain:.0065, decay:5.1 },
        { ratio:5.18, gain:.0032, decay:4.2 },
      ];
      const panNode = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null;
      if (panNode) {
        panNode.pan.value = (Math.random() - .5) * .14;
        panNode.connect(bowlBus);
      }

      for (const partial of partials) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = base * partial.ratio;
        osc.detune.value = (Math.random() - .5) * 3.5;
        gain.gain.setValueAtTime(.0001, now);
        gain.gain.exponentialRampToValueAtTime(partial.gain, now + .035 + Math.random() * .025);
        gain.gain.exponentialRampToValueAtTime(.0001, now + partial.decay);
        osc.connect(gain);
        gain.connect(panNode || bowlBus);
        osc.start(now);
        osc.stop(now + partial.decay + .18);
      }

      // A barely-there high halo arrives after the strike, like light lingering around the bowl.
      const halo = ctx.createOscillator();
      const haloGain = ctx.createGain();
      halo.type = 'sine';
      halo.frequency.value = base * 6.07;
      haloGain.gain.setValueAtTime(.0001, now + .16);
      haloGain.gain.exponentialRampToValueAtTime(.0026, now + .65);
      haloGain.gain.exponentialRampToValueAtTime(.0001, now + 5.6);
      halo.connect(haloGain); haloGain.connect(panNode || bowlBus);
      halo.start(now + .16); halo.stop(now + 5.8);
    }

    let bowlTimer = null;
    function scheduleBowl(first = false) {
      clearTimeout(bowlTimer);
      const wait = first ? 420 : 9800 + Math.random() * 5600;
      bowlTimer = setTimeout(() => {
        playBowlStrike();
        scheduleBowl(false);
      }, wait);
    }
    scheduleBowl(true);

    audio = { ctx, master, bowlBus, scheduleBowl, get bowlTimer(){ return bowlTimer; } };
    return audio;
  }

  function updateToggle() {
    const on = wanted && started && audio?.ctx.state === 'running';
    toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    toggle.querySelector('.state').textContent = on ? 'on' : wanted ? 'ready' : 'off';
  }

  function setGain(on, fast = false) {
    if (!audio) return;
    const now = audio.ctx.currentTime;
    audio.master.gain.cancelScheduledValues(now);
    audio.master.gain.setTargetAtTime(on ? .34 : 0, now, fast ? .1 : on ? .85 : .22);
  }

  async function startFromGesture() {
    if (started || !wanted) { updateToggle(); return; }
    const a = buildAudio();
    if (!a) { toggle.querySelector('.state').textContent = 'unsupported'; return; }
    started = true;
    try { await a.ctx.resume(); } catch (_) {}
    setGain(true);
    updateToggle();
  }

  function setSound(on) {
    wanted = on;
    localStorage.setItem('dreamscape-cosmic-sound', on ? 'on' : 'off');
    if (!started && on) { updateToggle(); return; }
    if (audio?.ctx.state === 'suspended' && on) audio.ctx.resume().then(() => { setGain(true); updateToggle(); });
    else { setGain(on); updateToggle(); }
  }

  toggle.addEventListener('pointerdown', event => event.stopPropagation());
  toggle.addEventListener('click', async event => {
    event.stopPropagation();
    if (!started) {
      wanted = true;
      localStorage.setItem('dreamscape-cosmic-sound','on');
      await startFromGesture();
    } else setSound(!wanted);
  });

  const gesture = () => startFromGesture();
  window.addEventListener('pointerdown', gesture, { capture:true });
  window.addEventListener('keydown', gesture, { capture:true });

  document.addEventListener('visibilitychange', () => {
    if (!audio || !started) return;
    if (document.hidden) setGain(false,true);
    else if (wanted) {
      if (audio.ctx.state === 'suspended') audio.ctx.resume().then(() => { setGain(true); updateToggle(); });
      else setGain(true);
    }
  });

  updateToggle();
}

waitForAtlas();
