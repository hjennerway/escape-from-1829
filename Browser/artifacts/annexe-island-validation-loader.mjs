import {registerHooks} from 'node:module';
import {mkdirSync,readFileSync} from 'node:fs';
mkdirSync(new URL('annexe-island-validation/',import.meta.url),{recursive:true});
registerHooks({load(url,context,next){if(/\/test-(precompiled-models|timeline-browser)\.mjs$/.test(url))return {format:'module',source:readFileSync(new URL(url),'utf8').replaceAll('./artifacts/','./artifacts/annexe-island-validation/'),shortCircuit:true};return next(url,context);}});
