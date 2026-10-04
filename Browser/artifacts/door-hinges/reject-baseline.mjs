import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';

const baseline=readFileSync(new URL('doors-before.mjs',import.meta.url),'utf8')+
 '\nexport const ROOM_DOOR_FRAME_CASING_DEPTH=.054; export const ROOM_DOOR_HINGE_RADIUS=.0175;\n';
registerHooks({load(url,context,next){
 const result=next(url,context);
 return url.endsWith('/dist/asylum-doors.mjs')?{...result,source:baseline}:result;
}});
await import('../../test-asylum-room-doors.mjs');
