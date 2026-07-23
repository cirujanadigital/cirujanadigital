(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────
    BLOG
     ────────────────────────────────────────────────────────── */
  const BLOG_ARTICLES = [
    {
      href: '/blog/',
      label: 'Visitar todos los artículos',
    },
  ];

  /* ──────────────────────────────────────────────────────────
     WEBS MÉDICAS — agregar cada web nueva AL PRINCIPIO.
     ────────────────────────────────────────────────────────── */
  const WEBS_MEDICAS = [
    { href: 'https://metododoshas.com', label: 'Nutricionista', external: true },
    { href: '/pagina-web-traumatologo/', label: 'Traumatólogo', external: false },
    { href: '/pagina-web-para-doula/', label: 'Doula', external: false },
    { href: '/pagina-web-medico-anestesiologo/', label: 'Anestesiólogo', external: false },
    { href: '/pagina-web-para-cardiologo/', label: 'Cardiólogo', external: false },
    { href: '/pagina-web-dermatologa/', label: 'Dermatóloga', external: false },
    { href: '/pagina-web-para-obstetra/', label: 'Obstetra', external: false },
    { href: '/pagina-web-para-odontologo/', label: 'Odontólogo', external: false },
    { href: '/diseno-web-para-oftalmologo/', label: 'Oftalmólogo', external: false },
  ];

  /* ──────────────────────────────────────────────────────────
     SERVICIOS — fuente única para nav y footer
     ────────────────────────────────────────────────────────── */
  const SERVICIOS = [
    { href: '/servicios/pack-presencia/', label: 'Pack Presencia' },
    {
      href: '/servicios/landing-medica-vs-sitio-corporativo/',
      label: 'Landing Médica vs Sitio Corporativo',
    },
    { href: '/servicios/optimizacion-wpo/', label: 'Optimización WPO' },
    { href: '/servicios/auditoria-ia-plan-presencia/', label: 'Auditoría IA + Plan Presencia' },
    { href: '/servicios/mantenimiento-web/', label: 'Mantenimiento Web' },
    { href: '/servicios/sistema-anti-no-shows-clinicas/', label: 'Sistema Anti Ausencias' },
    { href: '/servicios/recepcionista-virtual-medica', label: 'Recepcionista Virtual' },
  ];

  /* ──────────────────────────────────────────────────────────
     RECURSOS — fuente única para nav y footer
     ────────────────────────────────────────────────────────── */
  const RECURSOS = [
    { href: '/recursos/', label: '⚡ Todos los recursos' },
    { href: '/diagnostico/', label: 'Diagnóstico gratuito' },
    { href: '/recursos/simulador-velocidad/', label: 'Simulador de velocidad' },
    { href: '/recursos/guia-5-errores/', label: 'Los 5 errores más comunes' },
  ];

  /* ──────────────────────────────────────────────────────────
     HELPER: marcar link activo según URL actual
     ────────────────────────────────────────────────────────── */
  function isActive(href) {
    const path = window.location.pathname;
    if (href === '/') return path === '/';
    return path.startsWith(href);
  }

  /* ──────────────────────────────────────────────────────────
     HELPER: generar <li> para dropdowns del nav
     Soporta { href, label, external }
     ────────────────────────────────────────────────────────── */
  function dropdownItems(items) {
    return items
      .map(({ href, label, external }) => {
        const active =
          !external && isActive(href) ? ' class="dropdown-link--active" aria-current="page"' : '';
        const extAttrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<li><a href="${href}"${active}${extAttrs}>${label}</a></li>`;
      })
      .join('\n');
  }

  /* ──────────────────────────────────────────────────────────
     HELPER: generar <li> para columnas del footer
     ────────────────────────────────────────────────────────── */
  function footerItems(items) {
    return items
      .map(({ href, label, external }) => {
        const extAttrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<li><a href="${href}"${extAttrs}>${label}<span class="link-arrow" aria-hidden="true">›</span></a></li>`;
      })
      .join('\n');
  }

  /* ──────────────────────────────────────────────────────────
     NAVBAR HTML
     ────────────────────────────────────────────────────────── */
  function buildNav() {
    const blogActive = isActive('/blog/') ? ' nav-link--active" aria-current="page' : '';

    return `
<a href="#main" class="skip-to-main">Saltar al contenido principal</a>
<div class="nav-overlay" id="navOverlay" aria-hidden="true"></div>
<nav class="navbar" id="navbar" aria-label="Navegación principal">
  <div class="nav-container">
    <a href="" class="nav-logo" aria-label="Cirujana Digital — inicio">
      <img
        src="img/logo-CD-blancoSF.webp"
        alt="Cirujana Digital"
        width="210" height="79"
        loading="eager" fetchpriority="high" decoding="sync"
        srcset="/img/logo-CD-blancoSF.webp 210w, /img/logo-CD-blancoSF@2x.webp 420w"
        sizes="(max-width: 480px) 120px, (max-width: 968px) 160px, 210px"
      />
    </a>
    <ul class="nav-menu" id="navMenu">

      <!-- Servicios ▾ -->
      <li class="nav-item nav-item--dropdown" id="dropServices">
        <button class="nav-link nav-link--trigger"
                aria-haspopup="true" aria-expanded="false"
                aria-controls="dropServicesMenu">
          Servicios <span class="nav-chevron" aria-hidden="true">▾</span>
        </button>
        <ul class="nav-dropdown" id="dropServicesMenu" role="menu">
          ${dropdownItems(SERVICIOS)}
        </ul>
      </li>

      <!-- Webs Médicas ▾ -->
      <li class="nav-item nav-item--dropdown" id="dropWebs">
        <button class="nav-link nav-link--trigger"
                aria-haspopup="true" aria-expanded="false"
                aria-controls="dropWebsMenu">
          Webs Médicas <span class="nav-chevron" aria-hidden="true">▾</span>
        </button>
        <ul class="nav-dropdown" id="dropWebsMenu" role="menu">
          ${dropdownItems(WEBS_MEDICAS)}
        </ul>
      </li>

      <!-- Blog (link directo) -->
      <li class="nav-item">
        <a href="blog/" class="nav-link nav-link--blog${blogActive}">Blog</a>
      </li>

      <!-- Recursos ▾ -->
      <li class="nav-item nav-item--dropdown" id="dropResources">
        <button class="nav-link nav-link--trigger"
                aria-haspopup="true" aria-expanded="false"
                aria-controls="dropResourcesMenu">
          Recursos <span class="nav-chevron" aria-hidden="true">▾</span>
        </button>
        <ul class="nav-dropdown" id="dropResourcesMenu" role="menu">
          ${dropdownItems(RECURSOS)}
        </ul>
      </li>

      <!-- CTA -->
      <li class="nav-item">
        <a href="diagnostico/" class="nav-cta">Diagnóstico Gratis →</a>
      </li>

    </ul>
    <button class="hamburger" id="hamburger" type="button"
            aria-label="Abrir menú" aria-expanded="false" aria-controls="navMenu">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>
  </div>
</nav>`;
  }

  /* ──────────────────────────────────────────────────────────
     FOOTER HTML
     ────────────────────────────────────────────────────────── */
  function buildFooter() {
    const year = new Date().getFullYear();

    const blogLinks = footerItems(BLOG_ARTICLES.slice(0, 5));
    const serviciosLinks = footerItems(SERVICIOS);
    const websMedLinks = footerItems(WEBS_MEDICAS);
    const recursosLinks = footerItems(RECURSOS);
    return `
<footer class="footer" role="contentinfo">
  <div class="footer-cta-bar">
    <div class="container">
      <div class="footer-cta-inner">
        <div class="footer-cta-text">
          <strong>¿Tu sitio carga lento o no convierte?</strong>
          <span>Diagnóstico gratuito · Resultado en 3 minutos · Sin compromiso</span>
        </div>
        <div class="footer-cta-actions">
          <a href="diagnostico/" class="footer-btn-primary">

            Diagnóstico Express
          </a>
          <a href="https://wa.me/5491176199680?text=Hola%2C%20quiero%20una%20consulta%20sobre%20mi%20sitio%20m%C3%A9dico"
             target="_blank" rel="noopener noreferrer" class="footer-btn-wa">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.847L.057 23.882l6.196-1.623A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.51-5.17-1.4l-.37-.22-3.679.964.982-3.588-.242-.379A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            WhatsApp directo
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-body">
    <div class="container">
      <div class="footer-grid">

        <div class="footer-brand">
          <a href="" class="footer-logo-link" aria-label="Cirujana Digital — inicio">
            <span class="logo-text-footer">CIRUJANA DIGITAL</span>
          </a>
          <p class="footer-tagline">Desarrollo web con precisión quirúrgica. De la sala de operaciones al código que posiciona y convierte.</p>
          <div class="footer-badge" role="img" aria-label="Lighthouse 100 en Performance, Accesibilidad y SEO">
            <div class="footer-badge-scores">
              <div class="footer-badge-score"><span class="val">100</span><span class="lbl">Perf</span></div>
              <div class="footer-badge-divider" aria-hidden="true"></div>
              <div class="footer-badge-score"><span class="val">100</span><span class="lbl">A11y</span></div>
              <div class="footer-badge-divider" aria-hidden="true"></div>
              <div class="footer-badge-score"><span class="val">100</span><span class="lbl">SEO</span></div>
            </div>
            <span class="footer-badge-label">Lighthouse</span>
          </div>
          <nav class="footer-social" aria-label="Redes sociales">

            <a href="https://web.facebook.com/cirujanadigital/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
              </svg>
            <a href="https://www.instagram.com/cirujanadigital/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            </a>
            <a href="https://www.linkedin.com/in/yuliamonti/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://wa.me/5491176199680" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.847L.057 23.882l6.196-1.623A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.51-5.17-1.4l-.37-.22-3.679.964.982-3.588-.242-.379A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </a>
          </nav>
        </div>
        <nav class="footer-column" aria-label="Servicios">
          <p class="footer-column-title">Servicios</p>
          <ul>${serviciosLinks}
          </ul>
        </nav>
       <nav class="footer-column" aria-label="Webs Médicas">
          <p class="footer-column-title">Webs Médicas</p>
          <ul>${websMedLinks}
          </ul>
        </nav>
        <nav class="footer-column" aria-label="Blog, recursos y contacto">
          <p class="footer-column-title">Blog</p>
          <ul>${blogLinks}
          </ul>
          <p class="footer-column-title footer-column-title--spaced">Recursos gratuitos</p>
          <ul>${recursosLinks}
          </ul>
          <p class="footer-column-title footer-column-title--spaced">Contacto</p>
          <ul>
            <li><a href="mailto:info@cirujanadigital.com">info@cirujanadigital.com <span class="link-arrow" aria-hidden="true">›</span></a></li>
            <li><a href="https://wa.me/5491176199680" target="_blank" rel="noopener noreferrer">WhatsApp directo <span class="link-arrow" aria-hidden="true">›</span></a></li>
          </ul>
        </nav>

      </div>
    </div>
  </div>

  <hr class="footer-divider" aria-hidden="true" />
  <div class="footer-bottom">
    <div class="container">
      <div class="footer-bottom-inner">
        <p>&copy; ${year} Cirujana Digital — Diseño Web Profesional para Médicos</p>
        <div class="footer-legal">
          <a href="terminos.html">Términos</a>
          <a href="politicas.html">Privacidad</a>
        </div>
      </div>
    </div>
  </div>
</footer>`;
  }

  /* ──────────────────────────────────────────────────────────
     HAMBURGER + DROPDOWNS + SCROLL
     ────────────────────────────────────────────────────────── */
  function initHamburger() {
    const btn = document.getElementById('hamburger');
    const menu = document.getElementById('navMenu');
    const overlay = document.getElementById('navOverlay');
    const navbar = document.getElementById('navbar');
    if (!btn || !menu) return;

    function closeMenu() {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menú');
      menu.classList.remove('open');
      overlay && overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        btn.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-label', 'Cerrar menú');
        menu.classList.add('open');
        overlay && overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });

    overlay && overlay.addEventListener('click', closeMenu);

    /* ── Dropdowns ── */
    const dropItems = menu.querySelectorAll('.nav-item--dropdown');
    dropItems.forEach((item) => {
      const trigger = item.querySelector('.nav-link--trigger');
      const dropdown = item.querySelector('.nav-dropdown');
      if (!trigger || !dropdown) return;

      let closeTimer = null;

      function openDrop() {
        clearTimeout(closeTimer);
        dropItems.forEach((other) => {
          if (other !== item) closeDrop(other);
        });
        trigger.setAttribute('aria-expanded', 'true');
        item.classList.add('open');
      }

      function closeDrop(target) {
        const t = target || item;
        const tr = t.querySelector('.nav-link--trigger');
        if (tr) tr.setAttribute('aria-expanded', 'false');
        t.classList.remove('open');
      }

      function scheduledClose() {
        closeTimer = setTimeout(() => closeDrop(), 120);
      }

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        item.classList.contains('open') ? closeDrop() : openDrop();
      });

      // cachear el breakpoint fuera de los listeners
      let isDesktop = window.innerWidth >= 968;
      window.addEventListener(
        'resize',
        () => {
          isDesktop = window.innerWidth >= 968;
        },
        { passive: true }
      );

      item.addEventListener('mouseenter', () => {
        if (isDesktop) openDrop(); // sin query de geometry
      });
      item.addEventListener('mouseleave', () => {
        if (isDesktop) scheduledClose();
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeDrop();
          trigger.focus();
        }
      });
    });

    document.addEventListener('click', () => {
      dropItems.forEach((item) => {
        item.querySelector('.nav-link--trigger')?.setAttribute('aria-expanded', 'false');
        item.classList.remove('open');
      });
    });

    /* ── Scroll: navbar shrink — un solo recálculo por frame ── */
    if (navbar) {
      let ticking = false;
      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            requestAnimationFrame(() => {
              navbar.classList.toggle('scrolled', window.scrollY > 40);
              ticking = false;
            });
            ticking = true;
          }
        },
        { passive: true }
      );
    }
  }

  /* ──────────────────────────────────────────────────────────
     INYECCIÓN
     ────────────────────────────────────────────────────────── */
  function inject() {
    const navSlot = document.getElementById('site-nav');
    const footerSlot = document.getElementById('site-footer');
    if (navSlot) {
      navSlot.innerHTML = buildNav();
    }
    if (footerSlot) {
      footerSlot.innerHTML = buildFooter();
    }
    requestAnimationFrame(initHamburger);
  }
  inject();
})();
