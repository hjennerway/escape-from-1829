import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL('./artifacts/corridor-sightings/',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[],results=[];
try{
 browser=await launchHardwareBrowser();
 for(const mode of ['escape','explore']){
  const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
  await page.route('https://**/*',r=>r.abort());
  await page.route('**/corridor-sightings.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/corridor-sightings.mjs',import.meta.url),'utf8')).replace('random=Math.random','random=()=>0')}));
  if(mode==='escape'){
   await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.sightingTest={get ready(){return ready&&interiorLoader.complete},get scene(){return scene},get camera(){return camera},get renderer(){return renderer},get controller(){return corridorSightings},player,get floors(){return floors},
prepare(){state='paused';uiPlaying(true);document.getElementById('result').hidden=true;enemies.forEach(e=>e.mesh.visible=false);},pause(){state='paused';},play(){state='play';enemyReleaseAt=Infinity;},get actor(){return player}};`}));
   await page.goto(base+'/?seed=1829');
  }else{
   await page.route('**/explore-interior.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/explore-interior.mjs',import.meta.url),'utf8')).replace('let audioContext;','window.sightingInterior={sightings,scene,loading};let audioContext;')}));
   await page.route('**/explore.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/explore.mjs',import.meta.url),'utf8')).replace('const clock=new THREE.Timer();',`window.sightingTest={get ready(){return !!window.sightingInterior?.loading.complete},get scene(){return interior.scene},camera:exterior.camera,renderer,get controller(){return window.sightingInterior.sightings},actor:walker.actor,floors,prepare(){}};const clock=new THREE.Timer();`)}));
   await page.goto(base+'/explore.html');
  }
  await page.waitForFunction(()=>window.sightingTest?.ready);
  await page.evaluate(()=>{const t=window.sightingTest;t.prepare();t.advance=t.controller.update;t.controller.update=()=>{};});
  for(const [framing,width,height,floor] of [['desktop',1200,800,0],['phone',390,844,1]]){
   console.log('Checking '+mode+' '+framing);
   await page.setViewportSize({width,height});
   await page.waitForFunction(()=>Math.abs(window.sightingTest.camera.aspect-innerWidth/innerHeight)<.0001);
   await page.evaluate(floor=>{
    const t=window.sightingTest,y=t.floors[floor].elevation;t.controller.reset();
    Object.assign(t.actor,{x:35.8,z:-18,y,floor,outside:false,stair:null});
    t.camera.position.set(35.8,y+1.65,-18);
    const offset=.52*Math.tan(t.camera.fov*Math.PI/360)*t.camera.aspect*26.2;
    t.camera.lookAt(35.8+offset,y+1.35,8.2);t.camera.updateMatrixWorld(true);
   },floor);
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const capture=await page.evaluate(async()=>{
    const t=window.sightingTest,canvas=document.createElement('canvas');canvas.width=t.renderer.domElement.width;canvas.height=t.renderer.domElement.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true}),figure=t.scene.getObjectByName('Distant corridor silhouette');
    function render(){t.renderer.render(t.scene,t.camera);ctx.drawImage(t.renderer.domElement,0,0);return {pixels:ctx.getImageData(0,0,canvas.width,canvas.height).data,png:canvas.toDataURL('image/png').split(',')[1]};}
    const before=render(),frames=[];let waited=0;
    for(;waited<240&&!t.controller.active;waited+=.1)t.advance(t.actor,t.camera,.1);
    if(!t.controller.active){
     const {buildCorridorCrossings}=await import('./corridor-sightings.mjs'),{flatWalkable}=await import('./asylum-layout.mjs');
     const routes=buildCorridorCrossings(t.floors).filter(r=>r.floor===t.actor.floor).map(r=>({...r,clear:Array.from({length:25},(_,i)=>{const x=r.a[0]+(r.b[0]-r.a[0])*i/24,z=r.a[1]+(r.b[1]-r.a[1])*i/24;return flatWalkable(t.floors[r.floor],x,z,.28);})}));
     throw Error('No crossing: '+JSON.stringify({actor:t.actor,camera:t.camera.position.toArray(),rotation:t.camera.rotation.toArray(),fov:t.camera.fov,aspect:t.camera.aspect,routes}));
    }
    const compare=frame=>{let changed=0;for(let i=0;i<frame.pixels.length;i+=4)if(Math.abs(frame.pixels[i]-before.pixels[i])+Math.abs(frame.pixels[i+1]-before.pixels[i+1])+Math.abs(frame.pixels[i+2]-before.pixels[i+2])>30)changed++;return changed;};
    frames.push({time:0,changed:compare(render())});
    let peak=null,maxChanged=0;
    for(let i=1;i<=20;i++){
     t.advance(t.actor,t.camera,.05);const frame=render(),changed=compare(frame);frames.push({time:i*.05,changed});
     if(changed>maxChanged){maxChanged=changed;peak=frame.png;}
    }
    let meshes=0;figure.traverse(o=>{if(o.isMesh)meshes++;});
    return {waited,frames,maxChanged,before:before.png,peak,after:render().png,active:t.controller.active,pixels:canvas.width*canvas.height,meshes};
   });
   assert(capture.waited>=45&&capture.waited<90,'Delayed first sighting');
   assert.equal(capture.frames[0].changed,0,'Spawn is entirely hidden behind masonry');
   assert(capture.maxChanged>12&&capture.maxChanged<capture.pixels*.008,'Small but visible silhouette');
   assert.equal(capture.frames.at(-1).changed,0,'No remaining visible figure after crossing');assert(!capture.active);
   const visible=capture.frames.filter(f=>f.changed>12);assert(visible.length>=2&&visible.length<=12,'Visible for only a fraction of a second');
   for(const name of ['before','peak','after'])await writeFile(new URL(`${mode}-${framing}-${name}.png`,destination),Buffer.from(capture[name],'base64'));
   const {before,peak,after,...receipt}=capture;results.push({mode,framing,floor,...receipt});
  }
  // Restore production callbacks and confirm a paused view never freezes an
  // inspectable silhouette, rather than merely testing a manually hidden mesh.
  await page.evaluate(()=>{const t=window.sightingTest;t.controller.reset();for(let i=0;i<2400&&!t.controller.active;i++)t.advance(t.actor,t.camera,.1);if(!t.controller.active)throw Error('Expected sighting');t.controller.update=t.advance;});
  await page.waitForFunction(()=>!window.sightingTest.controller.active);
  await page.close();
 }
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({errors,results},null,2));
 console.log('PASS: hardware-rendered Escape/Explore, desktop/phone, ground/first-floor crossings, hidden spawn/end, brief visible silhouette, pause cancellation, no rendering errors.');
}finally{await browser?.close();server.kill();}
