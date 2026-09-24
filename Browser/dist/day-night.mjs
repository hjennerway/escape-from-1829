import {LAMP_HEAD,visibleInScene} from './street-lamps.mjs';
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
export function createDayNight(THREE,exterior,renderer,{walking=false}={}){
 const {scene,camera,model}=exterior,lamps=[],diffusers=new Set();
 scene.updateMatrixWorld(true);
 model.traverse(owner=>{
  if(owner.userData.streetLamps)for(const p of owner.userData.streetLamps){
   const position=new THREE.Vector3(p.x+Math.cos(p.angle)*LAMP_HEAD[0],LAMP_HEAD[1],p.z-Math.sin(p.angle)*LAMP_HEAD[0]).applyMatrix4(owner.matrixWorld);
   lamps.push({owner,position,visible:false,distance:0});
  }
  if(owner.userData.lampPost)lamps.push({owner,position:new THREE.Vector3(...LAMP_HEAD).add(new THREE.Vector3(0,.15,0)).applyMatrix4(owner.matrixWorld),visible:false,distance:0});
  for(const material of [owner.material].flat())if(material?.userData.streetLampDiffuser)diffusers.add(material);
 });
 const sun=scene.children.find(o=>o.isDirectionalLight),sky=scene.children.find(o=>o.isHemisphereLight);
 const day={background:scene.background.clone(),fog:scene.fog.color.clone(),density:scene.fog.density,exposure:renderer.toneMappingExposure,
  sunColor:sun.color.clone(),sunIntensity:sun.intensity,skyColor:sky.color.clone(),groundColor:sky.groundColor.clone(),skyIntensity:sky.intensity};
 const effects=new THREE.Group();effects.name='Night street-lamp glow';effects.visible=false;scene.add(effects);
 const texture=glowTexture(THREE);
 const poolMaterial=new THREE.MeshBasicMaterial({color:0xffbc69,map:texture,transparent:true,opacity:.42,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-10,polygonOffsetUnits:-20});
 const geometry=new THREE.PlaneGeometry(23,23);geometry.rotateX(-Math.PI/2);
 const pools=new THREE.InstancedMesh(geometry,poolMaterial,lamps.length);pools.name='Warm street-lamp pools';pools.frustumCulled=false;pools.renderOrder=5;effects.add(pools);
 const haloGeometry=new THREE.BufferGeometry();haloGeometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(lamps.length*3),3));
 const halos=new THREE.Points(haloGeometry,new THREE.PointsMaterial({color:0xffdfa2,map:texture,size:1.9,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
 halos.frustumCulled=false;effects.add(halos);
 const lights=Array.from({length:STREET_LIGHT_LIMIT},()=>{const light=new THREE.PointLight(0xffcb83,0,22,2);scene.add(light);return light;});
 const matrix=new THREE.Matrix4(),focus=new THREE.Vector3(),direction=new THREE.Vector3();let night=false;
 function refreshFixtures(){
  let changed=false;for(const lamp of lamps){const visible=visibleInScene(lamp.owner);if(visible!==lamp.visible){lamp.visible=visible;changed=true;}}
  if(!changed)return;
  let count=0;for(const lamp of lamps)if(lamp.visible){
   matrix.makeTranslation(lamp.position.x,.405,lamp.position.z);pools.setMatrixAt(count,matrix);
   haloGeometry.attributes.position.setXYZ(count,lamp.position.x,lamp.position.y,lamp.position.z);count++;
  }
  pools.count=count;pools.instanceMatrix.needsUpdate=true;haloGeometry.setDrawRange(0,count);haloGeometry.attributes.position.needsUpdate=true;
 }
 function update(){
  if(!night)return;
  scene.fog.density=walking?.0032:.00065;
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
 function setNight(value){
  night=Boolean(value);effects.visible=night;
  scene.background.copy(night?new THREE.Color(0x070e1b):day.background);
  scene.fog.color.copy(night?new THREE.Color(0x111d30):day.fog);scene.fog.density=night?(walking?.0032:.00065):day.density;
  sun.color.copy(night?new THREE.Color(0x8ba9e5):day.sunColor);sun.intensity=night?.55:day.sunIntensity;
  sky.color.copy(night?new THREE.Color(0xa4b4cf):day.skyColor);sky.groundColor.copy(night?new THREE.Color(0x364152):day.groundColor);sky.intensity=night?.7:day.skyIntensity;
  renderer.toneMappingExposure=night?1.05:day.exposure;
  for(const material of diffusers){material.emissive.setHex(night?0xffd28e:0x000000);material.emissiveIntensity=night?3:1;}
  if(!night)for(const light of lights)light.intensity=0;
  exterior.invalidateShadows();update();
 }
 return {setNight,update,lamps,lights,pools,get night(){return night;}};
}

export function bindDayNight(lighting,root=document){
 const button=root.getElementById('dayNightToggle');
 function refresh(){
  button.setAttribute('aria-pressed',String(lighting.night));
  button.setAttribute('aria-label',lighting.night?'Night mode. Switch to day':'Day mode. Switch to night');
  button.title=lighting.night?'Switch to day':'Switch to night';
 }
 button.addEventListener('click',()=>{lighting.setNight(!lighting.night);refresh();});refresh();
}
