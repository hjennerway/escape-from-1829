import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const hardware=process.argv.includes('--hardware'),suffix=hardware?'-gpu':'';
const port=1831,server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:hardware?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1300,height:900}}),errors=[];
  // Freeze model sources for each comparison, even if another task edits a
  // building while the software-rendered benchmark is running.
  const sources=new Map(await Promise.all((await fs.readdir('Browser/dist')).filter(name=>name.endsWith('.mjs')).map(async name=>[name,await fs.readFile('Browser/dist/'+name,'utf8')])));
  const aerialHTML=await fs.readFile('Browser/dist/aerial.html','utf8');
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.route('**/*.mjs',route=>{const name=new URL(route.request().url()).pathname.split('/').at(-1);return sources.has(name)?route.fulfill({contentType:'text/javascript',body:sources.get(name)}):route.continue();});
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    const body=aerialHTML.replace(/^function frame\(\).*$/m,'window.__detailTest={renderer,exterior,layouts,controls,buildingDetail,ready:frontageReady,tick(){buildingDetail?.update(exterior.camera,innerHeight);updateRoadLabels(THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);deviceLocationMarker.update(exterior.camera,innerHeight);renderer.render(exterior.scene,exterior.camera);}};function frame(){}');
    await route.fulfill({response,body});
  });
  const results=[];
  for(const view of ['', 'historic-admin-grounds','annexe','front'])for(const mode of ['full','auto']){
    await page.goto(`http://127.0.0.1:${port}/aerial.html?view=${view}&buildingDetail=${mode}`);
    await page.waitForFunction(()=>window.__detailTest);
    await page.evaluate(()=>window.__detailTest.ready);
    const stats=await page.evaluate(async hardware=>{
      const {renderer,controls,tick,buildingDetail}=window.__detailTest,times=[],intervals=[],draws=[],triangles=[];
      const warmup=hardware?30:4,samples=hardware?120:20;let previous;
      for(let i=0;i<warmup+samples;i++){
        await new Promise(requestAnimationFrame);const frameTime=performance.now();if(i>=warmup)intervals.push(frameTime-previous);previous=frameTime;
        if(i>=warmup)controls.orbit(14/samples,0);
        const start=performance.now();tick();renderer.getContext().finish();
        if(i>=warmup){times.push(performance.now()-start);draws.push(renderer.info.render.calls);triangles.push(renderer.info.render.triangles);}
      }
      times.sort((a,b)=>a-b);
      const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');
      return {gpu:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),medianRenderMs:times[Math.floor(times.length/2)],meanFrameMs:intervals.reduce((a,b)=>a+b)/intervals.length,drawCalls:Math.round(draws.reduce((a,b)=>a+b)/draws.length),triangles:Math.round(triangles.reduce((a,b)=>a+b)/triangles.length),lod:buildingDetail?.stats,levels:buildingDetail?.entries.map(e=>({name:e.parent.name,level:e.level}))};
    },hardware);
    results.push({view:view||'default',mode,...stats});console.log(JSON.stringify({view:view||'default',mode,...stats,levels:undefined}));
    await page.reload();await page.waitForFunction(()=>window.__detailTest);
    await page.evaluate(async()=>{await window.__detailTest.ready;window.__detailTest.tick();window.__detailTest.tick();window.__detailTest.tick();});
    await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#replay,#churtonNav{display:none!important}'});
    await page.screenshot({path:`Browser/artifacts/building-detail-${view||'default'}-${mode}${suffix}.jpg`,quality:90});
  }
  await fs.writeFile(`Browser/artifacts/building-detail-benchmark${suffix}.json`,JSON.stringify(results,null,2)+'\n');
  if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();server.kill();}
