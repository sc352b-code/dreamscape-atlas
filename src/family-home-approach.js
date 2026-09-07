function waitForFamilyHome(){
  const root=document.querySelector('.atlas');
  const scene=document.querySelector('.flatmap-scene');
  if(!root||!scene){requestAnimationFrame(waitForFamilyHome);return}
  if(scene.querySelector('.family-home-approach'))return;

  const approach=document.createElement('section');
  approach.className='family-home-approach';
  approach.setAttribute('aria-label','Family Home close view');
  approach.innerHTML=`
    <div class="family-home-approach-ui">
      <div class="family-home-approach-title">
        <small>The Hearthlands · entering</small>
        <h2>Family Home</h2>
        <p>A closer remembered landscape. Move inward to discover the smaller dream presences held here.</p>
      </div>
      <div class="family-home-zoom-controls" role="group" aria-label="Family Home view depth">
        <button type="button" data-action="back">Back to Hearthlands</button>
        <span class="family-home-zoom-state" aria-live="polite"></span>
        <button type="button" class="primary" data-action="closer">Look closer</button>
      </div>
      <div class="family-home-approach-hint">Place view reveals the home as a scene. Close view is where the quieter symbols become discoverable.</div>
    </div>`;
  scene.appendChild(approach);

  const primary=approach.querySelector('[data-action="closer"]');
  const back=approach.querySelector('[data-action="back"]');

  function setFocus(level){
    if(!level){
      delete root.dataset.familyHomeFocus;
      root.dataset.semanticZoom='territory';
      primary.textContent='Look closer';
      back.textContent='Back to Hearthlands';
      return;
    }
    root.dataset.familyHomeFocus=level;
    root.dataset.semanticZoom=level;
    if(level==='place'){
      primary.textContent='Look closer';
      back.textContent='Back to Hearthlands';
    }else{
      primary.textContent='Back out';
      back.textContent='Return to Hearthlands';
    }
  }

  document.addEventListener('click',event=>{
    const family=event.target.closest?.('[data-place="Family Home"]');
    if(!family)return;
    setFocus(root.dataset.familyHomeFocus==='place'?'close':'place');
  },true);

  primary.addEventListener('click',event=>{
    event.stopPropagation();
    setFocus(root.dataset.familyHomeFocus==='close'?'place':'close');
  });
  back.addEventListener('click',event=>{
    event.stopPropagation();
    setFocus(null);
    document.querySelector('.place-sheet')?.classList.remove('open');
  });

  window.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&root.dataset.familyHomeFocus)setFocus(null);
  });
}
waitForFamilyHome();
