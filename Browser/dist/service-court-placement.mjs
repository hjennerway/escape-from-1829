// Latest yellow / purple / blue-X annotation. Both translations point towards
// Main/admin; a small eastward component clears the fixed tower and chimney.
export const SERVICE_COURT_MOVES=Object.freeze({
 purple:Object.freeze({x:7.5,z:10.2}),
 // Green rear-edge guide: move all three workshops another 8 units to Main/admin.
 workshops:Object.freeze({x:11.5,z:19})
});
export const moveServiceRect=(rect,move)=>rect.map((n,i)=>n+(i%2?move.z:move.x));
export const moveServiceView=(view,move)=>({...view,
 position:view.position.map((n,i)=>n+(i===0?move.x:i===2?move.z:0)),
 target:view.target.map((n,i)=>n+(i===0?move.x:i===2?move.z:0))});
