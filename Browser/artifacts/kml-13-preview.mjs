import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {KML_13_ADDITIONS} from '../dist/kml-13-data.mjs';
import {KML_TREES} from '../dist/kml-tree-data.mjs';
import {PERIODS} from '../dist/estate-periods.mjs';

const additions=KML_TREES.filter(t=>KML_13_ADDITIONS.some(p=>p.name===t.name&&p.coordinates[0]===t.longitude));
const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1384,height:900}}),errors=[];
 page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__trees={exterior,renderer,controls,layouts};function frame(){')});});
 for(const mode of ['source','compiled']){
  await page.goto(base+'/aerial.html?period=1916&models='+mode+'&view=annexe-plan');
  await page.waitForFunction(()=>window.__trees?.renderer.info.render.frame>3,null,{timeout:120000});
  assert.equal(await page.evaluate(()=>window.__trees.exterior.modelBuild.mode),mode==='source'?'procedural':'compiled');
  for(const {year} of PERIODS){
   const count=await page.evaluate(({year,additions})=>{
    const {exterior}=window.__trees;exterior.timeline.setPeriod(year);
    return additions.filter(t=>exterior.trees.children.some(o=>{
     if(o.name!==t.name||o.position.x!==t.x||o.position.z!==t.z)return false;
     for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;
    })).length;
   },{year,additions});
   assert.equal(count,14,mode+' '+year+' shows all new trees');
  }
  for(const year of [1829,2021]){
   await page.locator('#periodSlider').fill(String(PERIODS.findIndex(p=>p.year===year)));
   await page.evaluate(({year,additions})=>{
    const {exterior,controls}=window.__trees;exterior.timeline.setPeriod(year);exterior.scene.fog.density=0;
    const xs=additions.map(t=>t.x),zs=additions.map(t=>t.z),x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2;
    exterior.camera.position.set(x+45,185,z+170);exterior.camera.lookAt(x,0,z);exterior.camera.fov=45;exterior.camera.updateProjectionMatrix();controls.sync([x,0,z]);
   },{year,additions});
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.screenshot({type:'jpeg',quality:80,path:fileURLToPath(new URL('kml-13-'+mode+'-'+year+'.jpg',import.meta.url))});
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS: all fourteen new trees in every source/compiled period; 1829 and 2021 previews; no page errors.');
}finally{await browser?.close();server.kill();}
