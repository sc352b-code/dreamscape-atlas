// Shared deterministic observations. This module never claims to be an AI interpretation.
export const ENGINE_VERSION = 'evidence-study-1';
const daysInMonth = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const dateString = date => date.toISOString().slice(0, 10);
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [y, m, d] = value.split('-').map(Number);
  return y >= 1900 && y <= 2200 && m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m - 1);
}
export function periodBounds(type, anchor) {
  if (!validDate(anchor)) throw new Error('Choose a valid dream date.');
  const [year, month, day] = anchor.split('-').map(Number);
  let start, end;
  if (type === 'weekly') {
    start = new Date(Date.UTC(year, month - 1, day));
    start.setUTCDate(start.getUTCDate() - (start.getUTCDay() + 6) % 7);
    end = new Date(start); end.setUTCDate(end.getUTCDate() + 6);
  } else {
    const length = { monthly: 1, quarterly: 3, 'six-monthly': 6, yearly: 12 }[type];
    if (!length) throw new Error('Unknown period.');
    const first = Math.floor((month - 1) / length) * length;
    start = new Date(Date.UTC(year, first, 1)); end = new Date(Date.UTC(year, first + length, 0));
  }
  return { type, start: dateString(start), end: dateString(end) };
}
export function selectDreams(dreams, period) {
  return dreams.filter(d => d.kind !== 'waking' && validDate(d.date) && d.date >= period.start && d.date <= period.end).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
export function validateRecord(record, kind = 'dream') {
  if (!record || typeof record !== 'object' || !validDate(record.date)) throw new Error('Every record needs a valid date (YYYY-MM-DD).');
  const text = typeof record.text === 'string' ? record.text.trim() : '';
  if (!text || text.length > 100000) throw new Error('Each narrative must contain 1–100,000 characters.');
  const strings = value => Array.isArray(value) ? [...new Set(value.filter(v => typeof v === 'string').map(v => v.trim().slice(0, 80)).filter(Boolean))].slice(0, 100) : [];
  return { id: typeof record.id === 'string' && /^[\w-]{1,100}$/.test(record.id) ? record.id : crypto.randomUUID(), kind,
    date: record.date, title: String(record.title || text.split(/[.!?\n]/)[0]).slice(0, 160), text,
    originalText: typeof record.originalText === 'string' ? record.originalText : text,
    tags: strings(record.tags), emotion: strings(record.emotion),
    numinous: record.numinous === true, lucid: record.lucid === true, directMessage: record.directMessage === true,
    significant: record.significant === true, notes: String(record.notes || '').slice(0, 10000),
    revision: Number.isInteger(record.revision) ? record.revision : 1, updatedAt: record.updatedAt || new Date().toISOString() };
}
export function importDreams(input, existing = []) {
  const list = Array.isArray(input) ? input : input?.dreams;
  if (!Array.isArray(list) || !list.length || list.length > 5000) throw new Error('Import a JSON array or {dreams: [...]} with 1–5,000 dream records.');
  const records = list.map(record => validateRecord(record)); // Validate the whole batch before changing anything.
  const merged = [...existing]; let added = 0, skipped = 0;
  for (const record of records) {
    if (merged.some(d => d.id === record.id || (d.date === record.date && d.text === record.text))) { skipped++; continue; }
    merged.push(record); added++;
  }
  return { records: merged, added, skipped };
}
const THREADS = [
  { id: 'home', label: 'Home and belonging', title: 'Where belonging gathers', words: ['house', 'home', 'hearth', 'kitchen', 'cottage', 'belonging'], question: 'What makes a place feel like home to you?', mantra: 'I can listen to what belonging means to me.' },
  { id: 'journey', label: 'Journeys and crossings', title: 'Along the paths I travel', words: ['road', 'journey', 'bus', 'train', 'crossing', 'travel'], question: 'Which journey in these dreams feels closest to your life now?', mantra: 'I can be curious about the path ahead.' },
  { id: 'water', label: 'Water and its changing forms', title: 'At the edge of the water', words: ['water', 'river', 'sea', 'ocean', 'flood', 'lake'], question: 'How does your experience of water differ between these dreams?', mantra: 'I can notice what changes, without rushing to explain it.' },
  { id: 'choice', label: 'Choices and boundaries', title: 'Making room for my own way', words: ['choose', 'choice', 'boundary', 'boundaries', 'refuse', 'decision'], question: 'Where do these dreams leave space for your own choice?', mantra: 'I can take time to find my own response.' },
];
function excerpt(text, words) {
  const sentences = text.match(/[^.!?\n]+[.!?]?/g) || [text];
  return sentences.find(s => words.some(w => new RegExp(`\\b${w}\\b`, 'i').test(s)))?.trim() || null;
}
export async function corpusVersion(dreams) {
  const canonical = JSON.stringify([...dreams].sort((a, b) => a.id.localeCompare(b.id)).map(d => [d.id, d.date, d.text, d.tags, d.notes, d.revision]));
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export function observations(dreams) {
  const count = field => {
    const map = new Map();
    for (const dream of dreams) for (const word of new Set(dream[field] || [])) {
      if (!map.has(word)) map.set(word, []); map.get(word).push(dream.id);
    }
    return [...map].map(([label, ids]) => ({ label, ids, count: ids.length, percent: dreams.length ? Math.round(ids.length / dreams.length * 100) : 0 })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  };
  return { total: dreams.length, tags: count('tags'), emotions: count('emotion'), numinous: dreams.filter(d => d.numinous).length, lucid: dreams.filter(d => d.lucid).length, directMessage: dreams.filter(d => d.directMessage).length };
}
export async function createEvidenceStudy(dreams, period, associations = {}) {
  const selected = selectDreams(dreams, period);
  const candidates = THREADS.map(thread => ({ ...thread, evidence: selected.map(d => ({ dreamId: d.id, date: d.date, title: d.title, excerpt: excerpt(d.text, thread.words) })).filter(d => d.excerpt) })).sort((a, b) => b.evidence.length - a.evidence.length || a.id.localeCompare(b.id));
  const theme = candidates[0];
  if (!theme || theme.evidence.length < 2) return { status: 'insufficient', analysedCount: selected.length, reason: 'A shared thread needs at least two dreams with explicit supporting language. Add more dreams or choose a wider period. No reading has been invented.' };
  const tied = candidates.filter(c => c.evidence.length === theme.evidence.length).length > 1;
  const words = theme.words.filter(w => theme.evidence.some(e => new RegExp(`\\b${w}\\b`, 'i').test(e.excerpt)));
  return { id: crypto.randomUUID(), status: 'complete', mode: 'deterministic-evidence-study', period, version: await corpusVersion(dreams), analysedCount: selected.length,
    title: theme.title, thread: theme.label, threadId: theme.id, confidence: tied ? 'Several threads are equally supported.' : 'An explicit recurring image; its personal meaning remains open.',
    evidence: theme.evidence.map(e => ({ ...e, rationale: 'This original passage explicitly mentions imagery within the selected thread.' })),
    message: `Across ${theme.evidence.length} of the ${selected.length} dreams in this period, ${words.join(', ')} appear in the original narratives. These images provide a starting point for reflection, rather than a fixed explanation of your dreams. Read the passages alongside one another: what stays familiar, and what changes?`,
    invitation: theme.question, mantra: theme.mantra, personalAssociation: associations[theme.id] || '',
    artwork: '/assets/reference/illuminated-figure.png', artworkStatus: 'Existing reference illustration, not generated from these dreams.',
    generatedAt: new Date().toISOString(), engineVersion: ENGINE_VERSION };
}
export function validateEvidence(reading, dreams) {
  const ids = new Set();
  for (const item of reading.evidence || []) {
    const dream = dreams.find(d => d.id === item.dreamId && d.kind !== 'waking');
    if (!dream || ids.has(item.dreamId) || !dream.text.includes(item.excerpt) || dream.date < reading.period.start || dream.date > reading.period.end) throw new Error('Invalid source evidence.');
    ids.add(item.dreamId);
  }
  return true;
}
