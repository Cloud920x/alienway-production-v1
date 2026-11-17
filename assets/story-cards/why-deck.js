(() => {
  'use strict';
  const section=document.querySelector('.why-alienway');
  const source=section&&section.querySelector('.why-grid');
  if(!section||!source||section.dataset.whyDeckReady==='true')return;
  section.dataset.whyDeckReady='true';

  const cards=[
    {
      number:'01',label:'DESIGN / IDENTITY',title:'Distinctive',emphasis:'by design.',
      copy:'We shape each website around your brand, your customers and the way your business works — not a recycled layout with your logo dropped in.',
      footer:'YOUR BUSINESS. YOUR DIGITAL IDENTITY.',
      art:`<svg viewBox="0 0 420 330" role="img" aria-label="Layered architectural forms representing original design">
        <defs>
          <linearGradient id="why-design-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c6eaf6" stop-opacity=".24"/><stop offset="1" stop-color="#79aeca" stop-opacity=".035"/></linearGradient>
          <linearGradient id="why-design-edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d3f0fa" stop-opacity=".9"/><stop offset="1" stop-color="#8bbbd3" stop-opacity=".12"/></linearGradient>
        </defs>
        <path class="visual-line-soft" d="M36 269 211 37 385 269M62 269 211 70 360 269M92 269 211 105 330 269"/>
        <g class="visual-design-shift">
          <path d="M105 224 210 70 315 224 210 285Z" fill="url(#why-design-glass)" stroke="url(#why-design-edge)" stroke-width="1.4"/>
          <path d="M105 224 210 163 315 224M210 70V163M210 163V285" class="visual-line"/>
          <path d="M145 247 210 210 275 247M145 247V171L210 132 275 171V247" class="visual-line-soft"/>
          <path d="M169 235V182L210 158 251 182V235" fill="none" stroke="#c5eaf6" stroke-opacity=".68" stroke-width="1.2"/>
        </g>
        <path d="M48 286H372" class="visual-line-soft"/>
        <path d="M65 286H151" class="visual-line visual-pulse"/>
        <circle cx="315" cy="83" r="4" class="visual-highlight visual-pulse-dot"/>
        <circle cx="315" cy="83" r="17" fill="none" stroke="#a8dced" stroke-opacity=".28"/>
        <path d="M315 66V54M332 83H344" class="visual-line-soft"/>
      </svg>`
    },
    {
      number:'02',label:'FUNCTION / SYSTEMS',title:'Built to',emphasis:'do more.',
      copy:'Bookings, enquiries, product journeys and management tools — we build practical digital experiences that make everyday business easier.',
      footer:'BEAUTIFUL, USEFUL, BUILT TO WORK.',
      art:`<svg viewBox="0 0 420 330" role="img" aria-label="Connected modules representing useful business systems">
        <defs><linearGradient id="why-system-fill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c6eaf6" stop-opacity=".2"/><stop offset="1" stop-color="#79aeca" stop-opacity=".025"/></linearGradient></defs>
        <path d="M54 166H142L206 91H301M142 166 206 241H329M206 91V241" class="visual-line-soft"/>
        <path d="M54 166H142L206 91H301" class="visual-line visual-pulse"/>
        <g class="visual-network-flow">
          <rect x="38" y="130" width="90" height="72" rx="13" class="visual-glass"/>
          <rect x="166" y="50" width="91" height="82" rx="13" fill="url(#why-system-fill)" stroke="rgba(193,229,244,.55)"/>
          <rect x="281" y="130" width="100" height="72" rx="13" class="visual-glass"/>
          <rect x="166" y="207" width="91" height="82" rx="13" class="visual-glass"/>
          <path d="M58 151H108M58 164H94M58 177H101M185 73H237M185 87H226M185 101H232M302 151H360M302 165H347M302 179H355M185 230H237M185 244H224M185 258H232" class="visual-line-soft"/>
          <circle cx="83" cy="116" r="5" class="visual-highlight visual-pulse-dot"/>
          <circle cx="211" cy="34" r="5" class="visual-highlight visual-pulse-dot"/>
          <circle cx="330" cy="116" r="5" class="visual-highlight visual-pulse-dot"/>
          <circle cx="211" cy="307" r="5" class="visual-highlight visual-pulse-dot"/>
        </g>
        <circle cx="206" cy="166" r="17" fill="#a9dced" fill-opacity=".12" stroke="#bce7f5" stroke-opacity=".8"/>
        <circle cx="206" cy="166" r="4" class="visual-highlight"/>
        <path d="M206 149V132M223 166H241M206 183V200M189 166H171" class="visual-line"/>
      </svg>`
    },
    {
      number:'03',label:'PARTNERSHIP / SUPPORT',title:'Better',emphasis:'after launch.',
      copy:'Our relationship does not end when your site goes live. We stay involved with maintenance, updates and improvements that keep your digital presence moving forward.',
      footer:'LAUNCH IS THE START, NOT THE END.',
      art:`<svg viewBox="0 0 420 330" role="img" aria-label="An illuminated path moving toward a horizon, representing long-term growth">
        <defs><linearGradient id="why-growth-path" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#80b8d2" stop-opacity=".06"/><stop offset="1" stop-color="#c7edf8" stop-opacity=".58"/></linearGradient></defs>
        <circle cx="284" cy="91" r="47" fill="#b5e3f2" fill-opacity=".07"/>
        <circle cx="284" cy="91" r="29" fill="none" stroke="#b5e3f2" stroke-opacity=".5"/>
        <path d="M30 257C97 245 115 225 161 215S235 183 271 157 333 123 389 112" fill="none" stroke="url(#why-growth-path)" stroke-width="28" stroke-linecap="round"/>
        <path d="M30 257C97 245 115 225 161 215S235 183 271 157 333 123 389 112" class="visual-line visual-pulse"/>
        <path d="M37 287H384M68 270 118 254M125 284 172 262M206 276 248 247M284 263 322 235" class="visual-line-soft"/>
        <g class="visual-horizon-rise">
          <path d="M82 224 82 180 116 180M152 204 152 145 188 145M224 173 224 112 260 112M300 142 300 83 337 83" class="visual-line"/>
          <circle cx="116" cy="180" r="5" class="visual-highlight"/>
          <circle cx="188" cy="145" r="5" class="visual-highlight"/>
          <circle cx="260" cy="112" r="5" class="visual-highlight"/>
          <circle cx="337" cy="83" r="5" class="visual-highlight visual-pulse-dot"/>
        </g>
        <path d="M40 257C100 252 145 239 194 215S294 158 380 112" fill="none" stroke="#d0edf7" stroke-opacity=".7" stroke-width="1.4"/>
        <circle cx="380" cy="112" r="5" class="visual-highlight visual-pulse-dot"/>
      </svg>`
    }
  ];

  const wrap=document.createElement('div');
  wrap.className='why-deck-wrap';
  wrap.innerHTML='<div class="why-deck-caption"><span>THE ALIENWAY DIFFERENCE</span></div><div class="why-deck" role="group" aria-label="Why choose Alienway — interactive stacked cards"></div><div class="why-deck-controls"><button class="why-deck-control" type="button" data-why-prev aria-label="Previous reason">←</button><span class="why-deck-count" aria-live="polite">01 / 03</span><button class="why-deck-control" type="button" data-why-next aria-label="Next reason">→</button></div>';
  source.replaceWith(wrap);
  const deck=wrap.querySelector('.why-deck');
  const count=wrap.querySelector('.why-deck-count');
  const prev=wrap.querySelector('[data-why-prev]');
  const next=wrap.querySelector('[data-why-next]');
  let active=0,startX=0,pointerDown=false,pointerId=null,suppressClick=false,enterTimer=null;

  cards.forEach((item,index)=>{
    const card=document.createElement('button');
    card.type='button';
    card.className='why-deck-card';
    card.dataset.index=String(index);
    card.innerHTML='<span class="why-card-copy"><span class="why-card-meta"><span class="why-card-number">'+item.number+'</span><span class="why-card-label">'+item.label+'</span></span><span class="why-card-title">'+item.title+'<em>'+item.emphasis+'</em></span><span class="why-card-description">'+item.copy+'</span><span class="why-card-footer"><span class="why-card-footer-label">'+item.footer+'</span><span class="why-card-footer-line"></span><span class="why-card-footer-arrow" aria-hidden="true">↗</span></span></span><span class="why-card-visual" aria-hidden="true">'+item.art+'</span>';
    card.setAttribute('aria-label',item.title+' '+item.emphasis+' '+item.copy);
    card.addEventListener('click',()=>{
      if(suppressClick){suppressClick=false;return;}
      if(index!==active)setActive(index);
    });
    deck.appendChild(card);


  });

  function setActive(index){
    active=(index+cards.length)%cards.length;
    [...deck.children].forEach((card,i)=>{
      const offset=(i-active+cards.length)%cards.length;
      const position=offset===0?'active':offset===1?'right':'left';
      card.dataset.position=position;
      card.setAttribute('aria-pressed',String(position==='active'));
      card.setAttribute('aria-label',cards[i].title+' '+cards[i].emphasis+(position==='active'?', selected':', select to bring forward'));
      card.tabIndex=0;
      card.classList.remove('is-entering');
      if(position==='active'){
        void card.offsetWidth;
        card.classList.add('is-entering');
      }
    });
    count.textContent=cards[active].number+' / 03';
    if(enterTimer)window.clearTimeout(enterTimer);
    enterTimer=window.setTimeout(()=>deck.querySelectorAll('.is-entering').forEach(card=>card.classList.remove('is-entering')),900);
  }

  prev.addEventListener('click',()=>setActive(active-1));
  next.addEventListener('click',()=>setActive(active+1));
  deck.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'){event.preventDefault();setActive(active-1);}
    if(event.key==='ArrowRight'){event.preventDefault();setActive(active+1);}
  });
  deck.addEventListener('pointerdown',event=>{
    if(!event.isPrimary)return;
    if(event.pointerType==='mouse'&&event.button!==0)return;
    pointerDown=true;
    pointerId=event.pointerId;
    startX=event.clientX;
  });
  window.addEventListener('pointerup',event=>{
    if(!pointerDown||event.pointerId!==pointerId)return;
    pointerDown=false;
    pointerId=null;
    const delta=event.clientX-startX;
    if(Math.abs(delta)>48){
      suppressClick=true;
      setActive(active+(delta<0?1:-1));
      window.setTimeout(()=>{suppressClick=false;},350);
    }
  });
  window.addEventListener('pointercancel',event=>{
    if(event.pointerId===pointerId){pointerDown=false;pointerId=null;}
  });
  window.addEventListener('blur',()=>{pointerDown=false;pointerId=null;});
  setActive(0);
})();