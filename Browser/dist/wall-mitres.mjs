// Join thin rectangular wall runs before batching. Each pair shares a diagonal
// cut, with no hidden end caps or overlapping top faces. Free ends stay square.
export function mitreRightAngleWalls(THREE,meshes){
  const epsilon=1e-5;
  const runs=meshes.map(mesh=>{
    const p=mesh.geometry.parameters;
    if(mesh.geometry.type!=='BoxGeometry'||!p)throw new Error('Wall mitres require box wall sources');
    mesh.updateMatrix();
    const alongX=p.width>=p.depth,length=alongX?p.width:p.depth,width=alongX?p.depth:p.width;
    const axis=new THREE.Vector3(alongX?1:0,0,alongX?0:1).transformDirection(mesh.matrix);
    const normal=new THREE.Vector3(-axis.z,0,axis.x);
    const center=new THREE.Vector3().applyMatrix4(mesh.matrix);
    const ends=[-1,1].map(sign=>({sign,point:center.clone().addScaledVector(axis,sign*length/2),neighbour:null}));
    return {mesh,alongX,length,width,axis,normal,center,ends,bottom:center.y-p.height/2,top:center.y+p.height/2};
  });
  for(const run of runs)for(const end of run.ends){
    const matches=[];
    for(const other of runs){
      if(other===run||other.mesh.parent!==run.mesh.parent||other.mesh.material!==run.mesh.material||
        Math.abs(other.bottom-run.bottom)>epsilon||Math.abs(other.top-run.top)>epsilon||
        Math.abs(other.axis.dot(run.axis))>epsilon)continue;
      for(const candidate of other.ends)if(candidate.point.distanceTo(end.point)<epsilon)matches.push({run:other,end:candidate});
    }
    if(matches.length>1)throw new Error('Ambiguous right-angle wall junction: '+run.mesh.name);
    end.neighbour=matches[0]??null;
  }
  for(const run of runs){
    if(!run.ends.some(e=>e.neighbour))continue;
    const {mesh,axis,normal,width,length}=run,inverse=mesh.matrix.clone().invert();
    const outline=run.ends.map(end=>[-1,1].map(side=>{
      const p=end.point.clone().addScaledVector(normal,side*width/2),other=end.neighbour;
      if(other){
        const outgoing=other.run.axis.clone().multiplyScalar(-other.end.sign);
        p.addScaledVector(axis,-end.sign*normal.dot(outgoing)*side*other.run.width/2);
      }
      return p.applyMatrix4(inverse);
    }));
    const old=mesh.geometry,source=old.index?old.toNonIndexed():old;
    const positions=[],normals=[],uv=[],p=source.attributes.position,n=source.attributes.normal,t=source.attributes.uv;
    for(let i=0;i<p.count;i+=3){
      const cap=run.alongX?n.getX(i):n.getZ(i);
      if(Math.abs(cap)>.99&&run.ends[cap<0?0:1].neighbour)continue;
      for(let j=i;j<i+3;j++){
        const original=new THREE.Vector3().fromBufferAttribute(p,j),parent=original.clone().applyMatrix4(mesh.matrix);
        const endIndex=(run.alongX?original.x:original.z)<0?0:1;
        const side=parent.sub(run.center).dot(normal)<0?0:1;
        const corner=outline[endIndex][side];positions.push(corner.x,original.y,corner.z);
        normals.push(n.getX(j),n.getY(j),n.getZ(j));uv.push(t.getX(j),t.getY(j));
      }
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
    geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    mesh.geometry=geometry;
    mesh.userData.collisionFootprint=[outline[0][0],outline[1][0],outline[1][1],outline[0][1]].map(p=>[p.x,p.z]);
    // Keep the original centre lines for independent geometry/compiled audits.
    mesh.userData.wallMitre={width,length,alongX:run.alongX,joined:run.ends.map(e=>!!e.neighbour)};
    if(source!==old)source.dispose();old.dispose();
  }
  return meshes;
}
