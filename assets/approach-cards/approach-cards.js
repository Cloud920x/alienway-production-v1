(() => {
  'use strict';
  const section = document.querySelector('.awp-approach');
  if (!section) return;
  const cards = [...section.querySelectorAll('.approach-scene')];
  const toggle = section.querySelector('.approach-motion');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timers = new WeakMap();
  const status = document.createElement('span');
  status.className = 'approach-status';
  status.setAttribute('role', 'status');
  section.append(status);
  // Keep the visitor's choice separate from their operating-system preference.
  const storageKey = `awp-motion:${section.id}`;
  let paused = false;
  try { paused = sessionStorage.getItem(storageKey) === 'paused'; } catch (_) { /* Storage can be disabled. */ }
  function updateMotion() {
    section.dataset.paused = String(paused || preference.matches);
    toggle.setAttribute('aria-pressed', String(paused || preference.matches));
    toggle.querySelector('[data-approach-motion-label]').textContent = preference.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
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
  cards.forEach(card => {
    const button = card.querySelector('[data-approach-action]');
    let selection = 0;
    button.addEventListener('click', () => {
      clearTimeout(timers.get(card));
      card.classList.remove('is-reacting');
      void card.offsetWidth;
      card.classList.add('is-reacting');
      const kind = button.dataset.approachAction;
      if (kind === 'experience') {
        selection = (selection + 1) % 3;
        card.dataset.selection = String(selection);
        status.textContent = `Interface preview: item ${selection + 1} of 3 selected.`;
      } else {
        status.textContent = kind === 'weave' ? 'The spider is weaving a connected design.' : 'The climber is reaching the next growth milestone.';
      }
      timers.set(card, setTimeout(() => card.classList.remove('is-reacting'), 3300));
    });
  });
})();
