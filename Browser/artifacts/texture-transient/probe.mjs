import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const destination=new URL('./',import.meta.url);
await mkdir(destination,{recursive:true});
const {server,base}=await startTestServer();
let browser;
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+`
 window.textureProbe={get ready(){return ready;},scene,pose(x,z,floor,tx,tz){Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside:false});scene.add(torch,torchTarget);showFloor();yaw=Math.atan2(x-tx,z-tz);pitch=-.12;camera.position.set(x,player.y+1.65,z);camera.rotation.set(pitch,yaw,0);state='paused';$('arrivalFade').hidden=true;$('result').hidden=true;$('menu').hidden=true;},
 get renderer(){return renderer;},get groups(){return floorGroups;},get scene(){return scene;},get torch(){return torch;},get enemies(){return enemies;},draw(){interiorLights.update(player);camera.getWorldDirection(tmp);torch.position.copy(camera.position);torchTarget.position.copy(camera.position).addScaledVector(tmp,12);renderer.render(scene,camera);return canvas.toDataURL('image/png');},start(){start();arrivalCutscene.update(3);}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.textureProbe?.ready);
 await page.evaluate(()=>{window.textureProbe.start();window.textureProbe.pose(5.6,-23.3,0,4.1,-24.5);});
 await page.addStyleTag({content:'#hud,header,.vignette,#result,#arrivalFade{display:none!important}'});
 const receipts=[];
 for(const [name,floor,torch,ghost] of [
  ['initial',0,true,true],['torch-off',0,false,true],['torch-return',0,true,true],
  ['ghost-off',0,true,false],['ghost-return',0,true,true],
  ['upper',1,true,false],['ground-return',0,true,true]
 ]){
  const result=await page.evaluate(({name,floor,torch,ghost})=>{
   const t=window.textureProbe;t.pose(5.6,-23.3,floor,4.1,-24.5);t.torch.visible=torch;t.enemies.find(e=>e.type===2).mesh.visible=ghost;
   const image=t.draw();
   const walls=t.groups[floor].getObjectByName('Asylum Plaster'),properties=t.renderer.properties.get(walls.material);
   return {name,image,program:properties.currentProgram.id,uniforms:properties.uniforms.bumpScale.value,programs:properties.programs.size,renderer:t.renderer.getContext().getParameter(t.renderer.getContext().getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL)};
  },{name,floor,torch,ghost});
  await writeFile(new URL(name+'.png',destination),Buffer.from(result.image.split(',')[1],'base64'));
  delete result.image;receipts.push(result);
 }
 await writeFile(new URL('probe.json',destination),JSON.stringify({receipts,errors},null,2)+'\n');
 for(const [name,x,z,floor,tx,tz] of [
  ['s1-first-landing',-11,10.1,1,-11,16],
  ['s1-side',-7.75,14,1,-16,14],
  ['s5-landing',-31.1,8.55,1,-31.1,13],
  ['s5-side',-28.95,11.5,1,-34,11.5],
 ]){
  const image=await page.evaluate(p=>{const t=window.textureProbe;t.pose(...p);t.torch.visible=false;return t.draw();},[x,z,floor,tx,tz]);
  await writeFile(new URL(name+'.png',destination),Buffer.from(image.split(',')[1],'base64'));
  const settled=await page.evaluate(async()=>{await new Promise(r=>setTimeout(r,2500));return window.textureProbe.draw();});
  receipts.push({name,firstAndSettledFramesIdentical:image===settled});
 }
 await writeFile(new URL('probe.json',destination),JSON.stringify({receipts,errors},null,2)+'\n');
 console.log(JSON.stringify({receipts,errors},null,2));
}finally{await browser?.close();server.kill();}
