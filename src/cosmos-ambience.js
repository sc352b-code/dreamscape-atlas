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
  toggle.innerHTML = '<i></i><span class="label">Cosmic hum</span><span class="state">ready</span>';
  toggle.setAttribute('aria-label', 'Toggle ambient cosmic hum');
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
    compressor.knee.value = 18;
    compressor.ratio.value = 3;
    compressor.attack.value = .08;
    compressor.release.value = .7;
    compressor.connect(ctx.destination);

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(compressor);

    const breath = ctx.createGain();
    breath.gain.value = .86;
    breath.connect(master);

    const bed = ctx.createBiquadFilter();
    bed.type = 'lowpass';
    bed.frequency.value = 1050;
    bed.Q.value = .55;
    bed.connect(breath);

    const voices = [55, 82.5, 110, 165, 220, 432];
    const levels = [.025,.019,.014,.010,.007,.0045];
    voices.forEach((frequency,index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null;
      osc.type = index < 4 ? 'sine' : 'triangle';
      osc.frequency.value = frequency;
      osc.detune.value = index % 2 ? -3 : 3;
      gain.gain.value = levels[index];
      osc.connect(gain);
      if (pan) { gain.connect(pan); pan.pan.value = -0.35 + index * .14; pan.connect(bed); }
      else gain.connect(bed);
      osc.start();
    });

    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < channel.length; i += 1) channel[i] = (Math.random() * 2 - 1) * .25;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer; noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 1450; noiseFilter.Q.value = .28;
    const noiseGain = ctx.createGain(); noiseGain.gain.value = .006;
    noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(breath); noise.start();

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine'; lfo.frequency.value = .045; lfoGain.gain.value = 120;
    lfo.connect(lfoGain); lfoGain.connect(bed.frequency); lfo.start();

    // Slow amplitude breathing: perceptible, but deliberately below the threshold of a beat.
    // 0.08 Hz is a 12.5-second cycle. The gain moves roughly from .70 to 1.02.
    const breathLfo = ctx.createOscillator();
    const breathDepth = ctx.createGain();
    breathLfo.type = 'sine';
    breathLfo.frequency.value = .08;
    breathDepth.gain.value = .16;
    breathLfo.connect(breathDepth);
    breathDepth.connect(breath.gain);
    breathLfo.start();

    audio = { ctx, master, breath };
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
    audio.master.gain.setTargetAtTime(on ? .34 : 0, now, fast ? .12 : on ? .8 : .22);
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
