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
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1000,height:700}}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__treeMove={THREE,exterior,renderer,controls};function frame(){}')});});
 await page.goto(base+'/aerial.html?period=1916&models='+mode);
 await page.waitForFunction(()=>window.__treeMove);
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 const data=await page.evaluate(async phase=>{
  const {THREE,exterior:e,renderer}=window.__treeMove;
  e.trees.visible=true;e.scene.fog.density=0;
  e.camera.position.set(-142,48,-107);e.camera.lookAt(-85,0,-39);e.camera.fov=42;e.camera.updateProjectionMatrix();e.camera.updateMatrixWorld(true);
  e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});
  e.invalidateShadows();renderer.render(e.scene,e.camera);
  const trees=e.trees.children.filter(t=>t.userData.broadleafTree).map(t=>{
   const p=t.position.clone();p.y=0;p.project(e.camera);
   return {position:t.position.toArray(),spec:t.userData.broadleafTree,screen:[(p.x+1)*innerWidth/2,(1-p.y)*innerHeight/2]};
  }).filter(t=>t.position[0]<-60&&t.position[2]<10);
  if(phase==='identify')for(const tree of trees){const label=document.createElement('span');label.textContent=tree.position.filter((_,i)=>i!==1).join(', ');label.style.cssText=`display:block!important;position:fixed;left:${tree.screen[0]}px;top:${tree.screen[1]}px;background:#ffffffdd;color:#000;font:14px sans-serif;padding:2px`;document.body.append(label);}
  return {mode:e.modelBuild.mode,trees};
 },phase);
 assert.equal(data.mode,mode==='source'?'procedural':'compiled');
 await writeFile(new URL(`churton-tree-${phase}-${mode}.json`,import.meta.url),JSON.stringify(data,null,2)+'\n');
 await page.screenshot({path:fileURLToPath(new URL(`churton-tree-${phase}-${mode}.png`,import.meta.url))});
 assert.deepEqual(errors,[]);console.log('PASS: '+phase+' '+mode+' preview; no page errors.');
}finally{await browser?.close();server.kill();}
