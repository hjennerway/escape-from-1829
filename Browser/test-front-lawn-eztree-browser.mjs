import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const output=new URL('artifacts/',import.meta.url);await mkdir(output,{recursive:true});
let browser;const report=[];
try{
  browser=await launchHardwareBrowser({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{})});
  for(const mode of process.argv.length>2?process.argv.slice(2):['source','compiled','walking']){
    const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'no-preference'}),errors=[];
    page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/i.test(m.text()))errors.push(m.text());});
    await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__lawn={THREE,exterior,renderer,lighting,controls};function frame(){')});});
    await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.__lawn={THREE,exterior,renderer,lighting,walker};const clock=new THREE.Timer();')});});
    await page.goto(base+'/'+(mode==='walking'?'explore.html?':'aerial.html?models='+mode+'&')+'view=front-lawn-trees&period=1916');
    await page.waitForFunction(()=>window.__lawn?.renderer.info.render.frame>2);
    if(mode!=='walking')assert.equal(await page.evaluate(()=>window.__lawn.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
    assert.equal(await page.evaluate(()=>window.__lawn.exterior.trees.visible),true,'Hardware rendering starts with trees');
    const stats=await page.evaluate(async()=>{
      const {THREE,exterior,renderer,lighting}=window.__lawn;
      if(!exterior.trees.visible)throw new Error('Trees remain hidden');
      const {installLeafWind}=await import('/front-lawn-wind.mjs');
      lighting.update=()=>{}; // Hold sky and illumination steady for the wind comparison.
      const states=new Set();exterior.trees.traverse(o=>{if(o.material?.userData.frontLawnWind){states.add(installLeafWind(o.material));states.add(installLeafWind(o.customDepthMaterial));}});
      window.__lawn.windStates=[...states];
      const {exteriorObstacles,createObstacleIndex}=await import('/explore-controls.mjs');
      const collision=createObstacleIndex(exteriorObstacles(THREE,exterior.model));
      const trees=exterior.trees.children.filter(t=>t.userData.ezTree).map(t=>({name:t.name,position:t.position.toArray(),preset:t.userData.ezTree.preset,trunk:collision.contains(t.position.x,t.position.z),underCrown:collision.contains(t.position.x+2,t.position.z),levels:t.children[0].levels.length}));
      const before=lighting.treeWind.time;lighting.treeWind.update(.1);
      return {trees,states:states.size,windAdvances:lighting.treeWind.time>before,drawCalls:renderer.info.render.calls};
    });
    assert(stats.windAdvances);assert.equal(stats.trees.length,6);assert(stats.trees.every(t=>t.trunk&&!t.underCrown&&t.levels===3));
    const frames=[];
    for(const time of [0,4]){
      const png=await page.evaluate(time=>{
        const {windStates,exterior,renderer}=window.__lawn;
        for(const state of windStates)state.time.value=time;
        exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);
        return renderer.domElement.toDataURL('image/png').split(',')[1];
      },time);
      frames.push(png);await writeFile(new URL(`eztree-${mode}-wind-${time}.png`,output),Buffer.from(png,'base64'));
    }
    assert.notEqual(frames[0],frames[1],'Rendered foliage visibly changes with wind time');
    await page.keyboard.press('t');assert.equal(await page.evaluate(()=>window.__lawn.exterior.trees.visible),false);
    await page.keyboard.press('t');assert.equal(await page.evaluate(()=>window.__lawn.exterior.trees.visible),true);
    await page.screenshot({path:fileURLToPath(new URL(`eztree-${mode}-review.png`,output))});
    assert.deepEqual(errors,[]);report.push({mode,...stats,errors});await page.close();
    console.log('PASS: '+mode+' lawn rendering, wind pixels, shadows, trunk collisions, walkable canopy and tree toggle.');
  }
  await writeFile(new URL(process.argv.length>2?'eztree-browser-'+process.argv.slice(2).join('-')+'.json':'eztree-browser.json',output),JSON.stringify(report,null,2)+'\n');
}finally{await browser?.close();server.kill();}
