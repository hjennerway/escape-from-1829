import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const names=['annexe-front-roads','annexe-loop-road','annexe-photo-placement','annexe-road-trees','historic-road-layout','irby-junction-rounding'];
const originals=new Map(names.map(n=>[n+'.mjs',execFileSync('git',['show','HEAD:Browser/dist/'+n+'.mjs'],{encoding:'utf8',windowsHide:true})]));
registerHooks({load(url,context,next){const name=url.split('/').at(-1);if(url.includes('/dist/')&&originals.has(name))return {format:'module',source:originals.get(name),shortCircuit:true};return next(url,context);}});
