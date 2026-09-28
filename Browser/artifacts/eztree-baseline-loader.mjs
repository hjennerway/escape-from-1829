import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const source=execFileSync('git',['show','HEAD:Browser/dist/front-lawn-trees.mjs'],{encoding:'utf8',windowsHide:true});
registerHooks({load(url,context,nextLoad){const result=nextLoad(url,context);return url.endsWith('/dist/front-lawn-trees.mjs')?{...result,source}:result;}});
