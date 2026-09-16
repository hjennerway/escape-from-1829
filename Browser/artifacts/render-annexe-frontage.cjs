const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{const page=await browser.newPage({viewport:{width:1400,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));for(const view of (process.argv.length>2?process.argv.slice(2):['annexe-plan','annexe','annexe-front'])){await page.goto('http://127.0.0.1:1829/aerial.html?view='+view);await page.waitForTimeout(1400);await page.screenshot({path:'Research/annexe-frontage-adjustment/'+view+'.png'});}if(errors.length)throw Error(errors.join('\n'));console.log('PASS: revised annexe plan, aerial and front render without page errors');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});



