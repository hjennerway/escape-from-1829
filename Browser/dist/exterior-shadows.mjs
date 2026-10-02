// Back-face-only shadow maps put the recorded depth on a building's far wall.
// Filtering that depth lets light through wall/ground and inside-corner joins.
// Include the sun-facing skin too; the visible material still uses its original
// culling. Keep foliage's alpha-tested/custom depth treatment intact.
export function prepareExteriorShadows(THREE,model,{exclude=[]}={}){
  installExteriorShadowFiltering(THREE);
  model.traverse(object=>{
    if(!object.isMesh||!object.castShadow)return;
    for(let parent=object;parent;parent=parent.parent)if(exclude.includes(parent))return;
    for(const material of [object.material].flat()){
      if(material&&!material.transparent&&!material.alphaTest&&material.shadowSide===null)
        material.shadowSide=THREE.DoubleSide;
    }
  });
}
// PCF compares neighbouring shadow texels. On sloping receivers they have
// different depths, so a single comparison depth makes a flat wall look striped.
// Compare each texel against the receiver plane at that texel, then interpolate.
// This retains the small contact bias without moving shadows away from walls.
export function installExteriorShadowFiltering(THREE){
  const chunk=THREE.ShaderChunk?.shadowmap_pars_fragment;
  if(!chunk||chunk.includes('estateShadowTap'))return;
  const signature='float getShadow( sampler2DShadow shadowMap,';
  const helper=`float estateShadowTap( sampler2DShadow shadowMap, vec2 mapSize, vec3 coord, vec2 offset, vec2 gradient ) {
    vec2 texel = 1.0 / mapSize;
    vec2 samplePosition = ( coord.xy + offset ) * mapSize - 0.5;
    vec2 base = ( floor( samplePosition ) + 0.5 ) * texel;
    vec2 blend = fract( samplePosition );
    vec2 b = base + vec2( texel.x, 0.0 );
    vec2 c = base + vec2( 0.0, texel.y );
    vec2 d = base + texel;
    return mix(
      mix( texture( shadowMap, vec3( base, coord.z + dot( base - coord.xy, gradient ) ) ),
           texture( shadowMap, vec3( b, coord.z + dot( b - coord.xy, gradient ) ) ), blend.x ),
      mix( texture( shadowMap, vec3( c, coord.z + dot( c - coord.xy, gradient ) ) ),
           texture( shadowMap, vec3( d, coord.z + dot( d - coord.xy, gradient ) ) ), blend.x ), blend.y );
  }

  ${signature}`;
  let patched=chunk.replace(signature,helper);
  // Derivatives must be evaluated before the per-fragment frustum branch.
  patched=patched.replace('shadowCoord.z += shadowBias;',`shadowCoord.z += shadowBias;
    vec3 planeDx = dFdx( shadowCoord.xyz ), planeDy = dFdy( shadowCoord.xyz );
    float planeDet = planeDx.x * planeDy.y - planeDx.y * planeDy.x;
    vec2 planeGradient = vec2( 0.0 );
    if ( abs( planeDet ) > 1e-20 ) planeGradient = vec2(
      planeDy.y * planeDx.z - planeDx.y * planeDy.z,
      planeDx.x * planeDy.z - planeDy.x * planeDx.z ) / planeDet;`);
  patched=patched.replace(/texture\( shadowMap, vec3\( shadowCoord\.xy \+ (vogelDiskSample\( \d, 5, phi \) \* radius), shadowCoord\.z \) \)/g,
    'estateShadowTap( shadowMap, shadowMapSize, shadowCoord.xyz, $1, planeGradient )');
  THREE.ShaderChunk.shadowmap_pars_fragment=patched;
}
