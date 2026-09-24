import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const tag=process.argv[2]||'before',mode=process.argv[3]||'source';
const fit=JSON.parse(readFileSync(new URL('annexe-island-fit.json',import.meta.url)));
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(r=>server.stdout.once('data',d=>r(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:962,height:700}});page.setDefaultNavigationTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__junction={exterior,renderer,controls,layouts,THREE};function frame(){}')});});
 await page.goto(base+'/aerial.html?models='+mode+'&period=1916&view=historic-admin-grounds');
 await page.waitForFunction(()=>window.__junction,null,{timeout:120000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 for(const name of ['marked','clear','plan']){
  await page.evaluate(({parameters,name})=>{
   const {exterior:e,renderer}=window.__junction,camera=e.camera;
   if(name==='plan'){
    camera.position.set(310,150,-80);camera.up.set(-1,0,0);camera.lookAt(310,0,-80);camera.fov=48;
    camera.updateProjectionMatrix();
   }else{
    const [x,y,z,a,b,f,cx,cy]=parameters;
    camera.position.set(x,y,z);camera.lookAt(x-Math.sin(a)*Math.cos(b),y-Math.sin(b),z-Math.cos(a)*Math.cos(b));
    camera.fov=2*Math.atan(700/(2*f))*180/Math.PI;camera.updateProjectionMatrix();
    camera.projectionMatrix.elements[8]=1-2*cx/962;camera.projectionMatrix.elements[9]=2*cy/700-1;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
   }
   e.trees.visible=name!=='clear';e.scene.fog.density=0;e.invalidateShadows();renderer.render(e.scene,camera);
  },{parameters:fit.parameters,name});
  await page.screenshot({type:'jpeg',quality:90,path:new URL(`annexe-island-${tag}-${mode}-${name}.jpg`,import.meta.url).pathname.slice(1)});
 }
 const build=await page.evaluate(()=>window.__junction.exterior.modelBuild);console.log(build);
 if(build.mode!==(mode==='source'?'procedural':'compiled'))throw Error('Unexpected model loading mode');
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();server.kill();}
