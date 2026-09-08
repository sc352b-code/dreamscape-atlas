function mountFamilyHomeV2(){
  const root=document.querySelector('.atlas');
  const flatmap=document.querySelector('.flatmap-scene');
  if(!root||!flatmap){requestAnimationFrame(mountFamilyHomeV2);return}
  if(flatmap.querySelector('.family-home-v2'))return;

  const old=flatmap.querySelector('.family-home-approach');
  if(old)old.remove();

  const scene=document.createElement('section');
  scene.className='family-home-v2';
  scene.setAttribute('aria-label','Family Home place scene');
  scene.innerHTML=`
    <img class="family-home-v2-backdrop" src="/assets/family-home-pilot/family-home-scene.avif" alt="" aria-hidden="true" />
    <div class="family-home-v2-artboard">
      <img class="family-home-v2-art" src="/assets/family-home-pilot/family-home-scene.avif" alt="A luminous painterly Family Home with a house, garden, bridges and stream" />
      <button class="family-home-v2-octopus" type="button" aria-label="Discover Octopus in the stream"><span>Octopus</span></button>
    </div>
    <div class="family-home-v2-title"><small>The Hearthlands · place</small><h2>Family Home</h2><p>House, garden and water gather into a recurring domestic world. Move closer to discover quieter presences woven into the scene.</p></div>
    <div class="family-home-v2-controls"><button data-home-action="return">Back to Hearthlands</button><span class="family-home-v2-depth"></span><button class="primary" data-home-action="closer">Look closer</button></div>`;
  flatmap.appendChild(scene);

  const art=scene.querySelector('.family-home-v2-art');
  const octopus=scene.querySelector('.family-home-v2-octopus');
  const closer=scene.querySelector('[data-home-action="closer"]');
  const back=scene.querySelector('[data-home-action="return"]');
  art.addEventListener('load',()=>scene.dataset.ready='true');
  art.addEventListener('error',()=>scene.dataset.ready='false');
  if(art.complete&&art.naturalWidth)scene.dataset.ready='true';

  function enter(level='place'){
    document.querySelector('.place-sheet')?.classList.remove('open');
    root.dataset.familyHomeV2=level;
    root.dataset.semanticZoom=level;
    closer.textContent=level==='close'?'Back out':'Look closer';
    back.textContent=level==='close'?'Return to Hearthlands':'Back to Hearthlands';
  }
  function leave(){
    delete root.dataset.familyHomeV2;
    root.dataset.semanticZoom='territory';
    document.querySelector('.family-symbol-reader')?.classList.remove('open');
  }

  document.addEventListener('click',event=>{
    const marker=event.target.closest?.('[data-place="Family Home"]');
    if(!marker)return;
    event.preventDefault();event.stopPropagation();
    enter('place');
  },true);
  window.addEventListener('dreamscape:enter-family-home',()=>enter('place'));

  closer.addEventListener('click',e=>{e.stopPropagation();enter(root.dataset.familyHomeV2==='close'?'place':'close')});
  back.addEventListener('click',e=>{e.stopPropagation();leave()});
  octopus.addEventListener('click',e=>{
    e.stopPropagation();
    if(root.dataset.familyHomeV2!=='close'||scene.dataset.ready!=='true')return;
    const bridge=document.querySelector('.painted-symbol-hotspot[data-symbol="octopus"]');
    if(!bridge)return;
    const disabled=bridge.disabled;bridge.disabled=false;bridge.click();bridge.disabled=disabled;
  });
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.dataset.familyHomeV2)leave()});
}
mountFamilyHomeV2();
