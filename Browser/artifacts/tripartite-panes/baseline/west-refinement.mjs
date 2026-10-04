import {addFacadeCourse} from './facade-courses.mjs';
import {WEST_RANGE_PLAN} from './west-range-plan.mjs';
// September 2026 west/locations.png: red/yellow/blue/purple/pink = img1..5.
// Camera registration and dimensions are visual estimates, not a survey.
export const WEST_REFINEMENT_VIEWS=Object.freeze({
  'west-1':{position:[-66,1.8,36],target:[-42,5.2,31],fov:61},
  'west-2':{position:[-56,1.8,41],target:[-53,7.6,18],fov:75},
  'west-3':{position:[-99,1.8,28],target:[-72,7.7,14.3],fov:52},
  'west-4':{position:[-57,1.8,-24],target:[-55,7,5],fov:68},
  'west-5':{position:[-46,1.8,-25],target:[-54,7,5],fov:70},
  'west-refinement':{position:[-110,65,-29],target:[-50,5,15],fov:49}
});
// Owner's marked outer end: equal 35% flanks and a centred 30% door face,
// measured along the retained z=5..20.5 masonry rather than in perspective.
export const WEST_END_PROPORTIONS=Object.freeze({
  doorZ:(WEST_RANGE_PLAN.outerRearZ+WEST_RANGE_PLAN.outerFrontZ)/2,
  pierWidth:(WEST_RANGE_PLAN.outerFrontZ-WEST_RANGE_PLAN.outerRearZ)*.30
});

// Three exposed facets, with one broad flat window face and two canted returns.
// Building the wall, bands and roof from the same outline avoids the pointed
// central arris of the former octagonal cylinder.
export function addWestCantedBay(THREE,{model,mesh,worldUV,brick,white,roof,sash},
  {x,z,side,name,face,height=14.6,width=6.2,depth=2.8,frontWidth=width*.5,returnDepth=depth*.28,windowWidth=1.25,baseHeight=0,
    includeRoof=true,roofRise=.98,bandHeights=[4.05,8.6,height-.08,height+.15],
    windowRows=[2,6.45,11.35].map(y=>({y,width:windowWidth,sideWidth:.72,height:2.5}))}){
  const half=width/2,flat=frontWidth/2;
  const outline=[[-half,0],[-half,returnDepth],[-flat,depth],[flat,depth],[half,returnDepth],[half,0]];
  function prism(top,bottom,expand=0){
    const vertices=[],uv=[];
    const points=outline.map(([u,v])=>[u+Math.sign(u)*expand,side*(v+expand)]);
    function tri(a,b,c){for(const p of [a,b,c]){vertices.push(...p);uv.push(p[0]/1.7,p[1]/1.7);}}
    for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length];
      const q=[[a[0],bottom,a[1]],[b[0],bottom,b[1]],[b[0],top,b[1]],[a[0],top,a[1]]];
      if(side>0){tri(q[0],q[1],q[2]);tri(q[0],q[2],q[3]);}
      else {tri(q[2],q[1],q[0]);tri(q[3],q[2],q[0]);}
      const cap=[[0,top,side*depth*.35],q[3],q[2]];
      if(side>0)tri(...cap);else tri(...cap.reverse());
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
  }
  const wall=mesh(worldUV(prism(height,baseHeight),1.7),brick,x,0,z,true);wall.name=name;
  wall.userData.collisionFootprint=outline.map(([u,v])=>[u,side*v]);
  if(baseHeight>0){
    const base=mesh(prism(baseHeight,0),white,x,0,z,true);base.name=name+' white base';
    base.userData.collisionFootprint=wall.userData.collisionFootprint;
  }
  for(const y of bandHeights)mesh(prism(y+.1,y-.1,.1),white,x,0,z).name=name+' stone band';
  if(includeRoof){
    const positions=[],uv=[];
    for(let i=0;i<outline.length;i++){
      const a=outline[i],b=outline[(i+1)%outline.length];
      const triangle=[[a[0]*1.07,height+.3,side*(a[1]+.16)],[b[0]*1.07,height+.3,side*(b[1]+.16)],[0,height+.3+roofRise,side*.45]];
      if(side<0)triangle.reverse();
      for(const p of triangle){positions.push(...p);uv.push(p[0]/3,p[2]/3);}
    }
    const cap=new THREE.BufferGeometry();cap.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    cap.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));cap.computeVertexNormals();
    mesh(cap,roof,x,0,z,true).name=name+' slate roof';
  }
  for(let i=1;i<=3;i++){
    const a=outline[i],b=outline[i+1],dx=b[0]-a[0],dz=side*(b[1]-a[1]);
    const length=Math.hypot(dx,dz),nx=-dz/length*side,nz=dx/length*side;
    const rotation=Math.atan2(nx,nz);
    for(const row of windowRows)sash(face,x+(a[0]+b[0])/2+nx*.065,row.y,z+side*(a[1]+b[1])/2+nz*.065,rotation,i===2?row.width:row.sideWidth,row.height);
  }
  return wall;
}

// img3: broad outer end with sparse openings and a shallow central projection.
export function addWestEndDetails(THREE,{model,box,mesh,worldUV,brick,white,material,sash,door,iron,hipRoof},{front=WEST_RANGE_PLAN.outerFrontZ,back=WEST_RANGE_PLAN.outerRearZ}={}){
  const start=model.userData.eastPhotoOpenings.length,trim=material(0xd8ddd5);
  const depth=front-back,centreZ=(front+back)/2,{doorZ,pierWidth}=WEST_END_PROPORTIONS;
  mesh(worldUV(new THREE.BoxGeometry(.22,15.2,depth),1.7),brick,-72.05,7.6,centreZ,true).name='West end continuous wall';
  mesh(worldUV(new THREE.BoxGeometry(.34,15.35,pierWidth),1.7),brick,-72.24,7.675,doorZ,true).name='West end shallow centre';
  box(white,-72.2,2,centreZ,.17,4,depth);
  box(white,-72.45,2,doorZ,.17,4,pierWidth);
  // Keep both narrow sashes in the shortened flat wall before the centre pier.
  const narrowSpan=doorZ-pierWidth/2-back;
  for(const fraction of [.29,.70])sash('west-end-upper-narrow',-72.23,12,back+narrowSpan*fraction,-Math.PI/2,.68,2.1);
  for(const dz of [-.8,.8])sash('west-end-upper-pair',-72.47,12.05,doorZ+dz,-Math.PI/2,1.35,2.25);
  for(const [dz,w] of [[-1.45,.70],[0,1.85],[1.45,.70]])sash('west-end-middle',-72.47,6.65,doorZ+dz,-Math.PI/2,w,2.7);
  for(const y of [5.15,8.14,10.78,13.34])box(trim,-72.59,y,doorZ,.25,.2,4.35);
  door(-72.48,doorZ,-Math.PI/2);
  for(const dz of [-1.43,1.43])sash('west-end-door-sidelight',-72.49,1.9,doorZ+dz,-Math.PI/2,.56,2.9);
  sash('west-end-door-transom',-72.5,3.36,doorZ,-Math.PI/2,1.42,.49);
  box(trim,-72.61,3.85,doorZ,.3,.23,4.45);
  for(const y of [4.08,8.8]){
    box(trim,-72.25,y,centreZ,.24,.22,depth);
    box(trim,-72.51,y,doorZ,.27,.22,pierWidth+.08);
  }
  const pierLeft=doorZ-pierWidth/2,pierRight=doorZ+pierWidth/2;
  for(const [index,[z,d,h]] of [[(back+pierLeft)/2,pierLeft-back,15.2],[doorZ,pierWidth,15.37],[(pierRight+front)/2,front-pierRight,15.2]].entries()){
    if(index===0){
      for(const [dy,t,w] of [[-.18,.16,.23],[.04,.22,.4],[.22,.1,.55]])
        addFacadeCourse(THREE,{mesh,worldUV},'West outer corner joined cornice '+dy,white,
          [[-72.3,pierLeft+.115],[-72.3,back-.15],[-65.925,back-.15]],h+dy,t,w);
    }else for(const [dy,w,t] of [[-.22,.24,.15],[0,.44,.24],[.2,.6,.1]])box(trim,-72.3,h+dy,z,w,t,d+.13);
    box(iron,-72.52,h+.3,z,.12,.09,d+.2);
  }
  box(iron,-72.54,7.55,pierLeft-.12,.07,15.1,.07);
  // A single low hip covers the full end rather than a detached tall front nib.
  hipRoof(-69,(back+WEST_RANGE_PLAN.gardenZ)/2,6,WEST_RANGE_PLAN.gardenZ-back,15.47,1.15).name='West end continuous slate roof';
  const gravel=material(0xa39e88);
  // Continue the doorway axis west to Parsons Lane. The far end tucks
  // beneath its higher road surface, leaving a clean join at the angled edge.
  mesh(new THREE.BoxGeometry(25.3,.1,2.65),gravel,-84.85,.2,doorZ).name='West end entrance path';
  model.userData.westEndPhotoOpenings=model.userData.eastPhotoOpenings.slice(start);
}
