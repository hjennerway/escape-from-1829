import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {startTestServer} from '../test-support/server.mjs';
import {launchHardwareBrowser} from '../test-support/hardware-browser.mjs';
const {server,base}=await startTestServer();let browser;
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1400,height:950}});
 await page.route('**/game.mjs',async route=>{const source=(await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8')).replace('function animate(){','function animate(){if(window.__surveyFreeze)return;');await route.fulfill({contentType:'text/javascript',body:source+'\nwindow.survey={get ready(){return ready},get exterior(){return exterior},get walker(){return outsideWalker},get renderer(){return renderer},get camera(){return camera},get player(){return player},start,update,pose(x,z){state="play";enemyReleaseAt=Infinity;Object.assign(player,{outside:true,x,z,y:0});showFloor();}, freeze(){state="paused"}};'});});
 await page.goto(base+'/index.html?seed=1829');await page.waitForFunction(()=>window.survey?.ready,{},{timeout:180000});
 const data=await page.evaluate(()=>{const t=survey,e=t.exterior;e.lighting.setNight(false);t.start();t.freeze();window.__surveyFreeze=true;e.camera.position.set(60,340,0);e.camera.lookAt(60,0,-20);t.renderer.render(e.scene,e.camera);const rows=[];for(let z=-130;z<=110;z+=5){let row='';for(let x=-130;x<=310;x+=5)row+=t.walker.clear(x,z)?'.':'#';rows.push([z,row]);}return {rows,draws:t.renderer.info.render.calls,triangles:t.renderer.info.render.triangles}});
 await mkdir(new URL('./escape-grounds/',import.meta.url),{recursive:true});
 await page.screenshot({path:new URL('./escape-grounds/before-plan.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
 await writeFile(new URL('./escape-grounds/survey.json',import.meta.url),JSON.stringify(data,null,2));console.log(JSON.stringify(data));
}finally{await browser?.close();server.kill();}

