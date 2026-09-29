import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const mode=process.argv[2]??'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
  browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1529,height:900},reducedMotion:'reduce'}),errors=[];
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram/i.test(m.text()))errors.push(m.text());});
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__planting={THREE,exterior,renderer,controls,lighting};function frame(){}')});});
  await page.goto(base+'/aerial.html?period=1916&models='+mode);
  await page.waitForFunction(()=>window.__planting);
  await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
  const data=await page.evaluate(()=>{
    const {THREE,exterior:e,renderer}=window.__planting;
    e.trees.visible=true;e.scene.fog.density=0;
    e.camera.position.set(12,115,127);e.camera.lookAt(12,0,20);e.camera.fov=43;e.camera.updateProjectionMatrix();e.camera.updateMatrixWorld(true);
    e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});
    e.invalidateShadows();renderer.render(e.scene,e.camera);
    const canvas=document.createElement('canvas');canvas.width=renderer.domElement.width;canvas.height=renderer.domElement.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    const pixels=()=>{ctx.drawImage(renderer.domElement,0,0);return ctx.getImageData(0,0,canvas.width,canvas.height).data;};
    const before=pixels(),west=e.trees.children.find(t=>t.name==='West front lawn mature beech');
    // Disable only its casters, keeping the visible crown and all other shadows.
    west.traverse(o=>{if(o.isMesh)o.castShadow=false;});e.invalidateShadows();renderer.render(e.scene,e.camera);
    const after=pixels();let shadowPixels=0,totalChange=0;
    for(let i=0;i<before.length;i+=4){const d=after[i]+after[i+1]+after[i+2]-before[i]-before[i+1]-before[i+2];if(d>9){shadowPixels++;totalChange+=d;}}
    west.traverse(o=>{if(o.isMesh)o.castShadow=true;});e.invalidateShadows();renderer.render(e.scene,e.camera);
    return {mode:e.modelBuild.mode,shadowPixels,totalChange,trees:e.trees.children.filter(t=>t.userData.frontLawnTree).map(t=>t.userData.frontLawnTree),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
  });
  assert.equal(data.mode,mode==='source'?'procedural':'compiled');assert(data.shadowPixels>100,'Western tree must visibly darken the rendered scene');assert.deepEqual(errors,[]);
  await page.screenshot({path:fileURLToPath(new URL(`lawn-planting-${mode}.png`,import.meta.url))});
  await writeFile(new URL(`lawn-planting-${mode}.json`,import.meta.url),JSON.stringify({...data,errors},null,2)+'\n');
  console.log(JSON.stringify(data));
}finally{await browser?.close();server.kill();}
