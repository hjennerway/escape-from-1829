import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {fenceBaselineSource} from './baseline-loader.mjs';

const phase=process.argv[2]??'before',destination=new URL('./',import.meta.url);
await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;
const errors=[];
const instrument=`
import {exteriorObstacles,obstacleContains} from './explore-controls.mjs';
window.fenceTest={get ready(){return ready},get grounds(){return escapeGrounds},get walker(){return outsideWalker},get exterior(){return exterior},get renderer(){return renderer},
 begin(){window.__manual=true;start();arrivalCutscene.update(3);state='play';enemyReleaseAt=Infinity;keys.clear();document.getElementById('result').hidden=true;uiPlaying(true)},
 pose(x,z,targetX,targetZ){outsideWalker.resetJump();Object.assign(player,{x,z,y:outsideWalker.heightAt(x,z,0),outside:true,floor:0,stair:null});showFloor();camera.position.set(x,player.y+1.65,z);camera.lookAt(targetX,1.65,targetZ);exterior.lighting.setNight(false);renderer.toneMappingExposure=1.25;renderer.render(exterior.scene,camera)},
 audit(){const failures=[];for(let i=0;i<GROUNDS_OUTLINE.length;i++){const a=GROUNDS_OUTLINE[i],b=GROUNDS_OUTLINE[(i+1)%GROUNDS_OUTLINE.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=0;s<=d;s+=.1){const x=a[0]+(b[0]-a[0])*s/d,z=a[1]+(b[1]-a[1])*s/d;for(const y of [0,1.69])if(outsideWalker.clear(x,z,y))failures.push({x,z,y});}}return failures},
 inspect(){const rails=[],matrix=new THREE.Matrix4(),p=new THREE.Vector3(),scale=new THREE.Vector3(),q=new THREE.Quaternion();escapeGrounds.group.traverse(o=>{if(o.name!=='Escape iron fittings')return;for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);matrix.decompose(p,q,scale);if(Math.abs(p.y-2.8)<.01&&Math.abs(p.z+85)<.01&&scale.x>.1)rails.push({minX:p.x-scale.x/2,maxX:p.x+scale.x/2,z:p.z});}});const permanent=[];for(let x=98;x<=120;x+=.1)if(!outsideWalker.clearPermanent(x,-85,0)&&!outsideWalker.clearPermanent(x,-85,2))permanent.push(+x.toFixed(2));
 const meshes=[];exterior.model.traverseVisible(o=>{if(o.isMesh&&!o.userData.noWalkingCollision&&!o.userData.aerialBatchSource)meshes.push(o)});
 const rays=[1.5,2.8,3.5].map(y=>{const ray=new THREE.Raycaster(new THREE.Vector3(90,y,-85),new THREE.Vector3(1,0,0),0,40);return {y,hits:ray.intersectObjects(meshes,false).slice(0,6).map(h=>({x:h.point.x,name:h.object.name,instance:h.instanceId}))}});
 const visibility=[];exterior.model.traverse(o=>{if(o.userData.aerialBatch||o.userData.aerialBatchSource){visibility.push([o,o.visible]);o.visible=!!o.userData.aerialBatchSource;}});
 const colliders=exteriorObstacles(THREE,exterior.model,{preciseFootprints:true}).filter(b=>Number.isFinite(b.minY)&&obstacleContains(b,98.3,-85,.27)).map(b=>({...b,minY:b.minY,maxY:b.maxY}));
 const sources=[];exterior.model.traverseVisible(o=>{if(!o.isMesh||o.userData.noWalkingCollision)return;const b=new THREE.Box3().setFromObject(o);if(b.min.x<98.6&&b.max.x>98&&b.min.z<-85&&b.max.z>-85&&b.min.y<1.5&&b.max.y>2.35)sources.push({name:o.name,type:o.geometry.type,bounds:[b.min.toArray(),b.max.toArray()],footprints:o.userData.collisionFootprints,footprint:o.userData.collisionFootprint})});
 for(const [o,visible]of visibility)o.visible=visible;
 return {rails,permanent,rays,colliders,sources,modelMode:exterior.modelBuild}},
 movement(x,z,dx,dz,jump=false){outsideWalker.resetJump();const actor={x,z,y:outsideWalker.heightAt(x,z,0),outside:true};if(jump)outsideWalker.jump(actor);for(let i=0;i<120;i++)outsideWalker.update(actor,dx/120,dz/120,1/120);return actor}
};`;
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1560,height:668}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text())});
 await page.route('https://**/*',r=>r.abort());
 if(phase==='before')await page.route(url=>['/workshop-gallery.mjs','/escape-grounds.mjs','/escape-grounds-state.mjs'].includes(url.pathname),async r=>{
  const url=new URL(r.request().url()),source=await readFile(new URL('../../dist'+url.pathname,import.meta.url),'utf8');
  await r.fulfill({contentType:'text/javascript',body:fenceBaselineSource(url.href,source)});
 });
 await page.route('**/game.mjs',async r=>{const source=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');await r.fulfill({contentType:'text/javascript',body:source+instrument});});
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.fenceTest?.ready);await page.evaluate(()=>fenceTest.begin());
 const results=await page.evaluate(()=>fenceTest.inspect());results.barrierFailures=await page.evaluate(()=>fenceTest.audit());
 results.renderer=await page.evaluate(()=>{const gl=fenceTest.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');return gl.getParameter(info.UNMASKED_RENDERER_WEBGL)});
 if(phase!=='before'){
  const wallX=results.rays.find(r=>r.y===2.8).hits[0].x,rail=results.rails.find(r=>r.minX>87);
  assert(rail.maxX>=wallX-.01&&rail.maxX<wallX+.41,JSON.stringify({rail,wallX}));
  assert(await page.evaluate(()=>fenceTest.walker.clear(105,-83.5)&&fenceTest.walker.clearPermanent(105,-85)),'The visible lawn remains walkable');
  results.crossingAttempts=await page.evaluate(()=>[99,105,110,114.5].flatMap(x=>[false,true].map(jump=>({x,jump,end:fenceTest.movement(x,-83.5,0,-5,jump)}))));
  assert(results.crossingAttempts.every(a=>a.end.z>-85),'Walking and jumping cannot bypass the repaired rail');
  await page.keyboard.press('t');results.hiddenTreeBarrierFailures=await page.evaluate(()=>fenceTest.audit());assert.equal(results.hiddenTreeBarrierFailures.length,0,'Hidden trees retain the complete perimeter');await page.keyboard.press('t');
 }
 for(const [name,x,z,tx,tz] of [['pedestrian',-76,-77,-67,-85],['wicket',82,-76,95,-85],['wall-contact',110,-79,115.14,-85]]){
  await page.evaluate(p=>fenceTest.pose(...p),[x,z,tx,tz]);await page.screenshot({path:fileURLToPath(new URL(phase+'-'+name+'.png',destination))});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.evaluate(()=>fenceTest.pose(110,-79,115.14,-85));await page.screenshot({path:fileURLToPath(new URL(phase+'-wall-contact-phone.png',destination))});
 await writeFile(new URL(phase+'.json',destination),JSON.stringify({results,errors},null,2));
 assert.deepEqual(errors,[]);assert.equal(results.barrierFailures.length,0,JSON.stringify(results.barrierFailures.slice(0,10)));
 console.log(JSON.stringify({phase,rails:results.rails,barrierFailures:results.barrierFailures.length,modelMode:results.modelMode,errors}));
}finally{await browser?.close();server.kill();}
