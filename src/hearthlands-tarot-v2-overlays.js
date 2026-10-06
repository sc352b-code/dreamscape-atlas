const OVERLAY_URL='/worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json';

const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
const titleCase=value=>String(value||'').replaceAll('-',' ').replace(/\b\w/g,ch=>ch.toUpperCase());

async function boot(){
  const response=await fetch(OVERLAY_URL,{cache:'no-store'});
  if(!response.ok) return;
  const overlays=await response.json();
  const root=document.querySelector('.atlas');
  if(!root) return;

  const chapters=[
    {id:'overview',label:'Overview'},
    {id:'geography',label:'Where it appears'},
    {id:'patterns',label:'Recurring patterns'},
    {id:'alongside',label:'Appears alongside'},
    {id:'chronology',label:'How it changes'},
    {id:'sources',label:'Source dreams'},
    {id:'meanings',label:'Possible meanings'}
  ];
  const chapterLabel=id=>chapters.find(chapter=>chapter.id===id)?.label||titleCase(id);

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

  function ensurePreviewCaption(preview){
    const image=ensurePreviewImage(preview);
    let caption=image.querySelector('.tarot-preview-caption');
    if(caption) return caption;
    caption=document.createElement('div');
    caption.className='tarot-preview-caption';
    image.appendChild(caption);
    return caption;
  }

  function applyFraming(img,data,mode){
    if(!img) return;
    const framing=data?.imageFraming?.[mode]||data?.imageFraming?.full||{};
    img.style.objectPosition=framing.objectPosition||'50% 50%';
    img.style.objectFit=framing.objectFit||'cover';
  }

  function renderStats(target,stats){
    if(!target) return;
    const safe=Array.isArray(stats)?stats:[];
    target.innerHTML=safe.map(stat=>`<span><b>${escapeHTML(stat.value)}</b><small>${escapeHTML(stat.label)}</small></span>`).join('');
  }

  function renderArticles(target,items){
    if(!target) return;
    const section=target.closest('section');
    if(!Array.isArray(items)||!items.length){
      if(section) section.dataset.empty='true';
      target.innerHTML='';
      return;
    }
    if(section) section.dataset.empty='false';
    target.innerHTML=items.map(item=>`
      <article>
        <div class="territory-v1-article-heading">
          <b>${escapeHTML(item.name)}</b>
          ${item.confidence?`<span class="territory-v1-confidence">${escapeHTML(item.confidence)}</span>`:''}
        </div>
        <p>${escapeHTML(item.summary)}</p>
        ${item.caveat?`<small>${escapeHTML(item.caveat)}</small>`:''}
      </article>`).join('');
  }

  function renderMeanings(reader,data){
    const target=reader.querySelector('.territory-v1-interpretation');
    if(!target||!Array.isArray(data.possibleMeanings)||!data.possibleMeanings.length) return;
    target.innerHTML=`<div class="territory-v1-meaning-list">${data.possibleMeanings.map(item=>`
      <article><b>${escapeHTML(item.name)}</b><span>${escapeHTML(item.summary)}</span></article>`).join('')}</div>`;
  }

  function renderGeography(reader,data){
    const section=reader.querySelector('.territory-v1-tarot-geography');
    let target=section?.querySelector('.territory-v1-geo-list');
    if(!target&&section){
      target=Array.from(section.children).find(node=>node.tagName==='DIV'&&!node.classList.contains('tarot-companion-body'))||
        section.querySelector('.tarot-companion-body > div');
      if(target) target.classList.add('territory-v1-geo-list');
    }
    const entries=Object.entries(data.corpusOverview?.territoryCounts||{});
    if(!section||!target||!entries.length) return;
    const max=Math.max(...entries.map(([,count])=>Number(count)||0),1);
    const unique=data.corpusOverview?.uniqueDreamCount??data.corpusOverview?.wholeSeriesCount;
    target.innerHTML=entries.map(([territory,count])=>{
      const numeric=Number(count)||0;
      const pct=unique?Math.round(numeric/unique*100):null;
      return `
      <div class="territory-v1-geo-row" style="--territory-share:${Math.max(4,Math.round(numeric/max*100))}%">
        <span>${escapeHTML(titleCase(territory))}</span><i></i>
        <b>${escapeHTML(numeric)}${pct!=null?`<small>${escapeHTML(pct)}%</small>`:''}</b>
      </div>`;
    }).join('');
    let note=section.querySelector('.territory-v1-geo-note');
    if(!note){
      note=document.createElement('p');
      note.className='territory-v1-geo-note';
      target.insertAdjacentElement('afterend',note);
    }
    note.textContent=data.geographyNote||'';
  }

  function renderRelated(reader,data){
    const related=reader.querySelector('.territory-v1-related');
    if(!related) return;
    const items=Array.isArray(data.relatedItems)?data.relatedItems:[];
    const verified=data.relationshipStatus==='cooccurrence-verified';
    const noteText=verified
      ?'These relationships are supported by recurring same-dream evidence.'
      :'This is currently a navigation constellation of Water-related Dreamscape elements, not a same-dream frequency claim. Co-occurrence must be verified from the private corpus before any item is described as repeatedly appearing with this subject.';

    let heading=related.querySelector('.territory-v1-related-heading');
    if(!heading){
      heading=document.createElement('b');
      heading.className='territory-v1-related-heading';
      heading.textContent='Appears alongside';
      related.appendChild(heading);
    }
    let note=related.querySelector('.territory-v1-related-note');
    if(!note){
      note=document.createElement('p');
      note.className='territory-v1-related-note';
      related.appendChild(note);
    }
    note.textContent=noteText;

    let buttons=related.querySelector('.territory-v1-related-buttons');
    if(!buttons){
      buttons=document.createElement('div');
      buttons.className='territory-v1-related-buttons';
      related.appendChild(buttons);
    }
    buttons.innerHTML=items.map(item=>{
      const id=typeof item==='string'?item:item.id;
      const label=typeof item==='string'?titleCase(item):(item.label||titleCase(id));
      return `<button type="button" data-related-id="${escapeHTML(id)}"><i aria-hidden="true"></i>${escapeHTML(label)}</button>`;
    }).join('');

    buttons.querySelectorAll('[data-related-id]').forEach(button=>{
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

  function getPrivateRecords(subjectId){
    try{return window.DreamscapePrivateProfile?.getDreamRecords?.(subjectId)||[];}
    catch{return [];}
  }

  function renderRecordAccess(reader,data){
    const section=reader.querySelector('.territory-v1-dream-records');
    if(!section) return;
    const id=selectedId();
    const count=data.dreamRecordCount??data.corpusOverview?.uniqueDreamCount??data.corpusOverview?.wholeSeriesCount;
    let copy=section.querySelector('.territory-v1-records-intro');
    if(!copy){
      copy=section.querySelector(':scope > p')||section.querySelector('p');
      copy?.classList.add('territory-v1-records-intro');
    }
    const button=section.querySelector('.territory-v1-records-button');

    let fragments=section.querySelector('.territory-v1-source-fragments');
    if(!fragments){
      fragments=document.createElement('div');
      fragments.className='territory-v1-source-fragments';
      section.insertBefore(fragments,button);
    }

    let browser=section.querySelector('.territory-v1-private-record-browser');
    if(!browser){
      browser=document.createElement('div');
      browser.className='territory-v1-private-record-browser';
      section.appendChild(browser);
    }

    const renderRows=records=>{
      fragments.innerHTML=records.slice(0,3).map(record=>`
        <article>
          <small>${escapeHTML(record.date||record.title||'Dream record')}</small>
          <p>${escapeHTML(record.excerpt||record.title||'Private dream record')}</p>
        </article>`).join('');

      browser.innerHTML=records.map(record=>`
        <article class="tarot-private-dream-row">
          <div>
            <small>${escapeHTML(record.date||'')}</small>
            <b>${escapeHTML(record.title||record.id)}</b>
            ${record.excerpt?`<p>${escapeHTML(record.excerpt)}</p>`:''}
          </div>
          <button type="button" data-private-record-id="${escapeHTML(record.id)}">Open dream →</button>
        </article>`).join('');

      browser.querySelectorAll('[data-private-record-id]').forEach(openButton=>{
        openButton.addEventListener('click',async()=>{
          const record=records.find(item=>item.id===openButton.dataset.privateRecordId);
          if(!record) return;
          const opened=await window.DreamscapePrivateProfile?.openDreamRecord?.(record);
          if(opened===false){
            openButton.textContent='Dream loaded here';
            openButton.disabled=true;
          }
        });
      });
    };

    const renderUnavailable=()=>{
      fragments.innerHTML='';
      browser.innerHTML=`
        <div class="tarot-private-access-card">
          <small>PRIVATE DREAM LIBRARY</small>
          <b>Your source dreams are not loaded in this browser session yet.</b>
          <p>You can connect the authenticated Dreamscape corpus provider, or load a private Dreamscape profile file locally. The file stays in this browser session and is not added to the public Atlas repository.</p>
          <label class="tarot-private-import">
            Load private corpus profile
            <input type="file" accept="application/json,.json" hidden />
          </label>
        </div>`;
      const input=browser.querySelector('input[type=file]');
      input?.addEventListener('change',async()=>{
        const file=input.files?.[0];
        if(!file) return;
        try{
          await window.DreamscapePrivateProfile?.importProfileFile?.(file);
          const records=await window.DreamscapePrivateProfile?.getOrLoadDreamRecords?.(id)||[];
          if(records.length){
            renderRows(records);
            browser.classList.add('open');
          }
        }catch{
          const message=browser.querySelector('.tarot-private-access-card p');
          if(message) message.textContent='That file could not be read as a Dreamscape private profile.';
        }
      });
    };

    const records=getPrivateRecords(id);
    if(records.length){
      renderRows(records);
      if(copy) copy.textContent=`${records.length} private source dream${records.length===1?' is':'s are'} currently available for this Tarot.`;
    }else{
      fragments.innerHTML='';
      if(copy&&count!=null) copy.textContent=`${data.title||'This subject'} appears in ${count} dream${count===1?'':'s'} in this series. Open the private dream library to view the linked source records.`;
    }

    if(button&&count!=null){
      button.textContent=`See all ${count} dream${count===1?'':'s'} →`;
      button.disabled=false;
      button.title='Open linked private source dreams';
      button.onclick=async()=>{
        button.classList.add('is-loading');
        button.textContent='Opening dream library…';
        let loaded=[];
        try{
          loaded=await window.DreamscapePrivateProfile?.getOrLoadDreamRecords?.(id)||[];
        }catch{}
        button.classList.remove('is-loading');
        button.textContent=`See all ${count} dream${count===1?'':'s'} →`;
        browser.classList.add('open');
        if(loaded.length){
          renderRows(loaded);
          if(copy) copy.textContent=`${loaded.length} private source dream${loaded.length===1?' is':'s are'} currently available for this Tarot.`;
          window.dispatchEvent(new CustomEvent('dreamscape-open-dream-records',{detail:{subjectId:id,records:loaded}}));
        }else{
          renderUnavailable();
          window.dispatchEvent(new CustomEvent('dreamscape-request-dream-records',{detail:{subjectId:id,expectedCount:count}}));
        }
      };
    }
  }

  function ensureChronology(reader,data){
    let section=reader.querySelector('.territory-v1-chronology');
    if(!section){
      section=document.createElement('section');
      section.className='territory-v1-tarot-section territory-v1-chronology';
      section.innerHTML='<h3>How it changes</h3><p class="tarot-chronology-copy"></p>';
      const records=reader.querySelector('.territory-v1-dream-records');
      records?.parentNode.insertBefore(section,records);
    }
    let copy=section.querySelector('.tarot-chronology-copy');
    if(!copy){
      copy=section.querySelector(':scope > p')||section.querySelector('p');
      copy?.classList.add('tarot-chronology-copy');
    }
    if(copy) copy.textContent=data.chronologySummary||
      `The current published ${data.title||'Tarot'} model does not yet support a strong chronology claim. A future private analysis can test changes in form, emotional tone and dreamer response across the series.`;
    return section;
  }

  function restoreTriptych(reader){
    const shell=reader.querySelector('.tarot-triptych-shell');
    if(!shell) return;
    const scroll=reader.querySelector('.territory-v1-tarot-scroll');
    const center=shell.querySelector('.tarot-triptych-center');
    const info=shell.querySelector('.tarot-triptych-info');
    const originalSelectors=[
      '.territory-v1-tarot-image',
      '.territory-v1-kicker',
      'h2',
      '.territory-v1-tarot-subtitle',
      '.territory-v1-tarot-stats'
    ];
    originalSelectors.forEach(selector=>{
      const node=center?.querySelector(selector);
      if(node){ node.hidden=false; scroll.insertBefore(node,shell); }
    });
    info?.querySelectorAll('[data-chapter]').forEach(node=>scroll.insertBefore(node,shell));
    shell.remove();
    reader.classList.remove('tarot-triptych','tarot-docked-workspace');
    delete reader.dataset.activeChapter;
  }


  function ensureOverviewEnhancements(grounding,data){
    if(!grounding) return;
    const overview=data.corpusOverview||{};
    const subject=data.title||'This subject';
    const whole=overview.wholeSeriesCount??overview.uniqueDreamCount;
    const total=overview.totalCorpusDreams;
    const appearances=overview.appearanceCount;
    const territoryCount=Object.keys(overview.territoryCounts||{}).length;

    let metrics=grounding.querySelector('.tarot-overview-metrics');
    if(!metrics){
      metrics=document.createElement('div');
      metrics.className='tarot-overview-metrics';
      grounding.appendChild(metrics);
    }
    metrics.innerHTML=[
      appearances!=null?{value:appearances,label:`recorded ${subject} appearances`}:null,
      territoryCount?{value:territoryCount,label:'territories reached'}:null
    ].filter(Boolean).map(item=>`
      <div class="tarot-mini-inscription"><b>${escapeHTML(item.value)}</b><span>${escapeHTML(item.label)}</span></div>`).join('');

    let behaviour=grounding.querySelector('.tarot-behaviour-summary');
    if(!behaviour){
      behaviour=document.createElement('div');
      behaviour.className='tarot-behaviour-summary';
      grounding.appendChild(behaviour);
    }
    const behaviourText=data.behaviorSummary||data.behaviourSummary||'';
    const keyPatterns=(data.recurringFunctions||[]).slice(0,3);
    let behaviourLabel=behaviour.querySelector(':scope > small');
    if(!behaviourLabel){
      behaviourLabel=document.createElement('small');
      behaviour.prepend(behaviourLabel);
    }
    behaviourLabel.textContent=`WHAT YOU TEND TO BE DOING AROUND ${subject.toUpperCase()}`;
    let behaviourCopy=behaviour.querySelector(':scope > p');
    if(!behaviourCopy){
      behaviourCopy=document.createElement('p');
      behaviour.appendChild(behaviourCopy);
    }
    behaviourCopy.textContent=behaviourText;
    let poles=grounding.querySelector('.tarot-overview-poles');
    if(!poles){
      poles=document.createElement('div');
      poles.className='tarot-overview-poles';
      behaviour.appendChild(poles);
    }
    poles.innerHTML=keyPatterns.map((item,index)=>`
      <span><i aria-hidden="true">${['◇','☾','✦'][index]||'✦'}</i><b>${escapeHTML(item.name)}</b></span>`).join('');

    const lead=grounding.querySelector('.tarot-overview-lead');
    if(lead&&whole!=null&&total!=null) lead.innerHTML=`<b>${escapeHTML(whole)}</b><span>of ${escapeHTML(total)} dreams</span><small>contain ${escapeHTML(subject)}</small>`;
  }

  function ensureGeographyExplanation(geography,data){
    if(!geography) return;
    const counts=data.corpusOverview?.territoryCounts||{};
    const unique=data.corpusOverview?.wholeSeriesCount??data.corpusOverview?.uniqueDreamCount;
    const memberships=Object.values(counts).reduce((sum,value)=>sum+(Number(value)||0),0);
    let explainer=geography.querySelector('.tarot-territory-logic');
    if(!explainer){
      explainer=document.createElement('div');
      explainer.className='tarot-territory-logic';
      const chart=geography.querySelector('.territory-v1-geo-list');
      chart?.insertAdjacentElement('beforebegin',explainer);
    }
    const mode=data.geographyCountMode||'overlapping-memberships';
    explainer.innerHTML=mode==='overlapping-memberships'&&unique!=null?`
      <b>${escapeHTML(unique)} unique dreams · ${escapeHTML(memberships)} territory memberships</b>
      <p>A single dream can belong to more than one territory. These territory figures therefore overlap and are not supposed to add up to ${escapeHTML(unique)}.</p>`:
      '<p>Territory counts use the classification supplied by the corpus analysis.</p>';
  }

  function ensureConfidenceLegend(functions,data){
    if(!functions) return;
    let legend=functions.querySelector('.tarot-confidence-legend');
    if(!legend){
      legend=document.createElement('div');
      legend.className='tarot-confidence-legend';
      const list=functions.querySelector('.territory-v1-function-list')||
        Array.from(functions.children).find(node=>node.tagName==='DIV'&&!node.classList.contains('tarot-companion-pager'));
      if(list) list.insertAdjacentElement('beforebegin',legend);
      else functions.appendChild(legend);
    }
    const scale=data.confidenceScale||{
      note:'These labels describe qualitative evidence strength in the current analysis. They are not percentages and they are not counts of dreams.',
      levels:{
        high:'Strongest support among the recurring patterns currently identified.',
        'medium-high':'Substantial recurring support, but less strong than High.',
        medium:'A recurring pattern with more limited or mixed support.'
      }
    };
    legend.innerHTML=`
      <small>HOW TO READ EVIDENCE STRENGTH</small>
      <p>${escapeHTML(scale.note||'')}</p>
      <div>${Object.entries(scale.levels||{}).map(([level,meaning])=>`
        <span><b>${escapeHTML(titleCase(level))}</b><em>${escapeHTML(meaning)}</em></span>`).join('')}</div>`;
  }


  function companionGlyph(motif){
    const common='viewBox="0 0 72 72" aria-hidden="true"';
    const glyphs={
      record:`<svg ${common}><circle cx="36" cy="36" r="21"/><path d="M36 12v48M12 36h48"/><circle cx="36" cy="36" r="5"/><path d="M21 21l30 30M51 21L21 51"/></svg>`,
      currents:`<svg ${common}><path d="M8 23c10-10 18 10 28 0s18 10 28 0M8 36c10-10 18 10 28 0s18 10 28 0M8 49c10-10 18 10 28 0s18 10 28 0"/><circle cx="36" cy="36" r="4"/></svg>`,
      forms:`<svg ${common}><circle cx="36" cy="36" r="6"/><circle cx="18" cy="18" r="5"/><circle cx="54" cy="18" r="5"/><circle cx="18" cy="54" r="5"/><circle cx="54" cy="54" r="5"/><path d="M22 22l10 10M50 22L40 32M22 50l10-10M50 50L40 40"/></svg>`,
      constellation:`<svg ${common}><circle cx="36" cy="36" r="7"/><circle cx="14" cy="21" r="3"/><circle cx="57" cy="17" r="3"/><circle cx="60" cy="49" r="3"/><circle cx="20" cy="56" r="3"/><path d="M20 24l11 8M42 31l12-11M43 40l14 7M31 42L22 53"/></svg>`,
      'river-time':`<svg ${common}><path d="M34 7c14 12-12 17 4 29s-11 17 1 29"/><circle cx="35" cy="14" r="3"/><circle cx="34" cy="36" r="3"/><circle cx="39" cy="58" r="3"/></svg>`,
      manuscript:`<svg ${common}><path d="M17 12h31c7 0 10 5 7 11v36H24c-7 0-10-5-7-11z"/><path d="M24 20h23M24 29h23M24 38h17M24 47h20"/><path d="M48 12c-5 2-7 6-6 11"/></svg>`,
      mirror:`<svg ${common}><ellipse cx="36" cy="31" rx="20" ry="24"/><path d="M36 55v9M26 64h20"/><path d="M27 24c5-7 13-9 20-4"/><circle cx="36" cy="31" r="5"/></svg>`
    };
    return glyphs[motif]||glyphs.record;
  }

  function companionToneLabel(config){
    return config.tone==='interpretation'
      ?'INTERPRETIVE CARD · NOT CORPUS FACT'
      :config.tone==='source'
        ?'SOURCE CARD · PRIVATE CORPUS'
        :'CORPUS EVIDENCE CARD';
  }

  function companionBlockNode(section,block){
    if(/^lens:\d+$/.test(block)){
      const index=Number(block.split(':')[1]);
      return section.querySelectorAll('.territory-v1-lens-list article')[index]||null;
    }
    if(/^function:\d+$/.test(block)){
      const index=Number(block.split(':')[1]);
      return section.querySelectorAll('.territory-v1-function-list article')[index]||null;
    }
    if(/^meaning:\d+$/.test(block)){
      const index=Number(block.split(':')[1]);
      return section.querySelectorAll('.territory-v1-meaning-list article')[index]||null;
    }
    const selectors={
      heroMetric:'.tarot-overview-lead',
      grounding:'.territory-v1-grounding',
      metrics:'.tarot-overview-metrics',
      behaviour:'.tarot-behaviour-summary',
      behaviourPoles:'.tarot-overview-poles',
      geographyLogic:'.tarot-territory-logic',
      geographyRows:'.territory-v1-geo-list',
      geographyNote:'.territory-v1-geo-note',
      strengthLegend:'.tarot-confidence-legend',
      functions:'.territory-v1-function-list',
      relatedNote:'.territory-v1-related-note',
      relatedCore:'.tarot-constellation-core',
      relatedItems:'.territory-v1-related-buttons',
      chronologyRiver:'.tarot-time-river',
      chronologyText:'.tarot-chronology-copy',
      sourceIntro:'.territory-v1-records-intro',
      sourceButton:'.territory-v1-records-button',
      meanings:'.territory-v1-interpretation',
      boundary:'.territory-v1-method'
    };
    return selectors[block]?section.querySelector(selectors[block]):null;
  }

  function ensureCompanionCard(section,chapterId,data){
    if(!section) return;
    const config=data.companionCards?.[chapterId];
    if(!config) return;
    const pages=Array.isArray(config.pages)&&config.pages.length
      ?config.pages
      :[{id:'main',title:config.title,subtitle:config.subtitle,blocks:[]}];

    section.classList.add('tarot-companion-deck',`tarot-companion-${chapterId}`,`tarot-motif-${config.motif||chapterId}`,`tarot-tone-${config.tone||'evidence'}`);
    section.classList.remove('tarot-companion-card');
    section.dataset.companionCard=chapterId;
    section.dataset.companionTone=config.tone||'evidence';

    const semanticHeading=section.querySelector(':scope > h3')||
      (chapterId==='alongside'?section.querySelector('.territory-v1-related-heading'):null);
    semanticHeading?.classList.add('tarot-companion-original-heading');

    if(chapterId==='alongside'){
      let core=section.querySelector('.tarot-constellation-core');
      if(!core){
        core=document.createElement('div');
        core.className='tarot-constellation-core';
        core.innerHTML=`<span>${companionGlyph('currents')}</span><b>${escapeHTML(data.title||'Water')}</b><small>RELATED DREAMSCAPE ELEMENTS</small>`;
        const note=section.querySelector('.territory-v1-related-note');
        note?.insertAdjacentElement('afterend',core);
      }
    }

    if(chapterId==='chronology'){
      let copy=section.querySelector('.tarot-chronology-copy');
      if(!copy){
        copy=section.querySelector(':scope > p')||section.querySelector('p');
        copy?.classList.add('tarot-chronology-copy');
      }
      let river=section.querySelector('.tarot-time-river');
      if(!river){
        river=document.createElement('div');
        river.className='tarot-time-river';
        river.setAttribute('aria-hidden','true');
        river.innerHTML='<i></i><i></i><i></i>';
        copy?.insertAdjacentElement('beforebegin',river);
      }
    }

    let pager=section.querySelector(':scope > .tarot-companion-pager');
    if(!pager){
      pager=document.createElement('div');
      pager.className='tarot-companion-pager';
      section.appendChild(pager);
    }

    let stash=section.querySelector(':scope > .tarot-companion-stash');
    if(!stash){
      stash=document.createElement('div');
      stash.className='tarot-companion-stash';
      stash.hidden=true;
      section.appendChild(stash);
    }

    let card=pager.querySelector(':scope > .tarot-companion-page');
    if(!card){
      card=document.createElement('article');
      card.className='tarot-companion-card tarot-companion-page';
      card.innerHTML='<div class="tarot-companion-frame" aria-hidden="true"></div><header class="tarot-companion-header"></header><div class="tarot-companion-page-body"></div><nav class="tarot-companion-page-nav" aria-label="Card pages"><button type="button" data-page-step="-1" aria-label="Previous companion card">←</button><span class="tarot-page-dots"></span><small></small><button type="button" data-page-step="1" aria-label="Next companion card">→</button></nav>';
      pager.appendChild(card);
    }

    let frame=card.querySelector(':scope > .tarot-companion-frame');
    if(!frame){
      frame=document.createElement('div');
      frame.className='tarot-companion-frame';
      frame.setAttribute('aria-hidden','true');
      card.prepend(frame);
    }

    const header=card.querySelector('.tarot-companion-header');
    const body=card.querySelector('.tarot-companion-page-body');
    const nav=card.querySelector('.tarot-companion-page-nav');
    const prev=nav.querySelector('[data-page-step="-1"]');
    const next=nav.querySelector('[data-page-step="1"]');
    const dots=nav.querySelector('.tarot-page-dots');
    const count=nav.querySelector('small');

    const allPageBlocks=[...new Set(pages.flatMap(page=>page.blocks||[]))];
    const blockNodes=new Map(
      allPageBlocks
        .map(block=>[block,companionBlockNode(section,block)])
        .filter(([,node])=>Boolean(node))
    );

    // All authored content begins in the hidden store. Only the selected page
    // is permitted to move content into the physical Tarot. This prevents
    // original section content appearing above/below the card.
    blockNodes.forEach((node,block)=>{
      const previous=section.querySelector(`[data-companion-block="${CSS.escape(block)}"]`);
      if(previous&&previous!==node) previous.remove();
      node.dataset.companionBlock=block;
    });
    blockNodes.forEach(node=>{
      if(!stash.contains(node)) stash.appendChild(node);
    });

    const moveBodyToStash=()=>{
      Array.from(body.children).forEach(node=>stash.appendChild(node));
    };

    const auditFit=()=>{
      requestAnimationFrame(()=>{
        const overflow=body.scrollHeight>body.clientHeight+2||body.scrollWidth>body.clientWidth+2;
        card.dataset.fit=overflow?'overflow':'ok';
        const signature=`${chapterId}:${card.dataset.pageId||''}:${Math.round(body.clientWidth)}x${Math.round(body.clientHeight)}`;
        if(overflow&&card.dataset.lastOverflowSignature!==signature){
          card.dataset.lastOverflowSignature=signature;
          window.dispatchEvent(new CustomEvent('dreamscape-tarot-fit-failure',{
            detail:{
              subjectId:selectedId(),
              chapterId,
              pageId:card.dataset.pageId||null,
              scrollHeight:body.scrollHeight,
              clientHeight:body.clientHeight,
              scrollWidth:body.scrollWidth,
              clientWidth:body.clientWidth
            }
          }));
          console.warn('Dreamscape Tarot page exceeds its fixed content budget.',{chapterId,pageId:card.dataset.pageId});
        }
        if(!overflow) delete card.dataset.lastOverflowSignature;
      });
    };

    const setPage=pageIndex=>{
      const safe=Math.max(0,Math.min(pages.length-1,Number(pageIndex)||0));
      const pageConfig=pages[safe];
      section.dataset.activePage=String(safe);
      card.dataset.pageId=pageConfig.id;
      card.dataset.pageIndex=String(safe);

      moveBodyToStash();

      const label=chapterLabel(chapterId);
      const pageTopic=pageConfig.title&&pageConfig.title!==label?pageConfig.title:'';
      const pageDetail=pageConfig.subtitle&&pageConfig.subtitle!==pageTopic?pageConfig.subtitle:'';
      header.innerHTML=`
        <small>${escapeHTML(companionToneLabel(config))}</small>
        <div class="tarot-companion-glyph">${companionGlyph(config.motif)}</div>
        <h3>${escapeHTML(label)}</h3>
        ${pageTopic?`<p class="tarot-companion-page-topic"><b>${escapeHTML(pageTopic)}</b>${pageDetail?`<span>${escapeHTML(pageDetail)}</span>`:''}</p>`:
          (pageDetail?`<p class="tarot-companion-page-topic"><span>${escapeHTML(pageDetail)}</span></p>`:'')}
        <div class="tarot-companion-rule" aria-hidden="true"><i></i><span>✦</span><i></i></div>`;

      (pageConfig.blocks||[]).forEach(block=>{
        const node=blockNodes.get(block)||companionBlockNode(section,block);
        if(!node) return;
        node.dataset.companionBlock=block;
        body.appendChild(node);
      });

      if(pages.length>1){
        nav.hidden=false;
        const atStart=safe===0;
        const atEnd=safe===pages.length-1;
        prev.disabled=atStart;
        prev.hidden=atStart;
        next.disabled=atEnd;
        next.hidden=atEnd;
        count.textContent=`${safe+1} / ${pages.length}`;
        dots.innerHTML=pages.map((_,index)=>`<button type="button" class="tarot-page-dot" data-page-index="${index}" aria-label="Open companion card ${index+1} of ${pages.length}" ${index===safe?'aria-current="page"':''}></button>`).join('');
      }else{
        nav.hidden=true;
        prev.hidden=true;
        next.hidden=true;
        dots.innerHTML='';
        count.textContent='';
      }
      auditFit();
    };

    if(!card.__dreamscapeFitObserver&&typeof ResizeObserver!=='undefined'){
      card.__dreamscapeFitObserver=new ResizeObserver(auditFit);
      card.__dreamscapeFitObserver.observe(card);
    }

    section.__dreamscapeSetCompanionPage=setPage;

    if(!pager.dataset.controlsBound){
      pager.dataset.controlsBound='true';
      pager.addEventListener('click',event=>{
        const stepButton=event.target.closest('[data-page-step]');
        if(stepButton){
          event.preventDefault();
          event.stopPropagation();
          if(stepButton.disabled) return;
          const current=Number(section.dataset.activePage||0);
          setPage(current+Number(stepButton.dataset.pageStep));
          return;
        }
        const dot=event.target.closest('[data-page-index]');
        if(dot){
          event.preventDefault();
          event.stopPropagation();
          setPage(Number(dot.dataset.pageIndex));
        }
      },true);
      pager.addEventListener('keydown',event=>{
        if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight') return;
        if(event.target.matches('input,textarea,select')) return;
        const current=Number(section.dataset.activePage||0);
        const delta=event.key==='ArrowLeft'?-1:1;
        const nextIndex=current+delta;
        if(nextIndex<0||nextIndex>=pages.length) return;
        event.preventDefault();
        setPage(nextIndex);
        const targetButton=delta<0?prev:next;
        if(!targetButton.hidden) targetButton.focus({preventScroll:true});
      });
    }

    const library=section.querySelector('.territory-v1-private-record-browser');
    if(library&&library.parentElement!==section) section.appendChild(library);

    const current=Math.min(Number(section.dataset.activePage||0),pages.length-1);
    setPage(Number.isFinite(current)?current:0);
  }

  function consolidateMeaningsCard(interpretation,lenses,method){
    if(!interpretation) return;
    if(lenses&&!interpretation.contains(lenses)){
      lenses.removeAttribute('data-chapter');
      lenses.classList.add('tarot-companion-subsection');
      interpretation.appendChild(lenses);
    }else if(lenses){
      lenses.removeAttribute('data-chapter');
      lenses.classList.add('tarot-companion-subsection');
    }
    if(method&&!interpretation.contains(method)){
      method.removeAttribute('data-chapter');
      method.classList.add('tarot-companion-boundary');
      interpretation.appendChild(method);
    }else if(method){
      method.removeAttribute('data-chapter');
      method.classList.add('tarot-companion-boundary');
    }
  }

  function ensureDockedWorkspace(reader,data){
    const docked=data.presentation?.mode==='docked-workspace';
    if(!docked){
      restoreTriptych(reader);
      return;
    }

    reader.classList.remove('tarot-sidepanel','tarot-v3-water','tarot-triptych');
    reader.classList.add('tarot-docked-workspace');

    const scroll=reader.querySelector('.territory-v1-tarot-scroll');
    const imageWrap=reader.querySelector('.territory-v1-tarot-image');
    const title=reader.querySelector('h2');
    const kicker=reader.querySelector('.territory-v1-kicker');
    const stats=reader.querySelector('.territory-v1-tarot-stats');
    const grounding=reader.querySelector('.territory-v1-grounding')?.closest('section');
    const geography=reader.querySelector('.territory-v1-tarot-geography');
    const functions=reader.querySelector('.territory-v1-functions');
    const interpretation=reader.querySelector('.territory-v1-interpretation')?.closest('section');
    const lenses=reader.querySelector('.territory-v1-lenses');
    const lesson=reader.querySelector('.territory-v1-lesson');
    const records=reader.querySelector('.territory-v1-dream-records');
    const related=reader.querySelector('.territory-v1-related');
    const chronology=ensureChronology(reader,data);
    const method=reader.querySelector('.territory-v1-method');

    let subtitle=reader.querySelector('.territory-v1-tarot-subtitle');
    if(!subtitle){
      subtitle=document.createElement('p');
      subtitle.className='territory-v1-tarot-subtitle';
      title?.insertAdjacentElement('afterend',subtitle);
    }
    subtitle.textContent=data.friendlySubtitle||data.previewSummary||'';
    if(kicker) kicker.textContent=(data.presentation?.eyebrow||'DREAMSCAPE · TAROT');

    grounding?.classList.add('territory-v1-corpus-grounding');
    interpretation?.classList.add('territory-v1-possible-readings');

    grounding?.setAttribute('data-chapter','overview');
    geography?.setAttribute('data-chapter','geography');
    functions?.setAttribute('data-chapter','patterns');
    related?.setAttribute('data-chapter','alongside');
    chronology?.setAttribute('data-chapter','chronology');
    records?.setAttribute('data-chapter','sources');
    interpretation?.setAttribute('data-chapter','meanings');
    if(lenses) lenses.removeAttribute('data-chapter');
    if(lesson){ lesson.hidden=true; lesson.removeAttribute('data-chapter'); }
    if(method) method.removeAttribute('data-chapter');
    consolidateMeaningsCard(interpretation,lenses,method);

    if(grounding) grounding.querySelector(':scope > h3').textContent='Overview';
    if(geography) geography.querySelector(':scope > h3').textContent=`Where ${data.title||'it'} appears`;
    if(functions) functions.querySelector(':scope > h3').textContent='Recurring patterns';
    if(records) records.querySelector(':scope > h3').textContent=`Dreams containing ${data.title||'this'}`;
    if(interpretation) interpretation.querySelector(':scope > h3').textContent='Possible meanings';
    if(lenses) lenses.querySelector(':scope > h3').textContent='Interpretive lenses';
    if(lesson) lesson.querySelector(':scope > h3').textContent='Reflection';

    geography?.setAttribute('data-layer-label','EVIDENCE');
    grounding?.setAttribute('data-layer-label','EVIDENCE');
    functions?.setAttribute('data-layer-label','EVIDENCE');
    records?.setAttribute('data-layer-label','EVIDENCE');
    chronology?.setAttribute('data-layer-label','EVIDENCE');
    interpretation?.setAttribute('data-layer-label','INTERPRETATION · NOT CORPUS FACT');
    lenses?.setAttribute('data-layer-label','INTERPRETIVE LENSES');

    let shell=reader.querySelector('.tarot-triptych-shell');
    if(!shell){
      shell=document.createElement('div');
      shell.className='tarot-triptych-shell';
      shell.innerHTML=`
        <nav class="tarot-triptych-nav" aria-label="Tarot sections">
          <p class="tarot-triptych-nav-kicker">Explore the card</p>
          <div class="tarot-triptych-nav-items">
            ${chapters.map((chapter,index)=>`
              <button type="button" data-chapter-id="${chapter.id}">
                <small>${String(index+1).padStart(2,'0')}</small>
                <span>${chapter.label}</span>
                <i aria-hidden="true">✦</i>
              </button>`).join('')}
          </div>
          <div class="tarot-triptych-nav-arrows">
            <button type="button" data-chapter-step="-1" aria-label="Previous section">←</button>
            <button type="button" data-chapter-step="1" aria-label="Next section">→</button>
          </div>
        </nav>
        <div class="tarot-triptych-center"></div>
        <div class="tarot-triptych-info" aria-live="polite"></div>`;
      scroll.appendChild(shell);
    }

    const center=shell.querySelector('.tarot-triptych-center');
    const info=shell.querySelector('.tarot-triptych-info');

    if(imageWrap&&imageWrap.parentElement!==center) center.appendChild(imageWrap);
    if(kicker&&kicker.parentElement!==center) center.appendChild(kicker);
    if(title&&title.parentElement!==center) center.appendChild(title);
    if(subtitle&&subtitle.parentElement!==center) center.appendChild(subtitle);
    if(stats&&stats.parentElement!==center) center.appendChild(stats);
    if(stats) stats.hidden=true;

    const dreamCount=data.corpusOverview?.wholeSeriesCount??data.corpusOverview?.uniqueDreamCount;
    let medallion=imageWrap?.querySelector('.tarot-dream-medallion');
    if(imageWrap&&!medallion){
      medallion=document.createElement('div');
      medallion.className='tarot-dream-medallion';
      imageWrap.appendChild(medallion);
    }
    if(medallion&&dreamCount!=null) medallion.innerHTML=`<b>${escapeHTML(dreamCount)}</b><small>DREAMS</small>`;

    [grounding,geography,functions,related,chronology,records,interpretation].forEach(node=>{
      if(node&&node.parentElement!==info) info.appendChild(node);
    });

    const total=data.corpusOverview?.totalCorpusDreams;
    const whole=data.corpusOverview?.wholeSeriesCount;
    if(grounding&&whole!=null&&total!=null){
      let lead=grounding.querySelector('.tarot-overview-lead');
      if(!lead){
        lead=document.createElement('p');
        lead.className='tarot-overview-lead';
        grounding.insertBefore(lead,grounding.querySelector('.territory-v1-grounding'));
      }
    }
    ensureOverviewEnhancements(grounding,data);
    ensureGeographyExplanation(geography,data);
    ensureConfidenceLegend(functions,data);
    const companionSections={
      overview:grounding,
      geography,
      patterns:functions,
      alongside:related,
      chronology,
      sources:records,
      meanings:interpretation
    };
    Object.entries(companionSections).forEach(([chapterId,section])=>ensureCompanionCard(section,chapterId,data));

    const activate=id=>{
      const valid=chapters.some(ch=>ch.id===id)?id:'overview';
      const previous=info.dataset.activeChapter||null;
      const changed=previous!==valid;
      reader.dataset.activeChapter=valid;
      info.dataset.activeChapter=valid;
      info.querySelectorAll(':scope > [data-chapter]').forEach(node=>{
        const active=node.dataset.chapter===valid;
        node.hidden=!active;
        node.classList.toggle('is-active-companion',active);
      });
      let activeChapterButton=null;
      shell.querySelectorAll('[data-chapter-id]').forEach(button=>{
        const active=button.dataset.chapterId===valid;
        button.classList.toggle('active',active);
        button.setAttribute('aria-current',active?'page':'false');
        if(active) activeChapterButton=button;
      });
      activeChapterButton?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
      const activeDeck=info.querySelector(`:scope > [data-chapter="${CSS.escape(valid)}"]`);
      if(activeDeck&&changed&&typeof activeDeck.__dreamscapeSetCompanionPage==='function'){
        activeDeck.__dreamscapeSetCompanionPage(0);
      }
      info.scrollTo({top:0,behavior:'auto'});
    };

    if(!shell.dataset.bound){
      shell.dataset.bound='true';
      shell.addEventListener('click',event=>{
        const chapterButton=event.target.closest('[data-chapter-id]');
        if(chapterButton){activate(chapterButton.dataset.chapterId);return;}
        const arrow=event.target.closest('[data-chapter-step]');
        if(!arrow) return;
        const current=chapters.findIndex(ch=>ch.id===(reader.dataset.activeChapter||'overview'));
        const next=Math.max(0,Math.min(chapters.length-1,current+Number(arrow.dataset.chapterStep)));
        if(next!==current) activate(chapters[next].id);
      });
      const chapterStrip=shell.querySelector('.tarot-triptych-nav-items');
      chapterStrip?.addEventListener('wheel',event=>{
        if(Math.abs(event.deltaY)<=Math.abs(event.deltaX)) return;
        if(chapterStrip.scrollWidth<=chapterStrip.clientWidth) return;
        event.preventDefault();
        chapterStrip.scrollBy({left:event.deltaY,behavior:'smooth'});
      },{passive:false});
    }

    activate(reader.dataset.activeChapter||'overview');

    if(!reader.dataset.triptychAnimated){
      reader.dataset.triptychAnimated='true';
      reader.animate(
        [{opacity:.72,transform:'translateX(18px)'},{opacity:1,transform:'translateX(0)'}],
        {duration:360,easing:'cubic-bezier(.16,.78,.12,1)'}
      );
    }
  }

  function composePreview(preview,data){
    if(!preview||!data) return;
    const imageLed=data.presentation?.previewMode==='image-led'||data.presentation?.mode==='docked-workspace';
    preview.classList.toggle('tarot-preview-image-led',imageLed);
    preview.classList.add('tarot-v2-exemplar-preview','tarot-preview-precomposed');

    const image=ensurePreviewImage(preview);
    const img=image.querySelector('img');
    if(data.previewImage||data.cardImage){
      img.src=data.previewImage||data.cardImage;
      img.alt=`Dreamscape artwork for ${data.title||'this Tarot'}`;
      applyFraming(img,data,'preview');
      image.hidden=false;
    }else image.hidden=true;

    if(imageLed){
      const count=data.corpusOverview?.wholeSeriesCount??data.corpusOverview?.uniqueDreamCount;
      const caption=ensurePreviewCaption(preview);
      caption.innerHTML=`<b>${escapeHTML(data.title||'Tarot')}</b>${count!=null?`<span>${escapeHTML(count)} dreams</span>`:''}`;
      preview.querySelector('.territory-v1-preview-kicker').textContent='';
      preview.querySelector('h3').textContent='';
      preview.querySelector('.territory-v1-preview-grounding').textContent='';
      preview.querySelector('.territory-v1-preview-meta').innerHTML='';
      const open=preview.querySelector('.territory-v1-preview-open');
      if(open) open.innerHTML='Open tarot <span>→</span>';
    }else{
      image.querySelector('.tarot-preview-caption')?.remove();
      if(data.title) preview.querySelector('h3').textContent=data.title;
      if(data.friendlySubtitle) preview.querySelector('.territory-v1-preview-kicker').textContent=data.friendlySubtitle;
      if(data.previewSummary) preview.querySelector('.territory-v1-preview-grounding').textContent=data.previewSummary;
      renderStats(preview.querySelector('.territory-v1-preview-meta'),(data.quickStats||[]).slice(0,2));
    }
  }

  function applyPreview(){
    const preview=root.querySelector('.territory-v1-preview.open');
    const data=selectedData();
    if(!preview||!data) return;
    composePreview(preview,data);
  }


  function stableArticleTarget(section,className){
    if(!section) return null;
    let target=section.querySelector('.'+className);
    if(target) return target;
    target=Array.from(section.children).find(node=>node.tagName==='DIV'&&!node.classList.contains('tarot-companion-body'))||
      section.querySelector('.tarot-companion-body > div');
    if(target) target.classList.add(className);
    return target;
  }

  function applyTarot(){
    const reader=root.querySelector('.territory-v1-reader.open');
    const data=selectedData();
    if(!reader||!data) return;

    reader.classList.add('tarot-v2-exemplar');
    reader.dataset.tarotId=selectedId()||'';
    const deckImage=data.cardImage||data.previewImage;
    if(deckImage) reader.style.setProperty('--tarot-deck-image',`url("${deckImage}")`);
    reader.classList.toggle('tarot-v2-gold-standard',Boolean(data.goldStandardExemplar));

    if(data.title) reader.querySelector('h2').textContent=data.title;
    reader.querySelector('.territory-v1-kicker').textContent=data.friendlySubtitle||'A pattern across your dreams';

    const imageWrap=reader.querySelector('.territory-v1-tarot-image');
    if(imageWrap&&(data.cardImage||data.previewImage)){
      imageWrap.hidden=false;
      const img=imageWrap.querySelector('img');
      img.src=data.cardImage||data.previewImage;
      img.alt=`Dreamscape Tarot artwork for ${data.title||'this card'}`;
      applyFraming(img,data,'full');
    }

    renderStats(reader.querySelector('.territory-v1-tarot-stats'),data.quickStats);
    renderGeography(reader,data);
    if(data.corpusGrounding) reader.querySelector('.territory-v1-grounding').textContent=data.corpusGrounding;
    renderArticles(stableArticleTarget(reader.querySelector('.territory-v1-functions'),'territory-v1-function-list'),data.recurringFunctions);
    renderMeanings(reader,data);
    renderArticles(stableArticleTarget(reader.querySelector('.territory-v1-lenses'),'territory-v1-lens-list'),data.interpretiveLenses);

    const lesson=reader.querySelector('.territory-v1-lesson');
    if(lesson&&data.possibleLesson){
      lesson.hidden=data.presentation?.mode==='docked-workspace';
      lesson.querySelector('p').textContent=data.possibleLesson;
      lesson.querySelector('.territory-v1-reflection')?.remove();
    }

    renderRecordAccess(reader,data);
    renderRelated(reader,data);

    const method=reader.querySelector('.territory-v1-method');
    if(method) method.textContent=data.interpretiveBoundary||'Evidence describes patterns found across your dreams. Interpretations and theoretical lenses are possible readings, not fixed meanings.';

    ensureDockedWorkspace(reader,data);
  }

  function makeLanguageFriendly(){
    const reader=root.querySelector('.territory-v1-reader');
    if(!reader||reader.classList.contains('tarot-docked-workspace')) return;
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
  }

  const refresh=()=>requestAnimationFrame(()=>{makeLanguageFriendly();applyPreview();applyTarot();});
  refresh();
  const observer=new MutationObserver(mutations=>{
    const external=mutations.some(mutation=>{
      const target=mutation.target;
      return !(target instanceof Element&&target.closest('.tarot-companion-pager'));
    });
    if(external) refresh();
  });
  observer.observe(root,{subtree:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('dreamscape-private-profile-change',refresh);
  window.addEventListener('dreamscape-preview-will-open',event=>{
    const preview=event.detail?.preview||root.querySelector('.territory-v1-preview');
    const subjectId=event.detail?.subjectId||selectedId();
    const data=overlays[subjectId];
    if(preview&&data) composePreview(preview,data);
  });
  window.__hearthlandsTarotV2={
    overlays:Object.keys(overlays),
    exemplars:['family-home','water','person-11'],
    goldStandard:'water',
    canonicalShell:'docked-workspace'
  };
}

boot().catch(error=>console.warn('Hearthlands Tarot overlays unavailable.',error));
