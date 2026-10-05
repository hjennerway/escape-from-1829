import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from './test-support/server.mjs';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const destination=new URL(process.env.LIBRARY_ARTIFACT_DIR??'./artifacts/west-library/',import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer(),browser=await launchHardwareBrowser();
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
window.libraryCheck={get ready(){return ready;},get floors(){return floors;},get player(){return player;},get scene(){return scene;},get groups(){return floorGroups;},get camera(){return camera;},get renderer(){return renderer;},
start(){start();arrivalCutscene.update(3);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;},
pose(x,z,floor,tx,tz,tilt=0){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=tilt;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;notebook.explore(player);drawMap();interiorLights.update(player);},
walk(to){const route=routeBetweenFloors(floors,player,to);this.lastWalk={to,seed:floors[3].furnitureSeed};if(!route.length){this.lastWalk.noRoute=true;return false;}for(const p of route){for(let n=0;n<800&&Math.hypot(p.x-player.x,p.z-player.z)>.025;n++){const dx=p.x-player.x,dz=p.z-player.z,d=Math.hypot(dx,dz),step=Math.min(.04,d);moveAsylumActor(floors,player,dx/d*step,dz/d*step);notebook.explore(player);}if(Math.hypot(p.x-player.x,p.z-player.z)>.04){this.lastWalk.stuck={target:p,actor:{...player}};return false;}}showFloor();return player.floor===to.floor;},
trip(){const exit=floors[3].exits.find(e=>e.id==='F4');this.pose(exit.inside.x,exit.inside.z,3,-63,13.5);state='play';keys.clear();update(.01);keys.add('KeyE');update(.04);const outside=player.outside,position=[player.x,player.y,player.z];update(.04);const latched=player.outside;keys.delete('KeyE');update(.04);keys.add('KeyE');update(.04);const returned=!player.outside&&player.floor===3;keys.clear();state='paused';return {outside,latched,returned,position,expected:exit.destination};},
openNotebook(){state='play';openNotebook();}
};`}));
 await page.goto(base);await page.waitForFunction(()=>window.libraryCheck?.ready);await page.evaluate(()=>window.libraryCheck.start());
 const walked=await page.evaluate(()=>{
  const t=window.libraryCheck,results=[];t.pose(0,17.5,0,0,0);
  for(const room of t.floors[3].rooms.filter(r=>/^R(?:46|47|48|49|50)$/.test(r.id))){const entered=t.walk({x:room.label[0],z:room.label[1],floor:3}),entryFailure=entered?null:t.lastWalk,returned=t.walk({x:0,z:17.5,floor:0});results.push({room:room.id,entered,returned,entryFailure,returnFailure:returned?null:t.lastWalk});}
  t.pose(0,8.3,3,0,4.4);const acrossUpper=t.walk({x:-65,z:10.3,floor:3});return {results,acrossUpper};
 });
 await writeFile(new URL('walk-validation.json',destination),JSON.stringify(walked,null,2)+'\n');
 assert(walked.results.every(r=>r.entered&&r.returned)&&walked.acrossUpper,'Actual furnished game player reaches all Library rooms via continuous stairs: '+JSON.stringify(walked));
 const trip=await page.evaluate(()=>window.libraryCheck.trip());assert(trip.outside&&trip.latched&&trip.returned);assert.deepEqual(trip.position,[-63,8.5,14.3]);
 await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[['library',-65,10.3,3,-69,5.3],['library-reading-table',-65,12,3,-68,10,.12],['sitting-room',-68,17.4,3,-68,20.5],['bay-reading-room',-52.5,12,3,-52.5,17.8],['librarian-office',-44.7,10.8,3,-43.7,13.5],['book-store',-37.5,17,3,-37.5,21.2],['rear-passage',-54.2,7.1,3,-37.5,7.65],['open-stair',-31.15,8.55,3,-32,11.5,-.2],['fire-escape-door',-63,11.8,3,-63,13.5]];
 for(const [name,...pose] of views){await page.evaluate(p=>window.libraryCheck.pose(...p),pose);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});}
 await page.evaluate(()=>{const t=window.libraryCheck;t.pose(-52,12,3,-52,13);t.scene.fog=null;t.groups.forEach((g,i)=>g.visible=i===3);t.groups[3].traverse(o=>{if(o.name==='Asylum ceiling')o.visible=false;});t.camera.position.set(-50.5,48,12);t.camera.lookAt(-50.5,8.4,12);t.renderer.render(t.scene,t.camera);});
 await page.screenshot({path:fileURLToPath(new URL('cutaway.png',destination))});
 await page.evaluate(()=>window.libraryCheck.groups[3].traverse(o=>{if(o.name==='Asylum ceiling')o.visible=true;}));
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.libraryCheck.pose(-65,10.3,3,-69,5.3));await page.screenshot({path:fileURLToPath(new URL('library-mobile.png',destination))});
 await page.evaluate(()=>window.libraryCheck.openNotebook());await page.waitForFunction(()=>!document.getElementById('floorMap').hidden);await page.screenshot({path:fileURLToPath(new URL('notebook-mobile.png',destination))});
 // Explore consumes the same upper rooms and exterior-door connection.
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.libraryExploreCheck={walker,interior,renderer,floors};const clock=new THREE.Timer();')});});
 await page.setViewportSize({width:1440,height:900});await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.libraryExploreCheck?.renderer.info.render.frame>2);
 const exploreTrip=await page.evaluate(()=>{const t=window.libraryExploreCheck,e=t.floors[3].exits.find(e=>e.id==='F4');t.walker.setView({position:[-63,10.3,14.3],target:[-63,10.3,13.5]});const entered=t.walker.useDoor()&&!t.walker.actor.outside&&t.walker.actor.floor===3;const returned=t.walker.useDoor()&&t.walker.actor.outside;return {entered,returned,position:[t.walker.actor.x,t.walker.actor.y,t.walker.actor.z],room:t.floors[3].rooms.find(r=>r.id==='R46').name};});
 assert(exploreTrip.entered&&exploreTrip.returned);assert.deepEqual(exploreTrip.position,[-63,8.5,14.3]);assert.equal(exploreTrip.room,'Library');
 assert.deepEqual(errors,[]);await writeFile(new URL('browser-validation.json',destination),JSON.stringify({walked,trip,exploreTrip,errors},null,2)+'\n');
 console.log('PASS: furnished Library room walks, upper-wing route, F4 release-latched game/Explore round trips, desktop/mobile/cutaway/notebook GPU views and no page/shader errors.');
}finally{await browser.close();server.kill();}
