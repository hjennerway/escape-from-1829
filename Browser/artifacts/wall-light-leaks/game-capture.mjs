import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
import {startTestServer} from '../../test-support/server.mjs';

const views={
 laundry:{position:[92,1.65,23],target:[106,1.8,45],fov:74},
 'rear-court':{position:[67,1.65,-4],target:[73,1.8,-32],fov:74},
 'arched-corridor':{position:[122,1.65,47],target:[148,1.8,10],fov:74}
};
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1450,height:800},reducedMotion:'reduce'});
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+`
window.wallLightReview={get ready(){return ready;},get exterior(){return exterior;},get renderer(){return renderer;},boot(){start();arrivalCutscene.update(3);state='paused';torch.intensity=0;},show(v){const [x,y,z]=v.position;Object.assign(player,{x,y:y-1.65,z,floor:0,outside:true,stair:null,verticalTrend:0});yaw=Math.atan2(x-v.target[0],z-v.target[2]);pitch=Math.atan2(v.target[1]-y,Math.hypot(x-v.target[0],z-v.target[2]));state='paused';keys.clear();showFloor();camera.position.set(x,y,z);camera.rotation.set(pitch,yaw,0);camera.fov=v.fov;camera.updateProjectionMatrix();$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.wallLightReview?.ready);await page.evaluate(()=>window.wallLightReview.boot());
 await page.addStyleTag({content:'#hud,header,.vignette,#touchUI{display:none!important}'});
 for(const mode of ['dusk','night']){
  await page.evaluate(mode=>window.wallLightReview.exterior.lighting.setMode(mode),mode);
  for(const [name,v] of Object.entries(views)){
   await page.evaluate(v=>window.wallLightReview.show(v),v);
   for(const bias of ['fixed','old']){
    await page.evaluate(bias=>{const m=window.wallLightReview.exterior.lighting.pools.material;m.polygonOffset=bias==='old';m.polygonOffsetFactor=-10;m.polygonOffsetUnits=-20;},bias);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await page.screenshot({path:fileURLToPath(new URL(`game-${mode}-${name}-${bias}.png`,import.meta.url))});
   }
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(v=>{window.wallLightReview.exterior.lighting.pools.material.polygonOffset=false;window.wallLightReview.exterior.lighting.setMode('dusk');window.wallLightReview.show(v);},views['rear-court']);
 await page.screenshot({path:fileURLToPath(new URL('game-dusk-phone.png',import.meta.url))});
 assert.deepEqual(errors,[]);
 await writeFile(new URL('game-validation.json',import.meta.url),JSON.stringify({views,errors},null,2)+'\n');
 console.log('PASS: actual Escape dusk/night and portrait wall-light views, no page/shader errors.');
}finally{await browser?.close();server.kill();}
