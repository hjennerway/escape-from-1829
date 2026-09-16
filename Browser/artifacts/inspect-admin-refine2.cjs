const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:840}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const shots=[
   ['marked-correction',[281,57,64],[236,4,20],43],
   ['annexe-end',[279,2.3,42],[238,9.8,25],49],
   ['rear-court',[239,2.4,-49],[212,9,18],57],
   ['overview',[295,94,-53],[216,5,6],53]
  ];
  for(const [name,position,target,fov] of shots){
   await page.route('**/main-admin-building.mjs',async route=>{
    const response=await route.fetch();
    const body=(await response.text()).replace("'main-admin':shot([-74,47,92],[0,6,0],49)","'main-admin':"+JSON.stringify({position,target,fov}));
    await route.fulfill({response,body});
   });
   await page.goto('http://127.0.0.1:1829/aerial.html?view=main-admin');
   await page.waitForTimeout(1800);
   await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#churtonNav {display:none!important}'});
   await page.screenshot({path:'Browser/artifacts/admin-refine2-'+name+'-'+(process.argv[2]||'after')+'.jpg',type:'jpeg',quality:87});
   await page.unroute('**/main-admin-building.mjs');
  }
  if(errors.length)throw Error(errors.join('\n'));
  console.log('PASS: three admin refinement views render without browser errors.');
 }finally{await browser.close();}
})();
