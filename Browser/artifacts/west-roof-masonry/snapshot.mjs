import {cp,mkdir,readdir,copyFile,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {modelSourceHash} from '../../model-build-inputs.mjs';
const live=new URL('../../',import.meta.url),target=new URL('validation-project/Browser/',import.meta.url);
await mkdir(target,{recursive:true});let matched=false;
for(let attempt=0;attempt<3;attempt++){
 const before=await modelSourceHash();
 await cp(new URL('dist/',live),new URL('dist/',target),{recursive:true,filter:path=>!path.replaceAll('\\','/').includes('/dist/compiled')});
 for(const item of await readdir(live,{withFileTypes:true}))if(item.isFile()&&item.name.endsWith('.mjs'))await copyFile(new URL(item.name,live),new URL(item.name,target));
 const {modelSourceHash:snapshotHash}=await import(new URL('model-build-inputs.mjs',target));
 const captured=await snapshotHash(),after=await modelSourceHash();
 if(before===captured&&captured===after){
  await writeFile(new URL('snapshot.json',import.meta.url),JSON.stringify({sourceHash:captured,capturedAt:new Date().toISOString(),attempt},null,2)+'\n');matched=true;break;
 }
}
if(!matched)throw Error('Shared source kept changing while capturing validation project');
console.log('Captured a consistent model source snapshot.');
