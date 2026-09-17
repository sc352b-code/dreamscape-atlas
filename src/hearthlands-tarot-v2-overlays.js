const OVERLAY_URL='/worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json';

const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

async function boot(){
  const response=await fetch(OVERLAY_URL,{cache:'no-store'});
  if(!response.ok) return;
  const overlays=await response.json();
  const root=document.querySelector('.atlas');
  if(!root) return;

  function selectedId(){return root.querySelector('.territory-hotspot.is-selected')?.dataset.id||null;}

  function applyPreview(){
    const preview=root.querySelector('.territory-v1-preview.open');
    if(!preview) return;
    const data=overlays[selectedId()];
    if(!data) return;
    if(data.previewSummary) preview.querySelector('.territory-v1-preview-grounding').textContent=data.previewSummary;
    const meta=preview.querySelector('.territory-v1-preview-meta');
    const whole=data.corpusOverview?.wholeSeriesCount;
    if(whole!=null&&!meta.textContent.includes('series dreams')){
      meta.insertAdjacentHTML('afterbegin',`<span><b>${whole}</b> series dreams</span>`);
    }
  }

  function renderArticles(target,items){
    if(!target||!Array.isArray(items)||!items.length) return;
    const section=target.closest('section');
    section?.removeAttribute('hidden');
    target.innerHTML=items.map(item=>`<article><b>${escapeHTML(item.name)}</b><p>${escapeHTML(item.summary)}</p>${item.caveat?`<small>${escapeHTML(item.caveat)}</small>`:''}</article>`).join('');
  }

  function applyTarot(){
    const reader=root.querySelector('.territory-v1-reader.open');
    if(!reader) return;
    const data=overlays[selectedId()];
    if(!data) return;

    const stats=reader.querySelector('.territory-v1-tarot-stats');
    const whole=data.corpusOverview?.wholeSeriesCount;
    if(whole!=null&&stats?.firstElementChild){
      stats.firstElementChild.innerHTML=`<b>${whole}</b><small>dreams in whole series</small>`;
    }

    renderArticles(reader.querySelector('.territory-v1-functions div'),data.recurringFunctions);
    renderArticles(reader.querySelector('.territory-v1-lenses div'),data.interpretiveLenses);

    const lesson=reader.querySelector('.territory-v1-lesson');
    if(lesson&&data.possibleLesson){
      lesson.hidden=false;
      lesson.querySelector('p').textContent=data.possibleLesson;
      if(data.reflectionPrompt){
        lesson.querySelector('p').insertAdjacentHTML('afterend',`<p class="territory-v1-reflection"><b>Reflection:</b> ${escapeHTML(data.reflectionPrompt)}</p>`);
      }
    }
  }

  const observer=new MutationObserver(()=>{requestAnimationFrame(()=>{applyPreview();applyTarot();});});
  observer.observe(root,{subtree:true,attributes:true,attributeFilter:['class']});
  window.__hearthlandsTarotV2={overlays:Object.keys(overlays)};
}

boot().catch(error=>console.warn('Hearthlands Tarot v2 overlays unavailable.',error));
