import {addFoliageLevels,placeTreeCopies} from './tree-templates.mjs';
import {KML_BEECH_TREES} from './kml-tree-data.mjs';
// img1.jpg and img1-loc.png: the two yellow crosses on the front lawns.
// Positions and mature crown dimensions are estimates from the marked view.
export const FRONT_LAWN_TREES=Object.freeze([
  {name:'East front lawn mature beech',x:13,z:61,height:19.5,radius:8.6,seed:1901,copper:true},
  {name:'West front lawn mature beech',x:-13,z:62,height:18,radius:7.7,seed:1902,copper:false}
]);
export const FRONT_LAWN_TREE_VIEW=Object.freeze({position:[27,1.8,27],target:[-4,7.7,61],fov:54});

// The mapped beeches reuse the front-lawn model, without moving the photo trees.
export function addBeechTrees(THREE,trees){
  const wood=new THREE.MeshStandardMaterial({color:0x554a3d,roughness:1});
  // Small pointed leaves on a twig, generated locally as an opaque cutout.
  // Instanced sprays retain fine edges without hundreds of thousands of solids.
  const resolution=128,pixels=new Uint8Array(resolution*resolution*4),spray=[];
  for(let row=0;row<5;row++)for(const side of [-1,1])spray.push({x:side*.26,y:-.69+row*.31,a:Math.atan2(.48,side*.8),length:.33,width:.14});
  spray.push({x:0,y:.8,a:Math.PI/2,length:.22,width:.13});
  for(let py=0;py<resolution;py++)for(let px=0;px<resolution;px++){
    const x=px/(resolution-1)*2-1,y=py/(resolution-1)*2-1,index=(py*resolution+px)*4;
    let shade=0;
    if(Math.abs(x-.018*Math.sin(y*8))<.014&&y>-.92&&y<.85)shade=115;
    for(const leaf of spray){
      const dx=x-leaf.x,dy=y-leaf.y,c=Math.cos(leaf.a),t=Math.sin(leaf.a);
      const along=(dx*c+dy*t)/leaf.length,across=(-dx*t+dy*c)/leaf.width;
      if(Math.abs(along)<1&&Math.abs(across)<Math.cos(along*Math.PI/2)){
        shade=205+Math.floor(35*(1-Math.abs(across)))+Math.sin(px*12.7+py*4.1)*10;
        if(Math.abs(across)<.04)shade+=12;
      }
    }
    if(shade){pixels[index]=pixels[index+1]=pixels[index+2]=shade;pixels[index+3]=255;}
  }
  const leafTexture=new THREE.DataTexture(pixels,resolution,resolution);leafTexture.colorSpace=THREE.SRGBColorSpace;
  leafTexture.generateMipmaps=true;leafTexture.minFilter=THREE.LinearMipmapLinearFilter;leafTexture.magFilter=THREE.LinearFilter;leafTexture.needsUpdate=true;
  const foliage=new THREE.MeshStandardMaterial({color:0xffffff,map:leafTexture,alphaTest:.45,roughness:1,side:THREE.DoubleSide});
  const stemGeometry=new THREE.CylinderGeometry(1,1,1,7);
  const leafGeometry=new THREE.PlaneGeometry(2,2,1,2);
  const positions=leafGeometry.attributes.position;
  for(let i=0;i<positions.count;i++)positions.setZ(i,.12*(1-Math.abs(positions.getY(i))));
  leafGeometry.computeVertexNormals();
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),colour=new THREE.Color();
  const copperPalette=[0x494032,0x584a37,0x66583f,0x716149,0x505039],greenPalette=[0x3e492e,0x50583a,0x626142,0x485033,0x6a6547];
  let template;
  {const spec=FRONT_LAWN_TREES[0];
    const group=new THREE.Group();group.name=spec.name;group.position.set(spec.x,.16,spec.z);template=group;
    let seed=spec.seed;
    const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
    const stems=[],leaves=[];
    const palette=copperPalette;
    function branch(a,b,radius,tip=radius*.64){
      const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
      // Separate tapered segments give trunks and limbs their narrowing profile.
      for(let n=0;n<3;n++){
        const centre=start.clone().addScaledVector(delta,(n+.5)/3),r=radius+(tip-radius)*(n+.5)/3;
        dummy.position.copy(centre);dummy.quaternion.setFromUnitVectors(up,delta.clone().normalize());dummy.scale.set(r,delta.length()/3+.03,r);dummy.updateMatrix();stems.push(dummy.matrix.clone());
      }
    }
    // A substantial, slightly leaning trunk and low spreading root buttresses.
    branch([0,0,0],[.2,3.9,-.14],.78,.56);
    branch([.2,3.6,-.14],[-.35,8.3,.25],.58,.22);
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3+random()*.4,r=1.1+random()*.6;
      branch([Math.sin(a)*r,.05,Math.cos(a)*r],[Math.sin(a)*.3,.65,Math.cos(a)*.3],.08,.29);
    }
    for(let i=0;i<9;i++){
      const a=i*2.39996,reach=spec.radius*(.46+random()*.14),height=6.8+random()*4.6;
      const fork=[Math.sin(a)*reach,height,Math.cos(a)*reach];
      branch([.1,2.9+(i%3)*.8,0],fork,.31-(i%3)*.03,.11);
      for(let j=0;j<3;j++){
        const angle=a+(j-1)*.48;
        branch(fork,[Math.sin(angle)*reach*1.3,height+1.5+random()*1.7,Math.cos(angle)*reach*1.3],.105,.025);
      }
    }
    // Overlapping irregular tufts form a full, broad lower crown and a rounded
    // top. Small leaf sprays break up the outline and hang below outer limbs.
    const bands=[.61,.85,.94,.9,.77,.58,.32];
    for(let tier=0;tier<bands.length;tier++){
      const y=4.6+tier*(spec.height-6.1)/6,radius=spec.radius*bands[tier],spacing=1.9;
      for(let x=-radius;x<=radius;x+=spacing)for(let z=-radius;z<=radius;z+=spacing){
        if(Math.hypot(x,z)>radius*(.93+random()*.13))continue;
        const px=x+(random()-.5)*1.1,pz=z+(random()-.5)*1.1;
        const py=y+(random()-.5)*1.3;
        const sx=.97+random()*.57,sy=.96+random()*.59,sz=.95+random()*.61;
        for(let n=0;n<62;n++){
          const a=random()*Math.PI*2,v=random()*2-1,r=Math.sqrt(1-v*v),depth=Math.cbrt(random()),s=.55+random()*.4;
          leaves.push({x:px+Math.cos(a)*r*sx*depth,y:py+v*sy*depth,z:pz+Math.sin(a)*r*sz*depth,sx:s,sy:s,sz:s,tint:palette[Math.floor(random()*palette.length)],angle:random()*Math.PI*2,tilt:random()*Math.PI});
        }
      }
    }
    const limbs=new THREE.InstancedMesh(stemGeometry,wood,stems.length);limbs.name=spec.name+' trunk and branches';
    stems.forEach((matrix,i)=>limbs.setMatrixAt(i,matrix));limbs.castShadow=true;limbs.receiveShadow=true;group.add(limbs);
    for(const [name,items,geometry] of [['leaf sprays',leaves,leafGeometry]]){
      const batch=new THREE.InstancedMesh(geometry,foliage,items.length);batch.name=spec.name+' '+name;
      items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.tilt??0,p.angle,(p.angle*.37)%1);dummy.scale.set(p.sx,p.sy,p.sz);dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);colour.setHex(p.tint);batch.setColorAt(i,colour);});
      batch.castShadow=true;batch.receiveShadow=true;addFoliageLevels(THREE,group,batch);
    }
  }
  placeTreeCopies(THREE,trees,template,[...FRONT_LAWN_TREES,...KML_BEECH_TREES],'beechTree',(group,spec)=>{
    if(spec.copper)return;
    // Preserve the photographed copper/green distinction on the shared shape.
    group.traverse(batch=>{
      if(!batch.instanceColor)return;
      batch.instanceColor=batch.instanceColor.clone();
      for(let i=0;i<batch.count;i++){
        batch.getColorAt(i,colour);const index=copperPalette.indexOf(colour.getHex());
        colour.setHex(greenPalette[index]);batch.setColorAt(i,colour);
      }
    });
  });
  for(const tree of trees.children){
    if(FRONT_LAWN_TREES.some(spec=>spec.name===tree.name))tree.userData.frontLawnTree={...tree.userData.beechTree};
  }
}
