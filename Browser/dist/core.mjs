export function cell(layout,p){return [Math.round(p.x/layout.cellSize),Math.round(p.z/layout.cellSize)];}
export function open(l,x,z){return x>=0&&z>=0&&x<l.width&&z<l.height&&l.cells[z*l.width+x]===1;}
export function walkable(l,x,z,r=.28){return [[-r,-r],[r,-r],[-r,r],[r,r]].every(([dx,dz])=>open(l,Math.floor((x+dx)/l.cellSize+.5),Math.floor((z+dz)/l.cellSize+.5)));}
export function path(l,a,b){
  const [ax,az]=cell(l,a),[bx,bz]=cell(l,b); if(!open(l,ax,az)||!open(l,bx,bz))return [];
  const start=az*l.width+ax,end=bz*l.width+bx,prev=new Int32Array(l.cells.length).fill(-1),q=[start];prev[start]=start;
  for(let i=0;i<q.length&&prev[end]<0;i++){const n=q[i];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=n%l.width+dx,z=Math.floor(n/l.width)+dz,j=z*l.width+x;if(open(l,x,z)&&prev[j]<0){prev[j]=n;q.push(j);}}}
  if(prev[end]<0)return [];const out=[];for(let n=end;n!==start;n=prev[n])out.push({x:n%l.width*l.cellSize,z:Math.floor(n/l.width)*l.cellSize});return out.reverse();
}
export function visible(l,a,b){const dist=Math.hypot(b.x-a.x,b.z-a.z),n=Math.ceil(dist/.35);for(let i=1;i<n;i++)if(!walkable(l,a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n,.02))return false;return true;}
export function nearExit(l,p){return l.exits.find(e=>Math.hypot(p.x-e.x*l.cellSize,p.z-e.z*l.cellSize)<2.7);}
