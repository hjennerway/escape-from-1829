import * as THREE from '../../dist/vendor/three.module.js';
import {createEscapeExterior} from '../../dist/escape-exterior.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){}})})};
const {model,camera}=createEscapeExterior(THREE,1800/895);model.updateMatrixWorld(true);
camera.position.set(12,32,16);camera.lookAt(42,13,12);camera.fov=47;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),parts=[];model.traverse(o=>{if(o.isMesh)parts.push(o);});
for(const [x,y] of [[780,385],[900,392],[1000,398],[965,680],[980,690],[973,705],[990,710]]){
 ray.setFromCamera(new THREE.Vector2(x/900-1,1-y/447.5),camera);
 console.log(JSON.stringify({screen:[x,y],hits:ray.intersectObjects(parts,false).slice(0,3).map(h=>({name:h.object.name,point:h.point.toArray(),color:h.object.material.color?.getHexString()}))}));
}
for(const o of parts){const b=new THREE.Box3().setFromObject(o);if(b.max.x<39||b.min.x>46||b.max.z<6||b.min.z>20||b.max.y<12||b.min.y>17)continue;if(o.name)console.log(JSON.stringify({name:o.name,bounds:[b.min.toArray(),b.max.toArray()]}));}
const roof=model.getObjectByName('Entrance east recessed slate roof').material,slate=parts.filter(o=>o.material===roof);
for(let t=0;t<=1;t+=.1){const x=29.075+1.8*t,z=17.3-1.8*t;ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));console.log(JSON.stringify({t,x,z,top:ray.intersectObjects(parts,false).slice(0,4).map(h=>({name:h.object.name,y:h.point.y})),roof:ray.intersectObjects(slate,false)[0]?.point.toArray()}));}
for(const o of parts){const b=new THREE.Box3().setFromObject(o);if(o.material.color?.getHexString()!=='e1e3dc'||b.max.x<44||b.min.x>46||b.max.z<6||b.min.z>17||b.max.y<14||b.min.y>15)continue;console.log(JSON.stringify({trim:o.name,bounds:[b.min.toArray(),b.max.toArray()]}));}
for(const [x,z] of [[30.6045,15.5301],[30.6,15.5],[30.6,15.4],[30.6,15.6],[30.7,15.5],[30.5,15.5]]){ray.set(new THREE.Vector3(x,30,z),new THREE.Vector3(0,-1,0));console.log(JSON.stringify({x,z,hits:ray.intersectObjects(parts,false).slice(0,3).map(h=>({name:h.object.name,y:h.point.y}))}));}
const ribbon=model.getObjectByName('East entrance corner slate to render boundary'),p=ribbon.geometry.attributes.position;
for(let j=0;j<p.count;j+=3){const tri=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,j+k).toArray());if(tri.every(v=>v[0]>28&&v[0]<32&&v[2]<16))console.log(JSON.stringify({ribbon:tri}));}
ray.setFromCamera(new THREE.Vector2(980/900-1,1-690/447.5),camera);console.log(JSON.stringify({slateOblique:ray.intersectObjects(slate,false).slice(0,4).map(h=>({name:h.object.name,point:h.point.toArray()}))}));
for(const x of [29.3,29.5,29.7,29.9,30.1]){ray.set(new THREE.Vector3(x,30,15.55),new THREE.Vector3(0,-1,0));console.log(JSON.stringify({x,z:15.55,hits:ray.intersectObjects(slate,false).map(h=>({name:h.object.name,y:h.point.y}))}));}
