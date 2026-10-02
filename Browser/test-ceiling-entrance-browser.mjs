import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const mode=process.argv[2]??'after',port=1877,destination=new URL('./artifacts/ceiling-entrance/',import.meta.url);
await mkdir(destination,{recursive:true});
const source=async name=>readFile(new URL(mode==='before'?`./artifacts/ceiling-entrance/${name}-before.mjs`:`./dist/${name}.mjs`,import.meta.url),'utf8');
const game=await source('game'),materials=await source('interior-materials'),architecture=await source('asylum-architecture');
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.setDefaultTimeout(60000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/interior-materials.mjs',route=>route.fulfill({contentType:'text/javascript',body:materials}));
 await page.route('**/asylum-architecture.mjs',route=>route.fulfill({contentType:'text/javascript',body:architecture}));
 await page.route('**/game.mjs',route=>route.fulfill({contentType:'text/javascript',body:game+`
window.finishCheck={get ready(){return ready;},start(){start();arrivalCutscene.update(3);},
 pose(x,z,floor,tx,tz,tilt=.1){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=tilt;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},
 door(){scene.updateMatrixWorld(true);const door=floors[0].exits.find(e=>e.id==='D1'),ray=new THREE.Raycaster(new THREE.Vector3(door.worldX-.46,2.55,door.worldZ-1),new THREE.Vector3(0,0,1));ray.far=2;const hit=ray.intersectObjects(floorGroups[0].children,true)[0];return {name:hit?.object.name,color:hit?.object.material.color.getHex(),signs:floorGroups[0].children.filter(o=>o.name==='Emergency exit signage').length,exits:floors[0].exits.length};},
 roundTrip(){const door=floors[0].exits.find(e=>e.id==='D1');this.pose(door.inside.x,door.inside.z,0,0,21);state='play';keys.clear();update(.01);keys.add('KeyE');update(.04);const outside=player.outside,position=[player.x,player.y,player.z];update(.04);const latched=player.outside;keys.delete('KeyE');update(.04);keys.add('KeyE');update(.04);const returned=!player.outside&&player.floor===0;keys.clear();state='paused';return {outside,latched,returned,position,expected:door.destination};}
};`}));
 await page.goto(`http://127.0.0.1:${port}`);await page.waitForFunction(()=>window.finishCheck?.ready,null,{timeout:120000});
 await page.evaluate(()=>window.finishCheck.start());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const views=[
  ['reception-ceiling',0,14,0,0,5,.52],
  ['front-door',0,15.5,0,0,20,.12],
  ['front-door-oblique',2.6,16,0,0,19.9,.13],
  ['corridor-ceiling',-20.5,8.2,0,-2,8.2,.38],
  ['first-floor-ceiling',-20.5,8.2,1,-2,8.2,.38],
  ['basement-ceiling',-31.1,-7,2,-31.1,-24,.35],
  ['second-floor-ceiling',0,14,3,0,7,.45],
 ];
 for(const [name,...pose] of views){
  await page.evaluate(pose=>window.finishCheck.pose(...pose),pose);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:fileURLToPath(new URL(mode+'-'+name+'.png',destination))});
 }
 await page.evaluate(()=>window.finishCheck.pose(0,15.5,0,0,20,.12));
 const door=await page.evaluate(()=>window.finishCheck.door());
 const trip=await page.evaluate(()=>window.finishCheck.roundTrip());
 assert(trip.outside&&trip.latched&&trip.returned);assert.deepEqual(trip.position,trip.expected);
 const texture=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{createInteriorMaterials}=await import('/interior-materials.mjs');
  const materials=createInteriorMaterials(THREE,document),canvas=materials.Ceiling.map.image,n=canvas.width;
  const p=canvas.getContext('2d').getImageData(0,0,n,n).data;
  const delta=(a,b)=>(Math.abs(p[a]-p[b])+Math.abs(p[a+1]-p[b+1])+Math.abs(p[a+2]-p[b+2]))/3;
  const seam=[0,0],adjacent=[0,0];
  for(let i=0;i<n;i++){
   seam[0]+=delta(i*n*4,(i*n+n-1)*4)/n;seam[1]+=delta(i*4,((n-1)*n+i)*4)/n;
   for(let k=1;k<n;k++){
    adjacent[0]+=delta((i*n+k-1)*4,(i*n+k)*4)/(n*(n-1));
    adjacent[1]+=delta(((k-1)*n+i)*4,(k*n+i)*4)/(n*(n-1));
   }
  }
  const preview=document.createElement('canvas');preview.width=preview.height=1024;const g=preview.getContext('2d');
  for(let x=0;x<2;x++)for(let y=0;y<2;y++)g.drawImage(canvas,x*512,y*512,512,512);
  const image=preview.toDataURL('image/png');
  for(const material of Object.values(materials))material.dispose();
  return {seam,adjacent,image};
 });
 await writeFile(new URL(mode+'-texture-wrap.png',destination),Buffer.from(texture.image.split(',')[1],'base64'));delete texture.image;
 if(mode!=='before'){
  assert.equal(door.name,'Asylum EntranceInset','Reception sees the red panelled entrance');assert.equal(door.color,0x581c23);
  assert.equal(door.signs,door.exits-1,'Reception no longer carries fire-exit signage');
  for(let axis=0;axis<2;axis++)assert(texture.seam[axis]<texture.adjacent[axis]*1.2,`Ceiling edge ${axis} is no more visible than ordinary neighboring pixels: ${JSON.stringify(texture)}`);
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.finishCheck.pose(0,15.5,0,0,20,.12));
 await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile-door.png',destination))});
 await page.evaluate(()=>window.finishCheck.pose(0,14,0,0,5,.52));await page.screenshot({path:fileURLToPath(new URL(mode+'-mobile-ceiling.png',destination))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL(mode+'-validation.json',destination),JSON.stringify({views:views.length+2,door,trip,texture,errors},null,2)+'\n');
 console.log(`PASS: ${mode} ceiling/entrance views on all four floors and mobile, texture continuity, D1 E round trip with release latch, no page/shader errors.`);
}finally{await browser.close();server.kill();}
