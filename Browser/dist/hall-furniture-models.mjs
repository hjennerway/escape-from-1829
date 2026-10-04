// Original interpretive hall props, sharing the existing timber/metal finishes.
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {createMedicalFurnitureMaterials} from './medical-furniture-models.mjs';
import {HALL_PROP_CATALOG} from './hall-furnishings.mjs';
export function createHallFurnitureModels(THREE,{labels=typeof document!=='undefined'}={}){
 const materials=createMedicalFurnitureMaterials(THREE),models={};let pieces;
 for(const [key,color] of [['linen',0xc9c7b4],['wicker',0x92754f]]){materials[key]=new THREE.MeshStandardMaterial({color,roughness:1});materials[key].name='Hall '+key;}
 const add=(g,key)=>{g=g.index?g.toNonIndexed():g;g.deleteAttribute('uv');g.computeVertexNormals();(pieces[key]??=[]).push(g);};
 const box=(key,w,h,d,x,y,z,rx=0)=>add(new THREE.BoxGeometry(w,h,d).rotateX(rx).translate(x,y,z),key);
 const rod=(key,r,a,b)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);add(new THREE.CylinderGeometry(r,r,v.length(),10).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize())).translate(...av.add(bv).multiplyScalar(.5).toArray()),key);};
 const text=(ctx,t,x,y,size=35)=>{ctx.font=`${size}px Georgia, serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x,y);};
 function print(name,w,h,x,y,z,draw,rx=0){
  const g=new THREE.PlaneGeometry(w,h).rotateX(rx).translate(x,y,z).toNonIndexed();
  if(!labels){add(g,'paper');return;}
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=Math.round(768*h/w);const ctx=canvas.getContext('2d');
  ctx.fillStyle='#cfc6ab';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#3d392b';ctx.strokeStyle='#6d624c';draw(ctx,canvas.width,canvas.height);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  materials[name]=new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide});materials[name].name='Hall '+name;(pieces[name]??=[]).push(g);
 }
 function frame(w,h){box('darkWood',w,h,.045,0,h/2,0);for(const x of [-w/2+.025,w/2-.025])box('wood',.05,h,.065,x,h/2,0);for(const y of [.025,h-.025])box('wood',w,.05,.065,0,y,0);}
 function fold(x,y,z,w=.42,d=.43,layers=3){for(let i=0;i<layers;i++){box(i%3===2?'cloth':'linen',w-i*.006,.042,d,x+(i%2?.008:0),y+.021+i*.042,z);box(i%3===2?'cloth':'linen',w-.016,.006,.018,x,y+.012+i*.042,z+d/2+.003);}}
 const builders={
  sideboard(){
   for(const x of [-.91,.91])for(const z of [-.19,.19])box('darkWood',.09,.18,.09,x,.09,z);
   box('wood',2.02,.73,.51,0,.545,0);box('wood',2.02,.87,.04,0,.615,-.255);box('darkWood',2.10,.08,.55,0,1.01,0);
   for(const x of [-.67,0,.67]){box('lightWood',.62,.54,.03,x,.48,.266);box('wood',.50,.40,.02,x,.48,.286);rod('brass',.015,[x+.22,.51,.29],[x+.22,.51,.32]);box('lightWood',.62,.13,.035,x,.84,.266);rod('brass',.01,[x-.055,.84,.29],[x+.055,.84,.29]);}
  },
  landscape(){
   frame(1.32,.86);print('landscape',1.20,.74,0,.43,.034,(ctx,w,h)=>{
    ctx.fillStyle='#afb6ad';ctx.fillRect(0,0,w,h);ctx.fillStyle='#969e82';ctx.beginPath();ctx.moveTo(0,h*.48);ctx.bezierCurveTo(w*.18,h*.16,w*.36,h*.67,w*.62,h*.32);ctx.bezierCurveTo(w*.82,h*.15,w*.93,h*.48,w,h*.35);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
    ctx.fillStyle='#5e7566';ctx.beginPath();ctx.moveTo(0,h*.76);ctx.bezierCurveTo(w*.25,h*.36,w*.45,h*.85,w,h*.52);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
    ctx.fillStyle='#8ba2a0';ctx.beginPath();ctx.moveTo(w*.60,h*.55);ctx.bezierCurveTo(w*.44,h*.75,w*.82,h*.80,w*.56,h);ctx.lineTo(w*.33,h);ctx.bezierCurveTo(w*.68,h*.77,w*.34,h*.68,w*.56,h*.55);ctx.fill();
    for(const [x,y,s] of [[.12,.65,.12],[.19,.60,.09],[.86,.58,.10]]){ctx.fillStyle='#5d5341';ctx.fillRect(w*x,h*y,w*.013,h*.27);ctx.fillStyle='#405549';for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(w*(x+.006)+Math.sin(i*2)*w*s*.28,h*(y-.04)+Math.cos(i*2)*h*s*.33,w*s*.33,h*s*.48,0,0,Math.PI*2);ctx.fill();}}
    ctx.globalAlpha=.10;for(let i=0;i<220;i++){ctx.strokeStyle=i%2?'#302e24':'#e9ddbc';ctx.beginPath();ctx.moveTo(0,i*h/220);ctx.lineTo(w,i*h/220+Math.sin(i)*2);ctx.stroke();}ctx.globalAlpha=1;
   });
  },
  visitingNotice(){frame(.70,.90);print('visiting hours',.59,.79,0,.45,.034,(ctx,w,h)=>{ctx.lineWidth=3;ctx.strokeRect(20,20,w-40,h-40);for(const [t,y,size] of [['VISITING HOURS',.17,46],['2 TO 4',.37,73],['PLEASE WAIT HERE',.59,37],['The attendant will',.76,32],['show visitors through',.83,32]])text(ctx,t,w/2,h*y,size);});},
  linenCupboard(){
   box('darkWood',1.55,.10,.60,0,.05,0);box('wood',1.55,.08,.60,0,2.21,0);for(const x of [-.735,.735])box('wood',.08,2.12,.58,x,1.14,0);box('darkWood',1.55,2.12,.03,0,1.14,-.285);box('wood',1.39,.06,.54,0,.98,0);
   for(const x of [-.35,.35]){box('lightWood',.66,.82,.025,x,.54,.277);box('wood',.54,.67,.02,x,.54,.299);rod('brass',.013,[x+(x<0?.25:-.25),.68,.31],[x+(x<0?.25:-.25),.68,.34]);}
   for(const y of [1.02,1.43,1.84]){box('wood',1.39,.055,.54,0,y-.0275,0);for(const x of [-.43,0,.43])fold(x,y+.003,0,.36,.43,4);}
  },
  linenTrolley(){
   for(const x of [-.59,.59])for(const z of [-.26,.26]){add(new THREE.CylinderGeometry(.095,.095,.045,14).rotateZ(Math.PI/2).translate(x,.095,z),'iron');rod('iron',.022,[x,.095,z],[x,.25,z]);box('wood',.055,.72,.055,x,.61,z);}
   for(const y of [.27,.68])box('wood',1.32,.055,.64,0,y,0);for(const z of [-.31,.31])box('wood',1.32,.09,.04,0,.76,z);for(const y of [.2975,.7075])for(const x of [-.36,.36])fold(x,y+.003,0,.52,.48,4);
   for(const z of [-.26,.26])rod('iron',.022,[.59,.90,z],[.68,1.075,z]);rod('iron',.022,[.68,1.075,-.26],[.68,1.075,.26]);
  },
  dutyBoard(){frame(1.05,.76);print('staff duty board',.94,.65,0,.38,.034,(ctx,w,h)=>{text(ctx,'WARD DUTIES',w/2,h*.15,44);ctx.lineWidth=3;for(let i=0;i<5;i++){const y=h*(.30+i*.13);ctx.beginPath();ctx.moveTo(30,y);ctx.lineTo(w-30,y);ctx.stroke();}for(const [i,[a,b]] of [['Morning','Fresh linen'],['Noon','Ward rounds'],['Afternoon','Visitors'],['Evening','Laundry return']].entries()){ctx.font='28px Georgia';ctx.textAlign='left';ctx.fillText(a,w*.06,h*(.39+i*.13));ctx.fillText(b,w*.47,h*(.39+i*.13));}});},
  draughtsSet(){
   box('wood',.66,.024,.66,0,.012,0);for(let row=0;row<8;row++)for(let col=0;col<8;col++)box((row+col)%2?'darkWood':'lightWood',.074,.002,.074,-.259+col*.074,.025,-.259+row*.074);
   for(const [row,cols] of [[0,[1,3,5,7]],[1,[0,2,4,6]],[2,[1,3]],[4,[3,5]],[5,[0,4,6]],[6,[1,3,5,7]],[7,[0,2,4,6]]])for(const col of cols)add(new THREE.CylinderGeometry(.026,.026,.018,16).translate(-.259+col*.074,.035,-.259+row*.074),row<4?'darkWood':'ivory');
  },
  newspaperStand(){
   for(const x of [-.29,.29])for(const z of [-.19,.19])rod('wood',.027,[x,0,z],[x,.73,z*.50]);box('wood',.72,.055,.46,0,.055,0);box('wood',.64,.44,.025,0,.91,0,-.30);box('darkWood',.69,.045,.16,0,.706,.055);rod('wood',.023,[-.29,.30,0],[.29,.30,0]);
   print('newspaper',.58,.37,0,.91,.025,(ctx,w,h)=>{text(ctx,'THE COUNTY GAZETTE',w/2,h*.12,47);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(25,h*.22);ctx.lineTo(w-25,h*.22);ctx.stroke();for(let col=0;col<3;col++)for(let row=0;row<17;row++){ctx.lineWidth=2;ctx.beginPath();const x=w*(.05+col*.31),y=h*(.30+row*.037);ctx.moveTo(x,y);ctx.lineTo(x+w*(row%4===0?.19:.26),y);ctx.stroke();}},-.30);
  },
  sewingBasket(){
   box('wicker',.48,.03,.34,0,.015,0);for(const x of [-.225,.225])box('wicker',.03,.14,.34,x,.09,0);for(const z of [-.155,.155])box('wicker',.48,.14,.03,0,.09,z);
   for(let row=0;row<7;row++){const y=.035+row*.017;for(const z of [-.174,.174])rod('lightWood',.004,[-.235,y,z],[.235,y,z]);for(const x of [-.244,.244])rod('lightWood',.004,[x,y,-.16],[x,y,.16]);}for(let i=0;i<13;i++)for(const z of [-.173,.173])rod('darkWood',.003,[-.22+i*.037,.026,z],[-.22+i*.037,.16,z]);
   box('linen',.29,.055,.23,-.05,.065,0);for(const x of [.08,.15]){add(new THREE.CylinderGeometry(.022,.022,.072,12).translate(x,.097,.05),'red');for(const y of [.06,.134])add(new THREE.CylinderGeometry(.03,.03,.01,12).translate(x,y,.05),'lightWood');}
   for(let i=0;i<12;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12;rod('wicker',.012,[-.20*Math.cos(a),.15+.14*Math.sin(a),0],[-.20*Math.cos(b),.15+.14*Math.sin(b),0]);}
  }
 };
 for(const [kind,build] of Object.entries(builders)){
  pieces={};build();const parts=Object.entries(pieces).map(([key,list])=>({geometry:mergeGeometries(list),material:materials[key],paint:materials[key]})),bounds=new THREE.Box3();
  for(const part of parts){part.geometry.computeBoundingBox();bounds.union(part.geometry.boundingBox);}
  const size=bounds.getSize(new THREE.Vector3()),c=HALL_PROP_CATALOG[kind];
  for(const part of parts){part.geometry.translate(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);part.geometry.scale(c.width/size.x,c.height/size.y,c.depth/size.z);part.geometry.computeBoundingBox();part.geometry.computeBoundingSphere();}
  models[kind]=parts;
 }
 return models;
}
