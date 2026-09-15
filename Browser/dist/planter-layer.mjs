// A separate scene branch skips rendering and shadow work while hidden.
export function createPlanterLayer(THREE,model){
  const layer=new THREE.Group();layer.name='Garden planters';layer.visible=false;
  model.add(layer);return layer;
}

export function bindPlanterToggle(exterior,target,onChange=()=>{}){
  target.addEventListener('keydown',event=>{
    if(event.code!=='KeyH'||event.repeat||event.ctrlKey||event.altKey||event.metaKey)return;
    if(event.target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(event.target?.tagName))return;
    event.preventDefault();
    exterior.planters.visible=!exterior.planters.visible;
    onChange(exterior.planters.visible);
  });
}
