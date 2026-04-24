/* ════════════════════════════════════════════
   main.js – Network Engineer Portfolio
   Vanilla JS, no dependencies
════════════════════════════════════════════ */

'use strict';

// ─── CANVAS NETWORK ANIMATION ────────────────────────────────
(function initCanvas() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, nodes, packets, animId;

  const CONFIG = {
    nodeCount:    55,
    nodeRadius:   2.5,
    maxDist:      160,
    nodeColor:    'rgba(6,182,212,',
    edgeColor:    'rgba(6,182,212,',
    packetColor:  '#06b6d4',
    packetSize:   3,
    speed:        0.28,
    packetSpeed:  0.008,
    spawnInterval: 1200,
  };

  function resize() {
    width  = canvas.width  = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function createNodes() {
    nodes = Array.from({ length: CONFIG.nodeCount }, () => ({
      x:   Math.random() * width,
      y:   Math.random() * height,
      vx:  (Math.random() - .5) * CONFIG.speed,
      vy:  (Math.random() - .5) * CONFIG.speed,
      opacity: .3 + Math.random() * .5,
    }));
  }

  function createPacket() {
    // pick a random edge to travel along
    const n1 = nodes[Math.floor(Math.random() * nodes.length)];
    const n2 = nodes[Math.floor(Math.random() * nodes.length)];
    if (n1 === n2) return;
    const dx = n2.x - n1.x, dy = n2.y - n1.y;
    if (Math.hypot(dx, dy) > CONFIG.maxDist) return;
    packets.push({ n1, n2, t: 0 });
  }

  function update() {
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width)  n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });
    packets = packets.filter(p => {
      p.t += CONFIG.packetSpeed;
      return p.t <= 1;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONFIG.maxDist) {
          const alpha = (1 - dist / CONFIG.maxDist) * 0.22;
          ctx.beginPath();
          ctx.strokeStyle = CONFIG.edgeColor + alpha + ')';
          ctx.lineWidth = .8;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, CONFIG.nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.nodeColor + n.opacity + ')';
      ctx.fill();
    });

    // packets
    packets.forEach(p => {
      const x = p.n1.x + (p.n2.x - p.n1.x) * p.t;
      const y = p.n1.y + (p.n2.y - p.n1.y) * p.t;
      ctx.beginPath();
      ctx.arc(x, y, CONFIG.packetSize, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.packetColor;
      ctx.shadowColor = CONFIG.packetColor;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  packets = [];
  resize();
  createNodes();
  loop();

  const packetTimer = setInterval(createPacket, CONFIG.spawnInterval);

  // Resize handler with debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animId);
      resize();
      createNodes();
      packets = [];
      loop();
    }, 200);
  });

  // Pause animation when tab hidden (performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
      clearInterval(packetTimer);
    } else {
      loop();
    }
  });
}());


// ─── NAVBAR SCROLL ────────────────────────────────────────────
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}());


// ─── MOBILE MENU ──────────────────────────────────────────────
(function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Zamknij menu' : 'Otwórz menu');
  });

  // Close menu on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on outside click
  const navbarEl = document.getElementById('navbar');
  document.addEventListener('click', e => {
    if (navbarEl && !navbarEl.contains(e.target)) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}());


// ─── ACTIVE NAV LINK ON SCROLL ────────────────────────────────
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  function setActive() {
    const scrollPos = window.scrollY + 100;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollPos >= top && scrollPos < bottom);
      }
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
}());


// ─── REVEAL ON SCROLL ─────────────────────────────────────────
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger delay for sibling elements
          const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
          const index    = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = (index * 80) + 'ms';
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach(el => observer.observe(el));
}());


// ─── COUNTER ANIMATION ────────────────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const dur    = 1600;
        const start  = performance.now();

        function tick(now) {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / dur, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}());


// ─── CONTACT FORM ─────────────────────────────────────────────
(function initContactForm() {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validate(field) {
    const error = field.closest('.form-group').querySelector('.field-error');
    let msg = '';

    if (!field.value.trim()) {
      msg = 'To pole jest wymagane.';
    } else if (field.type === 'email' && !EMAIL_RE.test(field.value.trim())) {
      msg = 'Podaj poprawny adres e-mail.';
    }

    field.classList.toggle('invalid', !!msg);
    if (error) error.textContent = msg;
    return !msg;
  }

  // Live validation on blur
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => validate(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) validate(field);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const fields = Array.from(form.querySelectorAll('input[required], textarea[required]'));
    const valid  = fields.map(f => validate(f)).every(Boolean);
    if (!valid) return;

    const btn = form.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = 'Wysyłanie…';

    // Simulate form submission (replace with real backend / FormSpree endpoint)
    setTimeout(() => {
      status.textContent = '✓ Wiadomość wysłana! Odpiszę w ciągu 24 godzin.';
      status.className   = 'form-status success';
      form.reset();
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        Wyślij wiadomość`;

      setTimeout(() => { status.className = 'form-status'; }, 6000);
    }, 900);
  });
}());
