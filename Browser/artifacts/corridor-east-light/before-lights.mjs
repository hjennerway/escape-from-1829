// Fixed tube illumination, with a single cached depth atlas for static walls.
// Door leaves cast analytic box shadows, without refreshing the atlas. The
// estate sun alone projects daylight through the actual window apertures.
let lightingGeneration=0;
export function createWorkshopLights(THREE,group,lamps,{exterior,doors=[],shadowGroup}={}){
 const generation=++lightingGeneration;
 const count=lamps.length,columns=8,tile=256,rows=Math.max(1,Math.ceil(count/columns)),range=16,near=.08,angle=1.22;
 const atlas=new THREE.WebGLRenderTarget(columns*tile,rows*tile,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,generateMipmaps:false});
 atlas.texture.name='Static workshop tube shadow atlas';
 const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});
 const shadowScene=new THREE.Scene();shadowScene.background=new THREE.Color(0xffffff);shadowScene.overrideMaterial=depth;
 const camera=new THREE.PerspectiveCamera(angle*360/Math.PI,1,near,range);camera.up.set(0,0,-1);
 const positions=lamps.map(l=>new THREE.Vector3(l.x,l.y,l.z));
 const doorMatrices=doors.map(()=>new THREE.Matrix4()),doorMin=[],doorMax=[];
 for(const leaf of doors){leaf.geometry.computeBoundingBox();doorMin.push(leaf.geometry.boundingBox.min.clone());doorMax.push(leaf.geometry.boundingBox.max.clone());}
 const uniforms={workshopAtlas:{value:atlas.texture},workshopPositions:{value:positions},workshopColour:{value:new THREE.Color(0xffe3b4)},workshopStrength:{value:85},
  workshopDoors:{value:doorMatrices},workshopDoorMin:{value:doorMin},workshopDoorMax:{value:doorMax}};
 const windows=[];group.updateMatrixWorld(true);
 group.traverse(wall=>{
  if(wall.name==='Workshop exterior with semicircular windows')for(const o of wall.userData.openings??[]){
   if(o.side===1)windows.push({fixture:wall,...o,position:wall.localToWorld(new THREE.Vector3(o.x,o.y,o.z))});
  }
  if(wall.name==='Inner sash glass'){windows.push({fixture:wall,position:wall.getWorldPosition(new THREE.Vector3())});wall.castShadow=false;}
 });
 const declarations=`
 varying vec3 workshopWorldPosition;
 uniform sampler2D workshopAtlas;
 uniform vec3 workshopPositions[${Math.max(1,count)}];
 uniform vec3 workshopColour;
 uniform float workshopStrength;
 ${doors.length?`uniform mat4 workshopDoors[${doors.length}];
 uniform vec3 workshopDoorMin[${doors.length}], workshopDoorMax[${doors.length}];`:''}
 float workshopVisibility(int index, vec3 point, vec3 receiverDx, vec3 receiverDy) {
  // All tube cameras face down with the same lens, so no per-light matrix
  // uniforms are needed (keep below mobile WebGL's fragment uniform limit).
  vec3 local=point-workshopPositions[index];
  vec4 clip=vec4(local.x*${1/Math.tan(angle)},-local.z*${1/Math.tan(angle)},local.y*${-(range+near)/(range-near)}+${-2*range*near/(range-near)},-local.y);
  vec3 coord=clip.xyz/clip.w*.5+.5;
  if(any(lessThan(coord,vec3(0.0))) || any(greaterThan(coord,vec3(1.0)))) return 0.0;
  // Compare each depth texel against the receiver plane at that texel. A
  // single comparison depth gives sloping corridor walls horizontal stripes.
  vec4 clipDx=vec4(receiverDx.x*${1/Math.tan(angle)},-receiverDx.z*${1/Math.tan(angle)},receiverDx.y*${-(range+near)/(range-near)},-receiverDx.y);
  vec4 clipDy=vec4(receiverDy.x*${1/Math.tan(angle)},-receiverDy.z*${1/Math.tan(angle)},receiverDy.y*${-(range+near)/(range-near)},-receiverDy.y);
  vec3 dx=(clipDx.xyz*clip.w-clip.xyz*clipDx.w)/(clip.w*clip.w)*.5;
  vec3 dy=(clipDy.xyz*clip.w-clip.xyz*clipDy.w)/(clip.w*clip.w)*.5;
  float det=dx.x*dy.y-dx.y*dy.x;
  vec2 gradient=abs(det)>1e-20?vec2(dy.y*dx.z-dx.y*dy.z,dx.x*dy.z-dy.x*dx.z)/det:vec2(0.0);
  vec2 cell=vec2(float(index % ${columns}),float(index / ${columns}));
  vec2 base=(floor(coord.xy*${tile}.0-.5)+.5)/${tile}.0,blend=fract(coord.xy*${tile}.0-.5);
  float visibility=0.0;
  for(int y=0;y<2;y++) for(int x=0;x<2;x++) {
   vec2 uv=clamp(base+vec2(float(x),float(y))/${tile}.0,vec2(.5/${tile}.0),vec2(1.0-.5/${tile}.0));
   // Three's RGBA depth packing (one shared sampler for every tube).
   float stored=dot(texture2D(workshopAtlas,(cell+uv)/vec2(${columns}.0,${rows}.0)),vec4(255.0/256.0,255.0/65536.0,255.0/16777216.0,1.0/16777216.0));
   visibility+=step(coord.z+dot(uv-coord.xy,gradient)-.00003,stored)*(x==0?1.0-blend.x:blend.x)*(y==0?1.0-blend.y:blend.y);
  }
  ${doors.length?`for(int d=0;d<${doors.length};d++) {
   vec3 start=(workshopDoors[d]*vec4(workshopPositions[index],1.0)).xyz;
   vec3 end=(workshopDoors[d]*vec4(point,1.0)).xyz, direction=end-start;
   vec3 inverse=sign(direction+vec3(1e-10))/max(abs(direction),vec3(1e-7));
   vec3 a=(workshopDoorMin[d]-start)*inverse,b=(workshopDoorMax[d]-start)*inverse;
   vec3 lo=min(a,b),hi=max(a,b);
   float enter=max(max(lo.x,lo.y),lo.z),leave=min(min(hi.x,hi.y),hi.z);
   if(max(enter,0.0)<min(leave,.995)) visibility=0.0;
  }`:''}
  return visibility;
 }
 vec3 workshopIrradiance(vec3 normal) {
  vec3 worldNormal=inverseTransformDirection(normal,viewMatrix);
  vec3 receiverDx=dFdx(workshopWorldPosition),receiverDy=dFdy(workshopWorldPosition);
  vec3 planeNormal=normalize(cross(receiverDx,receiverDy));
  if(dot(planeNormal,worldNormal)<0.0)planeNormal=-planeNormal;
  vec3 point=workshopWorldPosition+planeNormal*.01;
  float sum=0.0;
  for(int i=0;i<${count};i++) {
   vec3 delta=workshopPositions[i]-point;
   float distanceSquared=dot(delta,delta);
   if(distanceSquared<${range*range}.0 && delta.y>0.0) {
    vec3 direction=normalize(delta);
    float cone=smoothstep(${Math.cos(angle)},${Math.cos(angle*.3)},direction.y);
    float falloff=pow(clamp(1.0-pow(distanceSquared/${range*range}.0,2.0),0.0,1.0),2.0);
    float diffuse=max(dot(worldNormal,direction),0.0);
    if(cone*diffuse>0.0) sum+=cone*diffuse*falloff/max(distanceSquared,.01)*workshopVisibility(i,point,receiverDx,receiverDy);
   }
  }
  return workshopColour*workshopStrength*sum;
 }`;
 const patched=new Map();
 // The original tower masonry forms the western corridor wall.
 for(const root of [group,exterior?.waterTower].filter(Boolean))root.traverse(object=>{
  for(const material of [object.material].flat()){
   if(!material?.isMeshStandardMaterial||patched.has(material))continue;
   const compile=material.onBeforeCompile,key=material.customProgramCacheKey;patched.set(material,{compile,key});
   material.onBeforeCompile=function(shader,renderer){
    compile.call(this,shader,renderer);Object.assign(shader.uniforms,uniforms);
    shader.vertexShader='varying vec3 workshopWorldPosition;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
     vec4 workshopPosition=vec4(transformed,1.0);
     #ifdef USE_INSTANCING
      workshopPosition=instanceMatrix*workshopPosition;
     #endif
     workshopWorldPosition=(modelMatrix*workshopPosition).xyz;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <lights_pars_begin>','#include <lights_pars_begin>\n'+declarations);
    shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directDiffuse += diffuseColor.rgb * RECIPROCAL_PI * workshopIrradiance(normal);');
   };
   material.customProgramCacheKey=()=>key.call(material)+':workshop-atlas:'+count+':'+doors.length+':'+generation;material.needsUpdate=true;
  }
 });
 let baked=false,bakes=0,canvas;
 const contextRestored=()=>{baked=false;};
 function bake(renderer){
  if(baked)return;baked=true;
  if(!canvas){canvas=renderer.domElement;canvas.addEventListener('webglcontextrestored',contextRestored);}
  const root=shadowGroup??group;root.updateWorldMatrix(true,true);
  root.traverseVisible(object=>{
   if(!object.isMesh||!object.castShadow)return;
   for(let parent=object;parent;parent=parent.parent)if(doors.some(leaf=>parent===leaf.parent))return;
   const mesh=object.isInstancedMesh?new THREE.InstancedMesh(object.geometry,depth,object.count):new THREE.Mesh(object.geometry,depth);
   if(object.isInstancedMesh)mesh.instanceMatrix=object.instanceMatrix;
   mesh.matrix.copy(object.matrixWorld);mesh.matrixAutoUpdate=false;shadowScene.add(mesh);
  });
  const target=renderer.getRenderTarget(),autoClear=renderer.autoClear,shadowEnabled=renderer.shadowMap.enabled,xr=renderer.xr.enabled;
  const viewport=renderer.getViewport(new THREE.Vector4()),scissor=renderer.getScissor(new THREE.Vector4()),scissorTest=renderer.getScissorTest();
  try{
   renderer.xr.enabled=false;renderer.shadowMap.enabled=false;renderer.autoClear=false;renderer.setRenderTarget(atlas);renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);
   for(let i=0;i<count;i++){
    camera.position.copy(positions[i]);camera.lookAt(positions[i].x,0,positions[i].z);camera.updateMatrixWorld(true);
    renderer.setViewport(i%columns*tile,Math.floor(i/columns)*tile,tile,tile);renderer.setScissor(i%columns*tile,Math.floor(i/columns)*tile,tile,tile);renderer.clear();renderer.render(shadowScene,camera);
   }
   bakes++;
  }finally{
   renderer.setRenderTarget(target);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);renderer.autoClear=autoClear;renderer.shadowMap.enabled=shadowEnabled;renderer.xr.enabled=xr;
   for(const object of shadowScene.children)if(object.isInstancedMesh)object.dispose();shadowScene.clear();
  }
 }
 const scene=exterior?.scene,previousBeforeRender=scene?.onBeforeRender;
 if(scene)scene.onBeforeRender=function(renderer,...args){bake(renderer);previousBeforeRender?.call(this,renderer,...args);};
 function update(){for(let i=0;i<doors.length;i++){doors[i].updateWorldMatrix(true,false);doorMatrices[i].copy(doors[i].matrixWorld).invert();}}
 update();
 return {lamps,windows,uniforms,bake,update,invalidate:update,get bakes(){return bakes;},dispose(){
  canvas?.removeEventListener('webglcontextrestored',contextRestored);
  if(scene)scene.onBeforeRender=previousBeforeRender;
  for(const [material,{compile,key}] of patched){material.onBeforeCompile=compile;material.customProgramCacheKey=key;material.needsUpdate=true;}
  atlas.dispose();depth.dispose();
 }};
}
