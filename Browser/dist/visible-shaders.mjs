// Three's normal compile traverses hidden batch originals, future periods and
// inactive LODs. Compile the visible renderables with the real scene's lighting
// and fog, without mutating its hierarchy or visibility. New variants compile
// normally when a later period/detail setting makes them visible.
export function compileVisibleScene(THREE,renderer,scene,camera){
  const visible=new THREE.Group();
  visible.traverse=visit=>scene.traverseVisible(visit);
  return renderer.compileAsync(visible,camera,scene);
}
