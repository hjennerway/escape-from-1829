import {earthToScene} from './earth-registration.mjs';

// The KML Point is the building centre, not the saved LookAt camera target.
// Dimensions and east-west alignment are estimates from the lower photograph.
export const WILLOWS_PIN=Object.freeze({latitude:53.22313660074063,longitude:-2.904876118400348});
const [x,z]=earthToScene(WILLOWS_PIN.latitude,WILLOWS_PIN.longitude);
export const WILLOWS=Object.freeze({x,z,rotation:Math.atan2(.835,.55),length:24,width:6.4,eave:3.1,rise:1.7});
export const willowsPoint=(x,y,z)=>[WILLOWS.x+Math.cos(WILLOWS.rotation)*x+Math.sin(WILLOWS.rotation)*z,y,WILLOWS.z-Math.sin(WILLOWS.rotation)*x+Math.cos(WILLOWS.rotation)*z];
export const WILLOWS_VIEWS=Object.freeze({
 willows:{position:willowsPoint(-28,18,32),target:willowsPoint(0,1.8,0),fov:46},
 'willows-photo':{position:willowsPoint(-23,2.1,20),target:willowsPoint(0,2.1,0),fov:52},
 'willows-plan':{position:willowsPoint(0,45,.01),target:willowsPoint(0,0,0),fov:46}
});
export const WILLOWS_WALK=Object.freeze({position:willowsPoint(-18,1.8,13),target:willowsPoint(0,2,0),fov:60});

export function createWillows(THREE,{worldUV,material}){
 const site=new THREE.Group();site.name='The Willows';site.position.set(x,0,z);site.rotation.y=WILLOWS.rotation;
 site.userData.reference='Research/willows/README.md';site.userData.pin=WILLOWS_PIN;site.userData.dimensions=WILLOWS;
 const {length,width,eave,rise}=WILLOWS,l=length/2,w=width/2,t=.3,peak=eave+rise;
 let seed=182909;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function texture(draw){const c=document.createElement('canvas');c.width=c.height=512;draw(c.getContext('2d'));const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=8;return map;}
 const brickMap=texture(g=>{
  g.fillStyle='#9c9080';g.fillRect(0,0,512,512);
  for(let r=0;r<16;r++)for(let c=-1;c<9;c++){const n=random()*34;g.fillStyle=`rgb(${134+n},${79+n*.85},${53+n*.65})`;g.fillRect(c*64+(r%2)*32+1.5,r*32+1.6,61,28.8);}
  for(let i=0;i<6000;i++){g.fillStyle=i%2?'#e2c29533':'#35291e28';g.fillRect(random()*512,random()*512,1+random()*5,1+random()*3);}
 });
 const roofMap=texture(g=>{
  g.fillStyle='#803d2e';g.fillRect(0,0,512,512);
  for(let c=0;c<64;c++){g.fillStyle=c%2?'#a15a413d':'#492e2736';g.fillRect(c*8,0,3,512);}
  for(let i=0;i<4200;i++){g.fillStyle=['#c1885830','#382e2528','#ab6d4430'][i%3];g.fillRect(random()*512,random()*512,2+random()*8,1+random()*12);}
 });
 const brick=material(0xffffff,{map:brickMap}),roof=material(0xffffff,{map:roofMap,side:THREE.DoubleSide});
 const timber=material(0x777568),lintel=material(0xaaa18b),iron=material(0x504239);
 // This distant site lies outside the estate's fixed shadow map. Baked dark
 // inner surfaces keep the unlit bays dark without expanding that map.
 const interior=new THREE.MeshBasicMaterial({color:0x20251f}),floor=new THREE.MeshBasicMaterial({color:0x35392c});
 function mesh(geometry,mat,name){const o=new THREE.Mesh(geometry,mat);o.name=name;o.castShadow=true;o.receiveShadow=true;site.add(o);return o;}
 function box(name,mat,x0,y0,z0,x1,y1,z1){const g=new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0);g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);const o=mesh(worldUV(g,1.7),mat,name);o.userData.orientedCollision=true;return o;}
 function surface(name,mat,triangles,scale=1.7){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(triangles.flat(2),3));g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(triangles.length*6),2));g.computeVertexNormals();return mesh(worldUV(g,scale),mat,name);}
 // A hollow rectangular shell: three visible openings cut through the long face.
 box('Willows rear brick wall',brick,-l,0,-w,l,eave,-w+t);
 for(const side of [-1,1])box('Willows end brick wall',brick,side<0?-l:l-t,0,-w+t,side<0?-l+t:l,eave,w);
 const openings=[{x:-3.6,width:1.8,height:2.55},{x:5,width:4.2,height:2.65},{x:10,width:1.7,height:2.55}];
 let cursor=-l;
 for(const [i,o]of openings.entries()){
  const left=o.x-o.width/2,right=o.x+o.width/2;
  box('Willows front brick pier '+i,brick,cursor,0,w-t,left,eave,w);
  box('Willows brick above opening '+i,brick,left,o.height+.18,w-t,right,eave,w);
  box('Willows weathered lintel '+i,lintel,left-.16,o.height,w-t-.025,right+.16,o.height+.18,w+.045);
  for(const edge of [left,right])box('Willows faded jamb '+i,timber,edge-.045,0,w-t-.025,edge+.045,o.height,w+.04);
  box('Willows threshold '+i,floor,left,-.03,w-.65,right,.035,w+.3);
  cursor=right;
 }
 box('Willows front end pier',brick,cursor,0,w-t,l,eave,w);
 box('Willows interior rear lining',interior,-l+t,.01,-w+t,l-t,eave,-w+t+.025);
 for(const side of [-1,1])box('Willows interior end lining',interior,side<0?-l+t:l-t-.025,.01,-w+t,side<0?-l+t+.025:l-t,eave,w-t);
 box('Willows interior floor',floor,-l+t,-.09,-w+t,l-t,-.005,w-t);
 const gable=brick.clone();gable.side=THREE.DoubleSide;
 surface('Willows brick gables',gable,[[[-l,eave,-w],[-l,eave,w],[-l,peak,0]],[[l,eave,w],[l,eave,-w],[l,peak,0]]]);
 const a=-l-.2,b=l+.2,d=w+.23,y=eave-.04,p=peak+.09;
 surface('Willows red pitched roof',roof,[[[a,y,d],[b,y,d],[b,p,0]],[[a,y,d],[b,p,0],[a,p,0]],[[a,p,0],[b,p,0],[b,y,-d]],[[a,p,0],[b,y,-d],[a,y,-d]]],3.2);
 // Raised sheet seams, ridge capping and thin worn fascia match the plain roof.
 const seams=[],beam=(from,to,width,depth)=>seams.push({from,to,width,depth});
 for(let u=a+.08;u<b;u+=.16)for(const side of [-1,1])beam([u,y+.015,side*d],[u,p+.015,0],.023,.025);
 beam([a,p+.02,0],[b,p+.02,0],.15,.16);
 const dummy=new THREE.Object3D(),ribs=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),roof,seams.length);
 ribs.name='Willows roof ribs and ridge';ribs.castShadow=true;ribs.receiveShadow=true;
 seams.forEach(({from,to,width,depth},i)=>{const start=new THREE.Vector3(...from),v=new THREE.Vector3(...to).sub(start);dummy.position.copy(start).addScaledVector(v,.5);dummy.scale.set(width,v.length(),depth);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());dummy.updateMatrix();ribs.setMatrixAt(i,dummy.matrix);});site.add(ribs);
 for(const side of [-1,1])box('Willows eaves fascia',timber,a,eave-.17,side*d-.035,b,eave-.015,side*d+.035);
 // Shallow dark recess under the overhanging eaves, without closing the bays.
 box('Willows front eaves shadow',iron,-l,eave-.12,w-.08,l,eave-.025,w+.05);
 site.userData.openings=openings;
 return site;
}
