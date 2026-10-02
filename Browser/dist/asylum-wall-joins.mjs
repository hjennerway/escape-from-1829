// Clipping partitions against the sampled outline can leave up to 0.3 units
// between connected wall runs. Repair the shared centre lines before masonry,
// skirting, maps and collision are built; door and stair openings are wider.
const epsilon=1e-7,maxGap=.3;
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];

export function joinAsylumWalls(walls){
 const joined=walls.map(w=>({...w,a:[...w.a],b:[...w.b]}));
 // A T-junction can meet another repaired end. Resolve those dependencies,
 // always measuring the maximum extension from the original sampled end.
 for(let pass=0;pass<walls.length;pass++){
  let changed=false;
  for(let i=0;i<walls.length;i++){
   const wall=walls[i],result=joined[i];
   for(const end of ['a','b']){
    const p=wall[end],d=sub(p,wall[end==='a'?'b':'a']),length=Math.hypot(...d);
    if(length<epsilon)continue;
    d[0]/=length;d[1]/=length;
    let extension=Infinity,connected=false;
    for(let j=0;j<joined.length;j++)if(i!==j){
     const other=joined[j],v=sub(other.b,other.a),q=sub(other.a,p),den=cross(d,v);
     const along=-dot(q,v)/dot(v,v);
     if(along>=-epsilon&&along<=1+epsilon&&Math.abs(cross(q,v))<epsilon){connected=true;break;}
     if(Math.abs(den)>epsilon){
      const t=cross(q,v)/den,u=cross(q,d)/den;
      if(t>epsilon&&t<=maxGap&&u>=-epsilon&&u<=1+epsilon)extension=Math.min(extension,t);
     }else if(Math.abs(cross(q,d))<.18-epsilon){
      // Collinear gaps matter too: the Reception side wall continues straight
      // into the exterior wall, so there is no perpendicular run to intersect.
      // Slightly offset parallel runs can also meet where their masonry
      // footprints overlap (each wall is 0.18 units thick).
      for(const endpoint of [other.a,other.b]){
       const t=dot(sub(endpoint,p),d);
       if(t>epsilon&&t<=maxGap)extension=Math.min(extension,t);
      }
     }
    }
    if(!connected&&Number.isFinite(extension)&&extension>dot(sub(result[end],p),d)+epsilon){
     result[end]=[p[0]+d[0]*extension,p[1]+d[1]*extension];changed=true;
    }
   }
  }
  if(!changed)break;
 }
 return joined;
}

// Merge full-height masonry only after the renderer cuts windows. Keeping the
// shared navigation runs separate preserves each exterior section's windows.
export function mergeAsylumMasonry(runs){
 const groups=[];
 for(const {a,b} of runs){
  const v=sub(b,a),length=Math.hypot(...v);if(length<epsilon)continue;
  const d=v.map(n=>n/length);
  if(d[0]<-epsilon||(Math.abs(d[0])<epsilon&&d[1]<0)){d[0]*=-1;d[1]*=-1;}
  let group=groups.find(g=>Math.abs(cross(g.d,d))<epsilon&&Math.abs(cross(sub(a,g.origin),d))<epsilon);
  if(!group){group={origin:a,d,intervals:[]};groups.push(group);}
  const values=[dot(sub(a,group.origin),group.d),dot(sub(b,group.origin),group.d)].sort((a,b)=>a-b);
  group.intervals.push(values);
 }
 return groups.flatMap(({origin,d,intervals})=>{
  intervals.sort((a,b)=>a[0]-b[0]);const merged=[];
  for(const [lo,hi] of intervals){const last=merged.at(-1);if(last&&lo<=last[1]+epsilon)last[1]=Math.max(last[1],hi);else merged.push([lo,hi]);}
  return merged.map(([lo,hi])=>({a:[origin[0]+d[0]*lo,origin[1]+d[1]*lo],b:[origin[0]+d[0]*hi,origin[1]+d[1]*hi]}));
 });
}
