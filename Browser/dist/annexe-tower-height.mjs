// The September 24 height annotation shortens the two complete square towers.
// Transform before scene batching and obstacle construction, keeping x/z fixed.
export const ANNEXE_TOWER_HEIGHT_SCALE=.85;
export function isTowerPart(annexe,object,matrix,towers){
 if(object.parent!==annexe)return false;
 if(!object.isInstancedMesh)return /^(East|West) square tower |^Tower (ridge crest|crest finial)$/.test(object.name);
 const x=matrix.elements[12],z=matrix.elements[14];
 return towers.some(t=>Math.abs(x-t.x)<=t.w/2+.35&&Math.abs(z-t.z)<=t.d/2+.35);
}
export function shortenAnnexeTowers(THREE,annexe,ranges,openings){
 const towers=ranges.filter(b=>/^(East|West) square tower$/.test(b.name));
 const scale=new THREE.Matrix4().makeScale(1,ANNEXE_TOWER_HEIGHT_SCALE,1),matrix=new THREE.Matrix4();
 for(const object of annexe.children){
  if(!object.isMesh)continue;
  if(object.isInstancedMesh){
   let changed=false;
   for(let i=0;i<object.count;i++){object.getMatrixAt(i,matrix);if(isTowerPart(annexe,object,matrix,towers)){object.setMatrixAt(i,matrix.premultiply(scale));changed=true;}}
   if(changed){object.instanceMatrix.needsUpdate=true;object.computeBoundingBox();object.computeBoundingSphere();}
  }else if(isTowerPart(annexe,object,object.matrix,towers))object.applyMatrix4(scale);
 }
 for(const tower of towers){tower.h*=ANNEXE_TOWER_HEIGHT_SCALE;tower.rise*=ANNEXE_TOWER_HEIGHT_SCALE;}
 for(const o of openings)if(/^(East|West) (square tower|tower )/.test(o.name)){o.y*=ANNEXE_TOWER_HEIGHT_SCALE;o.h*=ANNEXE_TOWER_HEIGHT_SCALE;}
 annexe.userData.towerHeightScale=ANNEXE_TOWER_HEIGHT_SCALE;
}
