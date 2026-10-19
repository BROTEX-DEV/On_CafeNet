/* ON Store v1.0.2 — subtle scroll reveal and click feedback */
(() => {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const revealSelector = '.trust-strip > div, .section-head, .product-card, .why-grid article, .cta, .page-title, .catalog-tools, .cart-layout, .auth-card, .auth-side, .admin-list, .admin-form, .section, .why-inner';
  const prepareReveal = (root = document) => {
    const items = [];
    if (root instanceof Element && root.matches(revealSelector)) items.push(root);
    if (root.querySelectorAll) items.push(...root.querySelectorAll(revealSelector));
    items.forEach((el, index) => {
      if (el.dataset.onRevealReady) return;
      el.dataset.onRevealReady = '1';
      el.classList.add('on-reveal');
      el.style.transitionDelay = Math.min(index % 5, 4) * 55 + 'ms';
      observer.observe(el);
    });
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => prepareReveal(), { once: true });
  } else {
    prepareReveal();
  }

  const contentObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
      if (node instanceof Element) prepareReveal(node);
    }));
  });
  contentObserver.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('click', event => {
    const target = event.target.closest('.btn, .cart-link');
    if (!target || target.matches(':disabled') || target.getAttribute('aria-disabled') === 'true') return;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.15;
    const ripple = document.createElement('span');
    ripple.className = 'on-ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    target.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }, { passive: true });
})();