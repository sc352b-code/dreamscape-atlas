const STOP = new Set(["the", "and", "with", "toward", "into", "there", "from", "that", "this", "beneath", "although", "without", "seem"]);

export function hashString(input) {
  let h = 2166136261;
  for (const ch of input) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function normalize(token) {
  return token.toLowerCase().replace(/[^a-z0-9'-]/g, "");
}

export function extractMotifs(corpus) {
  const counts = new Map();
  const evidence = new Map();

  for (const dream of corpus.dreams) {
    const explicit = dream.tags ?? [];
    const textTokens = dream.text.split(/\s+/).map(normalize).filter(t => t.length > 3 && !STOP.has(t));
    const unique = new Set([...explicit.map(normalize), ...textTokens]);
    for (const token of unique) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
      if (!evidence.has(token)) evidence.set(token, []);
      evidence.get(token).push(dream.id);
    }
  }

  return [...counts.entries()]
    .map(([name, recurrence]) => ({ name, recurrence, evidence: evidence.get(name) }))
    .sort((a, b) => b.recurrence - a.recurrence || a.name.localeCompare(b.name));
}

export function buildWorld(corpus) {
  const motifs = extractMotifs(corpus);
  const seed = hashString(corpus.corpusId);
  const domestic = new Set(["home", "house", "hearth", "kitchen", "cottage", "bread", "fire", "amber", "belonging", "safety"]);
  const hearthScore = motifs.filter(m => domestic.has(m.name)).reduce((s, m) => s + m.recurrence, 0);
  const symbolMotifs = motifs.filter(m => !domestic.has(m.name)).slice(0, 6);

  return {
    id: `world-${corpus.corpusId}`,
    title: "A World Made From Your Dreams",
    seed,
    territories: [
      {
        id: "territory-hearth-01",
        archetype: "hearth",
        name: "Hearthlands",
        subtitle: "Where belonging, memory and inner warmth gather",
        strength: Math.min(1, 0.35 + hearthScore / 20),
        palette: { "core": "#d78b5a", "glow": "#ffc98f", "shadow": "#291836", "mist": "#9b6b8f" },
        atmosphere: { "mist": 0.58, "embers": 0.42, "stars": 0.55 },
        terrain: "rolling-hills",
        motionPreset: "warm-breathing",
        evidence: motifs.filter(m => domestic.has(m.name)).flatMap(m => m.evidence).filter((v, i, a) => a.indexOf(v) === i),
        places: [
          {
            id: "place-house-01",
            name: "The Amber House",
            kind: "dwelling",
            significance: 0.91,
            evidence: ["d1", "d2", "d3"]
          }
        ],
        symbols: symbolMotifs.map((m, i) => ({
          id: `symbol-${m.name}-${i + 1}`,
          name: m.name[0].toUpperCase() + m.name.slice(1),
          recurrence: m.recurrence,
          significance: Math.min(1, 0.35 + m.recurrence * 0.18),
          evidence: m.evidence
        }))
      }
    ],
    links: [],
    provenance: {
      corpusId: corpus.corpusId,
      engineVersion: "0.1.0",
      generatedAt: new Date().toISOString()
    }
  };
}
