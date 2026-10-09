import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startTestServer} from '../../test-support/server.mjs';
import {launchHardwareBrowser} from '../../test-support/hardware-browser.mjs';
const before=process.argv.includes('--before'),label=before?'before':'after';
const {server,base}=await startTestServer();let browser;
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage({viewport:{width:1200,height:746}}),errors=[];
 page.setDefaultTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 if(before)await page.route('**/front-basement.mjs',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-front-basement.mjs',import.meta.url),'utf8')}));
 if(before)await page.route('**/entrance-walks.mjs',async r=>r.fulfill({contentType:'text/javascript',body:await readFile(new URL('before-entrance-walks.mjs',import.meta.url),'utf8')}));
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))+`
window.stairGame={get ready(){return ready;},boot(){start();arrivalCutscene.update(3);state='paused';},pose(p,t){keys.clear();Object.assign(player,{x:p[0],y:p[1]-1.65,z:p[2],floor:0,outside:true,stair:null});state='paused';exterior.scene.add(torch,torchTarget);showFloor();camera.position.set(...p);camera.lookAt(...t);const e=new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ');yaw=e.y;pitch=e.x;camera.fov=70;camera.updateProjectionMatrix();$('arrivalFade').hidden=true;$('result').hidden=true;$('hud').hidden=false;$('interact').hidden=true;},probe(){const ray=new THREE.Raycaster();exterior.model.updateMatrixWorld(true);const meshes=[];exterior.model.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});const samples=[];for(const side of [-1,1])for(const x of [30.12,30.3,30.5,30.7])for(const y of [-.12,-.04,.04,.1,.16]){ray.far=.04;ray.set(new THREE.Vector3(side*x,y,21.68),new THREE.Vector3(0,0,1));samples.push({side,x,y,hits:ray.intersectObjects(meshes,false).map(h=>({name:h.object.name,z:h.point.z}))});}return samples;}};` }));
 await page.goto(base+'/?seed=1829');await page.waitForFunction(()=>window.stairGame?.ready);await page.evaluate(()=>window.stairGame.boot());
 const views=[{name:'west',p:[-31.8,1.8,19.4],t:[-29.2,-.15,21.7]},{name:'west-close',p:[-30.8,1.8,19.4],t:[-28.9,-.25,21.7]},{name:'east',p:[31.8,1.8,19.4],t:[29.2,-.15,21.7]}];
 for(const v of views){await page.evaluate(v=>window.stairGame.pose(v.p,v.t),v);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:fileURLToPath(new URL(label+'-game-'+v.name+'.png',import.meta.url))});}
 const samples=await page.evaluate(()=>window.stairGame.probe());await writeFile(new URL(label+'-game.json',import.meta.url),JSON.stringify({samples,errors},null,2)+'\n');
 for(const sample of samples)assert.equal(sample.hits.length,before?2:1,JSON.stringify(sample));assert.deepEqual(errors,[]);
 console.log('PASS: actual game GPU stair views; '+samples.length+' retaining-face probes '+(before?'reproduce the original overlap.':'have one visible surface.'));
}finally{await browser?.close();server.kill();}
