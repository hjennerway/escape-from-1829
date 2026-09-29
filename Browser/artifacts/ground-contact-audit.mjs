import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {createAerialLayouts} from '../dist/aerial-layouts.mjs';
import {prepareEstateTimeline} from '../dist/estate-timeline.mjs';
import {PERIODS} from '../dist/estate-periods.mjs';
import {writeFileSync} from 'node:fs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},fillText(){},strokeText(){},measureText:t=>({width:t.length*16})})})};
const e=createEscapeExterior(THREE,1.6),l=createAerialLayouts(THREE,e),timeline=prepareEstateTimeline(THREE,e,l);
e.scene.updateMatrixWorld(true);
const visible=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};
const point=new THREE.Vector3(),matrix=new THREE.Matrix4(),instance=new THREE.Matrix4();
const ground=[],unsupported=[],roots=[],columns=[],skirts=[];
e.model.traverse(o=>{
 if(!o.isMesh)return;
 let tree=false;for(let p=o;p;p=p.parent)if(p===e.trees)tree=true;
 const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();
 const bounds=g.boundingBox.clone().applyMatrix4(o.matrixWorld);
 if(!tree&&!o.isInstancedMesh&&bounds.max.y<.6)ground.push(o);
 if(o.userData.groundContact){skirts.push(o);return;}
 const mat=o.material;
 if(!tree&&!o.isInstancedMesh&&(mat.userData?.estateSurface==='asphalt'||mat.userData?.estateSurface==='gravel'||mat.color?.getHex()===0xb8b9af)&&bounds.max.y<.6&&bounds.min.y>-.149&&!o.userData.groundContactClosed)unsupported.push({name:o.name,parent:o.parent.name,min:bounds.min.toArray(),max:bounds.max.toArray()});
 if(o.userData.broadleafTree)roots.push({o,index:null,type:'broadleaf',root:o.userData.broadleafTree});
 if(o.name.endsWith(' EZ-Tree branches')){let parent=o.parent;while(!parent.userData.ezTree)parent=parent.parent;roots.push({o,index:null,type:'EZ-Tree',root:parent.userData.beechTree,owner:parent});}
 if(o.isInstancedMesh&&/trunk and (branches|limbs|drooping branches)$/.test(o.name)){let parent=o.parent;const root=parent.userData.beechTree??parent.userData.oakTree??parent.userData.willowTree;if(root)roots.push({o,index:0,type:parent.userData.beechTree?'beech':parent.userData.oakTree?'oak':'willow',root});}
 if(!o.isInstancedMesh&&o.name.endsWith(' trunk')&&o.parent.userData.adminPineTree)roots.push({o,index:null,type:'pine',root:o.parent.userData.adminPineTree});
 if(o.name.startsWith('Pebbledash'))for(let i=0;i<(o.isInstancedMesh?o.count:1);i++)columns.push({o,index:o.isInstancedMesh?i:null});
});
const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
function transform(o,index){if(index===null)return o.matrixWorld;o.getMatrixAt(index,instance);return matrix.multiplyMatrices(o.matrixWorld,instance);}
function foot(item,lamp=false){
 const {o,index}=item,g=o.geometry,p=g.attributes.position,m=transform(o,index),bottom=g.boundingBox.min.y;
 let min=Infinity,max=-Infinity;
 for(let i=0;i<(lamp?4:p.count);i++)if(lamp||p.getY(i)<bottom+1e-4){point.fromBufferAttribute(p,i).applyMatrix4(m);min=Math.min(min,point.y);max=Math.max(max,point.y);}
 const center=new THREE.Vector3(0,bottom,0).applyMatrix4(m);return {x:item.root?.x??center.x,z:item.root?.z??center.z,min,max};
}
const states=[];
for(const year of PERIODS.map(p=>p.year)){
 timeline.setPeriod(year);const floors=ground.filter(visible),issues=[];let trees=0,lamps=0;
 for(const [items,lamp] of [[roots,false],[columns,true]])for(const item of items){
  if(!visible(item.owner??item.o))continue;
  const f=foot(item,lamp);ray.set(new THREE.Vector3(f.x,.6,f.z),down);
  const hit=ray.intersectObjects(floors,false).find(h=>h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.5);
  const groundY=hit?.point.y??-.15;if(lamp)lamps++;else trees++;
  if(f.max>groundY+.012)issues.push({name:item.o.name,type:lamp?'lamp':item.type,foot:f,groundY,gap:f.max-groundY});
 }
 states.push({year,trees,lamps,issues});
}
const result={skirts:skirts.length,unsupported,states};writeFileSync(new URL('ground-contact-audit.json',import.meta.url),JSON.stringify(result,null,2));
console.log(JSON.stringify({skirts:skirts.length,unsupported:unsupported.length,examples:unsupported.slice(0,15),states:states.map(s=>({...s,issues:s.issues.slice(0,5),issueCount:s.issues.length}))},null,2));
