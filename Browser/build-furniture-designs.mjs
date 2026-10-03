// MIT adaptations of the pinned ShopPrentice Windsor chair / Shaker nightstand.
// This is a visible-surface game mesh, not an execution/export of Fusion's timeline.
// Source scripts, parameters, references and original licence accompany the repo.
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const root=new URL('./dist/models/furniture/',import.meta.url),inch=.0254;
const hash=data=>createHash('sha256').update(data).digest('hex');
function part(parts,geometry,shade=1){
 const g=geometry.index?geometry.toNonIndexed():geometry;g.deleteAttribute('uv');
 const colours=new Float32Array(g.attributes.position.count*3);colours.fill(shade);g.setAttribute('color',new THREE.BufferAttribute(colours,3));parts.push(g);
}
function box(parts,w,h,d,x,y,z,shade=1){part(parts,new THREE.BoxGeometry(w,h,d).translate(x,y,z),shade);}
function turned(parts,a,b,profile,shade=1){
 const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),direction=end.clone().sub(start),length=direction.length();
 const points=profile.map(([t,r])=>new THREE.Vector2(r,t*length)),g=new THREE.LatheGeometry(points,12);
 g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize())).translate(...a);part(parts,g,shade);
}
function windsor(){
 const parts=[],sw=18*inch,sd=15*inch,seatH=17.5*inch,seatT=1.75*inch;
 const s=new THREE.Shape(),corner=inch;
 s.moveTo(-sw/2+corner,0);s.quadraticCurveTo(0,-.014,sw/2-corner,0);s.quadraticCurveTo(sw/2,0,sw/2-corner*.18,corner);
 s.lineTo(7*inch+corner*.18,sd-corner);s.quadraticCurveTo(7*inch,sd,7*inch-corner,sd);s.quadraticCurveTo(0,sd+.005,-7*inch+corner,sd);
 s.quadraticCurveTo(-7*inch,sd,-7*inch-corner*.18,sd-corner);s.lineTo(-sw/2+corner*.18,corner);s.quadraticCurveTo(-sw/2,0,-sw/2+corner,0);s.closePath();
 const seat=new THREE.ExtrudeGeometry(s,{depth:seatT-.006,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.003,bevelThickness:.003,curveSegments:12});
 seat.rotateX(-Math.PI/2).translate(0,seatH-seatT+.003,sd/2);
 // Subdivide the top triangulation for two shallow seat scoops. The outline
 // and edge thickness remain intact; invisible joinery is deliberately omitted.
 const expanded=seat.index?seat.toNonIndexed():seat,pos=expanded.attributes.position,vertices=[];
 const midpoint=(a,b)=>a.map((v,i)=>(v+b[i])/2);
 function subdivide(a,b,c,depth){if(depth){const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a);subdivide(a,ab,ca,depth-1);subdivide(ab,b,bc,depth-1);subdivide(ca,bc,c,depth-1);subdivide(ab,bc,ca,depth-1);}else for(const p of [a,b,c]){const q=[...p];if(q[1]>seatH-.0001){const edge=Math.max(0,1-(Math.abs(q[0])/(sw/2))**6);const scoops=Math.exp(-(((q[0]-.0762)/.055)**2))+Math.exp(-(((q[0]+.0762)/.055)**2));q[1]-=.011*edge*scoops*Math.exp(-(((q[2]-.015)/.12)**4));}vertices.push(...q);}}
 for(let i=0;i<pos.count;i+=3){const v=[0,1,2].map(j=>[pos.getX(i+j),pos.getY(i+j),pos.getZ(i+j)]);subdivide(...v,v.every(p=>p[1]>seatH-.0001)?2:0);}
 const scooped=new THREE.BufferGeometry();scooped.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));scooped.computeVertexNormals();part(parts,scooped,.98);
 const legH=seatH-seatT,inset=(1.375/2+2.2)*inch,spread=legH*Math.tan(10*Math.PI/180),legs=[];
 for(const x of [-1,1])for(const z of [-1,1]){
  const top=[x*(sw/2-inset),seatH-.005,z*(sd/2-inset)],foot=[top[0]+x*spread,0,top[2]+z*spread];legs.push({top,foot,x,z});
  turned(parts,foot,top,[[0,0],[0,.875*inch/2],[.035,.875*inch/2],[.75,1.375*inch/2],[.87,1.375*inch/2],[.90,.875*inch/2],[1,.875*inch/2],[1,0]],.86);
 }
 const at=(leg,t)=>leg.foot.map((v,i)=>v+(leg.top[i]-v)*t),stretcherProfile=[[0,0],[0,.00635],[.05,.00635],[.12,.008],[.4,.010],[.6,.010],[.88,.008],[.95,.00635],[1,.00635],[1,0]];
 for(const x of [-1,1]){const side=legs.filter(l=>l.x===x);turned(parts,at(side[0],.4),at(side[1],.4),stretcherProfile,.91);}
 const l=legs.filter(l=>l.x===-1).map(l=>at(l,.4)),r=legs.filter(l=>l.x===1).map(l=>at(l,.4));turned(parts,midpoint(l[0],l[1]),midpoint(r[0],r[1]),stretcherProfile,.9);
 const backR=.508,crestR=.4572,spindleLen=17*inch,crestY=seatH+spindleLen*Math.cos(12*Math.PI/180),crestZ=sd/2-14*inch-spindleLen*Math.sin(12*Math.PI/180);
 for(let i=0;i<7;i++){
  const x=(i-3)*6.5*inch/3,bottomZ=sd/2-14*inch+(backR-Math.sqrt(backR*backR-x*x)),topZ=crestZ+(crestR-Math.sqrt(crestR*crestR-x*x));
  turned(parts,[x,seatH-.006,bottomZ],[x,crestY,topZ],[[0,0],[0,.00635],[.04,.00635],[.35,.0058],[.75,.005],[1,.00635],[1,0]],.94);
 }
 // Curved oval crest, retaining the source's 16-in width and 2-in height.
 const curvePositions=[],indices=[],steps=24,ring=12;
 for(let i=0;i<=steps;i++){
  const x=(i/steps-.5)*16*inch,z=crestZ+crestR-Math.sqrt(crestR*crestR-x*x);
  for(let j=0;j<ring;j++){const a=j/ring*Math.PI*2;curvePositions.push(x,crestY+Math.cos(a)*inch,z+Math.sin(a)*.875*inch/2);}
 }
 for(let i=0;i<steps;i++)for(let j=0;j<ring;j++){const a=i*ring+j,b=i*ring+(j+1)%ring,c=(i+1)*ring+j,d=(i+1)*ring+(j+1)%ring;indices.push(a,b,c,b,d,c);}
 for(const end of [0,steps])for(let j=1;j<ring-1;j++)end?indices.push(end*ring,end*ring+j+1,end*ring+j):indices.push(0,j,j+1);
 const crest=new THREE.BufferGeometry();crest.setAttribute('position',new THREE.Float32BufferAttribute(curvePositions,3));crest.setIndex(indices);crest.computeVertexNormals();part(parts,crest,1);
 return mergeGeometries(parts);
}
function nightstand(){
 const p=[],w=24*inch,d=16*inch,h=28*inch,b=.75*inch,leg=3*inch,foot=1.5*inch;
 const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(foot,0);s.lineTo(foot+.375*inch,leg);s.lineTo(d-foot-.375*inch,leg);s.lineTo(d-foot,0);s.lineTo(d,0);s.lineTo(d,h);s.lineTo(0,h);s.closePath();
 for(const x of [-w/2,w/2-b]){const side=new THREE.ExtrudeGeometry(s,{depth:b,bevelEnabled:false});side.rotateY(Math.PI/2).translate(x,0,d/2);part(p,side,.95);}
 box(p,w+.0254,b,d+.0254,0,h+b/2,0,1);
 box(p,w-2*b,h-leg,.25*inch,0,(h+leg)/2,-d/2+.25*inch/2,.81);
 const shelves=[4.5*inch,h-b-2*(5*inch+b),h-b-(5*inch+b),h-b];
 for(const y of shelves)box(p,w-2*b,b,d-.25*inch,0,y+b/2,.25*inch/2,.89);
 for(const y of [shelves[1]+b+2.5*inch,shelves[2]+b+2.5*inch]){
  box(p,w-2*b-.125*inch,5*inch-.125*inch,b,0,y,d/2-b/2,1);
  // Dark round knobs keep the two drawer fronts recognisable at walking distance.
  const knob=new THREE.LatheGeometry([new THREE.Vector2(0,0),new THREE.Vector2(.006,0),new THREE.Vector2(.006,.006),new THREE.Vector2(.013,.010),new THREE.Vector2(.015875,.014),new THREE.Vector2(.013,.01905),new THREE.Vector2(0,.020)],12);
  knob.rotateX(Math.PI/2).translate(0,y,d/2);part(p,knob,.33);
 }
 return mergeGeometries(p);
}
async function save(name,geometry){
 geometry.computeBoundingBox();const attributes=['position','normal','color'],buffers=[],views=[],accessors=[];let offset=0;
 for(const key of attributes){const a=geometry.attributes[key],data=Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength);buffers.push(data);views.push({buffer:0,byteOffset:offset,byteLength:data.length,target:34962});const accessor={bufferView:views.length-1,componentType:5126,count:a.count,type:'VEC3'};if(key==='position'){accessor.min=geometry.boundingBox.min.toArray();accessor.max=geometry.boundingBox.max.toArray();}accessors.push(accessor);offset+=data.length;}
 const data=Buffer.concat(buffers),gltf={asset:{version:'2.0',generator:'ShopPrentice MIT visible-surface adaptation'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0,name}],buffers:[{uri:name+'.bin',byteLength:data.length}],bufferViews:views,accessors,materials:[{name:'Aged timber',pbrMetallicRoughness:{metallicFactor:0,roughnessFactor:.96}}],meshes:[{primitives:[{attributes:{POSITION:0,NORMAL:1,COLOR_0:2},material:0}]}],extras:{license:'MIT',source:'https://github.com/ShopPrentice/shopprentice/tree/d670906ae258a80eefe9ec65d5cccffe67d2f1fb/examples/'+name.replace('_','-'),adaptation:true}};
 await writeFile(new URL(name+'.bin',root),data);await writeFile(new URL(name+'.gltf',root),JSON.stringify(gltf)+'\n');console.log(`${name}: ${geometry.attributes.position.count/3} triangles, bounds ${geometry.boundingBox.getSize(new THREE.Vector3()).toArray().map(v=>v.toFixed(4)).join(' x ')}`);
}
await mkdir(root,{recursive:true});await save('windsor_chair',windsor());await save('shaker_nightstand',nightstand());
const files=['windsor_chair.gltf','windsor_chair.bin','shaker_nightstand.gltf','shaker_nightstand.bin','panca_50.gltf','panca_50.bin','panca-source.zip','ShopPrentice-MIT.txt','Panca-GPL-3.0.txt'],records=[];
for(const path of files){const data=await readFile(new URL(path,root));records.push({path,bytes:data.length,sha256:hash(data)});}
await writeFile(new URL('design-manifest.json',root),JSON.stringify({sources:'../../../../Research/room-furnishings/sources/manifest.json',files:records},null,2)+'\n');
