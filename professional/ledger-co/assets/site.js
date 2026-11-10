(()=>{"use strict";document.documentElement.classList.add("js");const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;const menu=document.querySelector(".menu-toggle");const nav=document.querySelector(".main-nav");const header=document.querySelector(".site-header");const closeMenu=()=>{if(!menu||!nav)return;menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","Open navigation");nav.classList.remove("open")};if(menu&&nav){menu.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")!=="true";menu.setAttribute("aria-expanded",String(open));menu.setAttribute("aria-label",open?"Close navigation":"Open navigation");nav.classList.toggle("open",open)});nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menu.getAttribute("aria-expanded")==="true"){closeMenu();menu.focus()}});document.addEventListener("click",e=>{if(!nav.contains(e.target)&&!menu.contains(e.target))closeMenu()})}window.addEventListener("resize",()=>{if(innerWidth>1180)closeMenu()},{passive:true});const current=location.pathname.split("/").pop()||"index.html";document.querySelectorAll(".main-nav a").forEach(a=>{if(a.getAttribute("href")===current)a.setAttribute("aria-current","page")});if(current==="appointments.html")document.querySelector(".nav-cta")?.setAttribute("aria-current","page");const onScroll=()=>{if(header)header.classList.toggle("scrolled",window.scrollY>12)};onScroll();window.addEventListener("scroll",onScroll,{passive:true});document.querySelectorAll("[data-year]").forEach(el=>el.textContent=new Date().getFullYear());const targets=[...document.querySelectorAll("[data-reveal]")];if(reduced||!("IntersectionObserver"in window)){targets.forEach(el=>el.classList.add("is-visible"))}else{const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}})},{threshold:0,rootMargin:"0px 0px -20px 0px"});targets.forEach(el=>observer.observe(el));}const date=document.getElementById("appointment-date");if(date){const now=new Date();date.min=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10)}const params=new URLSearchParams(location.search);const service=document.getElementById("appointment-service");const serviceAliases={"business registration guidance":"business setup support","finance workflow setup":"business setup support","payroll setup support":"payroll & people admin","business planning":"business advisory","business support":"business setup support"};const resolveService=value=>serviceAliases[value.toLowerCase()]||value.toLowerCase();if(service&&params.has("service")){const wanted=resolveService(params.get("service"));const option=[...service.options].find(o=>o.text.toLowerCase()===wanted||o.text.toLowerCase().includes(wanted));if(option)service.value=option.value||option.text}const packageName=params.get("package");if(packageName){const message=document.querySelector("#appointment-form textarea[name=message]");if(message&&!message.value)message.value="I would like to discuss the "+packageName+" package."}const forms=[{id:"appointment-form",status:"appointment-status",kind:"consultation"},{id:"contact-form",status:"contact-status",kind:"enquiry"}];forms.forEach(({id,status,kind})=>{const form=document.getElementById(id);if(!form)return;form.addEventListener("submit",e=>{e.preventDefault();if(!form.reportValidity())return;const output=document.getElementById(status);if(output)output.textContent=kind==="consultation"?"Demo request complete. No appointment has been booked, sent or saved.":"Demo enquiry complete. Your details have not been sent or saved.";form.reset();if(service&&params.has("service")){const wanted=resolveService(params.get("service"));const option=[...service.options].find(o=>o.text.toLowerCase()===wanted||o.text.toLowerCase().includes(wanted));if(option)service.value=option.value||option.text}})});document.querySelectorAll(".faq-list details").forEach(d=>d.addEventListener("toggle",()=>{if(d.open)document.querySelectorAll(".faq-list details").forEach(other=>{if(other!==d)other.open=false})}))})();
/* Shared card response, with native links and touch scrolling preserved. */
(()=>{
 "use strict";
 const motion=matchMedia("(prefers-reduced-motion: reduce)");
 const fine=matchMedia("(hover: hover) and (pointer: fine)");
 const cards=document.querySelectorAll(".service-card,.client-type,.price-preview,.package-card,.team-card,.service-detail,.principle-grid article,.pillar-grid article,.checklist-card,.floating-note,.rhythm-steps article,.process-list article");
 cards.forEach(card=>{
  card.classList.add("motion-card");
  let frame=0;
  const reset=()=>{cancelAnimationFrame(frame);frame=0;card.classList.remove("is-pressed");card.style.removeProperty("--card-angle");card.style.removeProperty("--card-axis");};
  card.addEventListener("pointermove",e=>{
   if(motion.matches||!fine.matches||e.pointerType==="touch")return;
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{
    frame=0;
    const r=card.getBoundingClientRect();
    const x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
    const y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));
    card.style.setProperty("--card-x",x*100+"%");
    card.style.setProperty("--card-y",y*100+"%");
    card.style.setProperty("--card-axis",(0.5-y)+" "+(x-0.5)+" 0");
    card.style.setProperty("--card-angle",Math.hypot(x-.5,y-.5)*3+"deg");
   });
  },{passive:true});
  card.addEventListener("pointerdown",e=>{if(e.button===0&&!motion.matches)card.classList.add("is-pressed")},{passive:true});
  ["pointerup","pointercancel","pointerleave","lostpointercapture"].forEach(name=>card.addEventListener(name,reset,{passive:true}));
  motion.addEventListener("change",reset);
 });
})();


// Shared Alienway exit control: adds a floating return button or upgrades the existing Ledger link.
(() => {
  const loader = document.createElement("script");
  loader.src = "../../assets/awp-exit.js";
  loader.dataset.home = "../../index.html";
  document.body.appendChild(loader);
})();
