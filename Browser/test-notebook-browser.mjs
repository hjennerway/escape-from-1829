import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';

const root=new URL('../',import.meta.url),port=1858,destination=new URL('./artifacts/notebook/',import.meta.url);
await mkdir(destination,{recursive:true});
const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:root,windowsHide:true,stdio:'ignore',env:{...process.env,PORT:String(port)}});
let browser;
const errors=[],screens=[];
const instrument=`
window.notebookTest={get ready(){return ready;},get state(){return state;},get journal(){return notebook;},get player(){return player;},get enemies(){return enemies;},get time(){return elapsed;},get arrival(){return arrivalCutscene;},keys,update,start,openNotebook,closeNotebook,
pose(x,z,floor,outside=false){keys.clear();state='play';elapsed=1;Object.assign(player,{x,z,floor,y:floors[floor].elevation,stair:null,outside});showFloor();camera.position.set(x,player.y+1.65,z);observeNotebook();drawMap();},
prepareArt(){const art=artPanels.find(a=>a.url.endsWith('daily-account-patients-1854.png'));this.pose(art.x+art.normalX*1.1,art.z+art.normalZ*1.1,art.floor);yaw=art.rotation;camera.rotation.set(0,yaw,0);},
snapshot(){return {player:{...player},time:elapsed,enemies:enemies.map(e=>({x:e.x,z:e.z,floor:e.floor,y:e.y,phase:e.mesh.userData?.guardRig?.phase})),revision:notebook.revision,fog:[...notebook.fog].map(([key,f])=>[key,f.revision,f.cells.reduce((a,b)=>a+b,0)])};},
mapPixel(key,x,z){const fog=notebook.fog.get(key),[a,b,d,e]=fog.bounds,c=$('map'),s=Math.min((c.width-16)/(b-a),(c.height-16)/(e-d)),ox=(c.width-(b-a)*s)/2,oz=(c.height-(e-d)*s)/2;return [...c.getContext('2d').getImageData(Math.round(ox+(x-a)*s),Math.round(oz+(z-d)*s),1,1).data];},
get camera(){return camera;},get torch(){return torch;}};`;
async function load(page){
 page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(120000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|WebGL|shader/i.test(m.text()))errors.push(m.text());});
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/game.mjs',async r=>r.fulfill({contentType:'text/javascript',body:(await readFile(new URL('./dist/game.mjs',import.meta.url),'utf8'))+instrument}));
 await page.goto(`http://127.0.0.1:${port}`);
 await page.waitForFunction(()=>window.notebookTest?.ready,null,{timeout:120000});
 await page.locator('#start').click();
 await page.evaluate(()=>window.notebookTest.arrival.update(3));
 await page.waitForFunction(()=>window.notebookTest.state==='play');
}
async function capture(page,name){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});screens.push(name);}
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:820}});await load(page);
 await page.keyboard.press('n');await page.waitForFunction(()=>window.notebookTest.state==='notebook');
 assert.equal(await page.locator('#notebookFloors button').count(),1,'Future floors stay out of the notebook');
 assert.equal(await page.locator('#floorMap').getAttribute('role'),'dialog');
 const unknown=await page.evaluate(()=>window.notebookTest.mapPixel('floor:0',-31.1,-7));assert(unknown.slice(0,3).every(v=>v<30),'An unvisited wing is masked in the real map canvas');
 const frozen=await page.evaluate(()=>window.notebookTest.snapshot());
 await page.keyboard.down('w');await page.keyboard.down('e');await page.keyboard.press('f');await page.evaluate(()=>window.notebookTest.update(5));await page.keyboard.up('e');await page.keyboard.up('w');
 assert.deepEqual(await page.evaluate(()=>window.notebookTest.snapshot()),frozen,'Actual keyboard reading freezes player, NPCs, timer, journal and fog');
 await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.getElementById('floorMap').contains(document.activeElement)));
 await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'closeNotebook');
 await capture(page,'desktop-first-page');await page.keyboard.press('Escape');
 await page.evaluate(()=>{const t=window.notebookTest;t.pose(-31.1,-7,0);t.pose(31,5,0);t.pose(-20.5,8.2,1);t.pose(-31.1,-7,2);t.pose(-38.8,-34.7,2,true);t.prepareArt();});
 await page.keyboard.down('e');await page.waitForFunction(()=>!document.getElementById('artViewer').hidden);await page.keyboard.up('e');
 assert(await page.evaluate(()=>window.notebookTest.journal.entries.some(e=>e.title.includes('December 1854'))),'Real held-E artwork inspection records the document');
 const copied=await page.evaluate(()=>window.notebookTest.journal.entries.filter(e=>e.id.startsWith('archive:')).length);
 await page.keyboard.down('e');await page.waitForFunction(()=>!document.getElementById('artViewer').hidden);await page.keyboard.up('e');
 assert.equal(await page.evaluate(()=>window.notebookTest.journal.entries.filter(e=>e.id.startsWith('archive:')).length),copied);
 await page.keyboard.press('m');await page.waitForFunction(()=>window.notebookTest.state==='notebook');
 assert.equal(await page.locator('#notebookFloors button').count(),4);assert(await page.locator('#notebookFacts').innerText().then(t=>t.includes('7–9 December 1854')));assert(await page.locator('#notebookDeductions').innerText().then(t=>t.includes('not identical')));
 const beforeBrowse=await page.evaluate(()=>window.notebookTest.snapshot());
 for(const name of ['Ground floor','First floor','Basement','Grounds']){await page.locator('#notebookFloors button').filter({hasText:name}).click();}
 assert.deepEqual(await page.evaluate(()=>window.notebookTest.snapshot()),beforeBrowse,'Reviewing a sketch cannot discover or move anything');
 await page.locator('#notebookFloors button').filter({hasText:'Ground floor'}).click();
 const explored=await page.evaluate(()=>window.notebookTest.mapPixel('floor:0',-31.1,-7));assert(explored.slice(0,3).some(v=>v>35),'Previously visited geometry is retained in the enlarged map');
 await capture(page,'desktop-discoveries');
 await page.locator('#notebookFloors button').filter({hasText:'Basement'}).click();await capture(page,'desktop-basement');
 await page.locator('#notebookFloors button').filter({hasText:'Grounds'}).click();await capture(page,'desktop-grounds');
 await page.locator('#closeNotebook').click();await page.evaluate(()=>{const t=window.notebookTest;t.start();t.arrival.update(3);t.openNotebook();});
 assert.equal(await page.locator('#notebookFloors button').count(),1);assert(!await page.locator('#notebookFacts').innerText().then(t=>t.includes('Daily account')));await page.close();

 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});await load(mobile);
 assert(await mobile.locator('#touchMap').isVisible());
 await mobile.evaluate(()=>{const t=window.notebookTest;t.pose(-31.1,-7,2);t.prepareArt();});
 const useButton=await mobile.locator('[data-key="KeyE"]').boundingBox();
 await mobile.mouse.move(useButton.x+useButton.width/2,useButton.y+useButton.height/2);await mobile.mouse.down();
 await mobile.waitForFunction(()=>!document.getElementById('artViewer').hidden);await mobile.mouse.up();
 await mobile.locator('#touchMap').tap();await mobile.waitForFunction(()=>window.notebookTest.state==='notebook');
 const mobileFrozen=await mobile.evaluate(()=>window.notebookTest.snapshot());await mobile.evaluate(()=>{window.dispatchEvent(new Event('blur'));window.notebookTest.update(10);});assert.deepEqual(await mobile.evaluate(()=>window.notebookTest.snapshot()),mobileFrozen);
 const geometry=await mobile.evaluate(()=>{const card=document.querySelector('.notebook-card'),map=document.getElementById('map');return {width:innerWidth,card:card.getBoundingClientRect().toJSON(),map:map.getBoundingClientRect().toJSON(),overflow:card.scrollWidth>card.clientWidth};});
 assert(!geometry.overflow);assert(geometry.card.x>=0&&geometry.card.right<=geometry.width);assert(geometry.map.width>205,'Notebook map is larger than the minimap on a phone');
 await capture(mobile,'mobile-sketch');await mobile.locator('.notebook-pages').evaluate(e=>e.scrollTop=e.scrollHeight);
 const scrolled=await mobile.locator('#closeNotebook').evaluate(e=>{const b=e.getBoundingClientRect(),hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return {close:b.toJSON(),hit:e===hit||e.contains(hit),headerPosition:getComputedStyle(e.parentElement).position};});
 assert(scrolled.close.top>=0&&scrolled.close.bottom<=844&&scrolled.hit,'Resume remains visible and usable after scrolling the notebook');await capture(mobile,'mobile-notes');
 await mobile.locator('#closeNotebook').tap();await mobile.waitForFunction(()=>window.notebookTest.state==='play');assert(await mobile.locator('#touch').isVisible());assert.equal(await mobile.evaluate(()=>window.notebookTest.keys.size),0);
 assert.deepEqual(errors,[]);await writeFile(new URL('validation.json',destination),JSON.stringify({screens,mobile:geometry,scrolled,errors},null,2)+'\n');
 console.log('PASS: actual notebook shortcuts/touch access, per-floor discovery, masked/remembered pixels, held-E record, distinct facts/deductions, frozen player/NPCs/timer, keyboard focus, browsing, restart, responsive scrolling and clean resume; no browser errors.');
}finally{await browser?.close();server.kill();}
