const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process');
const path=require('node:path');
(async()=>{
 const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:path.resolve(__dirname,'../..'),windowsHide:true,stdio:'ignore'});
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:960}});
  page.on('pageerror',e=>console.error(e.message));
  if(process.argv[3])await page.route('**/escape-preview.html?*',async route=>{
   const response=await route.fetch();
   const camera=process.argv[3]==='wide'?'260,420,150':'240,190,220';
   let body=(await response.text()).replace('exterior.camera.position.set(250,285*Math.max(1,1.35/exterior.camera.aspect),85)','exterior.camera.position.set('+camera+')');
   if(process.argv[3]==='wide')body=body.replace('navigationTarget=[250,0,10]','navigationTarget=[260,0,-55]');
   await route.fulfill({response,body});
  });
  await page.goto('http://127.0.0.1:1829/escape-preview.html?view=historic-admin-grounds');
  await page.waitForTimeout(3000);
  await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#replay {display:none!important}'});
  await page.screenshot({path:path.join(__dirname,process.argv[2]||'admin-current.png')});
 }finally{await browser.close();server.kill();}
})();
