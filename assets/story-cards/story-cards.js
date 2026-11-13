(() => {
  'use strict';
  const section = document.querySelector('.awp-stories');
  if (!section) return;
  const cards = [...section.querySelectorAll('.awp-story')];
  const toggle = section.querySelector('.story-motion');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timers = new WeakMap();
  // Keep the visitor's choice separate from their operating-system preference.
  const storageKey = `awp-motion:${section.id}`;
  let paused = false;
  try { paused = sessionStorage.getItem(storageKey) === 'paused'; } catch (_) { /* Storage can be disabled. */ }
  function updateMotion() {
    section.dataset.paused = String(paused || preference.matches);
    toggle.setAttribute('aria-pressed', String(paused || preference.matches));
    toggle.querySelector('[data-motion-label]').textContent = preference.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
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
    const button = card.querySelector('[data-story-action]');
    button.addEventListener('click', () => {
      clearTimeout(timers.get(card));
      card.classList.remove('is-reacting');
      // Restart just this scene after repeat taps; no perpetual JavaScript loop.
      void card.offsetWidth;
      card.classList.add('is-reacting');
      timers.set(card, setTimeout(() => card.classList.remove('is-reacting'), 2500));
    });
  });
})();
