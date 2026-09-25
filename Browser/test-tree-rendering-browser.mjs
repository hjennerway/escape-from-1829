import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const artifacts=new URL('./artifacts/',import.meta.url);await mkdir(artifacts,{recursive:true});
let browser;const errors=[],report=[];
try{
  browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const [profile,path,expectedMode] of [
    ['software','aerial.html?models=source','procedural'],
    ['software','aerial.html?models=compiled','compiled'],
    ['software','explore.html',null],
    ['hardware','aerial.html?models=compiled','compiled'],
    ['hardware','explore.html',null],
    ['restricted','aerial.html?models=source','procedural'],
    ['restricted','explore.html',null]
  ]){
    console.log('Checking '+profile+' '+path);
    const page=await browser.newPage({viewport:{width:1000,height:700}});
    page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
    page.on('pageerror',error=>errors.push(error.stack));
    // Keep actual SwiftShader rendering; vary only what WebGL reports to the
    // application for GPU and privacy-restricted startup scenarios.
    if(profile!=='software')await page.addInitScript(profile=>{
      for(const type of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){
        if(!type)continue;
        const proto=type.prototype,getParameter=proto.getParameter,getExtension=proto.getExtension;
        proto.getParameter=function(key){
          if(key===0x9246)return 'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11)';
          if(key===this.RENDERER)return 'WebKit WebGL';
          return getParameter.call(this,key);
        };
        if(profile==='restricted')proto.getExtension=function(name){return name==='WEBGL_debug_renderer_info'?null:getExtension.call(this,name);};
      }
    },profile);
    await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__trees={renderer,exterior,layouts};\nfunction frame(){')});});
    await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function refreshObstacles(){','let refreshCount=0;function refreshObstacles(){refreshCount++;').replace('const clock=new THREE.Clock();','window.__trees={renderer,exterior,layouts,walker,get refreshCount(){return refreshCount;}};const clock=new THREE.Clock();')});});
    await page.goto(base+'/'+path+'&period=1916'.replace(/^&/,path.includes('?')?'&':'?'));
    await page.waitForFunction(()=>window.__trees?.renderer.info.render.frame>3);
    const initial=await page.evaluate(()=>{
      const {renderer,exterior,refreshCount}=window.__trees,gl=renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');
      return {visible:exterior.trees.visible,mode:exterior.modelBuild?.mode,refreshCount,renderer:info?gl.getParameter(info.UNMASKED_RENDERER_WEBGL):null};
    });
    const visible=profile!=='software';assert.equal(initial.visible,visible);
    if(expectedMode)assert.equal(initial.mode,expectedMode);
    if(profile==='software')assert.match(initial.renderer,/swiftshader/i,'Use a real software renderer');
    if(path.startsWith('explore'))assert(initial.refreshCount>0,'Initial timeline and tree visibility refresh walking obstacles');
    for(const period of ['0','12','8']){
      await page.locator('#periodSlider').fill(period);
      assert.equal(await page.evaluate(()=>window.__trees.exterior.trees.visible),visible,'Timeline retains the startup default');
    }
    if(profile==='software')await page.screenshot({path:fileURLToPath(new URL('tree-rendering-'+(expectedMode??'walking')+'-hidden.png',artifacts))});
    const toggled=await page.evaluate(()=>{
      const {exterior,refreshCount}=window.__trees;
      for(const light of exterior.scene.children)if(light.isDirectionalLight&&light.castShadow)light.shadow.needsUpdate=false;
      document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyT',key:'t',bubbles:true,cancelable:true}));
      return {visible:exterior.trees.visible,refreshed:window.__trees.refreshCount-refreshCount,shadows:exterior.scene.children.filter(light=>light.isDirectionalLight&&light.castShadow).every(light=>light.shadow.needsUpdate)};
    });
    assert.equal(toggled.visible,!visible);assert.equal(toggled.shadows,true);
    if(path.startsWith('explore'))assert.equal(toggled.refreshed,1,'Manual override refreshes walking obstacles');
    await page.locator('#periodSlider').fill('12');
    assert.equal(await page.evaluate(()=>window.__trees.exterior.trees.visible),!visible,'Manual override survives a timeline change');
    await page.locator('#periodSlider').fill('8');
    if(profile==='software')await page.screenshot({path:fileURLToPath(new URL('tree-rendering-'+(expectedMode??'walking')+'-shown.png',artifacts))});
    await page.keyboard.press('t');assert.equal(await page.evaluate(()=>window.__trees.exterior.trees.visible),visible);
    if(profile==='software'&&path.startsWith('explore')){
      await page.keyboard.press('t');await page.reload();await page.waitForFunction(()=>window.__trees?.renderer.info.render.frame>3);
      assert.equal(await page.evaluate(()=>window.__trees.exterior.trees.visible),false,'Reload reevaluates the software renderer');
    }
    report.push({profile,path,...initial});await page.close();
  }
  assert.deepEqual(errors,[]);
  await writeFile(new URL('tree-rendering-browser.json',artifacts),JSON.stringify(report,null,2)+'\n');
  console.log('PASS: actual software rendering in source/compiled aerial and walking pages; simulated GPU/restricted defaults, timeline, manual override, shadows and walking refresh.');
}finally{await browser?.close();server.kill();}
