const FAMILY_HOME_SYMBOLS = [
  { id:'house', name:'House / Home', hearthlandsDreams:109, familyHomeDreams:2, zoom:'territory' },
  { id:'mum', name:'Mum', hearthlandsDreams:35, familyHomeDreams:2, zoom:'territory' },
  { id:'water', name:'Water', hearthlandsDreams:30, familyHomeDreams:1, zoom:'territory' },
  { id:'garden', name:'Garden', hearthlandsDreams:25, familyHomeDreams:1, zoom:'territory' },
  { id:'cat', name:'Cat', hearthlandsDreams:23, familyHomeDreams:1, zoom:'territory' },
  { id:'dog', name:'Dog', hearthlandsDreams:15, familyHomeDreams:1, zoom:'place' },
  { id:'window', name:'Window', hearthlandsDreams:12, familyHomeDreams:1, zoom:'place' },
  { id:'bed', name:'Bed', hearthlandsDreams:11, familyHomeDreams:1, zoom:'place' },
  { id:'light', name:'Light', hearthlandsDreams:7, familyHomeDreams:1, zoom:'place' },
  { id:'sea', name:'Sea', hearthlandsDreams:6, familyHomeDreams:1, zoom:'close' },
  { id:'fish', name:'Fish', hearthlandsDreams:3, familyHomeDreams:1, zoom:'close' },
  { id:'egg', name:'Egg', hearthlandsDreams:2, familyHomeDreams:1, zoom:'close' },
  { id:'octopus', name:'Octopus', hearthlandsDreams:1, familyHomeDreams:1, zoom:'close' },
];

const FAMILY_HOME_ZONE = {
  place:'Family Home',
  anchor:{x:29,y:25},
  radius:{x:15,y:16},
  evidenceRule:'Only symbols with a non-zero Family Home count in Hearthlands_v57_symbol_place_matrix.json may be placed in this zone.',
};

const FAMILY_HOME_LAYOUT = {
  house:{x:29,y:25},
  mum:{x:26.2,y:29.2},
  water:{x:36.5,y:36.5},
  garden:{x:23.8,y:31.8},
  cat:{x:31.2,y:21.8},
  dog:{x:24.6,y:26.7},
  window:{x:30.4,y:24.1},
  bed:{x:28.8,y:22.7},
  light:{x:27.2,y:25.4},
  sea:{x:39.6,y:40.2},
  fish:{x:38.1,y:38.8},
  egg:{x:25.1,y:33.9},
  octopus:{x:40.5,y:42.2},
};

export { FAMILY_HOME_SYMBOLS, FAMILY_HOME_ZONE, FAMILY_HOME_LAYOUT };
