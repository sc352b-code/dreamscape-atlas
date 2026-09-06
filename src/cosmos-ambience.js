function waitForAtlas() {
  const root = document.querySelector('.atlas');
  if (!root) { requestAnimationFrame(waitForAtlas); return; }
  if (root.querySelector('.cosmic-spark-layer')) return;

  const style = document.createElement('style');
  style.textContent = `
    .cosmic-spark-layer{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}
    .bright-twinkle{position:absolute;left:var(--x);top:var(--y);width:2px;height:2px;border-radius:50%;background:rgba(255,248,224,.9);opacity:.08;box-shadow:0 0 5px rgba(255,244,210,.7);animation:brightTwinkle var(--d) ease-in-out var(--delay) infinite}
    .bright-twinkle::before,.bright-twinkle::after{content:"";position:absolute;left:50%;top:50%;background:linear-gradient(90deg,transparent,rgba(255,231,185,.9),transparent);transform:translate(-50%,-50%);opacity:0}
    .bright-twinkle::before{width:22px;height:1px}.bright-twinkle::after{width:1px;height:22px;background:linear-gradient(180deg,transparent,rgba(255,231,185,.82),transparent)}
    .bright-twinkle.glisten::before,.bright-twinkle.glisten::after{animation:glintCross var(--d) ease-in-out var(--delay) infinite}
    .cinematic-shooting-star{position:absolute;width:150px;height:1px;transform-origin:right center;background:linear-gradient(90deg,transparent,rgba(255,231,189,.32),rgba(255,250,235,.95));filter:drop-shadow(0 0 4px rgba(255,226,180,.65));opacity:0;animation:shootAcross 1.55s cubic-bezier(.2,.6,.35,1) forwards}
    .cosmic-sound-toggle{position:fixed;right:20px;bottom:18px;z-index:80;display:flex;align-items:center;gap:8px;padding:9px 11px;border-radius:999px;border:1px solid rgba(240,204,151,.18);background:rgba(7,8,20,.54);backdrop-filter:blur(13px);box-shadow:0 9px 30px rgba(0,0,0,.2);color:#cbb9b3;font:600 9px/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:background .2s ease,border-color .2s ease,color .2s ease}
    .cosmic-sound-toggle:hover{background:rgba(20,14,33,.7);border-color:rgba(240,204,151,.34);color:#efd8bd}
    .cosmic-sound-toggle i{display:block;width:8px;height:8px;border-radius:50%;background:#9f8b91;box-shadow:0 0 0 rgba(220,178,115,0);transition:.2s ease}
    .cosmic-sound-toggle[aria-pressed="true"] i{background:#e4bc80;box-shadow:0 0 12px rgba(228,188,128,.58)}
    @keyframes brightTwinkle{0%,78%,100%{opacity:.05;transform:scale(.7)}84%{opacity:.38;transform:scale(1.2)}88%{opacity:1;transform:scale(2.2);box-shadow:0 0 7px rgba(255,244,210,.9),0 0 20px rgba(255,203,132,.48)}92%{opacity:.24;transform:scale(.9)}}
    @keyframes glintCross{0%,82%,100%{opacity:0;transform:translate(-50%,-50%) scale(.4)}88%{opacity:.88;transform:translate(-50%,-50%) scale(1.15)}92%{opacity:0;transform:translate(-50%,-50%) scale(.65)}}
    @keyframes shootAcross{0%{opacity:0;transform:translate3d(0,0,0) rotate(var(--angle)) scaleX(.35)}10%{opacity:.9}100%{opacity:0;transform:translate3d(360px,155px,0) rotate(var(--angle)) scaleX(1.15)}}
    @media(max-width:800px){.cosmic-sound-toggle{right:10px;bottom:10px;padding:8px 9px}.cosmic-sound-toggle span{display:none}}
    @media(prefers-reduced-motion:reduce){.bright-twinkle,.bright-twinkle::before,.bright-twinkle::after{animation:none!important}.cinematic-shooting-star{display:none!important}}
  `;
  document.head.appendChild(style);

  const sparks = document.createElement('div');
  sparks.className = 'cosmic-spark-layer';
  for (let i = 0; i < 32; i += 1) {
    const star = document.createElement('i');
    star.className = `bright-twinkle${i % 3 === 0 ? ' glisten' : ''}`;
    star.style.setProperty('--x', `${3 + Math.random() * 94}%`);
    star.style.setProperty('--y', `${4 + Math.random() * 90}%`);
    star.style.setProperty('--d', `${7.5 + Math.random() * 10}s`);
    star.style.setProperty('--delay', `${-Math.random() * 14}s`);
    sparks.appendChild(star);
  }
  root.appendChild(sparks);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function shoot() {
    if (reduced || document.hidden) return;
    const s = document.createElement('i');
    s.className = 'cinematic-shooting-star';
    s.style.left = `${-12 + Math.random() * 52}%`;
    s.style.top = `${5 + Math.random() * 34}%`;
    s.style.setProperty('--angle', `${14 + Math.random() * 8}deg`);
    sparks.appendChild(s);
    setTimeout(() => s.remove(), 1900);
  }
  let shootingTimer = null;
  function scheduleShootingStar() {
    clearTimeout(shootingTimer);
    shootingTimer = setTimeout(() => {
      shoot();
      scheduleShootingStar();
    }, 24000 + Math.random() * 36000);
  }
  setTimeout(shoot, 9000 + Math.random() * 7000);
  scheduleShootingStar();

  const toggle = document.createElement('button');
  toggle.className = 'cosmic-sound-toggle';
  toggle.type = 'button';
  toggle.innerHTML = '<i></i><span>Cosmic hum</span>';
  toggle.setAttribute('aria-label', 'Toggle ambient cosmic sound');
  document.body.appendChild(toggle);

  const stored = localStorage.getItem('dreamscape-cosmic-sound');
  let wanted = stored !== 'off';
  let audio = null;
  let started = false;

  function buildAudio() {
    if (audio) return audio;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const bed = ctx.createBiquadFilter();
    bed.type = 'lowpass';
    bed.frequency.value = 780;
    bed.Q.value = .45;
    bed.connect(master);

    const voices = [54, 81, 108, 162, 432];
    voices.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = index < 3 ? 'sine' : 'triangle';
      osc.frequency.value = frequency;
      gain.gain.value = index === 4 ? .003 : (.010 - index * .0015);
      osc.connect(gain); gain.connect(bed); osc.start();
    });

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine'; lfo.frequency.value = .055; lfoGain.gain.value = 115;
    lfo.connect(lfoGain); lfoGain.connect(bed.frequency); lfo.start();

    const breathe = ctx.createOscillator();
    const breatheGain = ctx.createGain();
    breathe.type = 'sine'; breathe.frequency.value = .028; breatheGain.gain.value = .0045;
    breathe.connect(breatheGain); breatheGain.connect(master.gain); breathe.start();

    audio = { ctx, master };
    return audio;
  }

  function setSound(on) {
    wanted = on;
    localStorage.setItem('dreamscape-cosmic-sound', on ? 'on' : 'off');
    toggle.setAttribute('aria-pressed', on && started ? 'true' : 'false');
    if (!started) return;
    const a = buildAudio();
    if (!a) return;
    if (a.ctx.state === 'suspended') a.ctx.resume();
    const now = a.ctx.currentTime;
    a.master.gain.cancelScheduledValues(now);
    a.master.gain.setTargetAtTime(on ? .048 : 0, now, on ? 1.4 : .45);
  }

  async function startFromGesture() {
    if (started || !wanted) return;
    const a = buildAudio();
    if (!a) return;
    started = true;
    try { await a.ctx.resume(); } catch (_) {}
    setSound(true);
  }

  toggle.setAttribute('aria-pressed', 'false');
  toggle.addEventListener('click', async (event) => {
    event.stopPropagation();
    if (!started) {
      wanted = true;
      await startFromGesture();
    } else {
      setSound(!wanted);
    }
  });

  const gesture = () => startFromGesture();
  window.addEventListener('pointerdown', gesture, { once: true, capture: true });
  window.addEventListener('keydown', gesture, { once: true, capture: true });
  document.addEventListener('visibilitychange', () => {
    if (!audio || !started) return;
    const now = audio.ctx.currentTime;
    audio.master.gain.setTargetAtTime(document.hidden ? 0 : (wanted ? .048 : 0), now, document.hidden ? .2 : 1.2);
  });
}

waitForAtlas();
