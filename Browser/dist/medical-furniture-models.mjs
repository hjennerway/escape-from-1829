// Original game models based on the museum objects cited in Research/room-furnishings.
// Coordinates are metres, front is +Z. Each whole model is fitted to its collision box.
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {FURNITURE_CATALOG} from './asylum-furniture.mjs';
import {applyFurnitureFinish} from './furniture-finishes.mjs';

export function createMedicalFurnitureMaterials(THREE){
 const materials={};
 const palette={wood:[0x695039,.94,0],lightWood:[0x957957,.91,0],darkWood:[0x3e3025,.96,0],paint:[0x9daba0,.88,0],ivory:[0xd5d0b7,.80,0],iron:[0x414940,.75,.48],brass:[0x988353,.57,.65],steel:[0x9ba59f,.48,.66],glass:[0x6e9890,.30,.12],amber:[0x59482d,.36,.08],ceramic:[0xccc8b3,.70,0],cloth:[0x575e50,1,0],rubber:[0x272c29,.95,0],paper:[0xccc3a4,.97,0],red:[0x6c4236,.95,0],water:[0x56746b,.22,.22]};
 for(const [key,[color,roughness,metalness]] of Object.entries(palette)){
  const m=new THREE.MeshStandardMaterial({color,roughness,metalness});m.name='Medical '+key;
  if(key==='glass'){m.transparent=true;m.opacity=.62;m.depthWrite=false;}
  if(['wood','lightWood','darkWood'].includes(key))applyFurnitureFinish(THREE,m,{kind:'wood'});
  if(['paint','ivory'].includes(key))applyFurnitureFinish(THREE,m,{kind:'coating'});
  if(['iron','brass'].includes(key))applyFurnitureFinish(THREE,m,{kind:'metal'});
  materials[key]=m;
 }
 return materials;
}
export function createMedicalFurnitureModels(THREE,{labels=typeof document!=='undefined'}={}){
 const materials=createMedicalFurnitureMaterials(THREE);
 let pieces;
 const add=(g,key)=>{const geom=g.index?g.toNonIndexed():g;geom.deleteAttribute('uv');geom.computeVertexNormals();(pieces[key]??=[]).push(geom);};
 const box=(key,w,h,d,x,y,z,angle=0)=>add(new THREE.BoxGeometry(w,h,d).rotateX(angle).translate(x,y,z),key);
 const ball=(key,r,x,y,z,sx=1,sy=1,sz=1)=>add(new THREE.SphereGeometry(r,12,8).scale(sx,sy,sz).translate(x,y,z),key);
 const rod=(key,r,a,b,rTop=r)=>{
  const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),direction=bv.clone().sub(av),g=new THREE.CylinderGeometry(rTop,r,direction.length(),12);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize())).translate(...av.clone().add(bv).multiplyScalar(.5).toArray());add(g,key);
 };
 const pipe=(key,points,r=.016)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(12,points.length*5),r,8,false),key);
 const torus=(key,r,t,x,y,z,rx=0,ry=0)=>add(new THREE.TorusGeometry(r,t,6,20).rotateX(rx).rotateY(ry).translate(x,y,z),key);
 const bottle=(key,x,y,z,r=.036,h=.14,cap='darkWood')=>{
  const profile=[[0,0],[r*.83,0],[r,.012],[r,h*.68],[r*.75,h*.78],[r*.42,h*.85],[r*.42,h],[0,h]].map(([a,b])=>new THREE.Vector2(a,b));
  add(new THREE.LatheGeometry(profile,12).translate(x,y,z),key);rod(cap,r*.50,[x,y+h,z],[x,y+h+.022,z]);
 };
 const label=(title,lines,w,h,x,y,z,rx=0)=>{
  if(!labels){box('paper',w,h,.002,x,y,z,rx);return;}
  const c=document.createElement('canvas');c.width=512;c.height=Math.max(160,Math.round(512*h/w));const ctx=c.getContext('2d');
  ctx.fillStyle='#d6ceb3';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#6b6957';ctx.lineWidth=4;ctx.strokeRect(11,11,c.width-22,c.height-22);
  ctx.fillStyle='#373e34';ctx.textAlign='center';ctx.textBaseline='middle';
  const text=[title,...lines],spacing=(c.height-36)/text.length;
  text.forEach((t,i)=>{ctx.font=`${i?'':'bold '}${Math.min(i?35:42,Math.floor(440/Math.max(1,t.length)*1.7))}px ${i?'serif':'sans-serif'}`;ctx.fillText(t,256,18+spacing*(i+.5),455);});
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const key='label'+Object.keys(materials).length;
  materials[key]=new THREE.MeshStandardMaterial({map:texture,roughness:1,color:0xffffff,side:THREE.DoubleSide});materials[key].name=title;
  const g=new THREE.PlaneGeometry(w,h).rotateX(rx).translate(x,y,z);(pieces[key]??=[]).push(g.toNonIndexed());
 };
 const feet=(width,depth,top,key='iron',r=.025)=>{
  for(const x of [-width/2,width/2])for(const z of [-depth/2,depth/2])rod(key,r,[x,.035,z],[x,top,z],r*.85);
 };
 const tap=(x,y,z)=>{
  rod('brass',.024,[x,y-.04,z],[x,y+.06,z]);rod('brass',.013,[x-.055,y+.06,z],[x+.055,y+.06,z]);
  ball('ivory',.023,x-.055,y+.06,z);ball('ivory',.023,x+.055,y+.06,z);
 };
 const caseBox=(x,y,z,w=.40,d=.24)=>{
  box('darkWood',w,.035,d,x,y+.0175,z);box('cloth',w-.025,.006,d-.025,x,y+.038,z);
  for(const s of [-1,1])box('wood',.018,.07,d,x+s*(w-.018)/2,y+.045,z);
  box('wood',w,.07,.018,x,y+.045,z+d/2-.009);
  box('wood',w,.26,.025,x,y+.16,z-d/2);box('cloth',w-.04,.22,.004,x,y+.16,z-d/2+.014);
  for(const s of [-1,1])box('brass',.027,.017,.009,x+s*w*.32,y+.065,z+d/2+.004);
 };
 const tools=(x,y,z)=>{
  // Bone saw, scalpel and forceps in a felt-lined case, with visibly separate handles.
  box('steel',.16,.005,.033,x-.08,y+.055,z);box('darkWood',.075,.014,.026,x+.035,y+.06,z);
  for(let i=0;i<12;i++)box('steel',.008,.004,.009,x-.153+i*.012,y+.055,z+.020);
  rod('steel',.005,[x-.15,y+.06,z-.055],[x+.065,y+.06,z-.055]);box('darkWood',.065,.015,.016,x+.09,y+.06,z-.055);
  for(const side of [-1,1])rod('steel',.004,[x-.06,y+.06,z+.08+side*.016],[x+.07,y+.06,z+.08+side*.004]);
  torus('steel',.012,.003,x-.07,y+.06,z+.064,Math.PI/2);torus('steel',.012,.003,x-.07,y+.06,z+.096,Math.PI/2);
 };
 const builders={
  hydroBath(){
   // An oval open shell: inner bowl, rolled rim and outer enamel wall.
   const profile=[[.38,.85,.24],[.42,.95,.30],[.465,1.035,.75],[.48,1.06,.80],[.525,1.12,.80],[.54,1.13,.745],[.505,1.075,.28],[.38,.85,.20]],positions=[],indices=[],n=64;
   for(const [rx,rz,y] of profile)for(let i=0;i<n;i++){const a=i/n*Math.PI*2;positions.push(Math.cos(a)*rx,y,Math.sin(a)*rz);}
   for(let j=0;j<profile.length;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=((j+1)%profile.length)*n+i,d=((j+1)%profile.length)*n+(i+1)%n;indices.push(a,b,c,b,d,c);}
   const shell=new THREE.BufferGeometry();shell.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));shell.setIndex(indices);add(shell,'ivory');
   add(new THREE.CylinderGeometry(1,1,.024,64).scale(.385,1,.85).translate(0,.225,0),'ivory');
   // Shallow stagnant water leaves most of the bowl visible.
   add(new THREE.CircleGeometry(1,64).rotateX(-Math.PI/2).scale(.40,1,.89).translate(0,.282,0),'water');
   for(const x of [-.35,.35])for(const z of [-.72,.72]){rod('iron',.029,[x,.05,z],[x,.27,z]);ball('iron',.06,x,.075,z,1,.6,1.4);}
   for(const x of [-.18,.18]){pipe('brass',[[x,.13,-.98],[x,1.11,-.98],[x,1.14,-.82],[x,1.04,-.78]],.022);tap(x,1.14,-.98);}
   box('paper',.065,.32,.025,.36,1.02,-.95);rod('glass',.009,[.36,.89,-.931],[.36,1.15,-.931]);rod('red',.004,[.36,.89,-.92],[.36,1.04,-.92]);
   for(let i=0;i<9;i++)box('iron',.018,.003,.003,.38,.90+i*.027,-.931);
   rod('iron',.009,[-.36,.76,-.93],[-.36,1.33,-.93]);label('BATH RECORD',['WARM IMMERSION','OBSERVATIONS'],.30,.25,-.36,1.19,-.913);
  },
  hydroShower(){
   box('iron',1.22,.075,1.10,0,.05,0);box('ivory',1.12,.027,1.0,0,.10,0);
   for(const x of [-.55,.55])box('ivory',.06,.12,1.06,x,.15,0);
   for(const z of [-.50,.50])box('ivory',1.10,.12,.06,0,.15,z);
   for(const x of [-.48,.48]){
    // The left control section replaces the iron shaft; coincident cylinders flicker.
    if(x<0){rod('iron',.030,[x,.11,-.38],[x,.3,-.38]);rod('iron',.030,[x,1.81,-.38],[x,2.25,-.38]);}
    else rod('iron',.030,[x,.11,-.38],[x,2.25,-.38]);
    ball('brass',.041,x,2.25,-.38);
   }
   rod('iron',.025,[-.48,2.01,-.38],[.48,2.01,-.38]);
   add(new THREE.CylinderGeometry(.31,.27,.36,24).translate(0,2.01,-.21),'brass');
   add(new THREE.CylinderGeometry(.28,.28,.017,24).translate(0,2.20,-.21),'iron');torus('brass',.30,.021,0,2.19,-.21,Math.PI/2);
   pipe('brass',[[0,1.92,-.22],[0,1.90,.16],[0,1.75,.18]],.025);add(new THREE.CylinderGeometry(.11,.15,.045,20).translate(0,1.72,.18),'iron');
   for(let i=0;i<7;i++)rod('steel',.007,[-.08+i*.026,1.693,.12],[-.08+i*.026,1.693,.24]);
   rod('brass',.016,[.24,1.92,-.2],[.36,1.92,.08]);
   for(let i=0;i<18;i++)torus('iron',.017,.004,.36,1.87-i*.04,.08,0,i%2*Math.PI/2);
   ball('darkWood',.035,.36,1.13,.08,1,1.8,1);
   for(let i=0;i<9;i++)box('iron',.018,.014,.28,-.12+i*.03,.12,.09);
   rod('brass',.030,[-.48,.3,-.38],[-.48,1.81,-.38]);tap(-.48,.89,-.38);
   label('COLD BATH',['ATTENDANT CONTROL'],.43,.16,0,1.37,-.355);
  },
  operatingTable(){
   feet(.62,1.38,.70,'wood',.042);
   for(const x of [-.31,.31])box('darkWood',.045,.11,1.51,x,.60,0);
   for(const z of [-.69,.69])box('wood',.68,.11,.055,0,.60,z);
   box('wood',.65,.038,1.30,0,.28,0);
   for(let i=0;i<5;i++)box('lightWood',.142,.065,1.70,(i-2)*.145,.745,0);
   box('wood',.66,.05,.28,0,.743,.94);rod('iron',.015,[-.38,.76,.92],[.38,.76,.92]);
   const headAngle=-.42,headY=.86,headZ=-.71;
   box('lightWood',.63,.062,.34,0,headY,headZ,headAngle);box('darkWood',.52,.06,.18,0,.797,-.73);
   // Folded linen and a removable head cushion.
   box('cloth',.48,.027,.45,0,.794,-.05);box('cloth',.48,.012,.10,0,.81,.11);
   // Seat the cushion's underside directly on the tilted headboard surface.
   const cushionOffset=.062,cushionAlong=-.07;
   box('cloth',.40,.062,.18,0,headY+cushionOffset*Math.cos(headAngle)-cushionAlong*Math.sin(headAngle),headZ+cushionOffset*Math.sin(headAngle)+cushionAlong*Math.cos(headAngle),headAngle);
   caseBox(0,.30,.04,.48,.25);tools(.025,.30,.04);
   // Hang a larger plaque at the footplate edge, clear of its overhang.
   for(const x of [-.235,.235])rod('brass',.008,[x,.675,1.061],[x,.725,1.061]);
   box('darkWood',.60,.17,.032,0,.61,1.061);
   label('SURGICAL TABLE',['WOODEN FRAME · c.1830'],.56,.13,0,.61,1.079);
  },
  electrotherapy(){
   feet(.82,.48,.74,'wood',.030);box('wood',1.04,.065,.62,0,.77,0);
   box('darkWood',.82,.065,.49,0,.22,0);box('wood',.76,.12,.045,0,.675,.253);box('brass',.038,.02,.022,-.34,.67,.286);
   box('darkWood',.96,.06,.52,0,.835,0);
   for(const x of [-.32,.32]){box('wood',.07,.29,.065,x,1.01,-.08);rod('brass',.018,[x,.95,-.08],[x,1.25,-.08]);}
   rod('glass',.115,[-.28,1.16,-.08],[.28,1.16,-.08]);rod('brass',.014,[-.37,1.16,-.08],[.38,1.16,-.08]);
   rod('iron',.016,[.39,1.16,-.08],[.39,1.02,-.08]);rod('darkWood',.025,[.39,1.02,-.08],[.50,1.02,-.08]);
   box('cloth',.23,.085,.045,0,1.15,-.195);
   for(const x of [-.30,.30]){
    bottle('glass',x,.87,.17,.065,.22,'brass');rod('brass',.023,[x,1.1,.17],[x,1.30,.17]);ball('brass',.045,x,1.30,.17);
    add(new THREE.CylinderGeometry(.067,.067,.095,16).translate(x,.938,.17),'brass');
   }
   rod('glass',.025,[0,.87,.18],[0,1.29,.18]);rod('brass',.038,[-.22,1.29,.18],[.20,1.29,.18]);ball('brass',.062,.22,1.29,.18);
   pipe('rubber',[[.30,1.24,.18],[.42,1.01,.24],[.18,.88,.28],[.03,.89,.25]],.007);
   // A mounted plaque clears the tabletop overhang and the offset drawer knob.
   box('darkWood',.56,.18,.055,0,.632,.283);
   label('MEDICAL ELECTRICITY',['CYLINDER & LEYDEN JARS','HAND-CRANKED APPARATUS'],.52,.15,0,.632,.312);
  },
  apothecary(){
   feet(1.16,.34,.16,'wood',.037);box('darkWood',1.36,1.85,.035,0,1.08,-.225);
   for(const x of [-.645,.645])box('wood',.07,1.85,.50,x,1.075,0);
   for(const y of [.19,.64,1.02,1.42,1.84,1.98])box('wood',1.36,.045,.50,0,y,0);
   box('wood',1.22,.36,.035,0,.405,.229);box('wood',.04,.34,.017,0,.405,.254);
   for(const x of [-.32,.32])ball('brass',.023,x,.41,.266);
   for(const [row,y] of [[0,.665],[1,1.045],[2,1.445]])for(let i=0;i<7;i++){
    const x=(i-3)*.164,r=.044+(i%2)*.007,h=.16+(i%3)*.035;
    bottle(row===1?'ceramic':i%2?'amber':'glass',x,y,-.025,r,h);
    label(row===1?['PILLS','POWDER','PILLS','SALTS','PILLS','POWDER','PILLS'][i]:['TINCTURE','LAUDANUM','LINIMENT','MIXTURE','TONIC','LAUDANUM','TINCTURE'][i],[],r*1.55,.065,x,y+h*.46,.028);
   }
   // The open framed front keeps contents legible within the cupboard footprint.
   for(const x of [-.59,.59])box('paint',.033,1.13,.025,x,1.275,.245);
   for(const y of [.70,1.84])box('paint',1.20,.035,.025,0,y,.245);
   box('paint',.029,1.12,.025,-.08,1.27,.245);ball('brass',.018,-.12,1.23,.268);
   // Balance and ceramic pill pots on the lower dispensing ledge.
   rod('brass',.008,[.37,.67,.13],[.37,.87,.13]);rod('brass',.007,[.22,.85,.13],[.52,.85,.13]);
   for(const x of [.22,.52]){rod('iron',.002,[x,.85,.13],[x,.74,.13]);add(new THREE.CylinderGeometry(.051,.034,.014,16).translate(x,.738,.13),'brass');}
   box('paper',.17,.016,.12,-.40,.68,.13);
   for(let i=0;i<8;i++)ball('ivory',.011,-.45+(i%4)*.027,.700,.105+Math.floor(i/4)*.03);
   label('DISPENSARY',['MEDICINES & COMPOUNDS'],.82,.12,0,1.915,.254);
  },
  bloodletting(){
   caseBox(-.10,0,0,.41,.32);
   // Glass cupping vessels, a brass spring scarificator and a lancet.
   for(const [x,z,r] of [[-.24,.035,.031],[-.15,.035,.042]]){
    add(new THREE.LatheGeometry([[0,0],[r,.004],[r,.040],[r*.7,.07],[0,.074]].map(([a,b])=>new THREE.Vector2(a,b)),12).translate(x,.04,z),'glass');
   }
   box('brass',.060,.043,.045,-.05,.063,.05);box('steel',.024,.012,.004,-.05,.091,.05);
   for(let i=0;i<5;i++)box('steel',.003,.003,.024,-.07+i*.008,.042,.05);
   rod('steel',.003,[-.26,.049,-.08],[-.09,.049,-.08]);box('darkWood',.06,.013,.017,-.08,.049,-.08);
   // Lidded pharmacy leech jar, with dark shapes visible through the coloured glass.
   bottle('glass',.21,.006,.01,.086,.32,'ceramic');
   for(let i=0;i<4;i++)pipe('rubber',[[.19+i*.011,.04,.04],[.185+i*.012,.09,.052],[.22+i*.006,.14,.045],[.205+i*.013,.20,.04]],.005);
   label('LEECHES',[],.13,.052,.21,.19,.102);label('CUPPING SET',[],.28,.065,-.10,.20,-.143);
  },
  ectMachine(){
   // A portable 1940s box on a wheeled treatment trolley, rather than an electric chair.
   for(const x of [-.26,.26])for(const z of [-.23,.23]){
    rod('iron',.017,[x,.10,z],[x,.83,z]);add(new THREE.CylinderGeometry(.046,.046,.028,12).rotateZ(Math.PI/2).translate(x,.046,z),'rubber');
   }
   for(const y of [.23,.80])box('paint',.62,.035,.56,0,y,0);
   for(const x of [-.27,.27])pipe('iron',[[x,.79,-.23],[x,.93,-.23],[x,.93,.23],[x,.79,.23]],.012);
   box('darkWood',.47,.21,.33,0,.942,0);box('rubber',.425,.006,.285,0,1.05,0);
   box('wood',.47,.29,.023,0,1.105,-.175);box('cloth',.42,.24,.006,0,1.11,-.16);
   for(const x of [-.18,.18])box('brass',.025,.034,.011,x,.995,.171);
   label('ECT · 1940s',['ELECTROCONVULSIVE THERAPY'],.39,.09,0,1.145,-.154);
   // Meter on the sloped front and separate rotary controls.
   box('ivory',.15,.086,.014,-.095,.969,.174);torus('iron',.054,.006,-.095,.969,.186);
   rod('iron',.002,[-.095,.943,.193],[-.066,.993,.193]);
   for(const x of [.055,.14]){rod('rubber',.023,[x,.92,.172],[x,.92,.196]);box('paper',.003,.014,.002,x,.931,.198);}
   for(let i=0;i<10;i++)torus('rubber',.066,.005,.06,.836,.065+i*.009,Math.PI/2);
   for(const x of [-.13,.13]){rod('rubber',.022,[x,.841,.08],[x,.841,.23]);ball('steel',.041,x,.841,.064,1,.4,1);}
   pipe('rubber',[[-.16,.84,.11],[-.25,.67,.22],[-.20,.60,.23],[-.05,.79,.16]],.008);
   box('cloth',.39,.046,.35,0,.27,0);label('TREATMENT TROLLEY',[],.40,.055,0,.792,.284);
  }
 };
 const models={};
 for(const [kind,build] of Object.entries(builders)){
  pieces={};build();const parts=Object.entries(pieces).map(([key,list])=>({geometry:mergeGeometries(list),material:materials[key],paint:materials[key]}));
  const bounds=new THREE.Box3();for(const part of parts){part.geometry.computeBoundingBox();bounds.union(part.geometry.boundingBox);}
  const size=bounds.getSize(new THREE.Vector3()),c=FURNITURE_CATALOG[kind];
  for(const part of parts){part.geometry.translate(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);part.geometry.scale(c.width/size.x,c.height/size.y,c.depth/size.z);part.geometry.computeBoundingBox();part.geometry.computeBoundingSphere();}
  models[kind]=parts;
 }
 return models;
}
