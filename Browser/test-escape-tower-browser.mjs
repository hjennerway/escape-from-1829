import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const destination=new URL(process.env.TOWER_ARTIFACT_DIR??'./artifacts/tower-door-lamps-stairs/',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[],results={};
const instrument=`
window.towerTest={get ready(){return ready},get tower(){return escapeGrounds.tower},get grounds(){return escapeGrounds},get progress(){return escapeProgress},get state(){return state},get brain(){return groundsGuard},get guard(){return enemies.find(e=>e.type===1)},get audio(){return audioCtx},get angle(){return this.tower.group.getObjectByName('Freed tower maintenance door').rotation.y},player,keys,
 begin(){window.__manual=true;start();arrivalCutscene.update(3);state='play';enemyReleaseAt=Infinity;keys.clear();document.getElementById('result').hidden=true;uiPlaying(true)},
 pose(x,y,z,yawValue=0,pitchValue=0){outsideWalker.resetJump();Object.assign(player,{x,y,z,outside:true,floor:0,stair:null});yaw=yawValue;pitch=pitchValue;update(.001);showFloor();observeNotebook();drawMap();this.render()},
 step(dt=.04){update(dt);this.render()},use(){keys.add('KeyE');update(.01);keys.delete('KeyE');update(.01)},
 lights(){return this.tower.group.children.filter(o=>o.isPointLight).map(o=>({intensity:o.intensity,position:o.position.toArray()}))},
 render(){camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(pitch,yaw,0);camera.getWorldDirection(tmp);const t=exteriorTorch??torch,tt=exteriorTorchTarget??torchTarget;t.intensity=torch.intensity;t.position.copy(camera.position);tt.position.copy(camera.position).addScaledVector(tmp,12);escapeGrounds.update(0,player);renderer.toneMappingExposure=1.25;renderer.render(exterior.scene,camera)},
 walk(to){let samples=0;for(let i=0;i<3000&&Math.hypot(to.x-player.x,to.z-player.z)>.035;i++){const dx=to.x-player.x,dz=to.z-player.z,d=Math.hypot(dx,dz),step=Math.min(.055,d);outsideWalker.update(player,dx/d*step,dz/d*step,.02);escapeGrounds.update(.02,player);samples++;}if(Math.hypot(to.x-player.x,to.z-player.z)>.04)throw Error('Blocked '+JSON.stringify({to,player}));if(to.y!==undefined&&Math.abs(to.y-player.y)>.05)throw Error('Height '+JSON.stringify({to,player}));showFloor();this.render();return samples},
 release(){enemyReleaseAt=0},freeze(){enemyReleaseAt=Infinity},resume(){closeNotebook(false);state='play';keys.clear();uiPlaying(true)},caught,openNotebook,closeNotebook,
 resetGuard(x,z){Object.assign(this.guard,{x,z,y:0,heading:0});groundsGuard=createGroundsGuard({actor:this.guard,walker:outsideWalker,route:outdoorPath,sight:outdoorSight});outdoorGuardActive=true;exterior.scene.add(this.guard.mesh)},
 footsteps(seconds){this.freeze();this.pose(148,.2,-52.5);this.resetGuard(141,-46.2);enemyReleaseAt=0;elapsed+=seconds;audioOn=false;update(.04);return {noted:escapeProgress.run.towerFootstepsNoted,message:interactionMessage};},
 inspect(){return {player:{...player},near:escapeGrounds.near(player)?.id,work:escapeGrounds.work,open:escapeProgress.run.towerHatchOpen,surveyed:escapeProgress.run.towerSurveyed,notes:notebook.entries.filter(n=>n.id.includes('tower')),renderer:(()=>{const gl=renderer.getContext();return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL)})()}},
};`;
async function shot(page,name){await page.evaluate(async()=>{await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);towerTest.render();});await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});}
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>{const source=(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');await r.fulfill({contentType:'text/javascript',body:source+instrument});});
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.towerTest?.ready);await page.evaluate(()=>towerTest.begin());
 results.renderer=(await page.evaluate(()=>towerTest.inspect())).renderer;
 await page.keyboard.press('e');await page.evaluate(()=>towerTest.audio.resume());
 await page.evaluate(()=>{const ctx=towerTest.audio,create=ctx.createBufferSource.bind(ctx);window.towerCreaks=[];ctx.createBufferSource=()=>{const source=create(),start=source.start.bind(source);source.start=(...args)=>{const data=source.buffer.getChannelData(0);towerCreaks.push({duration:source.buffer.duration,rms:Math.sqrt(data.reduce((s,v)=>s+v*v,0)/data.length),peak:data.reduce((s,v)=>Math.max(s,Math.abs(v)),0)});return start(...args);};return source;};});
 await page.evaluate(()=>towerTest.pose(129,0,-61,-1.9,.9));await shot(page,'existing-west-windows');
 await page.evaluate(()=>towerTest.pose(135,22,-55.2,-Math.PI/2,.36));await shot(page,'restored-top-pair');
 // Inspect every row even where no landing permits the player to stand.
 for(const [side,nx,nz] of [['west',-1,0],['north',0,-1],['east',1,0],['south',0,1]]){
  await page.evaluate(({nx,nz})=>towerTest.pose(148+nx*13,23,-55.2+nz*13,Math.atan2(nx,nz),.08),{nx,nz});await shot(page,side+'-three-pairs-exterior');
  for(const [row,bottom] of [21.21,24.16,27.16].entries()){
   await page.evaluate(({nx,nz,bottom})=>towerTest.pose(148+nx*3.4,bottom-.85,-55.2+nz*3.4,Math.atan2(-nx,-nz),0),{nx,nz,bottom});await shot(page,side+'-row-'+(row+1)+'-inside');
  }
 }
 await page.evaluate(()=>{towerTest.grounds.use(towerTest.grounds.nodes.find(n=>n.id==='tower-door'));towerTest.grounds.update(1,{outside:true,x:144,z:-44.75,y:0});towerTest.pose(147.4,0,-45.6,0,0);});
 await shot(page,'tower-vestibule');
 // Enter the vestibule physically, then use the normal held-E interaction.
 await page.evaluate(()=>{towerTest.walk({x:148,z:-48.8});towerTest.pose(148,0,-48.8);towerTest.use();});assert(!await page.evaluate(()=>towerTest.progress.run.towerHatchOpen));
 await shot(page,'hatch-needs-crowbar');
 await page.evaluate(()=>{towerTest.progress.run.crowbar=true;towerTest.resetGuard(87,-80);towerTest.keys.add('KeyE');for(let i=0;i<25;i++)towerTest.step(.04);towerTest.keys.delete('KeyE');towerTest.step();});assert.equal(await page.evaluate(()=>towerTest.grounds.work),0);
 // Reading freezes held work as well as the guard; closing resumes explicitly.
 await page.evaluate(()=>{towerTest.keys.add('KeyE');towerTest.step(.3);towerTest.openNotebook();});const pausedWork=await page.evaluate(()=>towerTest.grounds.work);await page.evaluate(()=>{for(let i=0;i<40;i++)towerTest.step();});assert.equal(await page.evaluate(()=>towerTest.grounds.work),pausedWork);
 await page.evaluate(()=>{towerTest.resume();towerTest.keys.add('KeyE');for(let i=0;i<80;i++)towerTest.step(.04);towerTest.keys.delete('KeyE');towerTest.step();});
 assert(await page.evaluate(()=>towerTest.progress.run.towerHatchOpen));assert.equal(await page.evaluate(()=>towerTest.brain.mode),'investigate');
 results.openingAngle=await page.evaluate(()=>towerTest.angle);assert(results.openingAngle<0&&results.openingAngle>-Math.PI/2,'Door is visibly partway through its swing');await shot(page,'hatch-opening');
 await page.evaluate(()=>towerTest.openNotebook());const pausedAngle=await page.evaluate(()=>towerTest.angle);await page.evaluate(()=>towerTest.step(2));assert.equal(await page.evaluate(()=>towerTest.angle),pausedAngle,'Notebook freezes the moving door');
 await page.evaluate(()=>{towerTest.resume();for(let i=0;i<25;i++)towerTest.step();});assert.equal(await page.evaluate(()=>towerTest.angle),-Math.PI/2);await shot(page,'hatch-open');
 results.creaks=await page.evaluate(()=>towerCreaks);assert(Math.abs(results.creaks.at(-1).duration-.95)<.001,'Hinge uses the same .95-second sound as workshop doors');assert(results.creaks.at(-1).rms>.05&&results.creaks.at(-1).peak<1);
 await page.evaluate(()=>towerTest.pose(148,.2,-52,-1.25,-.25));await shot(page,'first-stair-and-lantern');
 await page.evaluate(()=>towerTest.pose(150,.2,-51.9,-Math.PI/2,.08));await shot(page,'wall-lantern-close');
 await page.evaluate(()=>towerTest.pose(148,.2,-52,Math.PI,-.08));await shot(page,'door-frame-inside');
 // Keep the camera still to inspect only the light handoff. Sweep through
 // the old midpoint switch while the player's physical height climbs.
 results.lighting=await page.evaluate(()=>{
  const t=towerTest,actor={x:151.3,z:-55.2,y:.2,outside:true},frames=[];t.pose(actor.x,actor.y,actor.z,0,-.1);
  for(let i=0;i<180;i++)t.tower.update(1/60,actor);
  for(let frame=0;frame<=180;frame++){
   actor.y=.2+2.2*frame/180;t.tower.update(1/60,actor);
   frames.push(t.lights());
  }
  return {frames};
 });
 assert(results.lighting.frames[90].every(l=>l.intensity>5&&l.intensity<9),'The GPU scene has overlapping lamp illumination at the handoff');
 let maxLightChange=0;for(let i=1;i<results.lighting.frames.length;i++)for(let j=0;j<2;j++)maxLightChange=Math.max(maxLightChange,Math.abs(results.lighting.frames[i][j].intensity-results.lighting.frames[i-1][j].intensity));
 assert(maxLightChange<.15,'Continuous light output during the rendered climb');results.lighting.maxLightChange=maxLightChange;
 for(const [name,fraction] of [['lower',.25],['middle',.5],['upper',.75]]){
  await page.evaluate(fraction=>{const t=towerTest,actor={x:151.3,z:-55.2,y:.2+2.2*fraction,outside:true};t.pose(actor.x,1.3,actor.z,0,-.1);for(let i=0;i<180;i++)t.tower.update(1/60,actor);t.render();},fraction);
  await shot(page,'landing-light-'+name);
 }
 await page.evaluate(()=>towerTest.pose(148,.2,-52,Math.PI,-.08));
 results.ascent=await page.evaluate(()=>{const t=towerTest;let n=0;for(const p of t.tower.route.slice(1))n+=t.walk(p);return {samples:n,y:t.player.y};});assert(Math.abs(results.ascent.y-26.6)<.05);
 await page.evaluate(()=>towerTest.pose(151.3,26.6,-51.9,Math.PI/4,-.35));await shot(page,'stairwell-from-top');
 await page.evaluate(()=>{const t=towerTest,p=t.tower.nodes.find(n=>n.id==='tower-lookout');t.walk({x:151.3,z:-57.2});t.walk({x:p.x,z:-57.2});t.walk(p);t.pose(p.x,p.y,p.z,1.41,-.12);t.use();});assert(await page.evaluate(()=>towerTest.progress.run.towerSurveyed));await shot(page,'west-lookout');
 for(const offset of [-.15,.15]){
  await page.evaluate(offset=>{const p=towerTest.tower.nodes.find(n=>n.id==='tower-lookout');towerTest.pose(p.x,p.y,p.z+offset,1.41,-.12);},offset);await shot(page,'west-lookout-oblique-'+(offset<0?'left':'right'));
 }
 results.guard=await page.evaluate(()=>{const t=towerTest;t.resetGuard(87,-80);t.brain.hear({x:141,z:-46.2},280);let search=false,min=Infinity;for(let i=0;i<2500;i++){t.brain.update(t.player,.04);min=Math.min(min,Math.hypot(t.guard.x-141,t.guard.z+46.2));if(t.brain.mode==='search')search=true;}return {search,min,mode:t.brain.mode,position:{x:t.guard.x,z:t.guard.z}};});await writeFile(new URL('guard-diagnostic.json',destination),JSON.stringify(results.guard));assert(results.guard.search);assert(results.guard.min<1,'Guard reaches the actual tower yard: '+JSON.stringify(results.guard));
 results.descent=await page.evaluate(()=>{const t=towerTest;let n=0;n+=t.walk({x:t.player.x,z:-57.2});n+=t.walk({x:151.3,z:-57.2});n+=t.walk(t.tower.route.at(-1));for(const p of t.tower.route.slice(0,-1).reverse())n+=t.walk(p);return {samples:n,y:t.player.y};});
 results.wallRoute=await page.evaluate(()=>{const t=towerTest,route=t.tower.route.slice(2).map(p=>({x:148+Math.sign(p.x-148)*4.34,z:-55.2+Math.sign(p.z+55.2)*4.34,y:p.y}));t.walk(t.tower.route[1]);t.walk(t.tower.route[2]);for(const p of route)t.walk(p);const top=t.player.y;for(const p of route.slice(0,-1).reverse())t.walk(p);return {top,bottom:t.player.y,corners:route.length};});assert(Math.abs(results.wallRoute.top-26.6)<.05);assert(Math.abs(results.wallRoute.bottom-.2)<.05);
 await page.evaluate(()=>towerTest.caught('Security'));assert(await page.evaluate(()=>towerTest.progress.run.towerHatchOpen&&towerTest.progress.run.towerSurveyed));
 results.final=await page.evaluate(()=>towerTest.inspect());
 const phone=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});phone.setDefaultTimeout(180000);phone.on('pageerror',e=>errors.push(e.message));
 await phone.route('https://**/*',r=>r.abort());await phone.route('**/game.mjs',async r=>{const source=(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');await r.fulfill({contentType:'text/javascript',body:source+instrument});});
 await phone.goto(base+'/?seed=1829');await phone.waitForFunction(()=>window.towerTest?.ready);
 await phone.evaluate(()=>{const t=towerTest;t.begin();t.grounds.use(t.grounds.nodes.find(n=>n.id==='tower-door'));t.grounds.update(1,{outside:true,x:144,z:-44.75,y:0});t.pose(148,0,-48.8);t.progress.run.crowbar=t.progress.run.oil=true;t.resetGuard(87,-80);});
 const cdp=await phone.context().newCDPSession(phone),button=await phone.locator('[data-key="KeyE"]').boundingBox();assert(button);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:button.x+button.width/2,y:button.y+button.height/2}]});await phone.evaluate(()=>{for(let i=0;i<80;i++)towerTest.step(.04);});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert(await phone.evaluate(()=>towerTest.progress.run.towerHatchOpen&&towerTest.progress.run.towerHatchOiled));assert.equal(await phone.evaluate(()=>towerTest.brain.mode),'patrol');await shot(phone,'hatch-quiet-phone');
 assert(await phone.evaluate(()=>towerTest.angle<0&&towerTest.angle>-Math.PI/2),'Touch also animates the oiled door');await phone.evaluate(()=>{for(let i=0;i<25;i++)towerTest.step();});
 await phone.evaluate(()=>towerTest.pose(148,.2,-52,-1.25,-.25));await shot(phone,'first-stair-and-lantern-phone');
 await phone.evaluate(()=>towerTest.pose(150,.2,-51.9,-Math.PI/2,.08));await shot(phone,'wall-lantern-phone');
 await phone.evaluate(()=>{const t=towerTest,p=t.tower.nodes.find(n=>n.id==='tower-lookout');for(const p of t.tower.route.slice(1))t.walk(p);t.walk({x:151.3,z:-57.2});t.walk({x:p.x,z:-57.2});t.walk(p);t.pose(p.x,p.y,p.z,1.41,-.12);t.use();});await shot(phone,'lookout-phone');
 results.phone=await phone.evaluate(()=>towerTest.inspect());assert(results.phone.surveyed);
 const firstCue=await phone.evaluate(()=>towerTest.footsteps(20));assert(firstCue.noted&&firstCue.message.includes('Footsteps'),'Muted players receive the guard cue');
 await phone.evaluate(()=>towerTest.begin());assert(!await phone.evaluate(()=>towerTest.progress.run.towerHatchOpen||towerTest.progress.run.towerSurveyed),'Retry resets the tower');
 const replayCue=await phone.evaluate(()=>towerTest.footsteps(1));assert(replayCue.noted&&replayCue.message.includes('Footsteps'),'Retry must not retain the preceding run’s audio timer');
 assert.deepEqual(errors,[]);
 await writeFile(new URL('validation.json',destination),JSON.stringify({results,errors},null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser?.close();server.kill();}
