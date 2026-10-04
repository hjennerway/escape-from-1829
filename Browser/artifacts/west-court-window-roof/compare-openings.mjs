import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
if(process.argv.includes('--snapshot')){
  const THREE=await import('../../dist/vendor/three.module.js');
  const {createEscapeExterior}=await import('../../dist/escape-exterior.mjs');
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){}})})};
  const {model}=createEscapeExterior(THREE,4/3);
  console.log(JSON.stringify({court:model.userData.westCourtPhotoOpenings,garden:model.userData.westFrontPhotoOpenings}));
}else{
  const snapshot=before=>{
    const run=spawnSync(process.execPath,[...(before?['--import',new URL('baseline-loader.mjs',import.meta.url).href]:[]),fileURLToPath(import.meta.url),'--snapshot'],{encoding:'utf8',windowsHide:true});
    assert.equal(run.status,0,run.stderr);return JSON.parse(run.stdout);
  };
  const before=snapshot(true),after=snapshot(false);
  const unmarked=o=>(o.face!=='west-court-bay'||Math.abs(o.x+58.4)<.01)&&(o.face!=='west-court-recess'||o.y>10);
  assert.deepEqual(after.court.filter(unmarked),before.court.filter(unmarked),'Every unmarked court sash retains its exact dimensions and position');
  assert.deepEqual(after.garden,before.garden,'All garden-side openings are retained');
  assert.equal(after.court.length,before.court.length-2);
  const result={unmarkedCourtWindows:after.court.filter(unmarked).length,gardenOpenings:after.garden.length,beforeCourt:before.court.length,afterCourt:after.court.length};
  await writeFile(new URL('opening-preservation.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
  console.log('PASS: '+JSON.stringify(result));
}
