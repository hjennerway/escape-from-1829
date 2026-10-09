import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const output=new URL('./',import.meta.url),tag=process.argv[2]??'before';
await mkdir(output,{recursive:true});
const {server,base}=await startTestServer();let browser;
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1525,height:717}});
 page.setDefaultTimeout(180000);page.on('pageerror',e=>console.error(e));
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/explore.mjs',async r=>{const source=await readFile(new URL('../../dist/explore.mjs',import.meta.url),'utf8');await r.fulfill({contentType:'text/javascript',body:source.replace('clock.update();const dt','if(window.__manual)return;clock.update();const dt').replace('  loadEscapeFrontage(','window.inspect={exterior,renderer,walker,workshops,lighting};window.__manual=true;\n  loadEscapeFrontage(')});});
 await page.goto(base+'/explore.html?period=1916&lighting=day&models='+(process.argv[3]??'source'),{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.inspect);
 await page.evaluate(()=>{for(const selector of ['.explore-guide','#layoutControls','#exploreDoor'])document.querySelector(selector)?.remove();});
 const views={reference:{position:[243,1.8,-70],target:[219,4,-64]},front:{position:[232,1.8,-66.6],target:[221.7,3.2,-66.6]},side:{position:[231,1.8,-74],target:[221.7,4,-66.6]},inside:{position:[217,1.8,-66.6],target:[194,2,-66.6]},open:{position:[228,1.8,-66.6],target:[214,2.6,-66.6]}};
 for(const [name,view] of Object.entries(views)){
  if(name==='open')await page.evaluate(()=>{const {workshops,walker}=inspect;workshops.workshops.setDoorOpen('irby-corridor-door',true);for(let i=0;i<30;i++)workshops.update(.04,walker.actor);});
  await page.evaluate(view=>{const {walker,renderer,exterior}=inspect;walker.setView(view);renderer.render(exterior.scene,exterior.camera);},view);
  await page.screenshot({path:new URL(tag+'-'+name+'.png',output).pathname.replace(/^\/(\w:)/,'$1')});
 }
 const data=await page.evaluate(()=>{const {exterior,workshops}=inspect;const bounds=[];exterior.model.traverse(o=>{if(/Irby corridor|Water tower to Irby/.test(o.name))bounds.push({name:o.name,visible:o.visible,position:o.position.toArray()});});return {mode:exterior.modelBuild,bounds,doors:workshops.workshops.doors.map(({id,x,z})=>({id,x,z})),locked:workshops.workshops.lockedDoors.length};});
 await writeFile(new URL(tag+'.json',output),JSON.stringify(data,null,2));console.log(JSON.stringify(data));
}finally{await browser?.close();server.kill();}
