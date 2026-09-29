import {Tree} from './vendor/ez-tree/tree.mjs';
import oakLarge from './vendor/ez-tree/presets/oak_large.mjs';
import {oak,bark} from './vendor/ez-tree/texture-data.mjs';
import {installLeafWind} from './front-lawn-wind.mjs';

// Oak Large best matches the broad photographed beeches, not their species.
export const FRONT_LAWN_EZTREE_PRESET='Oak Large';
export function frontLawnOptions(seed){
  const options=structuredClone(oakLarge);
  options.seed=seed;options.branch.start[1]=.24;
  options.branch.children={0:15,1:7,2:4};
  options.leaves.count=16;options.leaves.size=4.5;options.leaves.roundedNormals=true;
  return options;
}

function texture(THREE,source,{grey=false,repeat=false}={}){
  const bytes=Uint8Array.from(atob(source.rgba),c=>c.charCodeAt(0));
  if(grey)for(let i=0;i<bytes.length;i+=4){
    const shade=Math.min(255,Math.round((bytes[i]*.2126+bytes[i+1]*.7152+bytes[i+2]*.0722)*1.3));
    bytes[i]=bytes[i+1]=bytes[i+2]=shade;
  }
  const map=new THREE.DataTexture(bytes,source.size,source.size);
  map.colorSpace=THREE.SRGBColorSpace;map.generateMipmaps=true;
  map.minFilter=THREE.LinearMipmapLinearFilter;map.magFilter=THREE.LinearFilter;map.anisotropy=8;
  if(repeat){map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.y=.1;}
  map.needsUpdate=true;return map;
}

export function addFrontLawnEZTrees(THREE,trees,specs){
  if(!specs.length)return;
  // Keep the shared buffer fit fixed when resizing an individual specimen.
  const base={seed:1901,height:19.5*1.2,radius:8.6*1.2},generator=new Tree();generator.options.copy(frontLawnOptions(base.seed));
  const leafMap=texture(THREE,oak,{grey:true}),barkMap=texture(THREE,bark,{repeat:true});
  const wood=new THREE.MeshStandardMaterial({name:'EZ-Tree lawn bark',color:0x827b6a,map:barkMap,roughness:1});
  const leaves=new THREE.MeshStandardMaterial({name:'EZ-Tree green lawn foliage',map:leafMap,
    color:0x719b4b,alphaTest:.45,side:THREE.DoubleSide,roughness:1});
  leaves.userData.frontLawnWind={phase:0,strength:.16};installLeafWind(leaves);
  const copperLeaves=leaves.clone();copperLeaves.name='EZ-Tree copper lawn foliage';
  copperLeaves.color.setHex(0xa18a70);installLeafWind(copperLeaves);
  // Six rotated copies share buffers/textures, with two shared foliage tints.
  // Keep independent LOD selection so walking still reveals nearby detail.
  const levels=[];let fit,crownTop;
  for(const [distance,detail] of [[0,{}],[95,{sectionStride:3,segmentFactor:.65,leafStride:3,leafScale:1.35}],
    [210,{sectionStride:6,segmentFactor:.4,leafStride:6,leafScale:1.6,billboard:'single'}]]){
    const geometry=generator.createGeometry(detail);
    if(!fit){
      geometry.leaves.computeBoundingBox();const b=geometry.leaves.boundingBox;crownTop=b.max.y;
      fit=new THREE.Vector3(base.radius/Math.max(Math.abs(b.min.x),Math.abs(b.max.x)),
        base.height/(crownTop*.62+crownTop*.38*.45),base.radius/Math.max(Math.abs(b.min.z),Math.abs(b.max.z)));
    }
    for(const key of ['branches','leaves']){
      const g=geometry[key],positions=g.attributes.position;
      // Shorten the preset's tall terminal leader into a rounded mature crown.
      for(let i=0;i<positions.count;i++){const y=positions.getY(i);if(y>crownTop*.62)positions.setY(i,crownTop*.62+(y-crownTop*.62)*.45);}
      g.scale(fit.x,fit.y,fit.z);
      // Only extend the root ring. All copies and LODs retain their crowns.
      if(key==='branches')for(let i=0;i<positions.count;i++)if(positions.getY(i)<.001)positions.setY(i,-.36);
      g.computeBoundingBox();g.computeBoundingSphere();
      if(key==='leaves'){g.boundingBox.expandByScalar(.24);g.boundingSphere.radius+=.24;}
    }
    levels.push({distance,geometry});
  }
  for(const spec of specs){
    const group=new THREE.Group();group.name=spec.name;group.position.set(spec.x,.16,spec.z);
    group.rotation.y=spec.rotation??0;group.scale.set(spec.radius/base.radius,spec.height/base.height,spec.radius/base.radius);
    group.userData.beechTree={...spec};group.userData.frontLawnTree={...spec};
    group.userData.ezTree={preset:FRONT_LAWN_EZTREE_PRESET,seed:base.seed};
    // Explicit world-space trunk radius; the combined mesh also includes branches.
    group.userData.treeTrunk={radius:.78*spec.radius/8.6};
    const lod=new THREE.LOD();lod.name=spec.name+' EZ-Tree detail';group.add(lod);
    for(const {distance,geometry} of levels){
      const level=new THREE.Group();level.name=spec.name+' detail '+distance;
      for(const [key,material] of [['branches',wood],['leaves',spec.copper?copperLeaves:leaves]]){
        const mesh=new THREE.Mesh(geometry[key],material);mesh.name=spec.name+' EZ-Tree '+key;
        mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.noWalkingCollision=true;level.add(mesh);
      }
      lod.addLevel(level,distance,.15);level.visible=distance===0;
    }
    trees.add(group);
  }
  generator.branchesMesh.geometry.dispose();generator.branchesMesh.material.dispose();
  generator.leavesMesh.geometry.dispose();generator.leavesMesh.material.dispose();
}
