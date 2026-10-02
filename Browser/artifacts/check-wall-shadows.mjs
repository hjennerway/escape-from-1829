import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {auditCourtyardShadows} from '../fixtures/exterior-shadow-samples.mjs';
const root=new URL('../',import.meta.url),dest=new URL('./wall-shadows/',import.meta.url);await mkdir(dest,{recursive:true});
const server=spawn(process.execPath,['serve.mjs'],{cwd:root,windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1200,height:760},reducedMotion:'reduce'});page.setDefaultTimeout(120000);
 page.on('pageerror',e=>console.log(e.message));page.on('console',m=>{if(m.type()==='error')console.log(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('dist/game.mjs',root),'utf8')+`
 window.courtCheck={THREE,get ready(){return ready;},get exterior(){return exterior;},get renderer(){return renderer;},get camera(){return camera;},boot(){start();arrivalCutscene.update(3);state='paused';torch.visible=false;},pose(x,z,tx,tz,tilt=-.1,y=0){Object.assign(player,{x,y,z,floor:0,outside:true,stair:null,verticalTrend:0});yaw=Math.atan2(x-tx,z-tz);pitch=tilt;state='paused';keys.clear();showFloor();camera.position.set(x,y+1.65,z);camera.rotation.set(pitch,yaw,0);$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},torch(on){exterior.scene.add(torch,torchTarget);torch.visible=on;}};`}));
 await page.goto(base);await page.waitForFunction(()=>window.courtCheck?.ready);await page.evaluate(()=>window.courtCheck.boot());await page.addStyleTag({content:'#hud,header,.vignette{display:none!important}'});
 const report=[];
 if(process.argv.includes('--sweep')){
  for(const bias of [-.00002,-.00008,-.00016,-.0003]){
   await page.evaluate(bias=>{const c=window.courtCheck,sun=c.exterior.scene.children.find(o=>o.isDirectionalLight);sun.shadow.bias=bias;c.exterior.invalidateShadows();c.pose(-20,23,-25,15,.12);c.torch(true);},bias);
   await page.screenshot({path:new URL('bias'+bias+'.png',dest).pathname.replace(/^\/(\w):/,'$1:')});
   const surveys=await page.evaluate(auditCourtyardShadows),samples=surveys.flatMap(r=>r.measurements);
   console.log(JSON.stringify({bias,leaks:samples.filter(m=>m.blocked&&m.core&&m.light>.05)}));
  }
 }else if(process.argv.includes('--isolate')){
  for(const option of ['baseline','no-shadows','no-bump']){
   await page.evaluate(option=>{const c=window.courtCheck;c.pose(-20,23,-25,15,.12);c.torch(true);c.exterior.scene.traverse(o=>{if(o.isMesh){o.receiveShadow=option!=='no-shadows';for(const m of [o.material].flat())if(m&&option==='no-bump')m.bumpScale=0;}});},option);
   await page.screenshot({path:new URL(option+'.png',dest).pathname.replace(/^\/(\w):/,'$1:')});
  }
  console.log('Saved isolated wall views');
 }else{
 for(const mode of ['dusk','day']){
  await page.evaluate(mode=>{const {exterior}=window.courtCheck;exterior.lighting.setMode(mode);exterior.scene.updateMatrixWorld(true);exterior.invalidateShadows();},mode);
  for(const [name,pose] of [['front',[-20,23,-25,15,.12]],['west',[-26.7,29.5,-31.4,17.4,.15]],['court',[-21,-9.3,-25,-9.3,-.1]]]){
   await page.evaluate(pose=>{window.courtCheck.pose(...pose);window.courtCheck.torch(true);},pose);
   await page.screenshot({path:new URL(mode+'-'+name+'.png',dest).pathname.replace(/^\/(\w):/,'$1:')});
  }
  const surveys=await page.evaluate(auditCourtyardShadows);report.push({mode,surveys});
 }
 await writeFile(new URL('survey.json',dest),JSON.stringify(report,null,2));
 console.log('Saved wall views and shadow survey');
 }
}finally{await browser?.close();server.kill();}
