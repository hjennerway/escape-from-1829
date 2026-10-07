import {visible} from './core.mjs';
import {REVEAL_RADIUS,notebookView} from './notebook.mjs';
import {asylumRoomNumbers} from './asylum-room-numbers.mjs';

const caches=new WeakMap();
export function drawNotebookMap(context,notebook,key,player,enemies,yaw,{createCanvas=()=>document.createElement('canvas'),revealAll=false,outsideVisible=()=>false}={}){
 const view=notebook.views.find(v=>v.key===key);if(!view)return;
 const floor=view.floor,fog=notebook.fog.get(key),[minX,maxX,minZ,maxZ]=fog.bounds;
 const width=context.canvas.width,height=context.canvas.height,scale=Math.min((width-16)/(maxX-minX),(height-16)/(maxZ-minZ));
 const ox=(width-(maxX-minX)*scale)/2,oz=(height-(maxZ-minZ)*scale)/2;
 const px=x=>ox+(x-minX)*scale,pz=z=>oz+(z-minZ)*scale;
 const polygon=(c,points)=>{c.beginPath();points.forEach(([x,z],i)=>i?c.lineTo(px(x),pz(z)):c.moveTo(px(x),pz(z)));c.closePath();};
 let backgrounds=caches.get(notebook);if(!backgrounds){backgrounds=new Map();caches.set(notebook,backgrounds);}
 const cacheKey=`${key}:${width}:${height}`;let cached=backgrounds.get(cacheKey);
 if(!cached){
  const base=createCanvas(),mask=createCanvas(),explored=createCanvas();for(const canvas of [base,mask,explored]){canvas.width=width;canvas.height=height;}
  const c=base.getContext('2d');c.fillStyle='#263d2d';
  if(floor.outline){
   for(const p of floor.outline.loops){polygon(c,p);c.fill();}
   c.fillStyle='#394338';for(const room of floor.rooms){polygon(c,room.points);c.fill();}
   c.strokeStyle='#96aaa1';c.lineWidth=Math.max(.7,scale*.15);for(const w of floor.walls){c.beginPath();c.moveTo(px(w.a[0]),pz(w.a[1]));c.lineTo(px(w.b[0]),pz(w.b[1]));c.stroke();}
  }else{
   const s=floor.cellSize;
   for(let z=0;z<floor.height;z++)for(let x=0;x<floor.width;x++)if(floor.cells[z*floor.width+x]){
    c.fillStyle='#263d2d';c.fillRect(px((x-.5)*s),pz((z-.5)*s),s*scale,s*scale);
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
     const nx=x+dx,nz=z+dz;if(nx>=0&&nz>=0&&nx<floor.width&&nz<floor.height&&floor.cells[nz*floor.width+nx])continue;
     c.strokeStyle='#96aaa1';c.lineWidth=.8;c.beginPath();
     if(dx){const wx=px((x+dx*.5)*s);c.moveTo(wx,pz((z-.5)*s));c.lineTo(wx,pz((z+.5)*s));}
     else{const wz=pz((z+dz*.5)*s);c.moveTo(px((x-.5)*s),wz);c.lineTo(px((x+.5)*s),wz);}c.stroke();
    }
   }
  }
  if(view.outside){
   if(view.groundsPlan){c.fillStyle='#394338';polygon(c,view.groundsPlan.outline);c.fill();c.strokeStyle='#96aaa1';c.lineWidth=Math.max(.7,scale*.15);polygon(c,view.groundsPlan.outline);c.stroke();for(const room of view.groundsPlan.rooms){const [x0,z0,x1,z1]=room.rect;polygon(c,[[x0,z0],[x1,z0],[x1,z1],[x0,z1]]);c.stroke();}}
   if(view.groundsOutline){c.strokeStyle='#9a9c78';c.lineWidth=Math.max(1,scale*.7);polygon(c,view.groundsOutline);c.stroke();}
   c.strokeStyle='#788774';c.lineWidth=Math.max(1,scale*.8);
   for(const stair of view.routes){c.beginPath();stair.points.forEach(([x,z],i)=>i?c.lineTo(px(x),pz(z)):c.moveTo(px(x),pz(z)));c.stroke();}
   c.strokeStyle='#a19c7d';c.lineWidth=scale*2.5;c.beginPath();c.moveTo(px(0),pz(22));c.lineTo(px(0),pz(82));c.stroke();
   c.lineWidth=Math.max(1,scale);c.beginPath();c.moveTo(px(-80),pz(12));c.lineTo(px(-80),pz(-60));c.lineTo(px(-74),pz(-89));c.stroke();
  }
  cached={base,mask,explored,roomNumbers:asylumRoomNumbers(floor),stamp:''};backgrounds.set(cacheKey,cached);
 }
 const stamp=`${notebook.generation}:${fog.revision}`;
 if(!revealAll&&cached.stamp!==stamp){
  const m=cached.mask.getContext('2d');m.clearRect(0,0,width,height);m.fillStyle='#fff';
  for(let row=0;row<fog.rows;row++)for(let col=0;col<fog.cols;col++)if(fog.cells[row*fog.cols+col])m.fillRect(px(minX+col),pz(minZ+row),scale+.15,scale+.15);
  const c=cached.explored.getContext('2d');c.clearRect(0,0,width,height);c.drawImage(cached.base,0,0);c.globalCompositeOperation='destination-in';c.drawImage(cached.mask,0,0);c.globalCompositeOperation='source-over';cached.stamp=stamp;
 }
 context.clearRect(0,0,width,height);context.fillStyle='#0b120d';context.fillRect(0,0,width,height);
 // A dim paper grid remains in unexplored areas, without revealing the building outline.
 context.strokeStyle='#17221a';context.lineWidth=.5;
 for(let x=minX;x<maxX;x+=10){context.beginPath();context.moveTo(px(x),oz);context.lineTo(px(x),height-oz);context.stroke();}
 for(let z=minZ;z<maxZ;z+=10){context.beginPath();context.moveTo(ox,pz(z));context.lineTo(width-ox,pz(z));context.stroke();}
 context.drawImage(revealAll?cached.base:cached.explored,0,0);
 const current=key===notebookView(player),large=width>300;
 // Ordinary maps gate symbols by exploration; the developer view reveals every level.
 for(const stair of view.outside?[]:floor.stairs??[]){
  const x=stair.label?.[0]??stair.x*floor.cellSize,z=stair.label?.[1]??stair.z*floor.cellSize;
  if(!revealAll&&!notebook.known(key,x,z))continue;
  context.fillStyle='#c6aedb';context.fillRect(px(x)-2,pz(z)-2,4,4);
  if(large){context.font='12px Arial';context.textAlign='center';context.fillText(stair.id??'S',px(x),pz(z)-6);}
 }
 const exits=view.outside?notebook.views.filter(v=>!v.outside).flatMap(v=>v.floor.exits):floor.exits;
 for(const e of exits){const x=view.outside?e.destination[0]:e.worldX??e.x*floor.cellSize,z=view.outside?e.destination[2]:e.worldZ??e.z*floor.cellSize;
  if(!revealAll&&!notebook.known(key,x,z))continue;
  const note=notebook.entries.find(n=>n.id===`door:${view.index}:${e.id}`);
  context.fillStyle=note?.locked?'#cfb894':'#c7e19b';context.fillRect(px(x)-2,pz(z)-2,4,4);
  if(large&&note?.locked){context.font='10px Arial';context.textAlign='center';context.fillText('Locked',px(x),pz(z)-6);}
 }
 if(large)for(const note of notebook.entries.filter(n=>n.mapPoint&&n.view===key)){
  const {x,z}=note.mapPoint;if(!revealAll&&!notebook.known(key,x,z))continue;
  context.fillStyle='#cfb894';context.font='10px Arial';context.textAlign='center';context.fillText(note.mapLabel??note.title,px(x),pz(z)-7);
 }
 if(large&&!view.outside)for(const room of floor.rooms??[]){const x=room.label?.[0]??room.x*floor.cellSize,z=room.label?.[1]??room.z*floor.cellSize,number=cached.roomNumbers.get(room.id);if(!number||!revealAll&&!notebook.known(key,x,z))continue;context.fillStyle='#bdc7b1';context.font='11px Arial';context.textAlign='center';context.fillText(number,px(x),pz(z)+4);}
 if(current){
  for(const enemy of enemies){
   if(view.outside?!enemy.outside:enemy.outside||enemy.floor!==player.floor)continue;
   if(Math.abs((enemy.y??floor.elevation??0)-(player.y??floor.elevation??0))>.6||Math.hypot(enemy.x-player.x,enemy.z-player.z)>REVEAL_RADIUS||!notebook.known(key,enemy.x,enemy.z)||!(view.outside?outsideVisible(player,enemy):visible(floor,player,enemy)))continue;
   context.fillStyle=enemy.type===2?'#8fe0c4':'#e1c278';context.beginPath();context.arc(px(enemy.x),pz(enemy.z),large?4:2.5,0,7);context.fill();
  }
  context.fillStyle='#fff8db';context.beginPath();context.arc(px(player.x),pz(player.z),large?4:3,0,7);context.fill();
  context.strokeStyle='#fff8db';context.lineWidth=1.5;context.beginPath();context.moveTo(px(player.x),pz(player.z));context.lineTo(px(player.x)-Math.sin(yaw)*(large?12:8),pz(player.z)-Math.cos(yaw)*(large?12:8));context.stroke();
 }
 context.textAlign='left';
}
