import * as T from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(T,1.5);model.updateMatrixWorld(true);
const roof=model.getObjectByName('West end continuous slate roof').material,ray=new T.Raycaster(),slate=[];
model.traverse(o=>{if(o.isMesh&&o.material===roof)slate.push(o);});
const coping=model.getObjectByName('East inside corner continuous coping 3'),p=coping.geometry.attributes.position;
const joins=[];for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(coping.matrixWorld);if(Math.abs(v.y-13.03)<.00001)joins.push(v.toArray());}console.log('Join endpoints',JSON.stringify(joins));
ray.set(new T.Vector3(34,20,17.2),new T.Vector3(0,-1,0));const eave=ray.intersectObjects(model.children.filter(o=>o.isMesh&&o.material===coping.material),false).find(h=>h.point.y>12.8&&h.point.y<13.1);console.log('Adjoining eave',JSON.stringify({y:eave.point.y,bounds:new T.Box3().setFromObject(eave.object)}));
for(const name of ['Entrance east mitred cornice layer 3','East inside corner continuous coping 2','East inside corner continuous coping 3','East wing continuous eaves']){
 const o=model.getObjectByName(name);console.log(name,JSON.stringify({bounds:new T.Box3().setFromObject(o),boundary:o.userData.roofRenderBoundary}));
}
for(const x of [33.64,33.73,33.85])for(const z of [17.1,17.225,17.3,17.4,17.55]){
 ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));console.log(JSON.stringify({x,z,hits:ray.intersectObject(model,true).slice(0,4).map(h=>({name:h.object.name,y:h.point.y}))}));
}
