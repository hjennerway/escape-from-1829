// Latest marked plan: yellow edge to blue, orange edge to purple.
// Distances are fitted to the supplied image in the original map frame.
export const ANNEXE_REAR_WEST_SHIFT=-9;
export const ANNEXE_REAR_HEAD_SHIFT=Object.freeze([10*Math.cos(.43),-10*Math.sin(.43)]);
export function alignAnnexeRearSide({model,sections,wards,ranges,openings,scale}){
 const west=[ANNEXE_REAR_WEST_SHIFT*scale,0],head=ANNEXE_REAR_HEAD_SHIFT.map(n=>n*scale);
 sections.rearWest.position.x+=west[0];model.userData.oakmereWestElevation.position.x+=west[0];
 wards.oakmere.position.x+=head[0];wards.oakmere.position.z+=head[1];
 sections.rearConnector.removeFromParent();
 const room=model.userData.oakmereWestElevation.getObjectByName('Oakmere west low rear end room');
 room.removeFromParent();
 for(let i=ranges.length-1;i>=0;i--){const b=ranges[i];if(b.name==='Rear service court link'){ranges.splice(i,1);continue;}const shift=b.name==='Rear court west range'?west:b.wardId==='oakmere'?head:null;if(shift){b.x+=shift[0];b.z+=shift[1];}}
 for(let i=openings.length-1;i>=0;i--){const o=openings[i];if(o.name==='Rear service court link'){openings.splice(i,1);continue;}const shift=o.name==='Rear court west range'?west:o.wardId==='oakmere'?head:null;if(shift){o.x+=shift[0];o.z+=shift[1];}}
 // The deleted room's two windows no longer belong to the visible elevation.
 const detail=model.userData.oakmereWestElevation;
 detail.userData.openings=detail.userData.openings.filter(o=>!room.userData.openings.includes(o));
 model.userData.rearSideAlignment={west,head};
}
