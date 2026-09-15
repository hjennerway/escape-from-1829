const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process');
const path=require('node:path');
(async()=>{
 const server=spawn(process.execPath,['Browser/serve.mjs'],{cwd:path.resolve(__dirname,'../..'),windowsHide:true,stdio:'ignore'});
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  for(const view of ['upton','upton-plan','upton-ground']){
   await page.goto('http://127.0.0.1:1829/escape-preview.html?view='+view);
   await page.waitForTimeout(1800);
   await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#replay {display:none!important}'});
   await page.screenshot({path:path.join(__dirname,view+'.png')});
  }
  console.log(JSON.stringify({errors}));if(errors.length)process.exitCode=1;
 }finally{await browser.close();server.kill();}
})();
