import {OS_FOOTPRINTS} from './historic-footprint-data.mjs';
import {historicOSPoint} from './historic-footprints.mjs';
import {photoDetailPrimitives} from './photo-detail-primitives.mjs';

// The user's symmetry correction takes precedence over unequal OS wing lengths.
// Use the western OS half as the dimensional reference, centre its projection
// on the fixed chapel axis, and reflect every wall, roof and detail across it.
import {ESCAPE_CHAPEL} from './chapel.mjs';
const contour=OS_FOOTPRINTS[0].loops[0].map(p=>historicOSPoint(...p));
const sourceCentre=(contour[114][0]+contour[115][0])/2;
const halfOS=[[sourceCentre,contour[114][1]],...contour.slice(115,127),[sourceCentre,contour[126][1]]];
const halfLocal=halfOS.map(([x,z])=>[x-sourceCentre,z+195]);
export const UPTON_FOOTPRINT=Object.freeze([
  ...halfLocal,...halfLocal.slice(1,-1).reverse().map(([x,z])=>[-x,z])
].map(([x,z])=>Object.freeze([ESCAPE_CHAPEL.x+x,z-195])));
export const UPTON_FRITH_OSCROFT=Object.freeze({x:ESCAPE_CHAPEL.x,z:-195,eave:7.8,storeys:2,
  source:'Research/historic-footprints/clean.png',
  aerial:'Research/upton-frith-oscroft/aerial.png',
  symmetry:'Research/upton-frith-oscroft/symmetry.png'});
export const UPTON_VIEWS=Object.freeze({
  upton:{position:[-51,97,-79],target:[ESCAPE_CHAPEL.x,2,-191],fov:48},
  'upton-plan':{position:[ESCAPE_CHAPEL.x,178,-194.99],target:[ESCAPE_CHAPEL.x,0,-195],fov:46},
  'upton-ground':{position:[-28,1.8,-164],target:[ESCAPE_CHAPEL.x,4,-195],fov:58}
});
export function createUptonFrithOscroft(THREE,{brick,roof,worldUV,material}){
  const building=new THREE.Group();building.name='Upton/Frith/Oscroft';
  const {x:cx,z:cz,eave}=UPTON_FRITH_OSCROFT;building.position.set(cx,0,cz);
  const footprint=UPTON_FOOTPRINT.map(([x,z])=>[x-cx,z-cz]);
  const white=material(0xc8c5b5),steel=material(0x414d50),plinth=material(0x68574d);
  const batches=new Map(),openings=[];let mirrorDetails=true;
  function mesh(g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;building.add(o);return o;}
  function box(m,x,y,z,w,h,d,r=0){if(!batches.has(m))batches.set(m,[]);batches.get(m).push({x,y,z,w,h,d,r});if(mirrorDetails)batches.get(m).push({x:-x,y,z,w,h,d,r:-r});}
  function mass(height,bottom,mat,name){
    const shape=new THREE.Shape(footprint.map(([x,z])=>new THREE.Vector2(x,-z)));
    const g=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});g.rotateX(-Math.PI/2);
    const wall=mesh(worldUV(g,1.7),mat,0,bottom,0);wall.name=name;
    wall.userData.collisionFootprint=footprint;return wall;
  }
  mass(eave,0,brick,'Symmetric OS-derived two-storey walls').userData.historicOutlinePadding=.65;
  mass(.38,0,plinth,'Stepped masonry plinth');
  const detail=photoDetailPrimitives(THREE,{model:building,box,mesh,white,steel,material});
  // Inferred regular sash elevations. Schedule openings only on exposed OS edges.
  const area=footprint.reduce((s,a,i)=>{const b=footprint[(i+1)%footprint.length];return s+a[0]*b[1]-b[0]*a[1];},0);
  for(let i=0;i<halfLocal.length-1;i++){
    const a=halfLocal[i],b=halfLocal[i+1],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
    if(length<.05)continue;
    const nx=(area>0?dz:-dz)/length,nz=(area>0?-dx:dx)/length,r=Math.atan2(nx,nz);
    for(const [y,h] of [[.44,.14],[3.9,.13],[7.62,.2]])box(white,(a[0]+b[0])/2+nx*.045,y,(a[1]+b[1])/2+nz*.045,length,h,.13,r);
    box(steel,(a[0]+b[0])/2+nx*.2,eave,(a[1]+b[1])/2+nz*.2,length+.12,.14,.16,r);
    const count=Math.floor((length-.9)/3.35);
    for(let n=0;n<count;n++){
      const t=(n+.5)/count,x=a[0]+dx*t+nx*.02,z=a[1]+dz*t+nz*.02;
      const entry=n===Math.floor(count/2)&&nz>.9&&a[0]<-35;
      if(entry)detail.door(x,z,r);
      for(const y of [2.12,5.8]){
        if(entry&&y<3)continue;
        detail.sash('Upton inferred '+(y<3?'ground':'upper')+' storey',x,y,z,r,1.18,2.2);
        openings.push({x,y,z,rotation:r},{x:-x,y,z,rotation:-r});
      }
    }
    if(length>5)box(steel,a[0]+dx*.035+nx*.2,3.85,a[1]+dz*.035+nz*.2,.09,7.5,.09);
  }
  mirrorDetails=false;
  detail.door(0,halfLocal[0][1]+.02,0);
  detail.sash('Central upper sash',0,5.8,halfLocal[0][1]+.02,0,1.18,2.2);
  openings.push({x:0,y:5.8,z:halfLocal[0][1]+.02,rotation:0});
  function beam(a,b,width,mat,name){
    const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),delta=q.clone().sub(p);
    const o=mesh(new THREE.CylinderGeometry(width,width,delta.length(),5),mat,...p.add(q).multiplyScalar(.5).toArray());
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());o.name=name;
  }
  const roofs=[];
  function hip(name,x1,x2,z1,z2,rise=2.6){
    const x=(x1+x2)/2-sourceCentre,z=(z1+z2)/2-cz,a=(x2-x1)/2+.22,b=(z2-z1)/2+.22,inset=Math.min(a,b)*.92;
    const v=[[-a,0,-b],[a,0,-b],[a,0,b],[-a,0,b],...(a>=b?[[-a+inset,rise,0],[a-inset,rise,0]]:[[0,rise,-b+inset],[0,rise,b-inset]])];
    const faces=a>=b?[[0,1,5],[0,5,4],[1,2,5],[2,3,4],[2,4,5],[3,0,4]]:[[0,1,4],[1,2,5],[1,5,4],[2,3,5],[3,0,4],[3,4,5]];
    const positions=[],uv=[];
    for(const f of faces)for(const i of [...f].reverse()){positions.push(...v[i]);uv.push(v[i][0]/2.5,(v[i][2]+v[i][1])/2.5);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
    mesh(g,roof,x,eave,z).name=name+' slate hip roof';
    const links=a>=b?[[0,4],[3,4],[1,5],[2,5],[4,5]]:[[0,4],[1,4],[2,5],[3,5],[4,5]];
    for(const [i,j] of links)beam([x+v[i][0],eave+v[i][1]+.025,z+v[i][2]],[x+v[j][0],eave+v[j][1]+.025,z+v[j][2]],.055,steel,name+' hip/ridge flashing');
    roofs.push({name,x1:x1-sourceCentre+cx,x2:x2-sourceCentre+cx,z1,z2,rise});
  }
  // The spine and central projections are centred on the chapel; each end
  // pavilion, roof lantern and hooked wing has an exact reflected counterpart.
  const mirrorX=x=>2*sourceCentre-x;
  hip('Continuous central spine',-50.70,mirrorX(-50.70),-202.69,-192.68,2.8);
  for(const [name,x1,x2,z1,z2,rise] of [
    ['Transverse pavilion',-50.70,-29.68,-202.69,-188.97,3.05],
    ['Hooked end pavilion',-57.70,-43.73,-189.50,-182.29,2.2]
  ]){
    hip('West '+name,x1,x2,z1,z2,rise);
    hip('East '+name,mirrorX(x2),mirrorX(x1),z1,z2,rise);
  }
  hip('Central church-facing projection',contour[115][0],mirrorX(contour[115][0]),-202.69,contour[115][1],2.6);
  hip('Central rear projection',contour[126][0],mirrorX(contour[126][0]),contour[126][1],-199.5,2.35);
  mirrorDetails=true;
  const lanternX=-40-sourceCentre,lanternZ=-196-cz,lanternY=10.88;
  box(detail.glass,lanternX,lanternY+.22,lanternZ,2.1,.55,2.1);
  box(white,lanternX,lanternY+.52,lanternZ,2.45,.14,2.45);
  for(const side of [-1,1])for(const axis of [0,1])box(white,lanternX+(axis===0?side:0),lanternY+.22,lanternZ+(axis===1?side:0),.09,.6,.09);
  const dummy=new THREE.Object3D();
  for(const [mat,items] of batches){
    const batch=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,items.length);batch.name='Upton sash windows, stone bands and rainwater goods';batch.castShadow=true;batch.receiveShadow=true;
    items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.rotation.set(0,b.r,0);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});building.add(batch);
  }
  building.userData={...building.userData,source:UPTON_FRITH_OSCROFT,footprint:UPTON_FOOTPRINT,openings,roofs,storeys:2,replacedOSEdges:{sourceBuilding:0,sourceLoop:0,start:109,end:128,endPoint:[contour[108][0],contour[129][1]]}};
  return building;
}
