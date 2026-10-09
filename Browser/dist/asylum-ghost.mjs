import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

// A runtime character, separate from the compiled estate/interior geometry.
// The root belongs to navigation; only its child joints move during animation.
export function createAsylumGhost(THREE){
 const root=new THREE.Group();root.name='Asylum apparition';
 const joint=(name,parent,p)=>{const o=new THREE.Group();o.name=name;o.position.set(...p);parent.add(o);return o;};
 const body=joint('Suspended shroud',root,[0,0,0]);
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:1,...extra});
 const cloth=mat(0xffffff,{vertexColors:true,side:THREE.DoubleSide,emissive:0x18241f,emissiveIntensity:.16});
 const skin=mat(0x8f9c89,{emissive:0x38483e,emissiveIntensity:.16});
 const bone=mat(0xb6bba1),dark=mat(0x080d0c),hair=mat(0x151c19);
 const eye=new THREE.MeshBasicMaterial({color:0xcdecd5,toneMapped:false});
 const mist=mat(0x718d81,{transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide});
 function part(name,geometry,material,parent,p=[0,0,0],scale){
  const o=new THREE.Mesh(geometry,material);o.name=name;o.position.set(...p);if(scale)o.scale.set(...scale);parent.add(o);return o;
 }
 const oval=(name,p,scale,m,parent)=>part(name,new THREE.SphereGeometry(1,16,12),m,parent,p,scale);
 function cord(name,points,radius,m,parent){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  return part(name,new THREE.TubeGeometry(curve,points.length*4,radius,5,false),m,parent);
 }
 // Irregular open hems and deep longitudinal folds avoid the old solid cone.
 function shroud(name,rings,parent,phase=0){
  const positions=[],colors=[],uv=[],indices=[],n=48;
  const tint=new THREE.Color();
  for(let j=0;j<rings.length;j++)for(let i=0;i<=n;i++){
   const a=i/n*Math.PI*2,fold=Math.cos(a*12+phase),[y,w,d,z=0]=rings[j];
   const rag=j===0?.075+.15*(.5+.5*Math.sin(a*17+phase))**3:0;
   const r=1+fold*.085;
   positions.push(Math.sin(a)*w*r,y+rag,Math.cos(a)*d*r+z);
   const shade=.34+.2*(fold*.5+.5)+.06*Math.sin(a*7+j*1.7);
   tint.setRGB(shade*.83,shade*.94,shade*.85);colors.push(tint.r,tint.g,tint.b);uv.push(i/n,j/(rings.length-1));
   if(j<rings.length-1&&i<n){const k=j*(n+1)+i;indices.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(new Float32Array(positions.length),3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  return part(name,g,cloth,parent);
 }
 shroud('Torn burial gown',[[.15,.30,.21,-.10],[.47,.28,.19,-.07],[.82,.23,.16,-.02],[1.1,.17,.12],[1.36,.23,.13],[1.55,.29,.145,-.025],[1.63,.19,.12,-.035],[1.68,.077,.07]],body);
 // Narrow scraps hang independently below the hem, with no feet or solid base.
 const tatters=[];
 for(let i=0;i<7;i++){
  const a=i/7*Math.PI*2,t=joint('Trailing shroud scrap',body,[Math.sin(a)*.24,.38,Math.cos(a)*.17-.07]);
  const shape=new THREE.Shape();shape.moveTo(-.045,0);shape.lineTo(.05,-.02);shape.lineTo(.022,-.17-i%3*.036);shape.lineTo(-.01,-.10);shape.lineTo(-.027,-.23);shape.closePath();
  const g=new THREE.ShapeGeometry(shape);part('Fading cloth tip',g,mist,t);t.rotation.y=a;tatters.push(t);
 }
 cord('Exposed sinewy neck',[[0,1.58,-.01],[-.02,1.76,.02],[.015,1.86,.05]],.059,skin,body);
 for(const s of [-1,1]){
  cord('Neck tendon',[[s*.055,1.61,.065],[s*.038,1.77,.08],[s*.06,1.88,.082]],.011,bone,body);
  cord('Angular collarbone',[[s*.02,1.58,.13],[s*.13,1.60,.137],[s*.26,1.55,.095]],.015,skin,body);
 }
 const head=joint('Lolling head',body,[.016,1.94,.065]);
 oval('Gaunt cranium',[0,.031,-.005],[.151,.204,.126],skin,head);
 oval('Sunken lower face',[0,-.105,.018],[.105,.13,.083],skin,head);
 oval('Open mouth cavity',[0,-.119,.101],[.063,.102,.032],dark,head);
 for(const s of [-1,1]){
  const socket=oval('Hollow eye socket',[s*.068,.035,.101],[.052,.043,.038],dark,head);socket.rotation.z=s*.19;
  oval('Cold pinprick eye',[s*.068,.03,.139],[.009,.012,.004],eye,head);
  const brow=oval('Heavy orbital ridge',[s*.069,.081,.093],[.065,.019,.033],skin,head);brow.rotation.z=s*.20;
  const cheek=oval('Sharp cheekbone',[s*.109,-.033,.077],[.036,.033,.05],bone,head);cheek.rotation.z=-s*.45;
  cord('Hanging jaw rim',[[s*.115,-.064,.03],[s*.081,-.197,.047],[s*.027,-.226,.097]],.017,skin,head);
  oval('Nostril void',[s*.017,-.036,.14],[.012,.021,.01],dark,head);
  for(let i=0;i<3;i++){
   const tooth=part('Uneven exposed tooth',new THREE.ConeGeometry(.009,.024+i%2*.013,5),bone,head,[s*(.012+i*.016),-.046,.133]);tooth.rotation.z=Math.PI+s*.08;
   part('Lower broken tooth',new THREE.ConeGeometry(.007,.019,5),bone,head,[s*(.012+i*.012),-.202,.124]);
  }
  for(let i=0;i<3;i++)cord('Tear stain',[[s*(.059+i*.016),.003,.131],[s*(.065+i*.019),-.035,.117],[s*(.068+i*.018),-.072-i*.014,.091]],.0025,hair,head);
 }
 cord('Nose bridge',[[0,.073,.114],[0,-.015,.156],[.013,-.033,.151]],.014,skin,head);
 // Matted strands frame the face and break up the smooth skull silhouette.
 for(let i=0;i<17;i++){
  const a=.70+i/16*(Math.PI*2-1.4),x=Math.sin(a),z=Math.cos(a);
  cord('Matted hanging hair',[[x*.07,.188,z*.066],[x*.146,.08,z*.12],[x*(.16+i%3*.007),-.11,z*.126-.015],[x*.13,-.31-i%4*.039,z*.14-.035]],.008+i%3*.003,hair,head);
 }
 const arms=[];
 for(const s of [-1,1]){
  const shoulder=joint('Drooping shoulder',body,[s*.255,1.54,-.015]);
  shroud('Ragged sleeve',[[-.40,.075,.069,.03],[-.23,.085,.085,.01],[0,.104,.094]],shoulder,s);
  cord('Elongated forearm',[[0,-.25,.012],[s*.025,-.43,.045],[s*.055,-.67,.12]],.035,skin,shoulder);
  cord('Forearm tendon',[[s*.018,-.32,.057],[s*.041,-.49,.076],[s*.063,-.64,.146]],.009,bone,shoulder);
  const hand=joint('Claw hand',shoulder,[s*.053,-.66,.13]);
  oval('Emaciated palm',[0,-.058,.009],[.057,.09,.027],skin,hand);
  for(let i=0;i<4;i++){
   const x=(i-1.5)*.029,len=.15+(i===1||i===2?.055:0);
   cord('Long crooked finger',[[x,-.096,.018],[x*1.38,-.17,.038],[x*1.53,-.105-len,.067],[x*1.35,-.09-len,.10]],.010,skin,hand);
   cord('Pointed black nail',[[x*1.53,-.105-len,.068],[x*1.35,-.09-len,.104],[x*1.15,-.073-len,.125]],.006,dark,hand);
   cord('Hand tendon',[[x*.5,.014,.026],[x,-.08,.033]],.004,bone,hand);
  }
  cord('Hooked thumb',[[s*.042,-.016,.01],[s*.096,-.081,.042],[s*.081,-.14,.086]],.013,skin,hand);
  arms.push({shoulder,hand,side:s});
 }
 const light=new THREE.PointLight(0x81b99f,2.2,4);light.position.set(0,1.45,.18);root.add(light);
 // Merge rigid parts per joint/material to keep this detail inexpensive.
 function batch(parent){
  const groups=new Map();
  for(const child of [...parent.children]){
   if(!child.isMesh){batch(child);continue;}
   const list=groups.get(child.material)??[];list.push(child);groups.set(child.material,list);
  }
  for(const [material,meshes] of groups){
   if(meshes.length<2)continue;
   const geometries=meshes.map(m=>{m.updateMatrix();return m.geometry.clone().applyMatrix4(m.matrix);});
   const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());
   const merged=new THREE.Mesh(geometry,material);merged.name=meshes.map(m=>m.name).join(' / ');
   for(const m of meshes){parent.remove(m);m.geometry.dispose();}parent.add(merged);
  }
 }
 batch(body);root.userData.ghostRig={body,head,arms,tatters,time:0};resetAsylumGhost(root);return root;
}

function pose({body,head,arms,tatters,time:t}){
 body.position.y=.05+Math.sin(t*1.7)*.045;
 body.rotation.z=Math.sin(t*.79)*.024;
 // Slow, mismatched rhythms make the suspended body feel unlike a walking NPC.
 head.rotation.set(-.12+Math.sin(t*.91)*.07,Math.sin(t*.63)*.10,-.16+Math.sin(t*1.13)*.055);
 for(const {shoulder,hand,side} of arms){
  shoulder.rotation.set(-.15+Math.sin(t*1.27+side)*.11,side*.09,side*(.12+Math.sin(t*.83+side)*.04));
  hand.rotation.set(-.20+Math.sin(t*1.43+side)*.10,side*.16,side*.07);
 }
 tatters.forEach((o,i)=>{o.rotation.x=Math.sin(t*1.6+i*.9)*.14;o.rotation.z=Math.sin(t*1.13+i)*.08;});
}

export function updateAsylumGhost(model,dt){
 const rig=model.userData.ghostRig;if(!rig||dt<=0)return;rig.time+=dt;pose(rig);
}

export function resetAsylumGhost(model){
 const rig=model.userData.ghostRig;if(!rig)return;rig.time=0;pose(rig);
}
