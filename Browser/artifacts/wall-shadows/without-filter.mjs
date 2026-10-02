import {registerHooks} from 'node:module';
// Diagnose existing model snapshot failures with this task's shader fix disabled.
registerHooks({load(url,context,next){const result=next(url,context);if(url.endsWith('/dist/exterior-shadows.mjs'))return {...result,source:String(result.source).replace('export function installExteriorShadowFiltering(THREE){','export function installExteriorShadowFiltering(THREE){ return;')};return result;}});
