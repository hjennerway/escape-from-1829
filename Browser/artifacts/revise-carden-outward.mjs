import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {createEscapeExterior} from '../dist/escape-exterior.mjs';
import {cardenCorrectionSnapshot} from './annexe-carden-correction-scope.mjs';
globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},clearRect(){},strokeText(){},fillText(){},measureText(t){return {width:t.length*16}}})})};
const a=createEscapeExterior(THREE,1.5).annexe;
writeFileSync(new URL('../../Research/carden-picton/outward-protected-geometry.json',import.meta.url),JSON.stringify(cardenCorrectionSnapshot(THREE,a),null,2)+'\n');
copyFileSync('C:/Users/Harry/AppData/Local/Temp/codex-clipboard-f74f0e39-6219-49dd-bf35-0a7a041e76f8.png',new URL('../../Research/carden-picton/outward-roof-reference.png',import.meta.url));
const edit=(p,fn)=>{const u=new URL(p,import.meta.url);writeFileSync(u,fn(readFileSync(u,'utf8')));};
edit('../dist/annexe.mjs',s=>s.replace("{name:'Central rear spine',rect:[-5,-32,5,-5],h:8.4,rise:2.6}","{name:'Central rear spine',rect:[-5,-32,5,-5],h:4.7,rise:1.9}"));
edit('../dist/annexe-oakmere-detail.mjs',s=>{
 const start=s.indexOf(' // This photo resolves'),end=s.indexOf('\n wall(-(half',start);
 s=s.slice(0,start)+` // The latest marked roof correction lowers this entire spine to the adjacent links.
 const mainCap=hipRoof(0,-host.w/2+.3,host.d,host.w+.6,eaves,1.9);group.add(mainCap);mainCap.name='Oakmere raised spine slate roof';
`+s.slice(end);
 return s.replace('eaves=12.4','eaves=4.7').replace("for(const p of columns){sash(p.x,3.0,p.z,{h:4,w:p.w});sash(p.x,9.2,p.z,{h:4,w:p.w});}","for(const p of columns)sash(p.x,2.5,p.z,{h:3,w:p.w});").replace('[[.24,.4],[6.1,.4],[eaves-.24,.35]]','[[.24,.4],[eaves-.24,.35]]').replace('box(pale,x,6.35,z+.02,w,.075,.08);','').replace('// One continuous hip caps the shortened spine with its steeper east slope. No','// One low continuous hip caps the shortened spine. No');
});
edit('../dist/annexe-carden-detail.mjs',s=>{
 s=s.replace(" const porchPoints=[[20.3,-30],[28.3,-30],[31.3,-27],[31.3,-21],[28.3,-18],[20.3,-18]];",` const conservatoryShift=29.17-20.3;
 const porchPoints=[[20.3,-30],[28.3,-30],[31.3,-27],[31.3,-21],[28.3,-18],[20.3,-18]].map(([x,z])=>[x+conservatoryShift,z]);`);
 s=s.replace('const ridge=[22.3,6.1,-24]','const ridge=[22.3+conservatoryShift,6.1,-24]');
 const at=s.indexOf(' // Exact translated outline');
 s=s.slice(0,at)+` // Tower-side gabled range: its outer wall shares the moved conservatory's
 // rear edge; its three sashes occupy the exposed section beside the tower.
 const wing={x0:20.3,x1:29.17,z0:-30,z1:-8.1,eave:12.4,rise:3.2};
 const centre=(wing.x0+wing.x1)/2,width=wing.x1-wing.x0,depth=wing.z1-wing.z0;
 wall(centre,wing.eave/2,(wing.z0+wing.z1)/2,width,wing.eave,depth,'Carden tower gabled range brick walls');
 const gableShape=new THREE.Shape();gableShape.moveTo(-width/2,0);gableShape.lineTo(width/2,0);gableShape.lineTo(0,wing.rise);gableShape.closePath();
 mesh(worldUV(new THREE.ExtrudeGeometry(gableShape,{depth,bevelEnabled:false}),1.7),brick,centre,wing.eave,wing.z0,'Carden tower range brick gable');
 const roofVertices=[],roofUV=[];
 for(const side of [-1,1]){
  const edge=centre+side*(width/2+.22),lo=wing.z0-.22,hi=wing.z1+.22;
  const points=side<0?[[edge,wing.eave,lo],[edge,wing.eave,hi],[centre,wing.eave+wing.rise,hi],[edge,wing.eave,lo],[centre,wing.eave+wing.rise,hi],[centre,wing.eave+wing.rise,lo]]:[[centre,wing.eave+wing.rise,lo],[centre,wing.eave+wing.rise,hi],[edge,wing.eave,hi],[centre,wing.eave+wing.rise,lo],[edge,wing.eave,hi],[edge,wing.eave,lo]];
  for(const p of points){roofVertices.push(...p);roofUV.push(p[0]/3,(p[2]+p[1])/3);}
  for(const z of [lo,hi])beam([edge,wing.eave,z],[centre,wing.eave+wing.rise,z],.16,trim,'Carden tower range gable verge');
  box(blue,edge,wing.eave,(lo+hi)/2,.14,.14,hi-lo);
 }
 const wingCap=new THREE.BufferGeometry();wingCap.setAttribute('position',new THREE.Float32BufferAttribute(roofVertices,3));wingCap.setAttribute('uv',new THREE.Float32BufferAttribute(roofUV,2));wingCap.computeVertexNormals();
 roofs.push(mesh(wingCap,roof,0,0,0,'Carden tower gabled range slate roof'));
 for(const z of [-10.2,-13.1,-16])window('Carden tower range sash',wing.x1+.035,9.2,z,1.35,3.4,Math.PI/2);
 for(const y of [.25,4.4,wing.eave-.22])box(trim,wing.x1+.08,y,(wing.z0+wing.z1)/2,.2,.35,depth);
 group.userData.towerRange=wing;

`+s.slice(at);
 return s.replace("window('Carden low side sash',29.205,2.5,-12.4,1.6,3.0,Math.PI/2,{bars:false});","window('Carden low side sash',29.205,2.5,-12.4,1.6,3.0,Math.PI/2,{bars:false});");
});
