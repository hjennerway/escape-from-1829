import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {fileURLToPath} from 'node:url';
const tag=process.argv[2]||'before',mode=process.argv[3]||'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(r=>server.stdout.once('data',d=>r(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1100,height:900}});page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__road={exterior,renderer,controls,layouts,THREE};function frame(){}')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1916');
 await page.waitForFunction(()=>window.__road,null,{timeout:120000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const [name,target,height] of [['overview',[444,-35],310],['oblique',[444,-35],310],['distant',[444,-35],650],['precision',[444,-35],310],['north',[560,-76],65],['fork',[315,-59],75],['lamp',[342,-88],38]]){
  await page.evaluate(({name,target,height})=>{
   const {exterior:e,renderer}=window.__road,camera=e.camera;
   camera.position.set(target[0]+(name==='oblique'?110:0),height,target[1]+(name==='oblique'?-150:0));camera.up.set(1,0,.4);camera.lookAt(target[0],0,target[1]);
   camera.near=name==='precision'?.05:.5;camera.fov=48;camera.updateProjectionMatrix();e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.scene.fog.density=0;e.invalidateShadows();renderer.render(e.scene,camera);
  },{name,target,height});
  await page.screenshot({path:fileURLToPath(new URL(`lamp-road-${tag}-${mode}-${name}.png`,import.meta.url))});
 }
 const build=await page.evaluate(()=>window.__road.exterior.modelBuild);console.log({build,errors});
 if(build.mode!==(mode==='source'?'procedural':'compiled'))throw Error('Unexpected model loading mode');
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();server.kill();}
