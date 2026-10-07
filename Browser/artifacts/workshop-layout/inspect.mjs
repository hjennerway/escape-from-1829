import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const label=process.argv[2]??'before';
await mkdir(new URL('.',import.meta.url),{recursive:true});
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8');
const instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>{const s=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');await r.fulfill({contentType:'text/javascript',body:s+instrument});});
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.groundsTest?.ready);await page.evaluate(()=>{groundsTest.begin();groundsTest.night();groundsTest.progress.run.towerOpen=true;for(const id of ['repair','oil-store','machine'])groundsTest.progress.run.workshopDoors['workshop-door:'+id]=true;groundsTest.grounds.sync();});
 const receipt=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),t=groundsTest,meshes=[];t.exterior.model.updateMatrixWorld(true);t.exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
  const gallery=t.grounds.workshops.group.userData.gallery??t.grounds.workshops.plan.gallery??(await import('/workshop-gallery.mjs')).WORKSHOP_GALLERY,cx=(gallery.minX+gallery.maxX)/2;
  const floors=[];for(let z=gallery.minZ+1;z<gallery.maxZ-1;z+=.5){const hit=new THREE.Raycaster(new THREE.Vector3(cx,2,z),new THREE.Vector3(0,-1,0),0,3).intersectObjects(meshes,false)[0];if(hit)floors.push({z,y:hit.point.y,name:hit.object.name});}
  const w=t.grounds.workshops,door=w.roomDoors.find(d=>d.id==='workshop-door:oil-store'),shelves=[];w.group.traverse(o=>{if(/Parts shelf|Shelf upright|Spare parts bin/.test(o.name))shelves.push(o);});
  const sweep=[];for(let i=0;i<=18;i++){door.pivot.rotation.y=door.side*Math.PI/2*i/18;door.pivot.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(door.pivot.getObjectByName('Workshop room door leaf'));for(const shelf of shelves)if(b.intersectsBox(new THREE.Box3().setFromObject(shelf)))sweep.push({angle:i*5,shelf:shelf.name});}t.grounds.sync();
  const machineLine=[];for(let x=cx;x<165;x+=.2)machineLine.push({x,clear:t.walker.clear(x,-48)});
  const doorRay=new THREE.Raycaster(new THREE.Vector3(cx,1.4,-48),new THREE.Vector3(1,0,0),0,12).intersectObjects(meshes,false).slice(0,6).map(h=>({name:h.object.name,parent:h.object.parent.name,x:h.point.x}));
  const gl=t.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');return {renderer:gl.getParameter(info.UNMASKED_RENDERER_WEBGL),gallery,cx,floors,shelfIntersections:sweep,machineLine,doorRay,clearWidth:gallery.maxX-gallery.minX-.575,clearHeight:gallery.ceiling-.05-.04};
 });
 if(label!=='before'){assert.equal(receipt.shelfIntersections.length,0,'All 19 door positions clear shelves and bins');assert(receipt.floors.every(f=>Math.abs(f.y-.04)<1e-4),'Continuous level corridor floor');assert(Math.abs(receipt.clearWidth/4.825-.65)<1e-9);assert(Math.abs(receipt.clearHeight/3.41-1.1)<1e-9);}
 if(label!=='before')receipt.walks=await page.evaluate(cx=>{const t=groundsTest,door=t.grounds.nodes.find(n=>n.id==='tower-door');t.pose(door.x,door.z);const targets=[{x:cx,z:-44.75},t.grounds.nodes.find(n=>n.id==='crowbar'),t.grounds.nodes.find(n=>n.id==='oil'),{x:164,z:-48},{x:167,z:-49},{x:173,z:-47},{x:cx,z:t.grounds.workshops.plan.corridors.find(r=>r.id==='gallery').end[1]+2},{x:cx,z:t.grounds.workshops.plan.corridors.find(r=>r.id==='gallery').start[1]-2}];return targets.map(point=>({point,samples:t.walk(point)}));},receipt.cx);
 for(const [name,x,z,yaw,pitch]of [['corridor',receipt.cx,-79,0,-.13],['step',receipt.cx,-19,Math.PI,-.23],['join',receipt.cx,-61.8,-.62,0],['oil-door',150.4,-29.5,-.65,-.1],['machine-entry',160.7,-48.5,-1.83,-.08],['machine-right',161,-47,Math.PI,-.05],['machine-lathe',170,-50,0,-.1]]){
  await page.evaluate(p=>groundsTest.pose(...p),[x,z,yaw,pitch]);await page.screenshot({path:fileURLToPath(new URL(label+'-'+name+'.png',import.meta.url))});
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(x=>groundsTest.pose(x,-80,0,-.08),receipt.cx);await page.screenshot({path:fileURLToPath(new URL(label+'-phone.png',import.meta.url))});
 assert.deepEqual(errors,[]);await writeFile(new URL(label+'-validation.json',import.meta.url),JSON.stringify({receipt,errors},null,2));
 console.log(JSON.stringify({renderer:receipt.renderer,gallery:receipt.gallery,raisedFloors:receipt.floors.filter(f=>f.y>.06),machineBlocked:receipt.machineLine.filter(p=>!p.clear),doorRay:receipt.doorRay,errors},null,2));
}finally{await browser?.close();server.kill();}
