import {addFoliageLevels,placeTreeCopies} from './tree-templates.mjs';
import {KML_OAK_TREES} from './kml-tree-data.mjs';

// One mature oak model, copied to every KML oak with the saved random rotations.
export function addOakTrees(THREE,trees){
  const spec=KML_OAK_TREES[0],group=new THREE.Group();
  group.name=spec.name;group.position.set(spec.x,-.12,spec.z);
  const bark=new THREE.MeshStandardMaterial({color:0x5c5143,roughness:1});
  const stemGeometry=new THREE.CylinderGeometry(.65,1,1,7);
  const resolution=128,pixels=new Uint8Array(resolution*resolution*4),leaves=[];
  for(let row=0;row<3;row++)for(const side of [-1,1]){
    leaves.push({x:side*.25,y:-.58+row*.48,angle:Math.atan2(.4,side*.7),length:.4,width:.21});
  }
  leaves.push({x:0,y:.74,angle:Math.PI/2,length:.25,width:.16});
  // Rounded lobes distinguish the oak leaves from the existing beech sprays.
  for(let py=0;py<resolution;py++)for(let px=0;px<resolution;px++){
    const x=px/(resolution-1)*2-1,y=py/(resolution-1)*2-1;
    let shade=Math.abs(x)<.014&&y>-.92&&y<.8?115:0;
    for(const leaf of leaves){
      const dx=x-leaf.x,dy=y-leaf.y,c=Math.cos(leaf.angle),s=Math.sin(leaf.angle);
      const along=(dx*c+dy*s)/leaf.length,across=(-dx*s+dy*c)/leaf.width;
      const edge=Math.cos(along*Math.PI/2)*(.76+.24*Math.cos(along*5*Math.PI));
      if(Math.abs(along)<1&&Math.abs(across)<edge)shade=200+Math.floor(40*(1-Math.abs(across)));
    }
    if(shade){const i=(py*resolution+px)*4;pixels[i]=pixels[i+1]=pixels[i+2]=shade;pixels[i+3]=255;}
  }
  const texture=new THREE.DataTexture(pixels,resolution,resolution);texture.colorSpace=THREE.SRGBColorSpace;
  texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.needsUpdate=true;
  const foliage=new THREE.MeshStandardMaterial({color:0xffffff,map:texture,alphaTest:.4,roughness:1,side:THREE.DoubleSide});
  const leafGeometry=new THREE.PlaneGeometry(2,2,1,2),positions=leafGeometry.attributes.position;
  for(let i=0;i<positions.count;i++)positions.setZ(i,.14*(1-Math.abs(positions.getY(i))));
  leafGeometry.computeVertexNormals();
  let seed=spec.seed;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),colour=new THREE.Color(),stems=[],sprays=[];
  function branch(a,b,radius,tip=radius*.55){
    const start=new THREE.Vector3(...a),delta=new THREE.Vector3(...b).sub(start);
    for(let n=0;n<3;n++){
      dummy.position.copy(start).addScaledVector(delta,(n+.5)/3);
      dummy.quaternion.setFromUnitVectors(up,delta.clone().normalize());
      const r=radius+(tip-radius)*n/3;
      dummy.scale.set(r,delta.length()/3+.035,r);dummy.updateMatrix();stems.push(dummy.matrix.clone());
    }
  }
  // Heavy, crooked limbs and exposed root buttresses beneath a broad crown.
  branch([0,0,0],[.32,4.7,-.2],1.15,.82);
  branch([.32,4.5,-.2],[-.55,10.3,.35],.82,.3);
  for(let n=0;n<7;n++){
    const a=n*Math.PI*2/7+random()*.35,r=1.7+random()*.5;
    branch([Math.sin(a)*r,.1,Math.cos(a)*r],[Math.sin(a)*.4,.85,Math.cos(a)*.4],.13,.4);
  }
  for(let n=0;n<10;n++){
    const a=n*2.39996,reach=spec.radius*(.54+random()*.16),height=7.6+random()*5.8;
    const elbow=[Math.sin(a)*reach*.52,5.9+(n%3),Math.cos(a)*reach*.52];
    const fork=[Math.sin(a)*reach,height,Math.cos(a)*reach];
    branch([.25,3.7+(n%3)*.8,-.1],elbow,.48-(n%3)*.04,.31);
    branch(elbow,fork,.31,.14);
    for(let j=0;j<3;j++){
      const angle=a+(j-1)*.52;
      branch(fork,[Math.sin(angle)*reach*1.22,height+1.8+random()*2,Math.cos(angle)*reach*1.22],.13,.035);
    }
  }
  const palette=[0x415334,0x53633b,0x607046,0x4a5d38,0x6c774d];
  const bands=[.58,.83,.98,1,.89,.68,.35];
  for(let tier=0;tier<bands.length;tier++){
    const y=5.8+tier*(spec.height-7.4)/6,radius=spec.radius*bands[tier];
    for(let x=-radius;x<=radius;x+=2)for(let z=-radius;z<=radius;z+=2){
      if(Math.hypot(x,z)>radius*(.91+random()*.15))continue;
      const px=x+(random()-.5)*1.1,pz=z+(random()-.5)*1.1,py=y+(random()-.5)*1.5;
      for(let n=0;n<55;n++){
        const angle=random()*Math.PI*2,v=random()*2-1,r=Math.sqrt(1-v*v)*Math.cbrt(random()),size=.65+random()*.4;
        sprays.push({x:px+Math.cos(angle)*r*1.45,y:py+v*1.25,z:pz+Math.sin(angle)*r*1.45,
          size,yaw:random()*Math.PI*2,tilt:random()*Math.PI,tint:palette[Math.floor(random()*palette.length)]});
      }
    }
  }
  const limbs=new THREE.InstancedMesh(stemGeometry,bark,stems.length);limbs.name=spec.name+' trunk and limbs';
  stems.forEach((matrix,i)=>limbs.setMatrixAt(i,matrix));limbs.castShadow=true;limbs.receiveShadow=true;group.add(limbs);
  const crown=new THREE.InstancedMesh(leafGeometry,foliage,sprays.length);crown.name=spec.name+' lobed leaves';
  sprays.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.tilt,p.yaw,0);dummy.scale.setScalar(p.size);dummy.updateMatrix();crown.setMatrixAt(i,dummy.matrix);colour.setHex(p.tint);crown.setColorAt(i,colour);});
  crown.castShadow=true;crown.receiveShadow=true;addFoliageLevels(THREE,group,crown);
  placeTreeCopies(THREE,trees,group,KML_OAK_TREES,'oakTree');
}
