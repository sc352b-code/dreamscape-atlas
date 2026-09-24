const HEARTHLANDS_SYMBOLS = [
  "Alex","Alice","Bag","Bed","Bench","Bicycle","Boat","Book","Box","Brother","Bus","Car","Carl Jung","Cat","Chair","Clock","Clothes","Computer","Cow","Dad","Dog","Door","Drink","Egg","Field","Fire","Fish","Food","Forest","Garden","George","Grandma","Grass","Gun","House / Home","Insect","Key","Knife","Lake","Light","Lily","Lion","Max","Mirror","Money","Mum","reference corpus","Ocean","Octopus","Percy","Phone","Plane","Rain","River","Sea","Sheep","Shirt","Shoe","Sister","Sky","Snake","Snow","Stephen Coarse","Storm","Sun","Table","Teddy","Toy","Train","Tree","Water","Wayne","Weight","Wind","Window","Woods"
];

const GROUPS = {
  people: new Set(["Alex","Alice","Brother","Carl Jung","Dad","George","Grandma","Lily","Max","Mum","reference corpus","Percy","Sister","Stephen Coarse","Wayne"]),
  domestic: new Set(["Bag","Bed","Bench","Book","Box","Chair","Clock","Clothes","Computer","Door","Drink","Egg","Food","House / Home","Key","Light","Mirror","Money","Phone","Shirt","Shoe","Table","Teddy","Toy","Weight","Window"]),
  transport: new Set(["Bicycle","Boat","Bus","Car","Plane","Train"]),
  animals: new Set(["Cat","Cow","Dog","Fish","Insect","Lion","Octopus","Sheep","Snake"]),
  landscape: new Set(["Field","Fire","Forest","Garden","Grass","Lake","Ocean","Rain","River","Sea","Sky","Snow","Storm","Sun","Tree","Water","Wind","Woods"]),
  objects: new Set(["Gun","Knife"]),
};

const PLACE_ANCHORS = {
  "Cambridge Road Childhood House": { x: 10, y: 58 },
  "Family Home": { x: 29, y: 25 },
  "Current / Present House": { x: 48, y: 58 },
  "The Large Many-Roomed House": { x: 67, y: 20 },
  "The Unfamiliar House": { x: 78, y: 59 },
  "The Haunted 17-Bedroom Mansion": { x: 87, y: 24 },
};

// Place intersections below are only used where the uploaded v57 place corpora
// directly establish the symbol in one or more source dreams. Everything else
// remains territory-evidenced and is deliberately not given a false place claim.
const PLACE_EVIDENCE = {
  "House / Home": ["Cambridge Road Childhood House","Family Home","Current / Present House","The Large Many-Roomed House","The Unfamiliar House","The Haunted 17-Bedroom Mansion"],
  "Garden": ["Cambridge Road Childhood House","Family Home","Current / Present House","The Large Many-Roomed House"],
  "Window": ["Family Home","The Large Many-Roomed House","The Unfamiliar House","The Haunted 17-Bedroom Mansion"],
  "Door": ["Current / Present House","The Large Many-Roomed House","The Unfamiliar House"],
  "Bed": ["Family Home","Current / Present House","The Large Many-Roomed House","The Unfamiliar House"],
  "Water": ["Family Home","Current / Present House","The Large Many-Roomed House","The Unfamiliar House"],
  "Octopus": ["Family Home"],
  "Egg": ["Family Home"],
  "Light": ["Family Home","The Haunted 17-Bedroom Mansion"],
  "Cat": ["Family Home","Cambridge Road Childhood House","Current / Present House","The Large Many-Roomed House"],
  "Dog": ["Family Home","Current / Present House","The Large Many-Roomed House"],
  "Percy": ["Cambridge Road Childhood House","Current / Present House","The Large Many-Roomed House"],
  "Lion": ["Cambridge Road Childhood House"],
  "Mum": ["Cambridge Road Childhood House","Family Home","Current / Present House","The Unfamiliar House"],
  "Dad": ["Cambridge Road Childhood House","The Unfamiliar House"],
  "Brother": ["Cambridge Road Childhood House","Current / Present House","The Unfamiliar House"],
  "Sister": ["Cambridge Road Childhood House","Current / Present House","The Unfamiliar House"],
  "Alex": ["Current / Present House","The Large Many-Roomed House","The Unfamiliar House"],
  "reference corpus": ["Current / Present House","The Large Many-Roomed House","The Unfamiliar House"],
  "Food": ["Cambridge Road Childhood House","Current / Present House","The Large Many-Roomed House","The Unfamiliar House"],
  "Fish": ["Family Home","Current / Present House"],
  "Insect": ["Current / Present House","The Large Many-Roomed House","The Unfamiliar House"],
  "Tree": ["Cambridge Road Childhood House","Current / Present House"],
  "Snow": ["Current / Present House"],
  "Shirt": ["Current / Present House"],
  "Teddy": ["Current / Present House"],
  "Toy": ["Current / Present House","The Unfamiliar House"],
  "Phone": ["Current / Present House","The Unfamiliar House"],
  "Computer": ["Current / Present House"],
  "Clock": ["Current / Present House"],
  "Box": ["Current / Present House"],
  "Bag": ["Current / Present House"],
  "Weight": ["Current / Present House"],
  "Wayne": ["Current / Present House"],
  "Car": ["Current / Present House","The Large Many-Roomed House"],
  "Book": ["The Large Many-Roomed House"],
  "Sun": ["The Large Many-Roomed House"],
  "Fire": ["Current / Present House"],
};

const SOURCE_READINGS = {
  "House / Home": {
    subtitle: "The many-roomed architecture of belonging",
    summary: "Known homes, unfamiliar houses and impossible mansions hold family, privacy, memory, danger and discovery.",
    associations: "family · rooms · garden · doors · belonging",
  },
  "reference corpus": {
    subtitle: "Recurring dream figure",
    summary: "A recurrent living presence whose authoritative source-dream corpus intersects Hearthlands as well as other territories. Interpretation is kept separate from the evidence.",
    associations: "relationship · family · home · journey · intimacy",
  },
  "Octopus": {
    subtitle: "A rescued life learning to thrive",
    summary: "In a Family Home source dream, a vulnerable sea creature is brought inside, placed in water and nurtured until it grows into a thriving octopus that fills much of the bedroom.",
    associations: "care · water · bedroom · growth · thriving",
  },
  "Egg": {
    subtitle: "A small life becoming unexpectedly powerful",
    summary: "In a Family Home source dream, a dying creature is cared for until it transforms into an egg-like being that can fly, light up and make unusual sounds.",
    associations: "care · transformation · light · recovery · potential",
  },
  "Percy": {
    subtitle: "A recurring presence of care and protection",
    summary: "Across Hearthlands house dreams, Percy repeatedly appears inside questions of safety, home, bodily vulnerability, protection and belonging.",
    associations: "cat · home · care · safety · family",
  },
  "Window": {
    subtitle: "A boundary between rooms, worlds and presences",
    summary: "Windows recur across Hearthlands houses: inward-facing windows in the Family Home, threatened windows in unfamiliar houses, and a window reopened by the ghost in the rare haunted mansion.",
    associations: "inside/outside · threshold · light · watching · intrusion",
  },
  "Water": {
    subtitle: "Water entering and reshaping domestic space",
    summary: "Water repeatedly moves through Hearthlands homes as nurture, plumbing, flooding, cleaning, containment and living presence.",
    associations: "care · flood · plumbing · containment · change",
  },
};

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rand(name, salt = 0) { const x = Math.sin((hash(name) + salt) * 12.9898) * 43758.5453; return x - Math.floor(x); }
function groupFor(name) { return Object.entries(GROUPS).find(([, set]) => set.has(name))?.[0] || "domestic"; }

const TERRITORY_ZONES = {
  people: [[14,34,27,78],[35,31,56,80],[58,31,74,78],[73,35,90,78]],
  domestic: [[8,38,29,78],[30,34,50,79],[51,31,72,76],[72,36,91,78]],
  transport: [[8,68,36,86],[32,67,67,86],[60,63,92,84],[50,9,88,29]],
  animals: [[6,51,29,86],[29,48,53,84],[53,46,79,84],[71,44,93,79]],
  landscape: [[5,16,31,49],[21,53,47,89],[43,49,70,89],[62,12,95,55]],
  objects: [[18,46,47,80],[55,42,84,78]],
};

function positionFor(name, index) {
  const evidenced = PLACE_EVIDENCE[name];
  if (evidenced?.length) {
    const place = evidenced[hash(name) % evidenced.length];
    const a = PLACE_ANCHORS[place];
    const spread = place === "The Haunted 17-Bedroom Mansion" ? 4.2 : 6.8;
    return {
      x: Math.max(4, Math.min(96, a.x + (rand(name, 17) - .5) * spread * 2)),
      y: Math.max(8, Math.min(90, a.y + (rand(name, 43) - .5) * spread * 1.5)),
      group: groupFor(name),
      place,
      evidence: "place",
    };
  }
  const group = groupFor(name);
  const zones = TERRITORY_ZONES[group];
  const z = zones[index % zones.length];
  return {
    x: z[0] + rand(name, 17) * (z[2] - z[0]),
    y: z[1] + rand(name, 43) * (z[3] - z[1]),
    group,
    place: null,
    evidence: "territory",
  };
}

function svg(path, extra = "") {
  return `<svg viewBox="0 0 36 36" aria-hidden="true" ${extra}><path d="${path}"/></svg>`;
}

function paintedArt(name, group) {
  const specific = {
    "House / Home": '<svg viewBox="0 0 36 36"><path d="M5 17L18 6l13 11v14H5z"/><path d="M14 31V21h8v10M10 17h5M22 17h5"/></svg>',
    "Window": '<svg viewBox="0 0 36 36"><rect x="8" y="6" width="20" height="24" rx="2"/><path d="M18 6v24M8 18h20"/></svg>',
    "Door": '<svg viewBox="0 0 36 36"><path d="M10 31V7h16v24M14 31V11h9v20"/><circle cx="20" cy="21" r="1"/></svg>',
    "Tree": '<svg viewBox="0 0 36 36"><path d="M18 31V20M12 31h12M18 20c-8 1-10-7-5-10-1-5 8-8 11-3 7 0 8 9 2 12-2 2-5 2-8 1z"/></svg>',
    "Water": '<svg viewBox="0 0 36 36"><path d="M4 14c5-4 9 4 14 0s9 4 14 0M4 21c5-4 9 4 14 0s9 4 14 0M4 28c5-4 9 4 14 0s9 4 14 0"/></svg>',
    "River": '<svg viewBox="0 0 36 36"><path d="M15 2c8 8-4 11 5 18s-1 10 1 14"/><path d="M21 2c7 7-2 11 5 17s0 11 2 15"/></svg>',
    "Lake": '<svg viewBox="0 0 36 36"><ellipse cx="18" cy="22" rx="13" ry="7"/><path d="M7 22c4-3 7 3 11 0s7 3 11 0"/></svg>',
    "Ocean": '<svg viewBox="0 0 36 36"><path d="M3 15c5-5 10 5 15 0s10 5 15 0M3 23c5-5 10 5 15 0s10 5 15 0"/></svg>',
    "Sea": '<svg viewBox="0 0 36 36"><path d="M3 16c5-5 10 5 15 0s10 5 15 0M3 24c5-5 10 5 15 0s10 5 15 0"/></svg>',
    "Sun": '<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="6"/><path d="M18 2v7M18 27v7M2 18h7M27 18h7M6.7 6.7l5 5M24.3 24.3l5 5M29.3 6.7l-5 5M11.7 24.3l-5 5"/></svg>',
    "Fire": '<svg viewBox="0 0 36 36"><path d="M19 3c3 7-2 9 2 13 2-3 5-4 6-7 4 8 2 20-8 23C9 30 7 22 11 16c2-3 4-5 4-9 2 2 3 4 4 6"/></svg>',
    "Cat": '<svg viewBox="0 0 36 36"><path d="M10 13l2-7 6 5 6-5 2 7c4 3 5 10 2 15-4 5-16 5-20 0-3-5-2-12 2-15z"/><path d="M13 20h1M22 20h1M15 25c2 2 4 2 6 0"/></svg>',
    "Dog": '<svg viewBox="0 0 36 36"><path d="M10 12L5 8l2 9c-1 8 4 14 11 14s12-6 11-14l2-9-6 4c-4-3-11-3-15 0z"/><path d="M13 20h1M22 20h1M16 25c1 2 3 2 5 0"/></svg>',
    "Fish": '<svg viewBox="0 0 36 36"><path d="M6 18c7-8 16-8 23 0-7 8-16 8-23 0zM29 18l5-6v12z"/><circle cx="12" cy="16" r="1"/></svg>',
    "Octopus": '<svg viewBox="0 0 36 36"><path d="M11 20c-1-11 15-11 14 0"/><path d="M12 20c-6 7 1 9 4 3-2 8 6 8 5 0 1 8 9 6 4-2 6 5 9-3 2-7"/><circle cx="15" cy="16" r="1"/><circle cx="21" cy="16" r="1"/></svg>',
    "Egg": '<svg viewBox="0 0 36 36"><path d="M18 4c-7 0-11 12-11 19 0 6 5 9 11 9s11-3 11-9C29 16 25 4 18 4z"/></svg>',
    "Book": '<svg viewBox="0 0 36 36"><path d="M5 8c6-2 10-1 13 3v19c-3-4-7-5-13-3zM31 8c-6-2-10-1-13 3v19c3-4 7-5 13-3z"/></svg>',
    "Key": '<svg viewBox="0 0 36 36"><circle cx="12" cy="13" r="6"/><path d="M16 17l15 15M23 24l3-3M27 28l3-3"/></svg>',
    "Bed": '<svg viewBox="0 0 36 36"><path d="M5 28V12M31 28V18H8v10M8 18v-7h9c5 0 7 2 7 7"/></svg>',
    "Chair": '<svg viewBox="0 0 36 36"><path d="M10 6v14h16V9M10 20v11M26 20v11M8 20h20"/></svg>',
    "Table": '<svg viewBox="0 0 36 36"><path d="M5 15h26M9 15v16M27 15v16M4 12h28v3H4z"/></svg>',
    "Boat": '<svg viewBox="0 0 36 36"><path d="M5 23h26c-3 7-7 9-13 9S8 30 5 23zM18 6v17M18 7l9 10h-9"/></svg>',
    "Car": '<svg viewBox="0 0 36 36"><path d="M6 23l3-9h18l3 9v6H6zM11 14l3-6h9l4 6"/><circle cx="11" cy="29" r="3"/><circle cx="25" cy="29" r="3"/></svg>',
    "Train": '<svg viewBox="0 0 36 36"><rect x="8" y="5" width="20" height="23" rx="5"/><path d="M11 12h14M13 28l-4 5M23 28l4 5"/><circle cx="13" cy="23" r="1"/><circle cx="23" cy="23" r="1"/></svg>',
    "Bicycle": '<svg viewBox="0 0 36 36"><circle cx="9" cy="26" r="6"/><circle cx="27" cy="26" r="6"/><path d="M9 26l7-12 5 12H9l5-8h10M14 14h6M22 11l5 15"/></svg>',
    "Plane": '<svg viewBox="0 0 36 36"><path d="M3 20l13-5V5l4-2 2 11 10-4 2 2-10 7 5 8-3 2-8-7-10 3z"/></svg>',
    "Storm": '<svg viewBox="0 0 36 36"><path d="M7 17c0-5 4-8 8-7 3-6 13-4 13 3 4 0 6 3 5 7H9c-2 0-3-1-2-3zM20 21l-5 8h5l-2 5 8-10h-5l2-3"/></svg>',
    "Rain": '<svg viewBox="0 0 36 36"><path d="M8 15c0-5 4-8 8-7 3-6 12-4 12 3 4 0 6 3 5 7H10c-2 0-3-1-2-3zM12 23l-2 6M19 23l-2 7M26 23l-2 6"/></svg>',
    "Snow": '<svg viewBox="0 0 36 36"><path d="M18 3v30M5 10l26 16M5 26l26-16M12 6l6 5 6-5M12 30l6-5 6 5"/></svg>',
    "Mirror": '<svg viewBox="0 0 36 36"><ellipse cx="18" cy="16" rx="10" ry="13"/><path d="M18 29v5M12 34h12"/></svg>',
    "Phone": '<svg viewBox="0 0 36 36"><rect x="10" y="4" width="16" height="28" rx="3"/><path d="M15 8h6M16 28h4"/></svg>',
    "Computer": '<svg viewBox="0 0 36 36"><rect x="5" y="6" width="26" height="18" rx="2"/><path d="M18 24v6M12 31h12"/></svg>',
    "Clock": '<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="13"/><path d="M18 9v10l7 4"/></svg>',
    "Bag": '<svg viewBox="0 0 36 36"><path d="M8 12h20l2 19H6zM13 12c0-8 10-8 10 0"/></svg>',
    "Box": '<svg viewBox="0 0 36 36"><path d="M6 10l12-5 12 5-12 5zM6 10v17l12 5 12-5V10M18 15v17"/></svg>',
    "Teddy": '<svg viewBox="0 0 36 36"><circle cx="18" cy="15" r="8"/><circle cx="10" cy="9" r="4"/><circle cx="26" cy="9" r="4"/><path d="M12 22c-5 3-5 9-1 11M24 22c5 3 5 9 1 11M15 18h6"/></svg>',
  };
  if (specific[name]) return specific[name];
  if (GROUPS.people.has(name)) return '<svg viewBox="0 0 36 36"><circle cx="18" cy="10" r="5"/><path d="M18 15v13M10 32l8-10 8 10M11 20h14"/></svg>';
  if (group === "animals") return '<svg viewBox="0 0 36 36"><path d="M8 24c4-9 16-9 20 0M11 24v7M25 24v7M13 14l-4-5M23 14l4-5"/></svg>';
  if (group === "landscape") return '<svg viewBox="0 0 36 36"><path d="M3 28c7-12 12-6 16-13 5 9 9 5 14 13M4 31h28"/></svg>';
  if (group === "transport") return '<svg viewBox="0 0 36 36"><path d="M5 24h26M10 24l4-10h9l4 10M12 29h1M24 29h1"/></svg>';
  if (group === "objects") return '<svg viewBox="0 0 36 36"><path d="M9 28L27 8M13 7l16 16"/></svg>';
  return '<svg viewBox="0 0 36 36"><path d="M7 27V9h22v18zM11 14h14M11 19h14M11 24h9"/></svg>';
}

function readingFor(name, place) {
  const source = SOURCE_READINGS[name];
  const where = PLACE_EVIDENCE[name]?.length ? PLACE_EVIDENCE[name] : [];
  return {
    subtitle: source?.subtitle || "Corpus-evidenced Hearthlands symbol",
    summary: source?.summary || `${name} is one of the 76 v57 symbols whose authoritative source-dream corpus intersects The Hearthlands. This view keeps evidence separate from interpretation.`,
    associations: source?.associations || "source dreams · Hearthlands · recurring imagery",
    where,
    place,
  };
}

function waitForAtlas() {
  const world = document.querySelector('.flatmap-world');
  const root = document.querySelector('.atlas');
  if (!world || !root) { requestAnimationFrame(waitForAtlas); return; }

  document.querySelectorAll('.focus-meta span').forEach((el) => {
    if (/symbol/i.test(el.textContent || '')) el.innerHTML = '<b>76</b> evidenced symbols';
  });

  const old = world.querySelector('.corpus-symbol-layer');
  if (old) old.remove();
  world.querySelector('.symbol-peek')?.remove();
  document.querySelector('.symbol-reading-drawer')?.remove();

  const layer = document.createElement('div');
  layer.className = 'corpus-symbol-layer painterly-symbol-layer';
  layer.setAttribute('aria-label', '76 corpus-evidenced Hearthlands symbols');

  HEARTHLANDS_SYMBOLS.forEach((name, index) => {
    const p = positionFor(name, index);
    const b = document.createElement('button');
    b.className = `corpus-symbol painted-symbol corpus-symbol--${p.group}`;
    b.style.left = `${p.x.toFixed(2)}%`;
    b.style.top = `${p.y.toFixed(2)}%`;
    b.style.setProperty('--tilt', `${(-9 + rand(name, 91) * 18).toFixed(1)}deg`);
    b.style.setProperty('--scale', `${(0.72 + rand(name, 71) * 0.5).toFixed(2)}`);
    b.dataset.symbol = name;
    b.dataset.evidence = p.evidence;
    if (p.place) b.dataset.placeEvidence = p.place;
    b.setAttribute('aria-label', `${name}${p.place ? `, evidenced at ${p.place}` : ', evidenced in The Hearthlands'}`);
    b.innerHTML = `<span class="painted-symbol-art" aria-hidden="true">${paintedArt(name, p.group)}</span><span class="symbol-hit" aria-hidden="true"></span>`;
    layer.appendChild(b);
  });
  world.appendChild(layer);

  const peek = document.createElement('aside');
  peek.className = 'symbol-peek';
  peek.innerHTML = '<small>HEARTHLANDS SYMBOL</small><b></b><span></span>';
  world.appendChild(peek);

  const drawer = document.createElement('aside');
  drawer.className = 'symbol-reading-drawer';
  drawer.setAttribute('aria-live', 'polite');
  drawer.innerHTML = `
    <button class="symbol-reading-close" aria-label="Close symbol reading">×</button>
    <div class="symbol-card-mini"><div class="symbol-card-mark"></div><small>THE HEARTHLANDS</small><strong></strong></div>
    <p class="symbol-kicker">DREAMSCAPE SYMBOL READING</p>
    <h2></h2>
    <p class="symbol-subtitle"></p>
    <div class="symbol-reading-tabs" role="tablist">
      <button class="active" data-tab="overview">Overview</button>
      <button data-tab="where">Where it appears</button>
      <button data-tab="source">Evidence</button>
      <button data-tab="meanings">Possible meanings</button>
    </div>
    <div class="symbol-reading-body"></div>`;
  document.body.appendChild(drawer);

  let active = null;
  let currentReading = null;
  let currentName = null;

  function renderTab(tab) {
    if (!currentReading || !currentName) return;
    const body = drawer.querySelector('.symbol-reading-body');
    if (tab === 'overview') {
      body.innerHTML = `<p>${currentReading.summary}</p><p class="symbol-associations"><span>Associations</span>${currentReading.associations}</p>`;
    } else if (tab === 'where') {
      body.innerHTML = currentReading.where.length
        ? `<p>This symbol has directly established source-dream intersections with:</p><ul>${currentReading.where.map((place) => `<li>${place}</li>`).join('')}</ul><p class="evidence-note">The on-map placement is clustered around one of these source-backed places.</p>`
        : `<p>This symbol is evidenced in The Hearthlands at territory level in v57. This build does not assign it to a specific house without a directly established place-corpus intersection.</p>`;
    } else if (tab === 'source') {
      body.innerHTML = `<p>v57 determines Hearthlands membership from the symbol's deduplicated source dreams and their territory tags, not from its headline territory label.</p><p class="evidence-note">Rare one-off appearances are retained rather than discarded. Place claims are only made when a symbol source dream intersects the exact dream corpus behind that mapped place.</p>`;
    } else {
      body.innerHTML = `<p>Possible meanings remain deliberately separate from evidence. This live layer does not invent an interpretation where the full v57 interpretive record has not yet been imported.</p><p class="evidence-note">The visual discovery and evidence connection are live now; deeper dreamer-association and interpretive text can be connected without changing the map logic.</p>`;
    }
  }

  function openReading(button) {
    currentName = button.dataset.symbol;
    currentReading = readingFor(currentName, button.dataset.placeEvidence || null);
    drawer.querySelector('h2').textContent = currentName;
    drawer.querySelector('.symbol-card-mini strong').textContent = currentName;
    drawer.querySelector('.symbol-subtitle').textContent = currentReading.subtitle;
    drawer.querySelector('.symbol-card-mark').innerHTML = paintedArt(currentName, groupFor(currentName));
    drawer.querySelectorAll('.symbol-reading-tabs button').forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === 'overview'));
    renderTab('overview');
    drawer.classList.add('open');
    button.classList.add('found');
  }

  function showPeek(button, event) {
    active?.classList.remove('found');
    active = button;
    const name = button.dataset.symbol;
    const place = button.dataset.placeEvidence;
    peek.querySelector('b').textContent = name;
    peek.querySelector('span').textContent = place ? `Source-dream evidence at ${place} · click for reading` : 'Hearthlands source-dream evidence · click for reading';
    const rect = world.getBoundingClientRect();
    const br = button.getBoundingClientRect();
    const x = (event?.clientX ?? br.left + br.width / 2) - rect.left;
    const y = (event?.clientY ?? br.top + br.height / 2) - rect.top;
    peek.style.left = `${Math.max(14, Math.min(rect.width - 240, x + 18))}px`;
    peek.style.top = `${Math.max(72, Math.min(rect.height - 130, y - 34))}px`;
    peek.classList.add('visible');
    button.classList.add('found');
  }

  function hidePeek() {
    peek.classList.remove('visible');
    if (!drawer.classList.contains('open')) active?.classList.remove('found');
  }

  layer.addEventListener('pointerover', (e) => { const b = e.target.closest('.corpus-symbol'); if (b) showPeek(b, e); });
  layer.addEventListener('pointerout', (e) => { if (e.target.closest('.corpus-symbol')) hidePeek(); });
  layer.addEventListener('click', (e) => {
    const b = e.target.closest('.corpus-symbol');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    showPeek(b, e); openReading(b);
  });
  drawer.querySelector('.symbol-reading-close').addEventListener('click', () => {
    drawer.classList.remove('open');
    active?.classList.remove('found');
  });
  drawer.querySelectorAll('.symbol-reading-tabs button').forEach((tab) => tab.addEventListener('click', () => {
    drawer.querySelectorAll('.symbol-reading-tabs button').forEach((b) => b.classList.toggle('active', b === tab));
    renderTab(tab.dataset.tab);
  }));
  document.querySelector('.return-world')?.addEventListener('click', () => drawer.classList.remove('open'));
}

waitForAtlas();
export { HEARTHLANDS_SYMBOLS, PLACE_EVIDENCE };
