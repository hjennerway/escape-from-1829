const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/aerial.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function frame(){','window.accessQA={exterior,layouts,THREE};function frame(){')});});
  await page.goto('http://127.0.0.1:1829/aerial.html?view=annexe');await page.waitForTimeout(1000);
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav,#locationControl{display:none!important}'});
  for(const [name,position,target,fov,local] of [
   ['annexe-access-plan',[0,360,130],[0,0,-5],52,true],
   ['annexe-access-front',[0,140,160],[0,0,48],55,true],
   ['annexe-access-entrance',[0,15,112],[0,1,60],65,true],
   ['parsons-north-joined',[575,280,-129.99],[575,0,-130],52,false],
   ['admin-junctions',[208,260,115],[208,0,51],52,false]
  ]){
   await page.evaluate(({position,target,fov,local})=>{const {exterior:e,THREE}=window.accessQA,p=new THREE.Vector3(...position),t=new THREE.Vector3(...target);if(local){e.annexe.localToWorld(p);e.annexe.localToWorld(t);}e.camera.position.copy(p);e.camera.lookAt(t);e.camera.fov=fov;e.camera.updateProjectionMatrix();},{position,target,fov,local});
   await page.waitForTimeout(300);await page.screenshot({path:'Browser/artifacts/'+name+'.jpg',type:'jpeg',quality:74});
  }
  if(errors.length)throw Error(errors.join('\n'));console.log('PASS: annexe site, narrowed asphalt entrance and joined admin roads render without browser errors.');
 }finally{await browser.close();}
})();
