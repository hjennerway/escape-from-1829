import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from '../dist/estate-timeline.mjs';
import {PERIODS} from '../dist/estate-periods.mjs';
import {createCountryside} from '../dist/countryside.mjs';
import {writeFileSync} from 'node:fs';

globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6),layouts=createAerialLayouts(THREE,e);
const timeline=prepareEstateTimeline(THREE,e,layouts);
createCountryside(THREE,e);e.scene.updateMatrixWorld(true);
const terrainY=-.15,tolerance=.025,ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
const matrix=new THREE.Matrix4(),instance=new THREE.Matrix4(),bounds=new THREE.Box3();
const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),normal=new THREE.Vector3();
const candidates=[];
// Inspect every upward triangle, including individual instances, in a 5 cm
// band centred on the estate lawn. Sample clipped polygons, not mesh bounds.
e.scene.traverse(object=>{
  if(!object.isMesh||object===e.terrain||object.parent===e.terrain||object.parent.name==='Unexcavated frontage terrain')return;
  const g=object.geometry,p=g.attributes.position,index=g.index;
  if(!g.boundingBox)g.computeBoundingBox();
  for(let inst=0;inst<(object.isInstancedMesh?object.count:1);inst++){
    if(object.isInstancedMesh){object.getMatrixAt(inst,instance);matrix.multiplyMatrices(object.matrixWorld,instance);}else matrix.copy(object.matrixWorld);
    bounds.copy(g.boundingBox).applyMatrix4(matrix);
    if(bounds.min.y>terrainY+tolerance||bounds.max.y<terrainY-tolerance)continue;
    for(let i=0;i<(index?.count??p.count);i+=3){
      [a,b,c].forEach((v,j)=>v.fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(matrix));
      normal.subVectors(b,a).cross(new THREE.Vector3().subVectors(c,a)).normalize();
      if(normal.y<.95)continue;
      let polygon=[a.clone(),b.clone(),c.clone()];
      for(const [edge,sign] of [[terrainY-tolerance,1],[terrainY+tolerance,-1]]){
        const next=[];
        for(let j=0;j<polygon.length;j++){
          const v=polygon[j],w=polygon[(j+1)%polygon.length],dv=(v.y-edge)*sign,dw=(w.y-edge)*sign;
          if(dv>=0)next.push(v);
          if((dv>=0)!==(dw>=0))next.push(v.clone().lerp(w,dv/(dv-dw)));
        }
        polygon=next;
      }
      if(polygon.length<3)continue;
      const center=polygon.reduce((sum,v)=>sum.add(v),new THREE.Vector3()).divideScalar(polygon.length);
      const samples=[center,...polygon.map(v=>v.clone().lerp(center,.05))];
      const contacts=samples.filter(point=>{
        ray.set(new THREE.Vector3(point.x,terrainY+.1,point.z),down);
        return ray.intersectObject(e.terrain,false).length>0;
      });
      if(contacts.length)candidates.push({object,instance:object.isInstancedMesh?inst:null,triangle:i/3,contacts});
    }
  }
});
const isVisible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
const report={tolerance,trianglesNearTerrain:candidates.length,states:[]};
for(const state of ['historic','modern','both','hidden',...PERIODS.map(p=>p.year)]){
  if(typeof state==='number')timeline.setPeriod(state);
  else {layouts.setVisible('historic',state==='historic'||state==='both');layouts.setVisible('modern',state==='modern'||state==='both');}
  e.scene.updateMatrixWorld(true);
  const meshes=[];e.scene.traverseVisible(o=>{if(o.isMesh&&o!==e.terrain){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();meshes.push({object:o,bounds:new THREE.Box3().setFromObject(o)});}});
  const records=new Map();
  for(const candidate of candidates){
    const {object}=candidate;if(!isVisible(object))continue;
    const key=object.id+':'+candidate.instance;
    if(records.get(key)?.exposed)continue;
    const record=records.get(key)??{name:object.name,parent:object.parent.name,instance:candidate.instance,color:object.material.color?.getHexString(),depthBiased:Boolean(object.material.polygonOffset&&object.material.polygonOffsetUnits<0),exposed:false,samples:[]};
    for(const p of candidate.contacts){
      const local=meshes.filter(m=>p.x>=m.bounds.min.x&&p.x<=m.bounds.max.x&&p.z>=m.bounds.min.z&&p.z<=m.bounds.max.z).map(m=>m.object);
      ray.set(new THREE.Vector3(p.x,200,p.z),down);const hit=ray.intersectObjects(local,false)[0];
      if(hit?.object===object&&Math.abs(hit.point.y-p.y)<1e-4){record.exposed=true;record.samples=[p.toArray()];break;}
      if(record.samples.length<2)record.samples.push(p.toArray());
    }
    records.set(key,record);
  }
  report.states.push({state,overlaps:[...records.values()]});
  console.log(JSON.stringify({state,overlaps:records.size,exposed:[...records.values()].filter(r=>r.exposed)}));
}
writeFileSync(new URL('./terrain-overlap-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
