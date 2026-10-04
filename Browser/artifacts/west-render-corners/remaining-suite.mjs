import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const out=new URL('./',import.meta.url),root=new URL('../../',import.meta.url);
const commands=JSON.parse(await readFile(new URL('package.json',root),'utf8')).scripts.test.split(' && ');
const start=commands.indexOf('node test-jarman.mjs');if(start<0)throw Error('Missing suite checkpoint');
const results=[];
for(const command of commands.slice(start+1)){
 const [program,...args]=command.split(' ');if(program!=='node')throw Error('Unexpected suite command: '+command);
 let status=0,output='';
 try{output=execFileSync(process.execPath,args,{cwd:root,windowsHide:true,encoding:'utf8',maxBuffer:16*1024*1024});}
 catch(error){status=error.status??1;output=String(error.stdout??'')+String(error.stderr??'');}
 await writeFile(new URL(args[0]+'.txt',out),output);
 results.push({command,status});await writeFile(new URL('remaining-suite.json',out),JSON.stringify(results,null,2)+'\n');
 console.log((status?'FAIL':'PASS')+': '+command);
}
console.log('Completed '+results.length+' remaining suite commands; failures: '+results.filter(r=>r.status).map(r=>r.command).join(', '));
process.exitCode=results.some(r=>r.status)?1:0;
