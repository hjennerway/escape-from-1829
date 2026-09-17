import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const mode=process.argv[2]??'after';
const baselineRef=process.argv[3]??'82e6094';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,stdio:'ignore'});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1300,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  if(mode==='before')for(const file of ['admin-pine-trees.mjs','front-lawn-trees.mjs','aerial-layouts.mjs']){
    const body=execFileSync('git',['show',baselineRef+':Browser/dist/'+file],{encoding:'utf8'});
    await page.route('**/'+file,route=>route.fulfill({contentType:'text/javascript',body}));
  }
  await page.route('**/aerial.html*',async route=>{
    const response=await route.fetch();
    const original=mode==='before'?execFileSync('git',['show',baselineRef+':Browser/dist/aerial.html'],{encoding:'utf8'}):await response.text();
    const body=original.replace(/^function frame\(\).*$/m,'window.__aerialTest={renderer,exterior,layouts,controls,tick(){updateRoadLabels(THREE,layouts.roads,exterior.camera,innerWidth,innerHeight);deviceLocationMarker.update(exterior.camera,innerHeight);renderer.render(exterior.scene,exterior.camera);}};function frame(){}');
    await route.fulfill({response,body});
  });
  const results=[];
  for(const view of ['', 'historic-admin-grounds','front-lawn-trees']){
    await page.goto('http://127.0.0.1:1829/aerial.html?view='+view);
    await page.waitForFunction(()=>window.__aerialTest);
    const stats=await page.evaluate(async()=>{
      const {renderer,exterior,controls,tick}=window.__aerialTest;
      const times=[],draws=[],triangles=[];
      for(let i=0;i<35;i++){
        await new Promise(requestAnimationFrame);
        if(i>4)controls.orbit(.7,0);
        const start=performance.now();
        tick();renderer.getContext().finish();
        if(i>4){times.push(performance.now()-start);draws.push(renderer.info.render.calls);triangles.push(renderer.info.render.triangles);}
      }
      times.sort((a,b)=>a-b);
      return {medianRenderMs:times[Math.floor(times.length/2)],p90RenderMs:times[Math.floor(times.length*.9)],drawCalls:Math.round(draws.reduce((a,b)=>a+b)/draws.length),triangles:Math.round(triangles.reduce((a,b)=>a+b)/triangles.length),geometries:renderer.info.memory.geometries};
    });
    results.push({view:view||'default',...stats});
    // Restore the exact saved view for a visual comparison.
    await page.reload();await page.waitForFunction(()=>window.__aerialTest);
    await page.evaluate(()=>window.__aerialTest.tick());
    await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#replay{display:none!important}'});
    await page.screenshot({path:`Browser/artifacts/aerial-perf-${view||'default'}-${mode}.jpg`,quality:85});
  }
  if(errors.length)throw new Error(errors.join('\n'));
  await fs.writeFile(`Browser/artifacts/aerial-perf-${mode}.json`,JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify(results,null,2));
}finally{await browser.close();server.kill();}
