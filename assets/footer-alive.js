(() => {
  'use strict';

  const footer = document.querySelector('[data-footer-alive]');
  if (!footer || footer.dataset.initialized === 'true') return;
  footer.dataset.initialized = 'true';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal = () => footer.classList.add('is-inview');

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        reveal();
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(footer);
  } else {
    reveal();
  }

  if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let frame = 0;
  let point = null;

  footer.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const rect = footer.getBoundingClientRect();
    point = {
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))
    };
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      if (point) {
        footer.style.setProperty('--footer-pointer-x', point.x + '%');
        footer.style.setProperty('--footer-pointer-y', point.y + '%');
      }
      frame = 0;
    });
  }, { passive: true });

  footer.addEventListener('pointerleave', () => {
    point = null;
    footer.style.setProperty('--footer-pointer-x', '78%');
    footer.style.setProperty('--footer-pointer-y', '18%');
  }, { passive: true });
})();