import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const original=execFileSync('git',['show','HEAD:Browser/dist/window-lights.mjs'],{encoding:'utf8',windowsHide:true});
registerHooks({load(url,context,next){if(url.endsWith('/dist/window-lights.mjs'))return {format:'module',source:original,shortCircuit:true};return next(url,context);}});
