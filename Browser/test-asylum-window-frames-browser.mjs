import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const destination=new URL('./artifacts/window-frames/',import.meta.url);await mkdir(destination,{recursive:true});
const before=process.argv.includes('--before'),mode=before?'before':'after';
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'pipe',env:{...process.env,PORT:'0'}});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],views=[];
try{
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 if(before)for(const [file,saved] of [['asylum-architecture.mjs','before-architecture.mjs.txt'],['asylum-room-finishes.mjs','before-room-finishes.mjs.txt']])await page.route('**/'+file,async route=>route.fulfill({contentType:'text/javascript',body:await readFile(new URL(saved,destination),'utf8')}));
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
 window.frameCheck={get ready(){return ready;},get groups(){return floorGroups;},get floors(){return floors;},get renderer(){return renderer;},start(){start();arrivalCutscene.update(3);},pose(x,z,floor,tx,tz,tilt=.08){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=tilt;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.frameCheck?.ready);await page.evaluate(()=>window.frameCheck.start());
 await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const selected=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{insidePolygon,flatWalkable}=await import('/asylum-layout.mjs'),matrix=new THREE.Matrix4(),t=window.frameCheck,result=[];
  for(const [id,roomId,angled] of [[0,'R4',false],[1,'R2',false],[2,'B7',false],[3,'R42',true]]){
   const floor=t.floors[id],room=floor.rooms.find(r=>r.id===roomId),glass=t.groups[id].getObjectByName('Asylum Glass'),candidates=[];
   for(let i=0;i<glass.count;i++){
    glass.getMatrixAt(i,matrix);const p=new THREE.Vector3().setFromMatrixPosition(matrix),n=new THREE.Vector3(0,0,1).transformDirection(matrix),u=new THREE.Vector3(1,0,0).transformDirection(matrix);
    if(p.y>3||angled&&Math.abs(n.x*n.z)<.4)continue;
    for(const side of [-1,1]){
     if(!insidePolygon(p.x+n.x*side*.3,p.z+n.z*side*.3,room.points))continue;
     const distance=(id===3?[2.8,3.2,2.5]:[2.1]).find(d=>flatWalkable(floor,p.x+n.x*side*d,p.z+n.z*side*d));
     if(!distance)continue;
     const x=p.x+n.x*side*distance,z=p.z+n.z*side*distance,tilt=Math.atan2(p.y-1.65,distance);
     candidates.push({name:`floor-${id}-${roomId}`,pose:[x,z,id,p.x,p.z,tilt],oblique:[x+u.x*.6,z+u.z*.6,id,p.x,p.z,tilt],distance:Math.hypot(p.x-room.label[0],p.z-room.label[1])});
    }
   }
   candidates.sort((a,b)=>a.distance-b.distance);if(!candidates.length)throw new Error('No inspection position for '+roomId);result.push(candidates[0]);
  }
  return result;
 });
 async function shot(name,pose){
  await page.evaluate(p=>window.frameCheck.pose(...p),pose);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});views.push({name,pose});
 }
 const resources=await page.evaluate(()=>window.frameCheck.groups.map((g,floor)=>({floor,sashes:g.getObjectByName('Asylum Sash').count,railVertices:g.getObjectByName('Asylum Dado').geometry.attributes.position.count})));
 const captures=process.argv.includes('--explore-only')?[]:process.argv.includes('--upper-only')?selected.slice(-1):selected;
 for(const view of captures){await shot(view.name,view.pose);await shot(view.name+'-oblique',view.oblique);}
 if(!process.argv.includes('--explore-only')){await page.setViewportSize({width:390,height:844});await shot('mobile',selected[0].pose);}
 let explore;
 if(!before&&!process.argv.includes('--upper-only')){
  await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.frameExplore={walker,interior,renderer,floors};const clock=new THREE.Timer();')});});
  await page.setViewportSize({width:1280,height:900});await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.frameExplore?.renderer.info.render.frame>2);
  await page.addStyleTag({content:'.explore-guide{display:none}'});
  await page.evaluate(p=>{const {walker,floors}=window.frameExplore;Object.assign(walker.actor,{x:p[3]+(p[0]-p[3])*1.8,z:p[4]+(p[1]-p[4])*1.8,floor:p[2],y:floors[p[2]].elevation,outside:false,stair:null});walker.look(Math.atan2(p[0]-p[3],p[1]-p[4]),Math.atan(Math.tan(p[5])/1.8));walker.update(.01);document.getElementById('layoutControls').open=false;},selected[0].pose);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL('after-exploration.png',destination))});
  explore=await page.evaluate(()=>window.frameExplore.floors.map(f=>{const g=window.frameExplore.interior.scene.children.find(g=>g.name===f.name);return {floor:f.id,sashes:g.getObjectByName('Asylum Sash').count,railVertices:g.getObjectByName('Asylum Dado').geometry.attributes.position.count};}));
  assert.deepEqual(explore,resources,'Escape and Explore use the same repaired frames and rails on every floor');
 }
 const suffix=process.argv.includes('--upper-only')?'-upper':process.argv.includes('--explore-only')?'-explore':'';
 assert.deepEqual(errors,[]);await writeFile(new URL(`${mode}-browser${suffix}.json`,destination),JSON.stringify({views,resources,explore,errors},null,2)+'\n');
 console.log(`PASS: ${views.length} ${mode} window views${explore?', matching repaired Escape/Explore geometry on all four floors':''}, no page or shader errors.`);
}finally{await browser.close();server.kill();}
