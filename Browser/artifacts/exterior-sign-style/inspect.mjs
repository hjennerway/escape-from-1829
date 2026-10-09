import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';

const out=new URL('./',import.meta.url),{server,base}=await startTestServer();
let browser;const errors=[],result={};
const instrument=`
window.exteriorSigns={get ready(){return ready},get grounds(){return escapeGrounds},get journal(){return notebook},get renderer(){return renderer},get exterior(){return exterior},
 begin(){window.__manual=true;start();arrivalCutscene.update(3);state='play';enemyReleaseAt=Infinity;keys.clear();enemies.forEach(e=>e.mesh.visible=false)},
 pose(v){Object.assign(player,{x:v.x,z:v.z,y:0,outside:true,floor:0,stair:null});state='play';showFloor();yaw=v.yaw??0;pitch=0;update(.001);observeNotebook();camera.position.set(v.x,v.eye??1.65,v.z);camera.lookAt(v.tx,v.y,v.tz);this.render()},
 render(){for(const id of ['arrivalFade','result','instructions','interact','hud','pause','touch'])$(id).hidden=true;scene.remove(torch,torchTarget);renderer.toneMappingExposure=1.25;renderer.render(exterior.scene,camera)},
 notebook(){openNotebook()},
 reopen(){closeNotebook(false);state='play'},
 openWicket(){escapeProgress.run.crowbar=true;const n=escapeGrounds.nodes.find(n=>n.id==='wicket');escapeGrounds.workOn(n,true,3.1);this.render()}};`;

try{
 browser=await launchHardwareBrowser();
 const page=await browser.newPage({viewport:{width:1280,height:820}});
 page.setDefaultTimeout(180000);page.setDefaultNavigationTimeout(180000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text())});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8')).replace('clock.update();const frameDt','if(window.__manual)return;clock.update();const frameDt')+instrument}));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.exteriorSigns?.ready);
 await page.evaluate(()=>exteriorSigns.begin());
 result.signs=await page.evaluate(async()=>{
  const {paintAsylumSign}=await import('/asylum-sign-paint.mjs'),t=exteriorSigns;
  const records=[];
  for(const [name,lines] of [['NIGHT GATE · LOCKED sign',['NIGHT GATE · LOCKED','Pedestrian gate: west path']],['PEDESTRIAN GATE sign',['PEDESTRIAN GATE','Please close quietly']],['Maintenance wicket sign',['Maintenance wicket']]]){
   const m=t.grounds.group.getObjectByName(name),image=m.material.map.image;
   const expected=document.createElement('canvas');expected.width=1024;expected.height=320;paintAsylumSign(expected.getContext('2d'),lines);
   const actual=image.getContext('2d').getImageData(0,0,image.width,image.height).data,want=expected.getContext('2d').getImageData(0,0,1024,320).data;
   records.push({name,lines,material:m.material.type,roughness:m.material.roughness,geometry:m.geometry.type,paint:[image.width,image.height],exactDoorPaint:actual.length===want.length&&actual.every((x,i)=>x===want[i]),parent:m.parent.name});
  }
  return records;
 });
 assert.equal(result.signs.length,3);assert(result.signs.every(s=>s.material==='MeshStandardMaterial'&&s.roughness===.94&&s.geometry==='BoxGeometry'&&s.exactDoorPaint));
 result.renderer=await page.evaluate(()=>{const gl=exteriorSigns.renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');return gl.getParameter(info.UNMASKED_RENDERER_WEBGL)});
 result.modelMode=await page.evaluate(()=>exteriorSigns.exterior.modelBuild);
 const views=[['wicket',{x:87,z:-81.8,tx:87,tz:-85,y:2.05}],['pedestrian',{x:-80,z:-81.8,tx:-80,tz:-85,y:2.45}],['night-gate',{x:0,z:62.8,tx:0,tz:66,y:2.35,yaw:Math.PI}]];
 for(const [name,view] of views){await page.evaluate(v=>exteriorSigns.pose(v),view);await page.screenshot({path:fileURLToPath(new URL(name+'.png',out))})}
 await page.evaluate(()=>exteriorSigns.pose({x:87,z:-83.5,tx:87,tz:-85,y:2.05}));
 result.observation=await page.evaluate(()=>exteriorSigns.journal.entries.find(e=>e.id==='escape:grounds:wicket'));
 assert(result.observation.text.includes('Boards need prising off'));assert.equal(result.observation.kind,'fact');assert.equal(result.observation.view,'outside');assert.match(result.observation.source,/Personal observation/);
 await page.evaluate(()=>exteriorSigns.notebook());
 assert.match(await page.locator('#notebookFacts').innerText(),/Boards need prising off/);
 await page.screenshot({path:fileURLToPath(new URL('notebook.png',out))});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:fileURLToPath(new URL('notebook-phone.png',out))});
 await page.evaluate(()=>exteriorSigns.reopen());
 await page.evaluate(()=>exteriorSigns.pose({x:87,z:-81.8,tx:87,tz:-85,y:2.05}));
 await page.screenshot({path:fileURLToPath(new URL('wicket-phone.png',out))});
 await page.setViewportSize({width:1280,height:820});
 await page.evaluate(()=>exteriorSigns.pose({x:87,z:-81.8,tx:87,tz:-85,y:2.05}));
 await page.evaluate(()=>exteriorSigns.openWicket());
 result.opened=await page.evaluate(()=>({rotation:exteriorSigns.grounds.gates.wicket.pivot.rotation.y,boardsVisible:exteriorSigns.grounds.gates.wicket.boards.visible,parent:exteriorSigns.grounds.group.getObjectByName('Maintenance wicket sign').parent.name}));
 assert.equal(result.opened.rotation,-Math.PI/2);assert.equal(result.opened.boardsVisible,false);assert.equal(result.opened.parent,'wicket boundary gate');
 await page.screenshot({path:fileURLToPath(new URL('wicket-open.png',out))});
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',out),JSON.stringify({...result,errors},null,2)+'\n');
 console.log('PASS: all three exterior gate signs exactly match shared door paint and material; single-line wicket, actual notebook observation, desktop/phone captures, moving gate, no page/shader errors.');
}finally{await browser?.close();server.kill()}
