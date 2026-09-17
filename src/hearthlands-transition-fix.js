const FINAL_HEARTHLANDS_ART='/worlds/reference-world/territories/hearthlands/assets/hearthlands-flat-map.png';

function bootSeamlessEntry(){
  const root=document.querySelector('.atlas');
  const scene=document.querySelector('.flatmap-scene');
  const art=document.querySelector('.flatmap-art');
  const cosmos=document.querySelector('.territory-cosmos');
  if(!root||!scene||!art||!cosmos){requestAnimationFrame(bootSeamlessEntry);return;}

  if(!art.src.endsWith(FINAL_HEARTHLANDS_ART)) art.src=FINAL_HEARTHLANDS_ART;
  const preload=()=>art.decode?.().catch(()=>{});
  if(art.complete) preload(); else art.addEventListener('load',preload,{once:true});

  let takeoverTimer=0;
  function begin(){
    clearTimeout(takeoverTimer);
    root.classList.add('hearthlands-seamless-entry');
    root.classList.remove('hearthlands-map-takeover');
    takeoverTimer=setTimeout(()=>root.classList.add('hearthlands-map-takeover'),120);
  }

  function reset(){
    clearTimeout(takeoverTimer);
    root.classList.remove('hearthlands-seamless-entry','hearthlands-map-takeover');
  }

  new MutationObserver(()=>{
    if(cosmos.classList.contains('is-entering')) begin();
    else if(root.dataset.state==='orbit') reset();
  }).observe(cosmos,{attributes:true,attributeFilter:['class']});

  new MutationObserver(()=>{
    if(root.dataset.state==='orbit') reset();
    if(root.dataset.state==='hearth') root.classList.add('hearthlands-map-takeover');
  }).observe(root,{attributes:true,attributeFilter:['data-state']});
}

bootSeamlessEntry();
