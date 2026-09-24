import {addRoadsideLampPosts} from './street-lamps.mjs';
import {addAnnexePeriodOaks} from './annexe-period-oaks.mjs';
import {existsInYear,periodForYear,roadSection,historicSurfaceSection,DEFAULT_PERIOD} from './estate-periods.mjs';

export const ESTATE_TIMELINE_VERSION=6;

// Split triangles at the eastern ward boundary, interpolating every vertex
// attribute so masonry UVs, normals and the full-period silhouette survive.
export function clipTimelineGeometry(THREE,geometry,matrix,edge,sign,axis='x'){
 const names=Object.keys(geometry.attributes),source=geometry.attributes,index=geometry.index;
 const output=Object.fromEntries(names.map(name=>[name,[]])),point=new THREE.Vector3();
 function vertex(i){
  const values=Object.fromEntries(names.map(name=>[name,Array.from({length:source[name].itemSize},(_,j)=>source[name].getComponent(i,j))]));
  return {values,distance:(point.fromArray(values.position).applyMatrix4(matrix)[axis]-edge)*sign};
 }
 const count=index?.count??source.position.count;
 for(let i=0;i<count;i+=3){
  const triangle=[0,1,2].map(j=>vertex(index?index.getX(i+j):i+j)),polygon=[];
  for(let j=0;j<3;j++){
   const a=triangle[j],b=triangle[(j+1)%3];
   if(a.distance>=0)polygon.push(a.values);
   if((a.distance>=0)!==(b.distance>=0)){
    const t=a.distance/(a.distance-b.distance);
    polygon.push(Object.fromEntries(names.map(name=>[name,a.values[name].map((value,k)=>value+(b.values[name][k]-value)*t)])));
   }
  }
  for(let j=1;j<polygon.length-1;j++)for(const v of [polygon[0],polygon[j],polygon[j+1]])for(const name of names)output[name].push(...v[name]);
 }
 const clipped=new THREE.BufferGeometry();
 for(const name of names)clipped.setAttribute(name,new THREE.Float32BufferAttribute(output[name],source[name].itemSize));
 clipped.computeBoundingBox();clipped.computeBoundingSphere();return clipped;
}

// The user's red outline identifies the original central frontage and all
// three rear ranges. Split at existing wing joints, not at ward-photo labels.
// The front arms and circled east pavilions join in 1849. Only the farther
// Barmere side range and Redesmere/Saughall rear cross range wait until 1870.
// Both three-bay projections beside Reception belong to 1829. Carry the core
// forward over their walls, glazing, cornices and roof overhangs, stopping
// before the lower forward arms and outside the recessed corner returns.
const RECEPTION_FRONT={axis:'x',edge:-20,low:'1829 Wings',high:{axis:'x',edge:22,low:'1829',high:'1829 Wings'}};
const ORIGINAL_CORE={
 axis:'x',edge:-38,low:'1829 Wings',high:{
  axis:'x',edge:38,
  low:{axis:'z',edge:17.3,low:'1829',high:{
   axis:'z',edge:20.15,low:{
    axis:'x',edge:-32.5,low:'1829 Wings',high:{axis:'x',edge:32.5,low:'1829',high:'1829 Wings'}
   },high:RECEPTION_FRONT
  }},
  high:{axis:'x',edge:75,low:{axis:'z',edge:-29,low:'Redesmere',high:'1829 Wings'},high:'Redesmere'}
 }
};
function sectionsForBounds(bounds,node=ORIGINAL_CORE){
 if(typeof node==='string')return new Set([node]);
 if(bounds.max[node.axis]<=node.edge)return sectionsForBounds(bounds,node.low);
 if(bounds.min[node.axis]>=node.edge)return sectionsForBounds(bounds,node.high);
 return new Set([...sectionsForBounds(bounds,node.low),...sectionsForBounds(bounds,node.high)]);
}

// Removing the later wing exposes two uncapped cuts at the east front corner.
// Close them only at opening, following the retained slate roof and reusing
// the adjoining masonry materials. The later wing replaces this end wall.
function addOpeningEastWall(THREE,exterior,parent){
 const group=new THREE.Group();group.name='1829 east end wall';
 group.userData.estateSection='1829 east end wall';parent.add(group);
 const brick=exterior.model.getObjectByName('East inside corner brick facet 3').material;
 const white=exterior.model.getObjectByName('East wing continuous eaves').material;
 const roofs=[];
 exterior.model.traverse(object=>{if(object.name==='Entrance east recessed slate roof')roofs.push(object);});
 exterior.model.updateMatrixWorld(true);
 const ray=new THREE.Raycaster();
 const roofHeight=([x,z])=>{
  // Sample just inside the retained footprint, clear of the clipped edge.
  ray.set(new THREE.Vector3(Math.max(33.72,Math.min(x,37.99)),25,Math.min(z,17.29)),new THREE.Vector3(0,-1,0));
  return ray.intersectObjects(roofs,false)[0].point.y;
 };
 function panel(name,a,b,bottom,topA,topB,material){
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]),height=Math.max(topA,topB)-bottom;
  const geometry=new THREE.BoxGeometry(length,height,.3),p=geometry.attributes.position,uv=geometry.attributes.uv;
  for(let i=0;i<p.count;i++){
   if(p.getY(i)>0)p.setY(i,topA+(topB-topA)*(p.getX(i)/length+.5)-bottom-height/2);
   uv.setXY(i,p.getX(i)/1.7,(p.getY(i)+bottom+height/2)/1.7);
  }
  geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,material);mesh.name='1829 east end '+name;
  mesh.position.set((a[0]+b[0])/2,bottom+height/2,(a[1]+b[1])/2);
  mesh.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);
  mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.orientedCollision=true;group.add(mesh);
 }
 // Keep the thickness inside the original x=38 / z=17.3 footprint. The short
 // front return meets the existing canted stair wall at x=33.7.
 for(const [name,a,b] of [
  ['front',[33.7,17.15],[38,17.15]],
  ['side north',[37.85,7],[37.85,12]],
  ['side south',[37.85,12],[37.85,17.3]]
 ]){
  panel(name+' plinth',a,b,0,2,2,white);
  panel(name+' brick',a,b,2,12.8,12.8,brick);
  panel(name+' cornice',a,b,12.8,13.06,13.06,white);
  const outer=([x,z])=>name==='front'?[x,z+.15]:[x+.15,z];
  panel(name+' roof infill',a,b,13.06,roofHeight(outer(a)),roofHeight(outer(b)),brick);
 }
}

export function prepareEstateTimeline(THREE,exterior,layouts){
 if(exterior.model.userData.timelinePrepared)return attachEstateTimeline(exterior,layouts);
 addAnnexePeriodOaks(THREE,exterior.trees);
 const groupCache=new Map();
 function tag(object,section){if(object)object.userData.estateSection=section;}
 function grouped(parent,section){
  if(!groupCache.has(parent))groupCache.set(parent,new Map());
  const groups=groupCache.get(parent);
  if(!groups.has(section)){const group=new THREE.Group();group.name='Period · '+section;tag(group,section);parent.add(group);groups.set(section,group);}
  return groups.get(section);
 }
 const named={chapel:'Church',churchGrounds:'Church',uptonFrithOscroft:'Upton Lea',churtonWard:'Kelsall',willows:'The Willows',outhouse:'1829',waterTower:'Water tower',annexe:'Annexe',mast:'Modern site context',
  mainAdmin:'The Main',adminCorridor:'The Main',estateChimney:'The Main',irbyAshley:'The Main',graftonEdge:'The Main',haleWard:'The Main',bowlingGreen:'The Main',estatesDepartment:'The Main',farndonWard:'The Main',witbyWard:'The Main',laundry:'The Main',garagesMortuary:'The Main',greenhouses:'The Main',towerBuildings:'The Main'};
 for(const [key,section] of Object.entries(named))tag(exterior[key],section);
 // The owner's circled passage head belongs wholly to the 1870 addition,
 // including the half on the 1849 pavilion side of the spatial boundary.
 tag(exterior.model.getObjectByName('1829 Redesmere passage head'),'Redesmere');
 // These links serve the forward wings. Keep each whole branch absent until
 // its destination exists, including the part inside the original core.
 for(const side of ['West','East']){
  const branch=exterior.model.getObjectByName(side+' sweeping forecourt branch');
  if(branch)grouped(branch.parent,'1829 Wings').add(branch);
 }
 tag(layouts.carPark,'Modern site context');tag(layouts.countessRoundabout,'Modern site context');tag(layouts.carParkTrees,'Earlier planting');
 // The road inventory keeps exact saved geometry. Caldecott is supplied by
 // the Phase 1 description; all other road dates have explicit Ward dates rows.
 for(const road of layouts.roads.children){const section=roadSection(road.name);if(!section)throw new Error('Unmapped road: '+road.name);tag(road,section);}
 tag(layouts.roads.getObjectByName('Vivienne Smith Lane eastern continuation'),'Modern site context');
 tag(layouts.roads.getObjectByName('Parsons Lane northern modern endpoint'),'Modern site context');
 // Grounds follow their associated estate section. Individual ribbons and
 // ground meshes get separate parents before material batching takes place.
 for(const object of [...layouts.historicRoads.children]){
  const section=historicSurfaceSection(object.name);
  grouped(layouts.historicRoads,section).add(object);
 }
 const excluded=new Set([exterior.trees,exterior.terrain,exterior.legacyAccess,...Object.keys(named).map(key=>exterior[key]),layouts.roads,layouts.entrance,layouts.countessRoundabout]);
 const box=new THREE.Box3(),matrix=new THREE.Matrix4(),instance=new THREE.Matrix4();
 exterior.model.updateMatrixWorld(true);
 function sectionForBounds(bounds,name){
  const c=bounds.getCenter(new THREE.Vector3());
  if(c.x>=-74&&c.x<=-59&&c.z>=-94&&c.z<=-84)return 'Modern site context'; // mast base and equipment
  // Paving, gravel, raised lawns and low edging follow the wing boundaries.
  // Removing the entire ground patch exposes the terrain before construction;
  // retaining even a grass slab leaves its raised outline on the empty site.
  // Architectural names also contain "lawn", "stepped" and "cap step".
  if(/boundary|extended reception approach/i.test(name))return 'Site context';
  if(c.x< -82||c.x>110||c.z< -58||c.z>49)return 'Site context';
  const sections=sectionsForBounds(bounds);
  return sections.size===1?[...sections][0]:'split';
 }
 function partition(object){
  if(excluded.has(object)||object.userData.estateSection)return;
  if(!object.isMesh){for(const child of [...object.children])partition(child);return;}
  const parent=object.parent,geometry=object.geometry;
  if(!geometry.boundingBox)geometry.computeBoundingBox();
  function addMesh(mesh,transform,section){
   if(section!=='split'){grouped(parent,section).add(mesh);return;}
   function split(partGeometry,node=ORIGINAL_CORE){
    if(!partGeometry.attributes.position.count)return;
    if(!partGeometry.boundingBox)partGeometry.computeBoundingBox();
    const bounds=partGeometry.boundingBox.clone().applyMatrix4(transform),sections=sectionsForBounds(bounds,node);
    if(sections.size===1){
     const part=mesh.clone(false);part.geometry=partGeometry;
     // Refined corner meshes have custom collision polygons. Restrict their
     // footprints to the clipped part so an absent wing leaves no obstacle.
     if(part.userData.collisionFootprints||part.userData.collisionFootprint){
      const b=partGeometry.boundingBox;
      const clip=(points,axis,edge,sign)=>{const result=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],da=(a[axis]-edge)*sign,db=(b[axis]-edge)*sign;if(da>=0)result.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);result.push(a.map((v,j)=>v+(b[j]-v)*t));}}return result;};
      const footprints=part.userData.collisionFootprints??[part.userData.collisionFootprint];
      part.userData.collisionFootprints=footprints.map(points=>[[0,b.min.x,1],[0,b.max.x,-1],[1,b.min.z,1],[1,b.max.z,-1]].reduce((polygon,[axis,edge,sign])=>clip(polygon,axis,edge,sign),points)).filter(points=>points.length>=3);
      delete part.userData.collisionFootprint;
     }
     grouped(parent,[...sections][0]).add(part);return;
    }
    if(bounds.max[node.axis]<=node.edge){split(partGeometry,node.low);return;}
    if(bounds.min[node.axis]>=node.edge){split(partGeometry,node.high);return;}
    for(const [sign,child] of [[-1,node.low],[1,node.high]])split(clipTimelineGeometry(THREE,partGeometry,transform,node.edge,sign,node.axis),child);
   }
   split(geometry);
  }
  if(object.isInstancedMesh){
   const sets=new Map();
   for(let i=0;i<object.count;i++){
    object.getMatrixAt(i,instance);matrix.multiplyMatrices(object.matrixWorld,instance);box.copy(geometry.boundingBox).applyMatrix4(matrix);
    const section=sectionForBounds(box,object.name);
    if(section==='split'){
     const mesh=new THREE.Mesh(geometry,object.material);mesh.name=object.name;mesh.castShadow=object.castShadow;mesh.receiveShadow=object.receiveShadow;
     object.updateMatrix();mesh.applyMatrix4(new THREE.Matrix4().multiplyMatrices(object.matrix,instance));addMesh(mesh,matrix,section);
    }else{if(!sets.has(section))sets.set(section,[]);sets.get(section).push(i);}
   }
   for(const [section,indices] of sets){
    const part=new THREE.InstancedMesh(geometry,object.material,indices.length);part.name=object.name;part.position.copy(object.position);part.quaternion.copy(object.quaternion);part.scale.copy(object.scale);part.castShadow=object.castShadow;part.receiveShadow=object.receiveShadow;
    indices.forEach((id,i)=>{object.getMatrixAt(id,instance);part.setMatrixAt(i,instance);if(object.instanceColor){const color=new THREE.Color();object.getColorAt(id,color);part.setColorAt(i,color);}});
    grouped(parent,section).add(part);
   }
   object.removeFromParent();
  }else{
   box.copy(geometry.boundingBox).applyMatrix4(object.matrixWorld);const section=sectionForBounds(box,object.name);
   addMesh(object,object.matrixWorld,section);if(section==='split')object.removeFromParent();
  }
 }
 for(const object of [...layouts.shared.children])partition(object);
 addOpeningEastWall(THREE,exterior,layouts.shared);
 addRoadsideLampPosts(THREE,exterior,layouts);
 exterior.model.userData.timelinePrepared=ESTATE_TIMELINE_VERSION;
 return attachEstateTimeline(exterior,layouts);
}

export function attachEstateTimeline(exterior,layouts){
 const rules=[];exterior.model.traverse(object=>{if(object.userData.estateSection)rules.push(object);});
 let period=periodForYear(DEFAULT_PERIOD),active=false;
 const timeline={rules,get period(){return period;},get active(){return active;},
  setPeriod(year){
   period=periodForYear(year);active=true;
   // These parents are retained for binary/source compatibility. The dated
   // children now own visibility, so surviving buildings render only once.
   for(const group of [layouts.shared,layouts.historic,layouts.modern])group.visible=true;
   for(const object of layouts.superseded)object.visible=false;
   layouts.entrance.visible=true;
   for(const object of rules)object.visible=existsInYear(object.userData.estateSection,period.year);
   exterior.invalidateShadows();return period;
  }
 };
 exterior.timeline=timeline;return timeline;
}

