import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {readFileSync,writeFileSync} from 'node:fs';
const mode=process.argv[2]||'source',tag=process.argv[3]||'before';
const server=spawn(process.execPath,['Browser/serve.mjs'],{windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise(r=>server.stdout.once('data',d=>r(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0])));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
const page=await browser.newPage({viewport:{width:1488,height:753}});page.setDefaultNavigationTimeout(120000);
await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/^function frame\(\).*$/m,'window.__rear={exterior,renderer,layouts,THREE};function frame(){}')});});
await page.goto(base+'/aerial.html?models='+mode+'&period=1916');await page.waitForFunction(()=>window.__rear,null,{timeout:120000});
await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
const data=await page.evaluate(p=>{
const {exterior:e,renderer,THREE}=window.__rear,camera=e.camera;
const a=p[3],b=p[4],u=[-Math.sin(a)*Math.sin(b),Math.cos(b),-Math.cos(a)*Math.sin(b)],f=[-Math.sin(a)*Math.cos(b),-Math.sin(b),-Math.cos(a)*Math.cos(b)];camera.position.set(...p.slice(0,3));camera.up.set(...u);camera.lookAt(...f.map((v,i)=>p[i]+v));camera.fov=2*Math.atan(376.5/p[5])*180/Math.PI;camera.updateProjectionMatrix();e.scene.fog.density=0;e.scene.traverse(o=>{if(o.isSprite)o.visible=false;});e.invalidateShadows();renderer.render(e.scene,camera);
const names=['Oakmere widened head slate roof','Rear east end pavilion slate roof'];
const marks=[];for(const name of names){const o=e.annexe.getObjectByName(name),p=o.geometry.attributes.position,seen=new Set();for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld),k=v.toArray().map(n=>n.toFixed(3)).join();if(seen.has(k))continue;seen.add(k);const q=v.clone().project(camera);marks.push({id:marks.length,world:v.toArray(),pixel:[(q.x+1)*744,(1-q.y)*376.5]});}}
return marks;
},JSON.parse(readFileSync("Browser/artifacts/rear-roads-fit.json")).parameters);
await page.screenshot({path:`Browser/artifacts/rear-roads-${tag}-${mode}.jpg`});
if(tag==='before'){
await page.evaluate(marks=>{const c=document.createElement('canvas');c.width=1488;c.height=753;c.style='position:fixed;inset:0;pointer-events:none';document.body.append(c);const g=c.getContext('2d');g.font='bold 17px sans-serif';for(const m of marks){g.fillStyle='yellow';g.beginPath();g.arc(...m.pixel,3,0,Math.PI*2);g.fill();g.fillText(m.id,m.pixel[0]+4,m.pixel[1]-4);}},data);
await page.screenshot({path:'Browser/artifacts/rear-roads-labelled.jpg'});writeFileSync('Browser/artifacts/rear-roads-landmarks.json',JSON.stringify(data));}
console.log(await page.evaluate(()=>{
 const {exterior:e}=window.__rear;
 const nodes=[];e.model.traverse(o=>{if(o.name.startsWith('Annexe rear network'))nodes.push(o);});
 if(!nodes.length)throw Error('Missing rear surfaces');
 for(const year of [1829,1849,1856,1860,1870,1896,1912,1915,1916,1938,2010,2016,2021]){
  e.timeline.setPeriod(year);
  for(const node of nodes){let visible=true;for(let o=node.parent;o;o=o.parent)visible&&=o.visible;
   if(visible!==[1915,1916,1938].includes(year))throw Error('Incorrect rear-road period '+year);}
 }
 e.timeline.setPeriod(1916);return {build:e.modelBuild,datedSurfaces:nodes.length,allPeriods:true};
}));
} finally {await browser.close();server.kill();}

