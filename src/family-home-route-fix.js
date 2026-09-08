function waitForFamilyHomeRoute(){
  const root=document.querySelector('.atlas');
  const scene=document.querySelector('.flatmap-scene');
  if(!root||!scene){requestAnimationFrame(waitForFamilyHomeRoute);return;}
  if(window.__familyHomeRouteFix)return;
  window.__familyHomeRouteFix=true;

  function enterFamilyHome(){
    if(root.dataset.state!=='hearth')return;
    root.dataset.familyHomeFocus='place';
    root.dataset.semanticZoom='place';
    document.querySelector('.place-sheet')?.classList.remove('open');
    scene.dispatchEvent(new CustomEvent('dreamscape:family-home-enter',{bubbles:true}));
  }

  const activate=event=>{
    const family=event.target.closest?.('[data-place="Family Home"]');
    if(!family)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    enterFamilyHome();
  };

  document.addEventListener('pointerdown',activate,true);
  document.addEventListener('click',activate,true);
  window.enterDreamscapeFamilyHome=enterFamilyHome;
}
waitForFamilyHomeRoute();
