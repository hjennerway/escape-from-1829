import {execFileSync} from 'node:child_process';
export async function load(url,context,nextLoad){
 if(url.endsWith('/dist/irby-ashley.mjs'))return {format:'module',shortCircuit:true,source:execFileSync('git',['show','HEAD:Browser/dist/irby-ashley.mjs'],{encoding:'utf8'})};
 return nextLoad(url,context);
}
