// Check the original non-Larkton fingerprint while normalizing only the
// separately requested concurrent entrance-depth edit, without changing files.
import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){const result=next(url,context);if(url.endsWith('/dist/annexe.mjs'))return {...result,source:String(result.source).replace("{name:'Entrance range',rect:[-9,10,9,21]","{name:'Entrance range',rect:[-9,10,9,15]")};return result;}});
