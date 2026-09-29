import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const stage=process.argv[2]??'before',mode=stage==='compiled'?'compiled':'source',walking=stage==='walking';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:800},reducedMotion:'reduce'}),errors=[];
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){requestAnimationFrame(frame);','window.__contact={THREE,exterior,renderer,controls};function frame(){if(!window.__contactFreeze)requestAnimationFrame(frame);')});});
 await page.route('**/explore.mjs',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const clock=new THREE.Timer();','window.__contact={THREE,exterior,renderer,walker};const clock=new THREE.Timer();')});});
 await page.goto(base+(walking?'/explore.html':'/aerial.html?models='+mode+'&buildingDetail=full'));
 await page.waitForFunction(()=>window.__contact?.renderer.info.render.frame>3);
 await page.addStyleTag({content:'body > :not(canvas){display:none!important}'});
 await page.evaluate(()=>{const {exterior,renderer}=window.__contact;window.__contactFreeze=true;renderer.setAnimationLoop(null);exterior.trees.visible=true;exterior.invalidateShadows();});
 const views=[['reference',[113,1.8,52],[137,2,-12],67],['junction',[248,1.8,-20],[186,2,-10],67],['lawn',[6,1.7,48],[1,0,32],58],['root',[15,1.4,53],[13,.25,47.8],58],['admin',[255,1.8,48],[250,.2,36],58]].filter(v=>!process.argv[3]||v[0]===process.argv[3]);
 for(const [name,position,target,fov] of views){
  const png=await page.evaluate(({position,target,fov})=>{const {exterior,renderer,controls}=window.__contact;exterior.model.traverse(o=>{if(o.isSprite)o.visible=false;});exterior.camera.near=.1;exterior.camera.position.set(...position);exterior.camera.lookAt(...target);exterior.camera.fov=fov;exterior.camera.updateProjectionMatrix();controls?.sync(target);exterior.invalidateShadows();renderer.render(exterior.scene,exterior.camera);return renderer.domElement.toDataURL('image/png').split(',')[1];},{position,target,fov});
  await writeFile(`Browser/artifacts/ground-contact-${stage}-${name}.png`,Buffer.from(png,'base64'));
 }
 await writeFile(`Browser/artifacts/ground-contact-${stage}.json`,JSON.stringify({mode:await page.evaluate(()=>window.__contact.exterior.modelBuild?.mode??'walking'),errors},null,2));
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS: '+stage+' ground-contact previews.');
}finally{await browser?.close();server.kill();}
