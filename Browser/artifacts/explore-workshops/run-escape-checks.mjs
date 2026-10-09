import {readFile,writeFile,unlink} from 'node:fs/promises';
const root=new URL('../../',import.meta.url);
// Keep this task's receipts separate from existing screenshot files that were
// unavailable for writing. Both tests retain their hardware launcher.
for(const [file,folder] of [['test-workshop-door-animation-browser.mjs','workshop-door-animation'],['test-escape-corridors-browser.mjs','corridor-network']]){
 const target=new URL('.explore-'+file,root);
 const source=(await readFile(new URL(file,root),'utf8')).replace('./artifacts/'+folder+'/', './artifacts/explore-workshops/'+folder+'/');
 await writeFile(target,source);
 try{await import(target.href);}finally{await unlink(target);}
}
