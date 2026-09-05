const DOMESTIC = new Set(["home","house","hearth","kitchen","cottage","bread","fire","amber","belonging","safety","warm","chimney","smoke"]);
const SYMBOLS = new Set(["fox","stars","moon","river","bird","snake","horse","door","key","tree","water","ocean","sea","wolf","cat","dog","child","mother","father","grandmother","grandfather","mountain","hill","field","forest","garden","fire","smoke"]);
const clean = s => s.toLowerCase().replace(/[^a-z0-9'-]/g,"");
const uniq = xs => [...new Set(xs)];
export function extractMotifs(corpus){
  const counts=new Map(), ev=new Map();
  for(const d of corpus.dreams){
    const terms=new Set((d.tags||[]).map(clean));
    for(const t of terms){counts.set(t,(counts.get(t)||0)+1); if(!ev.has(t))ev.set(t,[]); ev.get(t).push(d.id)}
  }
  return [...counts].map(([name,recurrence])=>({name,recurrence,evidence:ev.get(name)})).sort((a,b)=>b.recurrence-a.recurrence||a.name.localeCompare(b.name));
}
export function buildWorld(corpus){
  const motifs=extractMotifs(corpus), n=corpus.dreams.length;
  const domestic=motifs.filter(m=>DOMESTIC.has(m.name));
  const evidence=uniq(domestic.flatMap(m=>m.evidence));
  const numinous=corpus.dreams.filter(d=>d.numinous).length;
  const hearthScore=domestic.reduce((a,m)=>a+m.recurrence,0);
  const strength=Math.min(1,.34+hearthScore/20+numinous/n*.12);
  const symbols=motifs.filter(m=>SYMBOLS.has(m.name)&&!DOMESTIC.has(m.name));
  const fox=symbols.find(m=>m.name==="fox");
  return {corpusSummary:{dreamCount:n,numinousCount:numinous,recurringMotifs:motifs.filter(m=>m.recurrence>1),allMotifs:motifs},territories:[{
    id:"hearthlands",name:"Hearthlands",subtitle:"Where belonging, memory and inner warmth gather",strength,
    palette:{core:"#d68c6b",glow:"#ffd39e",mist:"#aa7795",night:"#100b1c"},
    evidence,evidenceMotifs:domestic,atmosphere:{mist:.58,embers:.62,stars:.72},
    places:[{id:"amber-house",name:"The Amber House",evidence,significance:.94}],
    symbols:symbols.map(m=>({name:m.name[0].toUpperCase()+m.name.slice(1),recurrence:m.recurrence,evidence:m.evidence,role:m.name==="fox"?"guide":"presence"})),
    threads:fox?[{from:"home",to:"fox",strength:fox.recurrence/n,evidence:fox.evidence}]:[]
  }]};
}
