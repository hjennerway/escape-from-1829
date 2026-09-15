import {createHistoricRoads} from './historic-roads.mjs';
import {createModernRoads} from './modern-roads.mjs';
import {createModernEntrance} from './modern-entrance.mjs';

// Opt in from the aerial preview: gameplay and walking keep their existing estate.
export function createAerialLayouts(THREE,exterior){
  if(exterior.layouts)return exterior.layouts;
  const shared=new THREE.Group(),historic=new THREE.Group(),modern=new THREE.Group();
  shared.name='Shared estate';historic.name='Historic layout';modern.name='Modern layout';
  const historicObjects=new Set([exterior.annexe,exterior.mainAdmin,exterior.adminCorridor,exterior.estateChimney]);
  for(const child of [...exterior.model.children]){
    if(child===exterior.terrain)continue;
    (historicObjects.has(child)?historic:shared).add(child);
  }
  const roads=createModernRoads(THREE),entrance=createModernEntrance(THREE);shared.add(roads,entrance);
  exterior.model.add(shared,historic,modern);
  const historicRoads=createHistoricRoads(THREE,exterior);historic.add(historicRoads);
  // Retire inferred tracks while the photo-based historic network is shown.
  const superseded=[exterior.legacyAccess];
  exterior.annexe.traverse(o=>{if(o.name==='Annexe drive')superseded.push(o);});
  exterior.mainAdmin.traverse(o=>{if(['Admin carriage approach','Admin forecourt lawn','Curved lawn stone edging','West side access','East curved carriage drive','East wing side access'].some(name=>o.name===name||o.name===name+' stone kerb'))superseded.push(o);});
  const lane=roads.getObjectByName('Vivienne Smith Lane');
  const sharedRoads=new Set(['Vivienne Smith Lane','Parsons Lane','Parsons Lane (Upton Lea)','Parsons Lane (1829 Central)']);
  const state={historic:true,modern:false};
  function setVisible(layout,visible){
    if(layout!=='historic'&&layout!=='modern')throw new Error('Unknown estate layout: '+layout);
    state[layout]=Boolean(visible);historic.visible=state.historic;modern.visible=state.modern;
    shared.visible=state.historic||state.modern;
    for(const object of superseded)object.visible=!state.historic;
    for(const road of roads.children)road.visible=state.modern||(state.historic&&sharedRoads.has(road.name));
    lane.getObjectByName('Vivienne Smith Lane eastern continuation').visible=state.modern;
  }
  setVisible('modern',false);
  exterior.layouts={shared,historic,modern,roads,entrance,historicRoads,setVisible,get state(){return {...state};}};
  return exterior.layouts;
}

export function bindLayoutToggles(layouts,root){
  const historic=root.querySelector('#historicLayout'),modern=root.querySelector('#modernLayout');
  const fit=root.querySelector('#fitLayouts'),roadList=root.querySelector('#modernRoadList');
  function refresh(){
    historic.checked=layouts.state.historic;modern.checked=layouts.state.modern;
    fit.disabled=!historic.checked&&!modern.checked;roadList.hidden=!modern.checked;
  }
  for(const [input,key] of [[historic,'historic'],[modern,'modern']])input.addEventListener('change',()=>{layouts.setVisible(key,input.checked);refresh();});
  refresh();
}

// Ignore hidden road children and planter preferences when framing a layout.
export function visibleLayoutBounds(THREE,group){
  const bounds=new THREE.Box3();group.updateWorldMatrix(true,true);
  group.traverseVisible(object=>{if(object.isMesh)bounds.union(new THREE.Box3().setFromObject(object));});
  return bounds;
}

export function fitAerialLayouts(THREE,exterior,layouts){
  const bounds=new THREE.Box3();
  for(const group of [layouts.shared,layouts.historic,layouts.modern])if(group.visible)bounds.union(visibleLayoutBounds(THREE,group));
  if(bounds.isEmpty())return null;
  // The estate fog obscures the longer distances needed to frame the road network.
  if(exterior.scene.fog)exterior.scene.fog.density=0;
  const center=bounds.getCenter(new THREE.Vector3()),radius=bounds.getSize(new THREE.Vector3()).length()/2;
  const camera=exterior.camera;camera.fov=46;camera.updateProjectionMatrix();
  const halfFov=Math.min(camera.fov*Math.PI/360,Math.atan(Math.tan(camera.fov*Math.PI/360)*camera.aspect));
  const distance=radius/Math.sin(halfFov)*1.15;
  camera.far=Math.max(2000,distance+radius*2);camera.updateProjectionMatrix();
  camera.position.copy(center).addScaledVector(new THREE.Vector3(.18,1,.65).normalize(),distance);
  camera.lookAt(center);return center.toArray();
}
