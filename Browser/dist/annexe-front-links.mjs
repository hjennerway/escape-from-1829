// Restore the owner's missing east link by reflecting the complete west link.
// Seven map units align the court's inward face with the opposite x=-27 face.
export const ANNEXE_EAST_FRONT_SHIFT=7;
export const isAnnexeEastFrontRange=name=>/^East (court (?!entrance link)|front connecting ward|end |rear pavilion|rear link)/.test(name);
export function annexeFrontSection(name){
 if(name==='West court entrance link')return 'westLink';
 return isAnnexeEastFrontRange(name)?'eastOuter':null;
}

export function restoreAnnexeFrontLink({model,sections,wards,ranges,openings,scale}){
 const dx=ANNEXE_EAST_FRONT_SHIFT*scale;
 sections.eastOuter.add(model.userData.outerFronts[1]);
 sections.eastOuter.position.x=dx;
 wards['picton-carden'].position.x=dx;
 for(const b of ranges)if(isAnnexeEastFrontRange(b.name))b.x+=dx;
 for(const o of openings)if(isAnnexeEastFrontRange(o.name))o.x+=dx;

 const east=sections.westLink.clone(true);east.name='East court entrance link';east.scale.x=-1;
 east.traverse(o=>{o.name=o.name.replace(/^West /,'East ');});model.add(east);
 const west=ranges.find(b=>b.name==='West court entrance link');
 ranges.push({...west,name:east.name,x:-west.x,r:-west.r,rect:[-west.rect[2],west.rect[1],-west.rect[0],west.rect[3]]});
 for(const o of openings.filter(o=>o.name===west.name))openings.push({...o,name:east.name,x:-o.x,rotation:-o.rotation});
 model.userData.frontLinks={west:sections.westLink,east};
 model.userData.eastFrontWing=sections.eastOuter;
}
