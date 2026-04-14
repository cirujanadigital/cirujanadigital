/**
 * ==========================================
 * CIRUJANA DIGITAL — script.js
 * Performance-optimized · TBT < 50ms
 * 'use strict' una sola vez · IIFE cierra al final
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
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');

  function closeMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    const open = hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    navOverlay.classList.toggle('active');
    document.body.style.overflow = open ? 'hidden' : '';
    hamburger.setAttribute('aria-expanded', String(open));
  }

  if (hamburger && navMenu && navOverlay) {
    hamburger.addEventListener('click', toggleMenu, { passive: true });
    navOverlay.addEventListener('click', closeMenu, { passive: true });
  }

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
    setTimeout(loadParticles, 5000);
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
   ROI CALCULATOR
══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const els = {
    currency: document.getElementById('roi-currency'),
    patients: document.getElementById('roi-patients'),
    ticket: document.getElementById('roi-ticket'),
    patientsVal: document.getElementById('roiPatientsVal'),
    ticketVal: document.getElementById('roiTicketVal'),
    currencyLabel: document.getElementById('roiCurrencyLabel'),
    recovery: document.getElementById('roiRecovery'),
    annual: document.getElementById('roiAnnual'),
    net: document.getElementById('roiNet'),
    note: document.getElementById('roiNote'),
    canvas: document.getElementById('roiChart'),
    ctaNumber: document.getElementById('roiCtaNumber'),
    ctaSubtitle: document.getElementById('roiCtaSubtitle'),
    waBtn: document.getElementById('roiWaBtn'),
    servicePills: document.querySelectorAll('.service-pill'),
  };

  if (!els.currency) return;

  const state = { symbol: '$', name: 'USD', tc: 1, patients: 3, ticket: 100, service: 400 };

  function fmt(n, sym) {
    return sym + Math.round(n).toLocaleString('es-AR');
  }

  function getCurrencyMeta() {
    const opt = els.currency.options[els.currency.selectedIndex];
    return {
      symbol: opt.dataset.symbol || '$',
      name: opt.dataset.name || 'USD',
      tc: parseFloat(opt.dataset.tc) || 1,
      min: parseInt(opt.dataset.min) || 50,
      max: parseInt(opt.dataset.max) || 500,
      step: parseInt(opt.dataset.step) || 10,
      def: parseInt(opt.dataset.default) || 100,
    };
  }

  function syncSliderRange(meta) {
    els.ticket.min = meta.min;
    els.ticket.max = meta.max;
    els.ticket.step = meta.step;
    els.ticket.value = meta.def;
    state.ticket = meta.def;
    if (els.currencyLabel) els.currencyLabel.textContent = meta.name;
  }

  /* ── Canvas chart ── */
  let _cachedCanvasW = 0;

  function drawChart(invLocal, monthly) {
    const canvas = els.canvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = _cachedCanvasW || 700;
    const H = 200;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const P = { t: 24, r: 20, b: 38, l: 14 };
    const CW = W - P.l - P.r;
    const CH = H - P.t - P.b;
    const MONTHS = 12;
    const maxVal = Math.max(monthly * MONTHS, invLocal) * 1.12;
    const xOf = (m) => P.l + (m / MONTHS) * CW;
    const yOf = (v) => P.t + CH - Math.min(v / maxVal, 1) * CH;

    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach((f) => {
      const y = P.t + CH * (1 - f);
      ctx.beginPath();
      ctx.moveTo(P.l, y);
      ctx.lineTo(P.l + CW, y);
      ctx.stroke();
    });

    const invY = yOf(invLocal);
    if (invY >= P.t && invY <= P.t + CH) {
      ctx.strokeStyle = 'rgba(248,81,73,.65)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(P.l, invY);
      ctx.lineTo(P.l + CW, invY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '600 10px -apple-system,sans-serif';
      ctx.fillStyle = 'rgba(248,81,73,.8)';
      ctx.textAlign = 'right';
      ctx.fillText('Inversión', P.l + CW - 2, invY - 5);
    }

    const grad = ctx.createLinearGradient(0, P.t, 0, P.t + CH);
    grad.addColorStop(0, 'rgba(0,167,169,.3)');
    grad.addColorStop(1, 'rgba(0,167,169,.02)');
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(0));
    for (let m = 1; m <= MONTHS; m++) ctx.lineTo(xOf(m), yOf(monthly * m));
    ctx.lineTo(xOf(MONTHS), P.t + CH);
    ctx.lineTo(xOf(0), P.t + CH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = '#00a7a9';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(0));
    for (let m = 1; m <= MONTHS; m++) ctx.lineTo(xOf(m), yOf(monthly * m));
    ctx.stroke();

    const breakMonth = monthly > 0 ? invLocal / monthly : Infinity;
    if (breakMonth <= MONTHS && breakMonth > 0) {
      const bx = xOf(breakMonth),
        by = yOf(invLocal);
      ctx.strokeStyle = 'rgba(255,255,255,.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, P.t + CH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(bx, by, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#00a7a9';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '700 10px -apple-system,sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('mes ' + Math.ceil(breakMonth), bx, P.t + CH + 16);
    }

    ctx.font = '400 10px -apple-system,sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    ctx.textAlign = 'center';
    [1, 3, 6, 9, 12].forEach((m) =>
      ctx.fillText(m === 12 ? 'mes 12' : 'm' + m, xOf(m), P.t + CH + 28)
    );
  }

  /* ── CTA personalizado ── */
  function updateCTA({ sym, patients, ticket, breakEven, monthsToROI }) {
    const serviceNames = {
      250: 'Landing Page ($250 USD)',
      400: 'Pack Presencia ($400 USD)',
      750: 'Sitio Corporativo ($750 USD)',
    };
    const serviceNameShort =
      state.service === 250
        ? 'Landing Page'
        : state.service === 750
          ? 'Sitio Corporativo'
          : 'Pack Presencia';

    if (els.ctaNumber) {
      els.ctaNumber.innerHTML =
        `Con <strong>${fmt(ticket, sym)}</strong> de ticket y <strong>${patients} paciente${patients !== 1 ? 's' : ''}</strong> nuevos por mes, ` +
        `el ${serviceNameShort} se amortiza en <strong>${breakEven} consulta${breakEven !== 1 ? 's' : ''}</strong>.`;
    }
    if (els.ctaSubtitle) {
      els.ctaSubtitle.textContent =
        monthsToROI <= 1
          ? 'En el primer mes ya estás en ganancia.'
          : `Recuperás la inversión en ${monthsToROI} mes${monthsToROI !== 1 ? 'es' : ''}. Después es ganancia pura.`;
    }

    const annualVal = fmt(patients * ticket * 12, sym);
    const monthsText = monthsToROI <= 1 ? '1 mes' : `${monthsToROI} meses`;
    const msg = encodeURIComponent(
      `Hola, calculé mi ROI con la calculadora: eligiendo ${serviceNames[state.service]}, ` +
        `recupero la inversión en ${monthsText} y el ingreso anual desde la web sería de ${annualVal}. Quiero avanzar.`
    );
    if (els.waBtn) els.waBtn.href = `https://wa.me/5491176199680?text=${msg}`;
  }

  /* ── gtag debounceado ── */
  const trackROI = (function () {
    let t;
    return function (label) {
      clearTimeout(t);
      t = setTimeout(() => {
        if (typeof gtag !== 'undefined')
          gtag('event', 'roi_calc_update', { event_category: 'engagement', event_label: label });
      }, 800);
    };
  })();

  /* ── Update principal ── */
  function updateROI(fromUser) {
    const { symbol: sym, name, tc, patients, ticket, service } = state;
    const invLocal = service * tc;
    const monthly = patients * ticket;
    const annual = monthly * 12;
    const netROI = annual - invLocal;
    const breakEven = monthly > 0 ? Math.ceil(invLocal / ticket) : 0;
    const monthsToROI = monthly > 0 ? Math.ceil(invLocal / monthly) : 999;
    const months = monthly > 0 ? (invLocal / monthly).toFixed(1) : '∞';

    if (els.patientsVal)
      els.patientsVal.textContent = patients + ' paciente' + (patients === 1 ? '' : 's');
    if (els.ticketVal) els.ticketVal.textContent = fmt(ticket, sym);
    if (els.recovery) els.recovery.textContent = months + ' meses';
    if (els.annual) els.annual.textContent = fmt(annual, sym);
    if (els.net) els.net.textContent = fmt(netROI, sym);

    if (els.note) {
      els.note.textContent =
        `${patients} paciente${patients !== 1 ? 's' : ''}/mes × ${fmt(ticket, sym)} = ` +
        `${fmt(annual, sym)}/año. Inversión $${service} USD. ROI neto: ${fmt(netROI, sym)} el primer año.`;
    }

    requestAnimationFrame(() => drawChart(invLocal, monthly));
    updateCTA({ sym, name, patients, ticket, invLocal, monthly, breakEven, monthsToROI });
    if (fromUser) trackROI(`${name}_${patients}p_${service}usd`);
  }

  /* ── PDF Generator (usado en página separada) ── */
  function generatePDF() {
    const { symbol: sym, name, tc, patients, ticket, service } = state;
    const invLocal = service * tc;
    const monthly = patients * ticket;
    const annual = monthly * 12;
    const netROI = annual - invLocal;
    const breakEven = monthly > 0 ? Math.ceil(invLocal / ticket) : 0;
    const monthsToROI = monthly > 0 ? Math.ceil(invLocal / monthly) : 999;
    const preview = document.getElementById('pdfPreview');
    if (!preview) return;
    const ctx = preview.getContext('2d');

    /* Polyfill roundRect para Safari < 15.4 */
    function roundRect(ctx, x, y, w, h, r) {
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }
    }

    const W = 480,
      H = 320;
    const dpr = window.devicePixelRatio || 1;
    preview.width = W * dpr;
    preview.height = H * dpr;
    preview.style.width = W + 'px';
    preview.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0d1b2a');
    bg.addColorStop(1, '#03658c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,167,169,.15)';
    ctx.fillRect(0, 0, W, 56);
    ctx.fillStyle = '#00a7a9';
    ctx.font = '700 11px -apple-system,sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CIRUJANA DIGITAL', 28, 22);
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.font = '400 10px -apple-system,sans-serif';
    ctx.fillText('Cálculo de ROI · cirujanadigital.com', 28, 40);
    ctx.textAlign = 'right';
    ctx.fillText(new Date().toLocaleDateString('es-AR'), W - 28, 40);
    ctx.fillStyle = '#fff';
    ctx.font = '600 16px -apple-system,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Tu inversión se recupera en ' + monthsToROI + ' mes' + (monthsToROI !== 1 ? 'es' : ''),
      W / 2,
      88
    );
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.font = '400 11px -apple-system,sans-serif';
    ctx.fillText(
      'Basado en ' +
        patients +
        ' paciente' +
        (patients !== 1 ? 's' : '') +
        ' nuevos/mes × ' +
        fmt(ticket, sym) +
        ' ' +
        name +
        ' de ticket',
      W / 2,
      108
    );

    [
      { label: 'Ingreso anual', val: fmt(annual, sym) },
      { label: 'ROI neto año 1', val: fmt(netROI, sym) },
      { label: 'Break-even', val: breakEven + ' consultas' },
    ].forEach((c, i) => {
      const cx = 60 + i * 130;
      ctx.fillStyle = 'rgba(255,255,255,.07)';
      ctx.beginPath();
      roundRect(ctx, cx - 50, 124, 110, 72, 8);
      ctx.fill();
      ctx.fillStyle = '#7fdbff';
      ctx.font = '700 13px -apple-system,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.val, cx + 5, 152);
      ctx.fillStyle = 'rgba(255,255,255,.45)';
      ctx.font = '400 9px -apple-system,sans-serif';
      ctx.fillText(c.label.toUpperCase(), cx + 5, 168);
    });

    ctx.fillStyle = 'rgba(0,167,169,.25)';
    ctx.beginPath();
    roundRect(ctx, 64, 214, W - 128, 44, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '600 12px -apple-system,sans-serif';
    ctx.textAlign = 'center';
    const sName =
      service === 250
        ? 'Landing Page Médica'
        : service === 750
          ? 'Sitio Corporativo'
          : 'Pack Presencia Digital';
    ctx.fillText(sName + ' — $' + service + ' USD', W / 2, 234);
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    ctx.font = '400 9px -apple-system,sans-serif';
    ctx.fillText('cirujanadigital.com · info@cirujanadigital.com · @cirujanadigital', W / 2, 300);

    const link = document.createElement('a');
    link.download = 'ROI-CirujanaDigital.png';
    link.href = preview.toDataURL('image/png');
    link.click();
  }

  /* ── Event Listeners ── */
  els.currency.addEventListener('change', function () {
    const meta = getCurrencyMeta();
    state.symbol = meta.symbol;
    state.name = meta.name;
    state.tc = meta.tc;
    syncSliderRange(meta);
    updateROI(true);
  });

  if (els.patients)
    els.patients.addEventListener('input', function () {
      state.patients = parseInt(this.value) || 1;
      updateROI(true);
    });

  if (els.ticket)
    els.ticket.addEventListener('input', function () {
      state.ticket = parseInt(this.value) || state.ticket;
      updateROI(true);
    });

  els.servicePills.forEach((pill) => {
    pill.addEventListener('click', function () {
      els.servicePills.forEach((p) => {
        p.classList.remove('active');
        p.setAttribute('aria-pressed', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-pressed', 'true');
      state.service = parseInt(this.dataset.val) || 400;
      updateROI(true);
    });
  });

  /* PDF modal (elementos opcionales — solo en páginas que los tienen) */
  const pdfBtn = document.getElementById('roiPdfBtn');
  const pdfOverlay = document.getElementById('pdfOverlay');
  const pdfClose = document.getElementById('pdfModalClose');
  const pdfDl = document.getElementById('pdfDownloadBtn');

  if (pdfBtn && pdfOverlay) {
    pdfBtn.addEventListener('click', function () {
      pdfOverlay.classList.add('visible');
      requestAnimationFrame(generatePDF);
    });
    if (pdfClose) pdfClose.addEventListener('click', () => pdfOverlay.classList.remove('visible'));
    pdfOverlay.addEventListener('click', (e) => {
      if (e.target === pdfOverlay) pdfOverlay.classList.remove('visible');
    });
    if (pdfDl) pdfDl.addEventListener('click', generatePDF);
  }

  /* ResizeObserver — lee del entry, no del DOM */
  if (els.canvas && 'ResizeObserver' in window) {
    let resizeTimer;
    new ResizeObserver((entries) => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const entry = entries[0];
        _cachedCanvasW = Math.round(entry.contentRect.width) || 700;
        drawChart(state.service * state.tc, state.patients * state.ticket);
      }, 150);
    }).observe(els.canvas);
  }

  /* Tabs auditoría (si existen) */
  document.querySelectorAll('.audit-tab').forEach((tab) => {
    tab.addEventListener('click', function () {
      const target = this.dataset.tab;
      document.querySelectorAll('.audit-tab').forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.audit-tab-panel').forEach((p) => p.classList.remove('active'));
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      const panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('active');
    });
  });

  /* FIX carga segura: rAF garantiza offsetWidth > 0 */
  function initROIWhenReady() {
    const meta = getCurrencyMeta();
    if (els.currencyLabel) els.currencyLabel.textContent = meta.name;
    requestAnimationFrame(() => {
      _cachedCanvasW = (els.canvas && els.canvas.offsetWidth) || 700;
      updateROI();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initROIWhenReady);
  } else {
    initROIWhenReady();
  }
})();

/* ══════════════════════════════════════════════════════════════
   LEAD MAGNET FORM
══════════════════════════════════════════════════════════════ */
(function () {
  var form = document.getElementById('lmForm');
  var success = document.getElementById('lmSuccess');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = document.getElementById('lm-email').value.trim();
    if (!email || !email.includes('@')) {
      document.getElementById('lm-email').focus();
      return;
    }

    var btn = form.querySelector('button[type=submit]');
    btn.textContent = 'Enviando…';
    btn.disabled = true;

    fetch('https://formspree.io/f/mzdvdegw', {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then(function (r) {
        if (r.ok) {
          form.style.display = 'none';
          success.classList.add('visible');
          window.open('/recursos/los-5-errores.html', '_blank');
          if (typeof gtag !== 'undefined')
            gtag('event', 'lead_magnet_submit', {
              event_category: 'conversion',
              event_label: 'guia-5-errores',
            });
        } else {
          btn.textContent = 'Quiero el PDF gratis →';
          btn.disabled = false;
          alert('Error al enviar. Escribime directamente a info@cirujanadigital.com');
        }
      })
      .catch(function () {
        btn.textContent = 'Quiero el PDF gratis →';
        btn.disabled = false;
        alert('Error de conexión. Escribime por WhatsApp.');
      });
  });
})();

/* ══════════════════════════════════════════════════════════════
   CHECKLIST QUIZ
══════════════════════════════════════════════════════════════ */
(function () {
  const TOTAL = 9;
  let score = 0;
  let current = 1;
  const bar = document.getElementById('checklistBar');
  const result = document.getElementById('checklist-result');
  const scoreEl = document.getElementById('checklistScore');
  const verdict = document.getElementById('checklistVerdict');
  const ctaEl = document.getElementById('checklistCTA');
  const restart = document.getElementById('checklistRestart');
  if (!bar) return;

  function updateProgress(n) {
    if (bar) bar.style.width = ((n - 1) / TOTAL) * 100 + '%';
  }

  function showResult() {
    if (bar) bar.style.width = '100%';
    result.classList.add('active');
    scoreEl.textContent = score;
    let msg, urgency, ctaText;

    if (score <= 2) {
      msg =
        '🟢 Tu web médica está en buen estado. Algunos ajustes finos pueden mejorar la tasa de conversión.';
      urgency = 'Agenda una auditoría gratuita para identificar oportunidades de mejora.';
      ctaText = 'Revisar los últimos ajustes → WhatsApp';
    } else if (score <= 5) {
      msg =
        '🟡 Tu web tiene errores que están frenando pacientes. Son solucionables con el servicio correcto.';
      urgency = `${score} de 9 puntos críticos activos. Cada mes sin resolver son consultas perdidas.`;
      ctaText = 'Resolver estos errores → WhatsApp';
    } else {
      msg =
        '🔴 Tu presencia online está perdiendo pacientes activamente. Necesita intervención urgente.';
      urgency = `${score} errores críticos de 9. Tu web está siendo invisible para los pacientes que te buscan.`;
      ctaText = 'Necesito solución urgente → WhatsApp';
    }

    verdict.innerHTML = `<p>${msg}</p><p style="margin-top:.75rem">${urgency}</p>`;
    if (ctaEl) {
      ctaEl.querySelector('span')
        ? (ctaEl.querySelector('span').textContent = ctaText)
        : (ctaEl.lastChild.textContent = ctaText);
    }
    if (typeof gtag !== 'undefined')
      gtag('event', 'checklist_complete', {
        event_category: 'engagement',
        event_label: score + '-errores',
        value: score,
      });
  }

  function showQuestion(n) {
    document.querySelectorAll('.checklist-question').forEach((q) => q.classList.remove('active'));
    if (n === 'result') {
      showResult();
      return;
    }
    const el = document.getElementById('cq-' + n);
    if (el) {
      el.classList.add('active');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    updateProgress(n);
  }

  const widget = document.querySelector('.checklist-widget');
  if (!widget) return;

  widget.addEventListener('click', function (e) {
    const btn = e.target.closest('.checklist-opt');
    if (!btn || btn.disabled) return;
    score += parseInt(btn.dataset.val);
    const parentQ = document.getElementById('cq-' + btn.dataset.q);
    if (parentQ) {
      parentQ.querySelectorAll('.checklist-opt').forEach((b) => {
        b.disabled = true;
        b.classList.remove('selected');
      });
      btn.classList.add('selected');
    }
    setTimeout(() => {
      current = btn.dataset.next === 'result' ? 'result' : parseInt(btn.dataset.next);
      showQuestion(current);
    }, 280);
  });

  if (restart) {
    restart.addEventListener('click', function () {
      score = 0;
      current = 1;
      result.classList.remove('active');
      document.querySelectorAll('.checklist-opt').forEach((b) => {
        b.disabled = false;
        b.classList.remove('selected');
      });
      showQuestion(1);
    });
  }

  showQuestion(1);

  /* Keyboard Y/N */
  document.addEventListener('keydown', function (e) {
    const tag = document.activeElement?.tagName.toUpperCase();
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
    if (result.classList.contains('active')) return;
    const key = e.key.toUpperCase();
    if (key !== 'Y' && key !== 'N') return;
    const activeQ = document.querySelector('.checklist-question.active');
    if (!activeQ) return;
    const btn = activeQ.querySelector(
      key === 'Y' ? '.checklist-opt--yes:not(:disabled)' : '.checklist-opt--no:not(:disabled)'
    );
    if (btn) {
      e.preventDefault();
      btn.click();
    }
  });
})();

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
