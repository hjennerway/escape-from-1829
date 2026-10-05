// The three user-traced tower photographs, registered to the upper arch.
// Local u runs left/right while facing a wall; x/z/height remain scene units.
// Face 1: white door, face 3: opposite door, face 4: away from Redesmere.
// Approximate heights are shared at corners so the roofs join continuously.
export const TOWER_ROOF_CONTACTS=Object.freeze({
 deck:9,corner:11.2,inner:1.7,outer:5.1,
 faces:[{side:1,profile:[[-1.7,9],[1.7,9],[5.1,11.2]]},
  {side:3,profile:[[-5.1,11.2],[-1.7,9],[1.7,9]]},
  {side:4,profile:[[-5.1,11.2],[-1.7,9],[1.7,9],[5.1,11.2]]}]
});
