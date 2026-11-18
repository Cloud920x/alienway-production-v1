(() => {
  'use strict';

  const section = document.querySelector('.trust[data-trust-gallery]');
  if (!section || section.dataset.trustReady === 'true') return;

  const gallery = section.querySelector('.trust-grid');
  const cards = Array.from(section.querySelectorAll('[data-trust-card]'));
  const dots = Array.from(section.querySelectorAll('[data-trust-go]'));
  const previous = section.querySelector('[data-trust-prev]');
  const next = section.querySelector('[data-trust-next]');
  const count = section.querySelector('.trust-count');
  const live = section.querySelector('.trust-live');
  const mobile = window.matchMedia ? window.matchMedia('(max-width: 680px)') : { matches: false };

  if (!gallery || cards.length !== 3 || !previous || !next) return;
  section.dataset.trustReady = 'true';

  let active = 0;
  let pointer = null;
  let startX = 0;
  let startY = 0;

  function isMobile() {
    return Boolean(mobile.matches);
  }

  function render() {
    const phone = isMobile();

    cards.forEach((card, index) => {
      if (!phone) {
        card.classList.remove('is-active', 'is-before', 'is-after');
        card.setAttribute('aria-hidden', 'false');
        return;
      }

      const relative = (index - active + cards.length) % cards.length;
      card.classList.toggle('is-active', relative === 0);
      card.classList.toggle('is-after', relative === 1);
      card.classList.toggle('is-before', relative === 2);
      card.setAttribute('aria-hidden', String(relative !== 0));
    });

    dots.forEach((dot, index) => {
      dot.setAttribute('aria-current', String(index === active));
    });

    if (count) count.textContent = String(active + 1).padStart(2, '0') + ' / 03';
    if (live) {
      const title = cards[active].querySelector('h3');
      live.textContent = 'Showing ' + (title ? title.textContent.trim() : 'trust commitment') + ', ' + (active + 1) + ' of ' + cards.length;
    }
  }

  function goTo(index) {
    active = (index + cards.length) % cards.length;
    render();
  }

  previous.addEventListener('click', () => goTo(active - 1));
  next.addEventListener('click', () => goTo(active + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));

  gallery.addEventListener('keydown', event => {
    if (!isMobile()) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(active - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(active + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      goTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      goTo(cards.length - 1);
    }
  });

  gallery.addEventListener('pointerdown', event => {
    if (!isMobile() || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    pointer = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
  });

  window.addEventListener('pointerup', event => {
    if (pointer === null || event.pointerId !== pointer) return;
    pointer = null;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      goTo(active + (dx < 0 ? 1 : -1));
    }
  });

  window.addEventListener('pointercancel', event => {
    if (event.pointerId === pointer) pointer = null;
  });
  window.addEventListener('blur', () => { pointer = null; });

  if (mobile.addEventListener) mobile.addEventListener('change', render);
  else if (mobile.addListener) mobile.addListener(render);
  window.addEventListener('resize', render, { passive: true });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry) section.classList.toggle('is-inview', entry.isIntersecting);
    }, { threshold: 0.08, rootMargin: '80px 0px' });
    observer.observe(section);
  } else {
    section.classList.add('is-inview');
  }

  render();
})();