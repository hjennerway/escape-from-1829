const fs=require('node:fs');
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
  const page=await browser.newPage({viewport:{width:1400,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/aerial.html*',async route=>{
   const response=await route.fetch();
   await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.layoutQA={exterior,layouts,THREE};function frame(){')});
  });
  await page.goto('http://127.0.0.1:1829/aerial.html?view=historic-roads');
  await page.waitForTimeout(1400);
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
  const suffix=process.argv[2]||'after';
  await page.screenshot({path:`Browser/artifacts/layout-roads-${suffix}.png`});
  const data=await page.evaluate(()=>{
   const {exterior:e,layouts:l,THREE}=window.layoutQA;
   return {roads:l.roads.children.filter(o=>o.visible).map(o=>({name:o.name,points:o.userData.centerline})),footprints:l.historicRoads.userData.missingFootprints.occupied,missing:l.historicRoads.userData.missingFootprints.segments,landmarks:Object.fromEntries(['mainAdmin','annexe','churton','chapel','waterTower'].map(k=>[k,e[k]?new THREE.Box3().setFromObject(e[k]).getCenter(new THREE.Vector3()).toArray():null]))};
  });
  fs.writeFileSync('Browser/artifacts/layout-scene.json',JSON.stringify(data));
  await page.evaluate(()=>{const {exterior:e}=window.layoutQA;e.camera.position.set(210,300,5.01);e.camera.lookAt(210,0,5);e.camera.fov=46;e.camera.updateProjectionMatrix();});
  await page.waitForTimeout(500);
  await page.screenshot({path:`Browser/artifacts/layout-admin-${suffix}.png`});
  if(errors.length)throw Error(errors.join('\n'));console.log('PASS: historic plan and admin views render without errors.');
 }finally{await browser.close();}
})();
