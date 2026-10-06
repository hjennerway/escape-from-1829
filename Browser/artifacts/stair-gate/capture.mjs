import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const destination=new URL('./',import.meta.url);
await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();
let browser;
const errors=[],views=[];
const instrument=`
window.gateView={get ready(){return ready},pose(id,side=0,open=false){
 const g=escapeWorld.gates.find(g=>g.id===id);
 if(open)escapeProgress.run.opened.add(id);else escapeProgress.run.opened.delete(id);
 escapeWorld.sync();
 Object.assign(player,{x:g.x-g.dx*2.7+g.dz*side,z:g.z-g.dz*2.7-g.dx*side,y:g.y,floor:1,stair:null,outside:false});
 showFloor();state='paused';enemyReleaseAt=Infinity;keys.clear();
 camera.position.set(player.x,player.y+1.65,player.z);
 camera.lookAt(g.x,g.y+1.2,g.z);yaw=camera.rotation.y;pitch=camera.rotation.x;
 const floor=floorGroups[1];floor.updateMatrixWorld(true);
 const stone=[];floor.traverse(o=>{if(o.isMesh&&['Asylum Stone','Asylum floor'].includes(o.name))stone.push(o)});
 const support=[-1,1].map(side=>{
  const local=new THREE.Vector3(side*.65,.2,0);g.group.localToWorld(local);
  const ray=new THREE.Raycaster(local,new THREE.Vector3(0,-1,0),0,.5);
  const hit=ray.intersectObjects(stone,false)[0];return {side,height:hit?.point.y};
 });
 return {id,x:g.x,z:g.z,y:g.y,height:g.height,open,frameVisible:g.group.visible,leafVisible:g.leaf.visible,support};
}};`;
try{
 browser=await launchHardwareBrowser({executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1228,height:890}});
 page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text())});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>gateView.ready);
 await page.locator('#start').click();
 for(const id of ['S1','S5'])for(const [name,side,open] of [['front',0,false],['angle',1.3,false],['released',0,true]]){
  views.push(await page.evaluate(([id,side,open])=>gateView.pose(id,side,open),[id,side,open]));
  await page.screenshot({path:fileURLToPath(new URL(id+'-'+name+'.png',destination))});
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>gateView.pose('S1',.7,false));
 await page.screenshot({path:fileURLToPath(new URL('S1-mobile.png',destination))});
 assert.deepEqual(errors,[]);
 assert(views.every(v=>v.frameVisible&&v.leafVisible===!v.open));
 assert(views.every(v=>v.support.every(s=>Math.abs(s.height-v.y-.002)<.00001)),'All gate posts bed into the actual landing slab');
 await writeFile(new URL('validation.json',destination),JSON.stringify({views,errors},null,2));
 console.log(JSON.stringify({views,errors},null,2));
}finally{await browser?.close();server.kill();}
