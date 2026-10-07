import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
import {containsPoint,ESCAPE_CORRIDOR_POLYGONS} from './dist/escape-corridor-plan.mjs';
import {CORRIDOR_FINISH} from './dist/workshop-interior-finish.mjs';
const destination=new URL('./artifacts/corridor-repairs/finishes/',import.meta.url);await mkdir(destination,{recursive:true});
const harness=await readFile(new URL('./test-escape-grounds-browser.mjs',import.meta.url),'utf8'),instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/corridor-join-probes.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./test-support/escape-corridor-join-probes.mjs',import.meta.url),'utf8')).replaceAll('../dist/','/')}));
 await page.route('**/game.mjs',async r=>{const source=(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');await r.fulfill({contentType:'text/javascript',body:source+instrument});});
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);await page.evaluate(()=>{groundsTest.begin();groundsTest.exterior.lighting.setNight(false);});
 await page.keyboard.press('f'); // Illumination evidence must not use the torch.
 await page.evaluate(()=>groundsTest.pose(corridorX,-88,0,.08));
 const result=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js');
  const {auditCorridorJoins}=await import('/corridor-join-probes.mjs');
  const {ESCAPE_CORRIDOR_X:cx,ESCAPE_CORRIDOR_RUNS:runs}=await import('/escape-corridor-plan.mjs'),t=groundsTest,w=t.grounds.workshops,gl=t.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info'),meshes=[];
  t.exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
  const hit=(point,direction)=>new THREE.Raycaster(new THREE.Vector3(...point),new THREE.Vector3(...direction),0,10).intersectObjects(meshes,false)[0];
  const ceilings=runs.map(run=>{const x=(run.start[0]+run.end[0])/2,z=(run.start[1]+run.end[1])/2,ray=new THREE.Raycaster(new THREE.Vector3(x,4.6,z),new THREE.Vector3(0,1,0));return {id:run.id,y:ray.intersectObject(w.group.getObjectByName('Connected escape corridor ceiling'),false)[0]?.point.y};});
  const seams=[-36.4,-26.9,-26.6].map(z=>{
   const samples=[-.025,.025].map(d=>{const h=hit([cx,1.05,z+d],[-1,0,0]);return h?{x:h.point.x,z:h.point.z,u:h.uv?.x,name:h.object.name}:null;});return {z,samples};
  });
  const fittings=w.lighting.lamps.map((l,i)=>({fixture:l.fixture.name,x:l.x,y:l.y,z:l.z,intensity:w.lighting.uniforms.workshopStrength.value,position:w.lighting.uniforms.workshopPositions.value[i].toArray()}));
  const floors=[];for(const run of runs){const dx=run.end[0]-run.start[0],dz=run.end[1]-run.start[1],l=Math.hypot(dx,dz);for(let d=1;d<l-1;d+=3){const x=run.start[0]+dx*d/l,z=run.start[1]+dz*d/l;floors.push({id:run.id,x,z,y:hit([x,.25,z],[0,-1,0])?.point.y});}}
  for(const x of [159,161,168,174,178])for(const z of [-58,-51,-49,-42])if(t.walker.clear(x,z))floors.push({id:'machine',x,z,y:hit([x,.2,z],[0,-1,0])?.point.y});
  const daylight=[];for(const mode of ['day','dusk','night']){t.exterior.lighting.setMode(mode);const lights=t.exterior.scene.children.filter(l=>l.isDirectionalLight||l.isHemisphereLight);daylight.push({mode,total:lights.reduce((n,l)=>n+l.intensity,0),colours:lights.map(l=>l.color.getHex())});}t.exterior.lighting.setMode('day');
  const joins=auditCorridorJoins(THREE,t.exterior.model,w.group),farndon=[];
  for(const z of [-119.6,-119.2,-118.8,-118.4,-118,-117.6,-117.2,-116.8])for(const y of [.11,.35,1.05,3.3,4.9])farndon.push({z,y,x:hit([cx,y,z],[1,0,0])?.point.x,expected:w.group.userData.gallery.maxX-(y<.18?.3325:.2875)});
  const sun=t.exterior.scene.children.find(l=>l.isDirectionalLight),direction=sun.target.position.clone().sub(sun.position).normalize();
  const aperture=w.lighting.windows.filter(o=>o.radius&&o.position.x>cx&&o.position.z<-103&&o.position.z>-119).sort((a,b)=>Math.abs(a.position.z+109)-Math.abs(b.position.z+109))[0];
  // Upper clear sash pane: the sill blocks the lower pane at this sun angle.
  const centre=aperture.fixture.localToWorld(new THREE.Vector3(aperture.x-.23,aperture.y+aperture.spring*.86,aperture.z));
  const projected=centre.clone().addScaledVector(direction,(.04-centre.y)/direction.y);
  const camera=new THREE.OrthographicCamera(-2,2,2,-2,.05,10);camera.position.copy(projected);camera.position.y=4.5;camera.up.set(0,0,-1);camera.lookAt(projected);
  const target=new THREE.WebGLRenderTarget(256,256),previousTarget=t.renderer.getRenderTarget(),strength=w.lighting.uniforms.workshopStrength.value,sunStrength=sun.intensity;
  const sample=intensity=>{sun.intensity=intensity;t.renderer.setRenderTarget(target);t.renderer.render(t.exterior.scene,camera);const bytes=new Uint8Array(256*256*4);t.renderer.readRenderTargetPixels(target,0,0,256,256,bytes);return bytes;};
  w.lighting.uniforms.workshopStrength.value=0;const off=sample(0),on=sample(sunStrength);
  const deltaAt=(x,y)=>{let sum=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)for(let c=0;c<3;c++){const i=((y+dy)*256+x+dx)*4+c;sum+=Math.max(0,on[i]-off[i]);}return sum/75;};
  const apertureLight={window:centre.toArray(),floor:projected.toArray(),throughOpening:deltaAt(128,128),besideOpening:[deltaAt(128,40),deltaAt(128,216)]};
  sun.intensity=sunStrength;w.lighting.uniforms.workshopStrength.value=strength;t.renderer.setRenderTarget(previousTarget);target.dispose();
  return {renderer:gl.getParameter(info.UNMASKED_RENDERER_WEBGL),cx,ceilings,seams,fittings,floors,daylight,apertureLight,windows:w.lighting.windows.length,signs:w.group.userData.directionSigns,atlasBakes:w.lighting.bakes,joins,farndon};
 });
 assert(result.joins.corners>=14&&result.joins.probes>=560);assert.equal(result.joins.failures.length,0,JSON.stringify(result.joins.failures.slice(0,8)));assert(result.farndon.every(p=>Math.abs(p.x-p.expected)<1e-5),'Straight Farndon wall and skirting in the assembled game');
 assert(result.ceilings.every(c=>Math.abs(c.y-5.05)<1e-6));assert(result.fittings.every(l=>l.intensity>0&&l.intensity<=16&&Math.hypot(l.position[0]-l.x,l.position[1]-l.y,l.position[2]-l.z)<1e-6),'Subtle fixed fill matches every ceiling fixture');assert.equal(result.atlasBakes,1);
 assert(result.floors.every(p=>Math.abs(p.y-.04)<1e-5),'One level concrete floor in every passage and the machine shop');
 assert(result.windows>40&&result.daylight[0].total>result.daylight[2].total*2,'Windows share the estate daylight strength');assert.notDeepEqual(result.daylight[0].colours,result.daylight[2].colours,'Windows share the estate sky/sun colour');
 assert(result.apertureLight.throughOpening>3&&result.apertureLight.besideOpening.every(n=>n<result.apertureLight.throughOpening*.25),'Daylight lands along the sun ray through the actual opening, with solid wall on either side: '+JSON.stringify(result.apertureLight));
 for(const seam of result.seams){assert(seam.samples.every(Boolean));assert(Math.abs(seam.samples[0].x-seam.samples[1].x)<1e-5,'Flush wall at '+seam.z);for(const s of seam.samples)assert(Math.abs(s.u-s.z/CORRIDOR_FINISH.textureWidth)<1e-4,'World-aligned brick courses at '+seam.z);}
 async function shot(name,pose){await page.evaluate(p=>groundsTest.pose(...p),pose);await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});}
 for(const sign of result.signs)for(const side of [1,-1]){
  const f=sign.forward.map(n=>n*side),distance=[4,3,2,1.5].find(d=>ESCAPE_CORRIDOR_POLYGONS.some(p=>containsPoint([sign.point[0]-f[0]*d,sign.point[1]-f[1]*d],p)));
  assert(distance,'Both faces have an accessible approach: '+sign.id);
  const centre=5.10-.12-.13*Math.max(sign.lines.length,sign.backLines.length),pitch=Math.atan2(centre-1.69,distance)-.08;
  await shot('sign-'+sign.id+(side===1?'-front':'-back'),[sign.point[0]-f[0]*distance,sign.point[1]-f[1]*distance,Math.atan2(-f[0],-f[1]),pitch]);
 }
 for(const [name,pose] of Object.entries({
  'wall-seam':[result.cx,-37.8,.72,-.12],
  'gallery-ceiling':[result.cx,-85,0,.18],
  'tower-ceiling':[152,-47.8,-.72,.45],
  'repair-door':[result.cx,-40,Math.PI/2,-.08],
  'machine-door':[result.cx,-48.5,-Math.PI/2,-.08],
  'double-door':[result.cx,-123,0,-.08],
  'corridor-lights':[result.cx,-108,0,.15],
  'farndon-straight-wall':[154.1,-116,0,-.18]
 }))await shot(name,pose);
 for(const id of ['repair','oil-store','machine'])await page.evaluate(id=>{groundsTest.grounds.use(groundsTest.grounds.nodes.find(n=>n.id==='workshop-door:'+id));groundsTest.step(1);},id);
 for(const [name,pose] of Object.entries({'repair-skirting':[151.7,-39.6,.55,-.23],'oil-skirting':[150.6,-29.1,1.25,-.2],'machine-skirting':[160.7,-48.5,-1.83,-.18],'tower-skirting':[result.cx,-55.2,Math.PI/2,-.28]}))await shot(name,pose);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await shot('corridor-phone',[result.cx,-83,0,.16]);await shot('sign-back-phone',[result.cx,-42.5,Math.PI,.48]);
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({result,errors},null,2));console.log(JSON.stringify({renderer:result.renderer,ceilings:result.ceilings.length,fittings:result.fittings.length,signFaces:result.signs.length*2,seams:result.seams,errors},null,2));
}finally{await browser?.close();server.kill();}
