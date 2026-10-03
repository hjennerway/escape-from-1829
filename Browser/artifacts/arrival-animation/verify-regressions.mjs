import assert from 'node:assert/strict';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';

const test=(await readFile(new URL('../../test-game.mjs',import.meta.url),'utf8')).replaceAll("'./dist/","'../../dist/");
const read="(await readFile(new URL('../../dist/game.mjs',import.meta.url),'utf8'))";
const result=[];
for(const [name,mutation,expected] of [
 ['preparation',".replace(' clock.reset();','')",'Preparation cannot consume any of the one-second hold'],
 ['render-stall',".replace('arrivalCutscene.update(Math.min(frameDt,.25))','arrivalCutscene.update(frameDt)')",'play']
]){
 const file=new URL(`without-${name}.mjs`,import.meta.url);
 try{
  await writeFile(file,test.replace(read,read+mutation));
  const run=spawnSync(process.execPath,[file.pathname.replace(/^\/(\w:)/,'$1')],{encoding:'utf8',windowsHide:true});
  assert.notEqual(run.status,0,name+' regression must be rejected');
  assert(run.stderr.includes(expected),name+' must fail on arrival timing: '+run.stderr);
  result.push({name,exitCode:run.status,error:run.stderr});
 }finally{await unlink(file).catch(()=>{});}
}
await writeFile(new URL('regressions.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log('PASS: removing either the preparation reset or the render-stall protection fails the arrival regressions.');
