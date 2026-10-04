import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {stairShape,STAIR_WIDTH} from '../../Browser/dist/asylum-stairs.mjs';
const require=createRequire(import.meta.url);
const sharp=require('sharp');
const destination=new URL('./',import.meta.url).pathname.replace(/^\/(\w:)/,'$1').replace(/\/$/,'');
const data=JSON.parse(await fs.readFile(destination+'/plan-data.json','utf8'));
const {rooms,corridors,stairs,exits,outsideStairs}=data;
const xml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function exportSVG(floor){
 const upper=floor.id===3;
 const width=1600,height=1050,scale=upper?48:floor.id===2?11.5:8.3,px=x=>upper?210+(x+16)*scale:floor.id===2?750+(x+17)*scale:150+(x+74)*scale,py=z=>upper?220+(z-4.4)*scale:142+(z+41)*scale;
 const path=p=>p.map((q,i)=>(i?'L':'M')+px(q[0]).toFixed(2)+','+py(q[1]).toFixed(2)).join(' ')+'Z';
 const line=p=>p.map((q,i)=>(i?'L':'M')+px(q[0]).toFixed(2)+','+py(q[1]).toFixed(2)).join(' ');
 const outlinePath=floor.outline.loops.map(path).join(' ');
 const text=(x,z,value,size=20,anchor='middle',color='#253746')=>`<text x="${px(x)}" y="${py(z)}" fill="${color}" text-anchor="${anchor}" font-size="${size}" dominant-baseline="middle">${xml(value)}</text>`;
 const floorRooms=rooms.filter(r=>r.floors.includes(floor.id)).map(r=>({...r,...r.variants?.[floor.id]}));
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><clipPath id="inside"><path d="${outlinePath}" fill-rule="evenodd"/></clipPath><pattern id="hatch" patternUnits="userSpaceOnUse" width="10" height="10"><path d="M0 10L10 0" stroke="#bac3c9" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="#faf9f5"/><g font-family="Arial, sans-serif"><text x="56" y="52" fill="#253746" font-size="34">1829 · ${floor.name} · ${upper?'implemented layout':'rough proposal'}</text><text x="56" y="88" fill="#56656d" font-size="20">${upper?'Owner-requested rooms matching the circled exterior bay · Stair S1 continues from Reception':'Exterior shape from the current model; internal walls and stairs proposed · Rear at top, Reception at bottom'}</text>`;
 svg+=upper?text(-16,3,'CIRCLED EXTERIOR BAY ↑',18,'start'):text(floor.id===2?-42:-80,-39,'REAR ↑',18,'start');if(floor.id<2){svg+=text(-79,47,'WEST',18,'start');svg+=text(79,47,'EAST',18,'end');}
 if(floor.id<2)for(const low of data.lowRoofs)if(floor.id===1||low.name.startsWith('East'))svg+=`<path d="${path(low.points)}" fill="url(#hatch)" stroke="#bac3c9"/>`;
 for(const s of outsideStairs.filter(s=>s.floors?s.floors.includes(floor.id):floor.id<2)){svg+=`<path d="${line(s.points)}" fill="none" stroke="#dce8df" stroke-width="${1.4*scale}" stroke-linejoin="round"/><path d="${line(s.points)}" fill="none" stroke="#86a393" stroke-width="1" stroke-dasharray="3 3"/>`;}
 svg+=`<path d="${outlinePath}" fill="#f0eee7" fill-rule="evenodd"/>`;
 svg+='<g clip-path="url(#inside)">';
 for(const r of floorRooms){
  svg+=`<path d="${path(r.points)}" fill="#eee9db" stroke="${r.openEdges?'none':'#8b9295'}" stroke-width="1.1"/>`;
  if(r.openEdges)for(let i=0;i<r.points.length;i++)if(!r.openEdges.includes(i))svg+=`<path d="${line([r.points[i],r.points[(i+1)%r.points.length]])}" fill="none" stroke="#8b9295" stroke-width="1.1"/>`;
 }
 for(const base of corridors.filter(c=>!c.floors||c.floors.includes(floor.id))){const c={...base,...base.variants?.[floor.id]};svg+=`<path d="${line(c.points)}" fill="none" stroke="#b6d4df" stroke-width="${c.width*scale}" stroke-linejoin="round" stroke-linecap="square"/>`;}
 // Open room-door symbols along their corridor-facing side.
 for(const p of (data.partitions??[]).filter(p=>p.floors.includes(floor.id))){
  const [a,b]=p.points,length=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/length,dz=(b[1]-a[1])/length,x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;
  svg+=`<path d="${line(p.points)}" fill="none" stroke="#394d58" stroke-width="2.2"/><path d="${line([[x-dx*.95,z-dz*.95],[x+dx*.95,z+dz*.95]])}" stroke="#b6d4df" stroke-width="5"/>`;
 }
 for(const s of stairs.filter(s=>s.floors.includes(floor.id))){
  const b=stairShape(s);
  svg+=`<path d="${path(s.points)}" fill="#d5c5df" stroke="#665579" stroke-width="1.5"/>`;
  svg+=`<path d="${path([[b.innerLeft,b.front],[b.innerRight,b.front],[b.innerRight,b.back],[b.innerLeft,b.back]])}" fill="#faf9f5" stroke="#665579" stroke-width="2"/>`;
  for(let i=0;i<=12;i++)for(const x of [b.minX,b.innerRight]){const z=b.front+(b.back-b.front)*i/12;svg+=`<path d="${line([[x,z],[x+STAIR_WIDTH,z]])}" stroke="#927ea6" stroke-width="1"/>`;}
 }
 // Reviewed solid room edges remain visible over the adjoining stair fill.
 for(const r of floorRooms)for(const i of r.solidEdges??[])svg+=`<path d="${line([r.points[i],r.points[(i+1)%r.points.length]])}" fill="none" stroke="#394d58" stroke-width="2.2"/>`;
 // Door gaps are drawn last so a retained stair-side edge cannot cover them.
 for(const r of floorRooms.filter(r=>r.doorSide)){const x1=Math.min(...r.points.map(p=>p[0])),x2=Math.max(...r.points.map(p=>p[0])),z1=Math.min(...r.points.map(p=>p[1])),z2=Math.max(...r.points.map(p=>p[1])),side=r.doorSide,halfDoor=upper?(r.doorWidth??1.9)/2:.65;let door=side==='west'?[[x1,r.door-halfDoor],[x1,r.door+halfDoor]]:side==='east'?[[x2,r.door-halfDoor],[x2,r.door+halfDoor]]:side==='north'?[[r.door-halfDoor,z1],[r.door+halfDoor,z1]]:[[r.door-halfDoor,z2],[r.door+halfDoor,z2]];svg+=`<path d="${line(door)}" stroke="#eee9db" stroke-width="5"/>`;}
 svg+='</g>';
 svg+=`<path d="${outlinePath}" fill="none" stroke="#394d58" stroke-width="2.2" fill-rule="evenodd"/>`;
 for(const room of floorRooms)for(const w of room.windows??[]){const diagonal=w.axis==='diagonal',dx=diagonal?w.width/2/Math.SQRT2:w.axis==='x'?0:w.width/2,dz=diagonal?Math.sign(w.x)*dx:w.axis==='x'?w.width/2:0;svg+=`<path d="${line([[w.x-dx,w.z-dz],[w.x+dx,w.z+dz]])}" stroke="#faf9f5" stroke-width="6"/><path d="${line([[w.x-dx,w.z-dz],[w.x+dx,w.z+dz]])}" stroke="#448296" stroke-width="3"/>`;}
 for(const r of floorRooms)svg+=text(r.label[0],r.label[1],r.id,18);
 for(const s of stairs.filter(s=>s.floors.includes(floor.id))){const x=s.label[0],z=s.label[1];svg+=`<rect x="${px(x)-17}" y="${py(z)-11}" width="34" height="22" fill="#d5c5df"/>`+text(x,z,s.id,17);}
 if(floor.id<2)for(const c of [{x:-35.8,z:-8,text:'C2'},{x:5.3,z:-13,text:'C3'},{x:35.8,z:-8,text:'C4'},{x:-30.25,z:34,text:'C5'},{x:30.25,z:34,text:'C6'},{x:-20.5,z:8.2,text:'C1'},{x:20.5,z:8.2,text:'C1'}])svg+=text(c.x,c.z,c.text,17);
 for(const e of exits.filter(e=>e.levels.some(l=>l.floor===floor.id))){const a=e.axis==='x'?[[e.x,e.z-.9],[e.x,e.z+.9]]:[[e.x-.9,e.z],[e.x+.9,e.z]],color=e.id.startsWith('F')?'#287854':'#315f77';svg+=`<path d="${line([[e.x,e.z],e.label])}" fill="none" stroke="${color}" stroke-width="1.1"/><path d="${line(a)}" fill="none" stroke="${color}" stroke-width="5"/><circle cx="${px(e.label[0])}" cy="${py(e.label[1])}" r="18" fill="#faf9f5" stroke="${color}" stroke-width="1.2"/>`+text(e.label[0],e.label[1],e.id,17);}
 if(floor.id<2)svg+=text(-17,-7,'WEST REAR',18)+text(-17,-3,'COURT',18)+text(16.5,-7,'EAST REAR',18)+text(16.5,-3,'COURT',18);
 if(floor.id<2)svg+=text(-56,33,'WEST GARDEN',16)+text(57,34,'EAST GARDEN',16);
 if(floor.id<2)svg+=text(0,14.1,floor.id===0?'Reception':'Landing',18);else if(floor.id===2)svg+=text(-31.1,-7,'BC1',18);
 if(upper){svg+=text(0,12.2,'C24 · 2 m passage',18)+text(-12.9,15.3,'S1 to first floor',16);for(const r of floorRooms)svg+=text(r.label[0],r.label[1]+.7,r.name,16);}else svg+=text(floor.id===2?-17:0,floor.id===2?25:47,'FRONT / RECEPTION ↓',19);
 const legend=[['#eee9db','R / B · rooms'],['#b6d4df','C · corridors'],['#d5c5df','S · internal stairs'],['#287854','F · fire-escape connection'],['#315f77','D · exterior door']].slice(0,upper?3:5);
 for(let i=0;i<legend.length;i++){const x=56+(i%3)*500,y=952+Math.floor(i/3)*36;svg+=`<rect x="${x}" y="${y-14}" width="22" height="18" fill="${legend[i][0]}"/><text x="${x+33}" y="${y}" fill="#253746" font-size="19">${legend[i][1]}</text>`;}
 svg+=`<text x="1070" y="988" fill="#56656d" font-size="18">${upper?'Walk S1 down to the first floor':'Press E ↔ matching outside door / landing'}</text></g></svg>`;
 return svg;
}
for(const floor of data.floors){const name=['ground-floor','first-floor','basement','second-floor'][floor.id];if(process.argv[2]&&process.argv[2]!==name)continue;const svg=exportSVG(floor);await fs.writeFile(destination+'/'+name+'.svg',svg);await sharp(Buffer.from(svg)).png().toFile(destination+'/'+name+'.png');}
