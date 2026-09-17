import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1000,height:750}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/aerial.html*',async route=>{
  const response=await route.fetch();
  const body=(await response.text()).replace(/^function frame\(\).*$/m,'window.__preview={THREE,renderer,exterior,layouts};function frame(){}');
  await route.fulfill({response,body});
 });
 await page.goto('http://127.0.0.1:1829/aerial.html?models=source');
 await page.waitForFunction(()=>window.__preview,null,{timeout:120000});
 await page.addStyleTag({content:'body>*:not(canvas){display:none!important}'});
 console.log(await page.evaluate(()=>{
  const {THREE,renderer,exterior}=window.__preview,camera=exterior.camera;
  camera.position.set(-7.2,100.75,-43.4);camera.lookAt(102,0,-98);camera.fov=46;camera.updateProjectionMatrix();
  exterior.scene.fog.density=0;exterior.scene.traverse(o=>{if(o.isSprite)o.visible=false});renderer.render(exterior.scene,camera);
  return (()=>{const list=[];exterior.trees.traverse(o=>{if(o.userData.broadleafTree)list.push(o)});return list;})().map(o=>{const p=o.position.clone().project(camera);return {x:o.position.x,z:o.position.z,pixel:[(p.x+1)*500,(1-p.y)*375]};}).filter(o=>o.x>40&&o.x<140&&o.z<-65);
 }));
 await page.screenshot({path:`Browser/artifacts/bowling-lawn-${process.argv[2]??'before'}.png`});
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}


