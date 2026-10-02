import {flatWalkable} from './asylum-layout.mjs';
export function cell(layout,p){return [Math.round((p.x-(layout.origin?.x??0))/layout.cellSize),Math.round((p.z-(layout.origin?.z??0))/layout.cellSize)];}
export function open(l,x,z){return x>=0&&z>=0&&x<l.width&&z<l.height&&l.cells[z*l.width+x]===1;}
export function walkable(l,x,z,r=.28){if(l.geometrySource==='asylum-plan')return flatWalkable(l,x,z,r);return [[-r,-r],[r,-r],[-r,r],[r,r]].every(([dx,dz])=>open(l,Math.floor((x+dx)/l.cellSize+.5),Math.floor((z+dz)/l.cellSize+.5)));}
export function path(l,a,b){
  if(l.origin)return planPath(l,a,b);
  const [ax,az]=cell(l,a),[bx,bz]=cell(l,b); if(!open(l,ax,az)||!open(l,bx,bz))return [];
  const start=az*l.width+ax,end=bz*l.width+bx,prev=new Int32Array(l.cells.length).fill(-1),q=[start];prev[start]=start;
  for(let i=0;i<q.length&&prev[end]<0;i++){const n=q[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=n%l.width+dx,z=Math.floor(n/l.width)+dz,j=z*l.width+x;if(open(l,x,z)&&prev[j]<0){prev[j]=n;q.push(j);}}}
  if(prev[end]<0)return [];const out=[];for(let n=end;n!==start;n=prev[n])out.push({x:n%l.width*l.cellSize,z:Math.floor(n/l.width)*l.cellSize});return out.reverse();
}
function planPath(l,a,b){
 const [ax,az]=cell(l,a),[bx,bz]=cell(l,b),start=az*l.width+ax,end=bz*l.width+bx;
 if(!open(l,ax,az)||!open(l,bx,bz))return [];
 const distance=new Float64Array(l.cells.length);distance.fill(Infinity);distance[start]=0;
 const previous=new Int32Array(l.cells.length);previous.fill(-1);
 const heap=[];
 const score=n=>distance[n]+Math.abs(n%l.width-bx)+Math.abs(Math.floor(n/l.width)-bz);
 const push=n=>{const entry={n,score:score(n)};let i=heap.length;heap.push(entry);while(i){const p=(i-1)>>1;if(heap[p].score<=entry.score)break;heap[i]=heap[p];i=p;}heap[i]=entry;};
 const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){let i=0;heap[0]=last;while(true){let j=i*2+1;if(j>=heap.length)break;if(j+1<heap.length&&heap[j+1].score<heap[j].score)j++;if(heap[j].score>=last.score)break;heap[i]=heap[j];i=j;}heap[i]=last;}return first.n;};
 push(start);const visited=new Uint8Array(l.cells.length);
 while(heap.length){const n=pop();if(visited[n])continue;visited[n]=1;if(n===end)break;const x=n%l.width,z=Math.floor(n/l.width);
  for(const [nx,nz] of [[x+1,z],[x-1,z],[x,z+1],[x,z-1]]){if(!open(l,nx,nz))continue;const k=nz*l.width+nx,next=distance[n]+1;if(next<distance[k]){distance[k]=next;previous[k]=n;push(k);}}
 }
 if(!visited[end])return [];
 const route=[];for(let n=end;n!==start;n=previous[n])route.push({x:l.origin.x+(n%l.width)*l.cellSize,z:l.origin.z+Math.floor(n/l.width)*l.cellSize});
 route.reverse();if(route.length){route.at(-1).x=b.x;route.at(-1).z=b.z;}return route;
}
export function visible(l,a,b){const dist=Math.hypot(b.x-a.x,b.z-a.z),n=Math.ceil(dist/.35);for(let i=1;i<n;i++)if(!walkable(l,a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n,.02))return false;return true;}
export function nearExit(l,p){return l.exits.find(e=>l.geometrySource==='asylum-plan'?Math.abs((p.y??l.elevation)-l.elevation)<.5&&Math.hypot(p.x-e.inside.x,p.z-e.inside.z)<1.6&&visible(l,p,e.inside):Math.hypot(p.x-e.x*l.cellSize,p.z-e.z*l.cellSize)<2.7);}
