(() => {
  const track = document.querySelector('.service-track');
  const controls = document.querySelector('.service-controls');
  if (!track || !controls) return;
  const cards = Array.from(track.children);
  const [previous, next] = controls.querySelectorAll('button');
  function sync() {
    const end = track.scrollWidth - track.clientWidth;
    controls.hidden = end <= 2;
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= end - 2;
  }
  function step(direction) {
    const start = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft);
    const offsets = cards.map(card => card.getBoundingClientRect().left - start);
    const delta = direction > 0 ? offsets.find(x => x > 2) : offsets.reverse().find(x => x < -2);
    track.scrollBy({left: delta ?? direction * track.clientWidth});
  }
  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  track.addEventListener('scroll', sync, {passive: true});
  window.addEventListener('resize', sync);
  sync();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('service-enter');
          observer.unobserve(entry.target);
        }
      }
    }, {threshold: .15});
    document.querySelectorAll('.service-large, .industry-detail-card, .process-card').forEach(card => observer.observe(card));
  }
})();
