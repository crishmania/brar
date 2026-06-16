(function () {
  'use strict';

  const header = document.getElementById('header');
  const menuBtn = document.getElementById('menuBtn');
  const navDrawer = document.getElementById('navDrawer');
  const navOverlay = document.getElementById('navOverlay');
  const backTop = document.getElementById('backTop');

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

  if (menuBtn) {
    menuBtn.addEventListener('click', toggleNav);
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeNav);
  }

  if (navDrawer) {
    navDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navDrawer && navDrawer.classList.contains('is-open')) {
      closeNav();
      menuBtn.focus();
    }
  });

  // ---- Consolidated scroll handler ----
  function onScroll() {
    const scrollY = window.scrollY;

    if (header) {
      header.classList.toggle('is-scrolled', scrollY > 20);
    }

    if (backTop) {
      backTop.classList.toggle('is-visible', scrollY > 600);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    // Hero reveals on load
    window.addEventListener('load', () => {
      document.querySelectorAll('.hero .reveal').forEach((el) => {
        setTimeout(() => el.classList.add('is-visible'), 200);
      });
    });
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
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'), 10);
            animateCounter(el, target, 1800);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => counterObserver.observe(c));
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

  // ---- Back to top ----
  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }
})();
