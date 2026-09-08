if(window.CanvasRenderingContext2D&&!CanvasRenderingContext2D.prototype.lineTn){CanvasRenderingContext2D.prototype.lineTn=CanvasRenderingContext2D.prototype.lineTo;}

// Prefer the persisted 4096x2048 world texture built on the pilot branch. Three.js
// still asks for the canonical source path; this prelude redirects that request to
// the HD asset and falls back cleanly if it is ever unavailable.
(()=>{
  const descriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
  if(!descriptor?.set||!descriptor?.get||window.__dreamscapeWorldHdPrelude)return;
  window.__dreamscapeWorldHdPrelude=true;
  const originalSet=descriptor.set;
  const originalGet=descriptor.get;
  const hd='/assets/world-equirectangular-hd.webp';
  Object.defineProperty(HTMLImageElement.prototype,'src',{
    configurable:true,
    enumerable:descriptor.enumerable,
    get(){return originalGet.call(this);},
    set(value){
      const source=String(value||'');
      if(!source.includes('/assets/world-equirectangular.png')){
        originalSet.call(this,value);
        return;
      }
      const target=this;
      const probe=new Image();
      probe.onload=()=>originalSet.call(target,hd);
      probe.onerror=()=>originalSet.call(target,value);
      originalSet.call(probe,hd);
    }
  });
})();