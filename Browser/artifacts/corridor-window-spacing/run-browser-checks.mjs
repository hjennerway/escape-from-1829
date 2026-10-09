import {readFile,writeFile,rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// Run the existing browser assertions with isolated screenshot destinations,
// avoiding locked previews of earlier tasks' captures on Windows.
const root=new URL('../../',import.meta.url),temporary=new URL('.corridor-window-spacing-check.mjs',root);
const checks=[
 ['test-escape-corridors-browser.mjs',[],"'./artifacts/corridor-network/'","'./artifacts/corridor-window-spacing/network/'"],
 ['test-escape-corridor-finishes-browser.mjs',[],"'./artifacts/corridor-repairs/finishes/'","'./artifacts/corridor-window-spacing/finishes/'"],
 ['test-explore-workshops-browser.mjs',[], './artifacts/corridor-door-access/${mode}/','./artifacts/corridor-window-spacing/explore/${mode}/'],
 ['test-explore-workshops-browser.mjs',['--compiled'], './artifacts/corridor-door-access/${mode}/','./artifacts/corridor-window-spacing/explore/${mode}/']
];
try{
 for(const [name,args,from,to] of checks){
  const source=await readFile(new URL(name,root),'utf8');
  if(!source.includes(from))throw Error('Missing artifact path in '+name);
  await writeFile(temporary,source.replace(from,to));
  console.log('Running '+name+' '+args.join(' '));
  const code=await new Promise((resolve,reject)=>{
   const child=spawn(process.execPath,[fileURLToPath(temporary),...args],{cwd:root,windowsHide:true,stdio:'inherit'});child.once('error',reject);child.once('exit',resolve);
  });
  if(code!==0)throw Error(name+' '+args.join(' ')+' failed with exit '+code);
 }
}finally{await rm(temporary,{force:true});}
