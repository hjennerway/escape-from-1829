import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';

const server=spawn(process.execPath,['serve.mjs'],{cwd:new URL('.',import.meta.url),windowsHide:true,env:{...process.env,PORT:'0'},stdio:'pipe'});
const base=await new Promise((resolve,reject)=>{server.stdout.once('data',data=>resolve(String(data).match(/http:\/\/127\.0\.0\.1:\d+/)[0]));server.once('error',reject);});
const artifacts=new URL('./artifacts/',import.meta.url);await mkdir(artifacts,{recursive:true});
let browser;
try{
  browser=await launchHardwareBrowser({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{})});
  for(const [mode,width,height,reducedMotion,early] of [['explore',1280,800,'no-preference',false],['aerial',390,844,'no-preference',false],['explore',390,844,'reduce',true]]){
    const page=await browser.newPage({viewport:{width,height},isMobile:width<500,hasTouch:width<500,reducedMotion});page.setDefaultTimeout(120000);
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.route(/https:\/\/(www\.whateversleft\.co\.uk|basedinchurton\.co\.uk)\//,route=>route.abort());
    // Observe rendered frames without changing production timing. Pause at the
    // middle of the flight only long enough to save a repeatable visual check.
    const source=await readFile(new URL('./dist/intro-navigation.mjs',import.meta.url),'utf8');
    await page.route('**/intro-navigation.mjs',route=>route.fulfill({contentType:'text/javascript',body:source
      .replace('let elapsed=0,active=true;','let elapsed=0,active=true;window.__travel={camera,frames:[],end:end.position.toArray()};')
      .replace('elapsed+=Math.min',"if(window.__holdIntro)return;elapsed+=Math.min")
      .replace('sample(t);if(t===1)',"sample(t);window.__travel.frames.push({t,position:camera.position.toArray()});if(t>.4&&t<.6&&!window.__capturedMiddle)window.__holdIntro=true;if(t===1)")}));
    if(early){
      await page.route('**/game.mjs',route=>route.fulfill({contentType:'text/javascript',body:''}));
      await page.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Storage unavailable','SecurityError');};});
    }
    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    if(!early)await page.waitForFunction(()=>document.querySelector('#game').classList.contains('scene-ready'));
    // Delay scene imports on the destination, proving that the previous image
    // covers real loading time instead of merely fading a ready canvas.
    let release;const held=new Promise(resolve=>{release=resolve;});
    await page.route('**/'+(mode==='explore'?'explore.mjs':'aerial-scene.mjs'),async route=>{await held;await route.continue();});
    await page.locator('#'+(mode==='explore'?'explore':'aerial')).click({noWaitAfter:true});
    await page.waitForURL('**/'+mode+'.html*',{waitUntil:'commit'});
    await page.waitForFunction(()=>document.querySelector('#introStill')?.naturalWidth>0);
    assert(await page.locator('#introTransition').isVisible());
    if(!early)assert((await page.locator('#introStill').getAttribute('src')).startsWith('data:image/jpeg'));
    assert.equal(await page.evaluate(()=>location.search),'','Intro marker is consumed, so reload does not replay');
    await page.screenshot({path:fileURLToPath(new URL('intro-'+mode+'-'+width+'-loading.jpg',artifacts)),type:'jpeg'});
    release();
    if(reducedMotion!=='reduce'){
      await page.waitForFunction(()=>window.__holdIntro);
      await page.screenshot({path:fileURLToPath(new URL('intro-'+mode+'-'+width+'-moving.jpg',artifacts)),type:'jpeg'});
      const before=await page.evaluate(()=>window.__travel.camera.position.toArray());
      await page.keyboard.press('KeyW');
      assert.deepEqual(await page.evaluate(()=>window.__travel.camera.position.toArray()),before,'Movement input cannot interrupt the flight');
      await page.evaluate(()=>{window.__capturedMiddle=true;window.__holdIntro=false;});
    }
    await page.waitForFunction(()=>!document.body.classList.contains('intro-arriving'));
    const travel=await page.evaluate(()=>({frames:window.__travel.frames,end:window.__travel.end,position:window.__travel.camera.position.toArray()}));
    assert(travel.frames.length>0);assert(travel.position.every((v,i)=>Math.abs(v-travel.end[i])<1e-8));
    if(reducedMotion==='reduce')assert(travel.frames.every(frame=>frame.t===1));
    else assert(travel.frames.some(frame=>frame.t>0&&frame.t<1),'Real intermediate camera frames are rendered');
    await page.screenshot({path:fileURLToPath(new URL('intro-'+mode+'-'+width+'-ready.jpg',artifacts)),type:'jpeg'});
    assert.deepEqual(errors,[]);
    console.log('PASS: '+mode+' '+width+'px '+reducedMotion+(early?' early click with unavailable storage':' live title capture')+', loading still, camera travel and endpoint.');
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('#introTransition').count(),0,'Normal reload does not replay the intro');
    await page.close();
  }
}finally{await browser?.close();server.kill();}
