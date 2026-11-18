(() => {
  'use strict';

  const footer = document.querySelector('[data-footer-alive]');
  if (!footer || footer.dataset.initialized === 'true') return;
  footer.dataset.initialized = 'true';

  const reveal = () => footer.classList.add('is-inview');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        reveal();
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(footer);
  } else {
    reveal();
  }
})();