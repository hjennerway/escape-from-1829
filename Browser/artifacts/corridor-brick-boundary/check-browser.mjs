import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const mode=process.argv[2]??'after',destination=new URL('./',import.meta.url);
await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();
const browser=await launchHardwareBrowser({executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+`
 window.brickCheck={get ready(){return ready;},get floors(){return floors;},get groups(){return floorGroups;},get renderer(){return renderer;},start(){start();arrivalCutscene.update(3);},pose(x,z,floor,tx,tz,tilt=-.23){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=tilt;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.brickCheck?.ready);
 await page.evaluate(()=>window.brickCheck.start());
 await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const captures=[];
 for(const [name,...pose] of [
  ['ground-close',-20.5,8.2,0,-20.5,7],
  ['first-close',-20.5,8.2,1,-20.5,7],
  ['basement-close',-31.1,-7,2,-32.3,-7],
  ['second-close',0,14,3,-1.2,14],
  ['angled-corner',5.6,-23.3,0,4.1,-24.5,-.15],
 ]){
  const actualPose=name==='second-close'?await page.evaluate(async()=>{
   const THREE=await import('/vendor/three.module.js'),t=window.brickCheck,f=t.floors[3],walls=['Asylum Brick','Asylum Plaster'].map(n=>t.groups[3].getObjectByName(n)),ray=new THREE.Raycaster();
   for(const c of f.corridors)for(let i=1;i<c.points.length;i++){
    const a=c.points[i-1],b=c.points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;
    for(const fraction of [.2,.4,.6,.8])for(const side of [-1,1]){
     const x=a[0]+(b[0]-a[0])*fraction,z=a[1]+(b[1]-a[1])*fraction;
     ray.set(new THREE.Vector3(x,f.elevation+.65,z),new THREE.Vector3(nx*side,0,nz*side));ray.far=c.width/2+.3;
     const hit=ray.intersectObjects(walls,false)[0];
     if(hit?.object.name==='Asylum Brick'&&hit.object.geometry.attributes.roomFinish.getX(hit.face.a)===0)return [x,z,3,hit.point.x,hit.point.z,-.23];
    }
   }
   throw new Error('No exposed second-floor corridor wall');
  }):pose;
  await page.evaluate(p=>window.brickCheck.pose(...p),actualPose);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,destination))});captures.push(name);
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.brickCheck.pose(-20.5,8.2,0,-20.5,7));
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await page.screenshot({path:fileURLToPath(new URL(`${mode}-phone.png`,destination))});captures.push('phone');
 const resources=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js');
  return window.brickCheck.groups.map((g,floor)=>{
   const wall=g.getObjectByName('Asylum Brick'),p=wall.geometry.attributes.position;
   const top=Math.max(...Array.from({length:p.count},(_,i)=>p.getY(i)));
   const map=wall.material.map,c=map.image,ctx=c.getContext('2d');
   // Sampling the real generated map verifies the seam falls inside the mortar
   // band, rather than merely repeating the geometry's height calculation.
   const row=((1-top/2)%1+1)%1*c.height;
   const sample=y=>[...ctx.getImageData(80,Math.round(y)%c.height,1,1).data].slice(0,3);
   return {floor,top,row,mortar:sample(row),brick:sample(row+12),textures:[c.width,c.height]};
  });
 });
 if(mode==='after')for(const r of resources){
  assert.equal(r.top,1.125,'Actual red wall ends at the ninth mortar joint');
  assert(Math.abs(r.mortar[0]-r.mortar[1])<35,'Boundary samples neutral mortar rather than red brick');
  assert(r.brick[0]-r.brick[1]>40,'Adjacent course contains red brick');
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL(`${mode}-validation.json`,destination),JSON.stringify({captures,resources,errors},null,2)+'\n');
 console.log(`PASS: ${mode}, ${captures.length} desktop/phone views, four real wall/map boundary samples, no page or shader errors.`);
}finally{await browser.close();server.kill();}
