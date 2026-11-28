(() => {
  'use strict';

  const form = document.getElementById('projectForm');
  const builder = document.querySelector('[data-project-builder]');
  if (!form || !builder || form.dataset.initialized === 'true') return;

  const panels = Array.from(form.querySelectorAll('[data-step-panel]'));
  const typeChoices = Array.from(form.querySelectorAll('[data-project-type]'));
  const budgetChoices = Array.from(form.querySelectorAll('[data-budget]'));
  const nextButton = form.querySelector('[data-step-next]');
  const backButton = form.querySelector('[data-step-back]');
  const submitButton = form.querySelector('[data-step-submit]');
  const progress = builder.querySelector('[role="progressbar"]');
  const progressFill = builder.querySelector('[data-progress-fill]');
  const stepNumber = builder.querySelector('[data-current-step]');
  const stepLabels = Array.from(builder.querySelectorAll('[data-step-label]'));
  const status = document.getElementById('enquiryStatus');
  const fallback = document.getElementById('enquiryFallback');
  const enquiryText = document.getElementById('enquiryText');
  const contextBox = document.getElementById('enquiryContext');
  const contextText = document.getElementById('projectSelection');
  const copyButton = document.getElementById('copyEnquiry');
  const typeSummary = builder.querySelector('[data-summary-type]');
  const industrySummary = builder.querySelector('[data-summary-industry]');
  const budgetSummary = builder.querySelector('[data-summary-budget]');
  const charCount = builder.querySelector('[data-char-count]');

  if (panels.length !== 3 || !nextButton || !backButton || !submitButton) return;
  form.dataset.initialized = 'true';

  let currentStep = 0;
  let selectedType = '';
  let selectedBudget = '';

  const fields = {
    name: form.elements.namedItem('name'),
    phone: form.elements.namedItem('phone'),
    email: form.elements.namedItem('email'),
    business: form.elements.namedItem('business'),
    message: form.elements.namedItem('message'),
    industry: form.elements.namedItem('industry')
  };

  const params = new URLSearchParams(window.location.search);
  const queryLabels = {
    industry: 'Industry',
    template: 'Selected demo',
    service: 'Service',
    package: 'Package',
    extras: 'Selected extras',
    vehicle: 'Sample vehicle',
    vehiclePrice: 'Sample vehicle price (R)',
    deposit: 'Sample deposit (R)',
    term: 'Sample term (months)'
  };

  const importedContext = Object.entries(queryLabels).flatMap(([key, label]) => {
    const value = (params.get(key) || '').trim().slice(0, key === 'extras' ? 1800 : 200);
    return value ? [label + ': ' + value] : [];
  }).join('\n');

  if (importedContext) {
    contextBox.hidden = false;
    contextText.textContent = importedContext;
    const chosen = (params.get('template') || params.get('service') || '').trim().slice(0, 100);
    document.getElementById('contextTitle').textContent = chosen ? 'Your selection · ' + chosen : 'Your selection';
  }

  const importedIndustry = (params.get('industry') || '').trim();
  // Older demo links pass only a template name, or use the short retail label.
  const demoIndustries = new Map([
    ['Automotive', 'Automotive'],
    ['Automotive Signature', 'Automotive'],
    ['Automotive Medium', 'Automotive'],
    ['Rinse Ritual', 'Automotive'],
    ['Construction', 'Construction'],
    ['Restaurant Website', 'Food & hospitality']
  ]);
  const requestedIndustry = importedIndustry || demoIndustries.get(params.get('template'));
  const industryLabel = requestedIndustry === 'Retail' ? 'Retail & e-commerce' : requestedIndustry;
  if (industryLabel) {
    const option = Array.from(fields.industry.options).find(item =>
      item.value && item.textContent.trim().toLowerCase() === industryLabel.toLowerCase()
    );
    if (option) fields.industry.value = option.value;
  }

  function setType(choice) {
    selectedType = choice.dataset.projectType || '';
    typeChoices.forEach(item => {
      const active = item === choice;
      item.setAttribute('aria-checked', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    updateSummary();
    builder.classList.add('is-engaged');
    clearError(0);
  }

  function setBudget(choice) {
    selectedBudget = choice.dataset.budget || '';
    budgetChoices.forEach(item => {
      const active = item === choice;
      item.setAttribute('aria-checked', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    updateSummary();
    builder.classList.add('is-engaged');
  }

  function updateSummary() {
    if (typeSummary) typeSummary.textContent = selectedType || 'Not selected yet';
    if (industrySummary) industrySummary.textContent = fields.industry.value || 'Not selected yet';
    if (budgetSummary) budgetSummary.textContent = selectedBudget || 'Open conversation';
  }

  function clearError(step) {
    const message = form.querySelector('[data-step-error="' + step + '"]');
    if (message) message.textContent = '';
  }

  function showError(step, message, field) {
    const target = form.querySelector('[data-step-error="' + step + '"]');
    if (target) target.textContent = message;
    if (field && typeof field.focus === 'function') field.focus();
  }

  function validateStep(step) {
    clearError(step);

    if (step === 0) {
      if (!selectedType) {
        showError(0, 'Choose the kind of project you have in mind to continue.', typeChoices[0]);
        return false;
      }
      if (!fields.industry.value) {
        showError(0, 'Choose the industry that best describes your business.', fields.industry);
        return false;
      }
    }

    if (step === 1) {
      if (!fields.message.value.trim()) {
        showError(1, 'Give us a little detail about what you would like to achieve.', fields.message);
        return false;
      }
      if (fields.message.value.trim().length < 12) {
        showError(1, 'Add a little more detail so we can understand your idea.', fields.message);
        return false;
      }
    }

    if (step === 2) {
      if (!fields.name.value.trim()) {
        showError(2, 'Please add your name so we know who we are speaking with.', fields.name);
        return false;
      }
      if (!fields.email.value.trim() || !fields.email.validity.valid) {
        showError(2, 'Enter a valid email address so we can get back to you.', fields.email);
        return false;
      }
      if (!/^\+?[0-9]{7,15}$/.test(fields.phone.value.replace(/[ ()-]/g, ''))) {
        showError(2, 'Enter a cell phone number with 7 to 15 digits.', fields.phone);
        return false;
      }
    }

    return true;
  }

  function renderStep(step, moveFocus = true) {
    currentStep = Math.max(0, Math.min(panels.length - 1, step));

    panels.forEach((panel, index) => {
      const active = index === currentStep;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', String(!active));
    });

    stepLabels.forEach((label, index) => {
      label.classList.toggle('is-current', index === currentStep);
      label.classList.toggle('is-complete', index < currentStep);
    });

    const progressValue = currentStep + 1;
    if (progress) {
      progress.setAttribute('aria-valuenow', String(progressValue));
      progress.setAttribute('aria-valuetext', 'Step ' + progressValue + ' of 3');
    }
    if (progressFill) progressFill.style.width = (progressValue / panels.length * 100) + '%';
    if (stepNumber) stepNumber.textContent = String(progressValue).padStart(2, '0');

    backButton.disabled = currentStep === 0;
    nextButton.hidden = currentStep === panels.length - 1;
    submitButton.hidden = currentStep !== panels.length - 1;
    status.textContent = '';
    updateSummary();

    if (moveFocus) {
      const heading = panels[currentStep].querySelector('h3');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        requestAnimationFrame(() => heading.focus());
      }
    }
  }

  typeChoices.forEach((choice, index) => {
    choice.tabIndex = index === 0 ? 0 : -1;
    choice.addEventListener('click', () => setType(choice));
    choice.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
      const next = (index + direction + typeChoices.length) % typeChoices.length;
      typeChoices[next].focus();
      setType(typeChoices[next]);
    });
  });

  budgetChoices.forEach((choice, index) => {
    choice.tabIndex = index === 0 ? 0 : -1;
    choice.addEventListener('click', () => setBudget(choice));
    choice.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
      const next = (index + direction + budgetChoices.length) % budgetChoices.length;
      budgetChoices[next].focus();
      setBudget(budgetChoices[next]);
    });
  });

  nextButton.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    renderStep(currentStep + 1);
  });

  backButton.addEventListener('click', () => renderStep(currentStep - 1));

  fields.industry.addEventListener('change', () => {
    updateSummary();
    clearError(0);
    builder.classList.add('is-engaged');
  });

  fields.message.addEventListener('input', () => {
    if (charCount) charCount.textContent = fields.message.value.length + ' / 1800';
    if (fields.message.value.trim().length >= 12) clearError(1);
  });

  [fields.name, fields.email].forEach(field => {
    field.addEventListener('input', () => {
      if (field === fields.name && field.value.trim()) clearError(2);
      if (field === fields.email && field.value.trim() && field.validity.valid) clearError(2);
    });
  });

  function buildEnquiry() {
    const lines = [
      'NEW PROJECT ENQUIRY — ALIENWAY PRODUCTION',
      '',
      'Project type: ' + (selectedType || 'Not selected'),
      'Industry: ' + (fields.industry.value || 'Not provided'),
      'Business: ' + (fields.business.value.trim() || 'Not provided'),
      'Investment range: ' + (selectedBudget || 'Open conversation'),
      '',
      'Client name: ' + fields.name.value.trim(),
      'Email: ' + fields.email.value.trim(),
      'Cell: ' + fields.phone.value.trim()
    ];

    if (importedContext) lines.push('', 'SELECTED WEBSITE / DEMO CONTEXT', importedContext);
    lines.push('', 'PROJECT DETAILS', fields.message.value.trim());
    lines.push('', 'Prepared via Alienway Production’s project starter.');
    return lines.join('\n');
  }

  let pendingRequest;
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (sending) return;
    for (let step = 0; step < panels.length; step += 1) {
      if (!validateStep(step)) {
        renderStep(step, false);
        const invalid = panels[step].querySelector(':invalid');
        if (invalid) invalid.focus();
        else if (step === 0 && !selectedType) typeChoices[0].focus();
        else if (step === 1) fields.message.focus();
        else if (step === 2) fields.name.focus();
        return;
      }
    }

    const body = buildEnquiry();
    enquiryText.value = body;
    sending = true;
    const locked = Array.from(form.elements).filter(control => !control.disabled);
    locked.forEach(control => { control.disabled = true; });
    fallback.hidden = true;
    status.textContent = 'Sending your enquiry…';
    try {
      if (!pendingRequest || pendingRequest.body !== body) {
        pendingRequest = {id: crypto.randomUUID(), body};
      }
      const {projectUrl, publishableKey} = await import('../staff/config.js');
      const response = await fetch(projectUrl + '/rest/v1/rpc/submit_project_enquiry', {
        method: 'POST',
        headers: {apikey: publishableKey, 'Content-Type': 'application/json'},
        body: JSON.stringify({request_id: pendingRequest.id, contact_name: fields.name.value.trim(),
          email: fields.email.value.trim(), phone: fields.phone.value.replace(/[ ()-]/g, ''), brief: body}),
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) throw new Error('Submission not confirmed');
      form.querySelector('.builder-actions').hidden = true;
      status.textContent = 'Enquiry received. Our team can now call or email you about your project.';
      status.tabIndex = -1;
      status.focus();
    } catch {
      locked.forEach(control => { control.disabled = false; });
      fallback.hidden = false;
      status.textContent = 'We could not confirm receipt. Try again or copy your enquiry and email it to alienway920@gmail.com.';
    } finally {
      sending = false;
    }
  });

  copyButton.addEventListener('click', async () => {
    const body = enquiryText.value || buildEnquiry();
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(body);
      status.textContent = 'Copied. Paste your enquiry into an email to alienway920@gmail.com.';
    } catch (error) {
      enquiryText.focus();
      enquiryText.select();
      status.textContent = 'Your enquiry is selected below. Copy it and email alienway920@gmail.com.';
    }
  });

  // Cards begin with a real keyboard focus target and the first stage is rendered immediately.
  renderStep(0, false);
  updateSummary();
})();