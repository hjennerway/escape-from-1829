// Measure the actual GPU shadow mask at surveyed solid wall/ground contacts.
// CPU rays independently establish whether each point should see the sun.
export function auditCourtyardShadows(){
 const {THREE,exterior,renderer,camera}=window.courtCheck;
 const sun=exterior.scene.children.find(o=>o.isDirectionalLight),scene=exterior.scene;
 const target=new THREE.WebGLRenderTarget(1200,760),pixels=new Uint8Array(1200*760*4);
 const mask=new THREE.ShadowMaterial({transparent:false});
 mask.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace(/}\s*$/,'gl_FragColor=vec4(vec3(getShadowMask()),1.0);\n}');};
 const casters=[],surfaces=[];scene.traverseVisible(o=>{if(o.isMesh){surfaces.push(o);if(o.castShadow)casters.push(o);}});
 const ray=new THREE.Raycaster(),toSun=sun.getWorldPosition(new THREE.Vector3()).sub(sun.target.getWorldPosition(new THREE.Vector3())).normalize();
 const reports=[];
 for(const side of [-1,1])for(const centre of [-9.3,-21.5]){
  window.courtCheck.pose(side*21,centre,side*25,centre);
  camera.updateMatrixWorld(true);
  const samples=[];
  for(const x of [24.96,24.9,24.8,24.6])for(const offset of [-1.2,-.6,0,.6,1.2]){
   const z=centre+offset;
   ray.set(new THREE.Vector3(side*x,.4,z),new THREE.Vector3(0,-1,0));ray.far=1;
   const hit=ray.intersectObjects(surfaces,false)[0];if(hit)samples.push({kind:'ground',point:hit.point.clone().add(new THREE.Vector3(0,.002,0))});
  }
  if(centre===-9.3)for(const x of [24.96,24.9,24.8,24.6])for(const y of [.25,.7,1.2])samples.push({kind:'wall',point:new THREE.Vector3(side*x,y,-7.902)});
  scene.overrideMaterial=mask;renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,1200,760,pixels);renderer.setRenderTarget(null);scene.overrideMaterial=null;
  const measurements=[];
  for(const {kind,point} of samples){
   const projected=point.clone().project(camera),px=Math.floor((projected.x+1)*600),py=Math.floor((projected.y+1)*380);
   if(px<1||px>=1199||py<1||py>=759)continue;
   // Reject points hidden by a closer surface from this comparison camera.
   ray.set(camera.position,point.clone().sub(camera.position).normalize());ray.far=point.distanceTo(camera.position)+.02;
   const visible=ray.intersectObjects(surfaces,false)[0];if(!visible||visible.point.distanceTo(point)>.035)continue;
   ray.set(point,toSun);ray.far=100;
   const hit=ray.intersectObjects(casters,false)[0];
   // A distant roof edge has a real filtered penumbra. Require neighbouring
   // light rays to be blocked before demanding complete darkness there; close
   // masonry contacts themselves must remain fully sealed.
   let core=!!hit;
   if(hit&&hit.distance>=1){
    const across=new THREE.Vector3(1,0,0).transformDirection(sun.shadow.camera.matrixWorld),up=new THREE.Vector3(0,1,0).transformDirection(sun.shadow.camera.matrixWorld);
    for(const dx of [-.25,0,.25])for(const dy of [-.25,0,.25]){
     ray.set(point.clone().addScaledVector(across,dx).addScaledVector(up,dy),toSun);ray.far=100;
     if(!ray.intersectObjects(casters,false).length)core=false;
    }
   }
   const shadow=pixels[(py*1200+px)*4]/255;
   measurements.push({kind,point:point.toArray(),blocked:!!hit,core,blocker:hit?.object.name,distance:hit?.distance,light:shadow});
  }
  reports.push({side,centre,measurements});
 }
 target.dispose();mask.dispose();return reports;
}
// Render unobstructed masonry with the estate's real light, map extent and PCF.
// Every interior pixel should be fully lit. This catches repeating self-shadow
// bands separately from textures, torch falloff and genuine building shadows.
export function auditSunlitReceiverPlanes(){
 const {THREE,exterior,renderer}=window.courtCheck;
 const scene=new THREE.Scene(),source=exterior.scene.children.find(o=>o.isDirectionalLight),sun=source.clone();
 sun.target=new THREE.Object3D();sun.position.copy(source.position).sub(source.target.position);sun.updateMatrix();sun.intensity=1;
 sun.shadow.autoUpdate=true;scene.add(sun,sun.target);
 const mask=new THREE.ShadowMaterial({transparent:false,shadowSide:THREE.DoubleSide});
 mask.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace(/}\s*$/,'gl_FragColor=vec4(vec3(getShadowMask()),1.0);\n}');};
 const wall=new THREE.Mesh(new THREE.BoxGeometry(8,5,.3),mask);wall.castShadow=wall.receiveShadow=true;scene.add(wall);
 const size=192,target=new THREE.WebGLRenderTarget(size,size),pixels=new Uint8Array(size*size*4);
 const camera=new THREE.PerspectiveCamera(45,1,.1,100),toSun=sun.position.clone().normalize(),reports=[];
 const normals=[new THREE.Vector3(Math.sign(toSun.x),0,0),new THREE.Vector3(0,0,Math.sign(toSun.z)),new THREE.Vector3(toSun.x,0,toSun.z).normalize(),new THREE.Vector3(0,1,0)];
 const originalTarget=renderer.getRenderTarget();
 try{
  for(const [index,normal] of normals.entries())for(const oblique of [false,true]){
   wall.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal);wall.position.copy(normal).multiplyScalar(-.15);
   camera.up.set(0,1,0);if(index===3)camera.up.set(0,0,-1);
   const tangent=new THREE.Vector3().crossVectors(camera.up,normal).normalize();
   camera.position.copy(normal).multiplyScalar(7).addScaledVector(tangent,oblique?3:0);camera.lookAt(0,0,0);
   scene.updateMatrixWorld(true);renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,size,size,pixels);
   let darkest=1,total=0,dim=0,count=0;
   // The central square lies wholly inside the slab in each tested pose.
   for(let y=64;y<128;y++)for(let x=64;x<128;x++){
    const light=pixels[(y*size+x)*4]/255;darkest=Math.min(darkest,light);total+=light;count++;if(light<.98)dim++;
   }
   reports.push({normal:normal.toArray(),oblique,darkest,mean:total/count,dim,count});
  }
 }finally{renderer.setRenderTarget(originalTarget);sun.shadow.dispose();target.dispose();wall.geometry.dispose();mask.dispose();}
 return reports;
}
