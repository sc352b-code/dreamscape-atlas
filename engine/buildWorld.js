const STOP = new Set(["the","and","with","toward","into","there","from","that","this","beneath","although","without","seem","waited","beside","afraid","opened","huge","table","small","under","chair","climbed","inside","burned","fuel","nobody"]);
const DOMESTIC = new Set(["home","house","hearth","kitchen","cottage","bread","fire","amber","belonging","safety","warm","dwelling","chimney","smoke"]);
const SYMBOL_WORDS = new Set(["fox","stars","star","moon","river","bird","snake","horse","door","key","tree","water","ocean","sea","wolf","cat","dog","child","mother","father","grandmother","grandfather","mountain","hill","field","forest","garden","fire","smoke"]);

export function hashString(input){let h=2166136261;for(const ch of input){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function normalize(token){return token.toLowerCase().replace(/[^a-z0-9'-]/g,"")}
function unique(values){return [...new Set(values)]}
function titleCase(s){return s ? s[0].toUpperCase()+s.slice(1) : s}

export function extractMotifs(corpus){
  const counts=new Map(), evidence=new Map();
  for(const dream of corpus.dreams){
    const explicit=dream.tags??[];
    const textTokens=dream.text.split(/\s+/).map(normalize).filter(t=>t.length>3&&!STOP.has(t));
    const terms=new Set([...explicit.map(normalize),...textTokens]);
    for(const token of terms){counts.set(token,(counts.get(token)??0)+1);if(!evidence.has(token))evidence.set(token,[]);evidence.get(token).push(dream.id)}
  }
  return [...counts.entries()].map(([name,recurrence])=>({name,recurrence,evidence:evidence.get(name)})).sort((a,b)=>b.recurrence-a.recurrence||a.name.localeCompare(b.name));
}

export function buildWorld(corpus){
  const motifs=extractMotifs(corpus), seed=hashString(corpus.corpusId), dreamCount=corpus.dreams.length;
  const motifMap=new Map(motifs.map(m=>[m.name,m]));
  const domesticMotifs=motifs.filter(m=>DOMESTIC.has(m.name));
  const hearthEvidence=unique(domesticMotifs.flatMap(m=>m.evidence));
  const hearthScore=domesticMotifs.reduce((s,m)=>s+m.recurrence,0);
  const numinousDreams=corpus.dreams.filter(d=>d.numinous);
  const emotions=new Map();
  for(const dream of corpus.dreams) for(const emotion of dream.emotion??[]) emotions.set(emotion,(emotions.get(emotion)??0)+1);
  const emotionProfile=[...emotions.entries()].sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count,evidence:corpus.dreams.filter(d=>(d.emotion??[]).includes(name)).map(d=>d.id)}));
  const explicitTags=new Set(corpus.dreams.flatMap(d=>d.tags??[]).map(normalize));
  let symbolMotifs=motifs.filter(m=>SYMBOL_WORDS.has(m.name)&&!DOMESTIC.has(m.name));
  if(!symbolMotifs.length) symbolMotifs=motifs.filter(m=>explicitTags.has(m.name)&&!DOMESTIC.has(m.name));
  symbolMotifs=symbolMotifs.slice(0,6);
  const fox=motifMap.get("fox");
  const warmEvidence=unique([...(motifMap.get("amber")?.evidence??[]),...(motifMap.get("fire")?.evidence??[]),...(motifMap.get("hearth")?.evidence??[])]);
  const strength=Math.min(1,.28+hearthScore/18+numinousDreams.length/(dreamCount*10));

  return {
    id:`world-${corpus.corpusId}`, title:"A World Made From Your Dreams", seed,
    corpusSummary:{dreamCount,numinousCount:numinousDreams.length,motifCount:motifs.length,recurringMotifs:motifs.filter(m=>m.recurrence>1).slice(0,8),emotionProfile},
    territories:[{
      id:"territory-hearth-01",archetype:"hearth",name:"Hearthlands",subtitle:"Where belonging, memory and inner warmth gather",strength,
      palette:{core:"#d78b5a",glow:"#ffc98f",shadow:"#291836",mist:"#9b6b8f"},
      atmosphere:{mist:.42+strength*.22,embers:.22+warmEvidence.length/dreamCount*.35,stars:.38+numinousDreams.length/dreamCount*.28},terrain:"rolling-hills",motionPreset:"warm-breathing",
      evidence:hearthEvidence,
      evidenceMotifs:domesticMotifs.slice(0,8),
      places:[{id:"place-house-01",name:"The Amber House",kind:"dwelling",significance:Math.min(1,.5+hearthEvidence.length/dreamCount*.45),evidence:hearthEvidence,qualities:["shelter","memory","warmth"]}],
      symbols:symbolMotifs.map((m,i)=>({id:`symbol-${m.name}-${i+1}`,name:titleCase(m.name),recurrence:m.recurrence,significance:Math.min(1,.35+m.recurrence*.18),evidence:m.evidence,role:m.name==="fox"?"guide":"recurring presence"}))
    }],
    links:fox?[{from:"territory-hearth-01",to:`symbol-fox-${symbolMotifs.findIndex(m=>m.name==="fox")+1}`,kind:"recurrence",strength:fox.recurrence/dreamCount,evidence:fox.evidence}]:[],
    provenance:{corpusId:corpus.corpusId,engineVersion:"0.2.0",generatedAt:new Date().toISOString()}
  };
}
