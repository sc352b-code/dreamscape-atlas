import fs from 'node:fs';

const CONTRACT_PATH='dreamscape-engine/contracts/tarot-engine-contract.v1.json';
const OVERLAYS_PATH='worlds/reference-world/territories/hearthlands/tarot/tarot-v2-authored-overlays.json';

export function validateTarotCard(card,{id='unknown',contract}={}){
  const errors=[];
  const fail=message=>errors.push(`${id}: ${message}`);
  if(!card||typeof card!=='object'){ fail('card must be an object'); return errors; }

  if(card.presentation?.mode!=='docked-workspace') return errors;

  if(!card.subjectId) fail('subjectId is required');
  if(!['place','symbol','person','animal','object','territory'].includes(card.subjectType)){
    fail('subjectType must be a supported Tarot subject type');
  }
  if(id!=='unknown'&&card.subjectId&&card.subjectId!==id){
    fail(`subjectId "${card.subjectId}" does not match package key "${id}"`);
  }
  if(card.tarotEngineContractVersion!==contract.contractVersion){
    fail(`tarotEngineContractVersion must be ${contract.contractVersion}`);
  }
  if(card.presentation?.previewMode!=='image-led') fail('previewMode must be image-led');
  if(card.presentation?.evidenceFirst!==true) fail('presentation.evidenceFirst must be true');
  if(card.presentation?.fullArtworkOpening!==true) fail('presentation.fullArtworkOpening must be true');
  if(!card.presentation?.responsiveStrategy) fail('presentation.responsiveStrategy is required');
  if(!card.cardImage) fail('cardImage is required for exact deck-frame reuse');
  if(!card.previewImage) fail('previewImage is required');
  if(!card.imageFraming?.preview?.objectPosition) fail('imageFraming.preview.objectPosition is required');
  if(!card.imageFraming?.full?.objectPosition) fail('imageFraming.full.objectPosition is required');

  const expectedChapters=contract.chapters.map(x=>x.id);
  const companions=card.companionCards||{};
  const actualChapters=Object.keys(companions);
  for(const chapter of expectedChapters){
    if(!companions[chapter]) fail(`missing canonical companion chapter: ${chapter}`);
  }
  for(const chapter of actualChapters){
    if(!expectedChapters.includes(chapter)) fail(`unknown companion chapter: ${chapter}`);
  }

  const toneByChapter=Object.fromEntries(contract.chapters.map(x=>[x.id,x.tone]));
  const allowedBlocks=new Set(contract.allowedBlocks);
  const dynamicPatterns=(contract.dynamicBlockPatterns||[]).map(x=>new RegExp(x));
  const maxBlocks=contract.pageBudget?.maxBlocksPerPage??3;

  for(const chapter of expectedChapters){
    const config=companions[chapter];
    if(!config) continue;
    if(config.tone!==toneByChapter[chapter]){
      fail(`${chapter}.tone must be ${toneByChapter[chapter]}`);
    }
    if(!Array.isArray(config.pages)||config.pages.length===0){
      fail(`${chapter}.pages must contain at least one fixed companion page`);
      continue;
    }
    const seenPageIds=new Set();
    const seenBlocks=new Set();
    for(const page of config.pages){
      if(!page?.id) fail(`${chapter}: every page needs an id`);
      else if(seenPageIds.has(page.id)) fail(`${chapter}: duplicate page id ${page.id}`);
      else seenPageIds.add(page.id);
      if(!page?.title) fail(`${chapter}.${page?.id||'?'}: title required`);
      if(!page?.subtitle) fail(`${chapter}.${page?.id||'?'}: subtitle required`);
      if(!Array.isArray(page?.blocks)||page.blocks.length===0){
        fail(`${chapter}.${page?.id||'?'}: blocks required`);
        continue;
      }
      if(page.blocks.length>maxBlocks){
        fail(`${chapter}.${page.id}: ${page.blocks.length} blocks exceeds page budget of ${maxBlocks}; paginate instead`);
      }
      for(const block of page.blocks){
        const dynamicOk=dynamicPatterns.some(re=>re.test(block));
        if(!allowedBlocks.has(block)&&!dynamicOk){
          fail(`${chapter}.${page.id}: unknown block "${block}"`);
        }
        const ownership=block.startsWith('lens:')
          ?contract.blockChapterOwnership?.['lens:*']
          :block.startsWith('function:')
            ?contract.blockChapterOwnership?.['function:*']
            :block.startsWith('meaning:')
              ?contract.blockChapterOwnership?.['meaning:*']
              :contract.blockChapterOwnership?.[block];
        if(ownership&&ownership!==chapter){
          fail(`${chapter}.${page.id}: block "${block}" belongs to ${ownership}`);
        }
        if(seenBlocks.has(block)) fail(`${chapter}: block "${block}" assigned more than once`);
        seenBlocks.add(block);
        if(/^lens:\d+$/.test(block)){
          const index=Number(block.split(':')[1]);
          if(!Array.isArray(card.interpretiveLenses)||index>=card.interpretiveLenses.length){
            fail(`${chapter}.${page.id}: ${block} has no matching interpretive lens`);
          }
        }
      }
    }
    for(const required of contract.requiredBlocksByChapter?.[chapter]||[]){
      if(!seenBlocks.has(required)) fail(`${chapter}: required block "${required}" is not paginated`);
    }
    if(chapter==='meanings'&&Array.isArray(card.interpretiveLenses)){
      card.interpretiveLenses.forEach((_,index)=>{
        if(!seenBlocks.has(`lens:${index}`)) fail(`meanings: interpretive lens ${index} is not paginated`);
      });
    }
    if(chapter==='patterns'&&Array.isArray(card.recurringFunctions)){
      if(!seenBlocks.has('functions')){
        card.recurringFunctions.forEach((_,index)=>{
          if(!seenBlocks.has(`function:${index}`)) fail(`patterns: recurring function ${index} is not paginated`);
        });
      }
    }
    if(chapter==='meanings'&&Array.isArray(card.possibleMeanings)){
      if(!seenBlocks.has('meanings')){
        card.possibleMeanings.forEach((_,index)=>{
          if(!seenBlocks.has(`meaning:${index}`)) fail(`meanings: possible meaning ${index} is not paginated`);
        });
      }
    }
  }

  const provenance=card.provenance||{};
  for(const field of contract.provenance?.requiredPublicFields||[]){
    if(provenance[field]==null||provenance[field]==='') fail(`provenance.${field} is required`);
  }
  if(provenance.theoryNeutralExtraction!==true){
    fail('provenance.theoryNeutralExtraction must be true');
  }
  if(contract.provenance?.evidenceRefsMode&&provenance.evidenceRefsMode!==contract.provenance.evidenceRefsMode){
    fail(`provenance.evidenceRefsMode must be ${contract.provenance.evidenceRefsMode}`);
  }

  const forbiddenKeys=new Set(contract.privacy?.forbiddenPublicKeys||[]);
  const scan=(value,path='card')=>{
    if(!value||typeof value!=='object') return;
    if(Array.isArray(value)){ value.forEach((item,index)=>scan(item,`${path}[${index}]`)); return; }
    for(const [key,next] of Object.entries(value)){
      if(forbiddenKeys.has(key)) fail(`public package contains forbidden private key "${key}" at ${path}`);
      scan(next,`${path}.${key}`);
    }
  };
  scan(card);

  const overview=card.corpusOverview||{};
  const unique=overview.uniqueDreamCount??overview.wholeSeriesCount;
  const whole=overview.wholeSeriesCount;
  const appearances=overview.appearanceCount;
  if(unique!=null&&whole!=null&&unique!==whole){
    fail('uniqueDreamCount and wholeSeriesCount disagree');
  }
  if(unique!=null&&appearances!=null&&appearances<unique){
    fail('appearanceCount cannot be lower than uniqueDreamCount');
  }
  const territoryCounts=overview.territoryCounts||{};
  const membershipTotal=Object.values(territoryCounts).reduce((sum,value)=>sum+Number(value||0),0);
  if(Object.keys(territoryCounts).length){
    if(!card.geographyCountMode||card.geographyCountMode==='pending'){
      fail('geographyCountMode must explicitly describe territory count semantics');
    }
    if(card.geographyCountMode==='exclusive-dream-counts'&&unique!=null&&membershipTotal!==unique){
      fail('exclusive territory counts must tally to unique dream count');
    }
    if(card.geographyCountMode==='overlapping-memberships'&&unique!=null&&membershipTotal<unique){
      fail('overlapping membership total should not be lower than unique dream count');
    }
  }

  if(Array.isArray(card.recurringFunctions)&&card.recurringFunctions.some(x=>x.confidence)){
    const scale=card.confidenceScale;
    if(!scale?.note) fail('confidenceScale.note is required when confidence labels are used');
    const levels=scale?.levels||{};
    for(const item of card.recurringFunctions){
      if(item.confidence&&!levels[item.confidence]) fail(`confidence label "${item.confidence}" lacks a definition`);
    }
  }

  if(Array.isArray(card.relatedItems)&&card.relatedItems.length){
    if(!card.relationshipStatus||card.relationshipStatus==='pending'){
      fail('relationshipStatus must be explicit when relatedItems exist');
    }
  }

  const sourcePages=companions.sources?.pages||[];
  const sourceBlocks=sourcePages.flatMap(p=>p.blocks||[]);
  const allowedSourceBlocks=new Set(['sourceIntro','sourceButton']);
  for(const block of sourceBlocks){
    if(!allowedSourceBlocks.has(block)) fail(`sources: block "${block}" is forbidden inside the fixed Tarot; source records belong in the private library`);
  }
  if(card.privateCorpusAccess?.enabled){
    if(card.privateCorpusAccess.subjectId!==card.subjectId) fail('privateCorpusAccess.subjectId must match subjectId');
    if(unique!=null&&card.privateCorpusAccess.expectedDreamCount!=null&&card.privateCorpusAccess.expectedDreamCount!==unique){
      fail('privateCorpusAccess.expectedDreamCount must match unique dream count');
    }
    if(!card.privateCorpusAccess.accessMode) fail('privateCorpusAccess.accessMode required');
  }

  if(!card.interpretiveBoundary) fail('interpretiveBoundary is required');
  if(card.relationshipStatus==='related-not-cooccurrence'&&!Array.isArray(card.relatedItems)){
    fail('related-not-cooccurrence status requires relatedItems array');
  }

  return errors;
}

export function validateTarotOverlayPackage({contractPath=CONTRACT_PATH,overlaysPath=OVERLAYS_PATH}={}){
  const contract=JSON.parse(fs.readFileSync(contractPath,'utf8'));
  const overlays=JSON.parse(fs.readFileSync(overlaysPath,'utf8'));
  const errors=[];
  let checked=0;
  for(const [id,card] of Object.entries(overlays)){
    if(card?.presentation?.mode!=='docked-workspace') continue;
    checked+=1;
    errors.push(...validateTarotCard(card,{id,contract}));
  }
  if(checked===0) errors.push('No docked-workspace Tarot cards found to validate.');
  return {checked,errors};
}

if(import.meta.url===`file://${process.argv[1]}`){
  const result=validateTarotOverlayPackage();
  if(result.errors.length){
    console.error('Tarot engine contract validation failed:');
    for(const error of result.errors) console.error(`- ${error}`);
    process.exitCode=1;
  }else{
    console.log(`Tarot engine contract validation passed for ${result.checked} card(s).`);
  }
}
