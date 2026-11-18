(() => {
  'use strict';

  const section = document.querySelector('.why-alienway');
  const source = section && section.querySelector('.why-grid');
  if (!section || !source || section.dataset.whyDeckReady === 'true') return;

  const cards = [
    {
      number: '01',
      theme: 'studio',
      label: 'DESIGN / IDENTITY',
      title: 'Distinctive',
      emphasis: 'by design.',
      copy: 'Your business has its own character. We turn that into a digital identity with considered layouts, original visuals and details that feel unmistakably yours.',
      footer: 'A DIGITAL IDENTITY THAT FEELS LIKE YOU.',
      art: `<svg viewBox="0 0 620 470" role="img" aria-label="A creative studio scene with layered website layouts, a colour palette and a moving design cursor">
        <defs>
          <linearGradient id="why-studio-window" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9edff2" stop-opacity=".22"/><stop offset="1" stop-color="#6b9db9" stop-opacity=".045"/></linearGradient>
          <linearGradient id="why-studio-canvas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a7e3f1" stop-opacity=".30"/><stop offset=".52" stop-color="#4f8ba9" stop-opacity=".14"/><stop offset="1" stop-color="#172e42" stop-opacity=".15"/></linearGradient>
          <linearGradient id="why-studio-light" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#d9f5fb"/><stop offset="1" stop-color="#79c6e1" stop-opacity=".18"/></linearGradient>
          <filter id="why-studio-glow"><feGaussianBlur stdDeviation="9"/></filter>
        </defs>
        <path class="studio-grid" d="M28 78H590M28 128H590M28 178H590M28 228H590M28 278H590M28 328H590M28 378H590M78 30V430M128 30V430M178 30V430M228 30V430M278 30V430M328 30V430M378 30V430M428 30V430M478 30V430M528 30V430"/>
        <ellipse class="studio-orbit" cx="310" cy="235" rx="266" ry="177" transform="rotate(-15 310 235)"/>
        <ellipse cx="333" cy="226" rx="185" ry="145" fill="#72c5e5" opacity=".07" filter="url(#why-studio-glow)"/>
        <g class="studio-float-main">
          <rect x="126" y="70" width="394" height="316" rx="20" class="studio-window"/>
          <path d="M126 112H520" class="studio-line-soft"/>
          <circle cx="151" cy="91" r="4" fill="#e7f7fb" opacity=".85"/>
          <circle cx="166" cy="91" r="4" fill="#a8dced" opacity=".75"/>
          <circle cx="181" cy="91" r="4" fill="#6daecb" opacity=".75"/>
          <rect x="146" y="130" width="354" height="233" rx="12" fill="url(#why-studio-canvas)" stroke="#b9e7f5" stroke-opacity=".25"/>
          <path d="M147 294C205 246 244 267 288 220S373 170 499 202V363H147Z" fill="#76c2df" opacity=".13"/>
          <path d="M147 315C223 285 263 292 320 252S422 218 500 235V363H147Z" fill="#b3e7ef" opacity=".10"/>
          <path d="M147 326C218 308 277 316 336 281S428 249 500 263" fill="none" stroke="#b9eaf5" stroke-opacity=".52" stroke-width="1.5"/>
          <path d="M180 166H340M180 180H292" class="studio-line-soft"/>
          <path d="M180 205H251" class="studio-line"/>
          <rect x="180" y="222" width="86" height="25" rx="12.5" fill="#a9e1f1" fill-opacity=".20" stroke="#bceaf6" stroke-opacity=".52"/>
          <path d="M196 234H249" stroke="#d7f3fa" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M375 149H468M375 163H448M375 177H458" class="studio-line-soft"/>
          <rect x="375" y="190" width="92" height="8" rx="4" fill="#a9dced" fill-opacity=".24"/>
          <path d="M375 190H432" stroke="#b8eaf5" stroke-width="2" stroke-linecap="round"/>
          <path class="studio-line studio-draw-line" d="M164 348C215 320 246 330 284 302S364 275 414 284 463 274 485 251"/>
          <circle cx="485" cy="251" r="5" class="studio-accent studio-spark"/>
        </g>
        <g class="studio-float-palette">
          <rect x="25" y="225" width="145" height="168" rx="17" class="studio-glass"/>
          <path d="M44 250H112M44 263H91" class="studio-line-soft"/>
          <rect x="43" y="282" width="108" height="42" rx="9" fill="#a8dced" fill-opacity=".13" stroke="#c5edf7" stroke-opacity=".35"/>
          <circle cx="57" cy="344" r="10" fill="#b8e8f4"/>
          <circle cx="84" cy="344" r="10" fill="#6fb2d0"/>
          <circle cx="111" cy="344" r="10" fill="#547c9c"/>
          <circle cx="138" cy="344" r="10" fill="#d1e9df"/>
          <path d="M44 372H143" class="studio-line-soft"/>
        </g>
        <g class="studio-float-note">
          <rect x="431" y="22" width="151" height="112" rx="15" class="studio-glass"/>
          <path d="M451 48H553M451 62H526" class="studio-line-soft"/>
          <rect x="451" y="78" width="32" height="32" rx="8" fill="#9bdced" fill-opacity=".18" stroke="#bceaf6" stroke-opacity=".4"/>
          <path d="M460 94L467 101 476 86" fill="none" stroke="#c8f0f7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M493 87H556M493 99H540" class="studio-line-soft"/>
        </g>
        <g class="studio-cursor">
          <path d="M544 298L564 350 574 332 592 342Z" fill="#d9f5fb" stroke="#17364a" stroke-width="2"/>
          <path d="M554 315L566 337" stroke="#17364a" stroke-width="1.5"/>
          <circle cx="545" cy="298" r="18" fill="none" stroke="#b7e9f5" stroke-opacity=".5"/>
        </g>
        <circle cx="91" cy="150" r="4" class="studio-accent studio-spark"/>
        <circle cx="548" cy="192" r="3" class="studio-accent studio-spark"/>
        <path d="M58 414H560" stroke="#b4dfed" stroke-opacity=".24" stroke-width="1"/>
      </svg>`
    },
    {
      number: '02',
      theme: 'systems',
      label: 'FUNCTION / BUSINESS TOOLS',
      title: 'Built to',
      emphasis: 'do real work.',
      copy: 'Bookings, enquiries, orders, inventory and management tools can work together in one clear experience — helping your website do more than simply look good.',
      footer: 'BEAUTIFUL ON THE FRONT. USEFUL BEHIND IT.',
      art: `<svg viewBox="0 0 620 470" role="img" aria-label="A live business operations dashboard connecting bookings, orders, stock and customer activity">
        <defs>
          <linearGradient id="why-system-panel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a8eadc" stop-opacity=".19"/><stop offset="1" stop-color="#4e9e91" stop-opacity=".045"/></linearGradient>
          <linearGradient id="why-system-chart" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#73d4c2" stop-opacity=".08"/><stop offset="1" stop-color="#9be9db" stop-opacity=".42"/></linearGradient>
          <filter id="why-system-glow"><feGaussianBlur stdDeviation="10"/></filter>
        </defs>
        <path class="system-muted" d="M24 90H590M24 140H590M24 190H590M24 240H590M24 290H590M24 340H590M24 390H590M74 32V438M124 32V438M174 32V438M224 32V438M274 32V438M324 32V438M374 32V438M424 32V438M474 32V438M524 32V438"/>
        <ellipse cx="332" cy="229" rx="210" ry="168" fill="#6be0ca" opacity=".08" filter="url(#why-system-glow)"/>
        <g>
          <rect x="105" y="64" width="426" height="340" rx="19" class="system-panel"/>
          <path d="M105 108H531" class="system-muted"/>
          <circle cx="130" cy="86" r="4" fill="#c6f3e8"/>
          <circle cx="145" cy="86" r="4" fill="#8fe3d4" opacity=".75"/>
          <circle cx="160" cy="86" r="4" fill="#5eb9aa" opacity=".75"/>
          <rect x="125" y="127" width="78" height="256" rx="10" fill="#071f29" fill-opacity=".34"/>
          <path d="M143 151H183M143 171H174M143 191H183M143 211H170" class="system-muted"/>
          <rect x="139" y="229" width="50" height="31" rx="7" fill="#83dfce" fill-opacity=".15" stroke="#9fe9db" stroke-opacity=".34"/>
          <path d="M151 245H177" class="system-line"/>
          <path d="M143 281H182M143 301H174M143 321H181" class="system-muted"/>
          <rect x="220" y="128" width="289" height="82" rx="11" fill="url(#why-system-panel)" stroke="#b6eee2" stroke-opacity=".25"/>
          <path d="M239 151H295M239 166H277" class="system-muted"/>
          <path d="M239 190H281" class="system-line"/>
          <rect x="326" y="148" width="66" height="43" rx="7" class="system-glass"/>
          <rect x="402" y="148" width="88" height="43" rx="7" class="system-glass"/>
          <path d="M339 176L350 164 361 170 378 157" class="system-line"/>
          <path d="M415 176H475M415 164H459" class="system-muted"/>
          <rect x="220" y="227" width="174" height="143" rx="11" class="system-glass"/>
          <path d="M238 250H366" class="system-muted"/>
          <path d="M238 280H366M238 309H366M238 338H366" stroke="#a9e7dc" stroke-opacity=".13" stroke-width="1"/>
          <g class="system-bars">
            <rect x="247" y="292" width="16" height="58" rx="4" fill="#76cdbd" fill-opacity=".55"/>
            <rect x="275" y="275" width="16" height="75" rx="4" fill="#8bdccc" fill-opacity=".7"/>
            <rect x="303" y="261" width="16" height="89" rx="4" fill="#9be9db" fill-opacity=".86"/>
            <rect x="331" y="244" width="16" height="106" rx="4" fill="#b7f1e6"/>
            <path d="M247 284L283 266 311 250 339 233" fill="none" stroke="#c3f5eb" stroke-width="1.7" stroke-linecap="round"/>
          </g>
          <rect x="408" y="227" width="101" height="143" rx="11" class="system-glass"/>
          <circle cx="458" cy="276" r="27" fill="none" stroke="#a4e8dc" stroke-opacity=".18" stroke-width="8"/>
          <path d="M458 249A27 27 0 1 1 435 290" fill="none" stroke="#a3eadc" stroke-width="8" stroke-linecap="round"/>
          <path d="M429 328H486M429 342H474" class="system-muted"/>
        </g>
        <g class="system-order">
          <rect x="20" y="270" width="151" height="123" rx="16" class="system-glass"/>
          <circle cx="44" cy="295" r="8" fill="#a4e9dc" fill-opacity=".22" stroke="#a4e9dc" stroke-opacity=".6"/>
          <path d="M40 295L43 298 49 290" fill="none" stroke="#c9f5eb" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M61 291H145M61 303H123M39 328H148M39 343H129M39 358H140" class="system-muted"/>
          <rect x="39" y="369" width="78" height="7" rx="3.5" fill="#8fe3d4" fill-opacity=".38"/>
        </g>
        <g class="system-order">
          <rect x="445" y="20" width="151" height="86" rx="15" class="system-glass"/>
          <circle cx="468" cy="46" r="7" fill="#a0e9da" fill-opacity=".25"/>
          <path d="M485 43H574M485 56H557M462 77H574" class="system-muted"/>
        </g>
        <path class="system-flow-line" d="M171 330C196 330 198 300 220 300S400 300 408 300 431 289 445 289"/>
        <circle cx="220" cy="300" r="5" class="system-accent system-signal"/>
        <circle cx="408" cy="300" r="5" class="system-accent system-signal"/>
        <circle cx="553" cy="145" r="4" class="system-accent system-signal"/>
        <path d="M552 162V185M541 174H563" stroke="#a5eadc" stroke-opacity=".5" stroke-width="1.3"/>
      </svg>`
    },
    {
      number: '03',
      theme: 'support',
      label: 'PARTNERSHIP / LONG-TERM CARE',
      title: 'Better',
      emphasis: 'after launch.',
      copy: 'Going live is the beginning, not the finish line. We stay involved with maintenance, updates and thoughtful improvements as your business changes.',
      footer: 'A DIGITAL PARTNER BEYOND LAUNCH.',
      art: `<svg viewBox="0 0 620 470" role="img" aria-label="A website being maintained and improved, with a support panel, update milestones and a continuous care loop">
        <defs>
          <linearGradient id="why-support-panel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d1eab9" stop-opacity=".20"/><stop offset="1" stop-color="#79a78a" stop-opacity=".045"/></linearGradient>
          <linearGradient id="why-support-path" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#a9d99b" stop-opacity=".06"/><stop offset="1" stop-color="#d9f0c5" stop-opacity=".65"/></linearGradient>
          <filter id="why-support-glow"><feGaussianBlur stdDeviation="10"/></filter>
        </defs>
        <path class="support-muted" d="M24 90H590M24 140H590M24 190H590M24 240H590M24 290H590M24 340H590M24 390H590M74 32V438M124 32V438M174 32V438M224 32V438M274 32V438M324 32V438M374 32V438M424 32V438M474 32V438M524 32V438"/>
        <ellipse class="support-orbit" cx="310" cy="235" rx="264" ry="174" transform="rotate(-17 310 235)"/>
        <ellipse cx="326" cy="226" rx="192" ry="155" fill="#b8e4a0" opacity=".08" filter="url(#why-support-glow)"/>
        <g class="support-float">
          <rect x="108" y="66" width="421" height="326" rx="19" class="support-panel"/>
          <path d="M108 109H529" class="support-muted"/>
          <circle cx="133" cy="87" r="4" fill="#d8efc8"/>
          <circle cx="148" cy="87" r="4" fill="#bfe4ac" opacity=".75"/>
          <circle cx="163" cy="87" r="4" fill="#85b68e" opacity=".75"/>
          <rect x="131" y="128" width="375" height="242" rx="12" fill="url(#why-support-panel)" stroke="#d4ecc3" stroke-opacity=".22"/>
          <rect x="151" y="149" width="160" height="11" rx="5.5" fill="#d2edbd" fill-opacity=".52"/>
          <rect x="151" y="170" width="118" height="6" rx="3" fill="#d2edbd" fill-opacity=".24"/>
          <path d="M151 201H285M151 214H270" class="support-muted"/>
          <rect x="151" y="238" width="133" height="88" rx="9" class="support-glass"/>
          <rect x="299" y="238" width="187" height="88" rx="9" class="support-glass"/>
          <path d="M169 259H265M169 273H247M169 287H255M316 258H463M316 272H450" class="support-muted"/>
          <path d="M316 302C348 287 368 308 395 287S441 279 468 262" fill="none" stroke="url(#why-support-path)" stroke-width="4" stroke-linecap="round"/>
          <path d="M151 347H485" class="support-muted"/>
          <circle cx="470" cy="151" r="17" fill="#c8eab5" fill-opacity=".12" stroke="#d3efc1" stroke-opacity=".45"/>
          <path class="support-check" d="M461 151L468 158 480 143" fill="none" stroke="#d9f2c8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <g class="support-update">
          <rect x="22" y="248" width="159" height="145" rx="16" class="support-glass"/>
          <path d="M43 272H153M43 286H124" class="support-muted"/>
          <circle cx="52" cy="315" r="9" fill="#c9eab7" fill-opacity=".2" stroke="#d4efc4" stroke-opacity=".55"/>
          <path d="M48 315L51 318 57 311" fill="none" stroke="#e1f3d3" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M71 311H151M71 324H132" class="support-muted"/>
          <circle cx="52" cy="356" r="9" fill="#c9eab7" fill-opacity=".2" stroke="#d4efc4" stroke-opacity=".55"/>
          <path d="M71 352H151M71 365H129" class="support-muted"/>
        </g>
        <g class="support-update">
          <rect x="433" y="21" width="160" height="105" rx="15" class="support-glass"/>
          <circle cx="458" cy="49" r="10" fill="#c9eab7" fill-opacity=".18" stroke="#d4efc4" stroke-opacity=".55"/>
          <path d="M453 49L457 53 464 44" fill="none" stroke="#e1f3d3" stroke-width="1.7" stroke-linecap="round"/>
          <path d="M479 45H572M479 58H552M452 85H572M452 98H530" class="support-muted"/>
        </g>
        <path d="M60 205C102 139 180 31 311 31S533 90 566 189" fill="none" stroke="url(#why-support-path)" stroke-width="2" stroke-dasharray="5 10"/>
        <path d="M558 179L567 193 576 178" fill="none" stroke="#d1edbf" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="61" cy="205" r="5" class="support-accent support-signal"/>
        <circle cx="566" cy="189" r="5" class="support-accent support-signal"/>
        <circle cx="310" cy="31" r="4" class="support-accent support-signal"/>
      </svg>`
    }
  ];

  const wrap = document.createElement('div');
  wrap.className = 'why-deck-wrap';
  wrap.innerHTML =
    '<div class="why-deck-caption">' +
      '<span class="why-caption-kicker">THE ALIENWAY DIFFERENCE</span>' +
      '<span class="why-caption-instruction">TAP A SIDE CARD TO EXPLORE <i aria-hidden="true"></i></span>' +
    '</div>' +
    '<div class="why-deck" role="group" aria-label="Why choose Alienway — three interactive stacked cards"></div>' +
    '<div class="why-deck-controls">' +
      '<button class="why-deck-control" type="button" data-why-prev aria-label="Previous reason">←</button>' +
      '<span class="why-deck-count" aria-live="polite">01 / 03</span>' +
      '<button class="why-deck-control" type="button" data-why-next aria-label="Next reason">→</button>' +
      '<button class="why-deck-motion" type="button" data-why-motion aria-pressed="false"><span class="why-motion-icon" aria-hidden="true"></span><span data-why-motion-label>Pause motion</span></button>' +
    '</div>' +
    '<span class="why-deck-status" role="status" aria-live="polite"></span>';

  source.replaceWith(wrap);

  const deck = wrap.querySelector('.why-deck');
  const count = wrap.querySelector('.why-deck-count');
  const prev = wrap.querySelector('[data-why-prev]');
  const next = wrap.querySelector('[data-why-next]');
  const motionButton = wrap.querySelector('[data-why-motion]');
  const motionLabel = wrap.querySelector('[data-why-motion-label]');
  const status = wrap.querySelector('.why-deck-status');
  const preference = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  let active = 0;
  let userPaused = false;
  let pointerDown = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let suppressClick = false;
  let enterTimer = null;

  try {
    userPaused = sessionStorage.getItem('awp-why-motion') === 'paused';
  } catch (_) {
    /* Motion preference storage is optional. */
  }

  cards.forEach((item, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'why-deck-card';
    card.dataset.index = String(index);
    card.dataset.theme = item.theme;
    card.innerHTML =
      '<span class="why-card-copy">' +
        '<span class="why-card-meta"><span class="why-card-number">' + item.number + '</span><span class="why-card-label">' + item.label + '</span></span>' +
        '<span class="why-card-title">' + item.title + '<em>' + item.emphasis + '</em></span>' +
        '<span class="why-card-description">' + item.copy + '</span>' +
        '<span class="why-card-footer"><span class="why-card-footer-label">' + item.footer + '</span><span class="why-card-footer-line"></span><span class="why-card-footer-arrow" aria-hidden="true">↗</span></span>' +
      '</span>' +
      '<span class="why-card-visual" aria-hidden="true">' + item.art + '</span>';

    card.addEventListener('click', () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      if (index !== active) setActive(index, 'card');
    });
    deck.appendChild(card);
  });

  function setActive(index, sourceName) {
    active = (index + cards.length) % cards.length;

    Array.from(deck.children).forEach((card, cardIndex) => {
      const offset = (cardIndex - active + cards.length) % cards.length;
      const position = offset === 0 ? 'active' : offset === 1 ? 'right' : 'left';
      card.dataset.position = position;
      card.setAttribute('aria-pressed', String(position === 'active'));
      card.setAttribute(
        'aria-label',
        cards[cardIndex].title + ' ' + cards[cardIndex].emphasis +
        (position === 'active' ? ', selected. ' : ', select to bring forward. ') +
        cards[cardIndex].copy
      );
      card.tabIndex = 0;
      card.classList.remove('is-entering');
      if (position === 'active') {
        void card.offsetWidth;
        card.classList.add('is-entering');
      }
    });

    count.textContent = cards[active].number + ' / 03';
    status.textContent = 'Showing reason ' + cards[active].number + ': ' + cards[active].title + ' ' + cards[active].emphasis;

    if (enterTimer) window.clearTimeout(enterTimer);
    enterTimer = window.setTimeout(() => {
      deck.querySelectorAll('.is-entering').forEach(card => card.classList.remove('is-entering'));
    }, 950);

    if (sourceName === 'keyboard') {
      const activeCard = deck.querySelector('[data-position="active"]');
      if (activeCard) activeCard.focus();
    }
  }

  function updateMotion() {
    const reduced = Boolean(preference.matches);
    section.dataset.paused = String(userPaused || reduced);
    section.dataset.hidden = String(document.hidden);
    motionButton.setAttribute('aria-pressed', String(userPaused || reduced));
    motionButton.disabled = reduced;
    motionLabel.textContent = reduced ? 'Reduced motion' : userPaused ? 'Resume motion' : 'Pause motion';
  }

  prev.addEventListener('click', () => setActive(active - 1, 'control'));
  next.addEventListener('click', () => setActive(active + 1, 'control'));

  motionButton.addEventListener('click', () => {
    if (preference.matches) return;
    userPaused = !userPaused;
    try {
      sessionStorage.setItem('awp-why-motion', userPaused ? 'paused' : 'playing');
    } catch (_) {
      /* Motion preference storage is optional. */
    }
    updateMotion();
  });

  deck.addEventListener('keydown', event => {
    if (!event.target.closest('.why-deck-card')) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setActive(active - 1, 'keyboard');
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setActive(active + 1, 'keyboard');
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActive(0, 'keyboard');
    } else if (event.key === 'End') {
      event.preventDefault();
      setActive(cards.length - 1, 'keyboard');
    }
  });

  deck.addEventListener('pointerdown', event => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    pointerDown = true;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
  });

  window.addEventListener('pointerup', event => {
    if (!pointerDown || event.pointerId !== pointerId) return;
    pointerDown = false;
    pointerId = null;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) > 46 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
      suppressClick = true;
      setActive(active + (deltaX < 0 ? 1 : -1), 'swipe');
      window.setTimeout(() => { suppressClick = false; }, 420);
    }
  });

  window.addEventListener('pointercancel', event => {
    if (event.pointerId === pointerId) {
      pointerDown = false;
      pointerId = null;
    }
  });
  window.addEventListener('blur', () => {
    pointerDown = false;
    pointerId = null;
  });

  if (preference.addEventListener) {
    preference.addEventListener('change', updateMotion);
  } else if (preference.addListener) {
    preference.addListener(updateMotion);
  }
  document.addEventListener('visibilitychange', updateMotion);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry) section.classList.toggle('is-inview', entry.isIntersecting);
    }, { threshold: 0.08, rootMargin: '80px 0px' });
    observer.observe(section);
  } else {
    section.classList.add('is-inview');
  }

  updateMotion();
  setActive(0);
})();