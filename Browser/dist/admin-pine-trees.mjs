import {addFoliageLevels,placeTreeCopies} from './tree-templates.mjs';
import {KML_PINE_TREES} from './kml-tree-data.mjs';
// Pine1–Pine13 replace every earlier screenshot-derived pine position.
export const ADMIN_PINE_TREES=KML_PINE_TREES;

export function addAdminPineTrees(THREE,trees){
  const bark=new THREE.MeshStandardMaterial({color:0x65513d,roughness:1});
  const branchGeometry=new THREE.CylinderGeometry(.56,1,1,7);
  const trunkGeometry=new THREE.CylinderGeometry(.06,1,1,10,6);
  // Opaque needle cutouts give the boughs fine edges in walking views. Shared
  // textures and instanced sprays keep the thirteen mature crowns light.
  const resolution=128,pixels=new Uint8Array(resolution*resolution*4),needles=[];
  for(let row=0;row<15;row++)for(const side of [-1,1]){
    const y=-.85+row*.108,length=.34+.22*Math.sin(row/15*Math.PI);
    needles.push([0,y,side*length,y+.27+(row%3)*.035]);
    needles.push([0,y+.025,side*length*.76,y+.39]);
  }
  needles.push([0,-.94,0,.98]);
  for(let py=0;py<resolution;py++)for(let px=0;px<resolution;px++){
    const x=px/(resolution-1)*2-1,y=py/(resolution-1)*2-1;
    let covered=false;
    for(const [ax,ay,bx,by] of needles){
      const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
      if(Math.hypot(x-ax-t*dx,y-ay-t*dy)<.013*(1-.45*t)){covered=true;break;}
    }
    if(covered){const i=(py*resolution+px)*4,shade=195+Math.floor(45*(y+1)/2);pixels[i]=pixels[i+1]=pixels[i+2]=shade;pixels[i+3]=255;}
  }
  const texture=new THREE.DataTexture(pixels,resolution,resolution);texture.colorSpace=THREE.SRGBColorSpace;
  texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.needsUpdate=true;
  const foliage=new THREE.MeshStandardMaterial({color:0xffffff,map:texture,alphaTest:.32,roughness:1,side:THREE.DoubleSide});
  const sprayGeometry=new THREE.PlaneGeometry(2,2,1,2),positions=sprayGeometry.attributes.position;
  for(let i=0;i<positions.count;i++)positions.setZ(i,.18*(1-Math.abs(positions.getY(i))));
  sprayGeometry.computeVertexNormals();
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),colour=new THREE.Color();
  const palette=[0x344c36,0x405a3d,0x4a6343,0x3c5744,0x536a46];
  let template;
  {const spec=ADMIN_PINE_TREES[0];
    const group=new THREE.Group();group.name=spec.name;group.position.set(spec.x,-.12,spec.z);
    template=group;
    let seed=spec.seed;
    const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
    const trunkRadius=.72+random()*.14,trunk=new THREE.Mesh(trunkGeometry,bark);
    trunk.name=spec.name+' trunk';trunk.position.y=spec.height/2;trunk.scale.set(trunkRadius,spec.height,trunkRadius);
    trunk.castShadow=true;trunk.receiveShadow=true;group.add(trunk);
    const branches=[],sprays=[];
    function branch(a,b,radius){
      const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
      dummy.position.copy(start).addScaledVector(delta,.5);dummy.quaternion.setFromUnitVectors(up,delta.clone().normalize());
      dummy.scale.set(radius,delta.length(),radius);dummy.updateMatrix();branches.push(dummy.matrix.clone());
    }
    function tuft(x,y,z,size){
      for(let n=0;n<18;n++){
        const angle=random()*Math.PI*2,v=random()*2-1,r=Math.sqrt(1-v*v)*Math.cbrt(random());
        sprays.push({x:x+Math.cos(angle)*r*size,y:y+v*size*.55,z:z+Math.sin(angle)*r*size,
          size:size*(.62+random()*.32),yaw:random()*Math.PI*2,tilt:random()*Math.PI,tint:palette[Math.floor(random()*palette.length)]});
      }
    }
    // A clear lower trunk, irregular branch whorls, and a narrow growing tip.
    // Each bough rises at its end and carries several clusters of needles.
    for(let tier=0;tier<11;tier++){
      const t=tier/10,y=spec.height*(.27+.68*t);
      const reach=spec.radius*Math.pow(1-t,.72)*(tier===0?.74:1),count=tier<8?7:5;
      for(let n=0;n<count;n++){
        const angle=n*Math.PI*2/count+tier*2.39996+random()*.38,length=reach*(.84+random()*.2);
        const dx=Math.sin(angle),dz=Math.cos(angle),tipY=y+.4+random()*.65;
        branch([0,y-.25,0],[dx*length,tipY,dz*length],(.16*(1-t)+.035));
        for(let part=1;part<=4;part++){
          const fraction=part/4,side=(random()-.5)*.5,px=dx*length*fraction+dz*side,pz=dz*length*fraction-dx*side;
          tuft(px,y+(tipY-y)*fraction,pz,(1.05-.5*t)*(part===4?.9:1.12));
          if(part===2||part===3){
            const sideAngle=angle+(part===2?-.48:.48),forkLength=length*(fraction+.12);
            const end=[Math.sin(sideAngle)*forkLength,y+.5,Math.cos(sideAngle)*forkLength];
            branch([px,y,pz],end,.045*(1-t)+.015);tuft(...end,.8-.3*t);
          }
        }
      }
      tuft(0,y+.45,0,1.15-.5*t);
    }
    const limbs=new THREE.InstancedMesh(branchGeometry,bark,branches.length);limbs.name=spec.name+' boughs';
    branches.forEach((matrix,i)=>limbs.setMatrixAt(i,matrix));limbs.castShadow=true;limbs.receiveShadow=true;group.add(limbs);
    const crown=new THREE.InstancedMesh(sprayGeometry,foliage,sprays.length);crown.name=spec.name+' needles';
    sprays.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.tilt,p.yaw,0);dummy.scale.setScalar(p.size);dummy.updateMatrix();crown.setMatrixAt(i,dummy.matrix);colour.setHex(p.tint);crown.setColorAt(i,colour);});
    crown.castShadow=true;crown.receiveShadow=true;addFoliageLevels(THREE,group,crown);
  }
  placeTreeCopies(THREE,trees,template,ADMIN_PINE_TREES,'adminPineTree');
}
