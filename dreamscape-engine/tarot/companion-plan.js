const wordCount=value=>String(value||'').trim().split(/\s+/).filter(Boolean).length;
const possessive=title=>/s$/i.test(title)?`${title}’`:`${title}’s`;

function lensWeight(lens){
  return wordCount(lens?.summary)+wordCount(lens?.caveat);
}

export function planCompanionCards(card){
  const title=card.title||'This Subject';
  const hasBehaviour=Boolean(card.behaviorSummary);
  const hasFunctions=Array.isArray(card.recurringFunctions)&&card.recurringFunctions.length>0;
  const hasConfidence=hasFunctions&&card.recurringFunctions.some(item=>item.confidence);
  const relatedCount=Array.isArray(card.relatedItems)?card.relatedItems.length:0;
  const lenses=Array.isArray(card.interpretiveLenses)?card.interpretiveLenses:[];
  const meanings=Array.isArray(card.possibleMeanings)?card.possibleMeanings:[];

  const overviewPages=[
    {
      id:'record',
      title:`The ${title} Record`,
      subtitle:`A corpus-grounded record of ${title}`,
      blocks:['heroMetric','grounding','metrics']
    }
  ];
  if(hasBehaviour){
    overviewPages.push({
      id:'action',
      title:`${title} in Action`,
      subtitle:`What you tend to be doing when ${title} appears`,
      blocks:['behaviour']
    });
  }
  if(hasFunctions){
    overviewPages.push({
      id:'anchors',
      title:'Recurring Actions',
      subtitle:`The strongest actions around ${title}`,
      blocks:['behaviourPoles']
    });
  }

  const patternPages=[];
  if(hasConfidence){
    patternPages.push({
      id:'strength',
      title:'Reading the Evidence',
      subtitle:'How to read the evidence-strength labels',
      blocks:['strengthLegend']
    });
  }
  patternPages.push({
    id:'forms',
    title:`The Forms of ${title}`,
    subtitle:'Recurring functions in the current analysis',
    blocks:['functions']
  });

  const alongsidePages=relatedCount>4
    ?[
      {
        id:'constellation',
        title:`The Constellation of ${title}`,
        subtitle:`How related Dreamscape elements gather around ${title}`,
        blocks:['relatedNote','relatedCore']
      },
      {
        id:'related',
        title:`${possessive(title)} Companions`,
        subtitle:'Related elements in the current derived model',
        blocks:['relatedItems']
      }
    ]
    :[{
      id:'constellation',
      title:`The Constellation of ${title}`,
      subtitle:'Related Dreamscape elements',
      blocks:['relatedNote','relatedCore','relatedItems']
    }];

  const meaningPages=[];
  if(meanings.length){
    meaningPages.push({
      id:'readings',
      title:`The Mirror of ${title}`,
      subtitle:'Possible readings · interpretation, not corpus fact',
      blocks:['meanings']
    });
  }

  let currentLensPage=null;
  lenses.forEach((lens,index)=>{
    const block=`lens:${index}`;
    const mustStandAlone=Boolean(lens?.caveat)||lensWeight(lens)>55;
    if(
      mustStandAlone||
      !currentLensPage||
      currentLensPage.blocks.length>=2||
      (currentLensPage.weight+lensWeight(lens))>90
    ){
      currentLensPage={
        id:`lens-${index+1}`,
        title:lens?.name||`Interpretive Lens ${index+1}`,
        subtitle:'One way of looking · not a fixed translation',
        blocks:[block],
        weight:lensWeight(lens)
      };
      meaningPages.push(currentLensPage);
    }else{
      currentLensPage.blocks.push(block);
      currentLensPage.weight+=lensWeight(lens);
      currentLensPage.title='Other Ways of Looking';
      currentLensPage.subtitle='Additional interpretive lenses · not fixed meanings';
    }
  });
  if(!meaningPages.length){
    meaningPages.push({
      id:'readings',
      title:`The Mirror of ${title}`,
      subtitle:'Interpretation not yet derived',
      blocks:['meanings']
    });
  }
  const lastMeaningPage=meaningPages.at(-1);
  if(lastMeaningPage.blocks.length<3) lastMeaningPage.blocks.push('boundary');
  else meaningPages.push({
    id:'boundary',
    title:'Interpretive Boundary',
    subtitle:'What this reading can and cannot claim',
    blocks:['boundary']
  });
  meaningPages.forEach(page=>delete page.weight);

  return {
    overview:{
      title:`The ${title} Record`,
      subtitle:`A corpus-grounded record of ${title}`,
      motif:'record',
      tone:'evidence',
      pages:overviewPages
    },
    geography:{
      title:`The Geography of ${title}`,
      subtitle:'Where this subject appears across the Dreamscape',
      motif:'currents',
      tone:'evidence',
      pages:[{
        id:'territories',
        title:`The Geography of ${title}`,
        subtitle:card.geographyCountMode==='overlapping-memberships'
          ?'Territory memberships may overlap'
          :'Territory distribution',
        blocks:['geographyLogic','geographyRows','geographyNote']
      }]
    },
    patterns:{
      title:`The Forms of ${title}`,
      subtitle:'Recurring functions and evidence strength',
      motif:'forms',
      tone:'evidence',
      pages:patternPages
    },
    alongside:{
      title:`The Constellation of ${title}`,
      subtitle:'Related Dreamscape elements',
      motif:'constellation',
      tone:'evidence',
      pages:alongsidePages
    },
    chronology:{
      title:`${title} Through Time`,
      subtitle:'What the chronology can — and cannot — support',
      motif:'river-time',
      tone:'evidence',
      pages:[{
        id:'timeline',
        title:`${title} Through Time`,
        subtitle:'What the chronology can — and cannot — support',
        blocks:['chronologyRiver','chronologyText']
      }]
    },
    sources:{
      title:'Source Dreams',
      subtitle:`${card.privateCorpusAccess?.expectedDreamCount??card.corpusOverview?.uniqueDreamCount??''} linked source dreams`.trim(),
      motif:'manuscript',
      tone:'source',
      pages:[{
        id:'book',
        title:'Source Dreams',
        subtitle:'Open the private dream library',
        blocks:['sourceIntro','sourceButton']
      }]
    },
    meanings:{
      title:`The Mirror of ${title}`,
      subtitle:'Possible meanings · interpretation, not corpus fact',
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
