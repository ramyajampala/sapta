
'use strict';

/* ── GSAP Setup ─────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ── THEME TOGGLE ───────────────────────────── */
const html = document.documentElement;
const toggleTrack = document.getElementById('toggle-track');
const toggleLabel = document.getElementById('toggle-label');
let isDark = true;

document.getElementById('theme-toggle').addEventListener('click', () => {
  isDark = !isDark;
  html.setAttribute('data-theme', isDark ? 'dark' : 'light');
  toggleLabel.textContent = isDark ? 'Dark' : 'Light';
  // Rebuild particles with new colours
  setTimeout(initParticles, 100);
});

/* ── CUSTOM CURSOR ──────────────────────────── */
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let mouseX = -200, mouseY = -200;
let ringX = -200, ringY = -200;
let cursorRaf;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

function animateCursor() {
  ringX += (mouseX - ringX) * 0.14;
  ringY += (mouseY - ringY) * 0.14;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  cursorRaf = requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover effect on interactive elements
const hoverTargets = 'a, button, [data-tilt], [data-magnetic], input, textarea, .toggle-track, .svc-card';
document.querySelectorAll(hoverTargets).forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});
document.addEventListener('mouseleave', () => {
  cursorDot.style.opacity = '0';
  cursorRing.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  cursorDot.style.opacity = '1';
  cursorRing.style.opacity = '1';
});

/* ── MAGNETIC BUTTONS ───────────────────────── */
document.querySelectorAll('[data-magnetic]').forEach(btn => {
  let bounds;
  btn.addEventListener('mouseenter', () => { bounds = btn.getBoundingClientRect(); });
  btn.addEventListener('mousemove', e => {
    if (!bounds) return;
    const cx = bounds.left + bounds.width  / 2;
    const cy = bounds.top  + bounds.height / 2;
    const dx = (e.clientX - cx) / (bounds.width  / 2);
    const dy = (e.clientY - cy) / (bounds.height / 2);
    gsap.to(btn, { x: dx * 9, y: dy * 6, duration: 0.35, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    bounds = null;
  });
});

/* ── NAV SCROLL STYLE ───────────────────────── */
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 50;
  nav.style.background = scrolled
    ? (isDark ? 'rgba(7,8,14,0.95)' : 'rgba(244,243,255,0.97)')
    : (isDark ? 'rgba(7,8,14,0.65)' : 'rgba(244,243,255,0.75)');
}, { passive: true });

/* ── PARTICLE NETWORK ───────────────────────── */
const canvas  = document.getElementById('particle-canvas');
const ctx     = canvas.getContext('2d');
let W, H, particles, animId;
const COUNT = 85, LINK = 130, MOUSE_R = 155;
let mx = -9999, my = -9999;

function Particle() {
  this.x  = Math.random() * W;
  this.y  = Math.random() * H;
  this.vx = (Math.random() - .5) * .42;
  this.vy = (Math.random() - .5) * .42;
  this.r  = Math.random() * 1.7 + .8;
  this.alpha = Math.random() * .45 + .25;
}

function initParticles() {
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
  particles = Array.from({ length: COUNT }, () => new Particle());
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);

  // p–p links
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < LINK*LINK) {
        const t = 1 - Math.sqrt(d2)/LINK;
        ctx.beginPath();
        ctx.strokeStyle = isDark
          ? `rgba(167,139,250,${t * 0.22})`
          : `rgba(108,99,255,${t * 0.14})`;
        ctx.lineWidth = .8;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // Mouse links
  particles.forEach(p => {
    const dx = p.x - mx, dy = p.y - my;
    const d = Math.sqrt(dx*dx + dy*dy);
    if (d < MOUSE_R) {
      const t = 1 - d / MOUSE_R;
      ctx.beginPath();
      ctx.strokeStyle = isDark
        ? `rgba(108,99,255,${t * 0.5})`
        : `rgba(92,82,230,${t * 0.4})`;
      ctx.lineWidth = 1.2;
      ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my);
      ctx.stroke();
    }
  });

  // Dots & movement
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = isDark
      ? `rgba(167,139,250,${p.alpha})`
      : `rgba(108,99,255,${p.alpha * .75})`;
    ctx.fill();

    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    // Gentle mouse repulsion
    const rdx = p.x - mx, rdy = p.y - my;
    const rd = Math.sqrt(rdx*rdx + rdy*rdy);
    if (rd < 100 && rd > 0) {
      const f = ((100 - rd) / 100) * 0.025;
      p.vx += (rdx/rd) * f; p.vy += (rdy/rd) * f;
      const spd = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
      if (spd > 2) { p.vx = (p.vx/spd)*2; p.vy = (p.vy/spd)*2; }
    }
  });

  animId = requestAnimationFrame(drawParticles);
}

const heroEl = document.getElementById('hero');
heroEl.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mx = e.clientX - r.left; my = e.clientY - r.top;
});
heroEl.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

window.addEventListener('resize', () => {
  cancelAnimationFrame(animId);
  initParticles();
  drawParticles();
}, { passive: true });

initParticles();
drawParticles();

/* ── HERO ENTRANCE (GSAP) ───────────────────── */
gsap.timeline({ delay: 0.25 })
  .fromTo('#hb', { opacity:0, y:18 }, { opacity:1, y:0, duration:.7, ease:'power3.out' })
  .fromTo('#ht', { opacity:0, y:28 }, { opacity:1, y:0, duration:.8, ease:'power3.out' }, 0.18)
  .fromTo('#hs', { opacity:0, y:20 }, { opacity:1, y:0, duration:.7, ease:'power3.out' }, 0.35)
  .fromTo('#ha', { opacity:0, y:16 }, { opacity:1, y:0, duration:.65, ease:'power3.out' }, 0.5);

/* ── STAT COUNTERS ──────────────────────────── */
document.querySelectorAll('[data-count]').forEach(el => {
  const target = +el.dataset.count;
  gsap.fromTo(el, { innerText:0 }, {
    innerText: target, duration:1.8, ease:'power2.out',
    snap:{ innerText:1 },
    scrollTrigger:{ trigger:el, start:'top 88%', once:true }
  });
});

/* ── SCROLL REVEALS ─────────────────────────── */
// Stats row
gsap.utils.toArray('#stats .stat-item').forEach((el, i) => {
  gsap.from(el, {
    opacity:0, y:28, duration:.7, delay:i*.1, ease:'power2.out',
    scrollTrigger:{ trigger:'#stats', start:'top 85%', once:true }
  });
});

// About
gsap.from('#about > div:first-child', {
  opacity:0, x:-40, duration:.9, ease:'power3.out',
  scrollTrigger:{ trigger:'#about', start:'top 76%', once:true }
});
gsap.from('#about .about-visual', {
  opacity:0, x:40, duration:.9, delay:.15, ease:'power3.out',
  scrollTrigger:{ trigger:'#about', start:'top 76%', once:true }
});

// Services
gsap.from('.svc-card', {
  opacity:0, y:50, duration:.75, stagger:.13, ease:'power3.out',
  scrollTrigger:{ trigger:'.services-grid', start:'top 80%', once:true }
});

// Team cards stagger with float
gsap.from('.team-card', {
  opacity:0, y:50, duration:.7, stagger:.08, ease:'power2.out',
  scrollTrigger:{ trigger:'.team-grid', start:'top 82%', once:true }
});

// Contact
gsap.from('.contact-wrap', {
  opacity:0, y:40, duration:.9, ease:'power3.out',
  scrollTrigger:{ trigger:'#contact', start:'top 78%', once:true }
});

// Section headers
gsap.utils.toArray('.sh').forEach(el => {
  gsap.from(el, {
    opacity:0, y:28, duration:.8, ease:'power2.out',
    scrollTrigger:{ trigger:el, start:'top 86%', once:true }
  });
});

/* ── 3D TILT (team cards) ───────────────────── */
document.querySelectorAll('[data-tilt]').forEach(card => {
  let raf2 = null;
  card.addEventListener('mousemove', e => {
    cancelAnimationFrame(raf2);
    raf2 = requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width/2)  / (r.width/2);
      const dy = (e.clientY - r.top  - r.height/2) / (r.height/2);
      card.style.transform = `perspective(750px) rotateX(${-dy*8}deg) rotateY(${dx*8}deg) translateZ(10px) scale(1.02)`;
    });
  });
  card.addEventListener('mouseleave', () => {
    cancelAnimationFrame(raf2);
    gsap.to(card, {
      rotateX:0, rotateY:0, z:0, scale:1,
      duration:.65, ease:'elastic.out(1, 0.6)',
      clearProps:'transform'
    });
  });
});

/* ── SERVICE CARD SPOTLIGHT ─────────────────── */
document.querySelectorAll('[data-hover]').forEach(c => {
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', ((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
    c.style.setProperty('--my', ((e.clientY-r.top )/r.height*100).toFixed(1)+'%');
  });
});

/* ── FLOATING LABELS ────────────────────────── */
document.querySelectorAll('.field-input').forEach(inp => {
  const w = inp.closest('.field-wrap');
  inp.addEventListener('focus',  () => w.classList.add('active'));
  inp.addEventListener('blur',   () => { w.classList.remove('active'); w.classList.toggle('filled', inp.value.length > 0); });
  inp.addEventListener('input',  () => w.classList.toggle('filled', inp.value.length > 0));
});

/* ── CONTACT SUBMIT ─────────────────────────── */
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.contact-submit');
  btn.textContent = 'Sending…'; btn.style.opacity = '.65';
  setTimeout(() => {
    btn.textContent = '✓ Message Sent!';
    btn.style.background = 'linear-gradient(135deg,#34d399,#059669)';
    btn.style.boxShadow  = '0 0 40px rgba(52,211,153,.4)';
    btn.style.opacity = '1';
    e.target.reset();
    document.querySelectorAll('.field-wrap').forEach(w => w.classList.remove('filled','active'));
  }, 1300);
}
