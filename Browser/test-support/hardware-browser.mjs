import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {isSoftwareRenderer} from '../dist/tree-rendering.mjs';

// Check a fresh context before tests can mock renderer information. Refuse a
// software fallback instead of reporting its timings as GPU measurements.
export async function launchHardwareBrowser(options={}){
  const args=options.args??[];
  assert(!args.some(arg=>/swiftshader|--disable-gpu(?:=|$)|--use-gl=software|--use-angle=warp/i.test(arg)),
    'Browser tests require hardware acceleration; remove software-rendering flags.');
  // Hosted GitHub runners have no GPU. Their explicit CI mode preserves the
  // software-rendered scene checks; local runs always require real hardware.
  if(process.env.CI==='true'&&process.env.BROWSER_CI_SOFTWARE==='1'){
    console.log('CI rendering: explicitly configured SwiftShader (no hardware GPU).');
    return chromium.launch({headless:true,...options,args:[...args,'--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  }
  const browser=await chromium.launch({
    headless:true,
    ...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{}),
    ...options,
    args:[...args,'--enable-gpu','--disable-software-rasterizer']
  });
  try{
    const page=await browser.newPage();
    const renderer=await page.evaluate(()=>{
      const canvas=document.createElement('canvas');canvas.width=canvas.height=16;
      const gl=canvas.getContext('webgl2')??canvas.getContext('webgl');
      if(!gl)return null;
      const info=gl.getExtension('WEBGL_debug_renderer_info');
      if(!info)return null;
      const name=gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return name;
    });
    assert(renderer&&!isSoftwareRenderer({getExtension:()=>null,getParameter:()=>renderer}),
      `Hardware GPU acceleration unavailable or unverified (${renderer??'no renderer information'}). Browser tests stopped.`);
    console.log('Hardware GPU: '+renderer);
    await page.close();
    return browser;
  }catch(error){
    await browser.close();
    throw error;
  }
}

export const browserUsesHardware=!(process.env.CI==='true'&&process.env.BROWSER_CI_SOFTWARE==='1');
