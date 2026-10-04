import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {modelSourceHash} from '../../model-build-inputs.mjs';

const gameUrl=new URL('../../dist/asylum-plan.json',import.meta.url);
const reviewUrl=new URL('../../../Research/1829-interior-proposal/plan-data.json',import.meta.url);
const source=await readFile(new URL('../../../Research/top-floor-layout-proposal/top-floor-plan.html',import.meta.url),'utf8');
const concept=JSON.parse(source.match(/<script type="application\/json" class="plan-data">([\s\S]*?)<\/script>/)[1]);
const gameText=await readFile(gameUrl,'utf8'),plan=JSON.parse(gameText);
assert.deepEqual(plan,JSON.parse(await readFile(reviewUrl,'utf8')));
assert.deepEqual(plan.floors.find(f=>f.id===3).outline.loops[0],concept.outline);
assert.deepEqual(plan.stairs.find(s=>s.id==='S1').points,concept.stair);
assert.deepEqual(plan.rooms.filter(r=>r.floors.includes(3)).flatMap(r=>r.windows),concept.windows);
await mkdir(new URL('./implemented/',import.meta.url),{recursive:true});
await writeFile(new URL('./implemented/before-plan.json',import.meta.url),gameText,{flag:'wx'});
await writeFile(new URL('./implemented/before-model-hash.txt',import.meta.url),await modelSourceHash()+'\n',{flag:'wx'});
const specs=[
 {id:'R41',index:1,use:'Records office',doorSide:'south',door:0,doorWidth:1.3,doorLabel:['Records','office'],windows:[concept.windows[1]]},
 {id:'R42',index:2,use:'Staff office',doorSide:'south',door:5.3,doorWidth:1.3,doorLabel:['Staff','office'],windows:concept.windows.slice(3)},
 {id:'R43',index:0,use:'Staff sitting room',doorSide:'south',door:-5.3,doorWidth:1.3,doorLabel:['Staff sitting','room'],windows:[concept.windows[0],concept.windows[2]]},
 {id:'R44',index:3,use:'Archive and stores',doorSide:'north',door:0,doorWidth:1.3,doorLabel:['Archive','& stores'],windows:[]},
 {id:'R45',index:4,use:'Linen store',doorSide:'south',door:-12.9,doorWidth:1.2,doorLabel:['Linen','store'],windows:[],solidEdges:[2]}
];
const upper=specs.map(({index,use,...spec})=>({...spec,name:use,points:concept.proposedRooms[index].points,label:concept.proposedRooms[index].label,floors:[3],corridorClipping:false,
 description:index<3?'Windowed room off the compact top-floor passage; the existing exterior sashes remain fixed.':index===3?'Windowless archive and stores behind the top-floor passage, reached through its own labelled doorway.':'Windowless linen store beside the retained Reception staircase, opening from its front landing.'}));
plan.rooms=plan.rooms.filter(r=>!r.floors.includes(3)).concat(upper);
const corridor=plan.corridors.find(c=>c.id==='C24');
Object.assign(corridor,{name:'Reception upper passage',width:2,points:[[-9.45,12.2],[7.6,12.2]],description:'Compact passage serving three windowed rooms and the archive; joins the retained stair landing through C25.'});
plan.corridors.push({id:'C25',name:'Reception upper stair approach',width:1.7,points:[[-10.95,10.25],[-9.45,10.25],[-9.45,12.2]],floors:[3],description:'Retains the eastward departure from S1 and turns into C24 without passing through a room.'});
const updated=JSON.stringify(plan)+'\n';
await writeFile(gameUrl,updated);await writeFile(reviewUrl,updated);
console.log('Applied the approved five-room top floor to both shared plans; retained exterior outline, stair and all five complete window records.');
