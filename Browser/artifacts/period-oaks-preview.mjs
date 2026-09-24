import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {chromium} from 'playwright';
const mode=process.argv[2]??'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(r=>server.stdout.once('data',d=>r(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1228,height:729}});page.setDefaultNavigationTimeout(120000);
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__oaks={exterior,renderer,layouts,THREE};function frame(){}')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1916&view=annexe');await page.waitForFunction(()=>window.__oaks);
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 const data=await page.evaluate(async(p)=>{
  const {exterior:e,renderer,THREE}=window.__oaks;
  const {annexePoint}=await import('./annexe.mjs');
  const {PERIODS}=await import('./estate-periods.mjs');
  const {exteriorObstacles,obstacleContains}=await import('./explore-controls.mjs');
  const oaks=e.trees.children.filter(o=>o.userData.estateSection==='Annexe lawn oaks');
  if(oaks.length!==3)throw Error('Expected exactly three marked oaks');
  for(const {year} of PERIODS){e.timeline.setPeriod(year);const shown=[1915,1916,1938].includes(year);
   for(const oak of oaks){if(oak.visible!==shown)throw Error('Wrong oak visibility in '+year);
    if(exteriorObstacles(THREE,oak).some(o=>obstacleContains(o,oak.position.x,oak.position.z,.1))!==shown)throw Error('Wrong oak collision in '+year);
   }
  }
  e.timeline.setPeriod(1916);
  e.camera.position.set(...p.slice(0,3));e.camera.lookAt(p[0]-Math.sin(p[3])*Math.cos(p[4]),p[1]-Math.sin(p[4]),p[2]-Math.cos(p[3])*Math.cos(p[4]));e.camera.fov=2*Math.atan(729/(2*p[5]))*180/Math.PI;e.camera.updateProjectionMatrix();e.camera.projectionMatrix.elements[8]=1-2*p[6]/1228;e.camera.projectionMatrix.elements[9]=2*p[7]/729-1;e.camera.projectionMatrixInverse.copy(e.camera.projectionMatrix).invert();e.camera.updateMatrixWorld(true);e.scene.fog.density=0;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});
  renderer.render(e.scene,e.camera);
  return {mode:e.modelBuild.mode,camera:e.camera.position.toArray(),target:annexePoint(0,0,-40),ranges:e.annexe.userData.ranges,annexeMatrix:e.annexe.matrixWorld.toArray()};
 },JSON.parse(readFileSync('../Research/annexe-period-oaks/placement-fit.json')).parameters);
 if(data.mode!==(mode==='source'?'procedural':'compiled'))throw Error('Unexpected model mode '+data.mode);
 console.log('PASS: '+mode+' three oaks, all periods and trunk collisions.');
 await page.screenshot({path:'artifacts/period-oaks-'+mode+'.png'});
}finally{await browser.close();server.kill();}
