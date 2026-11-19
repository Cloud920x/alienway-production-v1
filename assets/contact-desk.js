(() => {
  const clock = document.querySelector('.studio-clock');
  const time = new Intl.DateTimeFormat('en-ZA', {timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit', hour12: false});
  function updateTime() {
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = 'Local time · ' + time.format(now);
  }
  updateTime();
  window.setInterval(updateTime, 30000);
  const copy = document.querySelector('.copy-address');
  const status = document.querySelector('.copy-status');
  const email = document.querySelector('.contact-method[href^="mailto:"]').getAttribute('href').slice(7);
  if (navigator.clipboard?.writeText) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(email);
        status.textContent = 'Email address copied.';
      } catch {
        status.textContent = 'Copy this address: ' + email;
      }
    });
  }
})();
