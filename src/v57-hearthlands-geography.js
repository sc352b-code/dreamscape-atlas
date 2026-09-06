function waitForAtlas() {
  const root = document.querySelector('.atlas');
  const markers = document.querySelector('.flatmap-markers');
  const placeSheet = document.querySelector('.place-sheet');
  if (!root || !markers || !placeSheet) {
    requestAnimationFrame(waitForAtlas);
    return;
  }

  // v57 source of truth: Hearthlands has six mapped places, including the
  // rare one-dream Haunted 17-Bedroom Mansion.
  document.querySelectorAll('.topbar .stats span').forEach((el) => {
    if (/mapped places/i.test(el.textContent || '')) el.textContent = '☾ 6 mapped places';
  });
  document.querySelectorAll('.focus-meta span').forEach((el) => {
    if (/mapped places/i.test(el.textContent || '')) el.innerHTML = '<b>6</b> mapped places';
  });

  if (!markers.querySelector('[data-place="The Haunted 17-Bedroom Mansion"]')) {
    const button = document.createElement('button');
    button.className = 'map-marker place v57-rare-place';
    button.dataset.place = 'The Haunted 17-Bedroom Mansion';
    button.style.left = '87%';
    button.style.top = '24%';
    button.innerHTML = '<i></i><span>The Haunted 17-Bedroom Mansion</span>';
    button.title = 'Rare Hearthlands place · 1 source dream';
    button.addEventListener('click', () => {
      placeSheet.querySelector('h2').textContent = 'The Haunted 17-Bedroom Mansion';
      placeSheet.querySelector('p:last-of-type').textContent = 'A rare one-dream Hearthlands place retained by v57 rather than discarded for low frequency. Its full evidence-led reading remains a separate layer.';
      placeSheet.classList.add('open');
    });
    markers.appendChild(button);
  }
}

waitForAtlas();
