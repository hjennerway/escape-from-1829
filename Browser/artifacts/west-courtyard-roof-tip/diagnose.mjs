import * as T from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model,camera}=createEscapeExterior(T,1065/640);model.updateMatrixWorld(true);
camera.position.set(-51,23,-6);camera.lookAt(-61.5,14,5.2);camera.fov=29;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
const ray=new T.Raycaster(),parts=[];model.traverseVisible(o=>{if(o.isMesh)parts.push(o);});
for(const [x,y] of [[577,287],[581,289],[590,291],[664,453],[661,452],[665,463]]){
 ray.setFromCamera(new T.Vector2(x/1065*2-1,1-y/640*2),camera);
 console.log('screen',x,y,ray.intersectObjects(parts,false).slice(0,5).map(h=>({name:h.object.name,point:h.point.toArray(),color:h.object.material.color.getHexString()})));
}
for(const o of parts){const b=new T.Box3().setFromObject(o);if(b.min.x> -64&&b.max.x< -58&&b.min.z>4&&b.max.z<7.5&&b.min.y>13)console.log('piece',o.name,JSON.stringify(b));}
