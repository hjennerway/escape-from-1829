import {createRequire} from 'node:module';
const require=createRequire('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1250,height:1000}});
await page.goto('http://127.0.0.1:1829/aerial.html?view=grafton-edge-site',{waitUntil:'networkidle'});
await page.evaluate(async()=>{
 const THREE=await import('./vendor/three.module.js');
 const {createEscapeExterior}=await import('./escape-exterior.mjs');
 const {createAerialLayouts}=await import('./aerial-layouts.mjs');
 const {OS_FOOTPRINTS}=await import('./historic-footprint-data.mjs');
 const {historicOSPoint,existingBuildingFootprints}=await import('./historic-footprints.mjs');
 const e=createEscapeExterior(THREE,1.25);createAerialLayouts(THREE,e);
 const canvas=document.createElement('canvas');canvas.id='siteDiagnostic';canvas.width=1250;canvas.height=1000;canvas.style='position:fixed;inset:0;z-index:1000';document.body.append(canvas);
 const c=canvas.getContext('2d');c.fillStyle='#faf8ed';c.fillRect(0,0,1250,1000);
 const at=([x,z])=>[70+(x-30)*5,80+(z+210)*5];
 function path(poly){c.beginPath();poly.forEach((p,i)=>c[i?'lineTo':'moveTo'](...at(p)));c.closePath();}
 c.font='12px Arial';c.strokeStyle='#ddd';c.fillStyle='#777';
 for(let x=30;x<=250;x+=10){c.beginPath();c.moveTo(...at([x,-210]));c.lineTo(...at([x,-40]));c.stroke();c.fillText(x,...at([x,-213]));}
 for(let z=-210;z<=-40;z+=10){c.beginPath();c.moveTo(...at([30,z]));c.lineTo(...at([250,z]));c.stroke();c.fillText(z,...at([23,z]));}
 c.fillStyle='#ccc';c.strokeStyle='#888';for(const poly of existingBuildingFootprints(THREE,e)){path(poly);c.fill();c.stroke();}
 c.strokeStyle='#a65719';c.lineWidth=2;
 for(const b of OS_FOOTPRINTS)for(const loop of b.loops){path(loop.map(p=>historicOSPoint(...p)));c.stroke();}
 c.fillStyle='#713600';c.font='10px Arial';OS_FOOTPRINTS[0].loops[0].forEach((p,i)=>{const w=historicOSPoint(...p);if(w[0]>82&&w[0]<182&&w[1]>-150&&w[1]<-75)c.fillText(i,...at(w));});
 c.fillStyle='#111';c.font='bold 16px Arial';
 for(const [text,p] of [['Grafton',[62,-165]],['Tower',[144,-54]],['Farndon',[170,-161]],['Witby',[110,-215]],['Irby/Ashley',[228,-118]],['Target?',[132,-108]]])c.fillText(text,...at(p));
});
await page.locator('#siteDiagnostic').screenshot({path:'Browser/artifacts/hale-site-before.png'});
await browser.close();
