const HEARTHLANDS_SYMBOLS = [
  "Alex","Alice","Bag","Bed","Bench","Bicycle","Boat","Book","Box","Brother","Bus","Car","Carl Jung","Cat","Chair","Clock","Clothes","Computer","Cow","Dad","Dog","Door","Drink","Egg","Field","Fire","Fish","Food","Forest","Garden","George","Grandma","Grass","Gun","House / Home","Insect","Key","Knife","Lake","Light","Lily","Lion","Max","Mirror","Money","Mum","Natalie","Ocean","Octopus","Percy","Phone","Plane","Rain","River","Sea","Sheep","Shirt","Shoe","Sister","Sky","Snake","Snow","Stephen Coarse","Storm","Sun","Table","Teddy","Toy","Train","Tree","Water","Wayne","Weight","Wind","Window","Woods"
];

const groups = {
  people: new Set(["Alex","Alice","Brother","Carl Jung","Dad","George","Grandma","Max","Mum","Natalie","Percy","Sister","Stephen Coarse","Wayne"]),
  domestic: new Set(["Bag","Bed","Bench","Book","Box","Chair","Clock","Clothes","Computer","Door","Drink","Egg","Food","House / Home","Key","Light","Mirror","Money","Phone","Shirt","Shoe","Table","Teddy","Toy","Weight","Window"]),
  transport: new Set(["Bicycle","Boat","Bus","Car","Plane","Train"]),
  animals: new Set(["Cat","Cow","Dog","Fish","Insect","Lion","Octopus","Sheep","Snake"]),
  landscape: new Set(["Field","Fire","Forest","Garden","Grass","Lake","Lily","Ocean","Rain","River","Sea","Sky","Snow","Storm","Sun","Tree","Water","Wind","Woods"]),
  objects: new Set(["Gun","Knife"])
};

const glyphs = {
  "Bag":"▱","Bed":"▰","Bench":"⌑","Bicycle":"◉","Boat":"⌁","Book":"▤","Box":"□","Bus":"▭","Car":"▰","Cat":"⌁","Chair":"⌑","Clock":"◷","Clothes":"♧","Computer":"▣","Cow":"♉","Dog":"◇","Door":"▯","Drink":"◒","Egg":"◯","Field":"≋","Fire":"♨","Fish":"><>","Food":"✦","Forest":"♜","Garden":"✿","Grass":"〽","Gun":"⌁","House / Home":"⌂","Insect":"✣","Key":"⚿","Knife":"†","Lake":"≈","Light":"✧","Lily":"❀","Lion":"♌","Mirror":"◐","Money":"◇","Ocean":"≋","Octopus":"✣","Phone":"▯","Plane":"⌁","Rain":"⋮","River":"≈","Sea":"≋","Sheep":"♈","Shirt":"♢","Shoe":"⌣","Sky":"✦","Snake":"∿","Snow":"✣","Storm":"ϟ","Sun":"☼","Table":"▱","Teddy":"♙","Toy":"✦","Train":"▭","Tree":"♣","Water":"≈","Weight":"●","Wind":"≋","Window":"▦","Woods":"♣"
};

function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rand(name,salt=0){const x=Math.sin((hash(name)+salt)*12.9898)*43758.5453;return x-Math.floor(x)}

const zones = {
  people: [[14,34,26,62],[34,30,53,64],[55,20,73,60],[72,28,89,63]],
  domestic: [[10,38,28,73],[30,35,48,73],[51,24,70,69],[70,34,90,72]],
  transport: [[8,63,36,84],[31,66,69,86],[60,60,91,82],[52,8,89,28]],
  animals: [[7,50,29,85],[28,46,53,82],[53,45,79,84],[70,42,92,77]],
  landscape: [[5,18,31,48],[22,54,47,88],[43,48,70,88],[62,14,94,54]],
  objects: [[20,45,46,78],[56,42,83,76]]
};

function groupFor(name){return Object.entries(groups).find(([,set])=>set.has(name))?.[0]||"domestic"}
function positionFor(name,index){const group=groupFor(name);const list=zones[group];const z=list[index%list.length];const x=z[0]+rand(name,17)*(z[2]-z[0]);const y=z[1]+rand(name,43)*(z[3]-z[1]);return {x,y,group}}

function makeGlyph(name,group){
  if(groups.people.has(name)) return "♙";
  return glyphs[name] || ({domestic:"✧",transport:"⌁",animals:"◇",landscape:"✦",objects:"†"}[group]||"✦");
}

function waitForAtlas(){
  const world=document.querySelector('.flatmap-world');
  const root=document.querySelector('.atlas');
  if(!world||!root){requestAnimationFrame(waitForAtlas);return}

  // Correct stale symbol counts in this implementation.
  document.querySelectorAll('.focus-meta span').forEach((el)=>{
    if(/symbol/i.test(el.textContent||'')) el.innerHTML='<b>76</b> evidenced symbols';
  });

  const layer=document.createElement('div');
  layer.className='corpus-symbol-layer';
  layer.setAttribute('aria-label','76 corpus-evidenced Hearthlands symbols');

  HEARTHLANDS_SYMBOLS.forEach((name,index)=>{
    const p=positionFor(name,index);
    const b=document.createElement('button');
    b.className=`corpus-symbol corpus-symbol--${p.group}`;
    b.style.left=`${p.x.toFixed(2)}%`;
    b.style.top=`${p.y.toFixed(2)}%`;
    b.style.setProperty('--tilt',`${(-8+rand(name,91)*16).toFixed(1)}deg`);
    b.style.setProperty('--scale',`${(0.72+rand(name,71)*0.42).toFixed(2)}`);
    b.dataset.symbol=name;
    b.setAttribute('aria-label',name);
    b.innerHTML=`<span class="corpus-symbol-glyph" aria-hidden="true">${makeGlyph(name,p.group)}</span>`;
    layer.appendChild(b);
  });

  world.appendChild(layer);

  const card=document.createElement('aside');
  card.className='symbol-peek';
  card.innerHTML='<small>HEARTHLANDS SYMBOL</small><b></b><span>Corpus-evidenced in Hearthlands · tarot reading layer coming next</span>';
  world.appendChild(card);

  let active=null;
  function show(button,event){
    active=button;
    const name=button.dataset.symbol;
    card.querySelector('b').textContent=name;
    const rect=world.getBoundingClientRect();
    const x=(event?.clientX ?? button.getBoundingClientRect().left)-rect.left;
    const y=(event?.clientY ?? button.getBoundingClientRect().top)-rect.top;
    card.style.left=`${Math.max(14,Math.min(rect.width-230,x+18))}px`;
    card.style.top=`${Math.max(72,Math.min(rect.height-120,y-30))}px`;
    card.classList.add('visible');
    button.classList.add('found');
  }
  function hide(){card.classList.remove('visible');active?.classList.remove('found');active=null}

  layer.addEventListener('pointerover',(e)=>{const b=e.target.closest('.corpus-symbol');if(b)show(b,e)});
  layer.addEventListener('pointerout',(e)=>{if(e.target.closest('.corpus-symbol')) hide()});
  layer.addEventListener('click',(e)=>{const b=e.target.closest('.corpus-symbol');if(!b)return;e.preventDefault();show(b,e)});
  world.addEventListener('click',(e)=>{if(!e.target.closest('.corpus-symbol')&&!e.target.closest('.symbol-peek'))hide()});
}

waitForAtlas();

export { HEARTHLANDS_SYMBOLS };
