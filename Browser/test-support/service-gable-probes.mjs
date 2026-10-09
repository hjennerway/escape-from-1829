import assert from 'node:assert/strict';
import {TOWER_RANGES,TOWER_WORKSHOP_COPY} from '../dist/tower-buildings.mjs';

export function checkServiceGableJoins(THREE,group){
 group.updateWorldMatrix(true,true);
 const meshes=[];group.traverse(o=>{if(o.isMesh&&!o.userData.aerialBatch&&!o.userData.buildingWindowProxy)meshes.push(o);});
 const ray=new THREE.Raycaster();let baseSamples=0,gableSamples=0,undersideSamples=0;
 const cast=(point,out,reach=.35)=>{const n=new THREE.Vector3(...out);ray.set(new THREE.Vector3(...point).addScaledVector(n,reach),n.negate());ray.far=reach+.004;return ray.intersectObjects(meshes,false);};
 const ranges=TOWER_RANGES.filter(r=>['gable','hip','hip-gable'].includes(r.roof));
 const original=TOWER_RANGES.find(r=>r.name===TOWER_WORKSHOP_COPY.source);
 // The wider copy inherits the same enclosure with its actual width scale.
 ranges.push({...original,name:TOWER_WORKSHOP_COPY.name,rect:TOWER_WORKSHOP_COPY.rect,overhangX:.3});
 for(const r of ranges){
  const [x0,z0,x1,z1]=r.roofRect??r.rect,ox=r.overhangX??.2,oz=.2,h=r.height;
  const sides=[['west',x0-ox,z0-oz,z1+oz,[-1,0,0]],['east',x1+ox,z0-oz,z1+oz,[1,0,0]],['north',z0-oz,x0-ox,x1+ox,[0,0,-1]],['south',z1+oz,x0-ox,x1+ox,[0,0,1]]];
  for(const [side,plane,start,end,out] of sides){
   const alongX=side==='north'||side==='south';
   const point=(t,y)=>alongX?[start+(end-start)*t,y,plane]:[plane,y,start+(end-start)*t];
   for(const t of [.07,.19,.37,.61,.83,.94]){
    // The old .14-high opening could not be filled by either the wall or gable.
    for(const offset of [.025,.065,.115]){
     assert(cast(point(t,h+offset),out).length,'Continuous masonry across former wall-top slot: '+r.name+' '+side+' '+t+' '+offset);baseSamples++;
    }
    const q=point(t,h);q[0]-=out[0]*.035;q[2]-=out[2]*.035;
    assert(cast(q,[0,-1,0],.025).length,'Opaque underside between gable and supporting wall: '+r.name+' '+side);undersideSamples++;
   }
   const isGable=r.roof==='gable'?(r.axis==='x'?!alongX:alongX):r.roof==='hip-gable'&&side===r.gableEnd;
   if(!isGable)continue;
   const enclosure=group.getObjectByName(r.name+' brick gable');assert(enclosure,'Inspect original authored gable');
   for(const t of [.13,.29,.43,.57,.71,.87])for(const f of [.15,.51,.86]){
    const y=h+.14+r.rise*(1-Math.abs(t*2-1))*f;
    const q=point(t,y),hits=cast(q,out).filter(hit=>Math.abs(hit.distance-.35)<.001);
    assert.equal(hits.length,1,'A single outward face, without coplanar filler: '+r.name+' '+side+' '+q);gableSamples++;
   }
  }
 }
 // Sample clear glass, avoiding sash bars. Its former position was buried
 // behind the overhanging masonry even though its centre bar stayed visible.
 for(const z of [-4.12,-3.46])for(const y of [10.06,10.93]){
  const hit=cast([228.6,y,z],[1,0,0],.6)[0];
  assert(hit?.object.material.userData.windowGlass,'High stores sash exposes glass rather than brick');
 }
 console.log(`PASS: ${baseSamples} service wall joins, ${gableSamples} single-face gable rays, ${undersideSamples} closed undersides and four clear sash panes.`);
 return {baseSamples,gableSamples,undersideSamples};
}
