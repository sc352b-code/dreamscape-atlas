function waitForAtlas(){
  const root=document.querySelector('.atlas');
  if(!root){requestAnimationFrame(waitForAtlas);return}
  if(document.querySelector('.cosmic-meditation-toggle'))return;

  const toggle=document.createElement('button');
  toggle.className='cosmic-sound-toggle cosmic-meditation-toggle';
  toggle.type='button';
  toggle.innerHTML='<i></i><span class="label">Cosmic resonance</span><span class="state">ready</span>';
  toggle.setAttribute('aria-label','Toggle meditative cosmic resonance');
  toggle.setAttribute('aria-pressed','false');
  document.body.appendChild(toggle);

  const stored=localStorage.getItem('dreamscape-cosmic-sound');
  let wanted=stored!=='off';
  let started=false;
  let audio=null;

  function buildAudio(){
    if(audio)return audio;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    const ctx=new AC({latencyHint:'interactive'});
    const compressor=ctx.createDynamicsCompressor();
    compressor.threshold.value=-33;compressor.knee.value=28;compressor.ratio.value=1.7;compressor.attack.value=.2;compressor.release.value=2;
    compressor.connect(ctx.destination);
    const master=ctx.createGain();master.gain.value=0;master.connect(compressor);

    // Continuous meditation accompaniment: pure tonal resonance, never broadband noise.
    const bed=ctx.createGain();bed.gain.value=.24;bed.connect(master);
    [73.42,110,146.83].forEach((frequency,index)=>{
      const osc=ctx.createOscillator();const gain=ctx.createGain();const lfo=ctx.createOscillator();const lfoGain=ctx.createGain();
      osc.type='sine';osc.frequency.value=frequency;gain.gain.value=[.018,.010,.006][index];
      lfo.type='sine';lfo.frequency.value=[.024,.018,.013][index];lfoGain.gain.value=[.004,.0024,.0015][index];
      lfo.connect(lfoGain);lfoGain.connect(gain.gain);osc.connect(gain);gain.connect(bed);osc.start();lfo.start();
    });

    const halo=ctx.createGain();halo.gain.value=.72;halo.connect(master);
    const delayA=ctx.createDelay(2);delayA.delayTime.value=.62;const feedbackA=ctx.createGain();feedbackA.gain.value=.29;const wetA=ctx.createGain();wetA.gain.value=.17;
    halo.connect(delayA);delayA.connect(feedbackA);feedbackA.connect(delayA);delayA.connect(wetA);wetA.connect(master);
    const delayB=ctx.createDelay(2);delayB.delayTime.value=.94;const feedbackB=ctx.createGain();feedbackB.gain.value=.17;const wetB=ctx.createGain();wetB.gain.value=.10;
    halo.connect(delayB);delayB.connect(feedbackB);feedbackB.connect(delayB);delayB.connect(wetB);wetB.connect(master);

    function bowlBloom(){
      if(!wanted||document.hidden||ctx.state!=='running')return;
      const now=ctx.currentTime;const base=146.83*Math.pow(2,((Math.random()*4)-2)/1200);
      [{r:1,g:.025,a:.38,d:14},{r:2.01,g:.011,a:.58,d:11.5},{r:2.72,g:.0056,a:.76,d:9.5},{r:4.08,g:.0028,a:.95,d:8}].forEach(p=>{
        const osc=ctx.createOscillator();const gain=ctx.createGain();osc.type='sine';osc.frequency.value=base*p.r;osc.detune.value=(Math.random()-.5)*2;
        gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(p.g,now+p.a);gain.gain.exponentialRampToValueAtTime(.0001,now+p.d);
        osc.connect(gain);gain.connect(halo);osc.start(now);osc.stop(now+p.d+.3);
      });
    }
    function upperBloom(){
      if(!wanted||document.hidden||ctx.state!=='running')return;
      const now=ctx.currentTime;const osc=ctx.createOscillator();const gain=ctx.createGain();osc.type='sine';osc.frequency.value=587.33*(.997+Math.random()*.006);
      gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.003,now+.7);gain.gain.exponentialRampToValueAtTime(.0001,now+9);
      osc.connect(gain);gain.connect(halo);osc.start(now);osc.stop(now+9.2);
    }
    let bowlTimer,bellTimer;
    const scheduleBowl=(first=false)=>{clearTimeout(bowlTimer);bowlTimer=setTimeout(()=>{bowlBloom();scheduleBowl(false)},first?1200:14500+Math.random()*9500)};
    const scheduleBell=()=>{clearTimeout(bellTimer);bellTimer=setTimeout(()=>{upperBloom();scheduleBell()},28000+Math.random()*20000)};
    scheduleBowl(true);scheduleBell();
    audio={ctx,master};return audio;
  }

  function update(){const on=wanted&&started&&audio?.ctx.state==='running';toggle.setAttribute('aria-pressed',on?'true':'false');toggle.querySelector('.state').textContent=on?'on':wanted?'ready':'off'}
  function gain(on,fast=false){if(!audio)return;const now=audio.ctx.currentTime;audio.master.gain.cancelScheduledValues(now);audio.master.gain.setTargetAtTime(on?.37:0,now,fast?.1:on?.95:.22)}
  async function start(){if(started||!wanted){update();return}const a=buildAudio();if(!a){toggle.querySelector('.state').textContent='unsupported';return}started=true;try{await a.ctx.resume()}catch(_){}gain(true);update()}
  function setSound(on){wanted=on;localStorage.setItem('dreamscape-cosmic-sound',on?'on':'off');if(!started&&on){update();return}if(audio?.ctx.state==='suspended'&&on)audio.ctx.resume().then(()=>{gain(true);update()});else{gain(on);update()}}
  toggle.addEventListener('pointerdown',e=>e.stopPropagation());
  toggle.addEventListener('click',async e=>{e.stopPropagation();if(!started){wanted=true;localStorage.setItem('dreamscape-cosmic-sound','on');await start()}else setSound(!wanted)});
  window.addEventListener('pointerdown',start,{capture:true});window.addEventListener('keydown',start,{capture:true});
  document.addEventListener('visibilitychange',()=>{if(!audio||!started)return;if(document.hidden)gain(false,true);else if(wanted){if(audio.ctx.state==='suspended')audio.ctx.resume().then(()=>{gain(true);update()});else gain(true)}});
  update();
}
waitForAtlas();
