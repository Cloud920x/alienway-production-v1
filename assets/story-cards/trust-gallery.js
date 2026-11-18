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

  if (!gallery || cards.length !== 3 || !previous || !next) return;

  const breakpoint = 680;
  const media = typeof window.matchMedia === 'function'
    ? window.matchMedia('(max-width: ' + breakpoint + 'px)')
    : null;
  const compactLandscape = typeof window.matchMedia === 'function'
    ? window.matchMedia('(orientation: landscape) and (max-height: 520px)')
    : null;

  let fallbackMobile = window.innerWidth <= breakpoint;
  let active = 0;
  let pointerId = null;
  let startX = 0;
  let startY = 0;

  const isMobile = () => {
    const compactLandscapeMode = compactLandscape && compactLandscape.matches;
    return media ? media.matches && !compactLandscapeMode
      : fallbackMobile && !compactLandscapeMode;
  };

  function render(announce = false) {
    const phone = isMobile();

    gallery.setAttribute('aria-label', phone
      ? 'Trust commitments, one photograph at a time'
      : 'Our three commitments to every client');
    gallery.setAttribute('tabindex', phone ? '0' : '-1');

    if (phone) {
      gallery.setAttribute('aria-roledescription', 'carousel');
      gallery.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight Home End');
    } else {
      gallery.removeAttribute('aria-roledescription');
      gallery.removeAttribute('aria-keyshortcuts');
    }

    cards.forEach((card, index) => {
      if (!phone) {
        card.classList.remove('is-active', 'is-before', 'is-after');
        card.setAttribute('aria-hidden', 'false');
        if ('inert' in card) card.inert = false;
        else card.removeAttribute('inert');
        return;
      }

      const relative = (index - active + cards.length) % cards.length;
      const isActive = relative === 0;
      const isAfter = relative === 1;
      const isBefore = relative === 2;

      card.classList.toggle('is-active', isActive);
      card.classList.toggle('is-after', isAfter);
      card.classList.toggle('is-before', isBefore);
      card.setAttribute('aria-hidden', String(!isActive));

      if ('inert' in card) card.inert = !isActive;
      else if (!isActive) card.setAttribute('inert', '');
      else card.removeAttribute('inert');
    });

    dots.forEach((dot, index) => {
      dot.setAttribute('aria-current', String(index === active));
    });

    if (count) {
      count.textContent = String(active + 1).padStart(2, '0') + ' / ' +
        String(cards.length).padStart(2, '0');
    }

    if (live) {
      if (announce) {
        const title = cards[active].querySelector('h3');
        const name = title ? title.textContent.trim() : 'Trust commitment';
        live.textContent = 'Showing ' + name + ', ' + (active + 1) +
          ' of ' + cards.length;
      } else {
        live.textContent = '';
      }
    }
  }

  function goTo(index) {
    active = (index + cards.length) % cards.length;
    render(true);
  }

  previous.addEventListener('click', () => goTo(active - 1));
  next.addEventListener('click', () => goTo(active + 1));

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goTo(index));
  });

  gallery.addEventListener('keydown', event => {
    if (!isMobile() || event.target !== gallery) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goTo(active - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        goTo(active + 1);
        break;
      case 'Home':
        event.preventDefault();
        goTo(0);
        break;
      case 'End':
        event.preventDefault();
        goTo(cards.length - 1);
        break;
      default:
        break;
    }
  });

  gallery.addEventListener('pointerdown', event => {
    if (!isMobile() || !event.isPrimary) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (event.target.closest && event.target.closest('button, a, input, textarea, select')) return;

    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
  });

  window.addEventListener('pointerup', event => {
    if (pointerId === null || event.pointerId !== pointerId) return;

    pointerId = null;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const horizontalSwipe = Math.abs(deltaX) > 44 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.25;

    if (horizontalSwipe) goTo(active + (deltaX < 0 ? 1 : -1));
  });

  window.addEventListener('pointercancel', event => {
    if (event.pointerId === pointerId) pointerId = null;
  });

  window.addEventListener('blur', () => {
    pointerId = null;
  });

  let lastViewportSnapshot = null;
  let pendingAnchorTop = null;
  let anchorReleaseTimer = null;

  function captureViewportSnapshot() {
    if (lastViewportSnapshot &&
        (window.innerWidth !== lastViewportSnapshot.width ||
         window.innerHeight !== lastViewportSnapshot.height)) return;

    const rect = section.getBoundingClientRect();
    lastViewportSnapshot = {
      width: window.innerWidth,
      height: window.innerHeight,
      top: rect.top,
      inView: rect.bottom > 0 && rect.top < window.innerHeight
    };
  }

  function refreshViewportState() {
    pointerId = null;

    if (!media) {
      fallbackMobile = window.innerWidth <= breakpoint;
    }

    let rect = section.getBoundingClientRect();
    const previous = lastViewportSnapshot;
    const viewportChanged = previous &&
      (window.innerWidth !== previous.width || window.innerHeight !== previous.height);

    if (viewportChanged && previous.inView && pendingAnchorTop === null) {
      pendingAnchorTop = previous.top;
    }

    if (pendingAnchorTop !== null) {
      const correction = rect.top - pendingAnchorTop;
      if (Math.abs(correction) > 1) {
        window.scrollTo(window.scrollX, window.scrollY + correction);
        rect = section.getBoundingClientRect();
      }

      window.clearTimeout(anchorReleaseTimer);
      anchorReleaseTimer = window.setTimeout(() => {
        pendingAnchorTop = null;
        captureViewportSnapshot();
      }, 480);
    }

    const inView = rect.bottom > 0 && rect.top < window.innerHeight;
    section.classList.toggle('is-inview', inView);
    render();

    lastViewportSnapshot = {
      width: window.innerWidth,
      height: window.innerHeight,
      top: rect.top,
      inView
    };
  }

  function cancelPendingAnchor() {
    if (pendingAnchorTop === null) return;
    pendingAnchorTop = null;
    window.clearTimeout(anchorReleaseTimer);
    captureViewportSnapshot();
  }

  window.addEventListener('scroll', captureViewportSnapshot, { passive: true });
  window.addEventListener('wheel', cancelPendingAnchor, { passive: true });
  window.addEventListener('touchstart', cancelPendingAnchor, { passive: true });

  if (media && typeof media.addEventListener === 'function') {
    media.addEventListener('change', refreshViewportState);
  } else if (media && typeof media.addListener === 'function') {
    media.addListener(refreshViewportState);
  }

  window.addEventListener('resize', refreshViewportState, { passive: true });
  window.addEventListener('orientationchange', () => {
    pointerId = null;
    window.setTimeout(refreshViewportState, 180);
  }, { passive: true });

  if (window.visualViewport && typeof window.visualViewport.addEventListener === 'function') {
    window.visualViewport.addEventListener('resize', refreshViewportState, { passive: true });
  }

  section.querySelectorAll('.trust-photo img').forEach(image => {
    const figure = image.closest('.trust-photo');
    if (!figure) return;

    image.addEventListener('error', () => {
      figure.classList.add('is-image-fallback');
    }, { once: true });

    image.addEventListener('load', () => {
      figure.classList.remove('is-image-fallback');
    }, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      figure.classList.add('is-image-fallback');
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry) section.classList.toggle('is-inview', entry.isIntersecting);
    }, {
      threshold: 0.08,
      rootMargin: '80px 0px'
    });
    observer.observe(section);
  } else {
    section.classList.add('is-inview');
  }

  section.dataset.trustReady = 'true';
  refreshViewportState();
})();