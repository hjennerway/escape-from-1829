import {execFileSync} from 'node:child_process';
export async function load(url,context,nextLoad){
 const file=['irby-ashley.mjs','estates-service-court.mjs'].find(name=>url.endsWith('/dist/'+name));
 if(file)return {format:'module',shortCircuit:true,source:execFileSync('git',['show','HEAD:Browser/dist/'+file],{encoding:'utf8'})};
 return nextLoad(url,context);
}
