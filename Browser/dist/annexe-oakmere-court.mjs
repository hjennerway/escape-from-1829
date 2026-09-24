// September 24 rear-court photo. Coordinates follow the existing angled wing;
// the supplied blue/green join and red square supersede the earlier open gap.
export function addOakmereCourt(THREE,{model,scale,brick,roof,material,worldUV,hipRoof}){
 const ward=model.userData.wards.oakmere,group=new THREE.Group();
 group.name='Oakmere rear court additions';ward.add(group);
 const c=Math.cos(.43),s=Math.sin(.43),origin=[-31*scale,-62*scale];
 group.position.set(origin[0],0,origin[1]);group.rotation.y=.43;
 const trim=material(0xa3553d),frame=material(0xe3e0d0),glass=material(0x293b3a),iron=material(0x394440),stone=material(0xb4ac96);
 const mesh=(g,m,x,y,z,name)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=o.receiveShadow=true;group.add(o);return o;};
 const box=(m,x,y,z,w,h,d,name,collision=false)=>{const o=mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),m,x*scale,y,z*scale,name);if(collision)o.userData.orientedCollision=true;return o;};
 const wall=(x,z,w,h,d,name)=>box(brick,x,h/2,z,w*scale,h,d*scale,name,true);
 const cap=(x,z,w,d,h,rise,name)=>{const o=hipRoof(x*scale,z*scale,w*scale,d*scale,h,rise);o.name=name;group.add(o);return o;};
 function window(x,y,z,w,h,r=Math.PI/2,blind=false){
  const face=new THREE.Group();face.position.set(x*scale,y,z*scale);face.rotation.y=r;group.add(face);
  const part=(m,u,v,n,pw,ph,pd,name)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(pw,ph,pd),m);o.position.set(u,v,n);o.name=name;o.castShadow=o.receiveShadow=true;face.add(o);};
  part(blind?frame:glass,0,0,.065,w,h,.07,'Oakmere court window glazing');
  for(const u of [-w/2,-w/6,w/6,w/2])part(frame,u,0,.13,.06,h,.08,'Oakmere court sash frame');
  for(let row=0;row<=6;row++)part(frame,0,-h/2+row*h/6,.14,w+.08,.045,.08,'Oakmere court sash bar');
  part(stone,0,-h/2-.10,.12,w+.25,.14,.26,'Oakmere court sill');
  part(trim,0,h/2+.12,.04,w+.3,.22,.15,'Oakmere court brick head');
 }
 // The far corner must reach z=-54.35 after both earlier whole-wing shifts.
 // 12.5 map units extends the full blue edge into the existing green wall.
 const end=27.5,start=14.96;
 wall(0,(start+end)/2,12,8.4,end-start,'Oakmere joined extension brick walls');
 // Continue the existing roof ridge from its last horizontal ridge point.
 // The former hip is covered by these two upward-facing slate planes.
 const half=6*scale+.4,ridgeStart=15*scale+.4-half*.83,far=end*scale;
 const positions=[];
 for(const side of [-1,1]){
  const a=[side*half,8.4,ridgeStart],b=[side*half,8.4,far],r=[0,10.8,ridgeStart],t=[0,10.8,far];
  const triangles=side<0?[[a,r,t],[a,t,b]]:[[a,t,r],[a,b,t]];
  for(const tri of triangles)for(const p of tri.reverse())positions.push(...p);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(positions.flatMap((_,i)=>i%3===0?[positions[i]/3,positions[i+2]/3]:[]),2));g.computeVertexNormals();
 mesh(g,roof,0,0,0,'Oakmere continuous extension slate roof');
 for(const side of [-1,1]){
  for(const y of [.25,4.35,8.18])box(trim,side*6,y,(start+end)/2,.18,.3,(end-start)*scale,'Oakmere extension brick band');
  box(frame,side*6.08,8.4,(15+end)/2,.15,.14,(end-15)*scale,'Oakmere extension pale gutter');
  for(const n of [16.8,19.7,22.6])for(const y of [2.35,6.4])window(side*6.01,y,n,1.4,2.65,side*Math.PI/2);
 }
 // Shallow two-storey hip-roof projection visible in the centre of the photo.
 wall(6.65,-1.5,1.3,8.4,7.8,'Oakmere court projecting bay brick walls');
 cap(3.6,-1.5,7.4,8.05,8.4,2.4,'Oakmere court projecting bay slate roof');
 for(const z of [-3.6,.6])for(const y of [2.35,6.4])window(7.31,y,z,1.5,2.7);
 for(const y of [.25,4.35,8.18])box(trim,7.33,y,-1.5,.16,.28,8*scale,'Oakmere bay brick band');
 for(const z of [-5.4,2.4])box(iron,7.37,4.15,z,.12,8.3,.12,'Oakmere bay downpipe');
 // Latest purple circle: the square annex moves behind the service head, towards
 // its right end. Convert the head centre into the main wing's local frame.
 const hx=c*(-3)-s*(-12),hz=s*(-3)+c*(-12),headExtension=14,headEnd=11+headExtension,ax=hx+headEnd-3.5,az=hz-8.45;
 // The later blue circle selects the cross-head's court face, not the long
 // green wing. Retain its outward extension; the annex now joins its rear.
 wall(hx+11+headExtension/2,hz,headExtension+.06,8.4,10,'Oakmere widened head brick walls');
 const roofHalfDepth=5*scale+.4,inset=roofHalfDepth*.83;
 const oldRidgeEnd=11*scale+.4-inset,newEnd=headEnd*scale+.4,newRidgeEnd=newEnd-inset;
 const vertices=[[oldRidgeEnd,8.4,-roofHalfDepth],[newEnd,8.4,-roofHalfDepth],[newEnd,8.4,roofHalfDepth],[oldRidgeEnd,8.4,roofHalfDepth],[oldRidgeEnd,10.9,0],[newRidgeEnd,10.9,0]];
 const headPositions=[];
 for(const f of [[0,4,5],[0,5,1],[1,5,2],[2,5,4],[2,4,3]])for(const i of f)headPositions.push(...vertices[i]);
 const headRoof=new THREE.BufferGeometry();headRoof.setAttribute('position',new THREE.Float32BufferAttribute(headPositions,3));
 headRoof.setAttribute('uv',new THREE.Float32BufferAttribute(headPositions.flatMap((_,i)=>i%3===0?[headPositions[i]/3,headPositions[i+2]/3]:[]),2));headRoof.computeVertexNormals();
 mesh(headRoof,roof,hx*scale,0,hz*scale,'Oakmere widened head slate roof');
 for(const side of [-1,1]){
  for(const y of [.25,4.35,8.18])box(trim,hx+18,y,hz+side*5.025,14*scale,.3,.17,'Oakmere head brick band');
  box(frame,hx+18,8.4,hz+side*5.1,14*scale,.14,.17,'Oakmere head pale gutter');
  for(const u of [12.4,15.5,19.5,22.8])for(const y of [2.35,6.4])window(hx+u,y,hz+side*5.01,1.4,2.7,side>0?0:Math.PI);
 }
 for(const n of [-2.5,0,2.5])for(const y of [2.35,6.4])window(hx+headEnd+.01,y,hz+n,1.4,2.7);
 // Extend the bay to the blue guide while retaining its rear join.
 const bayAdvance=4.5;
 wall(hx+14,hz+5.62+bayAdvance/2,6.4,8.4,1.3+bayAdvance,'Oakmere blue-face projecting bay brick walls');
 cap(hx+14,hz+3.5+bayAdvance/2,7.4,5.8+bayAdvance,8.4,2.5,'Oakmere blue-face projecting bay slate roof');
 for(const u of [12.4,15.5])for(const y of [2.35,6.4])window(hx+u,y,hz+6.28+bayAdvance,1.45,2.7,0);
 for(const y of [.25,4.35,8.18])box(trim,hx+14,y,hz+6.3+bayAdvance,6.5*scale,.3,.17,'Oakmere blue-face bay brick band');
 for(const u of [10.8,17.2,24.8])box(iron,hx+u,4.16,hz+5.15,.12,8.32,.12,'Oakmere head downpipe');
 group.userData.head={x:hx,z:hz,extension:headExtension,end:headEnd};
 wall(ax,az,7,4.05,7,'Oakmere square annex brick walls');
 cap(ax,az,7,7,4.05,2.05,'Oakmere square annex slate roof');
 for(const side of [-1,1])box(frame,ax+side*3.55,4.05,az,.15,.15,7.2*scale,'Oakmere annex pale gutter');
 for(const z of [az-1.3,az+.5])window(ax+3.51,2.45,z,1.22,2.1,Math.PI/2,true);
 window(ax+1.6,1.75,az-3.51,1.5,3.4,Math.PI);
 box(stone,ax+1.6,.12,az-4.3,2.6,.24,2.4,'Oakmere annex entrance landing',true);
 for(const u of [-1.2,1.2]){
  for(const z of [az-3.7,az-4.95])box(iron,ax+1.6+u/scale,.62,z,.055,1.05,.055,'Oakmere annex handrail post');
  box(iron,ax+1.6+u/scale,1.12,az-4.32,.055,.06,1.3*scale,'Oakmere annex handrail');
 }
 box(iron,ax+3.57,2.02,az-3.3,.11,4.04,.11,'Oakmere annex downpipe');
 // Small evergreen shrubs frame the wall and entrance, as in the photograph.
 // Keep these local to the ward so dates, visibility and selection follow it.
 for(const [x,z,h,r] of [[8.8,-5.2,4.8,1],[8.8,2.3,4.3,.95],[8.1,-8.1,5.4,1.1],[ax+3.9,az-3.4,5.1,.8],[ax-.1,az-3.9,4.6,.85],[hx+12,hz+7.2+bayAdvance,4.5,.9],[hx+17.3,hz+7.1+bayAdvance,5.2,1],[hx+22.8,hz+6.5,4.4,.95]]){
  box(iron,x,.55,z,.18,1.1,.18,'Oakmere shrub trunk',true);
  for(let i=0;i<3;i++)mesh(new THREE.ConeGeometry(r*(1-i*.18),h*.65,9),material(i%2?0x4e6227:0x3a532a),x*scale,h*(.34+i*.17),z*scale,'Oakmere evergreen shrub');
 }
 group.userData.extension={start,end,width:12};group.userData.annex={x:ax,z:az,size:7};
 model.userData.oakmereCourt=group;
 return group;
}
