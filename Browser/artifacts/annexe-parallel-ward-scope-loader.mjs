// Isolate the road revision from simultaneous Leighton/Newton glazing work.
// This changes only the module loaded by the verification process, never files.
import {execFileSync} from 'node:child_process';
import {registerHooks} from 'node:module';
const source=execFileSync('git',['show','HEAD:Browser/dist/annexe-leighton-newton.mjs'],{encoding:'utf8',windowsHide:true});
registerHooks({load(url,context,next){if(url.endsWith('/dist/annexe-leighton-newton.mjs'))return {format:'module',source,shortCircuit:true};return next(url,context);}});
