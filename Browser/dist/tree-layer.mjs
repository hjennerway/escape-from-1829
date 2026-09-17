// A separate scene branch skips rendering and shadow work while hidden.
export function createTreeLayer(THREE,model){
  const layer=new THREE.Group();layer.name='Trees';layer.visible=true;
  model.add(layer);return layer;
}

export function bindTreeToggle(exterior,target,onChange=()=>{}){
  target.addEventListener('keydown',event=>{
    if(event.code!=='KeyT'||event.repeat||event.ctrlKey||event.altKey||event.metaKey)return;
    if(event.target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(event.target?.tagName))return;
    event.preventDefault();
    exterior.trees.visible=!exterior.trees.visible;
    exterior.invalidateShadows?.();
    onChange(exterior.trees.visible);
  });
}
