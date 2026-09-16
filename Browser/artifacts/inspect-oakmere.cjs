const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1224,height:918}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.oakmereQA={exterior,layouts,THREE};function frame(){')});});
  await page.goto('http://127.0.0.1:1829/aerial.html?view=annexe');
  await page.waitForFunction(()=>!!window.oakmereQA);
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav{display:none!important}'});
  const views=[['photo',[-79,2.2,-54],[-4,8,-27],49],['context',[-107,96,-134],[0,4,-27],55],['front',[0,1.8,120],[0,9,14],48],['side',[-57,2.5,-12],[-18,10,-3],63]];
  for(const [name,position,target,fov] of views){
   await page.evaluate(({position,target,fov})=>{const {exterior:e,THREE}=window.oakmereQA,p=new THREE.Vector3(...position),t=new THREE.Vector3(...target);e.annexe.localToWorld(p);e.annexe.localToWorld(t);e.scene.fog.density=0;e.camera.position.copy(p);e.camera.lookAt(t);e.camera.fov=fov;e.camera.updateProjectionMatrix();},{position,target,fov});
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.screenshot({path:'Browser/artifacts/oakmere-'+name+'-'+(process.argv[2]??'before')+'.jpg',type:'jpeg',quality:85});
  }
  await page.goto('http://127.0.0.1:1829/explore.html?view=oakmere-photo');
  await page.waitForFunction(()=>!document.getElementById('look').disabled);
  if(await page.locator('#look').textContent()==='RELOAD ↗')throw Error('Walking view failed');
  await page.screenshot({path:'Browser/artifacts/oakmere-walking.jpg',type:'jpeg',quality:85});
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:1829/aerial.html?view=oakmere-lawn');
  await page.locator('#churtonNav.annexe-ward-navigation').waitFor({state:'visible'});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile horizontal overflow');
  await page.screenshot({path:'Browser/artifacts/oakmere-mobile.jpg',type:'jpeg',quality:85});
  if(errors.length)throw Error(errors.join('\n'));console.log('PASS: Oakmere photo, context, existing front and side views, walking page and mobile aerial render.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
