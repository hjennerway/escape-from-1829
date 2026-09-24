import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const original=execFileSync('git',['show','HEAD:Browser/dist/annexe-outer-front.mjs'],{encoding:'utf8',windowsHide:true});
registerHooks({load(url,ctx,next){return url.endsWith('/annexe-outer-front.mjs')?{format:'module',source:original,shortCircuit:true}:next(url,ctx);}});
