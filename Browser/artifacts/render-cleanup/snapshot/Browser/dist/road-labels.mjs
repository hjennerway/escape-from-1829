// Camera-facing, fixed-pixel-size map labels, anchored to saved road centrelines.
export function createRoadLabel(THREE,name,points){
  const canvas=document.createElement('canvas'),context=canvas.getContext('2d');
  context.font='600 28px Arial';canvas.width=Math.ceil(context.measureText(name).width)+16;canvas.height=44;
  context.font='600 28px Arial';context.textAlign='center';context.textBaseline='middle';
  context.lineJoin='round';context.lineWidth=6;context.strokeStyle='#17231ee8';context.fillStyle='#fff9e6';
  context.strokeText(name,canvas.width/2,22);context.fillText(name,canvas.width/2,22);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
  const material=new THREE.SpriteMaterial({map:texture,sizeAttenuation:false,depthTest:false,depthWrite:false,toneMapped:false,fog:false});
  const label=new THREE.Sprite(material);label.name='Road label · '+name;label.renderOrder=10;
  const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1])),length=lengths.reduce((a,b)=>a+b,0);
  function pointAt(fraction){
    let distance=length*fraction;
    for(let i=0;i<lengths.length;i++){
      if(distance<=lengths[i]&&lengths[i]>0){const t=distance/lengths[i];return [points[i][0]+(points[i+1][0]-points[i][0])*t,1,points[i][1]+(points[i+1][1]-points[i][1])*t];}
      distance-=lengths[i];
    }
    return [points[0][0],1,points[0][1]];
  }
  label.userData={roadName:name,aspect:canvas.width/canvas.height,length,candidates:[.5,.32,.68,.18,.82,.08,.92].map(pointAt)};
  label.position.set(...label.userData.candidates[0]);return label;
}

// Prefer clear positions along each road; short roads get first choice.
// If the view is too crowded, retain every in-view label at its least-overlapping position.
export function updateRoadLabels(THREE,roads,camera,width,height){
  for(let p=roads;p;p=p.parent)if(!p.visible)return;
  camera.updateMatrixWorld();roads.updateWorldMatrix(true,true);
  const labels=roads.children.filter(road=>road.visible).map(road=>road.getObjectByName('Road label · '+road.name)).filter(Boolean).sort((a,b)=>a.userData.length-b.userData.length);
  const placed=[],point=new THREE.Vector3(),pixelHeight=20,scale=2*Math.tan(camera.fov*Math.PI/360)*pixelHeight/height;
  for(const label of labels){
    const pixelWidth=pixelHeight*label.userData.aspect;label.scale.set(scale*label.userData.aspect,scale,1);
    let best=null;
    for(const candidate of label.userData.candidates){
      point.set(...candidate).applyMatrix4(label.parent.matrixWorld).project(camera);
      if(point.z<-1||point.z>1)continue;
      const x=(point.x+1)*width/2,y=(1-point.y)*height/2;
      if(x<0||x>width||y<0||y>height)continue;
      const rect={left:x-pixelWidth/2-3,right:x+pixelWidth/2+3,top:y-pixelHeight/2-3,bottom:y+pixelHeight/2+3};
      const overlap=placed.reduce((total,r)=>total+Math.max(0,Math.min(rect.right,r.right)-Math.max(rect.left,r.left))*Math.max(0,Math.min(rect.bottom,r.bottom)-Math.max(rect.top,r.top)),0);
      const clipped=Math.max(0,-rect.left)+Math.max(0,rect.right-width)+Math.max(0,-rect.top)+Math.max(0,rect.bottom-height),score=overlap+clipped*1000;
      if(!best||score<best.score)best={candidate,rect,score};
      if(score===0)break;
    }
    label.visible=Boolean(best);
    if(best){label.position.set(...best.candidate);placed.push(best.rect);}
  }
}
