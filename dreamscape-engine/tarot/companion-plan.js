const wordCount=value=>String(value||'').trim().split(/\s+/).filter(Boolean).length;
const possessive=title=>/s$/i.test(title)?`${title}’`:`${title}’s`;

function lensWeight(lens){
  return wordCount(lens?.summary)+wordCount(lens?.caveat);
}

function itemWeight(item){
  return wordCount(item?.name)+wordCount(item?.summary)+wordCount(item?.caveat);
}

function paginateIndexedItems(items,{prefix,idPrefix,pageNoun,maxItems=2,maxWeight=105}){
  if(!Array.isArray(items)||!items.length) return [];
  const pages=[];
  let current=null;
  items.forEach((item,index)=>{
    const weight=itemWeight(item);
    if(!current||current.blocks.length>=maxItems||(current.weight+weight)>maxWeight){
      current={indices:[],blocks:[],weight:0};
      pages.push(current);
    }
    current.indices.push(index);
    current.blocks.push(`${prefix}:${index}`);
    current.weight+=weight;
  });
  return pages.map((page,pageIndex)=>{
    const first=page.indices[0]+1;
    const last=page.indices.at(-1)+1;
    return {
      id:`${idPrefix}-${pageIndex+1}`,
      title:first===last?`${pageNoun} ${first} of ${items.length}`:`${pageNoun}s ${first}–${last} of ${items.length}`,
      subtitle:'Corpus-grounded detail at readable card scale',
      blocks:page.blocks
    };
  });
}

export function planCompanionCards(card){
  const title=card.title||'This Subject';
  const hasBehaviour=Boolean(card.behaviorSummary);
  const functions=Array.isArray(card.recurringFunctions)?card.recurringFunctions:[];
  const hasFunctions=functions.length>0;
  const hasConfidence=hasFunctions&&functions.some(item=>item.confidence);
  const relatedCount=Array.isArray(card.relatedItems)?card.relatedItems.length:0;
  const lenses=Array.isArray(card.interpretiveLenses)?card.interpretiveLenses:[];
  const meanings=Array.isArray(card.possibleMeanings)?card.possibleMeanings:[];

  const overviewPages=[
    {
      id:'record',
      title:`The ${title} record`,
      subtitle:`A corpus-grounded record of ${title}`,
      blocks:['heroMetric','grounding','metrics']
    }
  ];
  if(hasBehaviour){
    overviewPages.push({
      id:'action',
      title:`${title} in action`,
      subtitle:`What most changes the meaning when ${title} appears`,
      blocks:['behaviour']
    });
  }
  if(hasFunctions){
    overviewPages.push({
      id:'anchors',
      title:'Recurring actions',
      subtitle:`The strongest recurring modes around ${title}`,
      blocks:['behaviourPoles']
    });
  }

  const patternPages=[];
  if(hasConfidence){
    patternPages.push({
      id:'strength',
      title:'Reading the evidence',
      subtitle:'What the evidence-strength labels mean',
      blocks:['strengthLegend']
    });
  }
  patternPages.push(...paginateIndexedItems(functions,{
    prefix:'function',
    idPrefix:'patterns',
    pageNoun:'Pattern',
    maxItems:2,
    maxWeight:100
  }));
  if(!hasFunctions){
    patternPages.push({
      id:'patterns-none',
      title:'Current pattern evidence',
      subtitle:'No recurring function has yet met the current evidence threshold',
      blocks:['functions']
    });
  }

  const alongsidePages=relatedCount>4
    ?[
      {
        id:'constellation',
        title:`The constellation of ${title}`,
        subtitle:`How related Dreamscape elements gather around ${title}`,
        blocks:['relatedNote','relatedCore']
      },
      {
        id:'related',
        title:`${possessive(title)} companions`,
        subtitle:'Related elements in the current derived model',
        blocks:['relatedItems']
      }
    ]
    :[{
      id:'constellation',
      title:`The constellation of ${title}`,
      subtitle:'Related Dreamscape elements',
      blocks:['relatedNote','relatedCore','relatedItems']
    }];

  const meaningPages=paginateIndexedItems(meanings,{
    prefix:'meaning',
    idPrefix:'readings',
    pageNoun:'Possible reading',
    maxItems:2,
    maxWeight:95
  });
  if(!meaningPages.length){
    meaningPages.push({
      id:'readings-none',
      title:'Possible readings',
      subtitle:'Interpretation has not yet been derived',
      blocks:['meanings']
    });
  }else{
    meaningPages.forEach(page=>{
      page.subtitle='Interpretation · not corpus fact';
    });
  }

  let currentLensPage=null;
  lenses.forEach((lens,index)=>{
    const block=`lens:${index}`;
    const mustStandAlone=Boolean(lens?.caveat)||lensWeight(lens)>55;
    if(
      mustStandAlone||
      !currentLensPage||
      currentLensPage.sealed||
      currentLensPage.blocks.length>=2||
      (currentLensPage.weight+lensWeight(lens))>90
    ){
      currentLensPage={
        id:`lens-${index+1}`,
        title:lens?.name||`Interpretive lens ${index+1}`,
        subtitle:'One way of looking · not a fixed translation',
        blocks:[block],
        weight:lensWeight(lens),
        sealed:mustStandAlone
      };
      meaningPages.push(currentLensPage);
    }else{
      currentLensPage.blocks.push(block);
      currentLensPage.weight+=lensWeight(lens);
      currentLensPage.title='Other ways of looking';
      currentLensPage.subtitle='Additional interpretive lenses · not fixed meanings';
    }
  });
  const lastMeaningPage=meaningPages.at(-1);
  if(lastMeaningPage.blocks.length<3) lastMeaningPage.blocks.push('boundary');
  else meaningPages.push({
    id:'boundary',
    title:'Interpretive boundary',
    subtitle:'What this reading can and cannot claim',
    blocks:['boundary']
  });
  meaningPages.forEach(page=>{ delete page.weight; delete page.sealed; });

  return {
    overview:{
      title:'Overview',
      subtitle:`A corpus-grounded record of ${title}`,
      motif:'record',
      tone:'evidence',
      pages:overviewPages
    },
    geography:{
      title:'Where it appears',
      subtitle:'Where this subject appears across the Dreamscape',
      motif:'currents',
      tone:'evidence',
      pages:[
        {
          id:'territories',
          title:`The geography of ${title}`,
          subtitle:card.geographyCountMode==='overlapping-memberships'
            ?'Territory memberships may overlap'
            :'Territory distribution',
          blocks:['geographyLogic','geographyRows']
        },
        {
          id:'distribution-note',
          title:'What the distribution shows',
          subtitle:'A plain-language reading of the territory pattern',
          blocks:['geographyNote']
        }
      ]
    },
    patterns:{
      title:'Recurring patterns',
      subtitle:'Recurring functions and evidence strength',
      motif:'forms',
      tone:'evidence',
      pages:patternPages
    },
    alongside:{
      title:'Appears alongside',
      subtitle:'Related Dreamscape elements',
      motif:'constellation',
      tone:'evidence',
      pages:alongsidePages
    },
    chronology:{
      title:'How it changes',
      subtitle:'What the chronology can — and cannot — support',
      motif:'river-time',
      tone:'evidence',
      pages:[{
        id:'timeline',
        title:`${title} through time`,
        subtitle:'What the chronology can — and cannot — support',
        blocks:['chronologyRiver','chronologyText']
      }]
    },
    sources:{
      title:'Source dreams',
      subtitle:`${card.privateCorpusAccess?.expectedDreamCount??card.corpusOverview?.uniqueDreamCount??''} linked source dreams`.trim(),
      motif:'manuscript',
      tone:'source',
      pages:[{
        id:'book',
        title:'The source-dream record',
        subtitle:'Open the private dream library',
        blocks:['sourceIntro','sourceButton']
      }]
    },
    meanings:{
      title:'Possible meanings',
      subtitle:'Interpretation · not corpus fact',
      motif:'mirror',
      tone:'interpretation',
      pages:meaningPages
    }
  };
}

export function withPlannedCompanionCards(card){
  return {
    ...card,
    tarotEngineContractVersion:'1.0',
    companionCards:planCompanionCards(card)
  };
}
