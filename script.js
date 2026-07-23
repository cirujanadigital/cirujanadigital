/**
 * ==========================================
 * CIRUJANA DIGITAL — script.js
 * ==========================================
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     UTILIDADES
  ══════════════════════════════════════════════ */
  const debounce = (fn, ms) => {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  };

  /* ══════════════════════════════════════════════
     PARTICLE CANVAS
  ══════════════════════════════════════════════ */
  class ParticleCanvas {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
      this.particles = [];
      this.mouse = { x: null, y: null, radius: 150 };
      this.animationId = null;
      this.isActive = false;
      this.logicalWidth = 0;
      this.logicalHeight = 0;
      this.boundAnimate = this.animate.bind(this);

      this.resize();
      this.init();
      this.startAnimation();

      window.addEventListener(
        'resize',
        debounce(() => {
          this.resize();
          this.init();
        }, 250),
        { passive: true }
      );

      /* FIX responsive: throttle con rAF + coords relativas al canvas */
      let mouseThrottle = false;
      this.canvas.addEventListener(
        'mousemove',
        (e) => {
          if (!mouseThrottle) {
            mouseThrottle = true;
            requestAnimationFrame(() => {
              const rect = this.canvas.getBoundingClientRect();
              this.mouse.x = e.clientX - rect.left;
              this.mouse.y = e.clientY - rect.top;
              mouseThrottle = false;
            });
          }
        },
        { passive: true }
      );

      /* FIX: mouseleave resetea mouse para no quedar "congelado" */
      this.canvas.addEventListener(
        'mouseleave',
        () => {
          this.mouse.x = null;
          this.mouse.y = null;
        },
        { passive: true }
      );

      document.addEventListener('visibilitychange', () => {
        document.hidden ? this.stopAnimation() : this.startAnimation();
      });
    }

    /* FIX responsive: el canvas usa el tamaño del HERO, no window.innerWidth.
       Esto evita que el canvas desborde cuando hay barras de scroll, zoom de DevTools
       o viewports donde innerWidth != ancho real del contenedor. */
    resize() {
      const dpr = window.devicePixelRatio || 1;
      const parent = this.canvas.parentElement;
      const w = parent ? parent.offsetWidth : window.innerWidth;
      const h = parent ? parent.offsetHeight : window.innerHeight;

      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';

      /* FIX: resetear transformación antes de escalar para evitar acumulación */
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);

      this.logicalWidth = w;
      this.logicalHeight = h;
    }

    init() {
      this.particles = [];
      const isMobile = this.logicalWidth < 768;
      const maxParticles = isMobile ? 40 : 80;
      const n = Math.min(
        Math.floor((this.logicalWidth * this.logicalHeight) / 15000),
        maxParticles
      );
      for (let i = 0; i < n; i++) {
        this.particles.push({
          x: Math.random() * this.logicalWidth,
          y: Math.random() * this.logicalHeight,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
        });
      }
    }

    drawParticles() {
      this.ctx.fillStyle = 'rgba(0, 167, 169, 0.5)';
      this.particles.forEach((p) => {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }

    /* FIX: stroke solo si hay líneas — no gastar GPU en paths vacíos */
    connectParticles() {
      const maxDist2 = 120 * 120;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      let hasLines = false;
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < Math.min(i + 5, this.particles.length); j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < maxDist2) {
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            hasLines = true;
          }
        }
      }
      if (hasLines) {
        this.ctx.strokeStyle = 'rgba(0, 167, 169, 0.2)';
        this.ctx.stroke();
      }
    }

    /* FIX: !== null en lugar de truthy — evita fallo cuando mouse está en x=0 o y=0 */
    updateParticles() {
      this.particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (this.mouse.x !== null && this.mouse.y !== null) {
          const dx = this.mouse.x - p.x;
          const dy = this.mouse.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < this.mouse.radius) {
            const force = (this.mouse.radius - distance) / this.mouse.radius;
            const angle = Math.atan2(dy, dx);
            p.x -= Math.cos(angle) * force * 2;
            p.y -= Math.sin(angle) * force * 2;
          }
        }
        if (p.x < 0 || p.x > this.logicalWidth) p.speedX *= -1;
        if (p.y < 0 || p.y > this.logicalHeight) p.speedY *= -1;
      });
    }

    animate() {
      if (!this.isActive) return;
      this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
      this.drawParticles();
      this.connectParticles();
      this.updateParticles();
      this.animationId = requestAnimationFrame(this.boundAnimate);
    }

    startAnimation() {
      if (!this.isActive) {
        this.isActive = true;
        this.boundAnimate();
      }
    }

    stopAnimation() {
      this.isActive = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    destroy() {
      this.stopAnimation();
    }
  }

  /* ══════════════════════════════════════════════
     NAVBAR
  ══════════════════════════════════════════════ */
  const navbar = document.getElementById('navbar');


  /* ══════════════════════════════════════════════
     SCROLL UNIFICADO — un solo listener, una sola
     variable ticking para navbar + scroll-top btn
  ══════════════════════════════════════════════ */
  const scrollBtn = document.getElementById('scrollTopBtn');
  let ticking = false;

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          navbar?.classList.toggle('scrolled', scrollY > 50);
          scrollBtn?.classList.toggle('visible', scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ══════════════════════════════════════════════
     KEYDOWN GLOBAL — Escape cierra navbar y PDF modal
  ══════════════════════════════════════════════ */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (navMenu?.classList.contains('active')) closeMenu();
      const pdfOverlay = document.getElementById('pdfOverlay');
      if (pdfOverlay?.classList.contains('visible')) pdfOverlay.classList.remove('visible');
    }
  });

  /* ══════════════════════════════════════════════
     SMOOTH SCROLL
  ══════════════════════════════════════════════ */
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      if (navMenu?.classList.contains('active')) closeMenu();
      const target = document.querySelector(href);
      if (target) {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - 80,
            behavior: 'smooth',
          });
        });
      }
    },
    false
  );

  /* ══════════════════════════════════════════════
     PORTFOLIO SERVICE CONTENT — siempre visible
  ══════════════════════════════════════════════ */
  document.querySelectorAll('.portfolio-card .service-content').forEach((c) => {
    c.style.maxHeight = 'none';
    c.style.overflow = 'visible';
  });

  /* ══════════════════════════════════════════════
     SCROLL ANIMATIONS
  ══════════════════════════════════════════════ */
  const initScrollAnimations = () => {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const delay = parseInt(e.target.dataset.delay) || 0;
          if (delay > 0) setTimeout(() => e.target.classList.add('animated'), delay);
          else e.target.classList.add('animated');
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    const observe = () =>
      document.querySelectorAll('[data-animate]').forEach((el) => obs.observe(el));
    'requestIdleCallback' in window ? requestIdleCallback(observe) : setTimeout(observe, 100);
  };

  /* ══════════════════════════════════════════════
     LAZY IMAGES
  ══════════════════════════════════════════════ */
  const initLazyImages = () => {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const img = e.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        });
      },
      { rootMargin: '50px 0px', threshold: 0.01 }
    );
    document.querySelectorAll('img[data-src]').forEach((img) => obs.observe(img));
  };

  /* ══════════════════════════════════════════════
     ANALYTICS
  ══════════════════════════════════════════════ */
  const initAnalytics = () => {
    document
      .querySelectorAll(
        '.btn, .service-cta, .pricing-card__cta, .pkg-cta, .contact-cro__wa-btn, .contact-cro__cal-btn'
      )
      .forEach((btn) => {
        btn.addEventListener(
          'click',
          function () {
            if (typeof gtag !== 'undefined') {
              gtag('event', 'cta_click', {
                event_category: 'engagement',
                event_label: this.textContent.trim().slice(0, 50),
              });
            }
          },
          { passive: true }
        );
      });

    const depths = [25, 50, 75, 100];
    const reached = [];
    window.addEventListener(
      'scroll',
      debounce(() => {
        const pct =
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        depths.forEach((d) => {
          if (pct >= d && !reached.includes(d)) {
            reached.push(d);
            if (typeof gtag !== 'undefined')
              gtag('event', 'scroll_depth', { event_category: 'engagement', event_label: d + '%' });
          }
        });
      }, 500),
      { passive: true }
    );
  };

  /* ══════════════════════════════════════════════
     PARTICLES — lazy, no bloquea TBT
     particleInstance en scope del IIFE padre
     para que beforeunload pueda destruirla
  ══════════════════════════════════════════════ */
  let particleInstance = null;

  (function () {
    let particleLoaded = false;
    function loadParticles() {
      if (particleLoaded) return;
      particleLoaded = true;
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const canvas = document.getElementById('particleCanvas');
        if (canvas) particleInstance = new ParticleCanvas(canvas);
      }
    }
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mousemove', loadParticles, { once: true, passive: true });
      hero.addEventListener('touchstart', loadParticles, { once: true, passive: true });
    }
'requestIdleCallback' in window
? requestIdleCallback(loadParticles, { timeout: 15000 })
  : setTimeout(loadParticles, 15000);
  })();

  /* ══════════════════════════════════════════════
     UI HELPERS — Sticky CTA + scroll CSS
     scrollBtn ya tiene su listener unificado arriba
  ══════════════════════════════════════════════ */
  const initUIHelpers = () => {
    /* Smooth scroll vía CSS, post-carga para no penalizar LCP */
    document.documentElement.style.scrollBehavior = 'smooth';

    /* Sticky CTA: ocultar cuando el hero es visible */
    const hero = document.querySelector('.hero');
    const sticky = document.getElementById('stickyCta');
    if (hero && sticky) {
      new IntersectionObserver(
        (entries) => {
          const isVisible = entries[0].isIntersecting;
          stickyCta.toggleAttribute('inert', !isVisible);
          sticky.setAttribute('aria-hidden', isVisible);
          sticky.style.display = isVisible ? 'none' : '';
        },
        { threshold: 0.05 }
      ).observe(hero);
    }
  };

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  const initNonCritical = () => {
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    initUIHelpers();
    initScrollAnimations();
    initLazyImages();
    initAnalytics();
  };

  const run = () => {
    document.body.classList.add('loaded');
    'requestIdleCallback' in window
      ? requestIdleCallback(initNonCritical, { timeout: 2000 })
      : setTimeout(initNonCritical, 100);
  };

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', run) : run();

  /* UN SOLO beforeunload — particleInstance vive en este scope */
  window.addEventListener('beforeunload', () => {
    if (particleInstance) particleInstance.destroy();
  });
})(); /* ← CIERRE DEL IIFE EXTERNO — único 'use strict' del archivo */


/* ══════════════════════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════════════════════ */
(function () {
  var form = document.getElementById('contactForm');
  var success = document.getElementById('contactSuccess');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var phone = form.querySelector('#contact-phone');
    var message = form.querySelector('#contact-message');

    if (!phone || !phone.value.trim()) {
      phone.focus();
      phone.style.borderColor = '#dc2626';
      return;
    }
    if (!message || !message.value.trim()) {
      message.focus();
      message.style.borderColor = '#dc2626';
      return;
    }
    [phone, message].forEach(function (el) {
      el.style.borderColor = '';
    });

    var btn = form.querySelector('button[type=submit]');
    var originalText = btn.textContent;
    btn.textContent = 'Enviando…';
    btn.disabled = true;

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then(function (r) {
        if (r.ok) {
          form.reset();
          if (success) {
            success.style.display = 'block';
            success.classList.add('visible');
          }
          btn.textContent = '✓ Enviado';
        } else {
          btn.textContent = originalText;
          btn.disabled = false;
          alert('Error al enviar. Por favor, escribinos directamente a info@cirujanadigital.com');
        }
      })
      .catch(function () {
        btn.textContent = originalText;
        btn.disabled = false;
        alert('Error de conexión. Por favor, escribinos por WhatsApp o email.');
      });
  });
})();

