// Isolate the unrelated corridor-header regression from runtime lock geometry.
import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 if(url.endsWith('/dist/door-lock.mjs'))return {format:'module',shortCircuit:true,source:'export function createDoorLockFactory(THREE){return parent=>{const group=new THREE.Group();parent.add(group);return group;};}'};
 return next(url,context);
}});
