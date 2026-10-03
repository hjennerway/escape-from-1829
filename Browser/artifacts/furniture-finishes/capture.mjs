// Repeatable material-only before/after renders; original source snapshots are
// substituted over HTTP so geometry, lighting and cameras stay identical.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=new URL('./',import.meta.url);await mkdir(root,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],blockedRemoteResources=[],captures=[],swatches=[];
const roomsOnly=process.argv.includes('--rooms-only');
try{
 for(const mode of ['before','after']){
  const page=await browser.newPage({viewport:{width:1100,height:800},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push({mode,error:e.message}));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push({mode,error:m.text()});});
  page.on('requestfailed',r=>{if(r.url().startsWith('https:'))blockedRemoteResources.push({mode,url:r.url()});else errors.push({mode,error:r.failure()?.errorText,url:r.url()});});
  await page.route('https://**/*',r=>r.abort());
  if(mode==='before')for(const file of ['furniture-models','medical-furniture-models'])await page.route('**/'+file+'.mjs',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL(file+'-before.mjs',root),'utf8')}));
  await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',root),'utf8')).replace('function animate(){requestAnimationFrame(animate);','let finishReviewFrozen=false;function animate(){if(finishReviewFrozen)return;requestAnimationFrame(animate);')+`
   window.finishReview={get ready(){return ready;},floors,scene,renderer,camera,pose(roomId,kind){
    const room=floors[0].rooms.find(r=>r.id===roomId),item=floors[0].furniture.find(i=>i.roomId===roomId&&i.kind===kind);
    Object.assign(player,{x:room.label[0],z:room.label[1],floor:0,y:0,stair:null,outside:false});
    yaw=Math.atan2(-(item.x-player.x),-(item.z-player.z));pitch=-.18;state='paused';showFloor();
    camera.position.set(player.x,1.65,player.z);camera.rotation.set(pitch,yaw,0);$('arrivalFade').hidden=true;
    for(const id of ['hud','instructions','pause','touch','floorMap','menu','location'])$(id).hidden=true;
    document.querySelector('header').hidden=true;document.querySelector('footer')?.remove();finishReviewFrozen=true;
    renderer.render(scene,camera);
   }};` }));
  await page.goto(base);await page.waitForFunction(()=>window.finishReview?.ready);
  for(const [name,room,kind] of [['dispensary','R7','cupboard'],['table-chairs','R30','table'],['shelves','R19','bookcase'],['bath','R1','hydroBath'],['electricity','R29','electrotherapy']]){
   await page.evaluate(args=>window.finishReview.pose(...args),[room,kind]);await page.screenshot({path:fileURLToPath(new URL(`${mode}-${name}.png`,root))});captures.push(`${mode}-${name}`);
  }
  if(roomsOnly){await page.close();continue;}
  // A neutral comparison on actual geometry makes fine detail easier to assess.
  await page.evaluate(async()=>{
   const THREE=await import('/vendor/three.module.js'),{loadFurnitureModels}=await import('/furniture-models.mjs'),models=await loadFurnitureModels(THREE);
   const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1100,800);renderer.setClearColor(0xc8c3b8);renderer.outputColorSpace=THREE.SRGBColorSpace;
   const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff8eb,0x817769,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,4,5);scene.add(light);
   const group=new THREE.Group();scene.add(group);const camera=new THREE.PerspectiveCamera(38,1100/800,.01,50);
   const overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;z-index:10000';overlay.append(renderer.domElement);document.body.append(overlay);
   window.finishPreview={show(kind,close=false){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();group.clear();for(const part of models[kind])if(!part.paintOnly)group.add(new THREE.Mesh(part.geometry,part.material));
    const box=new THREE.Box3().setFromObject(group),size=box.getSize(new THREE.Vector3()),target=new THREE.Vector3(0,size.y*(kind==='table'?.96:.55),0),d=Math.max(size.x,size.y,size.z)*(close?1.2:2.0);
    camera.position.set(d*.65,target.y+d*(kind==='table'?.50:.18),d);camera.lookAt(target);renderer.render(scene,camera);
   },swatches(materials){group.clear();materials.forEach((material,i)=>group.add(new THREE.Mesh(new THREE.PlaneGeometry(.52,1.3).translate((i-2)*.60,.7,0),material)));camera.position.set(0,.7,4.4);camera.lookAt(0,.7,0);renderer.render(scene,camera);},renderer};
  });
  for(const kind of ['table','chair','cupboard','apothecary','bench','bookcase','bed','hydroBath','hydroShower','operatingTable','electrotherapy','bloodletting','ectMachine','books']){
   await page.evaluate(k=>window.finishPreview.show(k),kind);await page.screenshot({path:fileURLToPath(new URL(`${mode}-model-${kind}.png`,root))});captures.push(`${mode}-model-${kind}`);
  }
  for(const kind of ['table','chair','cupboard']){await page.evaluate(k=>window.finishPreview.show(k,true),kind);await page.screenshot({path:fileURLToPath(new URL(`${mode}-close-${kind}.png`,root))});captures.push(`${mode}-close-${kind}`);}
  swatches.push(await page.evaluate(async()=>{
   const THREE=await import('/vendor/three.module.js'),{createMedicalFurnitureMaterials}=await import('/medical-furniture-models.mjs'),m=createMedicalFurnitureMaterials(THREE);
   window.finishPreview.swatches(['wood','paint','ivory','iron','brass'].map(k=>m[k]));
   const finishes={};for(const [key,v] of Object.entries(m))finishes[key]=v.userData.furnitureFinish??null;
   const renderer=window.finishPreview.renderer,gl=renderer.getContext(),pixels=new Uint8Array(1100*800*4);gl.readPixels(0,0,1100,800,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
   // Average a narrow vertical strip through each flat swatch. Measure the
   // former medical shader's 20-cycle band independently of its source code.
   const bands={};for(const [j,key] of ['wood','paint','ivory','iron','brass'].entries()){
    const cx=Math.round(550+(j-2)*.60/4.4*400/Math.tan(19*Math.PI/180)),rows=[];
    for(let y=239;y<561;y++){let sum=0;for(let x=cx-12;x<=cx+12;x++){const i=(y*1100+x)*4;sum+=pixels[i]*.299+pixels[i+1]*.587+pixels[i+2]*.114;}rows.push(sum/25);}
    const mean=rows.reduce((a,b)=>a+b)/rows.length;let peak=0;
    for(let k=16;k<=23;k++){let real=0,imaginary=0;rows.forEach((v,i)=>{real+=(v-mean)*Math.cos(2*Math.PI*k*i/rows.length);imaginary+=(v-mean)*Math.sin(2*Math.PI*k*i/rows.length);});peak=Math.max(peak,2*Math.hypot(real,imaginary)/rows.length);}
    bands[key]={mean,periodicBandAmplitude:peak};
   }
   return {finishes,bands};
  }));await page.screenshot({path:fileURLToPath(new URL(`${mode}-swatches.png`,root))});captures.push(`${mode}-swatches`);
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.finishPreview.show('cupboard'));await page.screenshot({path:fileURLToPath(new URL(`${mode}-mobile-wardrobe.png`,root))});captures.push(`${mode}-mobile-wardrobe`);
  await page.close();
 }
 assert.deepEqual(errors,[],'All affected shaders compile and render');
 const result={captures,swatches,errors,blockedRemoteResources};await writeFile(new URL(roomsOnly?'room-comparison.json':'comparison.json',root),JSON.stringify(result,null,2)+'\n');
 console.log(`PASS: ${captures.length} identical-camera before/after furniture, actual-game, coating and metal views without page or shader errors.`);
}finally{await browser.close();server.kill();}
