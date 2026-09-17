import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

// Compile opaque, stationary siblings into local material batches. Keep the
// named originals for inspection and texture updates, but submit only the batch.
// Parent boundaries retain layout visibility; cells retain useful view culling.
// This render-only optimisation belongs to aerial mode, not walking collisions.
export function batchAerialMeshes(THREE,root,{exclude=[],cellSize=64}={}){
  const excluded=new Set(exclude),stats={sourceMeshes:0,batches:0};
  const centre=new THREE.Vector3();
  function visit(parent){
    if(excluded.has(parent))return;
    const groups=new Map();
    for(const mesh of [...parent.children]){
      if(excluded.has(mesh)||mesh.userData.aerialBatchSource||mesh.userData.aerialBatch)continue;
      if(mesh.children.length){visit(mesh);continue;}
      const g=mesh.geometry,m=mesh.material;
      if(!mesh.isMesh||mesh.isInstancedMesh||mesh.isSkinnedMesh||!mesh.visible||Array.isArray(m)||m.transparent||
        g.drawRange.start!==0||g.drawRange.count!==Infinity||Object.keys(g.morphAttributes).length)continue;
      mesh.updateMatrix();
      // Reflections need reversed winding and retain their original mesh.
      if(mesh.matrix.determinant()<=0)continue;
      if(!g.boundingBox)g.computeBoundingBox();
      g.boundingBox.getCenter(centre).applyMatrix4(mesh.matrix);
      const attributes=Object.keys(g.attributes).sort().map(name=>{
        const a=g.attributes[name];return `${name}:${a.itemSize}:${a.normalized}:${a.array.constructor.name}`;
      }).join(',');
      const key=[m.id,mesh.castShadow,mesh.receiveShadow,mesh.renderOrder,mesh.layers.mask,mesh.frustumCulled,
        Boolean(g.index),attributes,Math.floor(centre.x/cellSize),Math.floor(centre.z/cellSize)].join('|');
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(mesh);
    }
    for(const meshes of groups.values()){
      if(meshes.length<2)continue;
      const parts=meshes.map(mesh=>mesh.geometry.clone().applyMatrix4(mesh.matrix));
      const geometry=mergeGeometries(parts);
      for(const part of parts)part.dispose();
      if(!geometry)continue;
      geometry.computeBoundingBox();geometry.computeBoundingSphere();
      const first=meshes[0],batch=new THREE.Mesh(geometry,first.material);
      batch.name=`Aerial batch · ${parent.name||'estate'} · ${stats.batches+1}`;
      for(const key of ['castShadow','receiveShadow','renderOrder','frustumCulled'])batch[key]=first[key];
      batch.layers.mask=first.layers.mask;batch.userData.aerialBatch=true;
      for(const mesh of meshes){mesh.visible=false;mesh.userData.aerialBatchSource=true;}
      parent.add(batch);stats.sourceMeshes+=meshes.length;stats.batches++;
    }
  }
  visit(root);return stats;
}

// The scene itself must also stop composing its unchanged matrix, otherwise it
// forces a world-matrix update through every static descendant on every frame.
// Road-label sprites retain automatic transforms as they move with the camera.
export function cacheAerialTransforms(scene){
  scene.updateMatrixWorld(true);
  scene.traverse(object=>{if(!object.isSprite&&!object.isCamera)object.matrixAutoUpdate=false;});
}
