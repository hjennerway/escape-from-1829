import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const root=new URL('../../',import.meta.url),out=new URL('./suite/',import.meta.url);await mkdir(out,{recursive:true});
const pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8')),commands=pkg.scripts.test.split(' && '),results=[];
const start=commands.findIndex(c=>c==='node test-escape-exterior.mjs');let next=start;
async function worker(){
 while(next<commands.length){
  const index=next++,command=commands[index],args=command.split(' ').slice(1),name=args[0].replace('.mjs','');
  const run=async(original=false)=>{
   const env={...process.env,...(original?{ORIGINAL_DETAIL:'all'}:{})};
   const child=spawn(process.execPath,original?['--import','./artifacts/render-cleanup/original-loader.mjs',...args]:args,{cwd:root,env,windowsHide:true,stdio:'pipe'});
   let output='';child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
   const timer=setTimeout(()=>child.kill(),240000);
   const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve);});clearTimeout(timer);
   await writeFile(new URL(name+(original?'-original':'')+'.log',out),output);return {code,output};
  };
  const result=await run(),baseline=result.code===0?null:await run(true);
  const record={index,command,code:result.code,baselineCode:baseline?.code,message:result.output.match(/AssertionError[^\n]*|Error:[^\n]*/)?.[0]};results.push(record);
  console.log((result.code===0?'PASS':'FAIL')+' '+name+(baseline?' (original sources: '+baseline.code+')':''));
 }
}
await Promise.all([worker(),worker()]);results.sort((a,b)=>a.index-b.index);await writeFile(new URL('remaining-results.json',import.meta.url),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify({checks:results.length,passed:results.filter(r=>r.code===0).length,failed:results.filter(r=>r.code!==0)},null,2));
