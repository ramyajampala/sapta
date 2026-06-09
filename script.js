'use strict';

/* ══════════════════════════════════════════════
   GSAP SETUP
══════════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════════
   THEME TOGGLE
══════════════════════════════════════════════ */
const html        = document.documentElement;
const toggleLabel = document.getElementById('toggle-label');
let isDark        = true;

document.getElementById('theme-toggle').addEventListener('click', () => {
  isDark = !isDark;
  html.setAttribute('data-theme', isDark ? 'dark' : 'light');
  toggleLabel.textContent = isDark ? 'Dark' : 'Light';
  setTimeout(initParticles, 100);
});

document.getElementById('theme-toggle').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    document.getElementById('theme-toggle').click();
  }
});

/* ══════════════════════════════════════════════
   MOBILE NAVIGATION
══════════════════════════════════════════════ */
const hamburger = document.getElementById('nav-hamburger');
const drawer    = document.getElementById('nav-mobile-drawer');

function closeDrawer() {
  hamburger.classList.remove('open');
  drawer.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  drawer.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

// Close on outside click
document.addEventListener('click', e => {
  if (!hamburger.contains(e.target) && !drawer.contains(e.target)) {
    closeDrawer();
  }
});

// Close on escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDrawer();
});

/* ══════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════ */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

// Only run cursor on non-touch devices
if (window.matchMedia('(pointer: fine)').matches) {
  let mouseX = -200, mouseY = -200;
  let ringX  = -200, ringY  = -200;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  (function animateCursor() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateCursor);
  })();

  const hoverTargets = 'a, button, [data-tilt], [data-magnetic], input, textarea, select, .toggle-track, .svc-card, .faq-item, .who-card, .tcard, .tool-badge';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity  = '0';
    cursorRing.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity  = '1';
    cursorRing.style.opacity = '1';
  });
}

/* ══════════════════════════════════════════════
   MAGNETIC BUTTONS
══════════════════════════════════════════════ */
document.querySelectorAll('[data-magnetic]').forEach(btn => {
  let bounds;
  btn.addEventListener('mouseenter', () => {
    bounds = btn.getBoundingClientRect();
  });
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

/* ══════════════════════════════════════════════
   NAV SCROLL STYLE
══════════════════════════════════════════════ */
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 50;
  nav.style.background = scrolled
    ? (isDark ? 'rgba(7,8,14,0.97)' : 'rgba(244,243,255,0.98)')
    : (isDark ? 'rgba(7,8,14,0.72)' : 'rgba(244,243,255,0.82)');
}, { passive: true });

/* ══════════════════════════════════════════════
   PARTICLE NETWORK
══════════════════════════════════════════════ */
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
let W, H, particles, animId;
const COUNT  = 80;
const LINK   = 130;
const MOUSE_R = 150;
let mx = -9999, my = -9999;

function Particle() {
  this.x     = Math.random() * W;
  this.y     = Math.random() * H;
  this.vx    = (Math.random() - .5) * .4;
  this.vy    = (Math.random() - .5) * .4;
  this.r     = Math.random() * 1.6 + .7;
  this.alpha = Math.random() * .45 + .22;
}

function initParticles() {
  cancelAnimationFrame(animId);
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
  particles = Array.from({ length: COUNT }, () => new Particle());
  drawParticles();
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);

  // Particle–particle links
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a  = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < LINK * LINK) {
        const t = 1 - Math.sqrt(d2) / LINK;
        ctx.beginPath();
        ctx.strokeStyle = isDark
          ? `rgba(167,139,250,${t * 0.2})`
          : `rgba(108,99,255,${t * 0.13})`;
        ctx.lineWidth = .75;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // Mouse links
  particles.forEach(p => {
    const dx = p.x - mx, dy = p.y - my;
    const d  = Math.sqrt(dx * dx + dy * dy);
    if (d < MOUSE_R) {
      const t = 1 - d / MOUSE_R;
      ctx.beginPath();
      ctx.strokeStyle = isDark
        ? `rgba(108,99,255,${t * 0.48})`
        : `rgba(92,82,230,${t * 0.38})`;
      ctx.lineWidth = 1.1;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(mx, my);
      ctx.stroke();
    }
  });

  // Dots & movement
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = isDark
      ? `rgba(167,139,250,${p.alpha})`
      : `rgba(108,99,255,${p.alpha * .75})`;
    ctx.fill();

    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    // Mouse repulsion
    const rdx = p.x - mx, rdy = p.y - my;
    const rd  = Math.sqrt(rdx * rdx + rdy * rdy);
    if (rd < 95 && rd > 0) {
      const f = ((95 - rd) / 95) * 0.023;
      p.vx += (rdx / rd) * f;
      p.vy += (rdy / rd) * f;
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > 1.8) {
        p.vx = (p.vx / spd) * 1.8;
        p.vy = (p.vy / spd) * 1.8;
      }
    }
  });

  animId = requestAnimationFrame(drawParticles);
}

const heroEl = document.getElementById('hero');
heroEl.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mx = e.clientX - r.left;
  my = e.clientY - r.top;
});
heroEl.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initParticles, 150);
}, { passive: true });

initParticles();

/* ══════════════════════════════════════════════
   HERO ENTRANCE ANIMATION
══════════════════════════════════════════════ */
gsap.timeline({ delay: 0.2 })
  .fromTo('#hb',  { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .7, ease: 'power3.out' })
  .fromTo('#ht',  { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, 0.18)
  .fromTo('#hs',  { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .7, ease: 'power3.out' }, 0.34)
  .fromTo('#ha',  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .65, ease: 'power3.out' }, 0.5)
  .fromTo('#hsp', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, 0.65);

/* ══════════════════════════════════════════════
   SCROLL REVEAL ANIMATIONS
══════════════════════════════════════════════ */

// Section headers
gsap.utils.toArray('.sh').forEach(el => {
  gsap.from(el, {
    opacity: 0, y: 28, duration: .8, ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 86%', once: true }
  });
});

// About section
gsap.from('#about > div:first-child', {
  opacity: 0, x: -40, duration: .9, ease: 'power3.out',
  scrollTrigger: { trigger: '#about', start: 'top 78%', once: true }
});
gsap.from('#about .about-visual', {
  opacity: 0, x: 40, duration: .9, delay: .15, ease: 'power3.out',
  scrollTrigger: { trigger: '#about', start: 'top 78%', once: true }
});

// Service cards
gsap.utils.toArray('#services .svc-card').forEach((el, i) => {
  gsap.from(el, {
    opacity: 0, y: 45, duration: .7, delay: i * 0.09, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%', once: true }
  });
});

// Who we help cards
gsap.utils.toArray('.who-card').forEach((el, i) => {
  gsap.from(el, {
    opacity: 0, y: 30, duration: .65, delay: i * 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%', once: true }
  });
});

// Why us cards
gsap.utils.toArray('#why-us .svc-card').forEach((el, i) => {
  gsap.from(el, {
    opacity: 0, y: 35, duration: .65, delay: i * 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%', once: true }
  });
});

// Tools
gsap.from('#tools .tools-grid', {
  opacity: 0, y: 25, duration: .7, ease: 'power2.out',
  scrollTrigger: { trigger: '#tools', start: 'top 82%', once: true }
});

// Process steps
gsap.utils.toArray('.process-step').forEach((el, i) => {
  gsap.from(el, {
    opacity: 0, y: 35, duration: .7, delay: i * 0.18, ease: 'power3.out',
    scrollTrigger: { trigger: '#process', start: 'top 80%', once: true }
  });
});

// Testimonial cards
gsap.utils.toArray('.tcard').forEach((el, i) => {
  gsap.from(el, {
    opacity: 0, y: 40, duration: .7, delay: i * 0.14, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%', once: true }
  });
});

// CTA banner
gsap.from('.cta-card', {
  opacity: 0, y: 40, duration: .9, ease: 'power3.out',
  scrollTrigger: { trigger: '#cta-banner', start: 'top 80%', once: true }
});

// FAQ
gsap.utils.toArray('.faq-item').forEach((el, i) => {
  gsap.from(el, {
    opacity: 0, y: 20, duration: .55, delay: i * 0.07, ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 90%', once: true }
  });
});

// Contact
gsap.from('.contact-wrap', {
  opacity: 0, y: 40, duration: .9, ease: 'power3.out',
  scrollTrigger: { trigger: '#contact', start: 'top 80%', once: true }
});

/* ══════════════════════════════════════════════
   SERVICE CARD SPOTLIGHT (mouse gradient)
══════════════════════════════════════════════ */
document.querySelectorAll('[data-hover]').forEach(c => {
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%');
    c.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
  });
});

/* ══════════════════════════════════════════════
   FAQ ACCORDION
══════════════════════════════════════════════ */
function toggleFaq(item) {
  const isOpen = item.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  // Open clicked if it wasn't already open
  if (!isOpen) item.classList.add('open');
}

/* ══════════════════════════════════════════════
   FLOATING LABELS (contact form)
══════════════════════════════════════════════ */
document.querySelectorAll('.field-input').forEach(inp => {
  // Skip the select — it has a static label
  if (inp.tagName === 'SELECT') return;

  const w = inp.closest('.field-wrap');
  if (!w) return;

  const checkFilled = () => {
    w.classList.toggle('filled', inp.value.length > 0);
  };

  inp.addEventListener('focus',  () => w.classList.add('active'));
  inp.addEventListener('blur',   () => { w.classList.remove('active'); checkFilled(); });
  inp.addEventListener('input',  checkFilled);

  // Initialise in case of browser autofill
  checkFilled();
});

/* ══════════════════════════════════════════════
   CONTACT FORM SUBMIT
══════════════════════════════════════════════ */
function handleSubmit(e) {
  e.preventDefault();

  const btn    = e.target.querySelector('.contact-submit');
  const fname  = document.getElementById('fname').value.trim();
  const email  = document.getElementById('email').value.trim();
  const service = document.getElementById('service').value;

  // Basic validation
  if (!fname) {
    showFormError('Please enter your first name.');
    return;
  }
  if (!email || !email.includes('@')) {
    showFormError('Please enter a valid email address.');
    return;
  }

  // Submission state
  btn.textContent = 'Sending…';
  btn.style.opacity = '.65';
  btn.disabled = true;

  // Simulate submission — replace with your actual endpoint/EmailJS/Formspree
  setTimeout(() => {
    btn.textContent       = '✓ Message Sent!';
    btn.style.background  = 'linear-gradient(135deg,#34d399,#059669)';
    btn.style.boxShadow   = '0 0 40px rgba(52,211,153,.4)';
    btn.style.opacity     = '1';
    btn.disabled          = false;

    e.target.reset();
    document.querySelectorAll('.field-wrap').forEach(w => {
      w.classList.remove('filled', 'active');
    });

    // Reset button after 5 seconds
    setTimeout(() => {
      btn.textContent      = 'Send Message →';
      btn.style.background = '';
      btn.style.boxShadow  = '';
    }, 5000);

  }, 1400);
}

function showFormError(msg) {
  // Remove any existing error
  const existing = document.querySelector('.form-error-msg');
  if (existing) existing.remove();

  const err = document.createElement('p');
  err.className   = 'form-error-msg';
  err.textContent = msg;
  err.style.cssText = 'color:#f87171;font-size:.82rem;margin-top:-.4rem;margin-bottom:.4rem;grid-column:1/-1;';

  const submitRow = document.querySelector('.contact-grid .full:last-child');
  submitRow.before(err);

  setTimeout(() => err.remove(), 4000);
}

/* ══════════════════════════════════════════════
   ACTIVE NAV LINK HIGHLIGHT
══════════════════════════════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const observerOpts = { root: null, rootMargin: '-40% 0px -55% 0px', threshold: 0 };
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === '#' + entry.target.id
          ? 'var(--text)'
          : '';
      });
    }
  });
}, observerOpts);

sections.forEach(s => sectionObserver.observe(s));