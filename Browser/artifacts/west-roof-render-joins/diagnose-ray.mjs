import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model}=createEscapeExterior(THREE,1.5);model.updateMatrixWorld(true);
for(const kind of []){
 const original=kind.prototype.raycast;
 kind.prototype.raycast=function(...args){
  const heavy=this.geometry.attributes.position.count>5000||this.count>100;
  if(heavy)console.log('start',this.name,this.count,this.geometry.attributes.position.count);
  const before=performance.now();original.apply(this,args);
  if(heavy||performance.now()-before>20)console.log('end',this.name,performance.now()-before);
 };
}
const camera=new THREE.PerspectiveCamera(55,1400/950,.1,500);camera.position.set(-48,31,-18);camera.lookAt(-54,12,10);camera.updateMatrixWorld(true);
const ray=new THREE.Raycaster();ray.far=50;
for(const [x,y] of [[1057,415],[1061,425],[1051,423],[1068,419],[765,485],[764,478],[760,490]]){
 console.log('start pixel',x,y);const before=performance.now();
 ray.setFromCamera(new THREE.Vector2(x/1400*2-1,1-y/950*2),camera);
 const h=ray.intersectObject(model,true)[0];console.log(h?.object.name,h?.point.toArray(),performance.now()-before);
}
