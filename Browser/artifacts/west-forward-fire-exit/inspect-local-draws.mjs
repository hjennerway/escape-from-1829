import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(resolve=>server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await launchHardwareBrowser();
try{
 const page=await browser.newPage({viewport:{width:1220,height:900}}),counts={};
 page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.localDrawTest={THREE,renderer,exterior,controls};function frame(){')});});
 for(const mode of ['source','compiled']){
  await page.goto(base+'/aerial.html?models='+mode+'&buildingDetail=full&view=west-forward-end-photo');await page.waitForFunction(()=>window.localDrawTest?.renderer.info.render.frame>3);
  counts[mode]=await page.evaluate(async()=>{
   const {renderer,exterior,controls}=window.localDrawTest,c=exterior.camera;
   c.position.set(-49,3.8,53);c.lookAt(-41.4,3.7,44.8);c.fov=54;c.updateProjectionMatrix();controls.sync([-41.4,3.7,44.8]);exterior.scene.fog.density=0;
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const entries=[],previous=[];
   exterior.scene.traverse(o=>{if(!o.isMesh)return;const old=o.onBeforeRender;previous.push([o,old]);o.onBeforeRender=function(...args){const g=args[3],group=args[5];entries.push({name:o.name,count:group?.count??g.index?.count??g.attributes.position.count,group:group?.materialIndex??null});old.apply(o,args);};});
   renderer.render(exterior.scene,c);for(const [o,old] of previous)o.onBeforeRender=old;
   return {render:{...renderer.info.render},entries};
  });
 }
 const histogram=list=>{const map=new Map();for(const x of list){const key=JSON.stringify(x);map.set(key,(map.get(key)??0)+1);}return map;};
 const a=histogram(counts.source.entries),b=histogram(counts.compiled.entries),diff=[];
 for(const key of new Set([...a.keys(),...b.keys()]))if(a.get(key)!==b.get(key))diff.push({entry:JSON.parse(key),source:a.get(key)??0,compiled:b.get(key)??0});
 const result={source:counts.source.render,compiled:counts.compiled.render,diff};await writeFile(new URL('local-draws.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();server.kill();}
