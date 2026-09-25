import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const phase=process.argv[2]??'before',mode=process.argv[3]??'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1000,height:760}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__roofTree={THREE,exterior,renderer,controls};function frame(){}')});});
 await page.goto(base+'/aerial.html?period=1916&models='+mode+'&trees=on');
 await page.waitForFunction(()=>window.__roofTree);
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 const data=await page.evaluate(()=>{
  const {THREE,exterior:e,renderer}=window.__roofTree;
  e.trees.visible=true;e.scene.fog.density=0;
  e.camera.position.set(-65,31,-20);e.camera.lookAt(-42,4,-62);e.camera.fov=32;e.camera.updateProjectionMatrix();e.camera.updateMatrixWorld(true);
  e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});
  e.invalidateShadows();renderer.render(e.scene,e.camera);
  const trees=e.trees.children.filter(t=>t.userData.broadleafTree).map(t=>({position:t.position.toArray(),spec:t.userData.broadleafTree}));
  const tree=e.trees.children.find(t=>t.userData.broadleafTree?.x===-42&&t.userData.broadleafTree?.z===-64);
  const ray=new THREE.Raycaster(new THREE.Vector3(-42,40,-64),new THREE.Vector3(0,-1,0));
  const roof=ray.intersectObject(e.churtonWard,true).filter(h=>h.object.name.endsWith('slate roof')).map(h=>({name:h.object.name,point:h.point.toArray()}));
  return {mode:e.modelBuild.mode,trees,target:tree?.userData.broadleafTree??null,roof};
 });
 assert.equal(data.mode,mode==='source'?'procedural':'compiled');
 if(phase!=='before')assert.equal(data.target,null);
 await writeFile(new URL(`kelsall-roof-tree-${phase}-${mode}.json`,import.meta.url),JSON.stringify(data,null,2)+'\n');
 await page.screenshot({path:fileURLToPath(new URL(`kelsall-roof-tree-${phase}-${mode}.jpg`,import.meta.url)),quality:75});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({phase,mode,roof:data.roof,target:data.target}));
}finally{await browser?.close();server.kill();}
