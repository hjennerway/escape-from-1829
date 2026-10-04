import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require=createRequire('C:/Users/Harry/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const destination=new URL('./',import.meta.url);
const source=new URL('../../../Research/top-floor-layout-proposal/top-floor-plan.html',import.meta.url);
const fragment=await readFile(source,'utf8');
assert(!fragment.includes('\\n')&&!fragment.includes('\\"'),'Literal HTML markup');
const data=JSON.parse(fragment.match(/<script type="application\/json" class="plan-data">([\s\S]*?)<\/script>/)[1]);
const game=JSON.parse(await readFile(new URL('../../dist/asylum-plan.json',import.meta.url),'utf8'));
assert.deepEqual(data.outline,game.floors.find(f=>f.id===3).outline.loops[0]);
assert.deepEqual(data.stair,game.stairs.find(s=>s.id==='S1').points);
assert.deepEqual(data.windows,game.rooms.filter(r=>r.floors.includes(3)).flatMap(r=>r.windows));
assert.deepEqual(data.currentRooms.map(r=>r.points),game.rooms.filter(r=>r.floors.includes(3)).map(r=>r.points));
const distance=(w,a,b)=>{
  const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((w.x-a[0])*dx+(w.z-a[1])*dz)/(dx*dx+dz*dz)));
  return Math.hypot(w.x-a[0]-t*dx,w.z-a[1]-t*dz);
};
const distribution=data.proposedRooms.map(room=>data.windows.filter(w=>room.points.some((a,i)=>distance(w,a,room.points[(i+1)%room.points.length])<1e-8)).length);
assert.deepEqual(distribution,[2,1,2,0,0]);

const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[],captures=[];
try {
  const page=await browser.newPage({viewport:{width:800,height:1100}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(new URL('preview.html',destination).href);
  const root=page.frameLocator('iframe').locator('#top-floor-layout-proposal');
  await root.waitFor();
  await root.locator('svg [data-window]').first().waitFor({state:'attached'});
  for(const [width,theme,layout] of [[800,'light','proposed'],[800,'light','current'],[390,'light','proposed'],[320,'light','proposed'],[800,'dark','proposed'],[320,'dark','proposed']]) {
    await page.setViewportSize({width,height:1100});
    await page.emulateMedia({colorScheme:theme});
    await root.locator(`[data-layout="${layout}"]`).click();
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    assert.equal(await root.getAttribute('data-layout'),layout);
    assert.equal(await root.locator('svg [data-window]').count(),5);
    const metrics=await root.evaluate(el=>{
      const svg=el.querySelector('svg'),box=svg.getBoundingClientRect();
      const labels=[...svg.querySelectorAll('text')].map(t=>({text:t.textContent,box:t.getBoundingClientRect().toJSON()}));
      const collisions=[];
      for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++){
        const a=labels[i].box,b=labels[j].box;
        if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)collisions.push([labels[i].text,labels[j].text]);
      }
      return {rootWidth:el.clientWidth,scrollWidth:el.scrollWidth,svgWidth:box.width,collisions,clippedLabels:labels.filter(t=>t.box.left<box.left-1||t.box.right>box.right+1||t.box.top<box.top-1||t.box.bottom>box.bottom+1).map(t=>t.text)};
    });
    const name=`${layout}-${width}-${theme}`;
    await root.screenshot({path:fileURLToPath(new URL(name+'.png',destination))});
    assert(metrics.scrollWidth<=metrics.rootWidth+1,`Horizontal overflow at ${width}`);
    assert.deepEqual(metrics.collisions,[],`Label overlap at ${width}`);
    assert.deepEqual(metrics.clippedLabels,[],`Clipped labels at ${width}`);
    captures.push({name,...metrics});
  }
  assert.deepEqual(errors,[]);
  await writeFile(new URL('validation.json',destination),JSON.stringify({retained:{outline:true,stair:true,windows:5,currentRooms:true},proposedWindowDistribution:distribution,captures,errors},null,2)+'\n');
  console.log('PASS: retained footprint, stair and five complete window records; 2–1–2 room distribution; current/proposed switching; six desktop/phone/light/dark captures; no overflow, overlapping labels or page errors.');
} finally {await browser.close();}
