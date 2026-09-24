const OVERLAY_URL='/worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json';

const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
const titleCase=value=>String(value||'').replaceAll('-',' ').replace(/\b\w/g,ch=>ch.toUpperCase());

async function boot(){
  const response=await fetch(OVERLAY_URL,{cache:'no-store'});
  if(!response.ok) return;
  const overlays=await response.json();
  const root=document.querySelector('.atlas');
  if(!root) return;

  function selectedId(){return root.querySelector('.territory-hotspot.is-selected')?.dataset.id||null;}
  function selectedData(){return overlays[selectedId()]||null;}

  function ensurePreviewImage(preview){
    let wrap=preview.querySelector('.territory-v1-preview-image');
    if(wrap) return wrap;
    wrap=document.createElement('div');
    wrap.className='territory-v1-preview-image';
    wrap.innerHTML='<img alt="" />';
    preview.insertBefore(wrap,preview.querySelector('.territory-v1-preview-kicker'));
    return wrap;
  }

  function applyFraming(img,data,mode){
    if(!img) return;
    const framing=data?.imageFraming?.[mode]||data?.imageFraming?.full||{};
    img.style.objectPosition=framing.objectPosition||'50% 50%';
    img.style.objectFit=framing.objectFit||'cover';
  }

  function renderStats(target,stats){
    if(!target||!Array.isArray(stats)||!stats.length) return;
    target.innerHTML=stats.map(stat=>`<span><b>${escapeHTML(stat.value)}</b><small>${escapeHTML(stat.label)}</small></span>`).join('');
  }

  function renderArticles(target,items){
    if(!target) return;
    const section=target.closest('section');
    if(!Array.isArray(items)||!items.length){section?.setAttribute('hidden','');target.innerHTML='';return;}
    section?.removeAttribute('hidden');
    target.innerHTML=items.map(item=>`<article><div class="territory-v1-article-heading"><b>${escapeHTML(item.name)}</b>${item.confidence?`<span class="territory-v1-confidence">${escapeHTML(item.confidence)} confidence</span>`:''}</div><p>${escapeHTML(item.summary)}</p>${item.caveat?`<small>${escapeHTML(item.caveat)}</small>`:''}</article>`).join('');
  }

  function renderMeanings(reader,data){
    const target=reader.querySelector('.territory-v1-interpretation');
    if(!target||!Array.isArray(data.possibleMeanings)||!data.possibleMeanings.length) return;
    target.innerHTML=`<div class="territory-v1-meaning-list">${data.possibleMeanings.map(item=>`<article><b>${escapeHTML(item.name)}</b><span>${escapeHTML(item.summary)}</span></article>`).join('')}</div>`;
  }

  function renderGeography(reader,data){
    const section=reader.querySelector('.territory-v1-tarot-geography');
    const target=section?.querySelector('div');
    const entries=Object.entries(data.corpusOverview?.territoryCounts||{});
    if(!section||!target||!entries.length) return;
    section.hidden=false;
    const max=Math.max(...entries.map(([,count])=>Number(count)||0),1);\n    target.innerHTML=entries.map(([territory,count])=>`<div class="territory-v1-geo-row" style="--territory-share:${Math.max(4,Math.round((Number(count)||0)/max*100))}%"><span>${escapeHTML(titleCase(territory))}</span><i></i><b>${count}</b></div>`).join('');
    section.querySelector('.territory-v1-geo-note')?.remove();
    if(data.geographyNote) section.insertAdjacentHTML('beforeend',`<p class="territory-v1-geo-note">${escapeHTML(data.geographyNote)}</p>`);
  }

  function renderRelated(reader,data){
    const related=reader.querySelector('.territory-v1-related');
    if(!related||!Array.isArray(data.relatedItems)||!data.relatedItems.length) return;
    related.innerHTML=`<b>You may also want to explore</b><div class="territory-v1-related-buttons">${data.relatedItems.map(item=>{
      const id=typeof item==='string'?item:item.id;
      const label=typeof item==='string'?titleCase(item):(item.label||titleCase(id));
      return `<button type="button" data-related-id="${escapeHTML(id)}">${escapeHTML(label)}</button>`;
    }).join('')}</div>`;
    related.querySelectorAll('[data-related-id]').forEach(button=>{
      const id=button.dataset.relatedId;
      const hotspot=root.querySelector(`.territory-hotspot[data-id="${CSS.escape(id)}"]`);
      button.disabled=!hotspot;
      button.addEventListener('click',()=>{
        if(!hotspot) return;
        reader.querySelector('.territory-v1-reader-close')?.click();
        requestAnimationFrame(()=>hotspot.click());
      });
    });
  }

  function renderRecordAccess(reader,data){
    const section=reader.querySelector('.territory-v1-dream-records');
    if(!section) return;
    const count=data.dreamRecordCount??data.corpusOverview?.uniqueDreamCount??data.corpusOverview?.wholeSeriesCount;
    const copy=section.querySelector('p');
    const button=section.querySelector('.territory-v1-records-button');
    if(copy&&count!=null) copy.textContent=`${count} dream record${count===1?' is':'s are'} linked to this card. Full dream text stays in your private dream library.`;
    if(button&&button.disabled&&count!=null) button.textContent=`${count} dream record${count===1?'':'s'} · private library`;
  }

  function applyPreview(){
    const preview=root.querySelector('.territory-v1-preview.open');
    const data=selectedData();
    if(!preview||!data) return;
    preview.classList.add('tarot-v2-exemplar-preview');
    const image=ensurePreviewImage(preview);
    const img=image.querySelector('img');
    if(data.previewImage||data.cardImage){
      img.src=data.previewImage||data.cardImage;
      img.alt=`Dreamscape artwork for ${data.title||preview.querySelector('h3')?.textContent||'this tarot'}`;\n      applyFraming(img,data,'preview');
      image.hidden=false;
    }else image.hidden=true;
    if(data.title) preview.querySelector('h3').textContent=data.title;
    if(data.friendlySubtitle) preview.querySelector('.territory-v1-preview-kicker').textContent=data.friendlySubtitle;
    if(data.previewSummary) preview.querySelector('.territory-v1-preview-grounding').textContent=data.previewSummary;
    renderStats(preview.querySelector('.territory-v1-preview-meta'),(data.quickStats||[]).slice(0,2));
  }

  function applyTarot(){
    const reader=root.querySelector('.territory-v1-reader.open');
    const data=selectedData();
    if(!reader||!data) return;
    reader.classList.add('tarot-v2-exemplar');\n    reader.dataset.tarotId=selectedId()||'';\n    reader.classList.toggle('tarot-v2-gold-standard',Boolean(data.goldStandardExemplar));
    if(data.title) reader.querySelector('h2').textContent=data.title;
    reader.querySelector('.territory-v1-kicker').textContent=data.friendlySubtitle||'A pattern across your dreams';

    const imageWrap=reader.querySelector('.territory-v1-tarot-image');
    if(imageWrap&&(data.cardImage||data.previewImage)){
      imageWrap.hidden=false;
      const img=imageWrap.querySelector('img');
      img.src=data.cardImage||data.previewImage;
      img.alt=`Dreamscape tarot artwork for ${data.title||'this card'}`;\n      applyFraming(img,data,'full');
    }

    renderStats(reader.querySelector('.territory-v1-tarot-stats'),data.quickStats);
    renderGeography(reader,data);
    if(data.corpusGrounding) reader.querySelector('.territory-v1-grounding').textContent=data.corpusGrounding;
    renderArticles(reader.querySelector('.territory-v1-functions div'),data.recurringFunctions);
    renderMeanings(reader,data);
    renderArticles(reader.querySelector('.territory-v1-lenses div'),data.interpretiveLenses);

    const lesson=reader.querySelector('.territory-v1-lesson');
    if(lesson&&data.possibleLesson){
      lesson.hidden=false;
      lesson.querySelector('p').textContent=data.possibleLesson;
      lesson.querySelector('.territory-v1-reflection')?.remove();
      if(data.reflectionPrompt) lesson.insertAdjacentHTML('beforeend',`<p class="territory-v1-reflection"><b>A question to sit with:</b> ${escapeHTML(data.reflectionPrompt)}</p>`);
    }
    renderRecordAccess(reader,data);
    renderRelated(reader,data);
  }

  function makeLanguageFriendly(){
    const reader=root.querySelector('.territory-v1-reader');
    if(!reader) return;
    const headings=[
      ['.territory-v1-tarot-geography h3','Where it appears'],
      ['.territory-v1-grounding','What shows up across your dreams','previous'],
      ['.territory-v1-functions h3','What role it tends to play'],
      ['.territory-v1-interpretation','What this may mean','previous'],
      ['.territory-v1-lenses h3','Different ways to look at it'],
      ['.territory-v1-lesson h3','What this might be asking of you'],
      ['.territory-v1-dream-records h3','See the dreams where this appears']
    ];
    for(const item of headings){
      if(item[2]==='previous'){
        const target=reader.querySelector(item[0]);
        const heading=target?.previousElementSibling;
        if(heading?.tagName==='H3') heading.textContent=item[1];
      }else{
        const target=reader.querySelector(item[0]);
        if(target) target.textContent=item[1];
      }
    }
    const method=reader.querySelector('.territory-v1-method');
    if(method) method.textContent='These are possible readings drawn from patterns across your dreams. They are prompts for reflection, not fixed meanings.';
  }

  makeLanguageFriendly();
  const observer=new MutationObserver(()=>requestAnimationFrame(()=>{makeLanguageFriendly();applyPreview();applyTarot();}));
  observer.observe(root,{subtree:true,attributes:true,attributeFilter:['class']});
  window.__hearthlandsTarotV2={overlays:Object.keys(overlays),exemplars:['family-home','water','person-11']};
}

boot().catch(error=>console.warn('Hearthlands Tarot v2 overlays unavailable.',error));
