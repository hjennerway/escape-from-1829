const fs=require('node:fs');
const {chromium}=require('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {spawn}=require('node:child_process');
(async()=>{
const server=spawn(process.execPath,['Browser/serve.mjs'],{env:{...process.env,PORT:'1832'},windowsHide:true,stdio:'ignore'});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1216,height:636}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const q=JSON.parse(fs.readFileSync('Browser/artifacts/admin-reference-camera.json','utf8'));
 const [x,y,z,yaw,pitch,f,cx,cy]=q;
 const target=[x+100*Math.sin(yaw)*Math.cos(pitch),y-100*Math.sin(pitch),z-100*Math.cos(yaw)*Math.cos(pitch)];
 await page.route('**/aerial.html?*',async route=>{const response=await route.fetch();let body=(await response.text()).replace(/\r\n/g,'\n');body=body.replace('controls.sync(navigationTarget);\nfunction frame()',`exterior.camera.position.set(${x},${y},${z});exterior.camera.fov=${2*Math.atan(636/(2*f))*180/Math.PI};exterior.camera.setViewOffset(1216,636,${608-cx},${318-cy},1216,636);exterior.camera.lookAt(${target});exterior.camera.updateProjectionMatrix();navigationTarget=[${target}];controls.sync(navigationTarget);\nfunction frame()`);await route.fulfill({response,body});});
 await page.goto('http://127.0.0.1:1832/aerial.html?view=historic-admin-grounds');await page.waitForTimeout(1500);
 await page.addStyleTag({content:'#previewNav,#layoutControls,#aerialHelp,#replay {display:none!important}'});
 await page.screenshot({path:'Browser/artifacts/admin-road-reroute-after.jpg',type:'jpeg',quality:85});

 if(errors.length)throw Error(errors.join('\n'));console.log('PASS: calibrated Historic aerial renders without browser errors.');
}finally{await browser.close();server.kill()}
})();

