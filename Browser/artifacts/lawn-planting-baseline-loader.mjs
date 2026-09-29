import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const originals=new Map(['escape-exterior.mjs','front-lawn-trees.mjs','front-lawn-eztree.mjs','front-lawn-wind.mjs'].map(name=>[
  name,execFileSync('git',['show','HEAD:Browser/dist/'+name],{encoding:'utf8',windowsHide:true})
]));
registerHooks({load(url,context,nextLoad){
  const result=nextLoad(url,context),source=originals.get(url.split('/').at(-1));
  return source&&url.includes('/dist/')?{...result,source}:result;
}});
