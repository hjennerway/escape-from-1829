import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const output=new URL('./',import.meta.url),server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),errors=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:750},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+`
 window.frontReview={get ready(){return ready;},get floors(){return floors;},get scene(){return scene;},get arrival(){return arrivalCutscene;},start,pause(){state='paused';},pose(id,floor){const room=floors[floor].rooms.find(r=>r.id===id),item=floors[floor].furniture.find(i=>i.roomId===id&&['bookcase','apothecary'].includes(i.kind));Object.assign(player,{x:room.label[0],z:room.label[1],floor,y:floors[floor].elevation,stair:null,outside:false});yaw=Math.atan2(-(item.x-player.x),-(item.z-player.z));pitch=-.12;camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(pitch,yaw,0);state='paused';showFloor();$('arrivalFade').hidden=true;$('hud').hidden=false;}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.frontReview?.ready);await page.evaluate(()=>{const t=window.frontReview;t.start();t.arrival.update(3);t.pause();});
 const protectedItems=await page.evaluate(()=>window.frontReview.floors.flatMap(f=>f.furniture.filter(i=>['bookcase','apothecary'].includes(i.kind))));
 const rendered=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{FURNITURE_CATALOG}=await import('/asylum-furniture.mjs'),{flatWalkable}=await import('/asylum-layout.mjs'),t=window.frontReview;let objects=0,parts=0;
  for(const floor of t.floors){const group=t.scene.children.find(g=>g.position.y===floor.elevation&&g.getObjectByName('Asylum furniture')).getObjectByName('Asylum furniture');
   for(const item of floor.furniture.filter(i=>['bookcase','apothecary'].includes(i.kind))){let found=0;const catalog=FURNITURE_CATALOG[item.kind];
    for(const mesh of group.children){const index=mesh.userData.furnitureIds.indexOf(item.id);if(index<0)continue;const actual=new THREE.Matrix4(),expected=new THREE.Matrix4(),scale=new THREE.Vector3(item.width/catalog.width,item.height/catalog.height,item.depth/catalog.depth);mesh.getMatrixAt(index,actual);expected.compose(new THREE.Vector3(item.x,item.y,item.z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),item.rotation),scale);if(actual.elements.some((v,i)=>Math.abs(v-expected.elements[i])>1e-5))throw Error('Front orientation or collision transform differs: '+item.id);found++;parts++;}
    if(!found)throw Error('Protected furnishing is not rendered: '+item.id);const distance=item.depth/2+.5;if(!flatWalkable(floor,item.x+Math.sin(item.rotation)*distance,item.z+Math.cos(item.rotation)*distance,.34))throw Error('Front standing space is blocked: '+item.id);objects++;
   }
  }return {objects,parts};
 });assert.equal(rendered.objects,protectedItems.length);
 const views=[['final-dispensary','R7',0],['final-reading','R19',0],['final-angled-library','R31',0],['final-upstairs-library','R34',1],['final-basement-records','B4',2],['final-upper-records','R41',3]];
 for(const [name,id,floor] of views){await page.evaluate(args=>window.frontReview.pose(...args),[id,floor]);await page.waitForTimeout(180);await page.screenshot({path:fileURLToPath(new URL(name+'.png',output))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.frontReview.pose('R7',0));await page.waitForTimeout(180);await page.screenshot({path:fileURLToPath(new URL('final-dispensary-mobile.png',output))});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.frontExplore={renderer,floors};const clock=new THREE.Timer();')});});await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.frontExplore?.renderer.info.render.frame>2);
 assert.deepEqual(await page.evaluate(()=>window.frontExplore.floors.flatMap(f=>f.furniture.filter(i=>['bookcase','apothecary'].includes(i.kind)))),protectedItems,'All protected furnishings agree in Escape and Explore');assert.deepEqual(errors,[]);
 await writeFile(new URL('front-render-validation.json',output),JSON.stringify({rendered,protectedItems,views:views.length+1,escapeExploreMatch:true,errors},null,2)+'\n');console.log(`PASS: ${rendered.objects} rendered bookshelves/dispensary cabinets, ${rendered.parts} matching placement/rotation/scale parts, clear player standing space, Escape/Explore parity, seven desktop/mobile views, no runtime/shader errors.`);
}finally{await browser.close();server.kill();}
