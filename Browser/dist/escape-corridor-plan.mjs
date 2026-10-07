import {ESCAPE_WATER_TOWER} from './water-tower.mjs';
import {FARNDON_CORRIDOR} from './farndon-corridor.mjs';
import {WARD_CORRIDOR_NODES as ward} from './ward-corridors.mjs';
import {HALE_CORRIDOR_RUNS} from './hale-corridors.mjs';

// Owner's purple routes / yellow stopping lines, 7 October 2026. Escape only.
// The finished west wall meets the tower's projecting corner strip exactly.
const width=(FARNDON_CORRIDOR.width-.575)*.65+.575;
const minX=ESCAPE_WATER_TOWER.x+ESCAPE_WATER_TOWER.width/2+.105-.2875;
export const ESCAPE_GALLERY={minX,maxX:minX+width,minZ:-126,maxZ:24.4,
 ceiling:5.10,height:5.15}; // Finished underside Y=5.05, at the marked workshop wall top.
export const ESCAPE_CORRIDOR_X=minX+width/2;
export const ESCAPE_CORRIDOR_RUNS=[
 {id:'gallery',name:'Tower corridor',start:[ESCAPE_CORRIDOR_X,24.4],end:[ESCAPE_CORRIDOR_X,-126],ends:['Main/admin','Farndon']},
 {id:'admin',name:'Main/admin corridor',start:[121.5,9.8],end:[ESCAPE_CORRIDOR_X,9.8],ends:['Redesmere','Main/admin']},
 {id:'irby',name:'Irby / Ashley corridor',start:[ESCAPE_CORRIDOR_X,-66.6],end:[210,-66.6],ends:['Tower workshops','Irby / Ashley']},
 // Keep the diagonal's existing axis, but stop its cap on the gallery centre.
 // Its former eastward overhang made a triangular recess in the straight wall.
 {id:'diagonal',name:'Upton / Frith / Oscroft corridor',start:[ESCAPE_CORRIDOR_X,ward.farndon[1]+ESCAPE_CORRIDOR_X-ward.farndon[0]],end:[100,-173.4],ends:['Farndon','Upton / Frith / Oscroft']},
 {id:'grafton',name:'Grafton / Edge corridor',start:ward.graftonJunction,end:[106,ward.grafton[1]],ends:['Farndon','Grafton / Edge']},
 {id:'witby',name:'Witby corridor',start:ward.witbyJunction,end:[ward.witby[0],-187],ends:['Farndon','Witby']},
 ...HALE_CORRIDOR_RUNS.map((r,i)=>({id:'hale-'+i,name:i?'Hale middle corridor':'Hale tower-side corridor',start:[ESCAPE_CORRIDOR_X,r.end[1]],end:[r.wardFaceX,r.end[1]],ends:['Tower workshops','Hale / Daresbury / Huxley / Dunham']}))
];
export function corridorPolygon(run,padding=0){
 const [a,b]=[run.start,run.end],length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/length*(width/2+padding),nz=(b[0]-a[0])/length*(width/2+padding);
 return [[a[0]+nx,a[1]+nz],[a[0]-nx,a[1]-nz],[b[0]-nx,b[1]-nz],[b[0]+nx,b[1]+nz]];
}
export const ESCAPE_CORRIDOR_POLYGONS=ESCAPE_CORRIDOR_RUNS.map(r=>corridorPolygon(r));
export const ESCAPE_CORRIDOR_DOORS=ESCAPE_CORRIDOR_RUNS.flatMap(r=>
 (r.id==='gallery'?[0,1]:r.id==='admin'?[0]:[1]).map(end=>({id:'corridor-lock:'+r.id+':'+end,
 title:r.ends[end]+' · locked double doors',point:end?r.end:r.start,
 toward:end?r.start:r.end,marked:['gallery','admin','diagonal','grafton','witby'].includes(r.id)})));

const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
export function containsPoint(p,polygon){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
 const a=polygon[i],b=polygon[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }return inside;}
// Union small authored polygons without a grid approximation. Split every edge
// at crossings, keep exposed pieces, then trace the exact boundary loops.
export function unionPolygons(polygons){
 const segments=[],key=p=>p.map(v=>Math.round(v*1e6)).join(','),unique=new Set();
 for(const polygon of polygons)for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length],v=[b[0]-a[0],b[1]-a[1]],length=Math.hypot(...v),cuts=[0,1];
  for(const other of polygons)for(let j=0;j<other.length;j++){
   const c=other[j],d=other[(j+1)%other.length],w=[d[0]-c[0],d[1]-c[1]],q=[c[0]-a[0],c[1]-a[1]],den=cross(v,w);
   if(Math.abs(den)>1e-9){const t=cross(q,w)/den,u=cross(q,v)/den;if(t>1e-8&&t<1-1e-8&&u>=-1e-8&&u<=1+1e-8)cuts.push(t);}
   else if(Math.abs(cross(q,v))<1e-7)for(const p of [c,d]){const t=((p[0]-a[0])*v[0]+(p[1]-a[1])*v[1])/(length*length);if(t>0&&t<1)cuts.push(t);}
  }
  cuts.sort((a,b)=>a-b);
  for(let j=1;j<cuts.length;j++){
   if(cuts[j]-cuts[j-1]<1e-8)continue;
   const t=(cuts[j]+cuts[j-1])/2,mid=[a[0]+v[0]*t,a[1]+v[1]*t],n=[-v[1]/length*1e-5,v[0]/length*1e-5];
   const left=polygons.some(p=>containsPoint([mid[0]+n[0],mid[1]+n[1]],p)),right=polygons.some(p=>containsPoint([mid[0]-n[0],mid[1]-n[1]],p));
   if(left===right)continue;
   let p=[a[0]+v[0]*cuts[j-1],a[1]+v[1]*cuts[j-1]],q=[a[0]+v[0]*cuts[j],a[1]+v[1]*cuts[j]];if(!left)[p,q]=[q,p];
   const id=key(p)+'>'+key(q);if(!unique.has(id)){unique.add(id);segments.push([p,q]);}
  }
 }
 const loops=[];while(segments.length){const [a,b]=segments.pop(),loop=[a,b];while(key(loop.at(-1))!==key(a)){
  const i=segments.findIndex(s=>key(s[0])===key(loop.at(-1)));if(i<0)throw Error('Open escape corridor boundary');loop.push(segments.splice(i,1)[0][1]);
 }loop.pop();loops.push(loop);}
 return loops.sort((a,b)=>Math.abs(a.reduce((s,p,i)=>s+cross(p,a[(i+1)%a.length]),0))-Math.abs(b.reduce((s,p,i)=>s+cross(p,b[(i+1)%b.length]),0))).reverse();
}
