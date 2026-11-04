(()=>{const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('.main-nav');if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');toggle.textContent=open?'×':'☰'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');toggle.textContent='☰'}));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus();toggle.textContent='☰'}})}
const form=document.querySelector('#enquiry-form');if(form){const params=new URLSearchParams(location.search);const matter=params.get('matter');const select=form.querySelector('[name="matter"]');if(matter&&select){const option=[...select.options].find(o=>o.value.toLowerCase()===matter.toLowerCase());if(option)select.value=option.value}form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const box=document.querySelector('#form-message');if(box){box.classList.add('show');box.setAttribute('role','status');box.textContent='Thank you. This demonstration has checked your enquiry locally, but it has not sent or stored your information. In a live Caldwell Legal website, this step would connect to a secure, firm-approved intake process.';box.scrollIntoView({block:'nearest',behavior:'auto'})}form.reset();if(select&&matter){const option=[...select.options].find(o=>o.value.toLowerCase()===matter.toLowerCase());if(option)select.value=option.value}})}
document.querySelectorAll('[data-current-year]').forEach(el=>el.textContent=new Date().getFullYear());

/* Scroll reveals: each element animates once as it enters view. */
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced){
 const revealSets=[
  ['.hero-copy > .eyebrow','left'],['.hero-copy h1 .hero-line','left'],['.hero-copy > p:not(.eyebrow):not(.hero-aside)','left'],['.hero-actions','up'],['.hero-aside','up'],['.hero-visual','right'],['.hero-stamp','right'],
  ['.trust-item','up'],['.section-heading','up'],['.practice-card','up'],['.approach-card','up'],['.people-art','left'],['.people-copy > *','right'],['.insight-card','up'],['.cta-panel','up'],
  ['.page-hero-inner > *','left'],['.intro-grid > *','up'],['.value-card','up'],['.practice-detail','up'],['.profile-card','up'],['.article','up'],['.contact-aside > *','left'],['.enquiry-form','right'],['.legal-copy > *','up']
 ];
 const seen=new Set(),targets=[];
 revealSets.forEach(([selector,direction])=>document.querySelectorAll(selector).forEach((el,index)=>{if(seen.has(el))return;seen.add(el);el.dataset.reveal=direction;el.style.setProperty('--reveal-delay',Math.min(index,5)*75+'ms');targets.push(el)}));
 document.documentElement.classList.add('motion-ready');
 const pending=new Set(targets);let revealFrame=false;
 const revealCheck=()=>{pending.forEach(el=>{const rect=el.getBoundingClientRect();if(rect.top<window.innerHeight*.92&&rect.bottom>0){el.classList.add('is-visible');pending.delete(el)}});revealFrame=false};
 const scheduleReveal=()=>{if(!revealFrame){requestAnimationFrame(revealCheck);revealFrame=true}};
 window.addEventListener('scroll',scheduleReveal,{passive:true});window.addEventListener('resize',scheduleReveal,{passive:true});revealCheck();
}

/* Restrained 3D card response on mouse/trackpad; touch remains simple. */
const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
if(finePointer&&!reduced){
 document.querySelectorAll('.practice-card,.value-card,.profile-card,.insight-card,.practice-detail,.approach-card,.article,.trust-item').forEach(card=>{
  card.dataset.reactiveCard='true';
  card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;card.style.setProperty('--pointer-x',(x*100)+'%');card.style.setProperty('--pointer-y',(y*100)+'%');card.style.setProperty('--tilt-x',((.5-y)*4)+'deg');card.style.setProperty('--tilt-y',((x-.5)*4)+'deg')});
  card.addEventListener('pointerleave',()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');card.style.setProperty('--pointer-x','50%');card.style.setProperty('--pointer-y','50%')});
 });
 const hero=document.querySelector('.hero');if(hero)hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--ambient-x',((e.clientX-r.left)/r.width*100)+'%');hero.style.setProperty('--ambient-y',((e.clientY-r.top)/r.height*100)+'%')});
}

/* Thin progress line at the top of the page. */
const progress=document.createElement('div');progress.className='scroll-progress';progress.setAttribute('aria-hidden','true');document.body.prepend(progress);
let ticking=false;const updateProgress=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;progress.style.transform='scaleX('+(max>0?window.scrollY/max:0)+')';ticking=false};window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateProgress);ticking=true}},{passive:true});window.addEventListener('resize',updateProgress,{passive:true});updateProgress();
})();