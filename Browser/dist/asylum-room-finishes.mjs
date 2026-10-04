import {insidePolygon,segmentDistance} from './asylum-layout.mjs';
import {ROOM_USES} from './asylum-room-uses.mjs';

export const ROOM_WALL_COLOURS=[
 {name:'dusty rose',colour:0xb29993},
 {name:'sage',colour:0x969f8f},
 {name:'faded blue',colour:0x8593a4}
];
export const ROOM_DADO_FRACTION=.4;
const plainUses=new Set(['hydrotherapy','showerTreatment','surgery','ect','electricalTreatment','treatment','stairs','porch','circulation']);
export function roomWallColour(floor,room){
 const use=ROOM_USES[floor.id]?.[room.id];
 return use&&!plainUses.has(use)?(Number(room.id.replace(/\D/g,''))+floor.id)%ROOM_WALL_COLOURS.length:-1;
}
const eps=1e-6,probe=.025;
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
const difference=(a,b)=>[a[0]-b[0],a[1]-b[1]];

// Classify the exposed face, never the centre of a two-sided partition.
// Corridor/stair priority covers room envelopes that include circulation.
function finishRegions(floor){
 const rooms=floor.rooms.map(room=>({room,colour:roomWallColour(floor,room)})).filter(r=>r.colour>=0);
 const corridors=floor.corridors.flatMap(c=>c.points.slice(1).map((b,i)=>({a:c.points[i],b,r:c.width/2-.05})));
 const shafts=floor.shafts??[];
 const polygons=rooms.map(r=>r.room.points);
 for(const c of corridors){
  const d=difference(c.b,c.a),length=Math.hypot(...d),n=[-d[1]/length*c.r,d[0]/length*c.r];
  polygons.push([c.a.map((v,i)=>v+n[i]),c.b.map((v,i)=>v+n[i]),c.b.map((v,i)=>v-n[i]),c.a.map((v,i)=>v-n[i])]);
 }
 for(const s of shafts)polygons.push([[s.minX,s.minZ],[s.maxX,s.minZ],[s.maxX,s.maxZ],[s.minX,s.maxZ]]);
 return {
  at(x,z){
   if(corridors.some(c=>segmentDistance(x,z,c.a,c.b)<c.r)||shafts.some(s=>x>s.minX&&x<s.maxX&&z>s.minZ&&z<s.maxZ))return null;
   return rooms.find(r=>insidePolygon(x,z,r.room.points))??null;
  },
  cuts(origin,tangent,lo,hi){
   const cuts=[lo,hi];
   for(const poly of polygons)for(let i=0;i<poly.length;i++){
    const a=poly[i],edge=difference(poly[(i+1)%poly.length],a),den=cross(tangent,edge);
    if(Math.abs(den)<eps)continue;
    const q=difference(a,origin),u=cross(q,edge)/den,v=cross(q,tangent)/den;
    if(v>=-eps&&v<=1+eps&&u>lo+eps&&u<hi-eps)cuts.push(u);
   }
   // Rounded ends of corridor runs use the same distance test as navigation.
   for(const c of corridors)for(const p of [c.a,c.b]){
    const q=difference(origin,p),b=dot(q,tangent),discriminant=b*b-dot(q,q)+c.r*c.r;
    if(discriminant<0)continue;
    for(const u of [-b-Math.sqrt(discriminant),-b+Math.sqrt(discriminant)])if(u>lo+eps&&u<hi-eps)cuts.push(u);
   }
   return [...new Set(cuts.map(v=>Math.round(v/eps)*eps))].sort((a,b)=>a-b);
  }
 };
}

function clip(vertices,axis,limit,above){
 const result=[];
 for(let i=0;i<vertices.length;i++){
  const a=vertices[i],b=vertices[(i+1)%vertices.length],av=dot([a[0],a[2]],axis),bv=dot([b[0],b[2]],axis);
  const ai=above?av>=limit:av<=limit,bi=above?bv>=limit:bv<=limit;
  if(ai)result.push(a);
  if(ai!==bi){const t=(limit-av)/(bv-av);result.push(a.map((v,j)=>v+(b[j]-v)*t));}
 }
 return result;
}

export function createAsylumRoomFinisher(THREE,floor,ceilingHeight){
 const regions=finishRegions(floor),railHeight=ceilingHeight*ROOM_DADO_FRACTION,railPieces=[];
 return {
  geometry(source){
   const input=source.index?source.toNonIndexed():source,p=input.attributes.position,n=input.attributes.normal,uv=input.attributes.uv;
   const positions=[],normals=[],uvs=[],finishes=[];
   const emit=(vertices,finish)=>{
    for(let i=1;i<vertices.length-1;i++){
     const tri=[vertices[0],vertices[i],vertices[i+1]];
     const a=new THREE.Vector3(...tri[0].slice(0,3)),b=new THREE.Vector3(...tri[1].slice(0,3)),c=new THREE.Vector3(...tri[2].slice(0,3));
     if(new THREE.Vector3().crossVectors(b.sub(a),c.sub(a)).lengthSq()<1e-16)continue;
     for(const v of tri){positions.push(...v.slice(0,3));normals.push(...v.slice(3,6));uvs.push(...v.slice(6,8));finishes.push(finish?finish.colour+1:0,railHeight);}
    }
   };
   for(let i=0;i<p.count;i+=3){
    const tri=Array.from({length:3},(_,j)=>[p.getX(i+j),p.getY(i+j),p.getZ(i+j),n.getX(i+j),n.getY(i+j),n.getZ(i+j),uv.getX(i+j),uv.getY(i+j)]);
    if(Math.abs(tri[0][4])>.001){emit(tri,null);continue;}
    const normal=[tri[0][3],tri[0][5]],tangent=[normal[1],-normal[0]],line=dot([tri[0][0],tri[0][2]],normal);
    const origin=normal.map(v=>v*(line+probe)),values=tri.map(v=>dot([v[0],v[2]],tangent)),lo=Math.min(...values),hi=Math.max(...values);
    const cuts=regions.cuts(origin,tangent,lo,hi);
    for(let j=1;j<cuts.length;j++){
     const left=j===1?lo:cuts[j-1],right=j===cuts.length-1?hi:cuts[j];
     if(right-left<eps)continue;
     const u=(left+right)/2,finish=regions.at(origin[0]+tangent[0]*u,origin[1]+tangent[1]*u);
     const polygon=clip(clip(tri,tangent,left,true),tangent,right,false);emit(polygon,finish);
     if(!finish)continue;
     // Rails only come from surfaces present at this height. Window apertures,
     // door openings and stair mouths therefore stay physically clear.
     const intersections=[];
     for(let k=0;k<polygon.length;k++){
      const a=polygon[k],b=polygon[(k+1)%polygon.length];
      if((a[1]<=railHeight&&b[1]>railHeight)||(b[1]<=railHeight&&a[1]>railHeight)){
       const t=(railHeight-a[1])/(b[1]-a[1]);intersections.push([a[0]+(b[0]-a[0])*t,a[2]+(b[2]-a[2])*t]);
      }
     }
     if(intersections.length===2&&Math.hypot(...difference(...intersections))>eps)railPieces.push({a:intersections[0],b:intersections[1],normal});
    }
   }
   const result=new THREE.BufferGeometry();
   result.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
   result.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
   result.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
   result.setAttribute('roomFinish',new THREE.Float32BufferAttribute(finishes,2));
   if(input!==source)input.dispose();return result;
  },
  rail(windowFrames=[]){return dadoGeometry(THREE,railPieces,railHeight,windowFrames);}
 };
}

function dadoGeometry(THREE,pieces,y,windowFrames){
 // Merge triangulation cuts into continuous runs, with one stepped moulding
 // profile and mitred joints. All rooms share one rail mesh per floor.
 const groups=new Map();
 for(const p of pieces){
  const n=p.normal,t=[n[1],-n[0]],line=dot(p.a,n),key=[...n,line].map(v=>v.toFixed(5)).join(',');
  if(!groups.has(key))groups.set(key,{n,t,line,spans:[]});
  groups.get(key).spans.push([dot(p.a,t),dot(p.b,t)].sort((a,b)=>a-b));
 }
 const runs=[];
 for(const g of groups.values()){
  g.spans.sort((a,b)=>a[0]-b[0]);const merged=[];
  for(const span of g.spans){const previous=merged.at(-1);if(previous&&span[0]<=previous[1]+eps*4)previous[1]=Math.max(previous[1],span[1]);else merged.push([...span]);}
  for(const [lo,hi] of merged){
   let spans=[[lo,hi]];
   for(const w of windowFrames){
    if(y+.052<=w.bottom||y-.052>=w.top)continue;
    // Clip the complete moulding against the outer timber frame, including
    // rails on the perpendicular masonry reveals. Account for its 35mm
    // projection so a reveal's raised profile cannot reach back into a jamb.
    const offset=difference(g.n.map(v=>v*g.line),[w.x,w.z]);
    let start=-Infinity,end=Infinity;
    for(const [axis,half] of [[[w.dx,w.dz],w.width/2],[[-w.dz,w.dx],w.depth/2]]){
     const origin=dot(offset,axis),direction=dot(g.t,axis),reach=.035*dot(g.n,axis);
     // A 20-micrometre gap keeps rounded Float32 endpoints outside the timber.
     const lower=-half-Math.max(0,reach)-.00002,upper=half-Math.min(0,reach)+.00002;
     if(Math.abs(direction)<eps){if(origin<lower||origin>upper){end=-Infinity;break;}}
     else{const limits=[(lower-origin)/direction,(upper-origin)/direction].sort((a,b)=>a-b);start=Math.max(start,limits[0]);end=Math.min(end,limits[1]);}
    }
    if(start>=end)continue;
    spans=spans.flatMap(([a,b])=>end<=a||start>=b?[[a,b]]:[...(start>a?[[a,start]]:[]),...(end<b?[[end,b]]:[])]);
   }
   for(const [a,b] of spans)if(b-a>eps)runs.push({n:g.n,t:g.t,a:g.n.map((v,i)=>v*g.line+g.t[i]*a),b:g.n.map((v,i)=>v*g.line+g.t[i]*b)});
  }
 }
 const nodes=new Map(),key=p=>p.map(v=>v.toFixed(5)).join(',');
 for(const r of runs)for(const end of ['a','b']){const k=key(r[end]);if(!nodes.has(k))nodes.set(k,[]);nodes.get(k).push(r);}
 const profile=[[0,-.052],[.016,-.052],[.016,-.033],[.029,-.021],[.035,-.005],[.035,.010],[.029,.025],[.016,.036],[.016,.052],[0,.052]];
 const positions=[];
 for(const r of runs){
  const section=(end)=>profile.map(([depth,dy])=>{
   const p=r[end],other=nodes.get(key(p))?.find(v=>v!==r&&dot(v.n,r.n)<.9999);let along=0;
   if(other){const den=dot(r.t,other.n);if(Math.abs(den)>eps)along=depth*(1-dot(r.n,other.n))/den;if(Math.abs(along)>.12)along=0;}
   return [p[0]+r.n[0]*depth+r.t[0]*along,y+dy,p[1]+r.n[1]*depth+r.t[1]*along];
  });
  const a=section('a'),b=section('b');
  const face=(v0,v1,v2)=>positions.push(...v0,...v1,...v2);
  for(let i=0;i<profile.length;i++){const j=(i+1)%profile.length;face(a[i],b[i],b[j]);face(a[i],b[j],a[j]);}
  // Free ends cap at window/door casings. Joints have no internal caps.
  if(nodes.get(key(r.a)).length===1)for(let i=1;i<a.length-1;i++)face(a[0],a[i],a[i+1]);
  if(nodes.get(key(r.b)).length===1)for(let i=1;i<b.length-1;i++)face(b[0],b[i+1],b[i]);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();
 geometry.userData={runs:runs.length,height:y,projection:.035};return geometry;
}

const materialCache=new WeakMap();
export function asylumRoomWallMaterials(THREE,base){
 if(materialCache.has(base))return materialCache.get(base);
 const result={...base};
 for(const kind of ['Brick','Plaster']){
  const original=base[kind],material=original.clone();
  material.onBeforeCompile=shader=>{
   original.onBeforeCompile(shader);
   Object.assign(shader.uniforms,{
    roomWallpaperMap:{value:base.RoomWallpaper.map},roomPaintMap:{value:base.RoomPaint.map},
    roomRose:{value:new THREE.Color(ROOM_WALL_COLOURS[0].colour)},roomSage:{value:new THREE.Color(ROOM_WALL_COLOURS[1].colour)},roomBlue:{value:new THREE.Color(ROOM_WALL_COLOURS[2].colour)}
   });
   shader.vertexShader='attribute vec2 roomFinish;\nvarying vec2 vRoomFinish;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRoomFinish=roomFinish;');
   shader.fragmentShader=`varying vec2 vRoomFinish;
    uniform sampler2D roomWallpaperMap;uniform sampler2D roomPaintMap;
    uniform vec3 roomRose;uniform vec3 roomSage;uniform vec3 roomBlue;
   `+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`
    #include <color_fragment>
    if(vRoomFinish.x>.5&&vFinishPosition.y<vRoomFinish.y/${ROOM_DADO_FRACTION.toFixed(2)}+.001){
     vec2 roomUv=vec2(dot(vFinishPosition.xz,vec2(vFinishNormal.z,-vFinishNormal.x)),vFinishPosition.y);
     if(vFinishPosition.y<vRoomFinish.y)diffuseColor.rgb=texture2D(roomPaintMap,roomUv/1.4).rgb;
     else{
      vec3 tint=vRoomFinish.x<1.5?roomRose:(vRoomFinish.x<2.5?roomSage:roomBlue);
      diffuseColor.rgb=texture2D(roomWallpaperMap,roomUv/vec2(.95,1.18)).rgb*tint;
     }
    }
   `);
   // Paper and painted plaster cover the mortar relief, including the former
   // brick seam at 1.1m. Corridor faces retain their existing bump mapping.
   shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`if(vRoomFinish.x<.5){\n${THREE.ShaderChunk.normal_fragment_maps}\n}`);
  };
  material.customProgramCacheKey=()=>original.customProgramCacheKey()+'-room-damask-v1';result[kind]=material;
 }
 materialCache.set(base,result);return result;
}
