import {IRBY_ASHLEY,createIrbyAshley} from './irby-ashley.mjs';
import {GRAFTON_REAR_ELEVATION,GRAFTON_REAR_FOOTPRINT} from './grafton-veranda.mjs';

// The marked bay is the OS range beside Upton/Frith/Oscroft. Its upper
// (yellow) and lower (orange) edges are z=-188.01 and z=-141.74.
// Rotate anticlockwise in plan, then fit the ground axes; retain full height.
export const GRAFTON_EDGE_BOUNDS=Object.freeze({minX:49.90,maxX:81.42,minZ:-188.01,maxZ:-141.74});
const bounds=GRAFTON_EDGE_BOUNDS;
const source=Object.freeze({minX:204.2,maxX:263.2,minZ:-142,maxZ:-98.6});
export const GRAFTON_EDGE_SCALE=Object.freeze({
 x:(bounds.maxZ-bounds.minZ)/(source.maxX-source.minX),
 z:(bounds.maxX-bounds.minX)/(source.maxZ-source.minZ)
});
export function graftonEdgePoint([x,z]){
 return [bounds.minX+(z-source.minZ)*GRAFTON_EDGE_SCALE.z,
  bounds.minZ+(source.maxX-x)*GRAFTON_EDGE_SCALE.x];
}
const [x,z]=graftonEdgePoint([IRBY_ASHLEY.x,IRBY_ASHLEY.z]);
export const GRAFTON_EDGE=Object.freeze({...IRBY_ASHLEY,x,z,name:'Grafton/Edge',
 reference:'Research/grafton-edge/README.md'});
export const GRAFTON_EDGE_FOOTPRINT=Object.freeze(GRAFTON_REAR_FOOTPRINT.map(p=>Object.freeze(graftonEdgePoint(p))));
export const GRAFTON_EDGE_VIEWS=Object.freeze({
 'grafton-edge':{position:[109,63,-111],target:[65.66,3,-164.88],fov:48},
 'grafton-edge-plan':{position:[65.66,107,-164.87],target:[65.66,0,-164.88],fov:46},
 'grafton-edge-site':{position:[139,205,68],target:[130,0,-166],fov:48},
 'grafton-edge-rear':{position:[28,23,-143],target:[63,4,-166],fov:48},
 'grafton-edge-photo':{position:[48,2.2,-180],target:[64,4.7,-164],fov:62},
 'grafton-edge-ground':{position:[43,1.8,-160],target:[66,4,-163],fov:65}
});

export function createGraftonEdge(THREE,materials){
 const ward=createIrbyAshley(THREE,{...materials,rearElevation:GRAFTON_REAR_ELEVATION});ward.name='Grafton/Edge';
 ward.position.set(x,0,z);
 ward.rotation.y=Math.PI/2;
 ward.scale.set(GRAFTON_EDGE_SCALE.x,1,GRAFTON_EDGE_SCALE.z);
 ward.traverse(o=>{o.name=o.name.replaceAll('Irby/Ashley','Grafton/Edge');});
 const data=ward.userData;
 data.source=GRAFTON_EDGE;data.footprint=GRAFTON_EDGE_FOOTPRINT;
 data.bays=data.bays.map(bay=>{const [x,z]=graftonEdgePoint([bay.x,bay.z]);return {...bay,x,z,footprint:bay.footprint.map(graftonEdgePoint)};});
 data.veranda.footprint=data.veranda.footprint.map(graftonEdgePoint);
 for(const key of ['front','wall','ridge']){
  data.veranda[key+'X']=graftonEdgePoint([IRBY_ASHLEY.x,data.veranda[key+'Z']])[0];
  delete data.veranda[key+'Z'];
 }
 const rect=([x0,z0,x1,z1])=>{
  const a=graftonEdgePoint([x0,z0]),b=graftonEdgePoint([x1,z1]);
  return [Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];
 };
 data.roofs=data.roofs.map(roof=>({...roof,rect:rect(roof.rect),axis:roof.axis==='x'?'z':'x'}));

 // Retire the old bay, including marks crossing the new open courts, while
 // leaving the connecting OS corridor and the source ward's trace alone.
 delete data.replacedOSEdges;
 data.replacedOSAreas=[[[bounds.minX-.01,bounds.minZ-.1],[bounds.maxX+.01,bounds.minZ-.1],
  [bounds.maxX+.01,bounds.maxZ+.01],[bounds.minX-.01,bounds.maxZ+.01]]];
 return ward;
}
