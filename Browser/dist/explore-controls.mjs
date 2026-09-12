// Ground-level exterior navigation, shared by the page and headless checks.
export function createWalker(camera,obstacles=[]){
  const keys=new Set();let yaw=0,pitch=0;
  camera.rotation.order='YXZ';
  function reset(){keys.clear();yaw=0;pitch=0;camera.position.set(0,1.8,40);camera.rotation.set(0,0,0);}
  function clear(x,z){return Math.abs(x)<180&&z>-170&&z<100&&!obstacles.some(b=>x>b.minX-.4&&x<b.maxX+.4&&z>b.minZ-.4&&z<b.maxZ+.4);}
  reset();
  return {keys,reset,
    look(dx,dy){yaw-=dx*.002;pitch=Math.max(-1.45,Math.min(1.45,pitch-dy*.002));camera.rotation.set(pitch,yaw,0);},
    update(dt){
      const side=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),forward=Number(keys.has('KeyW'))-Number(keys.has('KeyS'));
      const distance=Math.min(Math.max(dt,0),.1)*(keys.has('ShiftLeft')||keys.has('ShiftRight')?12:5),n=Math.hypot(side,forward)||1;
      const dx=(Math.cos(yaw)*side-Math.sin(yaw)*forward)*distance/n,dz=(-Math.sin(yaw)*side-Math.cos(yaw)*forward)*distance/n;
      const steps=Math.max(1,Math.ceil(distance/.15));
      for(let i=0;i<steps;i++){if(clear(camera.position.x+dx/steps,camera.position.z))camera.position.x+=dx/steps;if(clear(camera.position.x,camera.position.z+dz/steps))camera.position.z+=dz/steps;}
    }
  };
}

// Use the rendered building foundations and tree trunks, so later estate
// edits also update walking collisions without a second footprint definition.
export function exteriorObstacles(THREE,model){
  model.updateMatrixWorld(true);const obstacles=[],matrix=new THREE.Matrix4(),world=new THREE.Matrix4();
  function add(geometry,transform){
    geometry.computeBoundingBox();const b=geometry.boundingBox.clone().applyMatrix4(transform);
    if(b.min.y<1.8&&b.max.y>.5&&b.max.y-b.min.y>.6&&b.max.x-b.min.x>.25&&b.max.z-b.min.z>.25)
      obstacles.push({minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z});
  }
  model.traverse(o=>{if(!o.isMesh)return;if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);world.multiplyMatrices(o.matrixWorld,matrix);add(o.geometry,world);}}else add(o.geometry,o.matrixWorld);});
  return obstacles;
}
