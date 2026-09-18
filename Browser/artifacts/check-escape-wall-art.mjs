import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const port=1852;
const additions=['asylum-winter-moonlight','asylum-service-tunnels','daily-account-patients-1854'];
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1300,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',msg=>{if(msg.type()==='error'&&msg.text().includes('THREE'))errors.push(msg.text());});
 await page.route('https://**/*',async route=>{
  if(route.request().url().startsWith('https://cdn.jsdelivr.net/'))await route.fulfill({contentType:'text/javascript',body:await readFile(new URL('../dist/vendor/'+route.request().url().split('/').at(-1),import.meta.url),'utf8')});
  else await route.abort();
 });
 await page.route('**/game.mjs',async route=>{
  const source=await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8');
  await route.fulfill({contentType:'text/javascript',body:source+`
window.wallArtTest={
 get ready(){return ready;},get panels(){return artPanels;},
 inspect(){
  scene.updateMatrixWorld(true);
  return artPanels.map(art=>{
   const floor=floors[art.floor],normal=new THREE.Vector3(art.normalX,0,art.normalZ),centre=art.panel.getWorldPosition(new THREE.Vector3());
   const ray=new THREE.Raycaster(centre.clone().addScaledVector(normal,1.4),normal.clone().negate(),0,2);
   const hit=ray.intersectObjects(floorGroups[art.floor].children,true)[0];
   return {title:art.title,credit:art.credit,url:art.url,imageOnly:art.imageOnly,floor:art.floor,x:art.x,z:art.z,rotation:art.rotation,
    solidWall:interiorWallSurfaces(floor).some(s=>!s.window&&Math.hypot(s.x-s.dx*.115-art.x,s.z-s.dz*.115-art.z)<.001&&s.rotation===art.rotation),
    markerDistance:Math.min(...[...floor.stairs,...floor.exits].map(m=>Math.hypot(m.x*floor.cellSize-art.x,m.z*floor.cellSize-art.z))),
    panelDistance:Math.min(...placedWallPanels.filter(p=>p.floor===art.floor&&Math.hypot(p.x-art.x,p.z-art.z)>.001).map(p=>Math.hypot(p.x-art.x,p.z-art.z))),
    accessible:walkable(floor,art.x+art.normalX*1.4,art.z+art.normalZ*1.4,.34),
    exposed:hit?.object===art.panel,textureReady:art.panel.material.map.version>1};
  });
 },
 pose(index,distance=1.45){
  const art=artPanels[index];closeArtViewer();keys.clear();
  Object.assign(player,{x:art.x+art.normalX*distance,z:art.z+art.normalZ*distance,floor:art.floor});showFloor();
  yaw=art.rotation;pitch=Math.atan2(.23,distance);camera.position.set(player.x,player.floor*FLOOR_HEIGHT+1.65,player.z);state='play';elapsed=0;update(0);drawMap();state='paused';
  $('arrivalFade').hidden=true;$('result').hidden=true;
  return {interact:$('interact').hidden?null:$('interact').querySelector('b').textContent,title:$('exitName').textContent};
 },
 hold(){state='play';keys.add('KeyE');update(.001);state='paused';return artViewing?.url;},
 release(){state='play';keys.delete('KeyE');update(.001);state='paused';return artViewing===null;},
 start(){start();arrivalCutscene.update(3);state='paused';},
};`});
 });
 await page.goto(`http://127.0.0.1:${port}`);
 await page.waitForFunction(()=>window.wallArtTest?.ready,null,{timeout:120000});
 await page.waitForFunction(()=>window.wallArtTest.panels.every(p=>p.panel.material.map.version>1),null,{timeout:30000});
 const panels=await page.evaluate(()=>window.wallArtTest.inspect());
 assert.equal(panels.length,24);
 for(const floor of [0,1]){
  const onFloor=panels.filter(p=>p.floor===floor);assert.equal(onFloor.length,12);assert.equal(new Set(onFloor.map(p=>p.url)).size,11);
  for(const file of additions)assert(onFloor.some(p=>p.url.endsWith(file+'.png')));
 }
 for(const panel of panels){
  assert(panel.solidWall&&panel.accessible&&panel.exposed&&panel.textureReady,JSON.stringify(panel));
  assert(panel.markerDistance>=3.5);assert(panel.panelDistance>=1.7);
 }
 await page.locator('#start').click();
 await page.evaluate(()=>{window.wallArtTest.start();});
 const rendered=[];
 for(const floor of [0,1])for(const file of additions){
  const index=panels.findIndex(p=>p.floor===floor&&p.url.endsWith(file+'.png'));
  const interaction=await page.evaluate(i=>window.wallArtTest.pose(i),index);
  assert.equal(interaction.interact,'HOLD E TO VIEW');assert.equal(interaction.title,panels[index].imageOnly?'':panels[index].title);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:`Browser/artifacts/escape-wall-art-${floor}-${file}.png`});
  assert.equal(await page.evaluate(()=>window.wallArtTest.hold()),panels[index].url);
  await page.waitForFunction(()=>{const img=document.getElementById('artViewerImage');return img.complete&&img.naturalWidth>0;});
  assert.equal(await page.locator('#artViewerTitle').isVisible(),!panels[index].imageOnly);
  assert.equal(await page.locator('#artViewerCredit').isVisible(),!!panels[index].credit&&!panels[index].imageOnly);
  const dimensions=await page.locator('#artViewerImage').evaluate(img=>({width:img.naturalWidth,height:img.naturalHeight}));
  if(floor===0)await page.screenshot({path:`Browser/artifacts/escape-wall-art-viewer-${file}.png`});
  assert.equal(await page.evaluate(()=>window.wallArtTest.release()),true);
  assert.equal(await page.locator('#artViewer').isVisible(),false);
  rendered.push({file,floor,...dimensions});
 }
 await page.setViewportSize({width:390,height:844});
 const table=panels.findIndex(p=>p.floor===0&&p.url.endsWith(additions[2]+'.png'));
 await page.evaluate(i=>{window.wallArtTest.pose(i);window.wallArtTest.hold();},table);
 await page.screenshot({path:'Browser/artifacts/escape-wall-art-viewer-mobile.png'});
 await page.evaluate(()=>window.wallArtTest.release());
 // Reload chooses new wall locations while keeping all supplied artwork available.
 await page.reload();
 await page.waitForFunction(()=>window.wallArtTest?.ready,null,{timeout:120000});
 const reloaded=await page.evaluate(()=>window.wallArtTest.inspect());
 assert.notDeepEqual(reloaded.map(p=>[p.x,p.z,p.floor]),panels.map(p=>[p.x,p.z,p.floor]));
 for(const floor of [0,1])for(const file of additions)assert(reloaded.some(p=>p.floor===floor&&p.url.endsWith(file+'.png')));
 assert.deepEqual(errors,[]);
 await writeFile('Browser/artifacts/escape-wall-art-validation.json',JSON.stringify({panels,rendered,randomizedOnReload:true,errors},null,2)+'\n');
 console.log(JSON.stringify({panels:panels.length,rendered,randomizedOnReload:true,errors},null,2));
}finally{await browser?.close();server.kill();}
