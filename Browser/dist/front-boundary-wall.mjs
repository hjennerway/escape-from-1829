// Low weathered masonry from the supplied view looking out of Reception.
// Extents follow the two red-marked stretches in the aerial reference.
export const FRONT_WALL_VIEW=Object.freeze({position:[-4,8,72],target:[-10,.7,49],fov:55});

export function addFrontBoundaryWall(THREE,{model,material,worldUV}){
  const wall=new THREE.Group();wall.name='Front boundary wall';model.add(wall);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const g=canvas.getContext('2d');g.fillStyle='#827c6c';g.fillRect(0,0,512,512);
  let seed=1949;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let row=0;row<8;row++)for(let col=-1;col<5;col++){
    const shade=Math.floor(random()*24);
    g.fillStyle=`rgb(${125+shade},${120+shade},${102+shade})`;
    g.fillRect(col*128+(row%2)*64+2,row*64+2,124,60);
  }
  for(let i=0;i<10000;i++){
    g.fillStyle=i%2?'#39433520':'#e1dbc620';g.fillRect(random()*512,random()*512,2,2);
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=4;
  const masonry=material(0xffffff,{map:texture}),coping=material(0xb4ae98);
  function block(name,mat,x,y,z,w,h,d){
    const geometry=worldUV(new THREE.BoxGeometry(w,h,d),2.4);
    const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.name=name;
    m.castShadow=m.receiveShadow=true;wall.add(m);
  }
  // Keep the 3.2-unit entrance path open, with space beside the end piers.
  for(const [label,left,right] of [['West',-58,-2.4],['East',2.4,31]]){
    block(label+' low boundary masonry',masonry,(left+right)/2,.61,49,right-left,.94,.62);
    const count=Math.ceil((right-left)/1.5),width=(right-left)/count;
    for(let i=0;i<count;i++)block(label+' boundary coping '+i,coping,left+(i+.5)*width,1.15,49,width-.016,.14,.76);
    for(const x of [left+.4,right-.4]){
      block(label+' boundary end pier',masonry,x,.69,49,.8,1.1,.8);
      block(label+' boundary pier cap',coping,x,1.31,49,.92,.14,.92);
    }
  }
  return wall;
}
