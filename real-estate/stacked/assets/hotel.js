import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#hotelCanvas");
const shell = document.querySelector("#sceneShell");
const loader = document.querySelector("#sceneLoader");
const note = document.querySelector("#interactionNote");
const timeToggle = document.querySelector("#timeToggle");
const heroCopy = document.querySelector("#heroCopy");
if (!canvas || !shell) throw new Error("Beza's Hotel scene could not find its canvas.");

const scene = new THREE.Scene();
const daySky = new THREE.Color("#a9c4c8");
const nightSky = new THREE.Color("#071827");
scene.background = daySky.clone();
scene.fog = new THREE.FogExp2("#a9c4c8", 0.006);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 500);
camera.position.set(37, 22, 48);
const isSmallScreen = window.matchMedia("(max-width: 700px)").matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSmallScreen, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1 : 1.35));
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 25;
controls.maxDistance = 82;
controls.minPolarAngle = 0.65;
controls.maxPolarAngle = 1.42;
controls.target.set(0, 5, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.32;

const hemi = new THREE.HemisphereLight("#d9efff", "#8b897c", 2.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight("#fff0d2", 3.5);
sun.position.set(-28, 42, 24);
sun.castShadow = false;
scene.add(sun);
const moon = new THREE.DirectionalLight("#9dbce8", 0.1);
moon.position.set(20,30,-20); scene.add(moon);

const mat = (color, roughness=0.7, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});
const stone = mat("#e6dfd0",0.82);
const paleStone = mat("#f0eadd",0.76);
const darkStone = mat("#8b8d83",0.78);
const glass = new THREE.MeshPhysicalMaterial({color:"#8fb9c2",roughness:0.12,metalness:0.18,transparent:true,opacity:0.58, transmission:0.12});
const darkGlass = new THREE.MeshPhysicalMaterial({color:"#274d58",roughness:0.15,metalness:0.28,transparent:true,opacity:0.78});
const bronze = new THREE.MeshStandardMaterial({color:"#b89a6b",roughness:0.3,metalness:0.72});
const dark = mat("#243a3b",0.48);
const green = mat("#315b4a",0.9);
const sand = mat("#c9b99a",0.95);
const waterMat = new THREE.MeshPhysicalMaterial({color:"#2d91a0",roughness:0.18,metalness:0.22,clearcoat:1,clearcoatRoughness:0.08});

const hotel = new THREE.Group(); scene.add(hotel);
const ground = new THREE.Mesh(new THREE.BoxGeometry(62,1.2,42),sand); ground.position.set(0,-0.8,0); ground.receiveShadow=true; hotel.add(ground);
function box(parent,w,h,d,material,x,y,z,cast=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(parent,r1,r2,h,material,x,y,z,segments=12){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}

// Low, layered coastal architecture with a central arrival pavilion and two guest wings.
box(hotel,34,7.8,13,stone,0,4.1,-1);
box(hotel,24,2.1,15,paleStone,0,9.05,-1.5);
box(hotel,19,5.8,10,paleStone,0,13.0,-3.2);
box(hotel,18,0.45,10,bronze,0,16.0,-3.2);
box(hotel,15,2.1,9,stone,0,17.15,-3.2);
box(hotel,13,0.35,8,bronze,0,18.35,-3.2);
box(hotel,18,1.2,11,dark,0,19.1,-3.2);
box(hotel,12,0.5,8,green,0,19.95,-3.2);

// Guest wings and stepped balconies.
for(const side of [-1,1]){
  const wing=new THREE.Group(); hotel.add(wing); wing.position.x=side*20;
  box(wing,13,6.6,12,stone,0,3.5,-2);
  box(wing,14,0.38,13,paleStone,0,7.0,-2);
  box(wing,11,4.4,10,paleStone,side*-0.5,9.4,-3);
  box(wing,12,0.32,11,bronze,side*-0.5,11.7,-3);
  box(wing,8,2.8,8,stone,side*-0.5,13.25,-3);
  for(let floor=0;floor<2;floor++){
    const y=2.1+floor*2.35;
    for(let i=0;i<5;i++){
      const x=-5+i*2.5;
      box(wing,1.9,1.65,0.12,glass,x,y,4.08,false);
      box(wing,2.05,0.08,0.16,bronze,x,y-0.88,4.12,false);
    }
  }
  box(wing,14,0.18,2.1,dark,x,1.0,5.6);
  for(let i=0;i<6;i++) cylinder(wing,0.045,0.045,0.8,bronze,-6+i*2.4,1.4,6.5,8);
}

// Main facade glazing, mullions and warm interior reveals.
for(let floor=0;floor<3;floor++){
  const y=2.0+floor*2.35;
  for(let i=0;i<11;i++){
    const x=-15+i*3;
    box(hotel,2.35,1.65,0.13,glass,x,y,5.58,false);
    box(hotel,0.055,1.75,0.16,bronze,x,y,5.68,false);
    box(hotel,2.42,0.07,0.18,bronze,x,y-0.88,5.68,false);
  }
}
for(let i=0;i<9;i++) box(hotel,0.1,7.4,0.18,bronze,-16+i*4,4.2,5.72,false);

// Grand arrival canopy and interactive double doors.
box(hotel,10,0.45,5,paleStone,0,5.1,8.1);
for(let x of [-4.7,4.7]) box(hotel,0.34,5.2,0.38,bronze,x,2.55,9.65);
const doorPivot=new THREE.Group(); doorPivot.position.set(-0.04,0.1,5.72); hotel.add(doorPivot);
const door=box(doorPivot,2.2,3.7,0.18,darkGlass,1.1,1.95,0);
box(doorPivot,0.06,3.7,0.22,bronze,0.03,1.95,0);
const handle=box(doorPivot,0.09,0.72,0.1,bronze,1.82,1.9,0.17);
box(hotel,4.9,0.28,0.42,bronze,0,0.18,5.9);
box(hotel,0.4,0.25,0.18,paleStone,-2.7,0.16,5.7);
box(hotel,0.4,0.25,0.18,paleStone,2.7,0.16,5.7);

// Infinity pool, deck and ocean-facing terraces.
box(hotel,43,0.45,9,paleStone,0,0.05,13.4);
const pool=new THREE.Mesh(new THREE.BoxGeometry(34,0.35,6.6),waterMat); pool.position.set(0,0.32,15.0); hotel.add(pool);
for(let x=-16;x<=16;x+=2) box(hotel,0.12,0.55,0.12,bronze,x,0.35,18.2,false);
box(hotel,44,0.18,0.6,bronze,0,0.35,18.4,false);
for(let side of [-1,1]){
  for(let i=0;i<4;i++){
    const lounger=new THREE.Group();hotel.add(lounger);lounger.position.set(side*(13+i*2.2),0.45,11.5+(i%2)*1.2);lounger.rotation.y=side*0.12;
    box(lounger,1.25,0.16,2.5,paleStone,0,0.2,0);
    const back=box(lounger,1.2,0.12,1.35,stone,0,0.75,-0.48);back.rotation.x=-0.3;
  }
}

// Landscaping: palms, low planting and sculptural planters.
function palm(x,z,scale=1){
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);hotel.add(g);
  cylinder(g,0.22,0.34,5.2,sand,0,2.6,0,10);
  const crown=new THREE.Group();crown.position.y=5.1;g.add(crown);
  for(let i=0;i<9;i++){
    const a=i*Math.PI*2/9;
    const leaf=box(crown,0.18,0.1,3.7,green,Math.sin(a)*1.3,Math.cos(a)*0.22,Math.cos(a)*1.3,false);
    leaf.rotation.y=a;leaf.rotation.x=-0.18-Math.abs(Math.sin(a))*0.12;
  }
  cylinder(g,1.05,1.15,0.6,dark,0,0.3,0,16);
}
[[-25,8,1.15],[25,8,1.15],[-29,-8,1],[29,-8,1],[-17,18,.85],[18,18,.85],[-31,1,.9],[31,1,.9]].forEach(p=>palm(...p));
for(let i=0;i<18;i++){
  const x=-28+(i%9)*7;const z=-13+Math.floor(i/9)*5;
  const shrub=new THREE.Mesh(new THREE.IcosahedronGeometry(1.1+(i%3)*0.25,1),green);shrub.position.set(x,0.8,z);shrub.scale.y=.75;shrub.castShadow=true;hotel.add(shrub);
}

// Beach and ocean plane with restrained animated wave geometry.
const beach=box(scene,100,0.4,20,sand,0,-1.25,29,false);
const waterGeo=new THREE.PlaneGeometry(240,150,42,28);waterGeo.rotateX(-Math.PI/2);
const water=new THREE.Mesh(waterGeo,new THREE.MeshPhysicalMaterial({color:"#2a7182",roughness:.25,metalness:.2,clearcoat:.8,transparent:false}));
water.position.set(0,-1.2,95);water.receiveShadow=true;scene.add(water);
const waveBase=waterGeo.attributes.position.array.slice();
const sunOrb=new THREE.Mesh(new THREE.SphereGeometry(2.1,24,16),new THREE.MeshBasicMaterial({color:"#f4d7a0"}));sunOrb.position.set(-34,29,-40);scene.add(sunOrb);
const moonOrb=new THREE.Mesh(new THREE.SphereGeometry(1.55,24,16),new THREE.MeshBasicMaterial({color:"#d7e5ef"}));moonOrb.position.set(-34,29,-40);moonOrb.visible=false;scene.add(moonOrb);
const stars=new THREE.Group();scene.add(stars);
for(let i=0;i<75;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(.075,5,5),new THREE.MeshBasicMaterial({color:"#dce8f2"}));const a=Math.random()*Math.PI*2;const r=70+Math.random()*80;s.position.set(Math.cos(a)*r,20+Math.random()*65,-35-Math.random()*90);stars.add(s);}

// Small warm lights along the facade.
const poolLight=new THREE.PointLight("#53d9e9",0,18,2);poolLight.position.set(0,1,15);scene.add(poolLight);

const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let doorOpen=false;let isNight=false;let noteTimer;
function showNote(text){note.textContent=text;note.classList.add("show");clearTimeout(noteTimer);noteTimer=setTimeout(()=>note.classList.remove("show"),2600);}
canvas.addEventListener("pointerdown",e=>{const rect=canvas.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObject(door,true);if(hits.length){doorOpen=!doorOpen;if(window.gsap){window.gsap.to(doorPivot.rotation,{y:doorOpen?-1.25:0,duration:.9,ease:"power3.inOut"});}else doorPivot.rotation.y=doorOpen?-1.25:0;showNote(doorOpen?"Welcome. The doors are open.":"The entrance is closed.");}});
function setNight(value){isNight=value;timeToggle.classList.toggle("night",isNight);timeToggle.querySelector(".toggle-label").textContent=isNight?"MOONLIGHT":"DAYLIGHT";timeToggle.setAttribute("aria-label",isNight?"Switch to daylight view":"Switch to night view");const target=isNight?nightSky:daySky;scene.background.copy(target);scene.fog.color.copy(target);hemi.intensity=isNight?.35:2.1;sun.intensity=isNight?.05:3.5;moon.intensity=isNight?1.35:.1;sunOrb.visible=!isNight;moonOrb.visible=isNight;stars.visible=isNight;poolLight.intensity=isNight?1.8:0;renderer.toneMappingExposure=isNight?.82:1.15;hotel.traverse(o=>{if(o.material===glass||o.material===darkGlass){o.material.emissive=new THREE.Color(isNight?"#b47a43":"#000000");o.material.emissiveIntensity=isNight?.18:0;}});}
timeToggle.addEventListener("click",()=>setNight(!isNight));

const cameraPath={x:37,y:22,z:48,tx:0,ty:5,tz:0};
function applyCamera(){camera.position.set(cameraPath.x,cameraPath.y,cameraPath.z);controls.target.set(cameraPath.tx,cameraPath.ty,cameraPath.tz);controls.update();}
let scrollTween=null;
if(window.gsap&&window.ScrollTrigger){
  window.gsap.registerPlugin(window.ScrollTrigger);
  scrollTween=window.gsap.to(cameraPath,{x:13,y:9,z:25,tx:0,ty:4,tz:1,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"+=115%",scrub:1.1,pin:".scene-shell",pinSpacing:true,anticipatePin:1,onUpdate:self=>{controls.autoRotate=self.progress<0.015;applyCamera();if(heroCopy){const p=self.progress;heroCopy.style.opacity=String(Math.max(0,1-p*3.2));heroCopy.style.transform="translate3d(0,"+(-42-p*35)+"%, "+(-p*110)+"px)";}}}});
  window.gsap.fromTo(".intro-grid > div",{y:45,opacity:0},{y:0,opacity:1,duration:1,ease:"power2.out",scrollTrigger:{trigger:".intro-grid",start:"top 78%"}});
  window.gsap.fromTo(".feature-copy",{y:35,opacity:0},{y:0,opacity:1,duration:1,ease:"power2.out",scrollTrigger:{trigger:".feature-copy",start:"top 78%"}});
}
function resize(){const w=shell.clientWidth,h=shell.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,w<700?1:1.35));}
window.addEventListener("resize",resize,{passive:true});resize();

const clock=new THREE.Clock();
let frame=0,lastFrame=0;
const frameInterval=1000/30;
function animate(now=0){
  requestAnimationFrame(animate);
  if(now-lastFrame<frameInterval)return;
  lastFrame=now;
  const t=clock.getElapsedTime();const pos=waterGeo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=waveBase[i*3],z=waveBase[i*3+2];pos.array[i*3+1]=Math.sin(x*.12+t*.8)*.13+Math.sin(z*.16+t*.55)*.09;}
  pos.needsUpdate=true;
  controls.update();renderer.render(scene,camera);
  if(frame++===2){loader.classList.add("done");document.querySelector("#preloader")?.classList.add("done");}
}
animate();
window.addEventListener("load",()=>setTimeout(()=>{loader.classList.add("done");document.querySelector("#preloader")?.classList.add("done");},1800),{once:true});
