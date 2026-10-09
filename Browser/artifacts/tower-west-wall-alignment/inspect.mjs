import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const label=process.argv[2]??'after',mode='source'; // Escape constructs its estate procedurally.
const harness=await readFile(new URL('../../test-escape-grounds-browser.mjs',import.meta.url),'utf8');
const instrument=harness.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[];
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:2032,height:720}});page.setDefaultTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>{const source=(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt');await r.fulfill({contentType:'text/javascript',body:source+instrument});});
 await page.goto(base+'/?seed=1829&models='+mode);await page.waitForFunction(()=>window.groundsTest?.ready);
 await page.evaluate(()=>{groundsTest.begin();groundsTest.exterior.lighting.setNight(false);groundsTest.pose(134,-55.2,-Math.PI/2,.04);});
 await page.addStyleTag({content:'#hud,#interact,#pause,.vignette{display:none!important}'});
 await page.screenshot({path:fileURLToPath(new URL(label+'-'+mode+'-west.png',import.meta.url))});
 const inspection=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),t=groundsTest,objects=[];t.exterior.model.updateMatrixWorld(true);t.exterior.model.traverse(o=>{if(o.isMesh&&!o.userData.aerialBatch&&(o.visible||o.userData.aerialBatchSource))objects.push(o);});
  const windows=[];t.exterior.model.traverse(o=>{if(!o.userData.aerialWindowAssembly)return;const b=new THREE.Box3().setFromObject(o);if(b.min.x<147&&b.max.x>120&&b.min.z<-59&&b.max.z>-77){const chain=[];for(let p=o;p;p=p.parent)chain.push(p.name);windows.push({name:o.name,min:b.min.toArray(),max:b.max.toArray(),chain});}});
  const walls=objects.filter(o=>/North tower range|Hale.*wall/i.test(o.name)).map(o=>{const b=new THREE.Box3().setFromObject(o);return {name:o.name,min:b.min.toArray(),max:b.max.toArray()};});
  return {model:t.exterior.modelBuild,windows,walls};
 });
 await writeFile(new URL(label+'-'+mode+'-inspection.json',import.meta.url),JSON.stringify({inspection,errors},null,2));assert.deepEqual(errors,[]);console.log(JSON.stringify({label,mode,windows:inspection.windows,errors}));
}finally{await browser?.close();server.kill();}
