(() => {
  const form = document.getElementById('projectForm');
  if (!form) return;
  const params = new URLSearchParams(location.search);
  const fields = {industry: 'Industry', template: 'Demo', service: 'Service', package: 'Package', vehicle: 'Sample vehicle', vehiclePrice: 'Sample vehicle price (R)', deposit: 'Sample deposit (R)', term: 'Sample term (months)'};
  const selection = Object.entries(fields).flatMap(([key, label]) => {
    const value = (params.get(key) || '').trim().slice(0, 200);
    return value ? [label + ': ' + value] : [];
  }).join('\n');
  if (selection) {
    document.getElementById('enquiryContext').hidden = false;
    document.getElementById('projectSelection').value = selection;
  }
  const status = document.getElementById('enquiryStatus');
  function prepare() {
    if (!form.reportValidity()) return null;
    const data = new FormData(form);
    const body = 'Name: ' + data.get('name') + '\nEmail: ' + data.get('email') + '\nBusiness: ' + (data.get('business') || 'Not provided') + (selection ? '\n\n' + selection : '') + '\n\nProject details:\n' + data.get('message');
    document.getElementById('enquiryFallback').hidden = false;
    document.getElementById('enquiryText').value = body;
    return body;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const body = prepare();
    if (!body) return;
    status.textContent = 'Your email draft is ready. Nothing has been sent by this website. If your email app does not open, copy the enquiry below and email hello@alienway.com.';
    location.href = 'mailto:hello@alienway.com?subject=' + encodeURIComponent('New Alienway Production project enquiry') + '&body=' + encodeURIComponent(body);
  });
  document.getElementById('copyEnquiry').addEventListener('click', async () => {
    const body = prepare();
    if (!body) return;
    try {
      await navigator.clipboard.writeText(body);
      status.textContent = 'Enquiry copied. Paste it into an email to hello@alienway.com. Nothing has been sent yet.';
    } catch {
      const output = document.getElementById('enquiryText');
      output.focus(); output.select();
      status.textContent = 'Select and copy your prepared enquiry below, then email it to hello@alienway.com.';
    }
  });
})();
