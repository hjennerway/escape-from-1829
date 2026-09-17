// Clock-facing elevation interpreted from Research/church/clock-front-reference.png.
// Dimensions are visual estimates; the registered nave and grounds stay fixed.
export function addChurchFront(THREE,{chapel,brick,roof,worldUV}){
 const front=new THREE.Group();front.name='Church photographed clock front';chapel.add(front);
 const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.94,...extra});
 const sandstone=material(0x766557),edge=material(0x534e40),recess=material(0x242b2b);
 const glass=material(0x66777c,{roughness:.68,metalness:.08}),lead=material(0x343c3d);
 const masonry=brick.clone();masonry.color.set(0xb2a39a);
 function mesh(name,geometry,mat,x=0,y=0,z=0){const o=new THREE.Mesh(geometry,mat);o.name=name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;front.add(o);return o;}
 function box(name,mat,x,y,z,w,h,d){return mesh(name,worldUV(new THREE.BoxGeometry(w,h,d),1.7),mat,x,y,z);}
 function beam(name,a,b,width,mat=edge){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);const o=mesh(name,new THREE.BoxGeometry(width,v.length(),width),mat);o.position.copy(p).add(q).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
 function arch(w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h*.73);s.quadraticCurveTo(w*.48,h*.88,0,h);s.quadraticCurveTo(-w*.48,h*.88,-w/2,h*.73);s.closePath();return s;}
 function panel(name,shape,mat,x,y,z,depth=.08){return mesh(name,worldUV(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:16}),1.7),mat,x,y,z);}
 function surround(name,x,y,w,h,t,z,mat){const s=arch(w+2*t,h+1.5*t),points=arch(w,h).getPoints(32).reverse().map(p=>new THREE.Vector2(p.x,p.y+t));s.holes.push(new THREE.Path(points));panel(name,s,mat,x,y-t,z,.10);}
 // Shallow weathered facing replaces the bright generic brick on this elevation.
 box('Church front brick facing',masonry,0,4.85,14.018,10,7.9,.036);
 const triangle=new THREE.Shape();triangle.moveTo(-5,0);triangle.lineTo(5,0);triangle.lineTo(0,6.1);triangle.closePath();
 panel('Church front brick gable',triangle,masonry,0,8.8,14.015,.035);
 box('Church front dark stone plinth',edge,0,.46,14.29,10.55,.91,.17);
 box('Church front plinth weathering',sandstone,0,.99,14.18,10.35,.16,.30);
 // Two independent pointed lights: no third centre arch or flanking front lights.
 const sill=3.55,height=8.15,width=1.46;
 for(const x of [-.91,.91]){
  panel('Church lancet dark reveal',arch(width+.22,height+.18),recess,x,sill-.05,14.065,.07);
  panel('Church diamond leaded lancet',arch(width,height),glass,x,sill,14.15,.035);
  surround('Church lancet inner stone moulding',x,sill,width,height,.13,14.19,sandstone);
  surround('Church lancet recessed arch order',x,sill-.07,width+.30,height+.26,.09,14.12,edge);
  surround('Church lancet outer stone moulding',x,sill-.14,width+.51,height+.48,.12,14.22,sandstone);
  // Clip both diagonal families to the pointed glazing boundary.
  const polygon=arch(width,height).getPoints(40);
  for(const slope of [-1.9,1.9])for(let c=-2;c<height+2;c+=.51){
   const hits=[];
   for(let i=0;i<polygon.length-1;i++){
    const a=polygon[i],b=polygon[i+1],da=a.y-slope*a.x-c,db=b.y-slope*b.x-c;
    if(da*db<0){const t=da/(da-db);hits.push([a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t]);}
   }
   if(hits.length===2)beam('Church diamond lead came',[x+hits[0][0],sill+hits[0][1],14.198],[x+hits[1][0],sill+hits[1][1],14.198],.018,lead);
  }
  box('Church lancet iron saddle bar',lead,x,sill+height*.53,14.205,width,.036,.025);
 }
 box('Church paired lancet central mullion',sandstone,0,7.21,14.30,.23,7.55,.30);
 box('Church paired lancet projecting sill',edge,0,3.39,14.37,4.45,.23,.72);
 box('Church sill lower sandstone course',sandstone,0,3.20,14.19,4.25,.14,.36);
 // Buttresses frame the window, with broad feet and successive sloping offsets.
 for(const side of [-1,1]){
  const x=side*2.78;
  for(const [bottom,top,w,d] of [[.15,1.5,.94,1.24],[1.5,3.25,.78,.99],[3.25,7.15,.63,.76],[7.15,10.5,.49,.52]]){
   box('Church front stepped brick buttress',masonry,x,(bottom+top)/2,14+d/2,w,top-bottom,d);
   const cap=box('Church buttress sloping weathering',sandstone,x,top+.06,14+d/2,w+.14,.19,d+.14);cap.rotation.x=.20;
  }
  beam('Church upper buttress gable coping',[x,10.66,14.36],[side*1.77,12.89,14.36],.25,sandstone);
  box('Church front corner stone foot',edge,side*4.75,.61,14.4,.69,1.22,.83);
  // Small dark putlog holes visible beside the window surrounds.
  for(const [dx,y] of [[2.19,7.3],[2.28,8.0],[2.39,8.7]])box('Church front putlog hole',recess,side*dx,y,14.06,.14,.18,.035);
 }
 // Low shouldered clock stage, seated on a continuous stone string course.
 const stage=new THREE.Shape();stage.moveTo(-2.04,12.85);stage.lineTo(2.04,12.85);stage.lineTo(1.43,14.3);stage.lineTo(1.43,16.9);stage.lineTo(-1.43,16.9);stage.lineTo(-1.43,14.3);stage.closePath();
 panel('Church shouldered clock stage',stage,masonry,0,0,13.55,1.10);
 box('Church clock stage lower cornice',edge,0,12.98,14.22,4.36,.24,1.35);
 box('Church clock stage sandstone string',sandstone,0,13.17,14.24,4.15,.15,1.31);
 for(const side of [-1,1])beam('Church clock shoulder coping',[side*2.02,13.28,14.65],[side*1.40,14.60,14.65],.20,sandstone);
 const dialY=15.31,dialZ=14.76;
 mesh('Church clock recessed stone ring',new THREE.TorusGeometry(1.055,.17,10,64),sandstone,0,dialY,14.68);
 mesh('Church clock dark inner rim',new THREE.TorusGeometry(.936,.045,8,64),edge,0,dialY,dialZ);
 mesh('Church blue clock dial',new THREE.CircleGeometry(.925,64),material(0x243b50),0,dialY,dialZ);
 const gold=material(0xc3b68b);
 // Small geometric Roman numerals stay legible without a font/texture dependency.
 const numerals=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
 for(let i=0;i<12;i++){
  const a=i*Math.PI/6,cx=Math.sin(a)*.755,cy=dialY+Math.cos(a)*.755;
  const chars=numerals[i];
  const point=(u,v)=>[cx+u*Math.cos(a)+v*Math.sin(a),cy-u*Math.sin(a)+v*Math.cos(a),dialZ+.035];
  for(let k=0;k<chars.length;k++){
   const u=(k-(chars.length-1)/2)*.072;
   const strokes=chars[k]==='I'?[[[u,-.073],[u,.073]]]:chars[k]==='V'?[[[u-.029,.073],[u,-.073]],[[u,-.073],[u+.029,.073]]]:[[[u-.029,-.073],[u+.029,.073]],[[u-.029,.073],[u+.029,-.073]]];
   for(const [p,q] of strokes)beam('Church clock Roman numeral',point(...p),point(...q),.014,gold);
  }
 }
 beam('Church clock minute hand',[0,dialY,dialZ+.07],[.66,dialY+.17,dialZ+.07],.047,gold);
 beam('Church clock hour hand',[0,dialY,dialZ+.075],[.26,dialY+.34,dialZ+.075],.067,gold);
 mesh('Church clock hand boss',new THREE.CircleGeometry(.07,16),gold,0,dialY,dialZ+.12);
 const cap=new THREE.Shape();cap.moveTo(-1.55,0);cap.lineTo(1.55,0);cap.lineTo(0,3.88);cap.closePath();
 panel('Church clock steep brick pediment',cap,masonry,0,16.83,13.5,1.16);
 for(const side of [-1,1]){
  beam('Church clock pediment stone coping',[side*1.65,16.82,14.74],[0,20.84,14.74],.20,sandstone);
  const slate=box('Church clock pediment slate pitch',roof,side*.78,18.77,14.02,4.32,.12,1.43);slate.rotation.z=-side*Math.atan2(3.88,1.55);
  box('Church clock pediment kneeler',sandstone,side*1.47,16.85,14.20,.42,.22,1.32);
 }
 // Cross with small rounded terminals seen against the sky in the reference.
 beam('Church clock gable cross stem',[0,20.72,14.13],[0,21.65,14.13],.13,edge);
 beam('Church clock gable cross arms',[-.32,21.34,14.13],[.32,21.34,14.13],.13,edge);
 for(const [x,y] of [[0,21.67],[-.34,21.34],[.34,21.34]])mesh('Church cross terminal',new THREE.SphereGeometry(.105,8,6),edge,x,y,14.13);
 return front;
}
