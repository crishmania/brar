(function () {
  'use strict';

  const header = document.getElementById('header');
  const menuBtn = document.getElementById('menuBtn');
  const navDrawer = document.getElementById('navDrawer');
  const navOverlay = document.getElementById('navOverlay');
  const backTop = document.getElementById('backTop');
  const hero = document.getElementById('hero');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Mobile navigation ----
  function openNav() {
    if (!menuBtn || !navDrawer || !navOverlay) return;
    menuBtn.classList.add('is-active');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close menu');
    navDrawer.classList.add('is-open');
    navOverlay.classList.add('is-visible');
    navOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
  }

  function closeNav() {
    if (!menuBtn || !navDrawer || !navOverlay) return;
    menuBtn.classList.remove('is-active');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    navDrawer.classList.remove('is-open');
    navOverlay.classList.remove('is-visible');
    navOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
  }

  function toggleNav() {
    if (navDrawer.classList.contains('is-open')) {
      closeNav();
    } else {
      openNav();
    }
  }

  if (menuBtn) menuBtn.addEventListener('click', toggleNav);
  if (navOverlay) navOverlay.addEventListener('click', closeNav);
  if (navDrawer) {
    navDrawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navDrawer && navDrawer.classList.contains('is-open')) {
      closeNav();
      menuBtn.focus();
    }
  });

  // ---- Header ----
  function updateHeader() {
    const scrollY = window.scrollY;
    const heroBottom = hero ? hero.offsetHeight - 100 : 0;

    if (header) {
      header.classList.toggle('is-scrolled', scrollY > 20);
      header.classList.toggle('site-header--on-hero', scrollY < heroBottom);
    }
    if (backTop) {
      backTop.classList.toggle('is-visible', scrollY > 600);
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // ---- Hero slider ----
  function initHeroSlider() {
    const slider = document.getElementById('heroSlider');
    if (!slider) return;

    const slides = slider.querySelectorAll('.hero__slide');
    if (slides.length < 2) return;

    let current = 0;
    let timer = null;
    const interval = 5000;

    function goTo(index) {
      if (index === current) return;
      const prev = slides[current];
      prev.classList.remove('is-active');
      prev.classList.add('is-exiting');
      setTimeout(() => prev.classList.remove('is-exiting'), 1000);

      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
    }

    function next() {
      goTo(current + 1);
    }

    function start() {
      if (prefersReducedMotion) return;
      stop();
      timer = setInterval(next, interval);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  initHeroSlider();

  // ---- Energy particle canvas ----
  function initEnergyCanvas() {
    const canvas = document.getElementById('energyCanvas');
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles = [];
    let w = 0;
    let h = 0;
    let animId = null;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = Math.floor(rect.width);
      h = canvas.height = Math.floor(rect.height);
    }

    function createParticles() {
      const count = Math.min(72, Math.floor(w / 22));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 1,
        a: Math.random() * 0.35 + 0.45,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 180, 80, ${p.a})`;
        ctx.shadowColor = 'rgba(242, 124, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(255, 160, 60, ${0.28 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }

  initEnergyCanvas();

  // ---- Video facade (lazy Vimeo) ----
  function initVideoFacade() {
    const facade = document.getElementById('videoFacade');
    const embed = document.getElementById('videoEmbed');
    const frame = document.getElementById('vimeoFrame');
    if (!facade || !embed || !frame) return;

    function playVideo() {
      const src = frame.getAttribute('data-src');
      if (src) frame.setAttribute('src', src);
      facade.hidden = true;
      embed.hidden = false;
    }

    facade.addEventListener('click', playVideo);
    facade.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playVideo();
      }
    });
  }

  initVideoFacade();

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // ---- Counter animation ----
  function animateCounter(el, target, duration) {
    const countEl = el.querySelector('.metric__count');
    if (!countEl) return;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      countEl.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (!prefersReducedMotion) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            animateCounter(el, parseInt(el.getAttribute('data-count'), 10), 1800);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('[data-count]').forEach((c) => counterObserver.observe(c));
  } else {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const countEl = el.querySelector('.metric__count');
      const target = el.getAttribute('data-count');
      if (countEl && target) countEl.textContent = target;
    });
  }

  // ---- Smooth scroll ----
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        closeNav();
        const offset = header ? header.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }
})();
