// WebGL exposes the active renderer, not the browser's acceleration preference.
// Only an identified software renderer changes the default; privacy-restricted
// or unfamiliar renderer information must not hide trees on a working GPU.
const SOFTWARE_RENDERER=/\b(?:swiftshader|llvmpipe|softpipe|lavapipe|swrast|software|microsoft basic render driver|warp|gdi generic)\b/i;

export function isSoftwareRenderer(gl){
  if(!gl)return false;
  const names=[];
  try{
    const info=gl.getExtension('WEBGL_debug_renderer_info');
    if(info)names.push(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
  }catch{/* Some browsers restrict renderer information. */}
  try{names.push(gl.getParameter(gl.RENDERER));}catch{/* Keep the existing default. */}
  return names.some(name=>typeof name==='string'&&SOFTWARE_RENDERER.test(name));
}

// Run once at page startup so the normal T shortcut remains a manual override.
export function applyTreeRenderingDefault(renderer,exterior,onChange=()=>{}){
  if(!isSoftwareRenderer(renderer.getContext())||!exterior.trees.visible)return;
  exterior.trees.visible=false;
  exterior.invalidateShadows();
  onChange(false);
}
