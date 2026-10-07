import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {ESCAPE_CORRIDOR_X as corridorX} from './dist/escape-corridor-plan.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const destination=new URL('./artifacts/corridor-interior-finish/',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[],results={};
const instrument=`
window.corridorX=TOWER_WORKSHOPS.corridor[1][0];
function gatesApproach(n){return {x:n.x,z:n.z+(['pedestrian','wicket'].includes(n.id)?1.5:0)}}
window.groundsTest={get ready(){return ready},get grounds(){return escapeGrounds},get progress(){return escapeProgress},get walker(){return outsideWalker},get guard(){return enemies.find(e=>e.type===1)},get brain(){return groundsGuard},get journal(){return notebook},get state(){return state},get exterior(){return exterior},get renderer(){return renderer},player,keys,
 begin(){window.__manual=true;start();arrivalCutscene.update(3);state='play';enemyReleaseAt=Infinity;keys.clear();document.getElementById('result').hidden=true;uiPlaying(true)},
 pose(x,z,yawValue=0,pitchValue=0){outsideWalker.resetJump();Object.assign(player,{x,z,y:outsideWalker.heightAt(x,z,0),outside:true,floor:0,stair:null});yaw=yawValue;pitch=pitchValue;showFloor();scene.remove(torch,torchTarget);exterior.scene.add(torch,torchTarget);update(.001);observeNotebook();drawMap();this.render()},
 step(dt=.04){update(dt)},resumeTouch(){state='play';keys.clear();document.getElementById('result').hidden=true;uiPlaying(true);document.getElementById('touch').hidden=false},use(){keys.add('KeyE');update(.01);keys.delete('KeyE');update(.01)},
 render(){camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(pitch,yaw,0);camera.getWorldDirection(tmp);torch.position.copy(camera.position);torchTarget.position.copy(camera.position).addScaledVector(tmp,12);renderer.toneMappingExposure=1.25;renderer.render(exterior.scene,camera)},
 walk(to){const route=outdoorPath(outsideWalker,player,to);if(!route.length&&Math.hypot(player.x-to.x,player.z-to.z)>1)throw Error('No route '+JSON.stringify({from:player,to}));let samples=0;for(const p of route){for(let i=0;i<400&&Math.hypot(p.x-player.x,p.z-player.z)>.055;i++){const dx=p.x-player.x,dz=p.z-player.z,d=Math.hypot(dx,dz),step=Math.min(.06,d),previous={...player};outsideWalker.update(player,dx/d*step,dz/d*step,.02);escapeProgress.observeBoundary(player,previous);samples++;}if(Math.hypot(p.x-player.x,p.z-player.z)>.06)throw Error('Blocked '+JSON.stringify({p,player}));}this.render();return samples},
 paths(){return floors[0].exits.filter(e=>['D2','D8'].includes(e.id)).map(e=>({id:e.id,paths:escapeGrounds.nodes.map(n=>({id:n.id,length:outdoorPath(outsideWalker,{x:e.destination[0],z:e.destination[2]},gatesApproach(n)).length}))}))},
 release(){enemyReleaseAt=0},freeze(){enemyReleaseAt=Infinity},caught,openNotebook,closeNotebook,
 resetGuard(x,z,heading=0){Object.assign(this.guard,{x,z,y:0,heading});groundsGuard=createGroundsGuard({actor:this.guard,walker:outsideWalker,route:outdoorPath,sight:outdoorSight});outdoorGuardActive=true;exterior.scene.add(this.guard.mesh)},
 plan(){exterior.lighting.setNight(false);exterior.camera.position.set(45,300,0);exterior.camera.lookAt(45,0,-15);renderer.render(exterior.scene,exterior.camera)},
 night(){exterior.lighting.setNight(true)},
 barrierAudit(){const failures=[];for(let i=0;i<GROUNDS_OUTLINE.length;i++){const a=GROUNDS_OUTLINE[i],b=GROUNDS_OUTLINE[(i+1)%GROUNDS_OUTLINE.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=0;s<d;s+=.18){const x=a[0]+(b[0]-a[0])*s/d,z=a[1]+(b[1]-a[1])*s/d;for(const y of [0,1.69])if(outsideWalker.clear(x,z,y))failures.push({x,z,y});}}return failures},
 jumping(x,z,dx,dz){this.pose(x,z);outsideWalker.jump(player);for(let i=0;i<120;i++)outsideWalker.update(player,dx/120,dz/120,1/120);return {...player}},
 benchmark(){const samples=[];const gl=renderer.getContext();for(const visible of [false,true,false,true]){escapeGrounds.group.visible=visible;this.render();gl.finish();const times=[];for(let i=0;i<40;i++){const begin=performance.now();this.render();gl.finish();times.push(performance.now()-begin)}times.sort((a,b)=>a-b);samples.push({visible,draws:renderer.info.render.calls,triangles:renderer.info.render.triangles,medianMs:times[20],p95Ms:times[38]});}escapeGrounds.group.visible=true;return samples}
};`;
async function shot(page,name){if(name!=='boundary-plan')await page.evaluate(()=>groundsTest.render());await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});}
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text())});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>{const source=(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt').replace('escapeGrounds=createEscapeGrounds(', 'const groundsBuildStart=performance.now();escapeGrounds=createEscapeGrounds(').replace('{noise:groundsNoise});', '{noise:groundsNoise});window.__groundsBuildMs=performance.now()-groundsBuildStart;');await r.fulfill({contentType:'text/javascript',body:source+instrument});});
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);
 await page.evaluate(()=>groundsTest.begin());results.creationMs=await page.evaluate(()=>window.__groundsBuildMs);results.modelMode=await page.evaluate(()=>groundsTest.exterior.modelBuild);results.renderer=await page.evaluate(()=>{const gl=groundsTest.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');return gl.getParameter(info.UNMASKED_RENDERER_WEBGL)});
 results.barrierFailures=await page.evaluate(()=>groundsTest.barrierAudit());assert.equal(results.barrierFailures.length,0,JSON.stringify(results.barrierFailures.slice(0,10)));
 await page.keyboard.press('t');results.hiddenTreeBarrierFailures=await page.evaluate(()=>groundsTest.barrierAudit());assert.equal(results.hiddenTreeBarrierFailures.length,0,'Hiding trees must not open boundary gaps');await page.keyboard.press('t');
 results.closedPaths=await page.evaluate(()=>groundsTest.paths());assert(results.closedPaths.every(e=>e.paths.filter(p=>['tower-door','pedestrian','wicket','night-gate'].includes(p.id)).every(p=>p.length>0)),JSON.stringify(results.closedPaths));
 assert(results.closedPaths.every(e=>e.paths.filter(p=>['crowbar','oil'].includes(p.id)).every(p=>p.length===0)),'Tools require entering the stores door');
 await page.evaluate(()=>groundsTest.plan());await shot(page,'boundary-plan');
 await page.evaluate(()=>groundsTest.pose(0,62.5,Math.PI));await shot(page,'carriage-gate');
 await page.evaluate(()=>{groundsTest.night();groundsTest.pose(-80,-82.7)});await shot(page,'pedestrian-night');
 results.jump=await page.evaluate(()=>groundsTest.jumping(-80,-82.8,0,-6));assert(results.jump.z>-85);
 await page.evaluate(()=>groundsTest.pose(-80,-83.5));await page.keyboard.press('e');
 // Exercise key events through the actual update, including walking through.
 await page.keyboard.down('e');await page.evaluate(()=>groundsTest.step());await page.keyboard.up('e');await page.evaluate(()=>groundsTest.step());
 assert(await page.evaluate(()=>groundsTest.progress.run.pedestrianOpen));
 await page.keyboard.down('w');await page.evaluate(()=>{for(let i=0;i<35;i++)groundsTest.step()});await page.keyboard.up('w');
 assert(await page.evaluate(()=>groundsTest.progress.run.boundary),'Actual keyboard movement crosses the gate');
 results.mainWalk=await page.evaluate(()=>groundsTest.walk({x:-74,z:-89}));await page.evaluate(()=>groundsTest.step());await page.evaluate(()=>groundsTest.render());await shot(page,'mast-via-pedestrian');
 await page.evaluate(()=>groundsTest.use());assert.equal(await page.evaluate(()=>groundsTest.state),'cutscene');
 await page.evaluate(()=>groundsTest.begin());
 results.storeWalk=await page.evaluate(()=>{const t=groundsTest;t.pose(80,24);let steps=t.walk(t.grounds.nodes.find(n=>n.id==='tower-door'));t.use();for(let i=0;i<25;i++)t.step();steps+=t.walk({x:corridorX-.6,z:-40});return steps});
 assert(await page.evaluate(()=>groundsTest.progress.run.towerOpen));
 for(const [id,x,z,yaw] of [['repair',corridorX-.6,-40,Math.PI/2],['oil-store',corridorX-.6,-31.5,Math.PI/2],['machine',corridorX+.6,-48.5,-Math.PI/2]]){
  await page.evaluate(p=>{const t=groundsTest;t.walk(p);t.pose(corridorX,p.z,p.yaw)}, {x,z,yaw});await shot(page,id+'-door-closed');
  await page.evaluate(p=>groundsTest.pose(p.x,p.z,p.yaw),{x,z,yaw});
  await page.keyboard.down('e');await page.evaluate(()=>groundsTest.step());await page.keyboard.up('e');await page.evaluate(()=>groundsTest.step());
  assert(await page.evaluate(id=>groundsTest.progress.run.workshopDoors['workshop-door:'+id],id),JSON.stringify(await page.evaluate(()=>({state:groundsTest.state,player:groundsTest.player,near:groundsTest.grounds.near(groundsTest.player),doors:groundsTest.progress.run.workshopDoors,keys:[...groundsTest.keys]}))));await page.evaluate(()=>groundsTest.step(1));await page.evaluate(p=>{for(let i=0;i<25;i++)groundsTest.step();groundsTest.pose(corridorX,p.z,p.yaw)},{z,yaw});await shot(page,id+'-door-open');
 }
 results.paths=await page.evaluate(()=>groundsTest.paths());assert(results.paths.every(e=>e.paths.filter(p=>!p.id.startsWith('workshop-door:')&&!p.id.startsWith('corridor-lock:')).every(p=>p.length>0)),JSON.stringify(results.paths));
 results.roomWalks=await page.evaluate(()=>{const t=groundsTest,walks=[];for(const p of [{x:corridorX,z:-31.5},{x:149,z:-31.5},{x:corridorX,z:-48.5},{x:corridorX,z:-58.5},{x:161,z:-48.5},{x:167,z:-49},{x:173,z:-47}])walks.push({point:p,samples:t.walk(p)});t.walk(t.grounds.nodes.find(n=>n.id==='crowbar'));return walks;});
 await page.evaluate(()=>groundsTest.pose(corridorX,-44.75,0));await shot(page,'connecting-corridor');
 results.galleryWalks=await page.evaluate(()=>{const t=groundsTest,g=t.grounds.workshops.group.userData.gallery;return [g.minZ+1,g.maxZ-1].map(z=>({z,samples:t.walk({x:corridorX,z})}));});
 for(const [name,x,z,yaw] of [['gallery-north',corridorX,-124,Math.PI],['gallery-south',corridorX,-10,Math.PI]]){await page.evaluate(p=>groundsTest.pose(p.x,p.z,p.yaw),{x,z,yaw});await shot(page,name);}
 for(const side of [-1,1]){await page.evaluate(side=>{const t=groundsTest,window=t.grounds.workshops.group.userData.galleryWindows.filter(o=>side*(o.x-corridorX)>0&&o.z<-75).sort((a,b)=>Math.abs(a.z+95)-Math.abs(b.z+95))[0];t.pose(corridorX,window.z,side<0?Math.PI/2:-Math.PI/2)},side);await shot(page,side<0?'gallery-west-windows':'gallery-east-windows');}
 await page.evaluate(()=>groundsTest.pose(154.8,-88,-.25,-.06));await shot(page,'corridor-finish-oblique');
 for(const [name,x,z,yaw] of [['gallery-west-exterior',150,-100,-Math.PI/2],['gallery-east-exterior',163,-100,Math.PI/2],['workshop-north-windows',169,-57,0],['workshop-east-windows',176,-51,-Math.PI/2],['workshop-south-windows',169,-43,Math.PI],['workshop-west-windows',149,-39.75,Math.PI/2]]){await page.evaluate(p=>groundsTest.pose(p.x,p.z,p.yaw),{x,z,yaw});await shot(page,name);}
 await page.evaluate(()=>groundsTest.pose(150.1,-46.6,.25,.08));await shot(page,'tower-face-from-vestibule');
 await page.evaluate(()=>groundsTest.pose(152.2,-48.4,-.35,.08));await shot(page,'tower-right-wall-contact');
 await page.evaluate(()=>groundsTest.pose(corridorX,-55.2,Math.PI/2,.07));await shot(page,'tower-east-face-from-corridor');
 await page.evaluate(()=>groundsTest.pose(152,-39.9,Math.PI/2,-.12));await shot(page,'repair-workshop');
 await page.evaluate(()=>groundsTest.pose(152.7,-28.5,.75,-.12));await shot(page,'oil-parts-room');
 await page.evaluate(()=>groundsTest.pose(160.7,-48.5,-1.83,-.08));await shot(page,'machine-workshop');
 await page.evaluate(()=>groundsTest.pose(166,-49.5,0,-.08));await shot(page,'machine-lathe');
 assert.equal(await page.locator('#floorName').textContent(),'MACHINE WORKSHOP');assert(await page.evaluate(()=>groundsTest.journal.fog.get('outside').bounds[1]>180),'Grounds map includes the whole machine workshop');
 await page.evaluate(()=>{const t=groundsTest;t.progress.run.towerOpen=false;t.grounds.sync();t.pose(144.8,-44.75,-Math.PI/2)});await shot(page,'stores-door-closed');
 await page.keyboard.down('w');await page.evaluate(()=>{for(let i=0;i<30;i++)groundsTest.step()});await page.keyboard.up('w');assert(await page.evaluate(()=>groundsTest.player.x<146),'Closed access door stops keyboard walking');
 await page.keyboard.down('e');await page.evaluate(()=>groundsTest.step());await page.keyboard.up('e');await page.evaluate(()=>groundsTest.step());
 await page.evaluate(()=>groundsTest.step(1));await page.keyboard.down('w');await page.evaluate(()=>{for(let i=0;i<30;i++)groundsTest.step()});await page.keyboard.up('w');assert(await page.evaluate(()=>groundsTest.player.x>148),'Keyboard walking enters through the opened access door');await page.evaluate(()=>groundsTest.render());await shot(page,'stores-door-entered');
 await page.evaluate(()=>{const n=groundsTest.grounds.nodes.find(n=>n.id==='crowbar');groundsTest.walk(n)});
 await page.evaluate(()=>{const n=groundsTest.grounds.nodes.find(n=>n.id==='crowbar');groundsTest.pose(n.x+.15,n.z,Math.PI/2,-.4)});await shot(page,'tools-night');
 await page.evaluate(()=>groundsTest.use());assert(await page.evaluate(()=>groundsTest.progress.run.crowbar));
 await page.evaluate(()=>{const n=groundsTest.grounds.nodes.find(n=>n.id==='oil');groundsTest.walk(n);groundsTest.pose(n.x+.15,n.z,Math.PI/2,-.35)});await shot(page,'oil-can-detail');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{document.body.classList.add('touch');document.getElementById('touch').hidden=false;document.exitPointerLock()});await page.waitForFunction(()=>!document.pointerLockElement);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));await page.evaluate(()=>{groundsTest.resumeTouch();groundsTest.pose(149.3,-30.6,Math.PI/2,-.27)});await shot(page,'oil-can-phone');
 const toolSession=await page.context().newCDPSession(page);await toolSession.send('Emulation.setTouchEmulationEnabled',{enabled:true});const toolUse=await page.locator('[data-key="KeyE"]').boundingBox();
 await toolSession.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:toolUse.x+toolUse.width/2,y:toolUse.y+toolUse.height/2,id:1}]});await page.evaluate(()=>groundsTest.step());await toolSession.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.evaluate(()=>groundsTest.step());assert(await page.evaluate(()=>groundsTest.progress.run.oil));
 await toolSession.send('Emulation.setTouchEmulationEnabled',{enabled:false});await toolSession.detach();await page.setViewportSize({width:1280,height:820});await page.evaluate(()=>{document.body.classList.remove('touch');document.getElementById('touch').hidden=true});
 results.wicketWalk=await page.evaluate(()=>groundsTest.walk({x:87,z:-83.5}));
 await page.evaluate(()=>groundsTest.pose(87,-83.5));await shot(page,'wicket-night');
 await page.evaluate(()=>{const t=groundsTest;t.keys.add('KeyE');for(let i=0;i<20;i++)t.step();t.keys.clear();t.step()});assert.equal(await page.evaluate(()=>groundsTest.grounds.work),0);
 await page.evaluate(()=>{const t=groundsTest;t.resetGuard(78,-78,Math.PI);t.keys.add('KeyE');t.step();});assert.equal(await page.evaluate(()=>groundsTest.brain.mode),'investigate');
 await page.evaluate(()=>{groundsTest.keys.clear();groundsTest.step();groundsTest.openNotebook()});const frozen=await page.evaluate(()=>({mode:groundsTest.brain.mode,work:groundsTest.grounds.work,time:groundsTest.brain.remaining}));await page.evaluate(()=>groundsTest.step(10));assert.deepEqual(await page.evaluate(()=>({mode:groundsTest.brain.mode,work:groundsTest.grounds.work,time:groundsTest.brain.remaining})),frozen);
 await page.evaluate(()=>{groundsTest.closeNotebook(false); groundsTest.begin();groundsTest.progress.run.crowbar=true;groundsTest.grounds.sync();groundsTest.pose(87,-83.5)});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{document.body.classList.add('touch');document.getElementById('touch').hidden=false});
 await page.evaluate(()=>document.exitPointerLock());await page.waitForFunction(()=>!document.pointerLockElement);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));await page.evaluate(()=>groundsTest.resumeTouch());
 const touchSession=await page.context().newCDPSession(page);await touchSession.send('Emulation.setTouchEmulationEnabled',{enabled:true});const useBox=await page.locator('[data-key="KeyE"]').boundingBox();
 await touchSession.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:useBox.x+useBox.width/2,y:useBox.y+useBox.height/2,id:1}]});
 await page.evaluate(()=>{for(let i=0;i<76;i++)groundsTest.step()});await touchSession.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert(await page.evaluate(()=>groundsTest.progress.run.wicketOpen));assert((await page.evaluate(()=>groundsTest.journal.entries.find(n=>n.id==='escape:grounds:wicket').text)).includes('remains open'));await page.evaluate(()=>groundsTest.render());await shot(page,'wicket-open-phone');
 results.serviceWalk=await page.evaluate(()=>{const t=groundsTest;const samples=t.walk({x:87,z:-89})+t.walk({x:-74,z:-89});t.step();return {samples,boundary:t.progress.run.boundary,route:t.progress.run.groundsRoute}});assert(results.serviceWalk.boundary&&results.serviceWalk.route==='wicket');
 await page.evaluate(()=>groundsTest.caught('Security'));assert(!await page.evaluate(()=>groundsTest.progress.run.crowbar));assert(await page.evaluate(()=>groundsTest.progress.run.wicketOpen));assert(!await page.evaluate(()=>groundsTest.progress.run.boundary));
 await page.evaluate(()=>groundsTest.begin());assert(!await page.evaluate(()=>groundsTest.progress.run.wicketOpen||groundsTest.progress.run.oil||groundsTest.progress.run.crowbar));
 await page.setViewportSize({width:1280,height:820});await page.evaluate(()=>groundsTest.pose(-81,-75,0));
 await page.waitForFunction(()=>groundsTest.renderer&&groundsTest.exterior);
 results.guard=await page.evaluate(()=>{const t=groundsTest;t.pose(87,-80);t.resetGuard(75,-78);t.brain.hear({x:87,z:-84},65);let searched=false;for(let i=0;i<800;i++){t.brain.update({x:500,z:500},.04);if(t.brain.mode==='search')searched=true;}return {searched,mode:t.brain.mode,position:{x:t.guard.x,z:t.guard.z}}});assert(results.guard.searched&&['patrol','return'].includes(results.guard.mode));
 await page.evaluate(()=>groundsTest.pose(-81,-75,0));results.performance=await page.evaluate(()=>groundsTest.benchmark());
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({results,errors},null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser?.close();server.kill();}
