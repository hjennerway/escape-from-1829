import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const sources=JSON.parse(readFileSync(new URL('before-sources.json',import.meta.url),'utf8'));
// This file was clean at the start, before the separate inside-corner revision.
sources['front-inside-corners.mjs']=execFileSync('git',['show','HEAD:Browser/dist/front-inside-corners.mjs'],{cwd:new URL('../../../',import.meta.url),encoding:'utf8',windowsHide:true});
registerHooks({load(url,context,next){const name=url.split('/').pop();return sources[name]?{format:'module',source:sources[name],shortCircuit:true}:next(url,context);}});
