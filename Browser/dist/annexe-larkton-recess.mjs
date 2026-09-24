// September 24 photographs: separate the two wards with a stepped entrance.
// Distances are estimated in the existing map frame, not surveyed dimensions.
export const LARKTON_SHIFT=-7;
export function addLarktonRecess(THREE,{model,ranges,openings,scale,brick,roof,material,worldUV,hipRoof}){
 const ward=model.userData.wards['larkton-jodrell'],dx=LARKTON_SHIFT*scale;
 ward.position.x+=dx;
 for(const b of ranges)if(b.wardId==='larkton-jodrell')b.x+=dx;
 for(const o of openings)if(o.wardId==='larkton-jodrell')o.x+=dx;
 const group=new THREE.Group();group.name='Larkton recessed ward entrance';ward.add(group);
 const paving=material(0x77796f);
 const trim=material(0xa34d32),frame=material(0xdedfd4),glass=material(0x273a3b),iron=material(0x30464d),stone=material(0xb7ac90);
 const mesh=(g,m,x,y,z,name)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;group.add(o);return o;};
 const box=(m,x,y,z,w,h,d,name,collision=false)=>{const o=mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),m,x,y,z,name);if(collision)o.userData.orientedCollision=true;return o;};
 const wall=(x,z,w,h,d,name)=>box(brick,x*scale,h/2,z*scale,w*scale,h,d*scale,name,true);
 const cap=(x,z,w,d,h,rise,name)=>{const o=hipRoof(x*scale,z*scale,w*scale,d*scale,h,rise);o.name=name;group.add(o);return o;};
 const sash=(x,y,z,w=1.35,h=2.7)=>{
  x*=scale;z*=scale;
  box(glass,x,y,z+.07,w,h,.08,'Recess sash glazing');
  for(const u of [-w/2,-w/6,w/6,w/2])box(frame,x+u,y,z+.14,.055,h,.09,'Recess sash frame');
  for(const v of [-h/2,-h/3,-h/6,0,h/6,h/3,h/2])box(frame,x,y+v,z+.15,w+.08,.055,.09,'Recess sash bar');
  box(stone,x,y-h/2-.08,z+.11,w+.26,.14,.28,'Recess sash sill');
  box(trim,x,y+h/2+.12,z+.07,w+.3,.24,.17,'Recess sash lintel');
 };
 box(paving,-63.5*scale,.02,.3*scale,7*scale,.04,6.6*scale,'Recess paved entrance apron');
 // Coordinates precede the whole-ward shift. The far end touches Tarvin at -67.
 wall(-63.5,-5.5,7,8.4,5,'West court outer link brick walls');
 cap(-63.5,-5.5,7,5,8.4,2.3,'West court outer link slate roof');
 wall(-66.3,-1,1.4,8.4,4,'Recess projecting two-storey cheek');
 cap(-66.3,-1,1.4,4,8.4,.8,'Recess cheek slate roof');
 wall(-61.4,0,2.8,4.1,6,'Recess low entrance room brick walls');
 cap(-61.4,0,3.05,6.3,4.1,1.5,'Recess low entrance room slate roof');
 for(const [x,z,w,h] of [[-63.5,-3,7,8.4],[-66.3,1,1.4,8.4],[-61.4,3,2.8,4.1]]){
  for(const y of [.25,4.25,h-.22])if(y<h)box(trim,x*scale,y,z*scale+.08,w*scale,.28,.19,'Recess terracotta band');
  box(iron,x*scale,h,z*scale+.18,w*scale+.25,.14,.18,'Recess blue gutter');
 }
 sash(-66.3,6.4,1);sash(-64.7,6.4,-3);sash(-60.8,6.4,-3);
 const doorX=-64.6*scale,doorZ=-3*scale;
 box(glass,doorX,1.6,doorZ+.09,1.6,3.2,.12,'Recess shadowed entrance door');
 for(const u of [-1,1])box(trim,doorX+u,1.48,doorZ+.2,.28,2.96,.35,'Recess arch pier');
 const arch=new THREE.Shape();arch.absarc(0,2.85,1.14,0,Math.PI,false);arch.lineTo(-.84,2.85);arch.absarc(0,2.85,.84,Math.PI,0,true);arch.closePath();
 mesh(new THREE.ExtrudeGeometry(arch,{depth:.32,bevelEnabled:false}),trim,doorX,0,doorZ+.13,'Recess terracotta entrance arch');
 // The low room's pale door has glazed upper lights, as in the street photo.
 const lowX=-61.4*scale,lowZ=3*scale;
 box(frame,lowX,1.65,lowZ+.09,1.6,3.3,.13,'Recess pale room door');
 sash(-61.4,2.4,3.04,1.32,1.45);
 for(const u of [-.39,.39])box(stone,lowX+u,.63,lowZ+.17,.62,.7,.04,'Recess door lower panel');
 box(stone,doorX,.09,doorZ+1.0,2.8,.18,1.9,'Recess entrance landing');
 for(const u of [-1.3,1.3]){
  for(const z of [doorZ+.35,doorZ+1.85])box(iron,doorX+u,.57,z,.06,1.1,.06,'Recess entrance handrail post');
  box(iron,doorX+u,1.1,doorZ+1.1,.06,.06,1.6,'Recess entrance handrail');
 }
 wall(-66.3,-2.2,.95,12.3,.9,'Recess broad chimney stack');
 for(const y of [11.75,12.2])box(trim,-66.3*scale,y,-2.2*scale,1.2*scale,.22,1.12*scale,'Recess chimney cap');
 // Keep range metadata in the same final model frame as the moved masonry.
 const link=ranges.find(b=>b.name==='West court outer link');
 Object.assign(link,{x:(-63.5+LARKTON_SHIFT)*scale,z:-5.5*scale,w:7*scale,d:5*scale,rect:[-67,-8,-60,-3]});
 model.userData.larktonRecess={group,shift:dx,front:-3*scale,lowFront:3*scale};
 return group;
}
