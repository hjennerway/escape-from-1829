// Ground-level exterior navigation, shared by the page and headless checks.
// Distance to the actual rotated footprint, rather than its enclosing rectangle.
export function obstacleContains(b,x,z,padding=.4){
  if(x<=b.minX-padding||x>=b.maxX+padding||z<=b.minZ-padding||z>=b.maxZ+padding)return false;
  if(!b.corners)return true;
  let inside=false;
  for(let i=0,j=b.corners.length-1;i<b.corners.length;j=i++){
    const a=b.corners[j],c=b.corners[i],dx=c[0]-a[0],dz=c[1]-a[1];
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));
    if(Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<padding)return true;
    if((a[1]>z)!==(c[1]>z)&&x<(c[0]-a[0])*(z-a[1])/(c[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}

// Index padded bounds once; keep the exact polygon checks for nearby obstacles.
// Including the padding here also covers collisions across cell boundaries.
export function createObstacleIndex(obstacles,cellSize=12,padding=.4){
  const cells=new Map();
  for(const obstacle of obstacles){
    const minX=Math.floor((obstacle.minX-padding)/cellSize),maxX=Math.floor((obstacle.maxX+padding)/cellSize);
    const minZ=Math.floor((obstacle.minZ-padding)/cellSize),maxZ=Math.floor((obstacle.maxZ+padding)/cellSize);
    for(let x=minX;x<=maxX;x++)for(let z=minZ;z<=maxZ;z++){
      const key=x+','+z;
      if(!cells.has(key))cells.set(key,[]);
      cells.get(key).push(obstacle);
    }
  }
  return {contains(x,z){
    const nearby=cells.get(Math.floor(x/cellSize)+','+Math.floor(z/cellSize));
    if(nearby)for(const obstacle of nearby)if(obstacleContains(obstacle,x,z,padding))return true;
    return false;
  }};
}

export function createWalker(camera,obstacles=[]){
  const keys=new Set(),defaultFov=camera.fov;let yaw=0,pitch=0,index=createObstacleIndex(obstacles);
  camera.rotation.order='YXZ';
  function reset(){keys.clear();yaw=0;pitch=0;camera.position.set(0,1.8,40);camera.rotation.set(0,0,0);camera.fov=defaultFov;camera.updateProjectionMatrix();}
  function clear(x,z){return x>-180&&x<580&&z>-245&&z<210&&!index.contains(x,z);}
  reset();
  return {keys,reset,
    setObstacles(obstacles){index=createObstacleIndex(obstacles);},
    setView({position,target,fov}){
      keys.clear();camera.position.set(...position);camera.lookAt(...target);
      yaw=camera.rotation.y;pitch=camera.rotation.x;
      if(fov){camera.fov=fov;camera.updateProjectionMatrix();}
    },
    look(dx,dy){yaw-=dx*.002;pitch=Math.max(-1.45,Math.min(1.45,pitch-dy*.002));camera.rotation.set(pitch,yaw,0);},
    update(dt){
      const side=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),forward=Number(keys.has('KeyW'))-Number(keys.has('KeyS'));
      if((!side&&!forward)||dt<=0)return;
      const distance=Math.min(Math.max(dt,0),.1)*(keys.has('ShiftLeft')||keys.has('ShiftRight')?12:5),n=Math.hypot(side,forward)||1;
      const dx=(Math.cos(yaw)*side-Math.sin(yaw)*forward)*distance/n,dz=(-Math.sin(yaw)*side-Math.cos(yaw)*forward)*distance/n;
      const steps=Math.max(1,Math.ceil(distance/.15));
      for(let i=0;i<steps;i++){if(dx&&clear(camera.position.x+dx/steps,camera.position.z))camera.position.x+=dx/steps;if(dz&&clear(camera.position.x,camera.position.z+dz/steps))camera.position.z+=dz/steps;}
    }
  };
}

// Use the rendered building foundations and tree trunks, so later estate
// edits also update walking collisions without a second footprint definition.
export function exteriorObstacles(THREE,model){
  model.updateMatrixWorld(true);const obstacles=[],matrix=new THREE.Matrix4(),world=new THREE.Matrix4();
  function add(geometry,transform,oriented=false,footprint=null){
    if(!geometry.boundingBox)geometry.computeBoundingBox();const b=geometry.boundingBox.clone().applyMatrix4(transform);
    if(b.min.y<1.8&&b.max.y>.5&&b.max.y-b.min.y>.6&&b.max.x-b.min.x>.25&&b.max.z-b.min.z>.25){
      const obstacle={minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z};
      if(footprint)obstacle.corners=footprint.map(([x,z])=>{const p=new THREE.Vector3(x,0,z).applyMatrix4(transform);return [p.x,p.z];});
      else if(oriented){const a=geometry.boundingBox;obstacle.corners=[[a.min.x,a.min.z],[a.max.x,a.min.z],[a.max.x,a.max.z],[a.min.x,a.max.z]].map(([x,z])=>{const p=new THREE.Vector3(x,0,z).applyMatrix4(transform);return [p.x,p.z];});}
      obstacles.push(obstacle);
    }
  }
  model.traverseVisible(o=>{if(!o.isMesh)return;if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);world.multiplyMatrices(o.matrixWorld,matrix);add(o.geometry,world,o.userData.orientedCollision);}}else if(o.userData.collisionFootprints){
    for(const footprint of o.userData.collisionFootprints)add(o.geometry,o.matrixWorld,false,footprint);
  }else add(o.geometry,o.matrixWorld,o.userData.orientedCollision,o.userData.collisionFootprint);});
  return obstacles;
}
