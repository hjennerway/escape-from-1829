import assert from 'node:assert/strict';
import {readFile,writeFile,copyFile} from 'node:fs/promises';
const root=new URL('../../../',import.meta.url),out=new URL('./',import.meta.url);
async function edit(path,change){
  const file=new URL(path,root),before=await readFile(file,'utf8'),after=change(before);
  assert.notEqual(after,before,'Expected edit in '+path);
  await writeFile(new URL('before-'+path.replaceAll('/','_'),out),before);
  await writeFile(file,after);
}
await copyFile(new URL('west-garden-stair.mjs',out),new URL('Browser/dist/west-garden-stair.mjs',root));
await edit('Browser/dist/west-front-photo-detail.mjs',source=>{
  assert(source.includes("const stair=new THREE.Group();stair.name='West front iron return stair';"));
  source=source.replace("import {addExteriorStairRail} from './exterior-stair-rail.mjs';","import {addWestGardenStair} from './west-garden-stair.mjs';");
  source=source.replace('  // Turn the whole escape onto the inner return of the extended outer arm.\n  // The original doors, treads and rails share one transform into the recess.','  // Retain the low sash on the inner return; the photographed landing doors\n  // now face the garden from the recessed wall behind the stairs.');
  source=source.replace(/  for\(const \[x,y\] of \[\[-58\.6,4\.25\],\[-58,8\.5\]\]\).*\r?\n/,'');
  return source.replace(/  const stair=new THREE.Group\(\);stair.name='West front iron return stair';[\s\S]*?(?=  \/\/ Lower forward range:)/,"  addWestGardenStair(THREE,{model,iron,door});\n\n");
});
for(const path of ['Browser/dist/asylum-plan.json','Research/1829-interior-proposal/plan-data.json'])await edit(path,source=>{
  const plan=JSON.parse(source),exit=plan.exits.find(e=>e.id==='F4');
  exit.levels[0].destination=[-63,4.25,14.3];
  exit.description='E → the uniform-width wall-side walkway to the middle iron stair landing. Both exterior doors face the recessed garden wall behind the stairs; the interior anchor is retained. The additional 8.5-high door belongs to a third storey outside this two-floor proposal.';
  plan.outsideStairs.find(e=>e.id==='F4').points=[[-63,14.3],[-63,20],[-60.3,20],[-60.3,14.8]];
  return JSON.stringify(plan)+'\n';
});
await edit('Browser/test-asylum-outside.mjs',source=>{
  source=source.replace("import {WEST_FRONT_E_PLAN} from './dist/west-front-photo-detail.mjs';","import {WEST_GARDEN_STAIR as s} from './dist/west-garden-stair.mjs';");
  return source.replace(/ \['F4',\[\[-63\.55,26\.05\].*\n/," ['F4',[[s.walkwayX,s.turnZ+s.width/2],[s.lowerX,s.turnZ+s.width/2],[s.lowerX,s.groundZ]]],\n");
});
await edit('Browser/test-exterior-stair-rails.mjs',source=>{
  source=source.replace("import {WEST_FRONT_E_PLAN} from './dist/west-front-photo-detail.mjs';","import {WEST_GARDEN_STAIR as s} from './dist/west-garden-stair.mjs';");
  source=source.replace(/ \['West garden',\{x:-61\.3.*\n/," ['West garden',{x:s.lowerX,y:.3,z:s.groundZ},[[s.lowerX,s.turnZ+s.width/2],[s.upperX,s.turnZ+s.width/2],[s.upperX,s.upperZ],[s.upperX,s.upperZ-s.width],[s.walkwayX,s.upperZ-s.width],[s.doorX,s.doorZ+.73]],s.upperY],\n");
  source=source.replace('walker.clear(-62.1,26.65,4.3)','walker.clear(s.walkwayX,s.turnEndZ+.3,4.3)');
  source=source.replace('z:26.05+WEST_FRONT_E_PLAN.bayRoot-21','z:s.turnZ+s.width/2');
  return source.replace('actor.z<26.45+WEST_FRONT_E_PLAN.bayRoot-21','actor.z<s.turnEndZ-.2');
});
await edit('Browser/test-west-refinement.mjs',source=>source.replace("['F4',[-1,0,0]]","['F4',[0,0,-1]]"));
await copyFile(new URL('final-test.mjs',out),new URL('Browser/test-west-garden-stair.mjs',root));
await edit('Browser/package.json',source=>source.replace('node test-exterior-stair-rails.mjs && node test-exterior-stair-clearance.mjs','node test-exterior-stair-rails.mjs && node test-west-garden-stair.mjs && node test-exterior-stair-clearance.mjs'));
console.log('Applied prepared staircase source, arrival data and focused regressions.');
