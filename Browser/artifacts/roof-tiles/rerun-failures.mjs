import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const mode=process.argv[2]??'baseline',cwd=new URL('../../',import.meta.url),out=new URL('./',import.meta.url);
const failures=JSON.parse(await readFile(new URL('remaining-suite.json',out),'utf8')).filter(r=>r.code!==0&&
 (!process.argv[3]||r.command==='node '+process.argv[3])),results=[];
const captures=new URL('snapshot-errors/',out);await mkdir(captures,{recursive:true});
for(const {command} of failures){
 const env={...process.env};
 if(mode==='baseline')env.NODE_OPTIONS=(env.NODE_OPTIONS??'')+' --import '+new URL('baseline-import.mjs',out).href;
 if(mode==='capture'){
  env.NODE_OPTIONS=(env.NODE_OPTIONS??'')+' --import '+new URL('capture-snapshot-errors.mjs',out).href;
  env.ROOF_TILE_CAPTURE_DIR=fileURLToPath(captures);
 }
 const result=await new Promise(resolve=>{
  const child=spawn(process.execPath,command.split(' ').slice(1),{cwd,env,windowsHide:true,stdio:'pipe'});let output='';
  child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
  child.on('error',error=>resolve({command,code:-1,output:String(error)}));
  child.on('exit',code=>resolve({command,code,output}));
 });
 results.push(result);console.log((result.code===0?'PASS: ':'FAIL: ')+command);
 await writeFile(new URL(mode+'-snapshot-tests.json',out),JSON.stringify(results,null,2)+'\n');
}
console.log(JSON.stringify({mode,passed:results.filter(r=>r.code===0).length,failed:results.filter(r=>r.code!==0).map(r=>r.command)}));
