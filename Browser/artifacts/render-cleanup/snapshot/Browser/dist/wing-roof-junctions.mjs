// img2.png's blue line continues the connecting roof level along both rear
// arms. Their walls, eaves and ridges stay level; window positions are retained.
export const WING_ROOF_JOIN=Object.freeze({start:-6,level:2,wallEnd:7.2,ridgeZ:12,wall:12.8,eaves:13.06,rise:2.6});

export function wingWallHeight(){
  return WING_ROOF_JOIN.wall;
}

export function wingWallGeometry(THREE,base=0){
  // Retain the builders' original centre datum and lower only the wall top.
  const geometry=new THREE.BoxGeometry(12,14.3-base,30,1,1,30);
  const positions=geometry.attributes.position,centre=(14.3+base)/2;
  for(let i=0;i<positions.count;i++)if(positions.getY(i)>0)
    positions.setY(i,wingWallHeight(positions.getZ(i)-10)-centre);
  geometry.computeVertexNormals();
  return geometry;
}

export function addWingRoofJunction(THREE,{mesh,worldUV,box,brick,white,roof},side){
  const p=WING_ROOF_JOIN,x=side*31,label=side<0?'West':'East';
  // Both rear ends carry the main roof over the stair section. The lower
  // single-pitch annex is the only separate roof level behind it.
  const rear=-30.9,half=6.9;
  const stations=[
    [rear,half,p.eaves,p.eaves],
    [rear+half*.83,half,p.eaves,p.eaves+p.rise],
    [p.start,half,p.eaves,p.eaves+p.rise],
    [p.level,6.4,p.eaves,p.eaves+p.rise],
    [p.ridgeZ,6.4,p.eaves,p.eaves+p.rise]
  ];
  const positions=[],uv=[];
  function triangle(a,b,c){for(const v of [a,b,c]){positions.push(...v);uv.push(v[0]/3,(v[2]+v[1])/3);}}
  for(let i=1;i<stations.length;i++){
    const [z0,w0,e0,r0]=stations[i-1],[z1,w1,e1,r1]=stations[i];
    const left0=[-w0,e0,z0],left1=[-w1,e1,z1],right0=[w0,e0,z0],right1=[w1,e1,z1],ridge0=[0,r0,z0],ridge1=[0,r1,z1];
    triangle(left0,left1,ridge1);triangle(left0,ridge1,ridge0);
    // Use the same diagonal on both pitches. Joining ridge0 to right1 at
    // the rear hip leaves a flat triangle coplanar with the pale cornice.
    triangle(ridge0,ridge1,right0);triangle(right0,ridge1,right1);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
  mesh(geometry,roof,x,0,0,true).name=label+' wing joined slate roof';

  // Fill the former two-unit separation with real walls and foundations.
  const depth=p.wallEnd-5,z=(p.wallEnd+5)/2,base=side<0?0:4;
  mesh(worldUV(new THREE.BoxGeometry(12,12.8-base,depth),1.7),brick,x,(12.8+base)/2,z,true).name=label+' wing connecting walls';
  if(base)box(white,x,base/2,z,12,base,depth);
  // Close the entire overhang, including its widening rear sides and hip.
  // Narrow strips left open sky between the wall top and the single-sided
  // slate when viewed from below. This solid soffit meets both surfaces;
  // its hidden front end lies inside the connected cross-range roof.
  const outline=[[-half,rear],[half,rear],[half,p.start],[6.4,p.level],[6.4,p.ridgeZ],[-6.4,p.ridgeZ],[-6.4,p.level],[-half,p.start]];
  const shape=new THREE.Shape();outline.forEach(([u,v],i)=>i?shape.lineTo(u,-v):shape.moveTo(u,-v));shape.closePath();
  const soffit=new THREE.ExtrudeGeometry(shape,{depth:p.eaves-p.wall+.02,bevelEnabled:false,steps:1});
  soffit.rotateX(-Math.PI/2);
  mesh(soffit,white,x,p.wall-.02,0,true).name=label+' wing continuous eaves';
}
