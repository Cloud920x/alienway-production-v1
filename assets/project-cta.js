(() => {
  'use strict';
  const card=document.querySelector('[data-project-cta]');
  if(!card||card.dataset.initialized==='true')return;
  card.dataset.initialized='true';
  const nodes=Array.from(card.querySelectorAll('[data-cta-node]'));
  const index=card.querySelector('.cta-caption-index');
  const copy=card.querySelector('.cta-caption-copy');
  const descriptions={
    discover:['01 / DISCOVER','Understand the business before we build.'],
    design:['02 / DESIGN','Shape a clear experience around real people.'],
    develop:['03 / DEVELOP','Build, test and launch something that works.']
  };
  function activate(node){
    const data=descriptions[node.dataset.ctaNode];if(!data)return;
    nodes.forEach(item=>{const active=item===node;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active));});
    if(index)index.textContent=data[0];if(copy)copy.textContent=data[1];card.dataset.activeStage=node.dataset.ctaNode;
  }
  nodes.forEach(node=>{
    node.addEventListener('click',()=>activate(node));
    node.addEventListener('focus',()=>activate(node));
    node.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')activate(node);});
  });
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(!reduced.matches&&'IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){card.classList.add('is-visible');observer.disconnect();}}),{threshold:.18,rootMargin:'0px 0px -5% 0px'});
    observer.observe(card);
  }else card.classList.add('is-visible');
  if(window.matchMedia('(hover: hover) and (pointer: fine)').matches&&!reduced.matches){
    let frame=0,latest=null;
    card.addEventListener('pointermove',event=>{
      if(event.pointerType!=='mouse')return;
      const r=card.getBoundingClientRect();
      latest={x:Math.max(0,Math.min(100,(event.clientX-r.left)/r.width*100)),y:Math.max(0,Math.min(100,(event.clientY-r.top)/r.height*100)),rx:((event.clientY-r.top)/r.height-.5)*-2.2,ry:((event.clientX-r.left)/r.width-.5)*2.6};
      if(frame)return;
      frame=requestAnimationFrame(()=>{if(latest){card.style.setProperty('--cta-x',latest.x+'%');card.style.setProperty('--cta-y',latest.y+'%');card.style.setProperty('--cta-tilt-x',latest.rx.toFixed(2)+'deg');card.style.setProperty('--cta-tilt-y',latest.ry.toFixed(2)+'deg');card.classList.add('is-pointer-active');}frame=0;});
    });
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--cta-x','50%');card.style.setProperty('--cta-y','50%');card.style.setProperty('--cta-tilt-x','0deg');card.style.setProperty('--cta-tilt-y','0deg');card.classList.remove('is-pointer-active');});
  }
  card.addEventListener('pointerdown',event=>{if(event.pointerType!=='touch'||event.target.closest('a,button'))return;card.classList.add('is-touch-reacting');window.setTimeout(()=>card.classList.remove('is-touch-reacting'),700);});
})();