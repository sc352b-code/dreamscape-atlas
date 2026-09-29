import {planCompanionCards} from './companion-plan.js';

const FORBIDDEN_PUBLIC_KEYS=new Set([
  'dreamText','fullDreamText','rawDream','rawDreams','dreamRecords','sourceDreams',
  'privateIdentityMap','privateRecordPayload'
]);

function assertNoPrivatePayload(value,path='input'){
  if(!value||typeof value!=='object') return;
  if(Array.isArray(value)){
    value.forEach((item,index)=>assertNoPrivatePayload(item,`${path}[${index}]`));
    return;
  }
  for(const [key,next] of Object.entries(value)){
    if(FORBIDDEN_PUBLIC_KEYS.has(key)){
      throw new Error(`Public Tarot input contains forbidden private key "${key}" at ${path}`);
    }
    assertNoPrivatePayload(next,`${path}.${key}`);
  }
}

const required=(value,name)=>{
  if(value==null||value==='') throw new Error(`Tarot v1 requires ${name}`);
  return value;
};

export function buildTarotCardV1(input){
  assertNoPrivatePayload(input);

  const title=required(input.title,'title');
  const subjectId=required(input.subjectId,'subjectId');
  const subjectType=required(input.subjectType,'subjectType');
  if(!['place','symbol','person','animal','object','territory'].includes(subjectType)){
    throw new Error(`Unsupported Tarot subjectType: ${subjectType}`);
  }
  const cardImage=required(input.cardImage,'cardImage');
  const corpusOverview=required(input.corpusOverview,'corpusOverview');
  required(input.corpusGrounding,'corpusGrounding');
  required(input.provenance?.corpusVersion,'provenance.corpusVersion');

  const uniqueDreamCount=corpusOverview.uniqueDreamCount??corpusOverview.wholeSeriesCount??null;

  const card={
    ...input,
    tarotEngineContractVersion:'1.0',
    title,
    cardImage,
    previewImage:input.previewImage||cardImage,
    recurringFunctions:Array.isArray(input.recurringFunctions)?input.recurringFunctions:[],
    possibleMeanings:Array.isArray(input.possibleMeanings)?input.possibleMeanings:[],
    interpretiveLenses:Array.isArray(input.interpretiveLenses)?input.interpretiveLenses:[],
    relatedItems:Array.isArray(input.relatedItems)?input.relatedItems:[],
    relationshipStatus:input.relationshipStatus||'pending',
    geographyCountMode:input.geographyCountMode||'pending',
    chronologySummary:input.chronologySummary??null,
    behaviorSummary:input.behaviorSummary??null,
    confidenceScale:input.confidenceScale||{note:'',levels:{}},
    interpretiveBoundary:input.interpretiveBoundary||
      'Evidence describes recurring corpus patterns. Possible meanings and theoretical lenses are hypotheses, not fixed translations.',
    imageFraming:{
      preview:{
        objectPosition:'50% 50%',
        ...(input.imageFraming?.preview||{})
      },
      full:{
        objectPosition:'50% 50%',
        objectFit:'contain',
        ...(input.imageFraming?.full||{})
      }
    },
    presentation:{
      mode:'docked-workspace',
      previewMode:'image-led',
      visualFamily:'celestial-oracle-dock',
      evidenceFirst:true,
      fullArtworkOpening:true,
      responsiveStrategy:'wide-desktop-mini-triptych; standard-desktop-artwork-first; mobile-full-height-drawer',
      ...(input.presentation||{}),
      mode:'docked-workspace',
      previewMode:'image-led',
      evidenceFirst:true,
      fullArtworkOpening:true
    },
    privateCorpusAccess:{
      ...(input.privateCorpusAccess||{}),
      enabled:true,
      subjectId,
      expectedDreamCount:uniqueDreamCount,
      accessMode:input.privateCorpusAccess?.accessMode||'authenticated-provider-or-local-private-profile'
    },
    provenance:{
      ...input.provenance,
      sourceCorpusScope:input.provenance?.sourceCorpusScope||'whole-corpus',
      theoryNeutralExtraction:true,
      evidenceRefsMode:input.provenance?.evidenceRefsMode||'private-provider'
    }
  };

  card.companionCards=planCompanionCards(card);
  return card;
}
