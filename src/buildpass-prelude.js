if(window.CanvasRenderingContext2D&&!CanvasRenderingContext2D.prototype.lineTn){CanvasRenderingContext2D.prototype.lineTn=CanvasRenderingContext2D.prototype.lineTo;}

// Thread 2 correction pass: promote the authored world texture into a 4K runtime texture
// before Three.js sees it. This preserves the corpus-derived geography while giving the
// globe a much cleaner high-DPI source at distance and during camera movement.
(()=>{
  const descriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
  if(!descriptor?.set||!descriptor?.get||window.__dreamscapeWorld4kPrelude)return;
  window.__dreamscapeWorld4kPrelude=true;
  const originalSet=descriptor.set;
  const originalGet=descriptor.get;
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
      const temp=new Image();
      temp.crossOrigin='anonymous';
      temp.onload=()=>{
        try{
          const canvas=document.createElement('canvas');
          canvas.width=4096;
          canvas.height=2048;
          const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:false});
          ctx.imageSmoothingEnabled=true;
          ctx.imageSmoothingQuality='high';
          ctx.filter='contrast(110%) saturate(108%) brightness(103%)';
          ctx.drawImage(temp,0,0,4096,2048);
          canvas.toBlob(blob=>{
            if(!blob){originalSet.call(target,value);return;}
            const url=URL.createObjectURL(blob);
            target.addEventListener('load',()=>setTimeout(()=>URL.revokeObjectURL(url),1500),{once:true});
            originalSet.call(target,url);
          },'image/webp',0.97);
        }catch(error){
          console.warn('4K world promotion failed; falling back to authored source.',error);
          originalSet.call(target,value);
        }
      };
      temp.onerror=()=>originalSet.call(target,value);
      originalSet.call(temp,value);
    }
  });
})();