// A separate scene branch skips rendering and shadow work while hidden.
export function createTreeLayer(THREE,model){
  const layer=new THREE.Group();layer.name='Trees';layer.visible=true;
  model.add(layer);return layer;
}

export function bindTreeToggle(exterior,target,onChange=()=>{}){
  target.addEventListener('keydown',event=>{
    if(event.code!=='KeyT'||event.repeat||event.ctrlKey||event.altKey||event.metaKey)return;
    const input=event.target;
    // Layout checkboxes keep focus after a click; they must not block T.
    if(input?.isContentEditable||['TEXTAREA','SELECT'].includes(input?.tagName)||(input?.tagName==='INPUT'&&input.type!=='checkbox'))return;
    event.preventDefault();
    exterior.trees.visible=!exterior.trees.visible;
    exterior.invalidateShadows?.();
    onChange(exterior.trees.visible);
  });
}
