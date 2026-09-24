import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
const names=['annexe-loop-road','annexe-front-roads','irby-junction-rounding','historic-road-layout'];
registerHooks({load(url,context,next){const name=url.split('/').at(-1)?.replace('.mjs','');if(url.includes('/dist/')&&names.includes(name))return {format:'module',source:readFileSync(new URL(`annexe-island-before-${name}.txt`,import.meta.url),'utf8'),shortCircuit:true};return next(url,context);}});
