import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const output=new URL('./',import.meta.url),server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),errors=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:750},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+`
 window.bookshelfCheck={get ready(){return ready;},get floors(){return floors;},get scene(){return scene;},get arrivalCutscene(){return arrivalCutscene;},start,pause(){state='paused';},pose(id,floor){const room=floors[floor].rooms.find(r=>r.id===id),item=floors[floor].furniture.find(i=>i.roomId===id&&i.kind==='bookcase');if(!item)throw Error('Missing shelf '+id);Object.assign(player,{x:room.label[0],z:room.label[1],floor,y:floors[floor].elevation,stair:null,outside:false});yaw=Math.atan2(-(item.x-player.x),-(item.z-player.z));pitch=-.12;camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(pitch,yaw,0);state='paused';showFloor();$('arrivalFade').hidden=true;$('hud').hidden=false;}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.bookshelfCheck?.ready);await page.evaluate(()=>{const t=window.bookshelfCheck;t.start();t.arrivalCutscene.update(3);t.pause();});
 const instances=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{FURNITURE_CATALOG}=await import('/asylum-furniture.mjs'),t=window.bookshelfCheck;let cases=0,parts=0;
  for(const floor of t.floors){
   const group=t.scene.children.find(g=>g.position.y===floor.elevation&&g.children.some(c=>c.name==='Asylum furniture')).getObjectByName('Asylum furniture');
   for(const item of floor.furniture.filter(i=>i.kind==='bookcase')){
    const expected=[item.stocked?1.575:1.875,2.85,item.stocked?.42:.57];
    if([item.width,item.height,item.depth].some((v,i)=>Math.abs(v-expected[i])>1e-6))throw Error('Unscaled bookshelf '+item.id);
    for(const mesh of group.children){const index=mesh.userData.furnitureIds.indexOf(item.id);if(index<0)continue;const matrix=new THREE.Matrix4();mesh.getMatrixAt(index,matrix);const scale=new THREE.Vector3().setFromMatrixScale(matrix),catalog=FURNITURE_CATALOG.bookcase;scale.multiply(new THREE.Vector3(catalog.width,catalog.height,catalog.depth));if(scale.distanceTo(new THREE.Vector3(item.width,item.height,item.depth))>1e-4)throw Error('Rendered/collision size mismatch '+item.id);parts++;}cases++;
   }
  }
  return {cases,parts};
 });assert.equal(instances.parts,instances.cases*3,'Every case has its shelves, books and frame');
 for(const [name,id,floor] of [['ground-linen','R5',0],['ground-east-linen','R16',0],['first-linen','R5',1],['basement-store','B5',2],['east-bay','R31',0]]){await page.evaluate(args=>window.bookshelfCheck.pose(...args),[id,floor]);await page.waitForTimeout(180);await page.screenshot({path:fileURLToPath(new URL(name+'.png',output))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.bookshelfCheck.pose('R31',0));await page.waitForTimeout(180);await page.screenshot({path:fileURLToPath(new URL('east-bay-mobile.png',output))});assert.deepEqual(errors,[]);
 await writeFile(new URL('room-validation.json',output),JSON.stringify({instances,views:6,errors},null,2)+'\n');console.log(`PASS: ${instances.cases} actual rendered bookshelves at 150%, matching collision sizes, all ${instances.parts} assembly parts, six restored-room/bay views, no runtime/shader errors.`);
}finally{await browser.close();server.kill();}
