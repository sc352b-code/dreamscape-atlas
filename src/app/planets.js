// Approved family-home-pilot textures. This reference is not a user's generated world.
const WORLDS = [
  { id: 'littoral', name: 'Littoral Coast', x: -2.5, y: 1.05, radius: .46 },
  { id: 'roadlands', name: 'The Roadlands', x: 2.4, y: .95, radius: .48 },
  { id: 'hearthlands', name: 'The Hearthlands', x: 0, y: 0, radius: .64 },
  { id: 'institutional', name: 'Institutional Quarter', x: -1.8, y: -1.4, radius: .43 },
  { id: 'river', name: 'River Country', x: 1.85, y: -1.35, radius: .46 },
];
export function mountPlanets(container, onSelect) {
  let disposed = false, renderer, observer, frame, geometries = [], materials = [], textures = [];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  container.innerHTML = '<canvas aria-hidden="true"></canvas><div class="planet-links"></div><p class="planet-loading" role="status">Lighting the preserved worlds…</p>';
  const buttons = container.querySelector('.planet-links');
  for (const world of WORLDS) {
    const button = document.createElement('button'); button.className = 'planet-link'; button.textContent = world.name;
    button.style.left = `${50 + world.x * 13}%`; button.style.top = `${50 - world.y * 18}%`; button.dataset.planet = world.id;
    button.addEventListener('click', () => onSelect(world)); buttons.append(button);
  }
  const visibility = () => { cancelAnimationFrame(frame); if (!disposed && !document.hidden) loop?.(performance.now()); };
  let loop;
  import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js').then(THREE => {
    if (disposed) return;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: container.querySelector('canvas'), alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace;
      const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, .1, 30); camera.position.z = 7.7;
      scene.add(new THREE.AmbientLight(0xffedd8, 1.4));
      const light = new THREE.DirectionalLight(0xffedd5, 2.3); light.position.set(-4, 4, 6); scene.add(light);
      const geometry = new THREE.SphereGeometry(1, 64, 48); geometries.push(geometry);
      const items = WORLDS.map(world => {
        const texture = new THREE.TextureLoader().load(`/assets/territory-planets/${world.id}-final.png`, () => { if (disposed) texture.dispose(); }, undefined, () => { if (!disposed) container.querySelector('.planet-loading').textContent = 'Some reference artwork could not load. Try again when connected.'; });
        texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture);
        const material = new THREE.MeshStandardMaterial({ map: texture, roughness: .92, emissive: 0xffffff, emissiveMap: texture, emissiveIntensity: .16 }); materials.push(material);
        const mesh = new THREE.Mesh(geometry, material); mesh.scale.setScalar(world.radius); scene.add(mesh); return { world, mesh };
      });
      let last = performance.now();
      const resize = () => { const width = container.clientWidth, height = container.clientHeight; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); };
      observer = new ResizeObserver(resize); observer.observe(container); resize();
      loop = time => {
        if (disposed || document.hidden) return;
        const dt = Math.min((time - last) / 1000, .05); last = time;
        const mobile = container.clientWidth < 550;
        items.forEach(({ world, mesh }) => {
          mesh.position.set(world.x * (mobile ? .34 : 1), world.y * (mobile ? 1.05 : 1), 0);
          mesh.scale.setScalar(world.radius * (mobile ? .68 : 1));
          if (!motion.matches) mesh.rotation.y += dt * .075;
          const vector = mesh.position.clone().project(camera), button = buttons.querySelector(`[data-planet="${world.id}"]`);
          button.style.left = `${(vector.x * .5 + .5) * 100}%`; button.style.top = `${(-vector.y * .5 + .5) * 100 + (mobile ? 10 : 15)}%`;
        });
        renderer.render(scene, camera); frame = requestAnimationFrame(loop);
      };
      container.querySelector('.planet-loading').hidden = true; document.addEventListener('visibilitychange', visibility); loop(performance.now());
    } catch { container.querySelector('.planet-loading').textContent = '3D rendering is unavailable here. The preserved artwork can still be opened below.'; }
  }).catch(() => { if (!disposed) container.querySelector('.planet-loading').textContent = 'The 3D library could not load. Reference artwork remains available through the world names.'; });
  return () => { disposed = true; cancelAnimationFrame(frame); observer?.disconnect(); document.removeEventListener('visibilitychange', visibility); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); renderer?.dispose(); };
}
