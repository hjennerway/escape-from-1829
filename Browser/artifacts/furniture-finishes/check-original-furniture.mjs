// Diagnose the placement failure with the saved pre-edit materials, without
// replacing files in the shared working tree.
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
registerHooks({load(url,context,nextLoad){
 if(url.endsWith('/dist/medical-furniture-models.mjs'))return {format:'module',source:readFileSync(new URL('medical-furniture-models-before.mjs',import.meta.url),'utf8'),shortCircuit:true};
 return nextLoad(url,context);
}});
await import('../../test-asylum-furniture.mjs');
