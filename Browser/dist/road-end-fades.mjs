import {ROAD_STYLE} from './road-style.mjs';
import {applyGroundSurface} from './ground-materials.mjs';
import {applyMineralFinish} from './mineral-materials.mjs';

// Exposed ends verified against the assembled estate. Junctions, forecourts,
// shared/historic joins and the start of each Modern continuation stay paved.
export const GRASS_ROAD_ENDS=Object.freeze({
 'Upton grange':['start'],
 'Gerrard Crescent':['end'],
 'Frost drive':['end'],
 'Vivienne Smith Lane':['start'],
 'Vivienne Smith Lane eastern continuation':['end'],
 'Ross Avenue (Part 2)':['start','end'],
 'Lockwood View':['start','end'],
 'Parsons Lane':['end'],
 'Parsons Lane (Upton Lea)':['end'],
 'Parsons Lane (1829 Central)':['end'],
 'Valley drive':['end'],
 'Parsons Lane northern modern endpoint':['end'],
 'Caldecott Close':['end'],
 'Southern estate drive · section 2':['end']
});
const SETBACK=7,LENGTH=12;
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const grit=(x,z)=>{
 const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);
};
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function trimEnd(points){
 let remaining=SETBACK;
 const cut=points.map(p=>[...p]),tail=[cut.at(-1)];
 while(cut.length>1){
  const b=cut.at(-1),a=cut.at(-2),length=distance(a,b);
  if(length>remaining){
   const p=b.map((v,k)=>v+(a[k]-v)*remaining/length);
   cut[cut.length-1]=p;tail.unshift(p);break;
  }
  remaining-=length;tail.unshift(a);cut.pop();
 }
 return {cut,tail};
}

export function prepareRoadEnds(name,points){
 let body=points;
 const fades=[];
 for(const end of GRASS_ROAD_ENDS[name]??[]){
  const {cut,tail}=trimEnd(end==='start'?[...body].reverse():body);
  body=end==='start'?cut.reverse():cut;
  fades.push({end,points:tail});
 }
 return {points:body,fades,openStart:fades.some(f=>f.end==='start'),openEnd:fades.some(f=>f.end==='end')};
}

// Do not let the last round joint project past the open seam of the ribbon.
export function roadJointAllowed(points,index,ends,width){
 if(ends.openStart&&distance(points[index],points[0])<width/2+.01)return false;
 if(ends.openEnd&&distance(points[index],points.at(-1))<width/2+.01)return false;
 return true;
}

// Vertex alpha survives model compilation and uses the normal ground textures.
// Gravel stays opaque beneath the wearing asphalt, then reveals the actual
// terrain through irregular, feathered margins rather than painting fake grass.
export function createRoadEndFades(THREE,name,width,ends){
 const group=new THREE.Group();group.name=name+' gravel ends';
 const makeMaterial=(kind,color,layer)=>{
  const mat=new THREE.MeshStandardMaterial({color,roughness:1,vertexColors:true,transparent:kind!=='edge',depthWrite:kind==='edge',
   polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:-2*layer});
  if(kind!=='edge')applyGroundSurface(THREE,mat,kind);else applyMineralFinish(THREE,mat);
  return mat;
 };
 // Match the carriageway shade so the worn texture reads as road into grass.
 const gravel=makeMaterial('gravel',ROAD_STYLE.asphalt,ROAD_STYLE.asphaltLayer);
 const asphalt=makeMaterial('asphalt',ROAD_STYLE.asphalt,ROAD_STYLE.asphaltLayer+1);
 // Stone ends by going into the ground, not by turning translucent above it.
 const edge=makeMaterial('edge',ROAD_STYLE.edge,ROAD_STYLE.edgeLayer);
 for(const fade of ends.fades){
  const path=fade.points,endpoint=path.at(-1),previous=path.at(-2),length=distance(previous,endpoint);
  const dir=endpoint.map((v,k)=>(v-previous[k])/length);
  const cumulative=[0];for(let i=1;i<path.length;i++)cumulative.push(cumulative.at(-1)+distance(path[i-1],path[i]));
  const approach=cumulative.at(-1);
  // The road textures share stations and height. Solid stone reaches the lawn
  // sooner, along the seven-metre approach, with level tangents at both ends.
  const stations=[];
  for(const [a,b] of [[-approach,0],[0,LENGTH]]){
   const rows=Math.ceil((b-a)/.22);
   for(let i=stations.length?1:0;i<=rows;i++)stations.push(a+(b-a)*i/rows);
  }
  function frame(s){
   if(s>=0)return {p:endpoint.map((v,k)=>v+dir[k]*s),d:dir};
   const along=Math.max(0,s+approach);
   let i=1;while(i<path.length-1&&cumulative[i]<along)i++;
   const a=path[i-1],b=path[i],len=cumulative[i]-cumulative[i-1],t=(along-cumulative[i-1])/len;
   return {p:a.map((v,k)=>v+(b[k]-v)*t),d:b.map((v,k)=>(v-a[k])/len)};
  }
  function surface(kind,material,start,finish,across,side=1){
   const samples=stations.filter(s=>s>=start&&s<=finish),rows=samples.length-1,cols=across,positions=[],colors=[],uv=[],indices=[];
   for(let i=0;i<=rows;i++){
    const s=samples[i],{p,d}=frame(s),n=[-d[1],d[0]];
    // Retain a broad neck as the worn road dissolves into the lawn.
    const half=width/2*(1-.30*smooth(0,7,s));
    for(let j=0;j<=cols;j++){
     const lateral=j/cols*2-1;
     let offset=half*lateral;
     if(kind==='edge')offset=(width/2+ROAD_STYLE.edgeWidth*(1-.5*smooth(-approach,0,s))*j/cols)*side;
     const x=p[0]+n[0]*offset,z=p[1]+n[1]*offset;
     const noise=(grit(x*2,z*2)-.5)*.8+Math.sin(x*2.3+z*.8)*.13;
     const wear=smooth(-SETBACK,-.3,s+noise);
     let alpha=kind==='asphalt'?1-wear:1;
     if(kind==='gravel'){
      const feather=smooth(-SETBACK,1,s)*(.18+noise*.07);
      alpha=(1-smooth(1-feather,1,Math.abs(lateral)))*(1-smooth(4,LENGTH,s+noise*2));
      if(i===0)alpha=1;
     }
     if(i===0)alpha=1;
     if(i===rows&&kind!=='edge')alpha=0;
     const top=kind==='edge'?.32:ROAD_STYLE.asphaltY;
     const y=kind==='edge'?top+(-.17-top)*smooth(-approach,0,s):top+(-.145-top)*smooth(-approach,LENGTH,s);
     positions.push(x,y,z);uv.push(x/12,z/12);colors.push(1,1,1,alpha);
    }
   }
   for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
    const a=i*(cols+1)+j,b=a+cols+1;
    if(side<0)indices.push(a,b,a+1,a+1,b,b+1);else indices.push(a,a+1,b,a+1,b+1,b);
   }
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
   geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
   const mesh=new THREE.Mesh(geometry,material);mesh.name=name+' '+fade.end+' '+kind+' fade';mesh.receiveShadow=true;
   mesh.renderOrder=kind==='edge'?1:kind==='asphalt'?6:5;mesh.userData.roadEndFade={kind,columns:cols};mesh.userData.surface=kind==='gravel'?'gravel':kind==='asphalt'?'black road':'stone kerb';
   if(kind!=='gravel'){
    // Close both sides of the solid stone ramp. The asphalt rim retains its
    // wearing coverage, with no opaque face across the open road mouth.
    const positions=[],colors=[],uv=[];
    for(const column of [0,cols])for(let row=0;row<rows;row++){
     const a=row*(cols+1)+column,b=a+cols+1,p=geometry.attributes.position,c=geometry.attributes.color;
     const length=Math.hypot(p.getX(b)-p.getX(a),p.getZ(b)-p.getZ(a))/12;
     for(const [index,bottom,u] of [[a,false,0],[a,true,0],[b,false,length],[b,false,length],[a,true,0],[b,true,length]]){
      // Stone continues below the lawn; asphalt retains its thin fading rim.
      const foot=kind==='edge'?-.19:p.getY(index)-.02*(p.getY(index)+.145)/(ROAD_STYLE.asphaltY+.145);
      positions.push(p.getX(index),bottom?foot:p.getY(index),p.getZ(index));
      colors.push(1,1,1,c.getW(index));uv.push(u,bottom?0:(p.getY(index)-foot)/12);
     }
    }
    const sideGeometry=new THREE.BufferGeometry();sideGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    sideGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));sideGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));sideGeometry.computeVertexNormals();
    const sideMaterial=material.clone();sideMaterial.polygonOffset=false;sideMaterial.polygonOffsetFactor=sideMaterial.polygonOffsetUnits=0;sideMaterial.side=THREE.DoubleSide;
    delete sideMaterial.userData.estateSurface;delete sideMaterial.userData.mineralFinish;sideMaterial.userData.groundContactSide=true;
    const support=new THREE.Mesh(sideGeometry,sideMaterial);support.name=mesh.name+' sloping sides';support.renderOrder=mesh.renderOrder;support.receiveShadow=true;
    support.userData={groundContact:kind==='edge',roadEndSide:true};mesh.add(support);
   }
   group.add(mesh);return mesh;
  }
  // Keep gravel under the full width of the approach; asphalt gradually wears
  // away into the broad grassy end. Solid borders taper below the lawn.
  surface('gravel',gravel,-approach,LENGTH,32);
  surface('asphalt',asphalt,-approach,0,32);
  for(const side of [-1,1])surface('edge',edge,-approach,0,4,side);
 }
 return group;
}
