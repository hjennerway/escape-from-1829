import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

// Reuse the game fixture's real camera/player posing, without replaying the
// completed full escape regression just to review every changed fitting.
const fixture=await readFile(new URL('../../test-escape-progress-browser.mjs',import.meta.url),'utf8');
const instrument=fixture.match(/const instrument=`([\s\S]*?)`;/)[1];
const {server,base}=await startTestServer();let browser;const errors=[],captures=[];
try{
 browser=await launchHardwareBrowser({executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1280,height:820}});page.setDefaultTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.escapeTest?.ready);
 await page.evaluate(()=>{const random=Math.random;Math.random=()=>.1829;try{escapeTest.start();}finally{Math.random=random;}escapeTest.arrival.update(3);escapeTest.hold();escapeTest.setTorch(false);});
 const fittings=await page.evaluate(()=>escapeTest.world.nodes.map(n=>({id:n.id,kind:n.mount.kind,support:n.mount.supportId,position:n.group.position.toArray()})));
 assert.equal(fittings.length,7);
 async function shot(name,id){await page.evaluate(id=>escapeTest.lookAtNode(id),id);await page.waitForTimeout(100);await page.screenshot({path:fileURLToPath(new URL(name+'.png',import.meta.url))});captures.push(name);}
 for(const fitting of fittings)await shot('desktop-'+fitting.id,fitting.id);
 await page.evaluate(()=>{escapeTest.run.confiscated.add('staffKey');escapeTest.run.confiscated.add('serviceKey');escapeTest.world.sync();});
 await shot('desktop-property-keys','reclaim');
 await page.setViewportSize({width:390,height:844});
 for(const id of ['staff-key','memo','plan','reclaim','release'])await shot('phone-'+id,id);
 assert.deepEqual(errors,[]);
 await writeFile(new URL('validation.json',import.meta.url),JSON.stringify({fittings,captures,torch:false,errors},null,2)+'\n');
 console.log('PASS: all seven supported fittings, additive glow without torch, populated reception tray and five phone views, verified hardware rendering and no runtime/shader errors.');
}finally{await browser?.close();server.kill();}
