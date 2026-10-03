import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const destination=new URL(process.env.BOOKROOM_ARTIFACT_DIR??'./artifacts/small-libraries/',import.meta.url);await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],captures=[];
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},reducedMotion:'reduce'});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',route=>route.abort());
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.bookroomTest={walker,interior,renderer,floors};const clock=new THREE.Timer();')});});
 await page.goto(base+'/explore.html');await page.waitForFunction(()=>window.bookroomTest?.renderer.info.render.frame>2);
 // Keep scene geometry untouched; remove the help card from review captures.
 await page.addStyleTag({content:'.explore-guide{display:none}'});await page.evaluate(()=>document.getElementById('layoutControls').open=false);
 const rooms=await page.evaluate(()=>window.bookroomTest.floors.flatMap(f=>f.rooms.filter(r=>r.purpose==='bookroom').map(r=>({floor:f.id,id:r.id,shelves:f.furniture.filter(i=>i.roomId===r.id)}))));
 assert.deepEqual(rooms.map(r=>`${r.floor}:${r.id}`),['0:R18','0:R21','0:R31','0:R37','1:R18','1:R21','1:R31','1:R34']);
 assert(rooms.every(r=>r.shelves.length>=(r.id==='R31'?2:3)));
 const geometry=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{FURNITURE_CATALOG}=await import('/asylum-furniture.mjs'),{loadFurnitureModels}=await import('/furniture-models.mjs'),t=window.bookroomTest,models=await loadFurnitureModels(THREE),catalog=FURNITURE_CATALOG.bookcase;
  let instances=0;
  for(const f of t.floors)for(const item of f.furniture.filter(i=>i.stocked)){
   const group=t.interior.scene.children.find(g=>g.position.y===f.elevation&&g.getObjectByName('Asylum furniture')).getObjectByName('Asylum furniture'),bounds=new THREE.Box3();
   for(const mesh of group.children){
    const index=mesh.userData.furnitureIds.indexOf(item.id);if(index<0)continue;
    const actual=new THREE.Matrix4(),expected=new THREE.Matrix4(),scale=new THREE.Vector3(item.width/catalog.width,item.height/catalog.height,item.depth/catalog.depth);
    mesh.getMatrixAt(index,actual);expected.compose(new THREE.Vector3(item.x,item.y,item.z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),item.rotation),scale);
    if(actual.elements.some((v,i)=>Math.abs(v-expected.elements[i])>1e-5))throw Error('Compact rendered shelf transform differs from collision '+item.id);
    mesh.geometry.computeBoundingBox();bounds.union(mesh.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().makeScale(...scale.toArray())));instances++;
    if(mesh.name.endsWith(' 1')&&mesh.geometry!==models.bookcase[1].stockedGeometry)throw Error('Small library is missing its full book rows');
   }
   if(bounds.getSize(new THREE.Vector3()).toArray().some((v,i)=>Math.abs(v-[item.width,item.height,item.depth][i])>1e-5))throw Error('Compact shelf dimensions differ from collision '+item.id);
  }
  const shelves=new THREE.Mesh(models.bookcase[0].geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})),p=models.bookcase[1].stockedGeometry.attributes.position,contacts=[];
  for(let row=0;row<8;row++){
   let bottom=Infinity;for(let i=row*p.count/8;i<(row+1)*p.count/8;i++)bottom=Math.min(bottom,p.getY(i));
   const ray=new THREE.Raycaster(new THREE.Vector3((row%2?.26:-.26)*catalog.width/1.25,bottom+.02,.02*catalog.depth/.38),new THREE.Vector3(0,-1,0)),surface=ray.intersectObject(shelves,false)[0]?.point.y;
   if(surface===undefined||Math.abs(bottom-surface-.002*catalog.height/1.90)>1e-5)throw Error('Stocked book row is unsupported '+row);contacts.push({row,bottom,surface});
  }
  shelves.material.dispose();return {instances,contacts};
 });
 const walking=await page.evaluate(async()=>{
  const {flatWalkable}=await import('/asylum-layout.mjs'),t=window.bookroomTest,results=[];
  for(const f of t.floors)for(const room of f.rooms.filter(r=>r.purpose==='bookroom')){
   const door=f.doorways.find(d=>d.roomId===room.id),distance=Math.hypot(room.label[0]-door.x,room.label[1]-door.z),dx=(room.label[0]-door.x)/distance,dz=(room.label[1]-door.z)/distance,x=door.x-dx*.65,z=door.z-dz*.65;
   if(!flatWalkable(f,x,z))throw Error('Library doorway approach is blocked '+room.id);
   t.walker.setView({position:[x,f.elevation+1.8,z],target:[room.label[0],f.elevation+1.8,room.label[1]]});Object.assign(t.walker.actor,{x,z,y:f.elevation,floor:f.id,outside:false,stair:null});
   t.walker.keys.add('KeyW');for(let i=0;i<Math.round((distance+.65)/.05);i++)t.walker.update(.01);t.walker.keys.clear();
   if(Math.hypot(t.walker.actor.x-room.label[0],t.walker.actor.z-room.label[1])>.08)throw Error('Library centre cannot be reached with walking input '+room.id);
   results.push({floor:f.id,roomId:room.id,x:t.walker.actor.x,z:t.walker.actor.z});
  }
  return results;
 });
 async function pose(floor,id){await page.evaluate(({floor,id})=>{const t=window.bookroomTest,f=t.floors[floor],r=f.rooms.find(r=>r.id===id),d=f.doorways.find(d=>d.roomId===id),length=Math.hypot(r.label[0]-d.x,r.label[1]-d.z),x=d.x-(r.label[0]-d.x)*.85/length,z=d.z-(r.label[1]-d.z)*.85/length,shelf=f.furniture.find(i=>i.roomId===id&&i.stocked),target=innerWidth<600?[shelf.x,shelf.z]:r.label;t.walker.setView({position:[x,f.elevation+1.8,z],target:[target[0],f.elevation+1.55,target[1]],fov:72});Object.assign(t.walker.actor,{x,z,y:f.elevation,floor,outside:false,stair:null});t.walker.update(.001);},{floor,id});}
 async function shot(name){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});captures.push(name);}
 for(const r of rooms){await pose(r.floor,r.id);await shot(`explore-${r.floor}-${r.id}`);}
 await page.setViewportSize({width:390,height:844});await pose(0,'R31');await shot('east-bay-mobile');
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+`
 window.bookroomGame={get ready(){return ready;},get floors(){return floors;},start,get arrival(){return arrivalCutscene;},pose(){const f=floors[0],r=f.rooms.find(r=>r.id==='R31');Object.assign(player,{x:53.1,z:18.95,floor:0,y:f.elevation,stair:null,outside:false});yaw=Math.PI;pitch=-.08;camera.position.set(player.x,player.y+1.65,player.z);camera.rotation.set(pitch,yaw,0);state='paused';showFloor();$('arrivalFade').hidden=true;$('hud').hidden=false;}};` }));
 await page.setViewportSize({width:1600,height:900});await page.goto(base);await page.waitForFunction(()=>window.bookroomGame?.ready);
 await page.evaluate(()=>{const t=window.bookroomGame;t.start();t.arrival.update(3);t.pose();});
 const game=await page.evaluate(()=>window.bookroomGame.floors.flatMap(f=>f.furniture.filter(i=>i.stocked)));
 assert.deepEqual(game,rooms.flatMap(r=>r.shelves),'Escape and Explore use exactly the same shelves');await shot('escape-east-bay');
 const inputs=new Set();async function visit(url){if(inputs.has(url.href))return;inputs.add(url.href);const source=await readFile(url,'utf8');for(const m of source.matchAll(/\b(?:from\s*|import\s*(?:\(\s*)?)['"](\.[^'"]+)['"]/g))await visit(new URL(m[1],url));}
 await visit(new URL('./dist/aerial-scene.mjs',import.meta.url));for(const file of ['asylum-furniture.mjs','asylum-room-uses.mjs','furniture-models.mjs'])assert(!inputs.has(new URL('./dist/'+file,import.meta.url).href),'Library sources are excluded from the aerial compiler');
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({rooms,geometry,walking,captures,escapeExploreMatch:true,compiledInputs:{count:inputs.size,interiorSourcesExcluded:true},errors},null,2)+'\n');
 console.log(`PASS: eight small libraries, ${game.length} stocked cases, rendered/collision dimensions, eight supported book rows, actual doorway-to-centre walks, Escape/Explore and desktop/mobile views, no runtime/shader errors.`);
}finally{await browser.close();server.kill();}
