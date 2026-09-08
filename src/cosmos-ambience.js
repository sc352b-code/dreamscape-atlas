function waitForAtlas(){
  const root=document.querySelector('.atlas');
  if(!root){requestAnimationFrame(waitForAtlas);return;}
  if(root.querySelector('.cosmic-spark-layer'))return;

  const style=document.createElement('style');
  style.textContent=`
    .cosmic-spark-layer{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}
    .bright-twinkle{position:absolute;left:var(--x);top:var(--y);width:2px;height:2px;border-radius:50%;background:rgba(255,250,232,.96);opacity:.035;box-shadow:0 0 4px rgba(255,245,218,.52);animation:brightTwinkle var(--d) ease-in-out var(--delay) infinite}
    .bright-twinkle::before,.bright-twinkle::after{content:"";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);opacity:0}
    .bright-twinkle::before{width:26px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,234,195,.94),transparent)}
    .bright-twinkle::after{width:1px;height:26px;background:linear-gradient(180deg,transparent,rgba(255,234,195,.86),transparent)}
    .bright-twinkle.glisten::before,.bright-twinkle.glisten::after{animation:glintCross var(--d) ease-in-out var(--delay) infinite}
    .cinematic-shooting-star{position:absolute;width:180px;height:1px;transform-origin:right center;background:linear-gradient(90deg,transparent,rgba(198,219,255,.18),rgba(255,237,203,.46),rgba(255,252,241,.98));filter:drop-shadow(0 0 5px rgba(255,228,181,.66));opacity:0;animation:shootAcross 1.8s cubic-bezier(.18,.58,.3,1) forwards}
    .cosmic-sound-toggle{position:fixed;right:20px;bottom:18px;z-index:80;display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:999px;border:1px solid rgba(240,204,151,.2);background:rgba(6,7,18,.64);backdrop-filter:blur(13px);box-shadow:0 9px 30px rgba(0,0,0,.25);color:#cbb9b3;font:600 9px/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}
    .cosmic-sound-toggle i{display:block;width:8px;height:8px;border-radius:50%;background:#756d7c}.cosmic-sound-toggle[aria-pressed="true"] i{background:#e4bc80;box-shadow:0 0 12px rgba(228,188,128,.6)}.cosmic-sound-toggle .state{opacity:.68;font-weight:500}
    @keyframes brightTwinkle{0%,82%,100%{opacity:.025;transform:scale(.65)}87%{opacity:.22;transform:scale(1.15)}90%{opacity:1;transform:scale(2.35);box-shadow:0 0 8px rgba(255,247,223,.95),0 0 24px rgba(255,205,137,.48)}94%{opacity:.12;transform:scale(.84)}}
    @keyframes glintCross{0%,85%,100%{opacity:0;transform:translate(-50%,-50%) scale(.35)}90%{opacity:.9;transform:translate(-50%,-50%) scale(1.15)}94%{opacity:0;transform:translate(-50%,-50%) scale(.7)}}
    @keyframes shootAcross{0%{opacity:0;transform:translate3d(0,0,0) rotate(var(--angle)) scaleX(.25)}9%{opacity:.96}100%{opacity:0;transform:translate3d(460px,180px,0) rotate(var(--angle)) scaleX(1.2)}}
    @media(max-width:800px){.cosmic-sound-toggle{right:10px;bottom:10px;padding:9px}.cosmic-sound-toggle .label{display:none}}
    @media(prefers-reduced-motion:reduce){.bright-twinkle,.bright-twinkle::before,.bright-twinkle::after{animation:none!important}.cinematic-shooting-star{display:none!important}}
  `;
  document.head.appendChild(style);

  const sparks=document.createElement('div');sparks.className='cosmic-spark-layer';
  for(let i=0;i<18;i++){const star=document.createElement('i');star.className=`bright-twinkle${i%4===0?' glisten':''}`;star.style.setProperty('--x',`${3+Math.random()*94}%`);star.style.setProperty('--y',`${4+Math.random()*88}%`);star.style.setProperty('--d',`${11+Math.random()*12}s`);star.style.setProperty('--delay',`${-Math.random()*20}s`);sparks.appendChild(star)}
  root.appendChild(sparks);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function shoot(){if(reduced||document.hidden)return;const s=document.createElement('i');s.className='cinematic-shooting-star';s.style.left=`${-10+Math.random()*46}%`;s.style.top=`${6+Math.random()*30}%`;s.style.setProperty('--angle',`${14+Math.random()*8}deg`);sparks.appendChild(s);setTimeout(()=>s.remove(),2200)}
  function scheduleShot(){setTimeout(()=>{shoot();scheduleShot()},35000+Math.random()*40000)}scheduleShot();

  const toggle=document.createElement('button');toggle.className='cosmic-sound-toggle';toggle.type='button';toggle.innerHTML='<i></i><span class="label">Celestial bowl</span><span class="state">ready</span>';toggle.setAttribute('aria-label','Toggle meditative celestial ambience');toggle.setAttribute('aria-pressed','false');document.body.appendChild(toggle);
  const stored=localStorage.getItem('dreamscape-cosmic-sound');let wanted=stored!=='off';let started=false;let audio=null;

  function buildAudio(){
    if(audio)return audio;
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
    const ctx=new AC({latencyHint:'interactive'});
    const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-31;compressor.knee.value=30;compressor.ratio.value=1.48;compressor.attack.value=.2;compressor.release.value=3.2;compressor.connect(ctx.destination);
    const master=ctx.createGain();master.gain.value=0;master.connect(compressor);

    // Exact-Hz meditation tuning. These frequencies are commonly marketed in wellness audio;
    // they are used here as an aesthetic tuning system, not as a medical/healing claim.
    const MEDITATION_FREQS=[108,216,432,528,639,741,852,963];

    // Permanent low singing-bowl body: tonal only, no broadband noise. Modulation has been
    // slowed so the same sound breathes more gradually rather than pulsing quickly.
    const bed=ctx.createGain();bed.gain.value=.62;bed.connect(master);
    const bedFreqs=[54,108,216,432];
    bedFreqs.forEach((frequency,index)=>{
      const osc=ctx.createOscillator();const gain=ctx.createGain();
      osc.type='sine';osc.frequency.value=frequency;gain.gain.value=[.024,.014,.007,.0024][index];
      const lfo=ctx.createOscillator();const lfoGain=ctx.createGain();
      lfo.frequency.value=.006+index*.0025;lfoGain.gain.value=[.0048,.0036,.0022,.0009][index];
      lfo.connect(lfoGain);lfoGain.connect(gain.gain);lfo.start();
      osc.connect(gain);gain.connect(bed);osc.start();
    });

    // Permanent high shimmer using exact members of the same tuning set, also drifting more slowly.
    const resonance=ctx.createGain();resonance.gain.value=.27;resonance.connect(master);
    [432,528,639].forEach((frequency,index)=>{
      const osc=ctx.createOscillator();const gain=ctx.createGain();const drift=ctx.createOscillator();const driftGain=ctx.createGain();
      osc.type='sine';osc.frequency.value=frequency;gain.gain.value=[.0046,.0025,.0013][index];
      drift.frequency.value=.004+index*.002;driftGain.gain.value=.45+index*.16;drift.connect(driftGain);driftGain.connect(osc.detune);drift.start();
      osc.connect(gain);gain.connect(resonance);osc.start();
    });

    const bowlBus=ctx.createGain();bowlBus.gain.value=.86;bowlBus.connect(master);
    const delay=ctx.createDelay(2.5);delay.delayTime.value=.92;const feedback=ctx.createGain();feedback.gain.value=.27;const wet=ctx.createGain();wet.gain.value=.28;bowlBus.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(master);

    function tone(frequency,gainValue,attack,decay,destination=bowlBus,delayStart=0){
      const now=ctx.currentTime+delayStart;const osc=ctx.createOscillator();const gain=ctx.createGain();
      osc.type='sine';osc.frequency.value=frequency;osc.detune.value=(Math.random()-.5)*1.2;
      gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(gainValue,now+attack);gain.gain.exponentialRampToValueAtTime(.0001,now+decay);
      osc.connect(gain);gain.connect(destination);osc.start(now);osc.stop(now+decay+.25);
    }

    function bowlBloom(strength=.8){
      if(!wanted||document.hidden||ctx.state!=='running')return;
      [[108,.043,19.5],[216,.018,17.2],[432,.0095,15.2],[528,.0048,12.8]].forEach(([frequency,gainValue,decay],index)=>tone(frequency,gainValue*strength,.62+index*.08,decay));
      tone(741,.0026*strength,.78,10.6,bowlBus,1.08);
    }

    function starTwinkle(frequency=null,strength=.72){
      if(!wanted||document.hidden||ctx.state!=='running')return;
      const pool=[528,639,741,852,963];
      const chosen=frequency||pool[Math.floor(Math.random()*pool.length)];
      tone(chosen,.0035*strength,.13,4.8);
      tone(chosen*2,.0011*strength,.22,3.2,bowlBus,.16);
    }

    let bloomTimer=null;let twinkleTimer=null;
    function scheduleBloom(first=false){clearTimeout(bloomTimer);bloomTimer=setTimeout(()=>{bowlBloom(.76+Math.random()*.2);scheduleBloom(false)},first?650:7600+Math.random()*3300)}
    function scheduleTwinkle(first=false){clearTimeout(twinkleTimer);twinkleTimer=setTimeout(()=>{starTwinkle(null,.64+Math.random()*.22);scheduleTwinkle(false)},first?1300:3300+Math.random()*3200)}
    scheduleBloom(true);scheduleTwinkle(true);

    function tunnelBloom(){
      bowlBloom(.98);
      starTwinkle(852,.92);
      setTimeout(()=>starTwinkle(963,.76),520);
      setTimeout(()=>starTwinkle(741,.64),1100);
    }

    audio={ctx,master,scheduleBloom,scheduleTwinkle,bowlBloom,starTwinkle,tunnelBloom,MEDITATION_FREQS};return audio;
  }

  function updateToggle(){const on=wanted&&started&&audio?.ctx.state==='running';toggle.setAttribute('aria-pressed',on?'true':'false');toggle.querySelector('.state').textContent=on?'on':wanted?'ready':'off'}
  function setGain(on,fast=false){if(!audio)return;const now=audio.ctx.currentTime;audio.master.gain.cancelScheduledValues(now);audio.master.gain.setTargetAtTime(on ? .52 : 0,now,fast ? .08 : on ? .7 : .22)}
  async function startFromGesture(){if(started||!wanted){updateToggle();return}const a=buildAudio();if(!a){toggle.querySelector('.state').textContent='unsupported';return}started=true;try{await a.ctx.resume()}catch(_){}setGain(true);updateToggle()}
  function setSound(on){wanted=on;localStorage.setItem('dreamscape-cosmic-sound',on?'on':'off');if(!started&&on){updateToggle();return}if(audio?.ctx.state==='suspended'&&on)audio.ctx.resume().then(()=>{setGain(true);updateToggle()});else{setGain(on);updateToggle()}}
  toggle.addEventListener('pointerdown',e=>e.stopPropagation());toggle.addEventListener('click',async e=>{e.stopPropagation();if(!started){wanted=true;localStorage.setItem('dreamscape-cosmic-sound','on');await startFromGesture()}else setSound(!wanted)});
  const gesture=()=>startFromGesture();window.addEventListener('pointerdown',gesture,{capture:true});window.addEventListener('keydown',gesture,{capture:true});
  window.addEventListener('dreamscape:cosmic-tunnel',async()=>{if(wanted&&!started)await startFromGesture();if(audio&&wanted){try{if(audio.ctx.state==='suspended')await audio.ctx.resume()}catch(_){}audio.tunnelBloom();}});
  document.addEventListener('visibilitychange',()=>{if(!audio||!started)return;if(document.hidden)setGain(false,true);else if(wanted){if(audio.ctx.state==='suspended')audio.ctx.resume().then(()=>{setGain(true);updateToggle()});else setGain(true)}});
  updateToggle();
}
waitForAtlas();
