/* ============================================================
   NEXUS TECH — MAIN JAVASCRIPT
============================================================ */

// ——— Loader ———
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader')?.classList.add('hidden');
  }, 900);
});

// ——— Hamburger menu ———
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('open');
});

navMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('active');
    navMenu.classList.remove('open');
  });
});

// ——— Header scroll effect ———
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (!header) return;
  header.style.background = window.scrollY > 60
    ? 'rgba(5,10,20,0.98)'
    : 'rgba(5,10,20,0.92)';
});

// ——— Smooth scroll for anchor links ———
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ——— Scroll reveal ———
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ——— Blog likes ———
document.querySelectorAll('.blog-likes').forEach(btn => {
  btn.addEventListener('click', () => {
    const countEl = btn.querySelector('.like-count');
    if (!countEl) return;
    let count = parseInt(countEl.textContent, 10);
    if (btn.classList.toggle('liked')) {
      countEl.textContent = count + 1;
    } else {
      countEl.textContent = count - 1;
    }
  });
});

// ——— Counter animation ———
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current + (el.dataset.suffix || '');
  }, 25);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.count-up').forEach(el => counterObserver.observe(el));

// ——— Particle canvas ———
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function rand(min, max) { return Math.random() * (max - min) + min; }

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      r: rand(0.5, 2.5),
      dx: rand(-0.3, 0.3),
      dy: rand(-0.3, 0.3),
      alpha: rand(0.2, 0.8),
      color: Math.random() > 0.5 ? '0,229,255' : '124,58,237'
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    // Draw lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,229,255,${0.15 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ——— Atom responds to scroll ———
(function atomScroll() {
  const atom = document.querySelector('.atom-wrap');
  if (!atom) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const scale = 1 + scrolled * 0.0003;
    const rotate = scrolled * 0.05;
    atom.style.transform = `translateY(-50%) scale(${Math.min(scale, 1.3)}) rotate(${rotate}deg)`;
  });
})();

// ——— Contact form validation & submission ———
(function formValidation() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    nombres:   { el: form.querySelector('[name="nombres"]'),   rules: ['required','uppercase'] },
    apellidos: { el: form.querySelector('[name="apellidos"]'), rules: ['required','uppercase'] },
    correo:    { el: form.querySelector('[name="correo"]'),    rules: ['required','email'] },
    telefono:  { el: form.querySelector('[name="telefono"]'),  rules: ['required','phone'] },
  };

  // Auto uppercase
  ['nombres','apellidos'].forEach(k => {
    fields[k].el?.addEventListener('input', function() {
      const pos = this.selectionStart;
      this.value = this.value.toUpperCase();
      this.setSelectionRange(pos, pos);
    });
  });

  function validate() {
    let valid = true;
    Object.entries(fields).forEach(([key, f]) => {
      if (!f.el) return;
      const val = f.el.value.trim();
      let err = '';
      if (f.rules.includes('required') && !val) err = 'Este campo es requerido.';
      else if (f.rules.includes('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) err = 'Ingresa un correo válido con @.';
      else if (f.rules.includes('phone') && !/^\d{7,15}$/.test(val)) err = 'Solo números, 7-15 dígitos.';
      const errEl = f.el.parentElement.querySelector('.error-msg');
      if (err) {
        f.el.classList.add('error');
        if (errEl) { errEl.textContent = err; errEl.style.display = 'block'; }
        valid = false;
      } else {
        f.el.classList.remove('error');
        if (errEl) errEl.style.display = 'none';
      }
    });
    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const btn = form.querySelector('.form-submit');
    const msg = form.querySelector('.form-msg');
    btn.textContent = 'ENVIANDO...'; btn.disabled = true;
    try {
      // Recoger campos del formulario como objeto plano
      const payload = {
        nombres:   (form.querySelector('[name="nombres"]')?.value   || '').trim().toUpperCase(),
        apellidos: (form.querySelector('[name="apellidos"]')?.value || '').trim().toUpperCase(),
        correo:    (form.querySelector('[name="correo"]')?.value    || '').trim().toLowerCase(),
        telefono:  (form.querySelector('[name="telefono"]')?.value  || '').trim().replace(/\D/g, ''),
        mensaje:   (form.querySelector('[name="mensaje"]')?.value   || '').trim(),
      };
      const res = await fetch('/api/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        msg.textContent = '✅ ¡Registro exitoso! Nos pondremos en contacto contigo.';
        msg.className = 'form-msg success';
        form.reset();
      } else {
        msg.textContent = data.message || '❌ Error al enviar. Intenta de nuevo.';
        msg.className = 'form-msg error';
      }
    } catch {
      msg.textContent = '❌ Error de conexión. Intenta de nuevo.';
      msg.className = 'form-msg error';
    }
    btn.textContent = 'ENVIAR MENSAJE'; btn.disabled = false;
    setTimeout(() => { msg.textContent = ''; msg.className = 'form-msg'; }, 6000);
  });
})();

// ——— Newsletter form ———
document.getElementById('newsletter-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const inp = e.target.querySelector('input');
  if (!inp.value || !inp.value.includes('@')) {
    alert('Ingresa un correo válido.'); return;
  }
  inp.value = '';
  const btn = e.target.querySelector('button');
  btn.textContent = '✓'; btn.style.background = '#34d399';
  setTimeout(() => { btn.textContent = '→'; btn.style.background = ''; }, 3000);
});
