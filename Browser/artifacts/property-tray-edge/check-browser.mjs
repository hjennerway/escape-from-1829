import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const phase=process.argv.includes('--before')?'before':'after';
const destination=new URL('./',import.meta.url);await mkdir(destination,{recursive:true});
const fixture=await readFile(new URL('../../test-escape-progress-browser.mjs',import.meta.url),'utf8');
const instrument=fixture.match(/const instrument=`([\s\S]*?)`;/)[1]+`
escapeTest.trayView=(offset)=>{
 const n=escapeWorld.nodes.find(n=>n.id==='reclaim');
 escapeTest.lookAtNode('reclaim');state='notebook';
 const c=Math.cos(n.mount.rotation),s=Math.sin(n.mount.rotation);
 camera.position.set(n.mount.x+c*offset[0]+s*offset[2],n.mount.y+offset[1],n.mount.z-s*offset[0]+c*offset[2]);
 camera.lookAt(n.mount.x,n.mount.y+.015,n.mount.z);
};`;
const {server,base}=await startTestServer();let browser;const errors=[],captures=[];
try{
 browser=await launchHardwareBrowser({executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.escapeTest?.ready);
 await page.evaluate(()=>{const random=Math.random;Math.random=()=>.1829;try{escapeTest.start();}finally{Math.random=random;}escapeTest.arrival.update(3);escapeTest.hold();escapeTest.setTorch(false);});
 const renderer=await page.evaluate(()=>{const gl=escapeTest.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');return gl.getParameter(info.UNMASKED_RENDERER_WEBGL);});
 async function shot(name){await page.waitForTimeout(80);await page.screenshot({path:fileURLToPath(new URL(phase+'-'+name+'.png',destination))});captures.push(name);}
 for(const populated of [false,true]){
  await page.evaluate(populated=>{const t=escapeTest;t.run.confiscated.clear();if(populated){t.run.confiscated.add('staffKey');t.run.confiscated.add('serviceKey');}t.world.sync();t.lookAtNode('reclaim');},populated);
  const label=populated?'keys':'empty';await shot(label+'-player');
  for(const [name,offset] of [['front',[0,.16,.55]],['left',[-.35,.16,.48]],['right',[.35,.16,.48]]]){
   await page.evaluate(offset=>escapeTest.trayView(offset),offset);await shot(label+'-'+name);
  }
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>escapeTest.lookAtNode('reclaim'));await shot('phone-keys');
 const bounds=await page.evaluate(()=>{const tray=escapeTest.world.nodes.find(n=>n.id==='reclaim').tray;return tray.children.filter(m=>m.isMesh).map(m=>{m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;return {min:b.min.clone().add(m.position).toArray(),max:b.max.clone().add(m.position).toArray()};});});
 const overlap=bounds.slice(1).map(b=>Math.min(bounds[0].max[1],b.max[1])-Math.max(bounds[0].min[1],b.min[1]));
 if(phase==='after')assert(overlap.every(h=>Math.abs(h)<1e-8),'Rims must meet the base without overlapping its coplanar outer faces: '+overlap);
 assert.deepEqual(errors,[]);
 await writeFile(new URL(phase+'-validation.json',destination),JSON.stringify({renderer,captures,bounds,baseRimOverlap:overlap,errors},null,2)+'\n');
 console.log('PASS: '+phase+' tray edge views, empty/populated/player/phone, hardware renderer, overlap '+overlap.join(', ')+' and no runtime/shader errors.');
}finally{await browser?.close();server.kill();}
