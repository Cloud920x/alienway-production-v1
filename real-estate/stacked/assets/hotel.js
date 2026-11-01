import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#hotelCanvas");
const shell = document.querySelector(".world");
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
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.5 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
renderer.useLegacyLights = false;

const controls = new OrbitControls(camera, canvas);
// OrbitControls sets touch-action:none; restore vertical page swipes so the guided tour scrolls on phones.
canvas.style.touchAction = "pan-y";
controls.enableDamping = true;
controls.dampingFactor = 0.055;
// Keep the hotel orientation fixed: the scroll journey moves the camera, never the building.
controls.enableRotate = false;
controls.autoRotate = false;
controls.enablePan = false;
controls.minDistance = 3;
controls.maxDistance = 65;
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = 1.55;
controls.target.set(0, 5, 0);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.32;

const hemi = new THREE.HemisphereLight("#d9efff", "#8b897c", 2.1);
scene.add(hemi);
const sun = new THREE.DirectionalLight("#fff0d2", 3.5);
sun.position.set(-28, 42, 24);
sun.castShadow = true;
sun.shadow.mapSize.set(isSmallScreen ? 1024 : 2048, isSmallScreen ? 1024 : 2048);
sun.shadow.camera.left = -48; sun.shadow.camera.right = 48; sun.shadow.camera.top = 42; sun.shadow.camera.bottom = -32;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 110; sun.shadow.bias = -0.00018;
sun.shadow.normalBias = 0.025;
scene.add(sun);
const moon = new THREE.DirectionalLight("#9dbce8", 0.1);
moon.position.set(20,30,-20); scene.add(moon);

const mat = (color, roughness=0.7, metalness=0) => new THREE.MeshStandardMaterial({color,roughness,metalness});

// Lightweight procedural PBR surfaces: subtle mineral grain and travertine striation.
// These are generated in-browser, so the scene gains material depth without large downloads.
function makeSurfaceMap(kind, base, seed=1) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = base; ctx.fillRect(0,0,512,512);
  let state = seed >>> 0;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  const pixels = ctx.getImageData(0,0,512,512);
  for (let i=0;i<pixels.data.length;i+=4) {
    const n = (random()-.5) * (kind === "travertine" ? 13 : 19);
    pixels.data[i] = Math.max(0,Math.min(255,pixels.data[i]+n));
    pixels.data[i+1] = Math.max(0,Math.min(255,pixels.data[i+1]+n));
    pixels.data[i+2] = Math.max(0,Math.min(255,pixels.data[i+2]+n));
  }
  ctx.putImageData(pixels,0,0);
  if (kind === "travertine") {
    for(let i=0;i<38;i++){
      const y=random()*512, alpha=.025+random()*.055;
      ctx.strokeStyle = `rgba(112,94,69,${alpha})`;
      ctx.lineWidth=1+random()*5;ctx.beginPath();
      ctx.moveTo(0,y);ctx.bezierCurveTo(130,y-8,350,y+10,512,y+(random()-.5)*22);ctx.stroke();
    }
  } else if (kind === "wood") {
    for(let i=0;i<115;i++){
      const x=random()*512, alpha=.025+random()*.075;
      ctx.strokeStyle=`rgba(65,43,25,${alpha})`;ctx.lineWidth=.5+random()*2;
      ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x-5,150,x+7,350,x+(random()-.5)*8,512);ctx.stroke();
    }
  } else {
    for(let i=0;i<1800;i++){
      const x=random()*512,y=random()*512,r=.3+random()*1.4;
      ctx.fillStyle=`rgba(95,83,65,${random()*.12})`;
      ctx.fillRect(x,y,r,r);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5,1.5);
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(),8);
  return texture;
}
const limestoneMap = makeSurfaceMap("travertine","#e6dfd0",17);
const paleStoneMap = makeSurfaceMap("travertine","#f0eadd",29);
const sandMap = makeSurfaceMap("grain","#c9b99a",41);
const oakMap = makeSurfaceMap("wood","#a9855e",53);
const stone = new THREE.MeshStandardMaterial({color:"#ffffff",map:limestoneMap,roughness:.84,bumpMap:limestoneMap,bumpScale:.035});
const paleStone = new THREE.MeshStandardMaterial({color:"#ffffff",map:paleStoneMap,roughness:.78,bumpMap:paleStoneMap,bumpScale:.025});
const darkStone = mat("#8b8d83",0.78);
const glass = new THREE.MeshPhysicalMaterial({color:"#8fb9c2",roughness:0.12,metalness:0.18,transparent:true,opacity:0.58, transmission:0.12});
const darkGlass = new THREE.MeshPhysicalMaterial({color:"#274d58",roughness:0.15,metalness:0.28,transparent:true,opacity:0.78});
const bronze = new THREE.MeshStandardMaterial({color:"#b89a6b",roughness:0.3,metalness:0.72});
const dark = mat("#243a3b",0.48);
const green = mat("#315b4a",0.9);
const sand = new THREE.MeshStandardMaterial({color:"#ffffff",map:sandMap,roughness:.96,bumpMap:sandMap,bumpScale:.045});
const waterMat = new THREE.MeshPhysicalMaterial({color:"#2d91a0",roughness:0.18,metalness:0.22,clearcoat:1,clearcoatRoughness:0.08});

const hotel = new THREE.Group(); scene.add(hotel);
const facadeFloorWindows = [[], [], []];
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
  box(wing,14,0.18,2.1,dark,0,1.0,5.6);
  for(let i=0;i<6;i++) cylinder(wing,0.045,0.045,0.8,bronze,-6+i*2.4,1.4,6.5,8);
}

// Main facade glazing, mullions and warm interior reveals.
for(let floor=0;floor<3;floor++){
  const y=2.0+floor*2.35;
  for(let i=0;i<11;i++){
    const x=-15+i*3;
    const windowPane = box(hotel,2.35,1.65,0.13,glass,x,y,5.58,false);
    facadeFloorWindows[floor].push(windowPane);
    box(hotel,0.055,1.75,0.16,bronze,x,y,5.68,false);
    box(hotel,2.42,0.07,0.18,bronze,x,y-0.88,5.68,false);
  }
}
for(let i=0;i<9;i++) box(hotel,0.1,7.4,0.18,bronze,-16+i*4,4.2,5.72,false);

// Arrival hall: a real, furnished volume behind the entrance glazing.
const lobby = new THREE.Group();
hotel.add(lobby);
const lobbyFloor = box(lobby,15,0.22,13,mat("#b9ad99",0.72),0,0.18,-1.1,false);
box(lobby,15,0.22,13,mat("#d6c7ae",0.7),0,5.9,-1.1,false);
box(lobby,14.6,0.12,0.18,bronze,0,5.65,-7.45,false);
for (let x of [-7,7]) box(lobby,0.28,5.5,12,stone,x,2.9,-1.1,false);
box(lobby,0.22,5.5,14.5,stone,0,2.9,-7.5,false);
// Layered reception desk, stone counter and warm backlit feature wall.
box(lobby,5.6,1.15,1.15,dark,0,0.78,-5.25);
box(lobby,5.9,0.16,1.3,paleStone,0,1.42,-5.25);
box(lobby,6.2,3.4,0.22,mat("#6e6659",0.9),0,2.55,-7.25,false);
for(let i=0;i<5;i++) box(lobby,0.035,2.9,0.035,bronze,-2.3+i*1.15,2.55,-7.1,false);
// Lounge seating and side tables.
for(const side of [-1,1]){
  const sofa=new THREE.Group();lobby.add(sofa);sofa.position.set(side*4.2,0.25,-1.1);sofa.rotation.y=side*-0.12;
  box(sofa,2.8,0.55,1.05,mat("#b8a58b",0.92),0,0.42,0);
  box(sofa,2.8,0.95,0.28,mat("#c9b99f",0.92),0,0.95,-0.42);
  for(const x of [-1.15,1.15]) box(sofa,0.16,0.35,0.16,dark,x,0.18,0.34);
  cylinder(lobby,0.48,0.48,0.12,bronze,side*2.2,0.45,0.4,20);
  cylinder(lobby,0.42,0.42,0.12,paleStone,side*2.2,0.56,0.4,20);
}
// Indoor palms and a suspended sculptural light.
for(const x of [-6.2,6.2]){
  cylinder(lobby,0.48,0.58,0.75,dark,x,0.55,-3.8,18);
  cylinder(lobby,0.13,0.18,2.8,sand,x,2.25,-3.8,10);
  for(let i=0;i<6;i++){
    const leaf=box(lobby,0.12,0.08,1.8,green,x+Math.cos(i*Math.PI/3)*0.7,3.65,-3.8+Math.sin(i*Math.PI/3)*0.7,false);
    leaf.rotation.y=i*Math.PI/3;leaf.rotation.x=-0.25;
  }
}
const lobbyGlow=new THREE.PointLight("#f6c98b",2.2,18,2);
lobbyGlow.position.set(0,4.7,-2.2);hotel.add(lobbyGlow);
for(const x of [-4.5,0,4.5]){
  const pendant=new THREE.Mesh(new THREE.SphereGeometry(0.16,12,8),new THREE.MeshBasicMaterial({color:"#ffe1ad"}));
  pendant.position.set(x,4.85,-1.8);lobby.add(pendant);
  const light=new THREE.PointLight("#f3c78b",0.55,7,2);light.position.copy(pendant.position);lobby.add(light);
}

// Grand arrival canopy and interactive double doors.
box(hotel,10,0.45,5,paleStone,0,5.1,8.1);
for(let x of [-4.7,4.7]) box(hotel,0.34,5.2,0.38,bronze,x,2.55,9.65);
const leftDoorPivot=new THREE.Group(); leftDoorPivot.position.set(0,0.1,5.72); hotel.add(leftDoorPivot);
const leftDoor=box(leftDoorPivot,1.08,3.7,0.18,darkGlass,-0.54,1.95,0);
box(leftDoorPivot,0.06,3.7,0.22,bronze,-1.06,1.95,0);
box(leftDoorPivot,0.09,0.72,0.1,bronze,-0.88,1.9,0.17);
const rightDoorPivot=new THREE.Group(); rightDoorPivot.position.set(0,0.1,5.72); hotel.add(rightDoorPivot);
const rightDoor=box(rightDoorPivot,1.08,3.7,0.18,darkGlass,0.54,1.95,0);
box(rightDoorPivot,0.06,3.7,0.22,bronze,1.06,1.95,0);
box(rightDoorPivot,0.09,0.72,0.1,bronze,0.88,1.9,0.17);
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


// A furnished ocean-facing suite, built as a dedicated interior walkthrough zone.
const suite = new THREE.Group(); suite.position.set(0,0,-27); scene.add(suite);
const wallWarm=mat("#e7dfd0",0.9), oak=new THREE.MeshStandardMaterial({color:"#ffffff",map:oakMap,roughness:.72,bumpMap:oakMap,bumpScale:.018}), oakLight=new THREE.MeshStandardMaterial({color:"#c1a27a",map:oakMap,roughness:.74,bumpMap:oakMap,bumpScale:.014}), sage=mat("#788879",0.78), quartz=mat("#e9e1d4",0.28), linen=mat("#d8cbb8",0.95), tile=mat("#d6c7ad",0.82), bronzeDetail=mat("#b89a6b",0.3,0.7);
box(suite,18,.35,17,tile,0,.0,0,false);
box(suite,18,.35,.35,wallWarm,0,3.7,-8.3,false);
box(suite,.35,3.7,17,wallWarm,-8.8,1.85,0,false);
box(suite,.35,3.7,17,wallWarm,8.8,1.85,0,false);
box(suite,18,.35,17,wallWarm,0,3.7,0,false);
box(suite,7,3.3,.22,glass,0,1.8,8.25,false);
for(let x=-3.3;x<=3.3;x+=1.1)box(suite,.045,3.25,.12,bronzeDetail,x,1.8,8.38,false);
box(suite,7.3,.14,.2,bronzeDetail,0,.16,8.4,false);
// King bed, upholstered headboard and layered bedding.
box(suite,4.5,.45,6.0,oak,1.6,.48,-1.6);
box(suite,4.7,2.1,.25,oakLight,1.6,1.45,-4.55);
box(suite,4.3,.22,5.65,linen,1.6,.82,-1.6);
box(suite,4.3,.3,2.8,mat("#eee8dc",.98),1.6,1.0,-2.7);
for(let x=-.1;x<=3.3;x+=1.8)box(suite,1.35,.35,1.0,mat("#f5f0e7",.98),x,1.12,-3.2);
box(suite,4.4,.08,1.25,mat("#b4a18a",.95),1.6,1.2,.1);
// Bedside tables and pendant lights.
for(const x of [-1.25,4.45]){box(suite,.9,.72,.85,oak,x,.5,-3.5);cylinder(suite,.12,.12,.08,bronzeDetail,x,.9,-3.5,12);const p=new THREE.PointLight("#f4d7a5",.45,4);p.position.set(x,2.8,-3.5);suite.add(p);}
// Kitchen run: matte sage cabinetry, pale quartz counter and backsplash.
box(suite,5.7,.9,1.5,sage,-4.8,.55,4.0);
box(suite,5.85,.14,1.62,quartz,-4.8,1.08,4.0);
box(suite,5.7,1.25,.12,mat("#f0e9de",.7),-4.8,1.85,3.25,false);
for(let x=-7.5;x<=-2.2;x+=1.75)box(suite,.045,.78,.035,bronzeDetail,x,.55,3.18,false);
box(suite,5.7,.1,1.45,sage,-4.8,2.95,4.0);
box(suite,5.8,.12,1.5,quartz,-4.8,3.58,4.0);
box(suite,.8,.75,.65,mat("#b7b9b3",.3,.45),-6.8,1.55,3.9);
box(suite,.7,.08,.5,mat("#292e30",.25,.4),-6.8,1.96,3.9);
// Dining counter and stools.
box(suite,3.2,.16,1.0,oakLight,-1.8,.95,4.6);
for(let x=-2.8;x<=-.8;x+=1) cylinder(suite,.22,.22,.65,bronzeDetail,x,.45,5.35,12);
// Bathroom partition and vanity visible as a distinct zone.
box(suite,5.0,2.8,.18,wallWarm,5.9,1.4,1.0,false);
box(suite,3.1,.75,1.1,oak,6.5,.45,-1.5);
box(suite,3.2,.12,1.2,quartz,6.5,.9,-1.5);
box(suite,2.8,1.0,.08,glass,6.5,1.65,-2.3,false);
box(suite,2.7,2.5,.12,mat("#d9cbb6",.8),6.5,1.25,-4.0,false);
const suiteLight=new THREE.PointLight("#f8dfb5",1.2,22);suiteLight.position.set(0,3.2,0);suite.add(suiteLight);

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
canvas.addEventListener("pointerdown",e=>{const rect=canvas.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects([leftDoor,rightDoor],true);if(hits.length){doorOpen=!doorOpen;const angle=doorOpen?1.18:0;if(window.gsap){window.gsap.to(leftDoorPivot.rotation,{y:-angle,duration:.95,ease:"power3.inOut"});window.gsap.to(rightDoorPivot.rotation,{y:angle,duration:.95,ease:"power3.inOut"});}else{leftDoorPivot.rotation.y=-angle;rightDoorPivot.rotation.y=angle;}showNote(doorOpen?"Welcome to the arrival hall.":"The entrance is closed.");}});
function setNight(value){isNight=value;timeToggle.classList.toggle("night",isNight);timeToggle.querySelector(".toggle-label").textContent=isNight?"MOONLIGHT":"DAYLIGHT";timeToggle.setAttribute("aria-label",isNight?"Switch to daylight view":"Switch to night view");const target=isNight?nightSky:daySky;scene.background.copy(target);scene.fog.color.copy(target);hemi.intensity=isNight?.35:2.1;sun.intensity=isNight?.05:3.5;moon.intensity=isNight?1.35:.1;sunOrb.visible=!isNight;moonOrb.visible=isNight;stars.visible=isNight;poolLight.intensity=isNight?1.8:0;lobbyGlow.intensity=isNight?2.8:1.25;renderer.toneMappingExposure=isNight?.82:1.15;hotel.traverse(o=>{if(o.material===glass||o.material===darkGlass){o.material.emissive=new THREE.Color(isNight?"#b47a43":"#000000");o.material.emissiveIntensity=isNight?.18:0;}});}
timeToggle.addEventListener("click",()=>setNight(!isNight));

// Scroll chapters drive one continuous camera journey: arrival, lobby, suite, kitchen, bath.
const chapters=[...document.querySelectorAll(".chapter")];
const chapterNames=["THE ARRIVAL","THE LOBBY","THE SUITE","THE KITCHEN","THE BATHROOM"];
const chapterNumber=document.querySelector("#chapterNumber"),chapterName=document.querySelector("#chapterName");
const cameraStops=[
 {p:[37,22,48],t:[0,5,0]},
 {p:[0,4.2,15],t:[0,2.6,1]},
 {p:[0,2.6,-20],t:[0,1.6,-27]},
 {p:[-4.8,2.1,-20],t:[-4.8,1.3,-23]},
 {p:[5.5,2.1,-29],t:[6,1.3,-31]}
];
function smooth(a,b,t){const q=Math.max(0,Math.min(1,t));return a+(b-a)*(q*q*(3-2*q));}
let activeChapter=-1;
function updateJourney(){
 const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
 const progress=Math.max(0,Math.min(1,scrollY/max))* (chapters.length-1);
 const index=Math.min(chapters.length-1,Math.floor(progress));
 const blend=progress-index;
 // Reveal occupied floors progressively as the visitor scrolls.
 facadeFloorWindows.forEach((windows,floor)=>{
   const reveal=Math.max(0,Math.min(1,(progress-(floor*0.42-0.12))/0.5));
   windows.forEach(pane=>{
     const lit=reveal>0.08;
     pane.material.emissive.set(lit ? (isNight ? "#f0b86f" : "#d69b58") : "#000000");
     pane.material.emissiveIntensity=lit ? reveal*(isNight ? 0.72 : 0.28) : 0;
   });
 });
 const a=cameraStops[index],b=cameraStops[Math.min(index+1,cameraStops.length-1)];
 camera.position.set(smooth(a.p[0],b.p[0],blend),smooth(a.p[1],b.p[1],blend),smooth(a.p[2],b.p[2],blend));
 controls.target.set(smooth(a.t[0],b.t[0],blend),smooth(a.t[1],b.t[1],blend),smooth(a.t[2],b.t[2],blend));
 if(index!==activeChapter){activeChapter=index;chapterNumber.textContent=String(index+1).padStart(2,"0");chapterName.textContent=chapterNames[index];}
}
window.addEventListener("scroll",updateJourney,{passive:true});
updateJourney();
function resize(){const w=shell.clientWidth,h=shell.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,w<700?1.5:2));}
window.addEventListener("resize",resize,{passive:true});resize();

const clock=new THREE.Clock();
let frame=0,lastFrame=0;
const frameInterval=1000/(isSmallScreen?30:45);
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
