(() => {
  'use strict';
  const section = document.querySelector('.process-wallpapers');
  if (!section) return;
  const cards = [...section.querySelectorAll('.process-wallpaper')];
  const toggle = section.querySelector('.wallpaper-motion');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const status = section.querySelector('.process-live');
  const timers = new WeakMap();
  // Keep the visitor's choice separate from their operating-system preference.
  const storageKey = `awp-motion:${section.id}`;
  let paused = false;
  try { paused = sessionStorage.getItem(storageKey) === 'paused'; } catch (_) { /* Storage can be disabled. */ }
  function updateMotion() {
    section.dataset.paused = String(paused || preference.matches);
    toggle.setAttribute('aria-pressed', String(paused || preference.matches));
    toggle.querySelector('[data-process-motion]').textContent = preference.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
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
    }, { threshold: .12 });
    cards.forEach(card => observer.observe(card));
  } else {
    cards.forEach(card => card.classList.add('is-inview'));
  }
  const messages = { discover:'Discover: follow the roots of your business.', design:'Design: a new world assembled, block by block.', develop:'Develop: building the website experience.', launch:'Launch: liftoff. Your business enters the digital world.' };
  cards.forEach(card => {
    card.querySelector('.wallpaper-trigger').addEventListener('click', () => {
      const kind = card.querySelector('[data-process-action]').dataset.processAction;
      clearTimeout(timers.get(card));
      card.classList.remove('is-reacting', 'is-built');
      void card.offsetWidth;
      card.classList.add('is-reacting');
      status.textContent = messages[kind];
      const label = card.querySelector('[data-build-label]');
      if (label && (paused || preference.matches)) {
        label.textContent = 'BUILD COMPLETE / 100%';
        card.classList.add('is-built');
        status.textContent = 'Develop preview: build complete.';
      } else if (label) {
        label.textContent = 'BUILDING EXPERIENCE_';
      }
      timers.set(card, setTimeout(() => {
        card.classList.remove('is-reacting');
        if (label) {
          label.textContent = 'BUILD COMPLETE / 100%';
          card.classList.add('is-built');
          status.textContent = 'Develop preview: build complete.';
        }
      }, 4000));
    });
  });
})();
