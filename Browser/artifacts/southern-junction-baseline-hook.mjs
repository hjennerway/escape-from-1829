import {registerHooks} from 'node:module';
// Exclude this task's only new scene geometry without editing the shared files.
registerHooks({load(url,context,nextLoad){
 if(url.endsWith('/southern-drive-junction.mjs'))return {format:'module',source:'export const SOUTHERN_DRIVE_JUNCTION=Object.freeze([]);',shortCircuit:true};
 return nextLoad(url,context);
}});
