import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {launchHardwareBrowser,browserUsesHardware} from './test-support/hardware-browser.mjs';

assert(browserUsesHardware,'The GPU smoke test requires hardware mode, including in CI.');

for(const name of await readdir(new URL('.',import.meta.url))){
  if(!/^(?:test-|check-|capture-|benchmark-).*\.mjs$/.test(name))continue;
  const source=await readFile(new URL(name,import.meta.url),'utf8');
  assert(!/chromium\.launch\(/.test(source),name+' must use the verified hardware launcher');
}
for(const flag of ['--disable-gpu','--use-angle=swiftshader','--use-angle=warp']){
  await assert.rejects(launchHardwareBrowser({args:[flag]}),/require hardware acceleration/);
}
const browser=await launchHardwareBrowser();
try{
  const page=await browser.newPage();
  const pixel=await page.evaluate(()=>{
    const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl2');
    gl.clearColor(.25,.5,.75,1);gl.clear(gl.COLOR_BUFFER_BIT);
    const pixel=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);
    return [...pixel];
  });
  assert(pixel.every((value,index)=>Math.abs(value-[64,128,191,255][index])<=1),'WebGL must render and read back the expected pixel');
  console.log('PASS: browser test launchers require hardware; software flags rejected; verified GPU renders correctly.');
}finally{await browser.close();}
