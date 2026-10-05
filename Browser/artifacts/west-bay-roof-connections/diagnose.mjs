import * as T from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(T,1.5);model.updateMatrixWorld(true);
const ray=new T.Raycaster();
for(const [x,z] of [[-61.85,4.6],[-54.95,4.6],[-55.79,13.45],[-49.21,13.45]]){
 console.log('CORNER',x,z);
 for(const dx of [-.2,0,.2])for(const dz of [-.2,0,.2]){ray.set(new T.Vector3(x+dx,30,z+dz),new T.Vector3(0,-1,0));console.log(dx,dz,ray.intersectObject(model,true).slice(0,5).map(h=>({name:h.object.name,y:h.point.y})));}
}
