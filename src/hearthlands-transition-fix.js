const FINAL_HEARTHLANDS_ART='/worlds/reference-world/territories/hearthlands/assets/hearthlands-flat-map.png';

function bootTransitionFix(){
  const root=document.querySelector('.atlas');
  const scene=document.querySelector('.flatmap-scene');
  const art=document.querySelector('.flatmap-art');
  if(!root||!scene||!art){requestAnimationFrame(bootTransitionFix);return;}

  // Never allow the legacy flat-map asset to flash during the planet descent.
  if(!art.src.endsWith(FINAL_HEARTHLANDS_ART)) art.src=FINAL_HEARTHLANDS_ART;

  let descentFrame=0;
  function stopDescentLoop(){if(descentFrame){cancelAnimationFrame(descentFrame);descentFrame=0;}}

  function animateDescentReveal(){
    if(root.dataset.state!=='descent'){descentFrame=0;return;}
    const raw=parseFloat(root.style.getPropertyValue('--descent'))||0;
    // Begin revealing much earlier than the legacy 38% point. This preserves
    // the feeling of travelling through the planet without a long black hold.
    const reveal=Math.max(0,Math.min(1,(raw-.12)/.72));
    const eased=1-Math.pow(1-reveal,2.15);
    scene.style.setProperty('opacity',String(Math.min(1,eased*1.08)),'important');
    scene.style.setProperty('clip-path',`circle(${Math.max(2,eased*150)}% at var(--focus-x,50%) var(--focus-y,50%))`,'important');
    descentFrame=requestAnimationFrame(animateDescentReveal);
  }

  function settleHearthlands(){
    stopDescentLoop();
    scene.style.setProperty('opacity','1','important');
    scene.style.setProperty('clip-path','circle(150% at 50% 50%)','important');
    root.classList.add('hearthlands-transition-stable');

    // main.js still performs a legacy flat-map layout at the exact end of the
    // descent. Re-run the Territory v1 viewport immediately afterwards so the
    // user never sees that intermediate framing.
    requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
    setTimeout(()=>window.dispatchEvent(new Event('resize')),24);
    setTimeout(()=>window.dispatchEvent(new Event('resize')),90);
  }

  function leaveHearthlands(){
    stopDescentLoop();
    root.classList.remove('hearthlands-transition-stable');
    scene.style.removeProperty('opacity');
    scene.style.removeProperty('clip-path');
  }

  function sync(){
    const state=root.dataset.state;
    if(state==='descent'){
      stopDescentLoop();
      descentFrame=requestAnimationFrame(animateDescentReveal);
    }else if(state==='hearth') settleHearthlands();
    else leaveHearthlands();
  }

  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-state']});
  sync();
}

bootTransitionFix();
