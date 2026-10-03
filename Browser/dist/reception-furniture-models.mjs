// Original interpretive entrance-hall props. Front is +Z; dimensions are metres.
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {FURNITURE_CATALOG} from './asylum-furniture.mjs';
import {createMedicalFurnitureMaterials} from './medical-furniture-models.mjs';

export const RECEPTION_RULES=['VISITORS ARE REQUESTED','TO REPORT TO THE ATTENDANT','VISITING HOURS: 2 TO 4','ADMISSION BY PERMISSION','PLEASE WAIT IN THE HALL'];
export function createReceptionFurnitureModels(THREE,{labels=typeof document!=='undefined'}={}){
 const materials=createMedicalFurnitureMaterials(THREE),models={};let pieces;
 const add=(g,key)=>{g=g.index?g.toNonIndexed():g;g.deleteAttribute('uv');g.computeVertexNormals();(pieces[key]??=[]).push(g);};
 const box=(key,w,h,d,x,y,z,ry=0)=>add(new THREE.BoxGeometry(w,h,d).rotateY(ry).translate(x,y,z),key);
 const rod=(key,r,a,b,top=r)=>{
  const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);
  add(new THREE.CylinderGeometry(top,r,v.length(),10).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize())).translate(...av.add(bv).multiplyScalar(.5).toArray()),key);
 };
 const ring=(key,r,t,x,y,z)=>add(new THREE.TorusGeometry(r,t,6,16).translate(x,y,z),key);
 function print(name,w,h,x,y,z,draw,rx=0){
  if(!labels){add(new THREE.PlaneGeometry(w,h).rotateX(rx).translate(x,y,z),'paper');return;}
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=Math.round(768*h/w);const ctx=canvas.getContext('2d');
  ctx.fillStyle='#d0c5a3';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#403827';ctx.strokeStyle='#716346';draw(ctx,canvas.width,canvas.height);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const key=name;
  // Printed ink stays readable in the close torch beam as well as dim light.
  materials[key]=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});materials[key].name='Reception '+name;
  (pieces[key]??=[]).push(new THREE.PlaneGeometry(w,h).rotateX(rx).translate(x,y,z).toNonIndexed());
 }
 const centered=(ctx,t,x,y,size=35)=>{ctx.font=`${size}px Georgia, serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x,y);};
 const builders={
  receptionDesk(){
   box('wood',1.85,.075,.88,0,.8825,0);box('darkWood',1.78,.035,.81,0,.8275,0);
   for(const x of [-.79,.79])for(const z of [-.31,.31]){
    box('wood',.082,.80,.082,x,.40,z);box('darkWood',.092,.045,.092,x,.026,z);
   }
   for(const x of [-.79,.79])box('wood',.055,.17,.70,x,.745,0);
   // Two shallow drawers face the clerk, leaving an open knee space below.
   box('wood',1.60,.17,.64,0,.745,0);
   for(const x of [-.40,.40]){
    box('lightWood',.765,.135,.030,x,.745,-.333);box('darkWood',.60,.003,.006,x,.784,-.351);
    for(const end of [-.045,.045])rod('brass',.008,[x+end,.740,-.354],[x+end,.740,-.371]);
    rod('brass',.009,[x-.045,.740,-.371],[x+.045,.740,-.371]);
   }
  },
  waitingBench(){
   for(const z of [-.16,.015,.19])box('wood',2.45,.045,.16,0,.4475,z);
   for(const x of [-1.07,1.07]){
    for(const z of [-.20,.20])box('darkWood',.065,.425,.065,x,.2125,z);
    box('wood',.065,.055,.43,x,.22,0);box('wood',.055,.92,.06,x,.48,-.23);
   }
   box('wood',2.45,.13,.04,0,.875,-.23);box('lightWood',2.35,.13,.035,0,.665,-.23);
   box('darkWood',2.16,.055,.05,0,.22,-.15);
  },
  longcaseClock(){
   box('darkWood',.58,.15,.34,0,.075,0);box('wood',.52,.25,.31,0,.275,0);
   box('darkWood',.56,.055,.33,0,.405,0);box('wood',.42,1.18,.27,0,1.015,-.015);
   box('darkWood',.36,.99,.014,0,1.015,.127);box('wood',.32,.95,.016,0,1.015,.143);
   // A glazed pendulum window and a brass escutcheon in the trunk door.
   box('darkWood',.16,.38,.007,0,.88,.153);box('glass',.15,.36,.005,0,.88,.158);
   rod('brass',.005,[0,.75,.165],[0,1.035,.165]);add(new THREE.CircleGeometry(.041,20).translate(0,.745,.166),'brass');
   ring('brass',.015,.004,.123,1.06,.160);box('iron',.006,.018,.003,.123,1.059,.166);
   box('darkWood',.57,.08,.34,0,1.66,0);box('wood',.53,.49,.31,0,1.935,0);
   for(const x of [-.247,.247])rod('brass',.016,[x,1.715,.159],[x,2.135,.159]);
   box('darkWood',.61,.065,.35,0,2.19,0);box('wood',.58,.045,.33,0,2.245,0);
   for(const x of [-.24,0,.24]){rod('brass',.010,[x,2.27,0],[x,2.315,0]);add(new THREE.SphereGeometry(.024,10,8).translate(x,2.316,0),'brass');}
   print('clock dial',.43,.43,0,1.948,.163,(ctx,w,h)=>{
    ctx.fillStyle='#e0d8bd';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#61523b';ctx.lineWidth=9;ctx.beginPath();ctx.arc(w/2,h/2,w*.455,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#352f24';
    const roman=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
    roman.forEach((t,i)=>{const a=i*Math.PI/6;centered(ctx,t,w/2+Math.sin(a)*w*.35,h/2-Math.cos(a)*h*.35,40);});
    for(let i=0;i<60;i++){const a=i*Math.PI/30;ctx.lineWidth=i%5?2:4;ctx.beginPath();ctx.moveTo(w/2+Math.sin(a)*w*.415,h/2-Math.cos(a)*h*.415);ctx.lineTo(w/2+Math.sin(a)*w*.438,h/2-Math.cos(a)*h*.438);ctx.stroke();}
    centered(ctx,'B. PEERS',w/2,h*.61,24);centered(ctx,'CHESTER',w/2,h*.66,22);
    ctx.strokeStyle='#282b25';ctx.lineWidth=11;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(w*.285,h*.37);ctx.lineTo(w/2,h/2);ctx.lineTo(w*.785,h*.335);ctx.stroke();
   });
  },
  keyCupboard(){
   box('darkWood',.46,.66,.022,0,.36,-.060);
   for(const x of [-.218,.218])box('wood',.026,.72,.14,x,.36,0);
   for(const y of [.015,.705])box('wood',.46,.03,.14,0,y,0);
   // Folded-back doors retain their hinges and lock plate; the keys stay visible.
   for(const side of [-1,1]){
    box('wood',.18,.65,.021,side*.265,.36,-.027,side*2.85);
    for(const y of [.16,.56])rod('brass',.009,[side*.231,y-.028,.05],[side*.231,y+.028,.05]);
   }
   box('brass',.027,.065,.006,.297,.36,.002);box('iron',.006,.022,.007,.297,.36,.006);
   for(const [i,x] of [-.14,0,.14].entries())for(const [row,y] of [.24,.52].entries()){
    rod('brass',.004,[x,y,-.035],[x,y,.005]);ring('iron',.017,.003,x,y-.021,.017);
    rod('iron',.0035,[x,y-.038,.017],[x,y-.124,.017]);box('iron',.025,.011,.007,x+.009,y-.117,.017);
    print(`key label ${row}-${i}`,.095,.036,x,y+.054,.007,(ctx,w,h)=>centered(ctx,['WEST','EAST','STORE','WARD','OFFICE','GATE'][row*3+i],w/2,h/2,28));
   }
  },
  rulesNotice(){
   box('darkWood',.76,.92,.035,0,.46,0);
   for(const x of [-.359,.359])box('wood',.042,.92,.045,x,.46,0);
   for(const y of [.022,.898])box('wood',.76,.044,.045,0,y,0);
   print('hall rules',.664,.824,0,.46,.023,(ctx,w,h)=>{
    ctx.lineWidth=3;ctx.strokeRect(22,22,w-44,h-44);centered(ctx,'HOUSE RULES',w/2,h*.15,47);
    ctx.beginPath();ctx.moveTo(w*.14,h*.23);ctx.lineTo(w*.86,h*.23);ctx.stroke();
    RECEPTION_RULES.forEach((t,i)=>centered(ctx,t,w/2,h*(.33+i*.115),29));
    centered(ctx,'By order of the Superintendent',w/2,h*.91,25);
   });
  },
  clerkSet(){
   // Open ledger, bound cover, separate loose sheets and an ink bottle.
   box('darkWood',.54,.027,.34,-.10,.0135,.035);box('paper',.50,.021,.31,-.10,.0375,.035);
   rod('red',.002,[-.10,.049,-.11],[-.10,.049,.17]);
   print('admissions ledger',.49,.30,-.10,.049,.035,(ctx,w,h)=>{
    centered(ctx,'ADMISSIONS',w*.245,h*.12,25);centered(ctx,'REGISTER',w*.755,h*.12,25);
    ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,h);ctx.stroke();
    for(let row=0;row<8;row++){const y=h*(.24+row*.085);ctx.beginPath();ctx.moveTo(w*.04,y);ctx.lineTo(w*.46,y);ctx.moveTo(w*.54,y);ctx.lineTo(w*.96,y);ctx.stroke();ctx.font='italic 18px Georgia';ctx.textAlign='left';ctx.fillText(`${row+1}   ·   Received`,w*.07,y-3);ctx.fillText('Observations entered',w*.57,y-3);}
   },-Math.PI/2);
   for(let i=0;i<3;i++)box('paper',.28,.004,.35,.40+i*.012,.003+i*.005,.0+i*.015,.07*i);
   print('loose paper',.25,.32,.424,.021,.03,(ctx,w,h)=>{
    centered(ctx,'CORRESPONDENCE',w/2,h*.12,30);ctx.font='italic 24px Georgia';ctx.textAlign='left';
    for(let i=0;i<7;i++)ctx.fillText(['To the Superintendent,','Sir,','The enclosed particulars','are submitted for your','consideration.','Your obedient servant,','The Clerk'][i],w*.09,h*(.25+i*.093));
   },-Math.PI/2);
   add(new THREE.CylinderGeometry(.034,.039,.055,12).translate(.25,.031,-.205),'glass');
   add(new THREE.CylinderGeometry(.019,.025,.014,12).translate(.25,.065,-.205),'iron');
   rod('ivory',.003,[.252,.070,-.205],[.36,.27,-.16]);
   add(new THREE.SphereGeometry(1,10,6).scale(.026,.105,.004).rotateZ(-.49).translate(.342,.233,-.17),'ivory');
   // Brass handbell, with a turned wooden handle and a visible flared lip.
   const bell=[[0,0],[.064,0],[.058,.01],[.030,.080],[.018,.09],[0,.09]].map(([x,y])=>new THREE.Vector2(x,y));
   add(new THREE.LatheGeometry(bell,20).translate(-.45,.001,-.18),'brass');rod('darkWood',.012,[-.45,.085,-.18],[-.45,.164,-.18],.018);
   for(const x of [-.70,.70]){
    add(new THREE.CylinderGeometry(.053,.061,.018,16).translate(x,.009,-.19),'brass');
    rod('brass',.014,[x,.018,-.19],[x,.109,-.19],.022);
    add(new THREE.CylinderGeometry(.026,.020,.018,16).translate(x,.117,-.19),'brass');
    rod('ivory',.018,[x,.121,-.19],[x,.31,-.19],.016);rod('iron',.0015,[x,.310,-.19],[x,.319,-.19]);
    add(new THREE.SphereGeometry(1,8,6).scale(.008,.019,.008).translate(x,.332,-.19),'amber');
   }
  }
 };
 for(const [kind,build] of Object.entries(builders)){
  pieces={};build();const parts=Object.entries(pieces).map(([key,list])=>({geometry:mergeGeometries(list),material:materials[key],paint:materials[key]}));
  const bounds=new THREE.Box3();for(const part of parts){part.geometry.computeBoundingBox();bounds.union(part.geometry.boundingBox);}
  const size=bounds.getSize(new THREE.Vector3()),c=FURNITURE_CATALOG[kind];
  for(const part of parts){part.geometry.translate(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);part.geometry.scale(c.width/size.x,c.height/size.y,c.depth/size.z);part.geometry.computeBoundingBox();part.geometry.computeBoundingSphere();}
  models[kind]=parts;
 }
 return models;
}
