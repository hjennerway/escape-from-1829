import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const files=new Set(['admin-pine-trees.mjs','front-lawn-trees.mjs','aerial-layouts.mjs']);
registerHooks({load(url,context,nextLoad){
  const file=new URL(url).pathname.split('/').at(-1);
  if(url.includes('/Browser/dist/')&&files.has(file))return {format:'module',shortCircuit:true,source:execFileSync('git',['show','82e6094:Browser/dist/'+file],{encoding:'utf8'})};
  return nextLoad(url,context);
}});
