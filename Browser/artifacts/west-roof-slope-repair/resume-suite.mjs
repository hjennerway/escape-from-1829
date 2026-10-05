import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const out=new URL('./',import.meta.url),cwd=new URL('../../',import.meta.url);
const report=JSON.parse(await readFile(new URL('suite-continuation.json',out),'utf8'));
const packageJSON=JSON.parse(await readFile(new URL('package.json',cwd),'utf8'));
const commands=packageJSON.scripts.test.split(' && '),completed=new Set(report.results.map(r=>r.command));
const pending=commands.slice(report.prefixCommands).filter(c=>!completed.has(c));let saving=Promise.resolve();
async function worker(){
 while(pending.length){
  const command=pending.shift(),args=command.split(' ');if(args.shift()!=='node')throw Error('Unexpected command');
  const child=spawn(process.execPath,args,{cwd,windowsHide:true,stdio:['ignore','pipe','pipe']});let output='';
  child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
  const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
  await writeFile(new URL(args[0].replace('.mjs','.log'),out),output);
  report.results.push({command,code});if(code)console.log('FAIL: '+command);
  report.results.sort((a,b)=>commands.indexOf(a.command)-commands.indexOf(b.command));
  const text=JSON.stringify(report,null,2)+'\n';saving=saving.then(()=>writeFile(new URL('suite-continuation.json',out),text));await saving;
 }
}
await Promise.all(Array.from({length:4},worker));await saving;
console.log(JSON.stringify({total:commands.length,continuation:report.results.length,passed:report.results.filter(r=>!r.code).length,failed:report.results.filter(r=>r.code)}));
