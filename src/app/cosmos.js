export class DreamscapeCosmosBackground {
  constructor({ intensity = 1, brightness = 0.58, parallax = 1, shootingMin = 20000, shootingMax = 50000 } = {}) {
    this.intensity = intensity; this.parallax = parallax; this.shootingMin = shootingMin; this.shootingMax = shootingMax;
    this.element = document.createElement('div'); this.element.className = 'dreamscape-cosmos'; this.element.setAttribute('aria-hidden', 'true');
    this.element.innerHTML = '<img class="cosmos-art" src="/assets/cosmos/original.avif" alt=""><div class="cosmos-haze"></div><canvas></canvas><div class="cosmos-shooting"></div><div class="cosmos-vignette"></div>';
    this.element.style.setProperty('--cosmos-brightness', brightness); document.body.prepend(this.element);
    this.canvas = this.element.querySelector('canvas'); this.ctx = this.canvas.getContext('2d');
    this.motion = matchMedia('(prefers-reduced-motion: reduce)');
    this.stars = Array.from({ length: innerWidth < 650 ? 36 : 72 }, () => ({ x: Math.random(), y: Math.random(), size: Math.random() * 1.1 + .3, phase: Math.random() * 40, speed: Math.random() * .19 + .05, stable: Math.random() < .55 }));
    this.resize = () => { this.width = innerWidth; this.height = innerHeight; const dpr = Math.min(devicePixelRatio || 1, 1.5); this.canvas.width = this.width * dpr; this.canvas.height = this.height * dpr; this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0); this.draw(0); };
    this.pointer = event => { if (this.motion.matches || innerWidth < 650) return; this.element.style.setProperty('--cosmos-x', `${(event.clientX / innerWidth - .5) * 5 * this.parallax}px`); this.element.style.setProperty('--cosmos-y', `${(event.clientY / innerHeight - .5) * 3 * this.parallax}px`); };
    this.visibility = () => this.updateMotion();
    addEventListener('resize', this.resize); addEventListener('pointermove', this.pointer, { passive: true });
    document.addEventListener('visibilitychange', this.visibility); this.motion.addEventListener('change', this.visibility);
    this.resize(); this.updateMotion();
  }
  draw(time) {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (const star of this.stars) {
      const alpha = star.stable || this.motion.matches ? .25 : .12 + Math.pow((Math.sin(time * .001 * star.speed + star.phase) + 1) / 2, 6) * .65 * this.intensity;
      this.ctx.fillStyle = `rgba(248,224,188,${alpha})`; this.ctx.beginPath();
      this.ctx.arc(star.x * this.width, star.y * this.height, star.size, 0, Math.PI * 2); this.ctx.fill();
      if (alpha > .65) { this.ctx.strokeStyle = `rgba(255,228,193,${(alpha - .65) * 2})`; this.ctx.beginPath(); this.ctx.moveTo(star.x * this.width - 5, star.y * this.height); this.ctx.lineTo(star.x * this.width + 5, star.y * this.height); this.ctx.stroke(); }
    }
  }
  updateMotion() {
    cancelAnimationFrame(this.frame); clearTimeout(this.timer);
    this.element.dataset.paused = String(document.hidden || this.motion.matches);
    if (document.hidden || this.motion.matches) { this.element.querySelector('.cosmos-shooting').replaceChildren(); this.draw(0); return; }
    let last = 0;
    const animate = time => { if (time - last > 40) { this.draw(time); last = time; } this.frame = requestAnimationFrame(animate); };
    this.frame = requestAnimationFrame(animate); this.schedule();
  }
  schedule() {
    this.timer = setTimeout(() => {
      if (!document.hidden && !this.motion.matches) {
        const star = document.createElement('i'); star.className = 'shooting-star';
        star.style.left = `${5 + Math.random() * 60}%`; star.style.top = `${5 + Math.random() * 18}%`;
        star.style.setProperty('--shoot-angle', `${12 + Math.random() * 20}deg`);
        star.style.setProperty('--shoot-duration', `${.7 + Math.random() * 1.1}s`);
        this.element.querySelector('.cosmos-shooting').append(star); star.addEventListener('animationend', () => star.remove(), { once: true });
      }
      this.schedule();
    }, this.shootingMin + Math.random() * (this.shootingMax - this.shootingMin));
  }
  setRoom(id) { this.element.dataset.room = id; }
  dispose() { cancelAnimationFrame(this.frame); clearTimeout(this.timer); removeEventListener('resize', this.resize); removeEventListener('pointermove', this.pointer); document.removeEventListener('visibilitychange', this.visibility); this.motion.removeEventListener('change', this.visibility); this.element.remove(); }
}
