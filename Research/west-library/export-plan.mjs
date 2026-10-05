import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {buildAsylumLayout} from '../../Browser/dist/asylum-layout.mjs';
import {stairRoute} from '../../Browser/dist/asylum-stairs.mjs';
const require=createRequire(import.meta.url),sharp=require('sharp');
const plan=JSON.parse(await readFile(new URL('../1829-interior-proposal/plan-data.json',import.meta.url))),floor=buildAsylumLayout(plan).floors[3];
const x=v=>90+(v+72.5)*30,z=v=>180+(v-1.55)*30;
const path=points=>points.map((p,i)=>(i?'L':'M')+x(p[0])+','+z(p[1])).join(' ');
const text=(px,pz,value,size=18)=>`<text x="${x(px)}" y="${z(pz)}" text-anchor="middle" dominant-baseline="middle" font-size="${size}">${value}</text>`;
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="980" viewBox="0 0 1500 980"><rect width="1500" height="980" fill="#faf9f5"/><g font-family="Arial, sans-serif" fill="#253746"><text x="60" y="55" font-size="34">West wing · Library and adjoining rooms</text><text x="60" y="93" font-size="20">Third storey / second floor · Matching the current outside outline and the owner's yellow room divisions</text><text x="60" y="126" font-size="17" fill="#56656d">Rear court ↑ · Upper garden fire escape F4 · Single straight staircase S5 beside the lower well</text>`;
svg+=`<path d="${path(floor.outline.loops[1])}Z" fill="#e5eff2" stroke="#394d58" stroke-width="3"/>`;
for(const room of floor.rooms.filter(r=>r.label[0]<-25)){
 svg+=`<path d="${path(room.points)}Z" fill="${room.id==='R51'?'#d9cce0':'#efe9dc'}"/>`;
 const names={R46:['LIBRARY','R46 · Shelves and reading table'],R47:['Sitting room','R47'],R48:['Bay reading room','R48'],R49:['Librarian office','R49'],R50:['Book store','R50'],R51:['S5','Open stair']};
 const [name,sub]=room.id==='R51'?['Open stair hall','R51']:names[room.id];svg+=text(room.label[0],room.label[1]-.3,name,room.id==='R46'?25:17)+text(room.label[0],room.label[1]+.5,sub,14);
}
for(const wall of floor.walls.filter(w=>w.a[0]<-25&&w.b[0]<-25))svg+=`<path d="${path([wall.a,wall.b])}" fill="none" stroke="#394d58" stroke-width="4"/>`;
for(const win of floor.windows.filter(w=>w.x<-25)){
 const wall=floor.walls.find(w=>Math.hypot(win.x-w.a[0],win.z-w.a[1])+Math.hypot(win.x-w.b[0],win.z-w.b[1])-Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1])<1e-5),a=wall.a,b=wall.b,d=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/d*win.width/2,dz=(b[1]-a[1])/d*win.width/2;
 svg+=`<path d="${path([[win.x-dx,win.z-dz],[win.x+dx,win.z+dz]])}" stroke="#faf9f5" stroke-width="8"/><path d="${path([[win.x-dx,win.z-dz],[win.x+dx,win.z+dz]])}" stroke="#448296" stroke-width="4"/>`;
}
for(const door of floor.doorways.filter(d=>d.x<-25))svg+=`<path d="${path([[door.x-door.dx*door.width/2,door.z-door.dz*door.width/2],[door.x+door.dx*door.width/2,door.z+door.dz*door.width/2]])}" stroke="#548469" stroke-width="5"/>`;
svg+=text(-45.5,7.1,'C26 · Rear passage',16);
const stair=plan.stairs.find(s=>s.id==='S5'),route=stairRoute(stair,4.2,8.4,1,3).map(p=>[p[0],p[2]]);
svg+=`<path d="${path(route)}" fill="none" stroke="#927ea6" stroke-width="5" stroke-linejoin="round"/><circle cx="${x(route.at(-1)[0])}" cy="${z(route.at(-1)[1])}" r="5" fill="#665579"/>`+text(-34.85,11,'S5',16);
svg+=`<path d="${path([[-63,13.5],[-63,23.2]])}" stroke="#287854" stroke-dasharray="5 5"/>`+text(-63,23.9,'F4 · Upper fire escape',17);
svg+='<text x="60" y="924" font-size="18">Room divisions and uses are gameplay estimates from the supplied reference, not a surveyed historical plan.</text></g></svg>';
await writeFile(new URL('plan.svg',import.meta.url),svg);await sharp(Buffer.from(svg)).png().toFile(new URL('plan.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'));
