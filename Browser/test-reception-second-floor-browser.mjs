import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
const destination=new URL(process.env.DOOR_LABEL_ARTIFACT_DIR??'./artifacts/top-floor-layout-proposal/implemented/',import.meta.url);
await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();
const browser=await launchHardwareBrowser({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:850}}),errors=[];page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.upperCheck={get ready(){return ready;},get floors(){return floors;},get groups(){return floorGroups;},get notebook(){return notebook;},player,start(){start();arrivalCutscene.update(3);},pose(x,z,floor,tx,tz,tilt=0){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=tilt;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;notebook.explore(player);drawMap();interiorLights.update(player);},walk(to){const route=routeBetweenFloors(floors,player,to);if(!route.length)return false;for(const p of route){for(let n=0;n<500&&Math.hypot(p.x-player.x,p.z-player.z)>.025;n++){const dx=p.x-player.x,dz=p.z-player.z,d=Math.hypot(dx,dz),step=Math.min(.04,d);moveAsylumActor(floors,player,dx/d*step,dz/d*step);notebook.explore(player);}if(Math.hypot(p.x-player.x,p.z-player.z)>.04)return false;}showFloor();return player.floor===to.floor;},openNotebook(){state='play';openNotebook();}};`}));
 await page.goto(`${base}`);await page.waitForFunction(()=>window.upperCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.upperCheck.start());
 const walked=await page.evaluate(()=>{
  const t=window.upperCheck;t.pose(0,17.5,0,0,0);const results=[];
  for(const room of t.floors[3].rooms.filter(r=>r.label[0]>-18)){results.push(t.walk({x:room.label[0],z:room.label[1],floor:3}));results.push(t.walk({x:0,z:17.5,floor:0}));}
  return {results,floors:t.floors.map(f=>f.name),views:t.notebook.availableViews().map(v=>v.name)};
 });
 assert.equal(walked.results.length,10);assert(walked.results.every(Boolean),'Actual player reaches and returns from all five furnished rooms');assert(walked.views.includes('Second floor'));
 const labels=await page.evaluate(async()=>{
  const t=window.upperCheck,upper=t.floors[3],mesh=t.groups[3].getObjectByName('Asylum RoomDoorLabels'),{flatWalkable}=await import('/asylum-layout.mjs');
  const views=[],allFloors=t.floors.map(f=>{
   const labels=t.groups[f.id].getObjectByName('Asylum RoomDoorLabels');
   return {id:f.id,labels:labels.userData.labels,atlas:[labels.material.map.image.width,labels.material.map.image.height]};
  });
  for(const floor of t.floors){
   const entries=allFloors[floor.id].labels;
   const samples=entries.filter(l=>l.face===1&&(l===entries[1]||l===entries.at(-1)||l.text.includes(' ')||l.roomId==='R10'));
   for(const label of samples){
    const id=label.roomId,door=floor.roomDoors.find(d=>d.roomId===id);
    const choices=entries.filter(l=>l.roomId===id).flatMap(l=>[1.25,1.05,.85].map(distance=>{
     const nx=Math.sin(door.rotation)*l.face,nz=Math.cos(door.rotation)*l.face;
     return {id,floor:floor.id,text:l.text,pose:[l.x+nx*distance,l.z+nz*distance,floor.id,l.x,l.z,.08]};
    }));
    const view=choices.find(v=>flatWalkable(floor,v.pose[0],v.pose[1]));if(!view)throw Error('No clear approach to door label '+floor.id+' '+id);views.push(view);
   }
  }
  const {Raycaster,Vector3}=await import('/vendor/three.module.js'),ray=new Raycaster(),mobileViews=[];
  for(const floorId of [0,3]){
   const floor=t.floors[floorId],group=t.groups[floorId];group.updateMatrixWorld(true);
   const candidates=views.filter(v=>v.floor===floorId&&(floorId===3||v.id==='R1'));
   let view;
   for(const v of candidates){
    const door=floor.roomDoors.find(d=>d.roomId===v.id);
    const choices=allFloors[floorId].labels.filter(l=>l.roomId===v.id).flatMap(l=>[2.25,2,1.8,1.6].map(distance=>{
     const nx=Math.sin(door.rotation)*l.face,nz=Math.cos(door.rotation)*l.face;
     return [l.x+nx*distance,l.z+nz*distance,floorId,l.x,l.z,.08];
    }));
    const pose=choices.find(p=>{
     if(!flatWalkable(floor,p[0],p[1]))return false;
     const start=new Vector3(p[0],floor.elevation+1.65,p[1]),delta=new Vector3(p[3],floor.elevation+1.75,p[4]).sub(start);
     ray.set(start,delta.clone().normalize());ray.far=delta.length()+.02;
     return ray.intersectObject(group,true)[0]?.object.name==='Asylum RoomDoorLabels';
    });
    if(pose){view={...v,pose};break;}
   }
   if(!view)throw Error('No unobstructed mobile plaque approach on floor '+floorId);mobileViews.push(view);
  }
  return {names:mesh.userData.labels.map(l=>l.text),atlas:[mesh.material.map.image.width,mesh.material.map.image.height],lowerLabelCounts:t.groups.slice(0,3).map(g=>g.getObjectByName('Asylum RoomDoorLabels')?.userData.labels.length??0),allFloors,views,mobileViews};
 });
 assert.equal(new Set(labels.names).size,10);assert.deepEqual(labels.atlas,[1536,1280]);assert.deepEqual(labels.lowerLabelCounts,[76,66,22]);
 const allNumbers=labels.allFloors.flatMap(f=>f.labels.filter(l=>l.face===1).map(l=>l.number));assert.equal(allNumbers.length,92);assert.equal(new Set(allNumbers).size,92);
 for(const f of labels.allFloors){
  assert(f.atlas.every(n=>n<=4096),'Floor atlas fits a 4096 px texture limit');
  const numbers=f.labels.filter(l=>l.face===1).map(l=>l.number);
  assert.deepEqual(numbers,numbers.map((_,i)=>f.id===0?`G${i+1}`:f.id===1?String(101+i):f.id===2?`B${i+1}`:String(201+i)),'Rendered labels follow unique numeric order on every floor');
 }
 const views=[['passage',-7,12.2,3,6,12.2],['staff-sitting-room',-5.3,8.3,3,-4,4.4],['records-office',0,8.3,3,0,4.4],['staff-office',5.3,8.3,3,4,4.4],['archive',3.8,14.45,3,-5,15.2],['linen-store',-12.3,8.15,3,-15,7.5],['stairwell',-9.45,10.25,3,-12.8,13,-.25],...labels.views.map(v=>['label-'+v.floor+'-'+v.id,...v.pose])];
 for(const [name,...pose] of views){await page.evaluate(p=>window.upperCheck.pose(...p),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.upperCheck.pose(0,8.3,3,0,4.4));
 await page.screenshot({path:fileURLToPath(new URL('room-mobile.png',destination))});
 for(const view of labels.mobileViews){
  await page.evaluate(p=>window.upperCheck.pose(...p),view.pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(view.floor===3?'label-mobile.png':'treatment-mobile.png',destination))});
 }
 await page.evaluate(()=>window.upperCheck.openNotebook());await page.waitForFunction(()=>!document.getElementById('floorMap').hidden);assert.match(await page.locator('#mapFloorName').textContent(),/SECOND FLOOR/i);await page.screenshot({path:fileURLToPath(new URL('notebook-mobile.png',destination))});
 // Explore builds the same labelled architecture and furnishings.
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.upperExploreCheck={walker,interior,renderer,floors};const clock=new THREE.Timer();')});});
 await page.setViewportSize({width:1280,height:850});await page.goto(`${base}/explore.html`);await page.waitForFunction(()=>window.upperExploreCheck?.renderer.info.render.frame>2);
 const exploreLabels=await page.evaluate(()=>window.upperExploreCheck.interior.scene.getObjectByName('Second floor').getObjectByName('Asylum RoomDoorLabels').userData.labels.map(l=>l.text));
 assert.deepEqual(exploreLabels,labels.names,'Escape and Explore display identical door names');
 const exploreFloors=await page.evaluate(()=>window.upperExploreCheck.floors.map(f=>window.upperExploreCheck.interior.scene.getObjectByName(f.name).getObjectByName('Asylum RoomDoorLabels').userData.labels));
 assert.deepEqual(exploreFloors,labels.allFloors.map(f=>f.labels),'All floor numbers, treatment names and plaque poses match in Escape and Explore');
 await page.addStyleTag({content:'.explore-guide{display:none}'});
 await page.evaluate(p=>{const t=window.upperExploreCheck,floor=t.floors[p[2]];t.walker.setView({position:[p[0],floor.elevation+1.65,p[1]],target:[p[3],floor.elevation+1.75,p[4]]});Object.assign(t.walker.actor,{x:p[0],z:p[1],floor:p[2],y:floor.elevation,outside:false,stair:null});t.walker.update(.01);document.getElementById('layoutControls').open=false;},labels.mobileViews[0].pose);
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL('explore-label.png',destination))});
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({walked,labels,exploreLabels,errors},null,2)+'\n');
 console.log('PASS: 92 unique ordered floor numbers, six treatment names, compact GPU atlases, ten actual Reception furnished room walks, Escape/Explore plaque parity, desktop/phone views and no page/shader errors.');
}finally{await browser.close();server.kill();}
