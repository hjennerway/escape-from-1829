import * as T from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(T,1.5);model.updateMatrixWorld(true);
const o=model.getObjectByName('West garden inner pavilion slate roof'),roof=o.material,roofs=[];
model.traverse(o=>{if(o.isMesh&&o.material===roof)roofs.push(o);});
const ray=new T.Raycaster();
console.log(o.position.toArray(),new T.Box3().setFromObject(o));
for(const dx of [-.001,-.0001,0,.0001,.001]){ray.set(new T.Vector3(-37.5+dx,30,14.938750000000002),new T.Vector3(0,-1,0));console.log(dx,ray.intersectObjects(roofs,false).slice(0,4).map(h=>({name:h.object.name,y:h.point.y,face:h.faceIndex})));}
console.log(o.geometry.attributes.position.array);
