import {LAMP_HEAD,visibleInScene} from './street-lamps.mjs';
import {createWindowLights,WINDOWS_PER_LIGHT} from './window-lights.mjs';
import {createAtmosphere} from './atmosphere.mjs';
import {createFrontLawnWind} from './front-lawn-wind.mjs';
export const STREET_LIGHT_LIMIT=8;

function glowTexture(THREE){
 const size=64,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const r=Math.hypot((x+.5-size/2)/(size/2),(y+.5-size/2)/(size/2));
  const alpha=Math.max(0,Math.exp(-r*r*5)-Math.exp(-5))/(1-Math.exp(-5));
  data.set([255,255,255,Math.round(alpha*255)],(y*size+x)*4);
 }
 const texture=new THREE.DataTexture(data,size,size);texture.needsUpdate=true;return texture;
}

// Runtime-only lighting is recreated for source, compiled, and walking scenes.
// Eight stable light slots illuminate nearby masonry without hundreds of lights
// in every building shader. Instanced soft pools keep the whole aerial road
// network readable, with emissive heads and small halos at every visible lamp.
export function createDayNight(THREE,exterior,renderer,{walking=false,twilight=false,random=Math.random,reducedMotion}={}){
 const {scene,camera,model}=exterior,lamps=[],diffusers=new Set();
 const windows=createWindowLights(THREE,model,{random});
 const treeWind=createFrontLawnWind(THREE,exterior,{reducedMotion});
 const atmosphere=createAtmosphere(THREE,exterior,{reducedMotion});
 scene.updateMatrixWorld(true);
 model.traverse(owner=>{
  if(owner.userData.streetLamps)for(const p of owner.userData.streetLamps){
   const position=new THREE.Vector3(p.x+Math.cos(p.angle)*LAMP_HEAD[0],LAMP_HEAD[1]+(p.y??-.15)+.15,p.z-Math.sin(p.angle)*LAMP_HEAD[0]).applyMatrix4(owner.matrixWorld);
   lamps.push({owner,position,visible:false,distance:0});
  }
  if(owner.userData.lampPost)lamps.push({owner,position:new THREE.Vector3(...LAMP_HEAD).add(new THREE.Vector3(0,.15,0)).applyMatrix4(owner.matrixWorld),visible:false,distance:0});
  for(const material of [owner.material].flat())if(material?.userData.streetLampDiffuser)diffusers.add(material);
 });
 const sun=scene.children.find(o=>o.isDirectionalLight),sky=scene.children.find(o=>o.isHemisphereLight);
 const day={background:scene.background.clone(),fog:scene.fog.color.clone(),density:scene.fog.density,exposure:renderer.toneMappingExposure,
  sunColor:sun.color.clone(),sunPosition:sun.position.clone(),sunIntensity:sun.intensity,skyColor:sky.color.clone(),groundColor:sky.groundColor.clone(),skyIntensity:sky.intensity};
 const effects=new THREE.Group();effects.name='Night street-lamp glow';effects.visible=false;scene.add(effects);
 const texture=glowTexture(THREE);
 const poolMaterial=new THREE.MeshBasicMaterial({color:0xffbc69,map:texture,transparent:true,opacity:.42,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-10,polygonOffsetUnits:-20});
 const geometry=new THREE.PlaneGeometry(23,23);geometry.rotateX(-Math.PI/2);
 const pools=new THREE.InstancedMesh(geometry,poolMaterial,lamps.length);pools.name='Warm street-lamp pools';pools.frustumCulled=false;pools.renderOrder=5;effects.add(pools);
 const haloGeometry=new THREE.BufferGeometry();haloGeometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(lamps.length*3),3));
 const halos=new THREE.Points(haloGeometry,new THREE.PointsMaterial({color:0xffdfa2,map:texture,size:1.9,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
 halos.frustumCulled=false;effects.add(halos);
 const lights=Array.from({length:STREET_LIGHT_LIMIT},()=>{const light=new THREE.PointLight(0xffcb83,0,22,2);scene.add(light);return light;});
 const matrix=new THREE.Matrix4(),focus=new THREE.Vector3(),direction=new THREE.Vector3();let mode='day';
 atmosphere.setSunDirection(sun.position.clone().sub(sun.target.position));
 function fogDensity(){return mode==='day'?day.density:mode==='dusk'?((walking||twilight)?.0019:day.density):walking?.0032:.00065;}
 function refreshFixtures(){
  let changed=false;for(const lamp of lamps){const visible=visibleInScene(lamp.owner);if(visible!==lamp.visible){lamp.visible=visible;changed=true;}}
  if(!changed)return;
  let count=0;for(const lamp of lamps)if(lamp.visible){
   matrix.makeTranslation(lamp.position.x,.405,lamp.position.z);pools.setMatrixAt(count,matrix);
   haloGeometry.attributes.position.setXYZ(count,lamp.position.x,lamp.position.y,lamp.position.z);count++;
  }
  pools.count=count;pools.instanceMatrix.needsUpdate=true;haloGeometry.setDrawRange(0,count);haloGeometry.attributes.position.needsUpdate=true;
 }
 function update(dt=0){
  treeWind.update(dt);
  atmosphere.update(dt);
  if(mode==='day')return;
  windows.update();
  scene.fog.density=fogDensity();
  refreshFixtures();
  focus.copy(camera.position);
  if(!walking){camera.getWorldDirection(direction);if(direction.y<-.05)focus.addScaledVector(direction,Math.min(1800,-camera.position.y/direction.y));}
  const ranked=lamps.filter(lamp=>lamp.visible);
  for(const lamp of ranked)lamp.distance=Math.hypot(lamp.position.x-focus.x,lamp.position.z-focus.z);
  ranked.sort((a,b)=>a.distance-b.distance);
  const radius=Math.min(85,ranked[STREET_LIGHT_LIMIT]?.distance??85);
  lights.forEach((light,i)=>{
   const lamp=ranked[i];if(!lamp){light.intensity=0;return;}
   const fade=Math.max(0,Math.min(1,(radius-lamp.distance)/8));
   light.position.copy(lamp.position);light.intensity=95*fade*fade*(3-2*fade);
  });
 }
 function setMode(value){
  if(!['day','dusk','night'].includes(value))throw new Error('Unknown lighting mode: '+value);
  mode=value;const lit=mode!=='day',dusk=mode==='dusk';
  windows.setDensity(dusk?2.4:WINDOWS_PER_LIGHT);windows.setNight(lit);effects.visible=lit;
  atmosphere.setMode(mode);
  scene.background.copy(lit?new THREE.Color(dusk?0x667872:0x070e1b):day.background);
  scene.fog.color.copy(lit?new THREE.Color(dusk?0x7b877d:0x111d30):day.fog);scene.fog.density=fogDensity();
  sun.color.copy(lit?new THREE.Color(dusk?0xffcc8d:0x8ba9e5):day.sunColor);sun.intensity=lit?(dusk?1.65:.55):day.sunIntensity;
  if(dusk)sun.position.copy(sun.target.position).add(new THREE.Vector3(-100,85,-260));else sun.position.copy(day.sunPosition);
  atmosphere.setSunDirection(sun.position.clone().sub(sun.target.position));
  sky.color.copy(lit?new THREE.Color(dusk?0x96bbbe:0xa4b4cf):day.skyColor);sky.groundColor.copy(lit?new THREE.Color(dusk?0x444c36:0x364152):day.groundColor);sky.intensity=lit?(dusk?1.3:.7):day.skyIntensity;
  renderer.toneMappingExposure=lit?(dusk?1.15:1.05):day.exposure;
  for(const material of diffusers){material.emissive.setHex(lit?0xffd28e:0x000000);material.emissiveIntensity=lit?3:1;}
  if(!lit)for(const light of lights)light.intensity=0;
  exterior.invalidateShadows();update();
 }
 function setNight(value){setMode(value?(twilight?'dusk':'night'):'day');}
 return {setMode,setNight,update,lamps,lights,pools,windows,atmosphere,treeWind,get night(){return mode==='night';},get mode(){return mode;}};
}

export function bindDayNight(lighting,root=document){
 const group=root.getElementById('dayNightToggle');
 // Lucide icons, distributed under ISC/MIT; see vendor/LUCIDE-LICENSE.txt.
 const icons={
  day:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2M20 12h2m-15.66 5.66-1.41 1.41m14.14-14.14-1.41 1.41"/>',
  dusk:'<path d="M12 10V2m-7.07 8.93 1.41 1.41M2 18h2M20 18h2m-2.93-7.07-1.41 1.41M22 22H2m14-16-4 4-4-4m8 12a4 4 0 0 0-8 0"/>',
  night:'<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
 };
 group.innerHTML=Object.entries(icons).map(([mode,icon])=>`<button type="button" data-lighting="${mode}" aria-label="${mode[0].toUpperCase()+mode.slice(1)}" title="${mode[0].toUpperCase()+mode.slice(1)}"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></button>`).join('');
 const buttons=[...group.querySelectorAll('button')];
 function refresh(){
  for(const button of buttons)button.setAttribute('aria-pressed',String(lighting.mode===button.dataset.lighting));
 }
 for(const button of buttons)button.addEventListener('click',()=>{lighting.setMode(button.dataset.lighting);refresh();});refresh();
}
