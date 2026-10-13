import { createHash } from 'node:crypto';
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function periodRange(type,anchor) {
  if(!validDate(anchor)) throw new Error('Choose a valid dream date.');
  const d=new Date(anchor+'T00:00:00Z'),y=d.getUTCFullYear(),m=d.getUTCMonth();let start,end;
  if(type==='weekly'){start=new Date(d);start.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);end=new Date(start);end.setUTCDate(end.getUTCDate()+6);}
  else {const months={monthly:1,quarterly:3,'six-monthly':6,yearly:12}[type];if(!months)throw new Error('Choose a supported period.');const first=Math.floor(m/months)*months;start=new Date(Date.UTC(y,first,1));end=new Date(Date.UTC(y,first+months,0));}
  return {start:start.toISOString().slice(0,10),end:end.toISOString().slice(0,10)};
}
export function corpusVersion(dreams) {
  return createHash('sha256').update(JSON.stringify([...dreams].sort((a,b)=>a.id.localeCompare(b.id)).map(d=>[d.id,d.date,d.title,d.text,d.tags,d.flags,d.associations]))).digest('hex');
}
const motifs=[
  {id:'home',label:'Images of home',terms:['home','house','kitchen','cottage','hearth']},
  {id:'journey',label:'Journeys and crossings',terms:['journey','road','bus','train','bridge','crossroads','path']},
  {id:'water',label:'Water across your dreams',terms:['water','river','sea','ocean','lake','flood']},
  {id:'animal',label:'Animal encounters',terms:['fox','cat','dog','bird','snake','horse']},
  {id:'threshold',label:'Doors and thresholds',terms:['door','gate','threshold','entrance']},
];
export function observations(dreams) {
  return motifs.map(m=>({...m,evidence:dreams.flatMap(d=>{
    const sentences=d.text.match(/[^.!?]+[.!?]?/g)||[d.text];
    const sentence=sentences.find(s=>m.terms.some(t=>new RegExp(`\\b${t}\\b`,'i').test(s)));if(!sentence)return [];
    return [{dreamId:d.id,date:d.date,title:d.title,excerpt:sentence.trim(),rationale:'This dream explicitly mentions '+m.terms.filter(t=>new RegExp(`\\b${t}\\b`,'i').test(sentence)).join(', ')+'.'}];
  })})).filter(m=>m.evidence.length).sort((a,b)=>b.evidence.length-a.evidence.length || a.id.localeCompare(b.id));
}
export function evidenceReflection(dreams,period) {
  const selected=dreams.filter(d=>d.date>=period.start && d.date<=period.end),candidates=observations(selected),theme=candidates[0];
  if(!theme || theme.evidence.length<2)throw new Error('There is not enough recurring evidence for a collective reading. Add more dreams or choose a wider period.');
  const alternatives=candidates.filter(t=>t.id!==theme.id && t.evidence.length===theme.evidence.length).map(t=>t.label);
  return {mode:'evidence-reflection',engineVersion:'deterministic-evidence-v1',period,corpusVersion:corpusVersion(selected),analysedCount:selected.length,
    title:theme.label,themeId:theme.id,commonThread:`${theme.evidence.length} of ${selected.length} dreams explicitly include imagery of ${theme.terms.join(', ')}.`,
    message:'These images recur in your own words across the selected dreams. Read the excerpts alongside each other and consider what feels familiar, different or important to you. This observation does not establish a psychological meaning.',
    invitation:'What do these recurring images mean to you, and where do your own associations differ?',mantra:'I can explore my dreams in my own words.',
    uncertainty:alternatives.length?`Equally frequent imagery: ${alternatives.join('; ')}. No single overarching meaning has been established.`:'Frequency identifies recurring imagery; it does not establish the strongest psychological theme.',
    evidence:theme.evidence,artwork:null};
}
export function statistics(dreams) {
  const tags=new Map();for(const d of dreams)for(const t of new Set(d.tags||[]))tags.set(t,(tags.get(t)||0)+1);
  return {total:dreams.length,numinous:dreams.filter(d=>d.flags?.numinous).length,lucid:dreams.filter(d=>d.flags?.lucid).length,directMessage:dreams.filter(d=>d.flags?.directMessage).length,
    tags:[...tags].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name)),
    observations:observations(dreams).map(m=>({id:m.id,label:m.label,count:m.evidence.length,evidence:m.evidence}))};
}
