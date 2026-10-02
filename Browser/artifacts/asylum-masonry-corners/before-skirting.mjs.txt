// A single solid skirting footprint removes hidden caps and overlapping top
// faces, including partially duplicated room partitions in the sampled plan.
const halfWidth=.215/2,epsilon=1e-7;
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const point=(a,d,t)=>[a[0]+d[0]*t,a[1]+d[1]*t];
const key=p=>p.map(v=>Math.round(v/epsilon)).join(',');

function footprints(walls){
 const runs=walls.map(w=>({a:[...w.a],b:[...w.b]}));
 // The layout supplies joined runs to every finish and to navigation.
 const nodes=new Map(),polygons=[];
 for(const run of runs){
  const d=sub(run.b,run.a),length=Math.hypot(...d);d[0]/=length;d[1]/=length;run.d=d;
  for(const end of ['a','b']){
   const p=run[end],k=key(p),out=end==='a'?d:d.map(v=>-v);
   if(!nodes.has(k))nodes.set(k,{p,ends:[]});
   const node=nodes.get(k);
   if(!node.ends.some(e=>Math.abs(cross(e,out))<epsilon&&e[0]*out[0]+e[1]*out[1]>0))node.ends.push(out);
  }
 }
 function add(poly){
  if(poly.reduce((area,p,i)=>area+cross(p,poly[(i+1)%poly.length]),0)<0)poly.reverse();
  polygons.push(poly);
 }
 for(const run of runs){
  const {d}=run,n=[-d[1]*halfWidth,d[0]*halfWidth];
  // Free caps clear the masonry end plane by 12 mm.
  const a=point(run.a,d,nodes.get(key(run.a)).ends.length===1?-.012:0);
  const b=point(run.b,d,nodes.get(key(run.b)).ends.length===1?.012:0);
  add([point(a,n,1),point(a,n,-1),point(b,n,-1),point(b,n,1)]);
 }
 for(const {p,ends} of nodes.values())if(ends.length>1){
  ends.sort((a,b)=>Math.atan2(a[1],a[0])-Math.atan2(b[1],b[0]));
  for(let i=0;i<ends.length;i++){
   const a=ends[i],b=ends[(i+1)%ends.length],den=cross(a,b);
   // Only the outside sector needs filling; inside mitres already overlap.
   if(den>=-epsilon)continue;
   const left=point(p,[-a[1],a[0]],halfWidth),right=point(p,[b[1],-b[0]],halfWidth);
   const mitre=point(left,a,cross(sub(right,left),b)/den);
   add([p,left,mitre,right]);
  }
 }
 return polygons;
}

function outlineUnion(polygons){
 const edges=polygons.flatMap(poly=>poly.map((a,i)=>({a,b:poly[(i+1)%poly.length],cuts:[0,1]})));
 // Split at all crossings and collinear overlaps before removing interior edges.
 for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){
  const a=edges[i],b=edges[j],d=sub(a.b,a.a),e=sub(b.b,b.a),q=sub(b.a,a.a),den=cross(d,e);
  if(Math.abs(den)>epsilon){
   const t=cross(q,e)/den,u=cross(q,d)/den;
   if(t>=-epsilon&&t<=1+epsilon&&u>=-epsilon&&u<=1+epsilon){a.cuts.push(Math.max(0,Math.min(1,t)));b.cuts.push(Math.max(0,Math.min(1,u)));}
  }else if(Math.abs(cross(q,d))<epsilon){
   const project=(p,start,v)=>(sub(p,start)[0]*v[0]+sub(p,start)[1]*v[1])/(v[0]*v[0]+v[1]*v[1]);
   for(const p of [b.a,b.b]){const t=project(p,a.a,d);if(t>0&&t<1)a.cuts.push(t);}
   for(const p of [a.a,a.b]){const t=project(p,b.a,e);if(t>0&&t<1)b.cuts.push(t);}
  }
 }
 const bounds=polygons.map(p=>({minX:Math.min(...p.map(v=>v[0])),maxX:Math.max(...p.map(v=>v[0])),minZ:Math.min(...p.map(v=>v[1])),maxZ:Math.max(...p.map(v=>v[1]))}));
 const boundary=new Map();
 for(const edge of edges){
  const d=sub(edge.b,edge.a),length=Math.hypot(...d),out=[d[1]/length*epsilon*4,-d[0]/length*epsilon*4];
  edge.cuts.sort((a,b)=>a-b);
  for(let i=1;i<edge.cuts.length;i++){
   const lo=edge.cuts[i-1],hi=edge.cuts[i];if((hi-lo)*length<epsilon)continue;
   const probe=point(point(edge.a,d,(lo+hi)/2),out,1);
   const internal=polygons.some((poly,j)=>{
    const b=bounds[j];if(probe[0]<b.minX||probe[0]>b.maxX||probe[1]<b.minZ||probe[1]>b.maxZ)return false;
    return poly.every((a,k)=>cross(sub(poly[(k+1)%poly.length],a),sub(probe,a))>=0);
   });
   if(!internal){const a=point(edge.a,d,lo),b=point(edge.a,d,hi),ak=key(a),bk=key(b);if(ak!==bk)boundary.set(ak+'>'+bk,{a,b,ak,bk});}
  }
 }
 const starts=new Map();
 for(const edge of boundary.values()){if(!starts.has(edge.ak))starts.set(edge.ak,[]);starts.get(edge.ak).push(edge);}
 const loops=[],used=new Set();
 for(const start of boundary.values())if(!used.has(start)){
  const loop=[];let edge=start;
  do{
   used.add(edge);loop.push(edge.a);
   if(edge.bk===start.ak)break;
   edge=starts.get(edge.bk)?.find(e=>!used.has(e));
   if(!edge)throw new Error('Open asylum skirting outline');
  }while(edge!==start);
  if(loop.length>=3)loops.push(loop);
 }
 return loops;
}

export function asylumSkirtingGeometry(THREE,walls){
 const loops=outlineUnion(footprints(walls)),path=new THREE.ShapePath();
 // X/-Z makes exterior boundaries clockwise in the extrusion's XY plane.
 for(const loop of loops){path.moveTo(loop[0][0],-loop[0][1]);for(const p of loop.slice(1))path.lineTo(p[0],-p[1]);path.currentPath.closePath();}
 const geometry=new THREE.ExtrudeGeometry(path.toShapes(),{depth:.24,bevelEnabled:false,steps:1,curveSegments:1});
 geometry.rotateX(-Math.PI/2);geometry.translate(0,.01,0);return geometry;
}
