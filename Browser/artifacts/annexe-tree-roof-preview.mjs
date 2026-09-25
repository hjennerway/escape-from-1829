import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const phase=process.argv[2]??'identify',mode=process.argv[3]??'source';
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1000,height:900}}),errors=[];
 page.setDefaultNavigationTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__treeFix={THREE,exterior,renderer,controls};function frame(){}')});});
 await page.goto(base+'/aerial.html?period=1916&models='+mode+'&view=annexe');
 await page.waitForFunction(()=>window.__treeFix,null,{timeout:120000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 const data=await page.evaluate(async phase=>{
  const {THREE,exterior:e,renderer}=window.__treeFix;
  const {annexePoint,annexeLocal}=await import('/annexe.mjs');
  e.scene.fog.density=0;
  e.camera.position.set(...annexePoint(161,196,-35));e.camera.lookAt(...annexePoint(0,0,-35));e.camera.fov=42;e.camera.updateProjectionMatrix();e.camera.updateMatrixWorld(true);
  if(phase==='trial'){const tree=e.trees.getObjectByName('Oak24');tree.scale.setScalar(.65);tree.updateMatrix();e.model.updateMatrixWorld(true);}
e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});
  e.invalidateShadows();renderer.render(e.scene,e.camera);
  const trees=e.trees.children.filter(t=>t.userData.oakTree).map(t=>{
   const p=t.position.clone();p.y+=15*t.scale.y;p.project(e.camera);
   return {name:t.name,position:t.position.toArray(),scale:t.scale.toArray(),local:annexeLocal([t.position.x,t.position.z]),screen:[(p.x+1)*innerWidth/2,(1-p.y)*innerHeight/2]};
  });
  if(phase==='identify')for(const tree of trees){
   const label=document.createElement('span');label.textContent=tree.name;
   label.style.cssText=`display:block!important;position:fixed;left:${tree.screen[0]}px;top:${tree.screen[1]}px;background:#ffffffdd;color:#000;font:13px sans-serif;padding:2px;pointer-events:none`;
   document.body.append(label);
  }
  const tree=e.trees.getObjectByName('Oak24'),box=new THREE.Box3().setFromObject(tree),nearby=[];
  e.annexe.traverse(o=>{if(!o.isMesh||!o.name.toLowerCase().includes('roof'))return;const roof=new THREE.Box3().setFromObject(o);if(roof.distanceToPoint(tree.position)<30)nearby.push({name:o.name,min:roof.min.toArray(),max:roof.max.toArray(),intersects:box.intersectsBox(roof)});});
  return {mode:e.modelBuild.mode,trees,treeBox:{min:box.min.toArray(),max:box.max.toArray()},nearby};
 },phase);
 assert.equal(data.mode,mode==='source'?'procedural':'compiled');
 await writeFile(new URL(`annexe-tree-roof-${phase}-${mode}.json`,import.meta.url),JSON.stringify(data,null,2));
 await page.screenshot({path:fileURLToPath(new URL(`annexe-tree-roof-${phase}-${mode}.png`,import.meta.url))});
 assert.deepEqual(errors,[]);console.log('PASS: '+phase+' '+mode+' preview; no page errors.');
}finally{await browser?.close();server.kill();}
