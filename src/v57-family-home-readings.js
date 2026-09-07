const V57_TAROT_REMOTE_ROOT='https://dreamscape-dream-planet.sc352b.chatgpt.site';
const V57_TAROT_LOCAL_ROOT='/assets/symbol-tarot';

const COMPLETE_SYMBOL_EXTRACT={
  house:{id:'house',name:'House / Home',art:'house-symbol-tarot.webp',subtitle:'The many-roomed architecture of belonging',summary:'Known homes, unfamiliar houses and impossible mansions hold family, privacy, memory, danger and discovery.',source:'completeSymbolData.ts'},
  mum:{id:'mum',name:'Mum',art:'mum-symbol-tarot.webp',source:'completeSymbolData.ts'},
  water:{id:'water',name:'Water',art:'water-symbol-tarot.webp',source:'completeSymbolData.ts'},
  garden:{id:'garden',name:'Garden',art:'garden-symbol-tarot.webp',source:'completeSymbolData.ts'},
  cat:{id:'cat',name:'Cat',art:'cat-symbol-tarot.webp',source:'completeSymbolData.ts'},
  dog:{id:'dog',name:'Dog',art:'dog-symbol-tarot.webp',source:'completeSymbolData.ts'},
  window:{id:'window',name:'Window',art:'window-symbol-tarot.webp',source:'completeSymbolData.ts'},
  bed:{id:'bed',name:'Bed',art:'bed-symbol-tarot.webp',source:'completeSymbolData.ts'},
  light:{id:'light',name:'Light',art:'light-symbol-tarot.webp',source:'completeSymbolData.ts'},
  sea:{id:'sea',name:'Sea',art:'sea-symbol-tarot.webp',source:'completeSymbolData.ts'},
  fish:{id:'fish',name:'Fish',art:'fish-symbol-tarot.webp',source:'completeSymbolData.ts'},
  egg:{id:'egg',name:'Egg',art:'egg-symbol-tarot.webp',source:'completeSymbolData.ts'},
  octopus:{id:'octopus',name:'Octopus',art:'octopus-symbol-tarot.webp',source:'completeSymbolData.ts'},
};

const INTERPRETIVE_PROFILES={
  house:{
    methodNote:'House / Home is treated as a compound constellation across 114 dreams. Known homes, unfamiliar houses and impossible interiors are compared rather than assumed to carry the same meaning.',
    synthesis:'The house is the corpus\'s most sustained architecture of belonging. It holds family, care and memory, but its boundaries are repeatedly negotiated and its interiors exceed any stable floor plan. A Jungian psyche or Self reading is strongest where rooms multiply, hidden areas emerge or the whole building changes character; literal homes, family history and present domestic life remain equally important.',
    constellations:[
      {name:'Belonging made architectural',confidence:'HIGH',evidence:'Family, partners, children, animals, food and care repeatedly organise themselves through kitchens, bedrooms, gardens and shared interiors.',possibility:'The house may externalise the question “who and what belongs here?” so that relationship becomes visible as arrangement, access and use of space.',counterpoint:'Many domestic scenes are direct continuations of ordinary home life rather than symbolic constructions.',dreamIds:['New dream 87','Generational Connections and Exclusions','New dream 410','Clear Path to Love']},
      {name:'Porous boundaries and intrusion',confidence:'HIGH',evidence:'Uninvited people, volatile inhabitants, hostile forces and displaced possessions repeatedly disturb domestic space.',possibility:'The house may stage the work of establishing psychological and relational boundaries: who may enter, occupy, alter or command the inner world.',counterpoint:'Conflict sometimes belongs primarily to the people in the house, not to the building itself.',dreamIds:['New dream 75','New dream 87','Chaos at the Gate','New dream 445']},
      {name:'More rooms than consciousness expects',confidence:'MEDIUM-HIGH',evidence:'Large, unfamiliar and higgledy-piggledy houses disclose extra rooms, levels, corridors and concealed life.',possibility:'Expanding architecture may image unrealised capacities, memories or complexes becoming available for exploration.',counterpoint:'Dreams naturally distort spatial memory; architectural impossibility alone does not establish psychic growth.',dreamIds:['New dream 65','Small Spaces, Big Comfort','Passage of Haunted Favor','Haunted Mansion Roomies']},
      {name:'Repair and reorganisation',confidence:'MEDIUM',evidence:'Moving, cleaning, rebuilding, feeding and rearranging recur as active responses to domestic disorder.',possibility:'The house can become a working model of psychic organisation: not a finished Self, but a habitat continually maintained and renegotiated.',counterpoint:'The chronological direction is uneven; repaired spaces coexist with renewed disorder and threat.',dreamIds:['New dream 116','Parcel of Patience','Taming Chaos with Comfort Food','Percy\'s Talking Tidying Adventure']}
    ],
    jungian:[
      {name:'Psyche / personality',copy:'Jungian amplification often treats the house as an image of psychic structure. Different levels and rooms may suggest differentiated areas of experience, but this must be tested against each dream.'},
      {name:'Self and totality',copy:'Impossible scale or a building that behaves as a whole may intimate a psychic totality larger than the conscious ego. The haunted and many-roomed houses are stronger candidates than ordinary kitchens.'},
      {name:'Family complex and inheritance',copy:'Older homes, relatives and recurring domestic tensions may constellate inherited relational patterns rather than an abstract universal house.'}
    ],
    alternatives:[
      {name:'Attachment and safe haven',copy:'Homes organise safety, proximity, caregiving and the threat of intrusion in concrete relational terms.'},
      {name:'Autobiographical memory',copy:'Childhood and present houses can combine episodic memories without functioning as disguised symbols.'},
      {name:'Environmental / narrative',copy:'Dream architecture gives conflicts a stage: rooms control visibility, privacy, escape and encounters between characters.'}
    ],
    boundary:'“The house is the psyche” is a useful amplification, not a translation key. It becomes persuasive only when the building\'s structure, inhabitants and changes support it.',
    reflection:'Which house feels most yours—and what is happening to belonging there: shelter, crowding, discovery, inheritance, intrusion, repair or expansion?',
    personalMeaning:'House and home may represent the architecture through which you experience belonging: the psychic and relational space that must hold family, memory, privacy and emerging possibilities at once. The multiplying rooms suggest that this inner world exceeds what is presently known, while intrusion and repair dreams show that belonging remains something actively defended, reorganised and made habitable.'
  },
  water:{
    methodNote:'The analysis distinguishes forms of water—sea, river, rain, flood, current and immersion—and compares what Sam is able to do in relation to them across all 59 water dreams.',
    synthesis:'Water is not one thing in this corpus. It is a medium of crossing, play and renewed embodiment, but also a force that exceeds control and makes rescue necessary. A Jungian association with unconscious depth is plausible because immersion repeatedly changes the dream\'s emotional and spatial conditions; yet responsibility, transition and the difference between yielding and being overwhelmed are equally central.',
    constellations:[
      {name:'Crossing between worlds',confidence:'HIGH',evidence:'Shores, rivers, boats, islands and journeys repeatedly make water the material boundary between a present position and another possible world.',possibility:'Water may mark transitions that cannot be completed from dry land: emotional or relational change requiring exposure to uncertainty.',counterpoint:'Not every shoreline is a psychological threshold; some are remembered or desired landscapes.',dreamIds:['New dream 13','Perilous Waters, Sinking Hope','River Crossing Dilemma','Rivers of Escape and Renewal']},
      {name:'Overwhelm and contested control',confidence:'MEDIUM-HIGH',evidence:'Floods, currents, storms, sinking and uncontrolled water recur when plans or containers fail.',possibility:'These dreams may give spatial form to affect that exceeds ordinary regulation—less “water equals emotion” than water showing what uncontained intensity does.',counterpoint:'Danger varies sharply, and some strong water is exhilarating rather than frightening.',dreamIds:['New dream 36','Perilous Waters, Sinking Hope','Submerged Sanitation Dilemma','Uncontrolled Waters of Chaos']},
      {name:'Play, immersion and restoration',confidence:'MEDIUM-HIGH',evidence:'A contrasting group enters water bodily, enjoys it, rediscovers play or encounters beauty and renewal.',possibility:'Immersion may sometimes loosen control and restore contact with pleasure, childhood vitality or a more receptive mode of being.',counterpoint:'The restorative state can vanish abruptly or remain mixed with risk; water does not become simply benevolent.',dreamIds:['New dream 41','Ocean of Childhood Rediscovered','Sacred Bond by the Sea','Small Spaces, Big Comfort']},
      {name:'Protection within depth',confidence:'MEDIUM',evidence:'Children, Percy and other vulnerable beings repeatedly draw care and rescue into water settings.',possibility:'The depth is relational: entering uncertainty is often accompanied by responsibility for another life.',counterpoint:'Keyword recurrence alone cannot determine whether water causes the danger or merely contains the wider scene.',dreamIds:['New dream 30','Overwhelmed and Overlooked Percy','New dream 367','Percy\'s Journey to Healing']}
    ],
    jungian:[
      {name:'Unconscious depth',copy:'Water may image psychic material not fully available to conscious control, especially where the dream moves beneath surfaces or into unknown depth.'},
      {name:'Liminal passage',copy:'Rivers and shores create thresholds: the dream ego must cross, enter or negotiate a boundary between states rather than merely observe it.'},
      {name:'Renewal and dissolution',copy:'Immersion can refresh established identity, while flood or sinking can dissolve its existing structures. The corpus contains both poles and should preserve the tension.'}
    ],
    alternatives:[
      {name:'Emotion processing',copy:'Changing water conditions may organise emotionally intense experience into bodily and spatial form.'},
      {name:'Threat simulation',copy:'Sinking, currents and rescue scenes can rehearse danger recognition and protective action without implying concealed symbolism.'},
      {name:'Embodied memory and continuity',copy:'Holidays, coasts, swimming and weather may draw directly on sensory memory and waking concerns.'}
    ],
    boundary:'The familiar phrase “water means emotion or the unconscious” is too broad. Form, movement, emotional tone, companions and Sam\'s agency decide whether a particular water appearance supports that reading.',
    reflection:'Is the water asking you to cross, surrender, play, rescue, contain, survive—or simply remember a real landscape and bodily feeling?',
    personalMeaning:'Water may represent your changing relationship to emotional and unconscious depth: at times something that overwhelms ordinary control, at others a medium through which you cross, play, reconnect and renew. Its personal significance seems to depend on whether you can enter the depth without losing agency—and whether responsibility for others accompanies that immersion.'
  },
  mum:{
    methodNote:'Mum is treated as a real person across 54 source dreams before any maternal amplification. The analysis distinguishes her actions, Sam\'s responses, family setting and the wider journey rather than collapsing her into “the mother”.',
    synthesis:'Mum is an enduring carrier of family continuity who frequently accompanies movement between places, generations and responsibilities. She can be companion, helper, person needing care, or participant in conflict. The central pattern is therefore not an idealised maternal function but a living bond through which home, origin and present responsibility remain connected.',
    constellations:[
      {name:'Family continuity across changing worlds',confidence:'HIGH',evidence:'Every Mum dream is family-linked, while houses, meals, siblings, children and remembered places repeatedly gather around her.',possibility:'Mum may anchor continuity between childhood belonging and the family world Sam now helps sustain.',counterpoint:'This may be direct biography rather than symbolic representation; Mum often appears simply as herself among actual relatives.',dreamIds:['Dining with Desired Connection','New dream 113','New dream 273']},
      {name:'Companionship, care and negotiated responsibility',confidence:'MEDIUM-HIGH',evidence:'Journeys and vulnerable situations repeatedly place care between Mum, Sam, children, partners and animals.',possibility:'The relationship may carry an evolving reciprocity: being accompanied by one\'s origin while also assuming adult responsibility within a wider family system.',counterpoint:'Care flows in several directions and includes frustration, disagreement and limits; Mum is not a single nurturing role.',dreamIds:['Holiday Anxieties','New dream 126','Balancing Passions and Responsibilities']}
    ],
    jungian:[
      {name:'Personal mother and mother complex',copy:'Jungian interpretation begins with the actual maternal relationship and its emotional history; archetypal amplification should not erase that specificity.'},
      {name:'Origin and continuity',copy:'Mum\'s presence across childhood places and present family scenes may connect earlier belonging with the life now being built.'},
      {name:'Differentiation',copy:'The dreams include accompaniment and difference. Psychological development does not require abandoning the bond, but becoming more conscious of how care and authority move within it.'}
    ],
    alternatives:[
      {name:'Attachment',copy:'Proximity, reassurance, concern and practical support can be read within a durable attachment bond.'},
      {name:'Family systems',copy:'Mum often links siblings, children, partners and generations, making relational position more informative than isolated symbolism.'},
      {name:'Autobiographical continuity',copy:'The recurrence may reflect the ordinary importance of a central family relationship across waking concerns.'}
    ],
    boundary:'Mum should never be treated as interchangeable with a universal Mother archetype. The literal person, the relationship\'s history and her distinct agency are the primary evidence.',
    reflection:'When Mum appears, is she accompanying, helping, needing care, connecting generations, disagreeing—or simply present as the familiar ground of family?',
    personalMeaning:'Mum may provisionally gather your continuing relationship to origin: not a fixed past, but a living family bond carried into journeys, partnership, fatherhood and responsibility.'
  },
  cat:{
    methodNote:'The 34 cat dreams include Percy as well as other feline figures. The analysis separates Percy\'s personal biography from the broader animal pattern and compares vulnerability, independence, transformation and boundary-crossing.',
    synthesis:'Cats gather a persistent tension between cherished vulnerability and irreducible autonomy. They need food, shelter, rescue and protection, yet slip through boundaries, change form, resist intervention and retain an instinctive direction of their own. The corpus therefore does not make the cat merely dependent or wild: it repeatedly asks how intimate care can coexist with respect for a life that cannot be fully managed.',
    constellations:[
      {name:'Vulnerable life calling forth protection',confidence:'HIGH',evidence:'Cats repeatedly face vehicles, hostile figures, injury, disappearance, fire or unsafe boundaries, prompting urgent rescue and practical care.',possibility:'The cat may concentrate sensitivity to vulnerable life and the moral pressure to notice what others overlook.',counterpoint:'Many appearances directly reflect love and concern for Percy; symbolic language may add nothing beyond that real bond.',dreamIds:['New dream 30','Cardboard Shields and Feline Rescues','Unwanted Help, Unleashed Fury']},
      {name:'Instinct that exceeds domestication',confidence:'MEDIUM-HIGH',evidence:'Cats become lion-like, elusive, speaking, resistant or unexpectedly capable, repeatedly exceeding the passive role assigned to a pet.',possibility:'Feline figures may carry embodied preference and autonomous intelligence that challenge care when care becomes control.',counterpoint:'Transformation is vivid but not universal; ordinary domestic cats remain an important counterweight.',dreamIds:['New dream 54','Small Spaces, Big Comfort','Percy\'s Talking Tidying Adventure']}
    ],
    jungian:[
      {name:'Instinctive companion',copy:'The cat can mediate between domestic consciousness and a more self-directed instinctive life—close to the household, but never wholly possessed by it.'},
      {name:'Shadow of excessive control',copy:'Resistance or escape may compensate when conscious care becomes over-management, asking whether protection can listen to the protected being.'},
      {name:'Transforming familiar',copy:'When a known cat speaks or enlarges, the ordinary companion becomes numinous without ceasing to be personally recognisable.'}
    ],
    alternatives:[
      {name:'Attachment to animals',copy:'Real interspecies attachment explains vigilance, grief and caregiving without requiring archetypal interpretation.'},
      {name:'Ethology and agency',copy:'Cats\' actual independence, sensory acuity and boundary-crossing behaviour shape the dream grammar.'},
      {name:'Care ethics',copy:'The recurring question is how responsibility remains responsive to the preferences of a dependent but agentic other.'}
    ],
    boundary:'Cat is a category, not one identity. Percy, unfamiliar cats and transformed feline figures should not be collapsed into a single meaning, and ordinary pet-care continuity remains the strongest explanation for many dreams.',
    reflection:'Is the cat asking for rescue, food, space, trust, attention—or recognition that its instinct knows something your conscious plan does not?',
    personalMeaning:'Cats may represent your relationship to vulnerable autonomy: a form of life you love intensely and feel responsible for, but whose integrity depends on remaining partly beyond your command. Their recurring presence may ask you to refine protection into attentive partnership with instinct.'
  },
  dog:{
    methodNote:'The 25 dog dreams include known dogs such as Mila and Max, unfamiliar companions, noisy guardians and threatening packs. Breed, relationship, behaviour and the dreamer\'s response are kept distinct.',
    synthesis:'Dogs oscillate between companion and sentinel. They run alongside family life, play, rest and accompany journeys, but they also bark, guard, chase, expose danger or reveal that apparent protection is performative. Their central tension is loyalty at the boundary: instinct can help decide what belongs and what threatens, yet protective energy can itself become noisy, exaggerated or unsafe.',
    constellations:[
      {name:'Companionship woven into family life',confidence:'MEDIUM-HIGH',evidence:'Known dogs repeatedly appear with Natalie, Mum, family, fields, houses and other animals as energetic members of a shared relational world.',possibility:'The dog may gather embodied loyalty and social belonging—connection expressed through proximity, movement and participation.',counterpoint:'These appearances often directly reflect affection for real dogs and ordinary family continuity.',dreamIds:['Harmony Underneath','The Trained Rest Ritual','New dream 517']},
      {name:'Guarding, warning and misjudged threat',confidence:'MEDIUM-HIGH',evidence:'Dogs bark, guard thresholds, chase vulnerable figures or appear threatening; other dreams expose a guard dog as ineffective or reveal benign animals beneath apparent danger.',possibility:'Dog imagery may test the reliability of protective instinct: when should alarm be trusted, moderated or looked beneath?',counterpoint:'Threat ranges from real danger to comic pretence and mistaken identity, so aggression cannot be treated as the dog\'s stable meaning.',dreamIds:['New dream 92','Guard Dog Pretender','Defiant English Sentinel']}
    ],
    jungian:[
      {name:'Instinctive guardian',copy:'The dog can amplify protective instinct at the edge of consciousness, alerting the ego to what approaches the household or group.'},
      {name:'Psychopomp and companion',copy:'As a travelling animal companion, the dog may mediate unfamiliar terrain while keeping the dreamer related to embodied trust.'},
      {name:'Shadow of loyalty',copy:'Guarding can become indiscriminate aggression; dreams that puncture a sentinel\'s performance may compensate for overconfident threat perception.'}
    ],
    alternatives:[
      {name:'Attachment to animals',copy:'Known dogs carry real affection, memory and grief that should precede symbolic amplification.'},
      {name:'Threat detection',copy:'Barking, chasing and guarding dramatise rapid judgements about safety and uncertainty.'},
      {name:'Social behaviour',copy:'Dogs\' pack, play and training behaviours provide an embodied language for cooperation, hierarchy and regulation.'}
    ],
    boundary:'Dog does not mean loyalty in every dream. Known pets, unfamiliar dogs, wolves and human pretenders occupy different narrative roles and must not be merged without qualification.',
    reflection:'Is this dog accompanying, playing, resting, warning, guarding, chasing—or pretending to protect, and does your body trust its judgement?',
    personalMeaning:'Dogs may represent your instinct for loyal protection in its full ambiguity: the wish to accompany and defend those who belong, alongside the need to examine whether alarm is accurate, excessive or merely performed. The strongest development lies in learning which instinct deserves trust.'
  }
};

const AUTHORED_LENS_EVIDENCE={
  house:{
    'Psyche / personality':{basis:'Unfamiliar houses repeatedly contain rooms, levels and passages that Sam has not yet explored, while known homes change their structure or inhabitants. The building makes differentiated areas of experience visible: privacy, family life, danger, memory and discovery occupy distinct but connected spaces.',dreamIds:['New dream 65','Small Spaces, Big Comfort','Passage of Haunted Favor']},
    'Self and totality':{basis:'The strongest candidates are the houses that exceed any realistic dwelling: the seventeen-bedroom haunted mansion, expanding interiors and higgledy-piggledy structures with concealed rooms. They present a whole world larger than the dream ego\'s present knowledge, rather than an ordinary room standing for one trait.',dreamIds:['Haunted Mansion Roomies','Small Spaces, Big Comfort','New dream 65']},
    'Family complex and inheritance':{basis:'Childhood and family homes repeatedly gather Mum, siblings, children, partners, animals and earlier relational tensions. Present concerns enter inherited rooms, so the house holds both biographical memory and the way older family patterns remain active in current belonging.',dreamIds:['New dream 87','Generational Connections and Exclusions','New dream 273']}
  },
  water:{
    'Unconscious depth':{basis:'Water repeatedly changes the conditions of consciousness: solid ground gives way to immersion, unseen currents, submerged spaces or an intelligent force that exceeds ordinary categories. Sam must orient within something moving and only partly controllable, which is why unconscious depth fits better than a simple equation of water with emotion.',dreamIds:['New dream 36','Submerged Sanitation Dilemma','Uncontrolled Waters of Chaos']},
    'Liminal passage':{basis:'Rivers, shores, boats and islands repeatedly stand between the present position and another possible world. The dreamer must cross, find a route, risk immersion or decide whether to continue; water materially creates the threshold rather than serving as decorative scenery.',dreamIds:['New dream 13','River Crossing Dilemma','Rivers of Escape and Renewal']}
  },
  mum:{
    'Personal mother and mother complex':{basis:'Mum appears as a particular person across meals, journeys, childhood homes, disagreements and practical care. Her behaviour varies: she helps, worries, drives, misunderstands or needs assistance. That variability supports beginning with the lived relationship rather than imposing an ideal Mother archetype.',dreamIds:['New dream 62','New dream 126','New dream 273']},
    'Origin and continuity':{basis:'Mum repeatedly connects childhood houses, siblings and earlier family life with Sam\'s present relationships, fatherhood and care for Percy. She travels across generations and settings, making origin something carried into current life rather than left behind.',dreamIds:['New dream 113','Dining with Desired Connection','New dream 127']}
  }
};

function tarotCandidates(record){
  return [`${V57_TAROT_LOCAL_ROOT}/${record.art}`,`${V57_TAROT_REMOTE_ROOT}/${record.art}`];
}
function getV57Reading(id){
  const complete=COMPLETE_SYMBOL_EXTRACT[id];
  if(!complete)return null;
  return {complete,profile:INTERPRETIVE_PROFILES[id]??null,lensEvidence:AUTHORED_LENS_EVIDENCE[id]??{},tarotCandidates:tarotCandidates(complete)};
}

export {V57_TAROT_REMOTE_ROOT,V57_TAROT_LOCAL_ROOT,COMPLETE_SYMBOL_EXTRACT,INTERPRETIVE_PROFILES,AUTHORED_LENS_EVIDENCE,getV57Reading,tarotCandidates};
