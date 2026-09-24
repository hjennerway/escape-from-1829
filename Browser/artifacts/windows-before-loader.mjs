import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
registerHooks({load(url,context,next){if(url.endsWith('/dist/annexe-leighton-newton.mjs'))return {format:'module',source:execFileSync('git',['show','HEAD:Browser/dist/annexe-leighton-newton.mjs'],{encoding:'utf8',windowsHide:true}),shortCircuit:true};return next(url,context);}});
