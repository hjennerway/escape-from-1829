// The rear arms meet the main range at its eaves and ridge. The taller rear
// roofs ease down before the junction, leaving no detached front hip or wall.
export const WING_ROOF_JOIN=Object.freeze({start:-6,level:2,wallEnd:7.2,ridgeZ:12,eaves:13.06,rise:2.6});

export function wingWallHeight(z){
  const t=Math.max(0,Math.min(1,(z-WING_ROOF_JOIN.start)/(WING_ROOF_JOIN.level-WING_ROOF_JOIN.start)));
  return 14.3+(12.8-14.3)*t;
}

export function wingWallGeometry(THREE,base=0){
  const geometry=new THREE.BoxGeometry(12,14.3-base,30,1,1,30);
  const positions=geometry.attributes.position,centre=(14.3+base)/2;
  for(let i=0;i<positions.count;i++)if(positions.getY(i)>0)
    positions.setY(i,wingWallHeight(positions.getZ(i)-10)-centre);
  geometry.computeVertexNormals();
  return geometry;
}

export function addWingRoofJunction(THREE,{mesh,worldUV,box,brick,white,roof},side){
  const p=WING_ROOF_JOIN,x=side*31,label=side<0?'West':'East';
  const rear=side<0?-30.9:-25.4,half=side<0?6.9:6.4;
  const stations=[
    [rear,half,14.53,14.53],
    [rear+half*.83,half,14.53,18.13],
    [p.start,half,14.53,18.13],
    [p.level,6.4,p.eaves,p.eaves+p.rise],
    [p.ridgeZ,6.4,p.eaves,p.eaves+p.rise]
  ];
  const positions=[],uv=[];
  function triangle(a,b,c){for(const v of [a,b,c]){positions.push(...v);uv.push(v[0]/3,(v[2]+v[1])/3);}}
  for(let i=1;i<stations.length;i++){
    const [z0,w0,e0,r0]=stations[i-1],[z1,w1,e1,r1]=stations[i];
    const left0=[-w0,e0,z0],left1=[-w1,e1,z1],right0=[w0,e0,z0],right1=[w1,e1,z1],ridge0=[0,r0,z0],ridge1=[0,r1,z1];
    triangle(left0,left1,ridge1);triangle(left0,ridge1,ridge0);
    triangle(ridge0,ridge1,right1);triangle(ridge0,right1,right0);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.computeVertexNormals();
  mesh(geometry,roof,x,0,0,true).name=label+' wing joined slate roof';

  // Fill the former two-unit separation with real walls and foundations.
  const depth=p.wallEnd-5,z=(p.wallEnd+5)/2,base=side<0?0:4;
  mesh(worldUV(new THREE.BoxGeometry(12,12.8-base,depth),1.7),brick,x,(12.8+base)/2,z,true).name=label+' wing connecting walls';
  if(base)box(white,x,base/2,z,12,base,depth);
  // Follow the falling wall tops with narrow side cornices; no transverse
  // slab or end fascia cuts across the connected roof.
  for(const edge of [-1,1])for(const [a,b] of [[-25,p.start],[p.start,p.level],[p.level,p.wallEnd]]){
    const ya=wingWallHeight(a)+.11,yb=wingWallHeight(b)+.11;
    const strip=mesh(new THREE.BoxGeometry(.25,.2,Math.hypot(b-a,yb-ya)),white,x+edge*6.08,(ya+yb)/2,(a+b)/2);
    strip.rotation.x=-Math.atan2(yb-ya,b-a);
    strip.name=label+' wing continuous eaves';
  }
}
