import {execFileSync} from 'node:child_process';
const original=execFileSync('git',['show','HEAD:Browser/dist/front-basement.mjs'],{encoding:'utf8',windowsHide:true});
export async function load(url,context,nextLoad){
 const result=await nextLoad(url,context);
 if(url.endsWith('/dist/front-basement.mjs'))return {...result,source:original};
 return result;
}
