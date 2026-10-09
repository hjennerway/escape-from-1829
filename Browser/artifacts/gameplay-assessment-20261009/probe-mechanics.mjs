import {readFile,writeFile} from 'node:fs/promises';

const testURL=new URL('../../test-game.mjs',import.meta.url);
let fixture=(await readFile(testURL,'utf8')).split('const routeSnapshot=')[0];
fixture=fixture.replaceAll('./dist/',new URL('../../dist/',import.meta.url).href);
fixture+=`
const result=vm.runInContext(\`(()=>{
 state='play';elapsed=6;enemyReleaseAt=0;audioOn=false;keys.clear();
 Object.assign(player,{x:70,z:38,floor:0,outside:false});
 const ghost=enemies.find(e=>e.type===2),guard=enemies.find(e=>e.type===1);
 Object.assign(guard,{x:140,z:100,floor:1,path:[],rethink:10});
 const measure=()=>{
  Object.assign(ghost,{x:70,z:33,floor:0,path:[{x:70,z:40,floor:0}],rethink:10,memory:5,stair:null});
  const before=ghost.z;update(.04);
  return {visible:torch.visible,intensity:torch.intensity,enabled:torchEnabled,distance:ghost.z-before};
 };
 torch.visible=true;torchEnabled=true;torch.intensity=20;const on=measure();
 torchEnabled=false;torch.intensity=0;const off=measure();
 torch.visible=false;const hidden=measure();
 return {on,off,hidden};
})()\`,sandbox);
console.log(JSON.stringify(result,null,2));
globalThis.assessmentResult=result;
`;
await import('data:text/javascript;base64,'+Buffer.from(fixture).toString('base64'));
await writeFile(new URL('mechanics-probe.json',import.meta.url),JSON.stringify(globalThis.assessmentResult,null,2));
