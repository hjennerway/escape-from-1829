const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:840}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/explore.mjs',async route=>{
   const response=await route.fetch();
   const body=(await response.text()).replace('  const walker=createWalker(exterior.camera,obstacles);','  window.adminQA={exterior,obstacles}; const walker=createWalker(exterior.camera,obstacles);');
   await route.fulfill({response,body});
  });
  for(const [name,view] of [['img1','main-admin-annexe-end'],['img2','main-admin-rear-court']]){
   await page.goto('http://127.0.0.1:1829/explore.html?view='+view);
   await page.waitForFunction(()=>Boolean(window.adminQA));
   await page.waitForTimeout(1700);
   await page.addStyleTag({content:'body>*:not(canvas) {visibility:hidden!important} canvas {visibility:visible!important}'});
   const state=await page.evaluate(()=>{const e=window.adminQA.exterior;let roadLabels=0;e.layouts.roads.traverse(o=>{if(o.isSprite&&o.visible)roadLabels++;});return {camera:e.camera.position.toArray(),service:!!e.towerBuildings,court:!!e.layouts.historicRoads.getObjectByName('Tower service court'),roadLabels};});
   if(!state.service||!state.court||state.roadLabels)throw Error('Explore context missing or aerial labels visible: '+JSON.stringify(state));
   console.log(name+': '+JSON.stringify(state));
   await page.screenshot({path:'Browser/artifacts/admin-refine3-'+name+'-'+(process.argv[2]||'after')+'.jpg',type:'jpeg',quality:86});
  }
  if(errors.length)throw Error(errors.join(' | '));
  console.log('PASS: both marked directions render in Explore with the Historic service range and court.');
 }finally{await browser.close();}
})();
