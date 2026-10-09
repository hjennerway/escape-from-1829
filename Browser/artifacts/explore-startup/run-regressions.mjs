// Preserve previous tasks' review captures while running the existing checks.
import {readFile,writeFile,unlink,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=new URL('../../',import.meta.url);
for(const name of process.argv.slice(2)){
 const source=await readFile(new URL(name+'.mjs',root),'utf8');
 const temporary=new URL('.explore-startup-'+name+'.mjs',root);
 const captureRoot='./artifacts/explore-startup/regressions/';
 await mkdir(new URL(captureRoot,root),{recursive:true});
 await writeFile(temporary,source.replaceAll("'./artifacts/","'"+captureRoot));
 try{
  let log='';const child=spawn(process.execPath,[fileURLToPath(temporary)],{cwd:root,windowsHide:true,stdio:'pipe',env:process.env});
  for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{log+=data;process.stdout.write(data);});
  const code=await new Promise((resolve,reject)=>{child.once('exit',resolve);child.once('error',reject);});
  await writeFile(new URL(name+'.log',import.meta.url),log);
  if(code){process.exitCode=code;break;}
 }finally{await unlink(temporary);}
}
