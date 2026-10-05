import * as T from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(T,1.5);model.updateMatrixWorld(true);
const material=model.getObjectByName('West end continuous slate roof').material,slate=[];
model.traverse(o=>{if(o.isMesh&&o.material===material)slate.push(o);});const ray=new T.Raycaster();
for(const name of ['West inside corner continuous coping 1','West inside corner continuous coping 2','West inside corner continuous coping 5','Entrance west mitred cornice layer 3','West inside corner brick facet 5']){
 const o=model.getObjectByName(name);console.log(name,JSON.stringify(new T.Box3().setFromObject(o)));
}
for(const [x,z] of [[-38,15.5],[-37,15.5],[-35,15.5],[-33.65,15.5],[-32,15.5],[-30.875,15.5],[-29.075,17.3],[-29.15,17.3]]){
 ray.set(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));console.log(x,z,ray.intersectObjects(slate,false).slice(0,4).map(h=>[h.point.y,h.object.name]));
}
