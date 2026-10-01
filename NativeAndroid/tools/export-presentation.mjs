// Bake the browser's actual Arial / Georgia glyphs as artwork, without shipping
// operating-system font programs or relying on fonts installed on Android.
import {chromium} from '../../Browser/node_modules/playwright/index.mjs';
import {copyFile,mkdir,readFile,writeFile} from 'node:fs/promises';
const output=new URL('../Unity/Assets/NativePrototype/Presentation/',import.meta.url);
await mkdir(output,{recursive:true});
const manifest=await readFile(new URL('../Unity/Assets/NativePrototype/Generated/manifest.json',import.meta.url),'utf8');
const chars=[...new Set([...Array.from({length:224},(_,i)=>String.fromCharCode(i+32)).join(''),...manifest,...'‹›−→↗✓●○–—‘’“”•…'])].filter(c=>c.codePointAt(0)>=32);
const browser=await chromium.launch({headless:true,executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();
 const lightingSource=await readFile(new URL('../../Browser/dist/day-night.mjs',import.meta.url),'utf8');
 const icons=[...lightingSource.matchAll(/^\s+(day|dusk|night):'([^']+)'/gm)].map(([,mode,paths])=>({mode,paths}));
 if(icons.map(icon=>icon.mode).join(',')!=='day,dusk,night')throw new Error('Browser lighting glyphs could not be read.');
 const iconPng=await page.evaluate(async icons=>{
  const canvas=document.createElement('canvas');canvas.width=288;canvas.height=96;const ctx=canvas.getContext('2d');
  for(const [i,{paths}] of icons.entries()){
   const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
   const image=new Image();image.src='data:image/svg+xml,'+encodeURIComponent(svg);await image.decode();ctx.drawImage(image,i*96,0);
  }
  return canvas.toDataURL('image/png').split(',')[1];
 },icons);
 await writeFile(new URL('lighting-icons.png',output),Buffer.from(iconPng,'base64'));
 await writeFile(new URL('lighting-icons.json',output),JSON.stringify({width:288,height:96,icons}));
 const aerialSource=await readFile(new URL('../../Browser/dist/aerial.html',import.meta.url),'utf8');
 const locationSvg=aerialSource.match(/<svg viewBox="0 0 24 24" aria-hidden="true">([\s\S]*?)<\/svg>/)?.[1];
 if(!locationSvg)throw new Error('Browser location crosshair could not be read.');
 const locationPng=await page.evaluate(async paths=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=96;const ctx=canvas.getContext('2d');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round">${paths}</svg>`;
  const image=new Image();image.src='data:image/svg+xml,'+encodeURIComponent(svg);await image.decode();ctx.drawImage(image,0,0);
  return canvas.toDataURL('image/png').split(',')[1];
 },locationSvg);
 await writeFile(new URL('location-icon.png',output),Buffer.from(locationPng,'base64'));
 await writeFile(new URL('location-icon.json',output),JSON.stringify({width:96,height:96,paths:locationSvg}));
 await copyFile(new URL('../../Browser/dist/vendor/LUCIDE-LICENSE.txt',import.meta.url),new URL('../Unity/Assets/StreamingAssets/Licenses/LUCIDE-LICENSE.txt',import.meta.url));
 console.log('Baked shared browser sun, sunset and moon glyphs');
 for(const [name,family,weight,style] of [['arial','Arial','normal','normal'],['arial-bold','Arial','bold','normal'],['georgia','Georgia','normal','normal'],['georgia-italic','Georgia','normal','italic']]){
  const result=await page.evaluate(({chars,family,weight,style})=>{
   const size=family==='Georgia'&&style==='normal'?160:80,cell=Math.ceil(size*1.4),columns=16,canvas=document.createElement('canvas');canvas.width=columns*cell;canvas.height=Math.ceil(chars.length/columns)*cell;
   const ctx=canvas.getContext('2d');ctx.font=`${style} ${weight} ${size}px ${family}`;ctx.fillStyle='white';ctx.textBaseline='alphabetic';
   const glyphs=chars.map((char,i)=>{
    const m=ctx.measureText(char),x=i%columns*cell+size*.15,y=Math.floor(i/columns)*cell+size*1.075;
    ctx.fillText(char,x,y);
    const left=Math.floor(-m.actualBoundingBoxLeft)-2,right=Math.ceil(m.actualBoundingBoxRight)+2,top=Math.ceil(m.actualBoundingBoxAscent)+2,bottom=Math.ceil(m.actualBoundingBoxDescent)+2;
    return {index:char.codePointAt(0),advance:Math.round(m.width),minX:left,maxX:right,minY:-bottom,maxY:top,x:x+left,y:y-top,width:right-left,height:top+bottom};
   });
   return {size,width:canvas.width,height:canvas.height,ascent:ctx.measureText('Hg').fontBoundingBoxAscent,descent:ctx.measureText('Hg').fontBoundingBoxDescent,glyphs,png:canvas.toDataURL('image/png').split(',')[1]};
  },{chars,family,weight,style});
  await writeFile(new URL(name+'.png',output),Buffer.from(result.png,'base64'));delete result.png;
  await writeFile(new URL(name+'.json',output),JSON.stringify(result));
  console.log(`Baked ${family} ${weight} ${style}: ${result.glyphs.length} glyphs`);
 }
}finally{await browser.close();}
