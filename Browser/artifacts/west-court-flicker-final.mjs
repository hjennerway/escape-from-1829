import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,openSync,closeSync} from 'node:fs';
import {modelSourceHash} from '../model-build-inputs.mjs';
const results=[],env={...process.env,MODEL_CHROME_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe'};
function run(name,args,cwd=new URL('../',import.meta.url)){
  const log=new URL('./west-court-flicker-final-'+name+'.log',import.meta.url),fd=openSync(log,'w');
  const r=spawnSync(process.execPath,args,{cwd,env,windowsHide:true,stdio:['ignore',fd,fd]});closeSync(fd);
  results.push({name,status:r.status,signal:r.signal});
  writeFileSync(new URL('./west-court-flicker-final-progress.json',import.meta.url),JSON.stringify(results,null,2));
  console.log(name+': '+r.status);return r.status;
}
let manifest=JSON.parse(readFileSync(new URL('../dist/compiled/manifest.json',import.meta.url)));
if(manifest.sourceHash!==await modelSourceHash())if(run('build',['build-models.mjs']))process.exit(1);
run('compiled',['test-precompiled-models.mjs']);
run('timeline',['test-timeline-browser.mjs']);
run('preview-source',['Browser/artifacts/west-court-flicker-preview.mjs','after'],new URL('../../',import.meta.url));
run('preview-compiled',['Browser/artifacts/west-court-flicker-preview.mjs','compiled'],new URL('../../',import.meta.url));
run('west-basement',['test-west-side-basement.mjs']);
run('baseline-jarman',['--import','./artifacts/west-court-flicker-before-loader.mjs','test-jarman.mjs']);
run('baseline-leighton',['--import','./artifacts/west-court-flicker-before-loader.mjs','test-leighton-newton.mjs']);
manifest=JSON.parse(readFileSync(new URL('../dist/compiled/manifest.json',import.meta.url)));
writeFileSync(new URL('./west-court-flicker-final.json',import.meta.url),JSON.stringify({results,modelCurrent:manifest.sourceHash===await modelSourceHash(),completed:new Date().toISOString()},null,2));
