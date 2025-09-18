document.addEventListener('DOMContentLoaded', () => {
  try {
    const MOBILE_BREAKPOINT = 900;
    const nav = document.querySelector('.site-nav');
    const navToggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('main-menu');

    if (!nav || !navToggle || !menu) return;

    // set aria-current on active link
    (function setActiveLink() {
      function normalizePath(p) {
        if (!p) return '/';
        p = p.replace(/\/index\.html$/, '').replace(/\/$/, '');
        return p === '' ? '/' : p;
      }
      const current = normalizePath(location.pathname || '/');
      const links = menu.querySelectorAll('a[role="menuitem"], .menu a');
      links.forEach(a => {
        let linkPath;
        try { linkPath = new URL(a.href, location.origin).pathname; }
        catch (e) { linkPath = a.getAttribute('href') || ''; }
        linkPath = normalizePath(linkPath);
        if (linkPath === current) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    })();

    // focus trap helpers
    let previouslyFocused = null;
    let trapHandler = null;
    function trapFocus(container) {
      previouslyFocused = document.activeElement;
      const focusable = Array.from(container.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'))
        .filter(el => !el.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      trapHandler = function(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };
      document.addEventListener('keydown', trapHandler);
    }
    function releaseTrap() {
      if (trapHandler) { document.removeEventListener('keydown', trapHandler); trapHandler = null; }
      if (previouslyFocused) { try { previouslyFocused.focus(); } catch (err) {} previouslyFocused = null; }
    }

    // toggle panel
    function openPanel() {
      nav.classList.add('is-open');
      document.body.classList.add('menu-open');
      navToggle.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      setTimeout(() => { const first = menu.querySelector('a, button'); first?.focus(); }, 10);
      trapFocus(menu);
    }
    function closePanel() {
      nav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      navToggle.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      releaseTrap();
      navToggle.focus();
    }
    navToggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (nav.classList.contains('is-open')) closePanel(); else openPanel();
    });

    // click outside closes
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && nav.classList.contains('is-open')) closePanel();
    });

    // Escape closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closePanel();
    });

    // clicking a link inside the menu closes the panel on mobile
    menu.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      if (window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches) {
        closePanel();
      }
    });

    // reset on resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        closePanel();
      }
    });
  } catch (err) {
    console.error('nav init error', err);
  }
});
