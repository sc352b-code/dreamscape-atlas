function waitForFamilyHome(){
  const root=document.querySelector('.atlas');
  const scene=document.querySelector('.flatmap-scene');
  if(!root||!scene){requestAnimationFrame(waitForFamilyHome);return}
  if(scene.querySelector('.family-home-approach'))return;

  const approach=document.createElement('section');
  approach.className='family-home-approach';
  approach.setAttribute('aria-label','Family Home place scene');
  approach.innerHTML=`
    <img class="family-home-octopus-art" src="/assets/family-home-pilot/family-home-octopus-tile.webp" alt="A small painterly octopus living in the Family Home stream" />
    <button type="button" class="family-home-scene-hotspot family-home-scene-hotspot--octopus" data-family-symbol="octopus" aria-label="Discover Octopus in the Family Home stream"><span>Octopus</span></button>
    <div class="family-home-approach-ui">
      <div class="family-home-approach-title">
        <small>The Hearthlands · place</small>
        <h2>Family Home</h2>
        <p>The recurring house and garden come forward from the territory. Move closer to discover quieter presences in the water and grounds.</p>
      </div>
      <div class="family-home-zoom-controls" role="group" aria-label="Family Home view depth">
        <button type="button" data-action="back">Back to Hearthlands</button>
        <span class="family-home-zoom-state" aria-live="polite"></span>
        <button type="button" class="primary" data-action="closer">Look closer</button>
      </div>
    </div>`;
  scene.appendChild(approach);

  const primary=approach.querySelector('[data-action="closer"]');
  const back=approach.querySelector('[data-action="back"]');
  const octopus=approach.querySelector('[data-family-symbol="octopus"]');
  const octopusArt=approach.querySelector('.family-home-octopus-art');

  const markOctopusReady=()=>{
    approach.dataset.octopusReady='true';
    delete approach.dataset.octopusMissing;
  };
  octopusArt.addEventListener('load',markOctopusReady);
  octopusArt.addEventListener('error',()=>{
    console.warn('Family Home Octopus artwork unavailable.');
    approach.dataset.octopusMissing='true';
    delete approach.dataset.octopusReady;
  });
  if(octopusArt.complete&&octopusArt.naturalWidth>0)markOctopusReady();

  function setFocus(level){
    if(!level){
      delete root.dataset.familyHomeFocus;
      root.dataset.semanticZoom='territory';
      primary.textContent='Look closer';
      back.textContent='Back to Hearthlands';
      document.querySelector('.family-symbol-reader')?.classList.remove('open');
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

  octopus.addEventListener('click',event=>{
    event.stopPropagation();
    if(root.dataset.familyHomeFocus!=='close'||approach.dataset.octopusReady!=='true')return;
    // Reuse the pilot's existing private v57 reader path without making its territory hotspot visible.
    const readerBridge=document.querySelector('.painted-symbol-hotspot[data-symbol="octopus"]');
    if(!readerBridge)return;
    const wasDisabled=readerBridge.disabled;
    readerBridge.disabled=false;
    readerBridge.click();
    readerBridge.disabled=wasDisabled;
  });

  window.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&root.dataset.familyHomeFocus)setFocus(null);
  });
}
waitForFamilyHome();
