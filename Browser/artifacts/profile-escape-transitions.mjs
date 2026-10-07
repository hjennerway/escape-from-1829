import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {launchHardwareBrowser} from '../test-support/hardware-browser.mjs';
const label=process.argv[2]??'before',out=new URL('./escape-transitions/',import.meta.url);await mkdir(out,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;const results=[];
try{
 browser=await launchHardwareBrowser();
 for(const complete of [false,true]){
 const page=await browser.newPage({viewport:{width:1100,height:750},hasTouch:true,isMobile:true});page.setDefaultTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const source=await readFile(new URL('../dist/game.mjs',import.meta.url),'utf8');
 await page.route('**/game.mjs',route=>route.fulfill({contentType:'text/javascript',body:source.replace('function start(){','function start(){\nconst checkpoint=performance.now();let previous=checkpoint;window.__costs=[];const mark=name=>{const now=performance.now();window.__costs.push({name,ms:now-previous});previous=now;};')
 .replace(' notebook.reset();',' mark("furniture");notebook.reset();')
 .replace(' recoveryRemaining=0;enemyReleaseAt=5;', ' mark("scenario");recoveryRemaining=0;enemyReleaseAt=5;')
 .replace(" state='arrival';", " mark('reset');state='arrival';")
 .replace(/ clock.reset\(\);\r?\n\}/, ' clock.reset();mark("ui/audio");\n}')+`
window.__probe={get ready(){return ready;},get complete(){return interiorLoader?.complete;},get state(){return state;},get costs(){return window.__costs;},get stats(){return interiorLoader.stats;},start,player,get floors(){return floors;},get renderer(){return renderer;},get scene(){return scene;},get exterior(){return exterior;},get camera(){return camera;},get progress(){return escapeProgress;},exit(id){const exit=floors[0].exits.find(e=>e.id===id);escapeProgress.run.exitId=id;escapeProgress.run.serviceKey=true;Object.assign(player,{...exit.inside,floor:0,y:0,outside:false});const began=performance.now();useDoor({...exit,floor:0});return performance.now()-began;},enter(){const exit=floors[0].exits.find(e=>e.id===escapeProgress.run.exitId);const began=performance.now();useDoor({...exit,floor:0});return performance.now()-began;}};
window.__draws=[];
` }));
 await page.goto(base+'/?seed=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__probe?.ready);if(complete)await page.waitForFunction(()=>window.__probe.complete);
 await page.evaluate(()=>{const p=window.__probe,render=p.renderer.render;p.renderer.render=(s,c)=>{const began=performance.now();render.call(p.renderer,s,c);if(p.renderer.getRenderTarget()===null)window.__draws.push({ms:performance.now()-began,state:p.state,outside:!!p.player.outside,scene:s===p.scene?'inside':'outside'});};window.__draws=[];document.getElementById('start').click();});await page.waitForFunction(()=>window.__probe.state==='play');
 const launch=await page.evaluate(()=>({costs:window.__probe.costs,draws:window.__draws,stats:window.__probe.stats}));
 await page.waitForFunction(()=>window.__probe.complete);await page.evaluate(()=>{window.__draws=[];});
 const exitCost=await page.evaluate(()=>window.__probe.exit('D1'));await page.waitForTimeout(1000);const exitDraws=await page.evaluate(()=>window.__draws);await page.evaluate(()=>{window.__draws=[];});
 const enterCost=await page.evaluate(()=>window.__probe.enter());await page.waitForTimeout(1000);const enterDraws=await page.evaluate(()=>window.__draws);
 results.push({complete,launch,exitCost,exitDraws,enterCost,enterDraws,errors});console.log(JSON.stringify({complete,costs:launch.costs,maxLaunchDraw:Math.max(...launch.draws.map(d=>d.ms)),exitCost,maxExitDraw:Math.max(...exitDraws.map(d=>d.ms)),enterCost,maxEnterDraw:Math.max(...enterDraws.map(d=>d.ms)),errors}));await page.close();
 }
 await writeFile(new URL(label+'.json',out),JSON.stringify(results,null,2)+'\n');
}finally{await browser?.close();server.kill();}



