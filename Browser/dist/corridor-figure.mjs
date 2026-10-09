// A clothed human outline without facial or surface detail. Shaped jacket,
// trousers, shoes and jointed limbs keep a passing profile from reading as rods.
export function createCorridorFigure(THREE){
 const model=new THREE.Group(),pelvis=new THREE.Group(),upper=new THREE.Group();
 model.name='Distant corridor silhouette';model.add(pelvis);pelvis.add(upper);
 const material=new THREE.MeshBasicMaterial({color:0x020303}),geometries=[];
 const oval=new THREE.SphereGeometry(1,10,8);geometries.push(oval);
 function mesh(geometry,parent,position=[0,0,0],scale=[1,1,1]){
  const part=new THREE.Mesh(geometry,material);part.position.set(...position);part.scale.set(...scale);parent.add(part);return part;
 }
 function joint(parent,position,name){const g=new THREE.Group();g.name=name;g.position.set(...position);parent.add(g);return g;}
 function profile(rings){
  const positions=[],indices=[],n=10;
  for(const [y,width,depth,z=0] of rings)for(let i=0;i<n;i++){const a=i/n*Math.PI*2;positions.push(Math.cos(a)*width,y,Math.sin(a)*depth+z);}
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n;indices.push(a,a+n,b,b,a+n,b+n);}
  for(let i=1;i<n-1;i++){indices.push(0,i,i+1);const top=(rings.length-1)*n;indices.push(top,top+i+1,top+i);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();geometries.push(g);return g;
 }
 mesh(oval,pelvis,[0,0,0],[.22,.17,.16]);
 mesh(profile([[-.16,.245,.175,-.025],[.04,.225,.16],[.23,.24,.17],[.43,.27,.18],[.52,.255,.155],[.61,.105,.095]]),upper);
 mesh(oval,upper,[0,.64,0],[.075,.11,.08]);
 mesh(profile([[-.16,.07,.075,.025],[-.12,.105,.10,.018],[-.03,.14,.125],[.075,.14,.125,-.01],[.15,.115,.105,-.015],[.19,.045,.05,-.015]]),upper,[0,.80,.015]);
 const thighGeometry=profile([[-.43,.09,.09],[-.30,.11,.10],[-.10,.135,.125],[0,.13,.12]]);
 const shinGeometry=profile([[-.41,.065,.065],[-.29,.085,.085],[-.10,.10,.095],[0,.09,.09]]);
 const sleeveGeometry=profile([[-.30,.085,.085],[-.16,.11,.105],[0,.12,.12]]);
 const forearmGeometry=profile([[-.27,.06,.065],[-.08,.085,.08],[0,.085,.085]]);
 const legs=[],arms=[];
 for(const side of [-1,1]){
  const hip=joint(pelvis,[side*.125,0,0],'Hip'),knee=joint(hip,[0,-.43,0],'Knee'),ankle=joint(knee,[0,-.41,0],'Ankle');
  mesh(thighGeometry,hip);mesh(oval,knee,[0,0,0],[.092,.10,.09]);mesh(shinGeometry,knee);
  mesh(oval,ankle,[0,-.025,.09],[.09,.065,.18]);legs.push({hip,knee,ankle});
  const shoulder=joint(upper,[side*.245,.47,0],'Shoulder'),elbow=joint(shoulder,[0,-.30,0],'Elbow');
  mesh(oval,shoulder,[0,-.01,0],[.125,.14,.125]);mesh(sleeveGeometry,shoulder);mesh(forearmGeometry,elbow);
  mesh(oval,elbow,[0,-.30,0],[.065,.085,.065]);arms.push({shoulder,elbow});
 }
 function pose(time){
  const phase=time*12.5,height=.84+Math.cos(phase*2)*.015;pelvis.position.y=height;
  upper.rotation.x=.20;upper.rotation.y=Math.sin(phase)*.07;
  for(let i=0;i<2;i++){
   const p=(phase/(Math.PI*2)+i*.5)%1,stance=.4,swing=Math.max(0,(p-stance)/(1-stance));
   const footZ=p<stance?.33*(1-2*p/stance):-.33*Math.cos(Math.PI*swing);
   const footY=.09+Math.sin(Math.PI*swing)**2*.27,down=height-footY;
   const bend=Math.acos(Math.max(-1,Math.min(1,(down*down+footZ*footZ-.43**2-.41**2)/(2*.43*.41))));
   const hip=Math.atan2(-footZ,down)-Math.atan2(.41*Math.sin(bend),.43+.41*Math.cos(bend));
   legs[i].hip.rotation.x=hip;legs[i].knee.rotation.x=bend;legs[i].ankle.rotation.x=-hip-bend;
   arms[i].shoulder.rotation.x=footZ*1.7;arms[i].elbow.rotation.x=-1.12+Math.sin(phase+i*Math.PI)*.12;
  }
 }
 pose(0);
 return {model,pose,dispose(){model.removeFromParent();geometries.forEach(g=>g.dispose());material.dispose();}};
}
