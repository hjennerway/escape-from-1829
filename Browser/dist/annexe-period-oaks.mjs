import {copyTreeTemplate} from './tree-templates.mjs';

// Ground picks from the owner's three blue crosses. These are screenshot-based
// positions, separate from the surveyed KML tree inventory.
export const ANNEXE_PERIOD_OAKS=Object.freeze([
 [357.89,27.32],[349.38,34.82],[341.19,44.89]
].map(([x,z],index)=>Object.freeze({name:'Annexe lawn oak '+(index+1),species:'oak',x,z,
 height:22,radius:10,seed:182902,rotation:.45+index*2.399963229728653})));

export function addAnnexePeriodOaks(THREE,trees){
 const template=trees.children.find(tree=>tree.userData.oakTree);
 for(const spec of ANNEXE_PERIOD_OAKS){
  const tree=copyTreeTemplate(THREE,template);
  tree.traverse(object=>{object.name=object.name.replace(template.name,spec.name);});
  tree.position.set(spec.x,template.position.y,spec.z);tree.rotation.y=spec.rotation;
  tree.userData.oakTree={...spec};tree.userData.estateSection='Annexe lawn oaks';
  trees.add(tree);
 }
}
