const V57_HEARTHLAND_PLACES = [
  { name: 'Cambridge Road Childhood House', dreams: 3, x: 10, y: 58 },
  { name: 'Family Home', dreams: 2, x: 29, y: 25 },
  { name: 'Current / Present House', dreams: 31, x: 48, y: 58 },
  { name: 'The Large Many-Roomed House', dreams: 6, x: 67, y: 20 },
  { name: 'The Unfamiliar House', dreams: 5, x: 78, y: 59 },
  { name: 'The Haunted 17-Bedroom Mansion', dreams: 1, x: 87, y: 24, rare: true },
];

function waitForAtlas() {
  const root = document.querySelector('.atlas');
  const markers = document.querySelector('.flatmap-markers');
  const placeSheet = document.querySelector('.place-sheet');
  if (!root || !markers || !placeSheet) {
    requestAnimationFrame(waitForAtlas);
    return;
  }

  document.querySelectorAll('.topbar .stats span').forEach((el) => {
    if (/mapped places/i.test(el.textContent || '')) el.textContent = '☾ 6 mapped places';
  });
  document.querySelectorAll('.focus-meta span').forEach((el) => {
    if (/mapped places/i.test(el.textContent || '')) el.innerHTML = '<b>6</b> mapped places';
  });

  for (const place of V57_HEARTHLAND_PLACES) {
    let button = markers.querySelector(`[data-place="${CSS.escape(place.name)}"]`);
    if (!button) {
      button = document.createElement('button');
      button.className = 'map-marker place';
      button.dataset.place = place.name;
      button.innerHTML = `<i></i><span>${place.name}</span>`;
      markers.appendChild(button);
    }
    button.classList.toggle('v57-rare-place', Boolean(place.rare));
    button.style.left = `${place.x}%`;
    button.style.top = `${place.y}%`;
    button.title = `${place.rare ? 'Rare Hearthlands place' : 'Hearthlands place'} · ${place.dreams} source dream${place.dreams === 1 ? '' : 's'}`;
    button.dataset.dreams = String(place.dreams);
    button.onclick = () => {
      placeSheet.querySelector('h2').textContent = place.name;
      placeSheet.querySelector('p:last-of-type').textContent = place.rare
        ? 'A rare one-dream Hearthlands place retained by v57 rather than discarded for low frequency.'
        : `${place.dreams} source dreams contribute to this mapped Hearthlands place in v57.`;
      placeSheet.classList.add('open');
    };
  }
}

waitForAtlas();
export { V57_HEARTHLAND_PLACES };
