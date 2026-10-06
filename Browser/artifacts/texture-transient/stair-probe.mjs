import {readFile,writeFile} from 'node:fs/promises';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const {server,base}=await startTestServer();let browser;
const instrument=`
window.stairTexture={get ready(){return ready;},start(){start();arrivalCutscene.update(3);state='paused';},
 async climb(){
  const {stairDeparture}=await import('./asylum-layout.mjs');
  const stair=floors[0].stairs.find(s=>s.id==='S1'),route=stairRoute(stair,0,floors[1].elevation,0,1),[x,y,z]=route[0];
  Object.assign(player,{x,y,z,floor:0,stair:null,outside:false});indoorJump.reset();
  const samples=[];
  for(const point of route){for(let i=0;i<400&&Math.hypot(player.x-point[0],player.z-point[2])>.015;i++){
   const dx=point[0]-player.x,dz=point[2]-player.z,d=Math.hypot(dx,dz),step=Math.min(d,.04);
   indoorJump.update(player,dx/d*step,dz/d*step,1/120);
  }samples.push({x:player.x,z:player.z,y:player.y,floor:player.floor,stair:!!player.stair});}
  torch.visible=false;enemies.forEach(e=>e.mesh.visible=false);
  camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(-.42,Math.PI/2,0);
  const capture=()=>{interiorLights.update(player);renderer.render(scene,camera);return canvas.toDataURL('image/png');};
  const before=capture(),beforePool=interiorLights.pool.map(l=>({y:l.position.y,intensity:l.intensity}));
  const atTop={...player,stair:!!player.stair};
  const departure=stairDeparture(floors[1],route.at(-1));
  for(let i=0;i<100&&player.floor===0;i++){
   const dx=departure.x-player.x,dz=departure.z-player.z,d=Math.hypot(dx,dz),step=Math.min(d,.04);
   if(d<.001)break;indoorJump.update(player,dx/d*step,dz/d*step,1/120);
  }
  const departed={...player,stair:!!player.stair};
  // Keep the identical camera to isolate the floor-identity change in lighting.
  const after=capture(),afterPool=interiorLights.pool.map(l=>({y:l.position.y,intensity:l.intensity}));
  return {before,after,beforePool,afterPool,atTop,departed,samples};
 }};`;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+instrument}));
 await page.goto(base);await page.waitForFunction(()=>window.stairTexture?.ready);
 await page.evaluate(()=>window.stairTexture.start());
 const result=await page.evaluate(()=>window.stairTexture.climb());
 const mode=process.argv[2]??'before';
 for(const name of ['before','after']){await writeFile(new URL(mode+'-stair-'+name+'.png',import.meta.url),Buffer.from(result[name].split(',')[1],'base64'));delete result[name];}
 await writeFile(new URL(mode+'-stair.json',import.meta.url),JSON.stringify({result,errors},null,2)+'\n');
 console.log(JSON.stringify({result,errors},null,2));
}finally{await browser?.close();server.kill();}
