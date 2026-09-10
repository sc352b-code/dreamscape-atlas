if(window.CanvasRenderingContext2D&&!CanvasRenderingContext2D.prototype.lineTn){CanvasRenderingContext2D.prototype.lineTn=CanvasRenderingContext2D.prototype.lineTo;}

// Phase 1 procedural globe: Three.js still requests the canonical world path, but the
// atlas now redirects it to a new corpus-derived texture generated independently of the
// legacy raster. Capable desktop GPUs receive the 8192x4096 asset; other devices receive
// 4096x2048. The previous HD/legacy images remain emergency fallbacks only.
(()=>{
  const descriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
  if(!descriptor?.set||!descriptor?.get||window.__dreamscapeProceduralWorldPrelude)return;
  window.__dreamscapeProceduralWorldPrelude=true;
  const originalSet=descriptor.set;
  const originalGet=descriptor.get;
  const atlas8k='/assets/world-atlas-8k.webp';
  const atlas4k='/assets/world-atlas-4k.webp';
  const legacyHd='/assets/world-equirectangular-hd.webp';

  let maxTextureSize=4096;
  try{
    const probeCanvas=document.createElement('canvas');
    const gl=probeCanvas.getContext('webgl2')||probeCanvas.getContext('webgl');
    if(gl)maxTextureSize=gl.getParameter(gl.MAX_TEXTURE_SIZE)||4096;
  }catch(_){/* 4K fallback is safe */}
  const memory=Number(navigator.deviceMemory||8);
  const displayPixels=Math.max(innerWidth||0,screen?.width||0)*(devicePixelRatio||1);
  const prefer8k=maxTextureSize>=8192&&memory>=6&&displayPixels>=1800;
  const candidates=prefer8k?[atlas8k,atlas4k,legacyHd]:[atlas4k,legacyHd];

  function resolveAsset(target,original,index=0){
    if(index>=candidates.length){originalSet.call(target,original);return;}
    const candidate=candidates[index];
    const probe=new Image();
    probe.onload=()=>originalSet.call(target,candidate);
    probe.onerror=()=>resolveAsset(target,original,index+1);
    originalSet.call(probe,candidate);
  }

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
      resolveAsset(this,value);
    }
  });
})();
