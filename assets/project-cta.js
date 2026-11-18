(() => {
  'use strict';

  const card = document.querySelector('[data-project-cta]');
  if (!card || card.dataset.initialized === 'true') return;
  card.dataset.initialized = 'true';

  const nodes = Array.from(card.querySelectorAll('[data-cta-node]'));
  const index = card.querySelector('.cta-caption-index');
  const copy = card.querySelector('.cta-caption-copy');
  const descriptions = {
    discover: ['01 / DISCOVER', 'Understand the business before we build.'],
    design: ['02 / DESIGN', 'Shape a clear experience around real people.'],
    develop: ['03 / DEVELOP', 'Build, test and launch something that works.']
  };

  function activate(node) {
    const data = descriptions[node.dataset.ctaNode];
    if (!data) return;
    nodes.forEach(item => {
      const active = item === node;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    if (index) index.textContent = data[0];
    if (copy) copy.textContent = data[1];
    card.dataset.activeStage = node.dataset.ctaNode;
  }

  nodes.forEach(node => {
    node.addEventListener('click', () => activate(node));
    node.addEventListener('focus', () => activate(node));
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        card.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    observer.observe(card);
  } else {
    card.classList.add('is-visible');
  }
})();