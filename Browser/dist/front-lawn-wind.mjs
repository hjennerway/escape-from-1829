// EZ-Tree's three gentle wind harmonics, adapted to scene units and applied
// before projection so lighting, fog and shadow depth use the same positions.
const states=new WeakMap();
export function installLeafWind(material){
  if(states.has(material))return states.get(material);
  const {phase=0,strength=.16}=material.userData.frontLawnWind;
  const time={value:0},amount={value:strength};
  material.onBeforeCompile=shader=>{
    shader.uniforms.lawnWindTime=time;shader.uniforms.lawnWindAmount=amount;
    shader.vertexShader=`uniform float lawnWindTime;\nuniform float lawnWindAmount;\n`+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      float windOffset=dot(position,vec3(.17,.09,.13))+${Number(phase).toFixed(3)};
      float t=lawnWindTime*.5;
      float sway=.5*sin(t+windOffset)+.3*sin(2.0*t+1.3*windOffset)+.2*sin(5.0*t+1.5*windOffset);
      transformed+=vec3(1.0,.12,.65)*uv.y*lawnWindAmount*sway;
    `);
  };
  material.customProgramCacheKey=()=>`front-lawn-wind-v1-${phase}`;
  const state={time,amount};states.set(material,state);return state;
}

export function createFrontLawnWind(THREE,exterior,{reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false}={}){
  const materials=new Map(),depthMaterials=new Map(),trees=[];
  exterior.trees?.traverse(object=>{
    if(object.userData.frontLawnTree&&object.userData.ezTree)trees.push(object);
    const material=object.material;
    if(!material?.userData.frontLawnWind)return;
    if(!materials.has(material))materials.set(material,installLeafWind(material));
    // Recreate hooks after binary loading; all LODs receive matching shadow sway.
    let depth=depthMaterials.get(material);
    if(!depth){
      depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:material.map,alphaTest:material.alphaTest,side:THREE.DoubleSide});
      depth.userData.frontLawnWind={...material.userData.frontLawnWind};depthMaterials.set(material,depth);
    }
    const depthState=installLeafWind(depth),state=materials.get(material);
    materials.set(depth,depthState);object.customDepthMaterial=depth;
    if(reducedMotion){state.amount.value=0;depthState.amount.value=0;}
  });
  let elapsed=0;
  return {update(dt){
    if(reducedMotion||!exterior.trees?.visible||dt<=0||!trees.length)return;
    // Keep distant aerial shadows cached; nearby leaves and shadow depth move
    // together at render cadence without changing trunks or object transforms.
    if(!trees.some(tree=>tree.visible&&exterior.camera.position.distanceToSquared(tree.position)<120**2))return;
    elapsed+=Math.min(dt,.1);
    for(const state of materials.values())state.time.value=elapsed;
    exterior.invalidateShadows();
  },get time(){return elapsed;}};
}
