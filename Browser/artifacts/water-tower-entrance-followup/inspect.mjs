import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const baseline=await readFile(new URL('before.mjs.txt',import.meta.url),'utf8');
const compiled=process.argv.includes('--compiled');
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:new URL('../../../',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',d=>resolve(String(d).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);server.once('exit',code=>reject(new Error('Server exited: '+code)));});
let browser;
const data={},errors=[],shaderErrors=[];
try{
  browser=await launchHardwareBrowser();
  const page=await browser.newPage({viewport:{width:740,height:900}});
  page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/shader|webgl/i.test(m.text()))shaderErrors.push(m.text());});
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.__tower={exterior,layouts,controls,renderer};\nfunction frame(){')});});
  for(const version of compiled?['compiled']:['before','after']){
    if(version==='before')await page.route('**/water-tower.mjs',route=>route.fulfill({body:baseline,contentType:'text/javascript'}));
    else await page.unroute('**/water-tower.mjs');
    await page.goto(base+'/aerial.html?models='+(compiled?'compiled':'source')+'&view=tower-1&period=2021');
    await page.waitForFunction(()=>window.__tower?.renderer.info.render.frame>3);
    assert.equal(await page.evaluate(()=>window.__tower.exterior.modelBuild.mode),compiled?'compiled':'procedural');
    await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav,#deviceLocationStatus {display:none!important}'});
    data[version]=await page.evaluate(()=>{
      const {exterior,renderer}=window.__tower,tower=exterior.waterTower;
      const gl=renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');
      return {renderer:gl.getParameter(info.UNMASKED_RENDERER_WEBGL),retained:{position:tower.position.toArray(),scars:[1,3,4].map(n=>{
        const face=tower.children.find(f=>f.userData.photoSide===n),scar=face.getObjectByName('Descending intersecting roof scars');
        return {side:n,matrix:face.matrixWorld.elements,meshes:scar.children.map(m=>({positions:[...m.geometry.attributes.position.array],color:m.material.color.toArray()}))};
      })},repairs:[1,4].map(n=>{
        const f=tower.children.find(f=>f.userData.photoSide===n),m=f.getObjectByName(n===1?'Pale lower right repair':'Pale lower left repair');
        const p=m.geometry.attributes.position;return {side:n,top:Math.max(...Array.from({length:p.count},(_,i)=>p.getY(i)))};
      }),door:!!tower.getObjectByName('Black entrance door leaf'),handle:!!tower.getObjectByName('Entrance door handle'),threshold:!!tower.getObjectByName('Entrance door threshold'),
      sideWindows:['Lower bricked side window','Upper bricked side window'].map(name=>{
        const m=tower.getObjectByName(name);return m?{name,position:m.position.toArray(),vertices:[...m.geometry.attributes.position.array]}:null;
      }),entranceArch:tower.getObjectByName('Arched entrance arch').material.name,
      thresholdPosition:tower.getObjectByName('Entrance door threshold').position.toArray()};
    });
    if(version!=='before'){
      assert(data[version].door&&data[version].handle&&data[version].threshold);
      assert(data[version].sideWindows.every(w=>w&&w.position[2]<5.05));
      assert.equal(data[version].entranceArch,'Alternating red and yellow arch bricks');
      assert(data[version].thresholdPosition[1]<.05);
      assert.equal(data[version].repairs[0].top,data[version].repairs[1].top);
    }
    const shots=[
      {name:'side-1',angle:0,distance:26,y:7,target:6,fov:42,width:740,height:900},
      {name:'windows-oblique',angle:-.16,distance:26,y:7,target:6,fov:42,width:900,height:900},
      {name:'side-4',angle:Math.PI/2,distance:26,y:7,target:6,fov:42,width:740,height:900},
      {name:'corner',angle:Math.PI/4,distance:29,y:6,target:4.7,fov:42,width:1040,height:820},
      {name:'door',angle:0,distance:16,y:3.4,target:3.1,fov:42,width:900,height:800},
      {name:'door-oblique',angle:.15,distance:17,y:3.6,target:3.1,fov:42,width:900,height:800},
      {name:'phone',angle:0,distance:25,y:5,target:4,fov:49,width:390,height:844}
    ];
    for(const shot of shots){
      await page.setViewportSize({width:shot.width,height:shot.height});
      // Allow the page's resize framing to finish before setting this view.
      await page.waitForTimeout(250);
      await page.evaluate(s=>{
        const {exterior,controls}=window.__tower,{camera,waterTower}=exterior,{x,z}=waterTower.position,target=[x,s.target,z];
        camera.position.set(x+Math.sin(s.angle)*s.distance,s.y,z+Math.cos(s.angle)*s.distance);camera.fov=s.fov;camera.updateProjectionMatrix();camera.lookAt(...target);controls.sync(target);
      },shot);
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await page.screenshot({path:fileURLToPath(new URL(version+'-'+shot.name+'.png',import.meta.url))});
    }
  }
  if(!compiled)assert.deepEqual(data.after.retained,data.before.retained,'Tower placement and roof scar vertices/materials must stay fixed');
  else{
    const source=JSON.parse(await readFile(new URL('source-validation.json',import.meta.url),'utf8'));
    assert.deepEqual(data.compiled.retained,source.data.after.retained);
    assert.deepEqual(data.compiled.repairs,source.data.after.repairs);
    assert.deepEqual(data.compiled.sideWindows,source.data.after.sideWindows);
    assert.deepEqual(data.compiled.thresholdPosition,source.data.after.thresholdPosition);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(shaderErrors,[]);
  await writeFile(new URL((compiled?'compiled':'source')+'-validation.json',import.meta.url),JSON.stringify({browserErrors:errors,shaderErrors,data},null,2)+'\n');
  console.log('PASS: '+(compiled?'rebuilt compiled':'before/after source')+' entrance, tiled corner, oblique and phone views; hardware renderer verified; retained roof scars match; no page/shader errors.');
}finally{await browser?.close();server.kill();}
