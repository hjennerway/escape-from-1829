// Original modest ward fittings, informed by the references in Research/room-furnishings.
// Front is local +Z. Each mesh assembly matches its shared walking footprint.
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {createMedicalFurnitureMaterials} from './medical-furniture-models.mjs';
import {SANITARY_CATALOG} from './sanitary-furnishings.mjs';

export function createSanitaryFurnitureModels(THREE){
 const materials=createMedicalFurnitureMaterials(THREE),models={};let pieces;
 const add=(g,key)=>{g=g.index?g.toNonIndexed():g;g.deleteAttribute('uv');g.computeVertexNormals();(pieces[key]??=[]).push(g);};
 const box=(key,w,h,d,x,y,z)=>add(new THREE.BoxGeometry(w,h,d).translate(x,y,z),key);
 const rod=(key,r,a,b)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);add(new THREE.CylinderGeometry(r,r,v.length(),10).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize())).translate(...av.add(bv).multiplyScalar(.5).toArray()),key);};
 const lathe=(key,profile,x,y,z)=>add(new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),32).translate(x,y,z),key);
 const builders={
  privySeat(){
   // A real opening through the timber seat exposes the recessed pan below.
   for(const x of [-.38,.38])box('wood',.06,.48,.69,x,.24,0);
   box('wood',.70,.48,.045,0,.24,.3225);box('wood',.70,.48,.045,0,.24,-.3225);
   box('darkWood',.82,.055,.72,0,.0275,0);
   const seat=new THREE.Shape();seat.moveTo(-.41,-.36);seat.lineTo(.41,-.36);seat.lineTo(.41,.36);seat.lineTo(-.41,.36);seat.closePath();
   const hole=new THREE.Path();hole.absellipse(0,-.035,.15,.19,0,Math.PI*2,true);seat.holes.push(hole);
   add(new THREE.ExtrudeGeometry(seat,{depth:.055,bevelEnabled:false,curveSegments:32}).rotateX(-Math.PI/2).translate(0,.48,0),'lightWood');
   lathe('ivory',[[.07,.08],[.075,.10],[.10,.21],[.14,.36],[.17,.43],[.18,.445],[.165,.45],[.145,.43],[.115,.36],[.055,.16],[.035,.13],[.07,.08]],0,0,.035);
   // Simple iron waste fitting and a small hand-operated valve at the side.
   rod('iron',.034,[0,.055,.035],[0,.16,.035]);
   box('brass',.045,.026,.065,.33,.555,-.25);rod('brass',.012,[.33,.555,-.25],[.33,.58,-.19]);
   for(const x of [-.32,.32])box('iron',.055,.018,.06,x,.542,-.29);
   // Separate boards and restrained wear suit an institutional timber surround.
   for(const x of [-.235,0,.235])box('darkWood',.003,.39,.002,x,.255,.346);
  },
  privyScreen(){
   for(const z of [-.66,.66])box('darkWood',.075,1.80,.08,0,.90,z);
   for(let i=0;i<7;i++)box('wood',.041,1.70,.177,0,.89,-.57+i*.19);
   for(const y of [.16,1.53])box('lightWood',.06,.07,1.32,0,y,0);
   // The exposed edge has a rounded cap rather than sharp loose planks.
   box('darkWood',.075,.045,1.40,0,1.7775,0);
  },
  washstand(){
   for(const x of [-.48,.48])for(const z of [-.25,.25])box('wood',.065,.84,.065,x,.42,z);
   box('darkWood',1.10,.055,.62,0,.8725,0);box('wood',.99,.045,.52,0,.27,0);
   box('wood',1.10,.16,.045,0,.98,-.2875);
   // An open earthenware basin sits directly on the timber top.
   lathe('ivory',[[0,0],[.11,0],[.145,.018],[.205,.12],[.215,.15],[.225,.16],[.218,.173],[.205,.17],[.194,.15],[.14,.04],[.09,.025],[0,.025]],-.20,.90,.045);
   lathe('ceramic',[[0,0],[.10,0],[.12,.035],[.14,.13],[.125,.22],[.08,.275],[.078,.33],[.088,.345],[.084,.36],[.067,.36],[.063,.30],[.06,.275],[.10,.21],[.112,.13],[.09,.05],[0,.03]],.30,.90,-.08);
   add(new THREE.TorusGeometry(.10,.014,8,24).rotateY(Math.PI/2).scale(1,1.10,.72).translate(.425,1.085,-.08),'ceramic');
   // Lip, soap and folded linen; the pail is stored on the lower shelf.
   box('ceramic',.095,.035,.065,.30,1.2325,.015);
   box('ivory',.095,.017,.070,.15,.9085,.18);box('cloth',.19,.025,.21,-.43,.914,-.16);
   lathe('iron',[[.10,0],[.115,.02],[.14,.23],[.147,.245],[.13,.245],[.124,.23],[.10,.03],[0,.03],[0,0]],.13,.2925,0);
   add(new THREE.TorusGeometry(.13,.007,6,24,Math.PI).translate(.13,.5375,0),'iron');
  }
 };
 for(const [kind,build] of Object.entries(builders)){
  pieces={};build();const bounds=new THREE.Box3();
  const parts=Object.entries(pieces).map(([key,geometries])=>{const geometry=mergeGeometries(geometries);geometry.computeBoundingBox();bounds.union(geometry.boundingBox);return {geometry,material:materials[key]};});
  const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),model=SANITARY_CATALOG[kind];
  for(const p of parts){p.geometry.translate(-center.x,-bounds.min.y,-center.z);p.geometry.scale(model.width/size.x,model.height/size.y,model.depth/size.z);p.geometry.computeBoundingBox();}
  models[kind]=parts;
 }
 return models;
}
