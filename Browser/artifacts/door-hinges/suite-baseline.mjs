import {registerHooks} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';

const replacements=new Map([
 ['asylum-doors.mjs',readFileSync(new URL('doors-before.mjs',import.meta.url),'utf8')+'\nexport const ROOM_DOOR_FRAME_CASING_DEPTH=.054; export const ROOM_DOOR_HINGE_RADIUS=.0175;\n'],
 ['asylum-architecture.mjs',readFileSync(new URL('architecture-before.mjs',import.meta.url),'utf8')]
]),loaded=new Set();
registerHooks({load(url,context,next){
 const result=next(url,context);loaded.add(url);
 const replacement=[...replacements].find(([name])=>url.endsWith('/dist/'+name));
 return replacement?{...result,source:replacement[1]}:result;
}});
let failure;
try{await import('../../test-jarman.mjs');}catch(error){failure={message:error.message,actual:error.actual,expected:error.expected};}
const result={failure,loadedCount:loaded.size,changedInteriorLoaded:[...loaded].filter(url=>[...replacements.keys()].some(name=>url.endsWith('/dist/'+name))),modules:[...loaded].sort()};
writeFileSync(new URL('suite-baseline.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({failure,loadedCount:result.loadedCount,changedInteriorLoaded:result.changedInteriorLoaded},null,2));
process.exitCode=failure?1:0;
