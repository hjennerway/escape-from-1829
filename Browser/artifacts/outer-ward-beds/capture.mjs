import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const destination=new URL('./',import.meta.url),{server,base}=await startTestServer();
let browser;
try{
 browser=await launchHardwareBrowser({executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error'&&/THREE|WebGL|shader/i.test(message.text()))errors.push(message.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+`
 window.wardTest={get ready(){return ready;},get floors(){return floors;},get scene(){return scene;},get renderer(){return renderer;},get arrival(){return arrivalCutscene;},player,start,
 pose(id,floor,reverse=false){const side=id==='R13'?1:-1,x=side*(reverse?22.2:32.8),z=-14.5;Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});yaw=side*(reverse?-1:1)*Math.PI/2;pitch=-.16;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';showFloor();$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.wardTest?.ready);
 await page.evaluate(()=>{const t=window.wardTest;t.start();t.arrival.update(3);});
 const fixed=await page.evaluate(()=>window.wardTest.floors.slice(0,2).map(f=>f.furniture.filter(i=>!i.variable&&['R2','R13'].includes(i.roomId))));
 const geometry=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{flatWalkable}=await import('/asylum-layout.mjs'),t=window.wardTest,ids=new Set();
  const counts=[];t.scene.updateMatrixWorld(true);
  for(const floor of t.floors.slice(0,2)){
   const group=t.scene.children.find(g=>g.position.y===floor.elevation&&g.getObjectByName('Asylum furniture')).getObjectByName('Asylum furniture');
   for(const roomId of ['R2','R13']){
    const beds=floor.furniture.filter(i=>i.roomId===roomId&&i.kind==='bed');
    if(beds.length!==10)throw Error('Missing requested beds');counts.push({floor:floor.id,roomId,beds:beds.length});
    for(const bed of beds)if(!flatWalkable(floor,bed.x,bed.z+Math.cos(bed.rotation)*(bed.depth/2+.5),.34))throw Error('Bed foot access is obstructed');
   }
   for(const mesh of group.children)for(let index=0;index<mesh.count;index++){
    const item=floor.furniture.find(i=>i.id===mesh.userData.furnitureIds[index]);
    if(item.kind!=='bed'||!['R2','R13'].includes(item.roomId))continue;
    const matrix=new THREE.Matrix4(),point=new THREE.Vector3(),direction=new THREE.Vector3(0,0,1);mesh.getMatrixAt(index,matrix);point.setFromMatrixPosition(matrix);direction.transformDirection(matrix);
    if(Math.hypot(point.x-item.x,point.z-item.z)>1e-4||Math.abs(point.y-item.y)>1e-4)throw Error('Rendered bed and walking collision differ');
    if(Math.hypot(direction.x-Math.sin(item.rotation),direction.z-Math.cos(item.rotation))>1e-4)throw Error('Rendered bed orientation differs');
    const dimensions=new THREE.Vector3().setFromMatrixScale(matrix).multiply(new THREE.Vector3(1.326,1.196,2.73));
    if(dimensions.distanceTo(new THREE.Vector3(item.width,item.height,item.depth))>1e-4)throw Error('Rendered bed size differs');ids.add(item.id);
   }
  }
  return {counts,renderedBeds:ids.size};
 });assert.equal(geometry.renderedBeds,40);
 for(const floor of [0,1])for(const id of ['R2','R13'])for(const reverse of [false,true]){
  await page.evaluate(args=>window.wardTest.pose(...args),[id,floor,reverse]);
  assert(await page.evaluate(async()=>{const {flatWalkable}=await import('/asylum-layout.mjs'),t=window.wardTest;return flatWalkable(t.floors[t.player.floor],t.player.x,t.player.z,.34);}), 'Camera stands in the usable aisle');
  await page.waitForTimeout(250);await page.screenshot({path:fileURLToPath(new URL(`${floor}-${id}-${reverse?'inner':'entrance'}.png`,destination))});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.wardTest.pose('R13',1));await page.waitForTimeout(250);await page.screenshot({path:fileURLToPath(new URL('R13-mobile.png',destination))});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.wardExplore={floors,interior,walker,renderer,introFlight,lighting};const clock=new THREE.Timer();')});});
 await page.setViewportSize({width:1200,height:800});await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.wardExplore?.renderer.info.render.frame>2);
 assert.deepEqual(await page.evaluate(()=>window.wardExplore.floors.slice(0,2).map(f=>f.furniture.filter(i=>!i.variable&&['R2','R13'].includes(i.roomId)))),fixed);
 await page.waitForFunction(()=>!window.wardExplore.introFlight?.active);await page.locator('#look').click();
 for(const floor of [0,1])for(const id of ['R2','R13']){
  await page.evaluate(([id,floor])=>{const t=window.wardExplore,side=id==='R13'?1:-1;t.walker.reset();Object.assign(t.walker.actor,{x:side*32.8,z:-14.5,floor,y:t.floors[floor].elevation,outside:false,stair:null});t.walker.look(-side*Math.PI/2/.002,.16/.002);t.walker.update(.01);t.lighting.setMode('day');},[id,floor]);
  await page.waitForTimeout(250);await page.screenshot({path:fileURLToPath(new URL(`explore-${floor}-${id}.png`,destination))});
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL('validation.json',destination),JSON.stringify({geometry,explore:true,mobile:true,errors},null,2)+'\n');
 console.log('PASS: hardware-rendered Escape/Explore; all 40 beds match collision poses, dimensions and orientation; every bed foot is accessible; both mirrored wards on both floors; desktop/portrait views; no runtime/shader errors.');
}finally{await browser?.close();server.kill();}
