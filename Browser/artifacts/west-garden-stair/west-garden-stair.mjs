import {addExteriorStairRail} from './exterior-stair-rail.mjs';
import {WEST_RANGE_PLAN} from './west-range-plan.mjs';

// Ground-level photograph, 5 October 2026: both doors face the garden from
// the recessed elevation. Every approach uses the same width as the flights.
export const WEST_GARDEN_STAIR=Object.freeze({
  width:1.2,doorX:-63,doorZ:WEST_RANGE_PLAN.gardenZ+.07,
  walkwayX:-63,upperX:-61.65,lowerX:-60.3,
  groundZ:WEST_RANGE_PLAN.bayRootZ-.2,upperZ:WEST_RANGE_PLAN.bayRootZ+1.1,
  turnZ:WEST_RANGE_PLAN.bayRootZ+4.4,turnEndZ:WEST_RANGE_PLAN.bayRootZ+5.6,
  middleY:4.25,upperY:8.5
});

export function addWestGardenStair(THREE,{model,iron,door}){
  const s=WEST_GARDEN_STAIR,w=s.width,half=w/2;
  for(const y of [s.middleY,s.upperY])door(s.doorX,s.doorZ,0,y);
  const stair=new THREE.Group();stair.name='West front iron return stair';model.add(stair);
  function plate(name,x0,x1,z0,z1,y){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,.14,z1-z0),iron);
    mesh.name=name;mesh.position.set((x0+x1)/2,y,(z0+z1)/2);
    mesh.castShadow=mesh.receiveShadow=true;stair.add(mesh);return mesh;
  }
  function guard(x0,z0,x1,z1,y){
    return addExteriorStairRail(THREE,stair,iron,[x0,y+.07,z0],[x1,y+.07,z1]);
  }
  function strut(a,b,r=.065){
    const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),delta=q.clone().sub(p);
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),5),iron);
    mesh.position.copy(p.clone().add(q).multiplyScalar(.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
    mesh.name='West garden stair support';mesh.castShadow=mesh.receiveShadow=true;stair.add(mesh);
  }
  function flight(x,z0,y0,z1,y1){
    for(let i=0;i<18;i++){
      const t=(i+.5)/18,mesh=new THREE.Mesh(new THREE.BoxGeometry(w,.075,Math.abs(z1-z0)/18+.04),iron);
      mesh.name='West garden iron stair tread';mesh.position.set(x,y0+(y1-y0)*t,z0+(z1-z0)*t);
      mesh.castShadow=mesh.receiveShadow=true;stair.add(mesh);
    }
    for(const side of [-1,1]){
      addExteriorStairRail(THREE,stair,iron,[x+side*(half+.02),y0+.07,z0],[x+side*(half+.02),y1+.07,z1]);
      strut([x+side*.56,y0-.1,z0],[x+side*.56,y1-.1,z1]);
    }
  }
  const left=s.walkwayX-half,walkRight=s.walkwayX+half,upperLeft=s.upperX-half,upperRight=s.upperX+half,lowerRight=s.lowerX+half;
  plate('West garden middle door walkway',left,walkRight,s.doorZ,s.turnZ,s.middleY);
  plate('West garden middle turning landing',left,lowerRight,s.turnZ,s.turnEndZ,s.middleY);
  // A constant-width L joins the upper flight to the same doorway column.
  // Its inside corner stays clear of the rising flight, rather than covering it.
  const upperCrossZ=s.upperZ-half;
  plate('West garden upper door walkway',left,walkRight,s.doorZ,upperCrossZ,s.upperY);
  plate('West garden upper cross landing',walkRight,upperRight,upperCrossZ-w,upperCrossZ,s.upperY);
  plate('West garden upper flight landing',upperLeft,upperRight,upperCrossZ,s.upperZ,s.upperY);
  flight(s.upperX,s.upperZ,s.upperY,s.turnZ,s.middleY);
  flight(s.lowerX,s.turnZ,s.middleY,s.groundZ,.3);
  for(const [x,z,y] of [[upperRight,s.upperZ,s.upperY],[left,upperCrossZ,s.upperY],[lowerRight,s.turnEndZ,s.middleY]])
    strut([x,.2,z],[x,y,z],.07);
  for(const [x0,z0,x1,z1] of [
    [left,s.doorZ,left,s.turnEndZ],[left,s.turnEndZ,lowerRight,s.turnEndZ],
    [lowerRight,s.turnEndZ,lowerRight,s.turnZ],
    [walkRight,s.doorZ,walkRight,s.turnZ],[walkRight,s.turnZ,upperLeft,s.turnZ],
    [upperRight,s.turnZ,s.lowerX-half,s.turnZ]
  ])guard(x0,z0,x1,z1,s.middleY);
  for(const [x0,z0,x1,z1] of [
    [left,s.doorZ,left,upperCrossZ],[left,upperCrossZ,upperLeft,upperCrossZ],
    [upperLeft,upperCrossZ,upperLeft,s.upperZ],
    [upperRight,s.upperZ,upperRight,upperCrossZ-w],
    [upperRight,upperCrossZ-w,walkRight,upperCrossZ-w],
    [walkRight,upperCrossZ-w,walkRight,s.doorZ]
  ])guard(x0,z0,x1,z1,s.upperY);
  return stair;
}
