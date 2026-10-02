import {asylumWallShapes,extrudeAsylumWalls} from './asylum-wall-geometry.mjs';

export function asylumSkirtingGeometry(THREE,walls){
 const shapes=asylumWallShapes(THREE,walls,{width:.215,endExtension:.012});
 return extrudeAsylumWalls(THREE,shapes,.01,.25);
}
