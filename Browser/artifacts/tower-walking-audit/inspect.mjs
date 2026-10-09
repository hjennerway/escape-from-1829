import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const mode=process.argv.includes('--compiled')?'compiled':'source';
const label=process.argv.includes('--after')?'after':'before';
const destination=new URL(`./${label}-${mode}/`,import.meta.url);await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
 page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/explore.mjs',async route=>{
  const instrument=`window.audit={THREE,walker,workshops,exterior,renderer,timeline,lighting,refresh:refreshObstacles,
   pose(x,z,tx,tz,ty=5){walker.setView({position:[x,1.8,z],target:[tx,ty,tz],fov:70});},
   render(){renderer.render(exterior.scene,exterior.camera);}};window.__manual=true;`;
  const source=(await readFile(new URL('../../dist/explore.mjs',import.meta.url),'utf8')).replace('clock.update();const dt','if(window.__manual)return;clock.update();const dt').replace('  loadEscapeFrontage(',instrument+'\n  loadEscapeFrontage(');
  await route.fulfill({contentType:'text/javascript',body:source});
 });
 await page.goto(base+'/explore.html?view=irby-corridor&period=1916&lighting=day&models='+mode,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.audit);
 // Keep the complete ground and lower wall junctions visible in survey images.
 // This hides only the screenshot overlays, without changing the game scene.
 await page.addStyleTag({content:'.explore-guide,#layoutControls{display:none!important}'});
 console.log('Walking scene ready');
 await page.locator('#game').dispatchEvent('pointerdown',{button:0,pointerId:1,pointerType:'mouse',clientX:640,clientY:400});
 await page.locator('#game').dispatchEvent('pointerup',{button:0,pointerId:1});
 const scene=await page.evaluate(()=>{
  const {THREE,exterior,walker,workshops}=audit;const records=[];
  exterior.model.updateMatrixWorld(true);exterior.model.traverseVisible(o=>{
   if(!o.isMesh)return;const box=new THREE.Box3().setFromObject(o);
   if(box.max.x<137||box.min.x>235||box.max.z<-88||box.min.z>13)return;
   if(/roof|wall|court|cylinder|chimney|grass|gravel|ground contact|hardstanding/i.test(o.name))records.push({name:o.name,parent:o.parent.name,min:box.min.toArray(),max:box.max.toArray(),material:o.material.name,closure:o.userData.roofWallJoinSummary});
  });return {records,plan:workshops.workshops.plan.corridors,model:exterior.modelBuild};
 });
 await writeFile(new URL('scene.json',destination),JSON.stringify(scene,null,2));
 const walks=await page.evaluate(async()=>{
  const {outdoorPath}=await import('/escape-world.mjs');const {walker,exterior,workshops}=audit,results=[];
  // Use the player's movement and collision handling at 5 m/s, rather than
  // moving the camera straight through the yard's buildings and cylinders.
  const tours=[['chimney and cylinders',[158,-32],[[164,-39],[170,-28],[174,-27],[174,-17],[188,-17],[185,-30],[182,-41],[201,-44],[158,-32]]],
   ['tower west and north',[143,-40],[[135,-55],[135,-65],[145,-65],[143,-40]]],
   ['eastern service lane',[232,-5],[[230,-24],[232,-44],[236,-58],[232,-5]]]];
  for(const [name,start,stops] of tours){
   audit.pose(...start,start[0],start[1]-1,1.8);let distance=0,samples=0;const reached=[];
   for(const [x,z] of stops){
    const offset=name==='eastern service lane'?35:0;
    const navigation=offset?{revision:walker.outside.revision,clear:(px,pz,y)=>walker.outside.clear(px+offset,pz,y)}:walker.outside;
    const route=outdoorPath(navigation,{x:walker.actor.x-offset,z:walker.actor.z},{x:x-offset,z}).map(p=>({x:p.x+offset,z:p.z}));
    if(!route.length&&Math.hypot(walker.actor.x-x,walker.actor.z-z)>1)throw Error('No walking route: '+name+' '+x+','+z);
    for(const point of [...route,{x,z}]){
     for(let i=0;i<200&&Math.hypot(walker.actor.x-point.x,walker.actor.z-point.z)>.025;i++){
      const dx=point.x-walker.actor.x,dz=point.z-walker.actor.z,d=Math.hypot(dx,dz),yaw=Math.atan2(-dx,-dz),previous={...walker.actor};
      walker.look((exterior.camera.rotation.y-yaw)/.002,0);walker.keys.add('KeyW');walker.update(Math.min(.04,d/5));workshops.update(.04,walker.actor);
      distance+=Math.hypot(walker.actor.x-previous.x,walker.actor.z-previous.z);samples++;
     }
     walker.keys.clear();if(Math.hypot(walker.actor.x-point.x,walker.actor.z-point.z)>.04)throw Error('Walking blocked: '+name+' '+JSON.stringify({point,actor:walker.actor}));
    }
    reached.push([walker.actor.x,walker.actor.z]);audit.render();
   }
   results.push({name,distance,samples,reached});
  }
  return results;
 });
 console.log('Physical walking tours: '+JSON.stringify(walks));
 const views=[
  ['cylinders-west',174,-17,167,-37,5],['cylinders-east',188,-17,167,-37,6],
  ['chimney-south',170,-28,167,-45,7],['chimney-north',163,-39.5,156,-42,7],
  ['tower-south',143,-40,153,-50,11],['tower-west',135,-55,148,-55,12],
  ['tower-north',145,-65,156,-61,11],['tower-east',182,-41,170,-48,11],
  ['hall-gap',185,-30,195,-32,9],['workshops-front',201,-44,205,-52,8],
  ['stores-south',230,4,219,0,9],['stores-east',232,-5,228,-10,12],
  ['court-south',177,8,180,-12,.3],['court-east',230,-24,202,-22,.3],
  ['tower-ground',164,-39,170,-30,.2],['north-gravel',166,-71,183,-63,.2],
  ['reported-roof',158,-32,157,-52,11],['reported-ground',158,-32,157,-52,.1],
  ['roof-east-edge',160,-29,156.6,-32,9],['roof-step',161,-38,156,-42,9],
  ['court-grass-seam',158,-29,164,-28,.1],
  ['cylinder-lane-roof',158,-20,156,-55,9],['cylinder-lane-ground',158,-20,156,-55,.2],
  ['north-cut-roof',164,-62,155,-68,9],['workshop-ground',183,-42,185,-47,.15]
 ];
 const poses=[],screenRays=[];
 for(const [name,x,z,tx,tz,ty] of views){
  const pose=await page.evaluate(p=>{audit.pose(...p);audit.render();const {walker,exterior}=audit;return {actor:walker.actor,camera:exterior.camera.position.toArray(),clear:walker.outside.clear(p[0],p[1])};},[x,z,tx,tz,ty]);poses.push({name,...pose});
  await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});
  if(name==='tower-ground')screenRays.push(await page.evaluate(()=>{
   const {THREE,exterior}=audit,objects=[];exterior.model.traverse(o=>{if(o.isMesh&&!o.userData.aerialBatch&&(o.visible||o.userData.aerialBatchSource))objects.push(o);});
   const pixels=[];for(let x=1100;x<1190;x+=5)for(let y=250;y<295;y+=5)pixels.push([x,y]);
   return pixels.map(([x,y])=>{const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(x/1280*2-1,1-y/820*2),exterior.camera);return {pixel:[x,y],hits:ray.intersectObjects(objects,false).slice(0,4).map(h=>({name:h.object.name,point:h.point.toArray(),distance:h.distance}))};}).filter(p=>p.hits.some(h=>/roof|ceiling/i.test(h.name)));
  }));
 }
 await page.evaluate(()=>{audit.lighting.setMode('dusk');audit.pose(158,-20,156,-55,9);audit.render();});
 await page.screenshot({path:fileURLToPath(new URL('cylinder-lane-dusk.png',destination))});
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{audit.lighting.setMode('day');audit.pose(158,-32,157,-52,9);audit.render();});
 await page.screenshot({path:fileURLToPath(new URL('yard-phone.png',destination))});
 await writeFile(new URL('poses.json',destination),JSON.stringify({poses,walks,screenRays,errors},null,2));console.log(JSON.stringify({mode,label,walks,screenRays,errors}));
}finally{await browser?.close();server.kill();}
