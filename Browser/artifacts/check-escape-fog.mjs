import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const label=process.argv[2]||'after';
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:704},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',async route=>{
  if(route.request().url().startsWith('https://cdn.jsdelivr.net/'))await route.fulfill({contentType:'text/javascript',body:await readFile(new URL('../dist/vendor/'+route.request().url().split('/').at(-1),import.meta.url),'utf8')});
  else await route.abort();
 });
 const source=await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8');
 await page.route('**/game.mjs',route=>route.fulfill({contentType:'text/javascript',body:source+`
window.escapeFogCheck={
 get ready(){return ready;},
 freeze(){clock.getDelta=()=>0;const render=renderer.render.bind(renderer);renderer.render=(scene,camera)=>{window.escapeFogCheck.lastDensity=scene.fog?.density;return render(scene,camera);};},
 show(seconds){uiPlaying(true);finish(true,'Front door');escapeCutscene.update(seconds);},
 inspect(){const camera=escapeExterior.camera;camera.updateMatrixWorld(true);const points=[[0,12,20],[-72,15,-46],[97,15,45]];return {state,aspect:camera.aspect,density:this.lastDensity,storedDensity:escapeExterior.scene.fog.density,opacity:points.map(p=>{const depth=-new THREE.Vector3(...p).applyMatrix4(camera.matrixWorldInverse).z;return 1-Math.exp(-((this.lastDensity*depth)**2));})};},
 retry(){start();}
};` }));
 const records=[];
 for(const reducedMotion of ['no-preference','reduce']){
  await page.emulateMedia({reducedMotion});
  await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.escapeFogCheck?.ready,null,{timeout:120000});
  await page.evaluate(()=>window.escapeFogCheck.freeze());
  for(const [name,width,height] of [['mobile',390,704],['narrow',360,780],['desktop',1440,900]]){
   await page.setViewportSize({width,height});
   for(const seconds of [0,5,10]){
    await page.evaluate(seconds=>window.escapeFogCheck.show(seconds),seconds);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const record={name,reducedMotion,seconds,...await page.evaluate(()=>window.escapeFogCheck.inspect())};records.push(record);
    assert.equal(record.state,seconds===10?'won':'cutscene');
    assert.equal(record.storedDensity,.0019,'Escape rendering restores the shared scene fog');
    if(label==='after')assert(Math.max(...record.opacity)<.35,'Buildings retain at least 65% of their colour at every escape camera');
    if(reducedMotion==='no-preference'&&seconds===5)await page.screenshot({path:new URL('./escape-fog-'+label+'-'+name+'.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
   }
  }
  await page.evaluate(()=>window.escapeFogCheck.show(5));
  await page.locator('#escapeCutscene button').click();
  await page.waitForFunction(()=>window.escapeFogCheck.inspect().state==='won');
  await page.evaluate(()=>window.escapeFogCheck.retry());
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const retry=await page.evaluate(()=>window.escapeFogCheck.inspect());
  assert.equal(retry.state,'arrival');assert.equal(retry.density,.0019,'Retry restores the full arrival fog');
 }
 assert.deepEqual(errors,[]);
 await writeFile(new URL('./escape-fog-'+label+'.json',import.meta.url),JSON.stringify(records,null,2));
 console.log(JSON.stringify({label,checks:records.length,maxOpacity:Math.max(...records.flatMap(r=>r.opacity)),errors}));
}finally{await browser?.close();server.kill();}

