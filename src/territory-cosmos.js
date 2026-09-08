const WORLDS=[
  {id:'littoral',name:'Littoral Coast',cue:'Tides · islands · shorelines'},
  {id:'roadlands',name:'The Roadlands',cue:'Journeys · crossings · movement'},
  {id:'hearthlands',name:'The Hearthlands',cue:'Home · gardens · belonging',live:true},
  {id:'institutional',name:'Institutional Quarter',cue:'Structure · authority · public space'},
  {id:'river',name:'River Country',cue:'Waterways · bridges · flow'},
];

function mountTerritoryCosmos(){
  const root=document.querySelector('.atlas');
  if(!root||root.querySelector('.territory-cosmos'))return false;
  root.classList.add('territory-worlds-mode');

  const section=document.createElement('section');
  section.className='territory-cosmos';
  section.setAttribute('aria-label','Choose a dream territory');
  section.innerHTML=`
    <div class="territory-cosmos__heading">
      <small>Your living dream atlas</small>
      <h1>Dream Atlas</h1>
      <p>Choose a territory and enter its world.</p>
    </div>
    ${WORLDS.map(world=>`
      <button class="territory-world" data-world="${world.id}" type="button" aria-label="${world.name}${world.live?' — enter territory map':' — territory world preview'}">
        <span class="territory-world__sphere"><span class="territory-world__texture" aria-hidden="true"></span></span>
        <span class="territory-world__name">${world.name}</span>
        <span class="territory-world__cue">${world.cue}</span>
      </button>`).join('')}
    <div class="territory-cosmos__status" aria-live="polite"></div>
    <div class="territory-cosmos__hint">Select a world · Hearthlands is mapped first</div>`;
  root.appendChild(section);

  const status=section.querySelector('.territory-cosmos__status');
  let messageTimer=0;
  let entering=false;

  function showMessage(text){
    clearTimeout(messageTimer);
    status.textContent=text;
    section.dataset.message='true';
    messageTimer=setTimeout(()=>{section.dataset.message='false'},2600);
  }

  function enterHearthlands(button){
    if(entering)return;
    entering=true;
    section.classList.add('is-entering');
    button.classList.add('is-selected');
    const hearthLabel=document.querySelector('.territory-label.primary');
    hearthLabel?.click();
    setTimeout(()=>document.querySelector('.focus-panel .enter')?.click(),360);
    setTimeout(()=>section.classList.add('map-reveal'),1550);
  }

  section.addEventListener('click',(event)=>{
    const button=event.target.closest('.territory-world');
    if(!button)return;
    const id=button.dataset.world;
    if(id==='hearthlands'){
      enterHearthlands(button);
      return;
    }
    const world=WORLDS.find(item=>item.id===id);
    showMessage(`${world?.name||'This territory'} is part of the atlas. Its painted map comes after the Hearthlands pilot.`);
    section.querySelectorAll('.territory-world').forEach(item=>item.classList.toggle('is-preview-selected',item===button));
  });

  const observer=new MutationObserver(()=>{
    const state=root.dataset.state;
    if(state==='orbit'&&entering){
      entering=false;
      section.classList.remove('is-entering','map-reveal');
      section.querySelectorAll('.territory-world').forEach(item=>item.classList.remove('is-selected'));
    }
  });
  observer.observe(root,{attributes:true,attributeFilter:['data-state']});

  window.dreamscapeTerritoryWorlds={
    enterHearthlands:()=>enterHearthlands(section.querySelector('[data-world="hearthlands"]')),
    worlds:WORLDS.map(({id,name,cue,live})=>({id,name,cue,live:!!live}))
  };
  return true;
}

if(!mountTerritoryCosmos()){
  const timer=setInterval(()=>{if(mountTerritoryCosmos())clearInterval(timer)},80);
  setTimeout(()=>clearInterval(timer),10000);
}
