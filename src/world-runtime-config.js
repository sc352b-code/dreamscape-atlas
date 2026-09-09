// Dreamscape World Engine v1 runtime adapter.
// Public-safe scene data only. Raw corpus material never belongs in this module.
export const WORLD_META={
  worldId:'natalie-dreamscape',
  title:'Dreamscape Atlas',
  engineVersion:'1.0.0',
  manifest:'/worlds/natalie/world-manifest.json',
  totalDreams:362,
  territoryDreams:{hearthlands:213,roadlands:null,littoral:null,institutional:null,river:null},
  source:'v57 handover snapshot',
};

export const WORLDS=[
  {id:'littoral',name:'Littoral Coast',cue:'Shorelines · tides · thresholds',texture:'/assets/territory-planets/littoral-final.png',position:[-2.55,1.18,-.42],radius:.50,spin:.105,tilt:-.13,tint:0xbbeeff,offset:.20,dreams:WORLD_META.territoryDreams.littoral,flatMapStatus:'not_started'},
  {id:'roadlands',name:'The Roadlands',cue:'Journeys · crossings · movement',texture:'/assets/territory-planets/roadlands-final.png',position:[2.40,.82,-.72],radius:.52,spin:.076,tilt:.16,tint:0xffd19b,offset:.10,dreams:WORLD_META.territoryDreams.roadlands,flatMapStatus:'not_started'},
  {id:'hearthlands',name:'The Hearthlands',cue:'Home · gardens · belonging',texture:'/assets/territory-planets/hearthlands-final.png',live:true,position:[-.12,-.02,.16],radius:.60,spin:.088,tilt:-.08,tint:0xffebc2,offset:.02,hearth:true,dreams:WORLD_META.territoryDreams.hearthlands,flatMapStatus:'pilot'},
  {id:'institutional',name:'Institutional Quarter',cue:'Structure · order · public life',texture:'/assets/territory-planets/institutional-final.png',position:[-1.68,-1.48,-.82],radius:.47,spin:.061,tilt:.11,tint:0xdbe1ff,offset:.08,dreams:WORLD_META.territoryDreams.institutional,flatMapStatus:'not_started'},
  {id:'river',name:'River Country',cue:'Waterways · bridges · flow',texture:'/assets/territory-planets/river-final.png',position:[2.06,-1.38,-.50],radius:.52,spin:.112,tilt:-.18,tint:0xbcebdc,offset:.16,dreams:WORLD_META.territoryDreams.river,flatMapStatus:'not_started'},
];

export const MOBILE_POSITIONS={
  littoral:[-.68,.88,-.45],roadlands:[.66,.69,-.56],hearthlands:[-.04,.08,.02],institutional:[-.62,-.60,-.58],river:[.62,-.86,-.44],
};
