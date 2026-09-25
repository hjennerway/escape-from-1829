import {prepareWindowLights} from './window-lights.mjs';
const controllers=new WeakMap();

// Aerial-only window LOD. Bake the existing rectangular panes, frames and sills
// into shared atlas tiles; keep the actual walls, roofs and special openings.
// Source meshes remain intact in the close level, including their shadow flags.
export function createBuildingDetail(THREE,root,{exclude=[],shadowLight=null}={}){
  if(controllers.has(root))return controllers.get(root);
  prepareWindowLights(THREE,root);
  const excluded=new Set(exclude),entries=[],patterns=new Map(),pages=[];
  const stats={windows:0,parts:0,groups:0,patterns:0,atlasPages:0};
  const cellSize=4,tileW=72,tileH=104,padding=4,imageW=64,imageH=96,atlasSize=1024,columns=14,rows=9;
  const matrix=new THREE.Matrix4(),local=new THREE.Matrix4(),size=new THREE.Vector3(),colour=new THREE.Color();
  root.updateWorldMatrix(true,true);

  function atlasTile(parts,bounds){
    const commands=parts.slice().sort((a,b)=>a.n+a.d/2-b.n-b.d/2).map(p=>[
      (p.u-p.w/2-bounds.minU)/bounds.w*imageW,(p.y-p.h/2-bounds.minY)/bounds.h*imageH,
      p.w/bounds.w*imageW,p.h/bounds.h*imageH,p.box.source.material.color.getHex(),p.box.pane?1:0
    ]);
    const key=JSON.stringify(commands.map(c=>c.map(v=>Math.round(v*100)/100)));
    if(patterns.has(key))return patterns.get(key);
    const index=patterns.size,pageIndex=Math.floor(index/(columns*rows)),slot=index%(columns*rows);
    if(!pages[pageIndex]){
      const pixels=new Uint8Array(atlasSize*atlasSize*4),texture=new THREE.DataTexture(pixels,atlasSize,atlasSize);
      texture.name='Distant window atlas '+pageIndex;texture.colorSpace=THREE.SRGBColorSpace;
      texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
      const material=new THREE.MeshStandardMaterial({map:texture,alphaTest:.15,roughness:.8,metalness:.05,side:THREE.DoubleSide});
      const emission=new Uint8Array(atlasSize*atlasSize*4),emissiveMap=new THREE.DataTexture(emission,atlasSize,atlasSize);
      emissiveMap.name='Distant window glass mask '+pageIndex;
      emissiveMap.generateMipmaps=true;emissiveMap.minFilter=THREE.LinearMipmapLinearFilter;
      material.emissiveMap=emissiveMap;material.userData.nightWindowGlass=true;
      pages.push({pixels,texture,material,emission,emissiveMap});
    }
    const page=pages[pageIndex],ox=slot%columns*tileW+padding,oy=Math.floor(slot/columns)*tileH+padding;
    for(const [x,y,w,h,hex,glass] of commands){
      const rgb=[hex>>16&255,hex>>8&255,hex&255];
      for(let py=Math.max(0,Math.floor(y));py<Math.min(imageH,Math.ceil(y+h));py++)for(let px=Math.max(0,Math.floor(x));px<Math.min(imageW,Math.ceil(x+w));px++){
        const cover=Math.max(0,Math.min(px+1,x+w)-Math.max(px,x))*Math.max(0,Math.min(py+1,y+h)-Math.max(py,y));
        const offset=((oy+py)*atlasSize+ox+px)*4,oldAlpha=page.pixels[offset+3]/255,alpha=cover+oldAlpha*(1-cover);
        if(!alpha)continue;
        for(let c=0;c<3;c++)page.pixels[offset+c]=(rgb[c]*cover+page.pixels[offset+c]*oldAlpha*(1-cover))/alpha;
        page.pixels[offset+3]=alpha*255;
        for(let c=0;c<3;c++)page.emission[offset+c]=(255*glass*cover+page.emission[offset+c]*oldAlpha*(1-cover))/alpha;
        page.emission[offset+3]=alpha*255;
      }
    }
    const tile={page:pageIndex,u0:ox/atlasSize,v0:oy/atlasSize,u1:(ox+imageW)/atlasSize,v1:(oy+imageH)/atlasSize};
    patterns.set(key,tile);return tile;
  }

  function boxesFor(source){
    const g=source.geometry,m=source.material;
    if(!source.isMesh||source.isSkinnedMesh||source.children.length||!source.visible||g.type!=='BoxGeometry'||
      Array.isArray(m)||m.transparent||m.map||source.instanceColor||source.layers.mask!==1||source.renderOrder!==0||g.drawRange.count!==Infinity||g.index?.count!==36)return [];
    if(!g.boundingBox)g.computeBoundingBox();
    g.boundingBox.getSize(size);
    // Do not interpret altered/rotated box vertices as an ordinary cuboid.
    const p=g.parameters;
    if(Math.abs(size.x-p.width)+Math.abs(size.y-p.height)+Math.abs(size.z-p.depth)>.0001||g.boundingBox.getCenter(new THREE.Vector3()).length()>.0001)return [];
    source.updateMatrix();const result=[];
    for(let index=0;index<(source.isInstancedMesh?source.count:1);index++){
      if(source.isInstancedMesh){source.getMatrixAt(index,local);matrix.multiplyMatrices(source.matrix,local);}else matrix.copy(source.matrix);
      if(matrix.determinant()<=0)continue;
      const axes=[0,1,2].map(i=>new THREE.Vector3().setFromMatrixColumn(matrix,i)),dimensions=axes.map((a,i)=>a.length()*size.getComponent(i));
      axes.forEach(a=>a.normalize());
      if(Math.abs(axes[1].y)<.99999||dimensions[1]>6||dimensions[1]<.015||Math.min(dimensions[0],dimensions[2])>.5)continue;
      const axis=dimensions[0]<dimensions[2]?0:2,w=dimensions[axis===0?2:0],d=dimensions[axis],h=dimensions[1];
      if(w>6)continue;
      const centre=new THREE.Vector3().setFromMatrixPosition(matrix);
      // Glass materials identify openings without guessing from mesh names.
      const pane=m.metalness>=.08&&m.roughness<.8&&d<=.18&&w>=.4&&h>=.4;
      result.push({source,index,centre,axes,dimensions,axis,w,h,d,pane,used:false});
    }
    return result;
  }

  function subset(source,keep){
    if(!keep.length)return null;
    if(!source.isInstancedMesh)return source.clone(false);
    const copy=new THREE.InstancedMesh(source.geometry,source.material,keep.length);
    copy.name=source.name+' · reduced detail';copy.position.copy(source.position);copy.quaternion.copy(source.quaternion);copy.scale.copy(source.scale);
    copy.castShadow=source.castShadow;copy.receiveShadow=source.receiveShadow;copy.layers.mask=source.layers.mask;copy.renderOrder=source.renderOrder;
    keep.forEach((index,i)=>{source.getMatrixAt(index,local);copy.setMatrixAt(i,local);if(source.instanceColor){source.getColorAt(index,colour);copy.setColorAt(i,colour);}});
    const ids=source.geometry.attributes.nightWindowId;
    if(ids){copy.geometry=source.geometry.clone();copy.geometry.setAttribute('nightWindowId',new THREE.InstancedBufferAttribute(new Float32Array(keep.map(i=>ids.getX(i))),1));}
    copy.computeBoundingSphere();return copy;
  }

  function visit(parent){
    if(excluded.has(parent))return;
    const children=[...parent.children],boxes=[],bySource=new Map(),grid=new Map();
    for(const child of children){
      if(excluded.has(child))continue;
      if(child.children.length){visit(child);continue;}
      const list=boxesFor(child);if(list.length){boxes.push(...list);bySource.set(child,list);}
    }
    const key=(x,y,z)=>`${x},${y},${z}`;
    for(const box of boxes){const c=box.centre,k=key(Math.floor(c.x/cellSize),Math.floor(c.y/cellSize),Math.floor(c.z/cellSize));if(!grid.has(k))grid.set(k,[]);grid.get(k).push(box);}
    const windows=[];
    for(const pane of boxes.filter(b=>b.pane)){
      if(pane.used)continue;
      const normal=pane.axes[pane.axis].clone(),tangent=new THREE.Vector3(normal.z,0,-normal.x),parts=[];
      const reach=Math.max(pane.w,pane.h)/2+.8,c=pane.centre;
      for(let x=Math.floor((c.x-reach)/cellSize);x<=Math.floor((c.x+reach)/cellSize);x++)for(let y=Math.floor((c.y-reach)/cellSize);y<=Math.floor((c.y+reach)/cellSize);y++)for(let z=Math.floor((c.z-reach)/cellSize);z<=Math.floor((c.z+reach)/cellSize);z++)for(const box of grid.get(key(x,y,z))??[]){
        if(box.used||(box.pane&&box!==pane)||Math.max(Math.abs(normal.dot(box.axes[0])),Math.abs(normal.dot(box.axes[2])))<.99999)continue;
        const delta=box.centre.clone().sub(c),u=delta.dot(tangent),n=delta.dot(normal);
        const w=box.dimensions.reduce((sum,d,i)=>sum+Math.abs(tangent.dot(box.axes[i]))*d,0);
        const d=box.dimensions.reduce((sum,s,i)=>sum+Math.abs(normal.dot(box.axes[i]))*s,0),h=box.h;
        if(d>.5||Math.abs(n)>.38||Math.abs(u)+w/2>pane.w/2+.31||Math.abs(delta.y)+h/2>pane.h/2+.42)continue;
        parts.push({box,u,y:delta.y,n,w,h,d});
      }
      const bars=parts.filter(p=>p.w<.15||p.h<.15);
      if(parts.length<6||bars.length<3||!parts.some(p=>p.box===pane))continue;
      // Some builders place west-facing panes with an unrotated thin X box.
      // Frame offsets reveal which face is outward in either convention.
      if(bars.reduce((sum,p)=>sum+p.n,0)/bars.length<-.01){normal.negate();tangent.negate();for(const p of parts){p.u=-p.u;p.n=-p.n;}}
      const minU=Math.min(...parts.map(p=>p.u-p.w/2)),maxU=Math.max(...parts.map(p=>p.u+p.w/2));
      const minY=Math.min(...parts.map(p=>p.y-p.h/2)),maxY=Math.max(...parts.map(p=>p.y+p.h/2));
      const bounds={minU,minY,w:maxU-minU,h:maxY-minY},tile=atlasTile(parts,bounds);
      const depth=Math.max(...parts.map(p=>p.n+p.d/2))+.002;
      const ids=pane.source.geometry.attributes.nightWindowId,id=ids?.getX(pane.source.isInstancedMesh?pane.index:0)??0;
      windows.push({centre:c.clone().addScaledVector(normal,depth),normal,tangent,bounds,tile,id});
      for(const p of parts)p.box.used=true;
      stats.windows++;stats.parts+=parts.length;
    }
    if(!windows.length)return;
    const levels=[0,1,2].map(level=>{const g=new THREE.Group();g.name=`${parent.name||'Estate'} · building detail ${level}`;g.userData.buildingDetailLevel=level;g.visible=level===0;parent.add(g);return g;});
    for(const [source,parts] of bySource){
      if(!parts.some(p=>p.used))continue;
      const used=new Set(parts.filter(p=>p.used).map(p=>p.index));
      const tiny=new Set(parts.filter(p=>!p.used&&p.dimensions.slice().sort((a,b)=>a-b)[1]<.12&&Math.max(...p.dimensions)<6).map(p=>p.index));
      const remaining=Array.from({length:source.isInstancedMesh?source.count:1},(_,i)=>i).filter(i=>!used.has(i));
      levels[0].add(source);
      const mid=subset(source,remaining),far=subset(source,remaining.filter(i=>!tiny.has(i)));
      if(mid)levels[1].add(mid);if(far)levels[2].add(far);
    }
    const byPage=new Map(),worldBounds=new THREE.Box3();let windowHeight=0;
    for(const window of windows){
      const {centre,normal,tangent,bounds:b,tile,id}=window;
      if(!byPage.has(tile.page))byPage.set(tile.page,{positions:[],normals:[],uv:[],ids:[]});
      const data=byPage.get(tile.page);
      for(const [u,v] of [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]]){
        const p=centre.clone().addScaledVector(tangent,b.minU+u*b.w);p.y+=b.minY+v*b.h;
        data.positions.push(...p.toArray());data.normals.push(...normal.toArray());data.uv.push(u?tile.u1:tile.u0,v?tile.v1:tile.v0);data.ids.push(id);
        worldBounds.expandByPoint(p.applyMatrix4(parent.matrixWorld));
      }
      windowHeight=Math.max(windowHeight,b.h*new THREE.Vector3().setFromMatrixColumn(parent.matrixWorld,1).length());
    }
    for(const [page,data] of byPage){
      const geometry=new THREE.BufferGeometry();
      for(const [name,values,count] of [['position',data.positions,3],['normal',data.normals,3],['uv',data.uv,2]])geometry.setAttribute(name,new THREE.Float32BufferAttribute(values,count));
      geometry.setAttribute('nightWindowId',new THREE.Float32BufferAttribute(data.ids,1));
      geometry.computeBoundingSphere();
      for(const level of [1,2]){const mesh=new THREE.Mesh(geometry,pages[page].material);mesh.name=parent.name+' · textured windows';mesh.receiveShadow=true;mesh.userData.buildingWindowProxy=true;levels[level].add(mesh);}
    }
    entries.push({parent,levels,sphere:worldBounds.getBoundingSphere(new THREE.Sphere()),windowHeight,level:0});
  }
  visit(root);
  for(const page of pages){page.texture.needsUpdate=true;page.emissiveMap.needsUpdate=true;}
  stats.groups=entries.length;stats.patterns=patterns.size;stats.atlasPages=pages.length;
  return attachBuildingDetail(THREE,root,{entries,stats,shadowLight});
}

// The build step saves the levels and bounds; loading only restores this controller.
export function attachBuildingDetail(THREE,root,{entries,stats,shadowLight=null}){
  let enabled=true;const cameraSpace=new THREE.Vector3();
  function select(entry,level){entry.level=level;entry.levels.forEach((object,i)=>{object.visible=i===level;});}
  const controller={stats,entries,
    setEnabled(value){enabled=Boolean(value);if(!enabled)entries.forEach(entry=>select(entry,0));},
    update(camera,viewportHeight){
      // Refresh cached shadows from the full model once. Detail changes then
      // reuse those stable shadows, avoiding redraws while crossing thresholds.
      const full=!enabled||Boolean(shadowLight?.shadow.needsUpdate);
      camera.updateMatrixWorld();
      const projection=Math.abs(camera.projectionMatrix.elements[5])*viewportHeight/2;
      for(const entry of entries){
        let visible=true;for(let p=entry.parent;p;p=p.parent)if(!p.visible){visible=false;break;}
        if(!visible)continue;
        // View-space depth accounts for wide fields of view and zoom. Measuring
        // from the nearest edge keeps a long facade detailed as we approach it.
        cameraSpace.copy(entry.sphere.center).applyMatrix4(camera.matrixWorldInverse);
        const nearest=Math.max(.1,-cameraSpace.z-entry.sphere.radius);
        const pixels=camera.isOrthographicCamera?entry.windowHeight*projection:entry.windowHeight*projection/nearest;
        let level=full?0:entry.level;
        if(!full){
          if(level===0&&pixels<40)level=1;else if(level>0&&pixels>48)level=0;
          if(level===1&&pixels<12)level=2;else if(level===2&&pixels>15)level=1;
        }
        select(entry,level);
      }
    }
  };
  controllers.set(root,controller);return controller;
}
