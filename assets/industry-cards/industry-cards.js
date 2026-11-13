(() => {
  'use strict';
  const section = document.querySelector('.awp-industries');
  if (!section) return;
  const cards = [...section.querySelectorAll('.industry-scene')];
  const toggle = section.querySelector('.industry-motion');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timers = new WeakMap();
  const status = document.createElement('span');
  status.className = 'industry-status';
  status.setAttribute('role', 'status');
  section.append(status);
  // Keep the visitor's choice separate from their operating-system preference.
  const storageKey = `awp-motion:${section.id}`;
  let paused = false;
  try { paused = sessionStorage.getItem(storageKey) === 'paused'; } catch (_) { /* Storage can be disabled. */ }
  function updateMotion() {
    section.dataset.paused = String(paused || preference.matches);
    toggle.setAttribute('aria-pressed', String(paused || preference.matches));
    toggle.querySelector('[data-industry-motion-label]').textContent = preference.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
    toggle.disabled = preference.matches;
    const context = { 'digital-gap':'Digital Gap', 'our-approach':'Our Approach', 'our-industries':'Industries', 'our-process':'Our Process' }[section.id];
    toggle.setAttribute('aria-label', `${preference.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion'} — ${context}`);
  }
  section.classList.add('is-enhanced');
  updateMotion();
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem(storageKey, paused ? 'paused' : 'playing'); } catch (_) { /* Optional preference only. */ }
    updateMotion();
  });
  preference.addEventListener('change', updateMotion);
  function visibility() { section.dataset.hidden = String(document.hidden); }
  document.addEventListener('visibilitychange', visibility);
  visibility();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-inview', entry.isIntersecting));
    }, { threshold: .15 });
    cards.forEach(card => observer.observe(card));
  } else {
    cards.forEach(card => card.classList.add('is-inview'));
  }
  const messages = {
    restaurant: 'Restaurant preview: the dish is served.',
    automotive: 'Automotive preview: the car takes to the road.',
    construction: 'Construction preview: the building rises floor by floor.',
    retail: 'Retail preview: an order is packed and dispatched.',
    professional: 'Professional preview: the document is approved.',
    journal: 'Journal preview: a new story takes flight.'
  };
  cards.forEach(card => {
    const button = card.querySelector('[data-industry-action]');
    button.addEventListener('click', () => {
      const kind = button.dataset.industryAction;
      if (kind === 'property') {
        const evening = card.classList.toggle('is-evening');
        button.setAttribute('aria-pressed', String(evening));
        button.querySelector('[data-action-label]').textContent = evening ? 'RETURN TO DAYLIGHT' : 'LIGHT UP THE EVENING';
        status.textContent = evening ? 'Property preview: evening lights are on.' : 'Property preview: daylight restored.';
        return;
      }
      clearTimeout(timers.get(card));
      card.classList.remove('is-reacting');
      void card.offsetWidth;
      card.classList.add('is-reacting');
      status.textContent = messages[kind];
      timers.set(card, setTimeout(() => card.classList.remove('is-reacting'), 3500));
    });
  });
})();
