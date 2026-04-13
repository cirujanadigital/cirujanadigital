(function () {
  'use strict';

  // ── Año dinámico ──
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Hamburger menu ──
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  const overlay   = document.getElementById('navOverlay');

  if (!hamburger || !navMenu) return;

  function openMenu() {
    navMenu.classList.add('active');
    overlay && overlay.classList.add('active');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu.classList.remove('active');
    overlay && overlay.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    navMenu.classList.contains('active') ? closeMenu() : openMenu();
  });

  // Cerrar al hacer clic en overlay
  overlay && overlay.addEventListener('click', closeMenu);

  // Cerrar al hacer clic en un link del menú
  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar con Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) closeMenu();
  });

})();
// ── Footer blog list dinámica ──
const blogNavEl = document.getElementById('footer-blog-list');
if (blogNavEl && window.BLOG_ARTICLES) {
  blogNavEl.innerHTML = window.BLOG_ARTICLES.map(a =>
    `<li><a href="${a.url}">${a.label}<span class="link-arrow" aria-hidden="true">›</span></a></li>`
  ).join('');
}