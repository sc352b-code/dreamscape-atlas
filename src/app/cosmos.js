// Canonical AVIF decoded byte-for-byte from the four original repository chunks.
export class DreamscapeCosmosBackground {
  constructor(host){
    this.host=host;host.className='cosmos';host.innerHTML='<img class="cosmos-art" src="/assets/cosmos/original-cosmic.avif" alt=""><div class="cosmos-haze"></div><canvas></canvas><div class="cosmos-vignette"></div>';
    this.canvas=host.querySelector('canvas');this.ctx=this.canvas.getContext('2d');this.motion=matchMedia('(prefers-reduced-motion: reduce)');
    this.resize=()=>{cancelAnimationFrame(this.frame);const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio,2);this.w=w;this.h=h;this.canvas.width=w*dpr;this.canvas.height=h*dpr;this.ctx.setTransform(dpr,0,0,dpr,0,0);this.stars=Array.from({length:Math.min(110,Math.round(w*h/14000))},()=>({x:Math.random()*w,y:Math.random()*h,r:.3+Math.random()*.7,phase:Math.random()*Math.PI*2,speed:.00015+Math.random()*.0006,steady:Math.random()<.4}));this.paint(performance.now());};
    this.paint=t=>{const c=this.ctx;c.clearRect(0,0,this.w,this.h);for(const s of this.stars){const a=s.steady?.3:.15+.25*(1+Math.sin(t*s.speed+s.phase))/2;c.fillStyle=`rgba(255,229,190,${a})`;c.beginPath();c.arc(s.x,s.y,s.r,0,Math.PI*2);c.fill();}if(!this.motion.matches&&!document.hidden)this.frame=requestAnimationFrame(this.paint);};
    this.schedule=()=>{clearTimeout(this.timer);if(this.motion.matches||document.hidden)return;this.timer=setTimeout(()=>{const shot=document.createElement('i');shot.className='shooting-star';shot.style.left=(8+Math.random()*60)+'%';shot.style.top=(5+Math.random()*18)+'%';shot.style.setProperty('--angle',(16+Math.random()*20)+'deg');shot.style.animationDuration=(.7+Math.random()*1.1)+'s';host.append(shot);shot.addEventListener('animationend',()=>shot.remove(),{once:true});this.schedule();},20000+Math.random()*30000);};
    this.resume=()=>{cancelAnimationFrame(this.frame);host.classList.toggle('still',this.motion.matches||document.hidden);this.paint(performance.now());this.schedule();if(this.motion.matches)host.querySelectorAll('.shooting-star').forEach(x=>x.remove());};
    addEventListener('resize',this.resize);document.addEventListener('visibilitychange',this.resume);this.motion.addEventListener('change',this.resume);this.resize();this.schedule();
  }
  destroy(){cancelAnimationFrame(this.frame);clearTimeout(this.timer);removeEventListener('resize',this.resize);document.removeEventListener('visibilitychange',this.resume);this.motion.removeEventListener('change',this.resume);this.host.replaceChildren();}
}
