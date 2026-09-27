import {execFileSync} from 'node:child_process';
export async function load(url,context,nextLoad){
  const file=['escape-exterior.mjs','entrance-walks.mjs'].find(file=>url.endsWith('/dist/'+file));
  if(file)return {format:'module',shortCircuit:true,source:execFileSync('git',['show','HEAD:Browser/dist/'+file],{encoding:'utf8',windowsHide:true})};
  return nextLoad(url,context);
}
