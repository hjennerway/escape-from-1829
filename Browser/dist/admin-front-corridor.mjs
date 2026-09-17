import {createCorridorRun,FARNDON_CORRIDOR} from './farndon-corridor.mjs';

// The marked front door continues the existing Farndon axis. The original
// north/south gallery and east/west connector keep their geometry and positions.
export const ADMIN_FRONT_CORRIDOR=Object.freeze({
 name:'Main/admin front corridor',x:FARNDON_CORRIDOR.x,frontZ:30.6,
 joinZ:FARNDON_CORRIDOR.startZ,width:FARNDON_CORRIDOR.width,
 height:FARNDON_CORRIDOR.height,rise:FARNDON_CORRIDOR.rise,
 roomBackZ:17.8,adminWallX:160.5
});

export function addAdminFrontCorridor(THREE,{corridor,brick,roof,material,worldUV}){
 const r=ADMIN_FRONT_CORRIDOR,half=r.width/2,eave=r.height+.06,top=eave+r.rise;
 const branch=createCorridorRun(THREE,{
  name:r.name,start:[r.x,r.frontZ],end:[r.x,r.joinZ],width:r.width,height:r.height,rise:r.rise,
  brick,roof,material,worldUV,
  // Only the short open sides between the low room and the fixed cross-gallery
  // have windows; the remaining sides are attached to existing rooms.
  detailRanges:[[r.frontZ-r.roomBackZ,r.frontZ-13]]
 });
 // The blue-line correction attaches the entire east side to Main/admin.
 // Keep the exposed west-side detailing; retire the now-internal east face.
 branch.remove(branch.getObjectByName('Corridor south windows'));
 branch.userData.openings=branch.userData.openings.filter(o=>o.side===-1);
 corridor.add(branch);
 const front=new THREE.Group();front.name='Main/admin corridor front doorway';
 front.position.set(r.x,0,r.frontZ);corridor.add(front);
 front.userData.door={x:r.x,z:r.frontZ,width:1.8,height:2.85};
 const masonry=brick.clone();masonry.color.set(0xc7a391);
 const stone=material(0xc8c6b7),paint=material(0xd5d8ce),dark=material(0x283334);
 const timber=material(0x3f504f),glass=material(0x536c72,{roughness:.52,metalness:.12});
 function mesh(g,m,name,parent=front){const o=new THREE.Mesh(g,m);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function box(m,x,y,z,w,h,d,name){const o=mesh(worldUV(new THREE.BoxGeometry(w,h,d),1.7),m,name);o.position.set(x,y,z);return o;}
 function surface(points,faces,m,name){
  const g=new THREE.BufferGeometry(),vertices=faces.flatMap(face=>face.map(i=>points[i]));
  g.setAttribute('position',new THREE.Float32BufferAttribute(vertices.flat(),3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(vertices.flatMap(([x,y,z])=>[x/2.8,(y+z)/2.8]),2));
  g.computeVertexNormals();return mesh(g,m,name);
 }
 const roofY=x=>top-r.rise*Math.abs(x)/(half+.22);
 // Close the front gable above the new door, with the ridge on the fixed axis.
 surface([[-half,r.height,0],[half,r.height,0],[half,roofY(half),0],[0,top,0],[-half,roofY(half),0]],
  [[0,1,3],[1,2,3],[0,3,4]],masonry,'Main/admin corridor front brick gable');
 box(dark,0,1.49,.026,2.02,2.98,.052,'Corridor door reveal');
 box(timber,0,1.46,.072,1.8,2.85,.06,'Corridor front timber door');
 for(const side of [-1,1]){
  box(paint,side*.97,1.49,.12,.13,2.98,.15,'Corridor door jamb');
  box(glass,side*.445,2.12,.111,.70,.94,.026,'Corridor door glazing');
  for(const y of [1.62,2.62])box(paint,side*.445,y,.14,.79,.065,.05,'Corridor door glazing rail');
  for(const x of [side*.445-.385,side*.445+.385])box(paint,x,2.12,.14,.055,1.04,.05,'Corridor door glazing stile');
  for(const y of [.49,1.12])box(timber,side*.445,y,.135,.65,.46,.07,'Corridor lower door panel');
  box(stone,side*.12,1.38,.18,.045,.23,.05,'Corridor door handle');
 }
 box(paint,0,1.47,.145,.065,2.86,.055,'Corridor double door meeting stile');
 box(stone,0,3.04,.10,2.28,.18,.22,'Corridor door lintel');
 box(stone,0,.065,.25,2.18,.13,.60,'Corridor door threshold');

 // Retain the original contact with the tall pavilion. This narrow attached
 // strip carries the same east roof slope down to its wall, avoiding a new gap.
 const sideWidth=r.adminWallX-(r.x+half),sideDepth=r.frontZ-r.joinZ;
 const sideX=half+sideWidth/2,sideHeight=roofY(half+sideWidth)-.03;
 box(masonry,sideX,sideHeight/2,-sideDepth/2,sideWidth,sideHeight,sideDepth,'Corridor pavilion side connection walls');
 surface([[half,roofY(half),0],[half+sideWidth,roofY(half+sideWidth),0],
  [half+sideWidth,roofY(half+sideWidth),-sideDepth],[half,roofY(half),-sideDepth]],
  [[0,1,2],[0,2,3]],roof,'Corridor pavilion side connection slate roof');
 surface([[half,sideHeight,0],[half+sideWidth,sideHeight,0],[half+sideWidth,roofY(half+sideWidth),0],[half,roofY(half),0]],
  [[0,1,2],[0,2,3]],masonry,'Corridor pavilion side connection front infill');
 surface([[half,sideHeight,-sideDepth],[half+sideWidth,sideHeight,-sideDepth],
  [half+sideWidth,roofY(half+sideWidth),-sideDepth],[half,roofY(half),-sideDepth]],
  [[0,2,1],[0,3,2]],masonry,'Corridor pavilion side connection rear infill');
 const footprint={minX:r.x-half,maxX:r.x+half,minZ:r.joinZ,maxZ:r.frontZ};
 branch.userData.footprint=footprint;
 const sideFootprint={minX:r.x+half,maxX:r.adminWallX,minZ:r.joinZ,maxZ:r.frontZ};
 corridor.userData.footprints.push(footprint,sideFootprint);
 for(const key of ['minX','minZ'])corridor.userData.footprint[key]=Math.min(corridor.userData.footprint[key],footprint[key],sideFootprint[key]);
 for(const key of ['maxX','maxZ'])corridor.userData.footprint[key]=Math.max(corridor.userData.footprint[key],footprint[key],sideFootprint[key]);
 return branch;
}
