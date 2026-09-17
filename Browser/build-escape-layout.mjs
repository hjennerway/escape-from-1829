// Coarse gameplay plan of the modelled 1829 core; see Research/escape-layout/README.md.
import {writeFile} from 'node:fs/promises';
const width=41,height=33,cellSize=2.5,cells=Array(width*height).fill(0);
function carve(x0,z0,x1,z1){for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)cells[z*width+x]=1;}
carve(2,18,38,20); // Broad front cross-gallery, longer eastern pavilion.
carve(5,17,9,21);carve(31,17,37,21);carve(35,22,37,22);
carve(18,18,22,21); // Reception and central portico.
carve(19,6,21,18); // Long central rear range.
carve(11,7,13,18);carve(27,7,29,18); // Inset rear ward arms.
carve(10,21,12,26);carve(28,21,30,26); // Paired forward wings.
// Room thresholds preserve the central route through each rear arm.
for(const x of [12,20,28])for(const z of [10,14]){
  cells[z*width+x-1]=0;cells[z*width+x+1]=0;
}
// Stair alcoves immediately left/right of Reception, facing towards the rear.
carve(16,17,16,18);carve(24,17,24,18);
const stairs=[
  {x:16,z:17,name:'LEFT RECEPTION STAIR',direction:'UP',mirror:1,source:'Left-of-reception location from supplied footage; dimensions approximate'},
  {x:24,z:17,name:'RIGHT RECEPTION STAIR',direction:'UP',mirror:-1,source:'Mirrored at user request'}
];
const patrol=[{x:12,z:8},{x:28,z:8},{x:29,z:25},{x:11,z:25}];
const layout={width,height,cellSize,cells,geometrySource:'layout',galleryZ:19,
  source:'Approximate 1829 core footprint, excluding Barmere, Redesmere and Saughall; fictional internal partitions',
  spawn:{x:20,z:19,yaw:0},stairs,
  exits:[{x:11,z:26,name:'WEST GARDEN',facing:1},{x:29,z:26,name:'EAST GARDEN',facing:1},
    {x:12,z:7,name:'WEST COURT',facing:-1},{x:28,z:7,name:'EAST COURT',facing:-1},
    {x:20,z:21,name:'MAIN PORTICO',facing:1}],
  rooms:[{name:'NECS Office',x:12,z:8},{name:'Library',x:28,z:8},
    {name:'MLCSU Office',x:12,z:16},{name:'Reception',x:20,z:19},
    {name:'NHS England office',x:28,z:16},{name:'Snug',x:11,z:24},{name:'Arden and GEM office',x:29,z:24}],
  enemies:[{name:'Security',x:28,z:12,type:1},{name:'Deva asylum ghost',x:20,z:7,type:2}],patrol,
  upperFloor:{name:'UPPER FLOOR',cells:[...cells],patrol,
    source:'Same approximate 1829 core footprint; upper rooms and partitions are gameplay estimates'}
};
for(const file of ['./dist/layout.json','../Assets/Resources/layout.json'])
  await writeFile(new URL(file,import.meta.url),JSON.stringify(layout,null,2)+'\n');
console.log(`1829 escape plan: ${cells.reduce((a,b)=>a+b,0)} cells on each floor, five exits.`);
