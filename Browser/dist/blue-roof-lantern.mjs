// Shared slate-hung ridge lantern, from the owner's water-tower photograph.
// U follows the host ridge; V points down one of its two slopes. Dimensions
// and roof heights remain the responsibility of each established placement.
export function blueRoofLanternMaterials(roof,blue){
 const cladding=roof.clone();cladding.color.set(0x9daab1);
 const lead=blue.clone();lead.color.set(0x637079);lead.roughness=.8;
 const trim=blue.clone();trim.color.set(0x9bc5dc);
 const frame=blue.clone();frame.color.set(0x7fabca);
 const glass=blue.clone();glass.color.set(0x41545b);glass.roughness=.42;
 glass.userData.windowGlass=true;
 return {roof,cladding,lead,blue,trim,frame,glass};
}

export function addBlueRoofLantern(THREE,{
 name,roofName=name,x,z,axis='x',halfLength,halfWidth,eave,rise,
 overhangU=.3,overhangV=.3,roofThickness=.14,baseHeight,
 windowBottom,windowTop=eave-.2,windowWidth=halfLength*2-.34,
 materials,mesh,detail,opening=()=>{}
}){
 const {roof,cladding,lead,blue,trim,frame,glass}=materials;
 const a=halfLength,b=halfWidth,A=a+overhangU,B=b+overhangV;
 const peak=eave+rise,wallTop=eave-roofThickness;
 const point=(u,y,v)=>axis==='x'?[x+u,y,z+v]:[x+v,y,z-u];
 const bottom=(u,v)=>{const p=point(u,0,v);return Math.min(wallTop-.02,baseHeight(p[0],p[2]));};
 function surface(triangles,material,suffix,{up=false,closure=false}={}){
  const positions=[],uv=[];
  for(let tri of triangles){
   if(up){const [p,q,r]=tri.map(v=>new THREE.Vector3(...v));if(q.sub(p).cross(r.sub(p)).y<0)tri=[...tri].reverse();}
   const [p,q,r]=tri.map(v=>new THREE.Vector3(...v));
   const normal=q.sub(p).cross(r.sub(p)).normalize();
   for(const [u,y,v]of tri){positions.push(...point(u,y,v));uv.push((Math.abs(normal.x)>.5?v:u)/3,(Math.abs(normal.y)>.5?v:y)/3);}
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
  const part=mesh(geometry,material,suffix);part.userData.blueRoofLantern=name;
  if(closure)part.userData.roofWallClosure=true;
  return part;
 }
 const quad=(a,b,c,d)=>[[a,b,c],[a,c,d]];
 // The two end cheeks are slate-hung, including the triangular gables. Split
 // at the host crest so the flashing follows the roof instead of bridging it.
 const cheeks=[],sides=[];
 for(const side of [-1,1]){
  for(const [v0,v1]of [[-b,0],[0,b]]){
   const q=quad([side*a,bottom(side*a,v0),v0],[side*a,wallTop,v0],[side*a,wallTop,v1],[side*a,bottom(side*a,v1),v1]);
   cheeks.push(...(side===1?q:q.map(t=>t.reverse())));
  }
  const q=quad([-a,bottom(-a,side*b),side*b],[a,bottom(a,side*b),side*b],[a,wallTop,side*b],[-a,wallTop,side*b]);
  sides.push(...(side===1?q:q.map(t=>t.reverse())));
 }
 surface(cheeks,cladding,name+' slate cheeks',{closure:true});
 const walls=surface(sides,blue,name+' walls');walls.userData.roofDormer=name;
 const roofTriangles=[...quad([-A,eave,-B],[A,eave,-B],[A,peak,0],[-A,peak,0]),...quad([-A,peak,0],[A,peak,0],[A,eave,B],[-A,eave,B])].map(t=>t.reverse());
 const cap=surface(roofTriangles,roof,roofName+' slate roof',{up:true});
 cap.userData.roofWallJoinsFinished=true;
 cap.userData.roofWallJoinSummary={closed:6,unsupported:0,solid:true,authored:true};
 // One authored envelope prevents the generic gap filler from inventing
 // supports through the glass or coplanar patches on the small gables.
 const outline=[[-A,eave,-B],[A,eave,-B],[A,peak,0],[A,eave,B],[-A,eave,B],[-A,peak,0]];
 const endFaces=[],edgeFaces=[];
 for(let i=0;i<outline.length;i++){
  const p=outline[i],q=outline[(i+1)%outline.length];
  const end=p[0]===q[0],u=end?Math.sign(p[0])*a:null;
  const start=end?[u,p[1],p[2]]:p,finish=end?[u,q[1],q[2]]:q;
  const triangles=quad(start,finish,[finish[0],wallTop,finish[2]],[start[0],wallTop,start[2]]);
  (end?endFaces:edgeFaces).push(...triangles);
 }
 surface(endFaces,cladding,roofName+' slate gables',{closure:true});
 edgeFaces.push(...quad([-A,wallTop,-B],[A,wallTop,-B],[A,wallTop,B],[-A,wallTop,B]));
 surface(edgeFaces,blue,roofName+' eaves and soffit',{closure:true});
 surface(roofTriangles.map(t=>t.map(([u,y,v])=>[u,y-.025,v]).reverse()),blue,roofName+' pitched soffit',{closure:true});
 function bar(u,y,v,w,h,d,material=trim){
  const p=point(u,y,v);detail(material,...p,w,h,d,axis==='x'?0:Math.PI/2);
 }
 function beam(p,q,width,depth,suffix,material=trim){
  const start=new THREE.Vector3(...point(...p)),end=new THREE.Vector3(...point(...q));
  const direction=end.clone().sub(start),geometry=new THREE.BoxGeometry(depth,direction.length(),width);
  geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize()));
  geometry.translate(...start.add(end).multiplyScalar(.5).toArray());
  const part=mesh(geometry,material,name+' '+suffix);part.userData.blueRoofLantern=name;
 }
 // Pale blue bargeboards surround the slate ends; narrow corner boards and
 // an overhanging sill give the glazing its photographed timber proportions.
 for(const side of [1,-1]){
  for(const v of [-B,B])beam([side*(A+.018),eave-.045,v],[side*(A+.018),peak-.045,0],.095,.075,'bargeboard');
  for(const v of [-b,b])bar(side*(a-.035),(wallTop+bottom(side*a,v))/2,v,.085,wallTop-bottom(side*a,v),.095);
  const v=side*b;
  const sill=windowBottom??Math.max(bottom(-a,v),bottom(a,v))+.17;
  const h=windowTop-sill,w=windowWidth,cy=(sill+windowTop)/2;
  bar(0,cy,v+side*.06,w,h,.045,glass);
  for(let i=0;i<=4;i++)bar(-w/2+i*w/4,cy,v+side*.09,i===0||i===4?.075:.052,h+.07,.075,frame);
  for(const y of [sill,sill+h*.7,windowTop])bar(0,y,v+side*.09,w+.08,.055,.075,frame);
  bar(0,sill-.065,v+side*.08,w+.22,.09,.23);
  bar(0,windowTop+.065,v+side*.065,w+.22,.09,.13);
  const p=point(0,cy,v+side*.06),r=axis==='x'?(side===1?0:Math.PI):side*Math.PI/2;
  opening({x:p[0],y:cy,z:p[2],r,w,h,label:name+' glazing'});
 }
 // Thin lead aprons follow the host roof on all four sides.
 const flashing=lead;
 for(const side of [-1,1]){
  beam([-a,bottom(-a,side*b)+.07,side*(b+.018)],[a,bottom(a,side*b)+.07,side*(b+.018)],.12,.035,'lead apron',flashing);
  for(const [v0,v1]of [[-b,0],[0,b]])beam([side*(a+.018),bottom(side*a,v0)+.07,v0],[side*(a+.018),bottom(side*a,v1)+.07,v1],.1,.035,'lead apron',flashing);
 }
 const ridge=mesh(new THREE.CylinderGeometry(.07,.07,A*2,8),lead,name+' ridge');
 ridge.geometry.rotateZ(Math.PI/2);if(axis==='z')ridge.geometry.rotateY(Math.PI/2);
 ridge.geometry.translate(...point(0,peak+.035,0));ridge.userData.blueRoofLantern=name;
 return walls;
}
