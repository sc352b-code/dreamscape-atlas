const FINAL_HEARTHLANDS_ART='/worlds/reference-world/territories/hearthlands/assets/hearthlands-flat-map.png';

function bootTransitionOwner(){
  const root=document.querySelector('.atlas');
  const scene=document.querySelector('.flatmap-scene');
  const world=document.querySelector('.flatmap-world');
  const art=document.querySelector('.flatmap-art');
  if(!root||!scene||!world||!art){requestAnimationFrame(bootTransitionOwner);return;}
  if(root.dataset.hearthlandsTransitionOwner==='ready') return;
  root.dataset.hearthlandsTransitionOwner='ready';

  // The final locked map is the only asset allowed to participate in the descent.
  // Preload it at boot so the reveal never waits on an image swap.
  const preload=new Image();
  preload.decoding='async';
  preload.src=FINAL_HEARTHLANDS_ART;
  preload.decode?.().catch(()=>{});
  if(!art.src.endsWith(FINAL_HEARTHLANDS_ART)) art.src=FINAL_HEARTHLANDS_ART;

  // During descent and Hearthlands, this module owns the OUTER map framing.
  // Territory v1 still owns pan/zoom on its inner map. This prevents the legacy
  // main.js layout/parallax code from producing a one-frame alternate view.
  const style=document.createElement('style');
  style.id='hearthlands-transition-owner-style';
  style.textContent=`
    .atlas.hearthlands-transition-owned .flatmap-world{
      width:var(--hearthlands-owned-width)!important;
      height:var(--hearthlands-owned-height)!important;
      left:var(--hearthlands-owned-left)!important;
      top:var(--hearthlands-owned-top)!important;
      transform:none!important;
    }
  `;
  document.head.appendChild(style);

  let frame=0;

  function fitOwnedWorld(){
    const vw=innerWidth;
    const safeTop=8;
    const safeBottom=8;
    const availableHeight=Math.max(240,innerHeight-safeTop-safeBottom);
    const ratio=1.5;
    let width=Math.min(vw,availableHeight*ratio);
    let height=width/ratio;
    if(height>availableHeight){height=availableHeight;width=height*ratio;}
    const left=(vw-width)/2;
    const top=safeTop+(availableHeight-height)/2;
    root.style.setProperty('--hearthlands-owned-width',`${width}px`);
    root.style.setProperty('--hearthlands-owned-height',`${height}px`);
    root.style.setProperty('--hearthlands-owned-left',`${left}px`);
    root.style.setProperty('--hearthlands-owned-top',`${top}px`);
  }

  function stopLoop(){
    if(frame){cancelAnimationFrame(frame);frame=0;}
  }

  function revealLoop(){
    if(root.dataset.state!=='descent'){frame=0;return;}
    fitOwnedWorld();
    const raw=Number.parseFloat(root.style.getPropertyValue('--descent'))||0;

    // The map begins to appear almost immediately and continuously, rather than
    // allowing a dark pause followed by a late layout handoff.
    const progress=Math.max(0,Math.min(1,(raw-.045)/.79));
    const eased=progress<.5
      ? 4*progress*progress*progress
      : 1-Math.pow(-2*progress+2,3)/2;
    const opacity=Math.min(1,.035+eased*1.03);
    const radius=2+eased*163;
    scene.style.setProperty('opacity',String(opacity),'important');
    scene.style.setProperty('clip-path',`circle(${radius}% at var(--focus-x,50%) var(--focus-y,50%))`,'important');
    frame=requestAnimationFrame(revealLoop);
  }

  function ownTransition(){
    root.classList.add('hearthlands-transition-owned');
    fitOwnedWorld();
  }

  function settle(){
    stopLoop();
    ownTransition();
    scene.style.setProperty('opacity','1','important');
    scene.style.setProperty('clip-path','circle(165% at 50% 50%)','important');
    root.classList.add('hearthlands-transition-stable');
  }

  function leave(){
    stopLoop();
    root.classList.remove('hearthlands-transition-owned','hearthlands-transition-stable');
    scene.style.removeProperty('opacity');
    scene.style.removeProperty('clip-path');
  }

  function sync(){
    const state=root.dataset.state;
    if(state==='descent'){
      root.classList.remove('hearthlands-transition-stable');
      ownTransition();
      stopLoop();
      frame=requestAnimationFrame(revealLoop);
    }else if(state==='hearth'){
      settle();
    }else{
      leave();
    }
  }

  addEventListener('resize',()=>{
    if(root.classList.contains('hearthlands-transition-owned')) fitOwnedWorld();
  });
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-state']});
  sync();
}

bootTransitionOwner();
