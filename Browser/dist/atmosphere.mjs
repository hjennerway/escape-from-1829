import {createCountryside,COUNTRYSIDE_BOUNDS} from './countryside.mjs';

const PALETTES={
 day:{zenith:0x456f88,horizon:0x99afae,cloud:0x526f7a,rim:0xffe5bb,sun:0xfff0d4,mist:0,haze:.00065,shadow:.16,night:0},
 dusk:{zenith:0x173a40,horizon:0xaca48a,cloud:0x243f40,rim:0xffc779,sun:0xffdd9f,mist:.014,haze:.0008,shadow:.11,night:0},
 night:{zenith:0x080f1e,horizon:0x26394b,cloud:0x122735,rim:0x708c9c,sun:0xc6deef,mist:.018,haze:.0009,shadow:0,night:1},
};

// A small, repeatable noise field is shared by the clouds and ground mist.
function noiseTexture(THREE){
 const size=128,data=new Uint8Array(size*size*4);let seed=1829;
 for(let i=0;i<data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=seed>>>24;data.set([n,n,n,255],i);}
 const texture=new THREE.DataTexture(data,size,size);
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;
 return texture;
}

const noiseGLSL=`
uniform sampler2D atmosphereNoise;
uniform float atmosphereTime;
float weatherNoise(vec2 p){
 vec2 cell=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return texture2D(atmosphereNoise,(cell+f+.5)/128.0).r;
}
float cloudNoise(vec2 p){
 return weatherNoise(p)*.49+weatherNoise(p*2.03+17.1)*.26+weatherNoise(p*4.11+31.7)*.13+weatherNoise(p*8.23)*.07+weatherNoise(p*16.47)*.035+weatherNoise(p*32.91)*.015;
}`;

export function createAtmosphere(THREE,exterior,{reducedMotion=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false}={}){
 const texture=noiseTexture(THREE),time={value:0},mist={value:0},haze={value:0},shadow={value:0},hazeColor={value:new THREE.Color()};let mode='day';
 const landscape=createCountryside(THREE,exterior),b=COUNTRYSIDE_BOUNDS;
 const estateBounds={value:new THREE.Vector4((b.minX+b.maxX)/2,(b.minZ+b.maxZ)/2,(b.maxX-b.minX)/2,(b.maxZ-b.minZ)/2)};
 const sunDirection={value:new THREE.Vector3(-.65,.16,-.72).normalize()};
 exterior.camera.far=Math.max(exterior.camera.far,7000);exterior.camera.updateProjectionMatrix();
 const uniforms={atmosphereNoise:{value:texture},atmosphereTime:time,
  zenith:{value:new THREE.Color()},horizon:{value:new THREE.Color()},cloud:{value:new THREE.Color()},rim:{value:new THREE.Color()},sunColor:{value:new THREE.Color()},sunDirection,night:{value:0}};
 const material=new THREE.ShaderMaterial({uniforms,side:THREE.BackSide,depthWrite:false,
  vertexShader:`varying vec3 skyDirection;
void main(){
 skyDirection=position;
 vec4 clip=projectionMatrix*vec4(mat3(viewMatrix)*position,1.0);
 gl_Position=clip.xyww;
}`,
  fragmentShader:`varying vec3 skyDirection;
uniform vec3 zenith,horizon,cloud,rim,sunColor,sunDirection;
uniform float night;
${noiseGLSL}
void main(){
 vec3 d=normalize(skyDirection);
 float elevation=max(d.y,0.0);
 vec3 color=mix(horizon,zenith,smoothstep(0.0,.32,elevation));
 float sunFacing=max(dot(d,sunDirection),0.0);
 color+=sunColor*pow(sunFacing,18.0)*mix(.38,.06,night);
 vec2 p=d.xz/(elevation+.22)*7.5+vec2(atmosphereTime*.012,atmosphereTime*.003);
 float bank=cloudNoise(d.xz*13.0+vec2(atmosphereTime*.007,8.0));
 float density=cloudNoise(p+cloudNoise(p*.53)*.8)+bank*.13*exp(-pow((d.y-.045)*8.0,2.0));
 float cover=smoothstep(.32,.64,density)*smoothstep(-.015,.035,d.y);
 float edge=smoothstep(.38,.51,density)*(1.0-smoothstep(.51,.65,density));
 float silverLining=edge*pow(sunFacing,8.0)*(1.0-smoothstep(.12,.5,elevation));
 vec3 clouds=mix(cloud,rim,silverLining*.65);
 color=mix(color,clouds,cover*.94);
 color=mix(horizon,color,smoothstep(-.015,.045,d.y));
 float moon=smoothstep(.99965,.99985,sunFacing)*night;
 color+=sunColor*moon*1.5*(1.0-cover);
 gl_FragColor=vec4(color,1.0);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`});
 const sky=new THREE.Mesh(new THREE.SphereGeometry(100,32,16),material);
 sky.name='Atmospheric cloud sky';sky.frustumCulled=false;sky.renderOrder=-1000;
 exterior.scene.add(sky);

 // Compose with grass/window shaders and retain the scene's distance fog.
 // Integrating mist along the viewing ray keeps it low around the grounds,
 // rather than laying transparent sheets across buildings and paths.
 const materials=new Set();
 exterior.model.traverse(object=>{for(const m of [object.material].flat())if(m?.isMeshStandardMaterial)materials.add(m);});
 landscape.group.traverse(object=>{if(object.material?.isMeshStandardMaterial)materials.add(object.material);});
 for(const m of materials){
  const compile=m.onBeforeCompile,key=m.customProgramCacheKey();
  if(m.map&&!m.bumpMap&&m.map.wrapS===THREE.RepeatWrapping&&m.roughness>=.8&&!m.transparent&&!m.userData.nightWindowGlass&&!m.userData.estateGrass){
   m.bumpMap=m.map;m.bumpScale=.055;
  }
  m.onBeforeCompile=function(shader,renderer){
   compile.call(this,shader,renderer);
   Object.assign(shader.uniforms,{atmosphereNoise:{value:texture},atmosphereTime:time,groundMist:mist,countrysideHaze:haze,weatherHazeColor:hazeColor,cloudShadow:shadow,estateBounds});
   shader.vertexShader='varying vec3 vWeatherPosition;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
vWeatherPosition=cameraPosition+mvPosition.xyz*mat3(viewMatrix);`);
   shader.fragmentShader=`varying vec3 vWeatherPosition;
uniform float groundMist,countrysideHaze,cloudShadow;
uniform vec3 weatherHazeColor;
uniform vec4 estateBounds;
${m.userData.estateGrass?'#define WEATHER_GRASS\n':''}
${noiseGLSL}
float outsideEstate(){return length(max(abs(vWeatherPosition.xz-estateBounds.xy)-estateBounds.zw,0.0));}
`+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
#ifdef WEATHER_GRASS
 vec2 meadow=vWeatherPosition.xz;
 float mottling=cloudNoise(meadow*.012);
 diffuseColor.rgb*=mix(vec3(.77,.88,.86),vec3(1.06,1.04,.91),mottling);
 float field=weatherNoise(meadow*.004+cloudNoise(meadow*.0015)*1.6);
 vec3 fieldTint=mix(vec3(.65,.80,.77),vec3(1.09,1.03,.76),smoothstep(.28,.73,field));
 diffuseColor.rgb*=mix(vec3(1.0),fieldTint,smoothstep(15.0,150.0,outsideEstate()));
#endif
 float passingCloud=smoothstep(.30,.72,cloudNoise(vWeatherPosition.xz*.004+vec2(atmosphereTime*.012,atmosphereTime*.003)));
 diffuseColor.rgb*=1.0-cloudShadow*passingCloud;`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
 float distanceHaze=1.0-exp(-max(0.0,outsideEstate()-80.0)*countrysideHaze);
 outgoingLight=mix(outgoingLight,weatherHazeColor,distanceHaze);
 #include <opaque_fragment>`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>',`#include <fog_fragment>
#ifdef USE_FOG
 if(groundMist>0.0){
  float startHeight=max(cameraPosition.y,0.0),endHeight=max(vWeatherPosition.y,0.0);
  float deltaHeight=endHeight-startHeight;
  float heightDensity=abs(deltaHeight)<.01?exp(-startHeight*.38):(exp(-startHeight*.38)-exp(-endHeight*.38))/(deltaHeight*.38);
  float wisps=weatherNoise(vWeatherPosition.xz*.035+vec2(atmosphereTime*.015,0.0));
  float amount=1.0-exp(-length(vWeatherPosition-cameraPosition)*groundMist*heightDensity*(.4+wisps*.9));
  gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor,min(.64,amount));
 }
#endif`);
  };
  m.customProgramCacheKey=()=>key+'-weather-v2'+(m.userData.estateGrass?'-meadow':'');m.needsUpdate=true;
 }
 function setMode(value){
  const palette=PALETTES[value];if(!palette)throw new Error('Unknown atmosphere: '+value);
  mode=value;for(const name of ['zenith','horizon','cloud','rim'])uniforms[name].value.setHex(palette[name]);
  uniforms.sunColor.value.setHex(palette.sun);uniforms.night.value=palette.night;mist.value=palette.mist;haze.value=palette.haze;shadow.value=palette.shadow;hazeColor.value.setHex(palette.horizon);
 }
 function update(dt=0){if(!reducedMotion)time.value+=Math.max(0,Math.min(dt,.1));}
 setMode('day');
 return {sky,landscape,setMode,update,setSunDirection(direction){sunDirection.value.copy(direction).normalize();},get mode(){return mode;},get time(){return time.value;}};
}
