import http from 'node:http';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {launchHardwareBrowser} from '../../Browser/test-support/hardware-browser.mjs';
import {modelSourceHash} from '../../Browser/model-build-inputs.mjs';
import {portInputHashes} from './port-inputs.mjs';
import {packEscapeCollision} from './pack-escape-collision.mjs';

const native=fileURLToPath(new URL('../',import.meta.url));
const dist=resolve(native,'../Browser/dist'),three=resolve(native,'../Browser/node_modules/three');
const output=resolve(native,'Unity/Assets/NativePrototype/Generated');
const archive=resolve(native,'Unity/Assets/Resources/Archive');
const sourceHash=await modelSourceHash(),layoutBytes=await readFile(resolve(dist,'asylum-plan.json'));
const interiorInputs=['asylum-plan.json','architecture.mjs','asylum-layout.mjs','asylum-stairs.mjs','asylum-architecture.mjs','asylum-wall-geometry.mjs','asylum-wall-joins.mjs','asylum-skirting.mjs','asylum-windows.mjs','interior-materials.mjs','basement-mural.mjs','asylum-outside.mjs','explore-controls.mjs','jump.mjs','asylum-jump.mjs','security-guard.mjs','notebook.mjs','capture-outcome.mjs','building-catalog.mjs','location-views.mjs','earth-registration.mjs','device-location.mjs','art/grindley-basement-mural.png'];
const hash=b=>createHash('sha256').update(b).digest('hex');
const interiorHashes=await portInputHashes();
const chunks=new Map();
const metadataOnly=process.argv.includes('--metadata-only');
if(metadataOnly){const previous=JSON.parse(await readFile(resolve(output,'manifest.json')));if(previous.schema!==4||previous.sourceHash!==sourceHash||JSON.stringify(previous.interiorHashes)!==JSON.stringify(interiorHashes))throw Error('Changed model or interior sources require a full export.');}
const server=http.createServer(async(req,res)=>{
  try{
    const path=new URL(req.url,'http://localhost').pathname;
    if(path==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Native port export</title><script type="importmap">{"imports":{"three":"/vendor/three.module.js"}}</script>');return;}
    if(path==='/favicon.ico'){res.writeHead(204).end();return;}
    if(path==='/native-navigation.mjs'){res.setHeader('Content-Type','text/javascript');res.end(await readFile(resolve(native,'tools/navigation-export.mjs')));return;}
    const root=path.startsWith('/three/')?three:dist;
    const file=resolve(root,'.'+decodeURIComponent(path.startsWith('/three/')?path.slice(6):path));
    if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
    res.setHeader('Content-Type',['.js','.mjs'].includes(extname(file))?'text/javascript':extname(file)==='.json'?'application/json':'application/octet-stream');
    res.end(await readFile(file));
  }catch(error){res.writeHead(500).end(error.message);}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
  browser=await launchHardwareBrowser({executablePath:process.env.MODEL_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--js-flags=--max-old-space-size=16000']});
  const page=await browser.newPage();
  page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
  await page.exposeFunction('__nativeChunk',(name,data)=>{if(!chunks.has(name))chunks.set(name,[]);chunks.get(name).push(Buffer.from(data,'base64'));});
  await page.exposeFunction('__progress',message=>console.log(message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  const report=JSON.parse(await page.evaluate(async(metadataOnly)=>{
    const THREE=await import('/vendor/three.module.js');
    const {GLTFExporter}=await import('/three/examples/jsm/exporters/GLTFExporter.js');
    const {mergeGeometries,mergeVertices}=await import('/vendor/BufferGeometryUtils.js');
    const {createEscapeExterior,loadEscapeFrontage}=await import('/escape-exterior.mjs');
    const {createAerialLayouts}=await import('/aerial-layouts.mjs');
    const {prepareEstateTimeline}=await import('/estate-timeline.mjs');
    const {createBuildingDetail}=await import('/building-detail.mjs');
    const {createBuildingSelection}=await import('/building-selection.mjs');
    const {prepareWindowLights}=await import('/window-lights.mjs');
    const {LAMP_HEAD}=await import('/street-lamps.mjs');
    const {exteriorObstacles}=await import('/explore-controls.mjs');
    const {buildArchitecture,interiorWallSurfaces}=await import('/architecture.mjs');
    const {createSecurityGuard}=await import('/security-guard.mjs');
    const {buildAsylumLayout,stairRoute,stairDeparture}=await import('/asylum-layout.mjs');
    const {exportNavigation,exportOutside}=await import('/native-navigation.mjs');
    const {createNotebook}=await import('/notebook.mjs');
    const FLOOR_HEIGHT=4.2;
    const {PERIODS,sectionDates}=await import('/estate-periods.mjs');
    const {BUILDING_CATALOG}=await import('/building-catalog.mjs');
    const {LOCATION_VIEWS,LOCATION_WALKS}=await import('/location-views.mjs');
    const {EARTH_ANCHOR}=await import('/earth-registration.mjs');
    const {ESTATE_PERIMETER}=await import('/device-location.mjs');
    const {diagnoses,causes}=await import('/capture-outcome.mjs');
    const {createCountryside}=await import('/countryside.mjs');
    const {furnishAsylum}=await import('/asylum-furniture.mjs');
    const {loadFurnitureModels,createFurnitureFloor}=await import('/furniture-models.mjs');
    const {createEscapeProgress,MAST}=await import('/escape-progress.mjs');
    const {createEscapeWorld,createEscapeLandmark}=await import('/escape-world.mjs');
    const {createEscapeGrounds}=await import('/escape-grounds.mjs');
    const {createAsylumOutside}=await import('/asylum-outside.mjs');
    const {GROUNDS_GATES,GROUNDS_OUTLINE,GUARD_PATROL}=await import('/escape-grounds-state.mjs');
    const plan=await fetch('/asylum-plan.json').then(r=>r.json()),layout=buildAsylumLayout(plan),floors=layout.floors;
    furnishAsylum(floors,{seed:1829});
    const furnitureModels=await loadFurnitureModels(THREE);
    const {asylumRoomNumbers,asylumDisplayName}=await import('/asylum-room-numbers.mjs');
    const navigation=exportNavigation(floors,stairRoute,stairDeparture,{roomNumbers:asylumRoomNumbers,displayName:asylumDisplayName});
    const exterior=createEscapeExterior(THREE,1),layouts=createAerialLayouts(THREE,exterior);
    await loadEscapeFrontage(THREE,exterior);
    const countryside=createCountryside(THREE,exterior);
    prepareEstateTimeline(THREE,exterior,layouts);prepareWindowLights(THREE,exterior.model);
    const selection=createBuildingSelection(THREE,exterior);
    const detail=createBuildingDetail(THREE,exterior.model,{exclude:[exterior.trees,exterior.terrain,...layouts.visibilityObjects]});
    const detailGroups=detail.entries.map(e=>({x:e.sphere.center.x,y:e.sphere.center.y,z:e.sphere.center.z,radius:e.sphere.radius,windowHeight:e.windowHeight}));
    const groupIds=new Map(detail.entries.map((e,i)=>[e.parent.uuid,i]));
    const materialCopies=new Map(),textureCopies=new Map();
    function exportTexture(texture){
      if(!texture?.isDataTexture)return texture;
      if(!textureCopies.has(texture)){
        const {data,width,height}=texture.image,channels=data.length/(width*height),canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(width,height),factor=data instanceof Float32Array?255:1;
        for(let i=0;i<width*height;i++)for(let c=0;c<4;c++)pixels.data[i*4+c]=c===3?(channels===4?data[i*channels+3]*factor:255):data[i*channels+Math.min(c,channels-1)]*factor;
        ctx.putImageData(pixels,0,0);const copy=new THREE.CanvasTexture(canvas);copy.name=texture.name;copy.colorSpace=texture.colorSpace;copy.flipY=texture.flipY;copy.wrapS=texture.wrapS;copy.wrapT=texture.wrapT;copy.repeat.copy(texture.repeat);copy.offset.copy(texture.offset);textureCopies.set(texture,copy);
      }return textureCopies.get(texture);
    }
    function materialFor(source,tint='',floorElevation){
      const roomWalls=source.customProgramCacheKey().includes('room-damask');
      const key=source.uuid+':'+tint+(roomWalls?':floor:'+floorElevation:'');
      if(!materialCopies.has(key)){
        const m=source.isShaderMaterial?new THREE.MeshBasicMaterial({color:0xffcf70,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide}):source.clone();const finish=/interior-finish-([\d.]+)-(true|false)/.exec(source.customProgramCacheKey());
        m.userData={nativeSurface:{offsetFactor:source.polygonOffset?source.polygonOffsetFactor:0,offsetUnits:source.polygonOffset?source.polygonOffsetUnits:0,grass:!!source.userData.estateGrass,wind:!!source.userData.frontLawnWind,ceiling:finish?.[2]==='true',mural:!!source.userData.mural,roomWalls,...(roomWalls?{floorElevation}: {})}};m.onBeforeCompile=()=>{};
        if(m.map&&!m.bumpMap&&m.roughness>=.8&&!m.transparent&&!m.userData.nativeSurface.grass){m.bumpMap=m.map;m.bumpScale=.055;}
        for(const slot of ['map','bumpMap','roughnessMap','metalnessMap','emissiveMap','alphaMap','normalMap'])if(m[slot])m[slot]=exportTexture(m[slot]);
        if(tint)m.color.multiply(new THREE.Color('#'+tint));materialCopies.set(key,m);
      }
      return {key,material:materialCopies.get(key)};
    }
    function descriptors(root,floorElevation){
      root.updateWorldMatrix(true,true);const result=[];
      root.traverseVisible(object=>{
        if(!object.isMesh)return;
        const surfaces=Array.isArray(object.material)?object.geometry.groups.map(group=>{
          const g=object.geometry.clone();g.clearGroups();
          if(g.index)g.setIndex(new THREE.BufferAttribute(g.index.array.slice(group.start,group.start+group.count),1));
          else for(const [name,a] of Object.entries(g.attributes))g.setAttribute(name,new THREE.BufferAttribute(a.array.slice(group.start*a.itemSize,(group.start+group.count)*a.itemSize),a.itemSize,a.normalized));
          return {geometry:g,material:object.material[group.materialIndex]};
        }):[{geometry:object.geometry,material:object.material}];
        const local=new THREE.Matrix4(),world=new THREE.Matrix4();
        let tree=false,group=-1,level=-1;
        for(let p=object;p;p=p.parent){if(p===exterior.trees)tree=true;if(p.userData.buildingDetailLevel!==undefined){level=p.userData.buildingDetailLevel;group=groupIds.get(p.parent.uuid)??-1;}}
        const count=object.isInstancedMesh?object.count:1;
        if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();
        for(let i=0;i<count;i++){
          if(object.isInstancedMesh){object.getMatrixAt(i,local);world.multiplyMatrices(object.matrixWorld,local);}else world.copy(object.matrixWorld);
          let tint='';if(object.instanceColor){const c=new THREE.Color();object.getColorAt(i,c);if(root===countryside.group){c.r=Math.round(c.r*32)/32;c.g=Math.round(c.g*32)/32;c.b=Math.round(c.b*32)/32;}tint=c.getHexString();}
          for(const surface of surfaces){const material=materialFor(surface.material,tint,floorElevation),bounds=object.geometry.boundingBox.clone().applyMatrix4(world);
          result.push({geometry:surface.geometry,matrix:world.clone(),material:material.material,key:material.key,sourceMaterial:surface.material,tree,group,level,scenic:root===countryside.group,shadow:object.castShadow,center:bounds.getCenter(new THREE.Vector3())});}
        }
      });return result;
    }
    function bakePart(part){
      const g=part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone();
      const wind=part.sourceMaterial.userData.frontLawnWind,wp=g.attributes.position,wu=g.attributes.uv;
      const windData=new Float32Array(wp.count*2),scale=new THREE.Vector3().setFromMatrixScale(part.matrix).x;
      if(wind)for(let i=0;i<wp.count;i++){windData[i*2]=wp.getX(i)*.17+wp.getY(i)*.09+wp.getZ(i)*.13+(wind.phase??0);windData[i*2+1]=wu.getY(i)*(wind.strength??.16)*scale;}
      g.applyMatrix4(part.matrix);
      const roomFinish=g.attributes.roomFinish?.clone();
      for(const name of Object.keys(g.attributes))if(!['position','normal','uv','color'].includes(name))g.deleteAttribute(name);
      if(!g.attributes.color)g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*3).fill(1),3));
      g.setAttribute('uv1',new THREE.Float32BufferAttribute(windData,2));
      g.setAttribute('uv2',roomFinish??new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
      if(!g.attributes.normal)g.computeVertexNormals();
      if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
      const surface=part.sourceMaterial.userData.estateSurface;
      const mineral=part.sourceMaterial.userData.mineralFinish;
      const finish=/interior-finish-([\d.]+)-/.exec(part.sourceMaterial.customProgramCacheKey());
      if(surface||mineral||finish){
        const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
        const tile=finish?Number(finish[1]):3,base=finish?(part.floorElevation??0):0;
        for(let i=0;i<p.count;i++){
          if(surface)uv.setXY(i,p.getX(i)/12,p.getZ(i)/12);
          else if(Math.abs(n.getY(i))>.5)uv.setXY(i,p.getX(i)/tile,p.getZ(i)/tile);
          else if(Math.abs(n.getX(i))>.5)uv.setXY(i,p.getZ(i)/tile,(p.getY(i)-base)/tile);
          else uv.setXY(i,p.getX(i)/tile,(p.getY(i)-base)/tile);
        }
      }
      if(part.matrix.determinant()<0)for(const a of Object.values(g.attributes))for(let v=0;v<a.count;v+=3)for(let c=0;c<a.itemSize;c++){
        const x=(v+1)*a.itemSize+c,y=(v+2)*a.itemSize+c;[a.array[x],a.array[y]]=[a.array[y],a.array[x]];
      }
      return g;
    }
    const estate=new THREE.Group();estate.name='Estate mesh library';
    const registry=new Map(),meshFlags=[];
    function addEstate(parts){
      const batches=new Map();
      for(const p of parts){
        const cell=p.scenic?256:32;
        const key=[p.key,Math.floor(p.center.x/cell),Math.floor(p.center.z/cell),p.tree,p.group,p.level,p.shadow,p.scenic].join(':');
        if(!batches.has(key))batches.set(key,[]);batches.get(key).push(p);
      }
      const ids=[];
      for(const [key,parts] of batches){
        const signature=key+'|'+parts.map(p=>p.geometry.uuid+','+p.matrix.elements.join(',')).join('|');
        let id=registry.get(signature);
        if(id===undefined){
          id=estate.children.length;registry.set(signature,id);
          const geometries=parts.map(bakePart),geometry=mergeGeometries(geometries);for(const g of geometries)g.dispose();
          geometry.computeBoundingBox();
          // Tall facade batches also contain shallow trim and inset finishes.
          // Lossy Unity mesh compression can merge those separate surfaces.
          const mesh=new THREE.Mesh(geometry,parts[0].material);mesh.name='estate-'+id;mesh.userData.preciseSurface=!parts[0].tree&&!parts[0].scenic||geometry.boundingBox.max.y-geometry.boundingBox.min.y<2||!!parts[0].sourceMaterial.polygonOffset;estate.add(mesh);
          meshFlags.push({tree:parts[0].tree,group:parts[0].group,level:parts[0].level,shadow:parts[0].shadow});
        }
        ids.push(id);
      }return ids;
    }
    const nativeFootprint=b=>({...b,...(b.corners?{corners:b.corners.map(([x,z])=>({x,z}))}:{})});
    const scenicMeshes=addEstate(descriptors(countryside.group));
    const periods=[],selectionLibrary=new THREE.Group(),selectionIds=new Map();selectionLibrary.name='Exact building selection';
    const jumpKeys=new Map(),jumpRecords=[],supportKeys=new Map(),supportLibrary=[];
    function registerJumps(bounds,period,trees){for(const b of bounds){const values=[b.minX,b.maxX,b.minZ,b.maxZ,b.minY??-10000,b.maxY??10000,...(b.corners??[]).flat()];const key=values.map(n=>Math.round(n*1e5)).join(',');let i=jumpKeys.get(key);if(i===undefined){i=jumpRecords.length;jumpKeys.set(key,i);jumpRecords.push({values,withTrees:0,withoutTrees:0});}jumpRecords[i][trees?'withTrees':'withoutTrees']|=1<<period;}}
    function registerSupports(supports){return supports.map(s=>{const key=JSON.stringify(s);let i=supportKeys.get(key);if(i===undefined){i=supportLibrary.length;supportKeys.set(key,i);supportLibrary.push(s);}return i;});}
    const selectionMaterial=new THREE.MeshBasicMaterial({color:0xffffff});
    for(const period of PERIODS){
      exterior.timeline.setPeriod(period.year);const meshes=new Set(scenicMeshes);
      for(let lod=0;lod<3;lod++){
        for(const e of detail.entries)e.levels.forEach((root,i)=>root.visible=i===lod);
        for(const id of addEstate(descriptors(exterior.model)))meshes.add(id);
      }
      // Window atlas geometry has coarse bounds. Walking collisions must come
      // from the original close geometry, independently of the displayed LOD.
      for(const e of detail.entries)e.levels.forEach((root,i)=>root.visible=i===0);
      selection.refresh();
      const buildings=selection.entries.flatMap((entry,index)=>{
        if(!selection.isVisible(entry))return [];
        const b=entry.mesh.geometry.boundingBox;
        let selectionMesh=selectionIds.get(entry.mesh.geometry);
        if(selectionMesh===undefined){
          selectionMesh=selectionLibrary.children.length;selectionIds.set(entry.mesh.geometry,selectionMesh);
          const geometry=entry.mesh.geometry.clone();geometry.computeVertexNormals();
          geometry.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count*2),2));
          const mesh=new THREE.Mesh(geometry,selectionMaterial);mesh.name='selection-'+selectionMesh;mesh.userData.preciseSurface=true;selectionLibrary.add(mesh);
        }
        return [{index,selectionMesh,minX:b.min.x,maxX:b.max.x,minY:b.min.y,maxY:b.max.y,minZ:b.min.z,maxZ:b.max.z}];
      });
      const walking=exportOutside(THREE,exterior,exteriorObstacles);
      exterior.trees.visible=false;const noTrees=exportOutside(THREE,exterior,exteriorObstacles);exterior.trees.visible=true;
      registerJumps(walking.jumpObstacles,periods.length,true);registerJumps(noTrees.jumpObstacles,periods.length,false);
      const supportIds=registerSupports(walking.supports);delete walking.jumpObstacles;delete walking.supports;
      const lamps=[];exterior.model.traverseVisible(owner=>{
        if(owner.userData.streetLamps)for(const p of owner.userData.streetLamps){const v=new THREE.Vector3(p.x+Math.cos(p.angle)*LAMP_HEAD[0],LAMP_HEAD[1]+(p.y??-.15)+.15,p.z-Math.sin(p.angle)*LAMP_HEAD[0]).applyMatrix4(owner.matrixWorld);lamps.push({x:v.x,y:v.y,z:v.z});}
        if(owner.userData.lampPost){const v=new THREE.Vector3(...LAMP_HEAD).add(new THREE.Vector3(0,.15,0)).applyMatrix4(owner.matrixWorld);lamps.push({x:v.x,y:v.y,z:v.z});}
      });
      periods.push({...period,meshes:[...meshes],...walking,obstaclesNoTrees:noTrees.obstacles,supportIds,buildings,lamps});
      await window.__progress('Exported period '+period.year+'; '+meshes.size+' mesh variants / '+estate.children.length+' shared library meshes.');
    }
    const interior=new THREE.Group();interior.name='Reviewed four-level asylum';
    function addInterior(root,floor,open){
      const batches=new Map();
      for(const part of descriptors(root,floors[floor].elevation)){
        part.floorElevation=floors[floor].elevation;
        const g=bakePart(part),p=g.attributes.position;
        const regions=new Map();
        for(let v=0;v<p.count;v+=3){
          const x=(p.getX(v)+p.getX(v+1)+p.getX(v+2))/3,z=(p.getZ(v)+p.getZ(v+1)+p.getZ(v+2))/3;
          const region=-1;
          if(open&&region<0)continue;
          if(!regions.has(region))regions.set(region,[]);regions.get(region).push(v,v+1,v+2);
        }
        for(const [region,indices] of regions){
          const key=part.key+':'+region;
          const subset=new THREE.BufferGeometry();
          for(const [name,a] of Object.entries(g.attributes)){
            const values=new Float32Array(indices.length*a.itemSize);
            indices.forEach((v,i)=>{for(let c=0;c<a.itemSize;c++)values[i*a.itemSize+c]=a.array[v*a.itemSize+c];});
            subset.setAttribute(name,new THREE.BufferAttribute(values,a.itemSize));
          }
          if(!batches.has(key))batches.set(key,{parts:[],material:part.material,region});batches.get(key).parts.push(subset);
        }g.dispose();
      }
      for(const b of batches.values()){
        const geometry=mergeGeometries(b.parts);for(const p of b.parts)p.dispose();
        const mesh=new THREE.Mesh(geometry,b.material);mesh.name=`floor-${floor}-${b.region<0?'core':(open?'open':'closed')+'-'+b.region}-${interior.children.length}`;interior.add(mesh);
      }
    }
    for(let floor=0;floor<floors.length;floor++){
      const root=new THREE.Group();root.position.y=floors[floor].elevation;
      buildArchitecture(THREE,root,floors[floor]);createFurnitureFloor(THREE,root,floors[floor],furnitureModels);addInterior(root,floor,false);
    }
    // Export the actual disposable browser scene, with moving fittings retained
    // as independent local-space groups. Native code never reconstructs a roof
    // or workshop from approximate boxes.
    function bakeGroup(source,name,{local=false}={}){
      source.updateWorldMatrix(true,true);const target=new THREE.Group();target.name=name;
      const inverse=local?source.matrixWorld.clone().invert():null;
      if(local)source.matrixWorld.decompose(target.position,target.quaternion,target.scale);
      const batches=new Map();
      for(const part of descriptors(source)){
        if(inverse)part.matrix.premultiply(inverse);
        if(!batches.has(part.key))batches.set(part.key,{geometries:[],material:part.material});
        batches.get(part.key).geometries.push(bakePart(part));
      }
      for(const batch of batches.values()){
        const geometry=mergeGeometries(batch.geometries);for(const g of batch.geometries)g.dispose();
        const mesh=new THREE.Mesh(geometry,batch.material);mesh.name=name+' surface '+target.children.length;mesh.userData.preciseSurface=true;target.add(mesh);
      }
      return target;
    }
    const fittings=new THREE.Group(),variants=[],combinations=new Set();fittings.name='Escape scenario variants';
    const serializeNode=n=>({id:n.id,title:n.title,floor:n.floor??-1,x:n.x,z:n.z,y:n.y??0,mount:n.mount?{x:n.mount.x,y:n.mount.y,z:n.mount.z}:null});
    for(let seed=0;combinations.size<8;seed++){
      const progress=createEscapeProgress({seed,floors}),run=progress.run,key=[run.variant,run.office,run.keyRoom].join(':');
      if(combinations.has(key))continue;combinations.add(key);
      const groups=floors.map(f=>{const g=new THREE.Group();g.position.y=f.elevation;return g;});
      const world=createEscapeWorld(THREE,floors,groups,progress,{reducedMotion:true});
      const variantRoot=new THREE.Group();variantRoot.name='variant-'+variants.length;fittings.add(variantRoot);
      // Export available and confiscated keys, then let native state hide them.
      for(const n of world.nodes){if(n.key)n.key.visible=true;n.halo.visible=true;}
      for(const gate of world.gates){gate.leaf.removeFromParent();const parent=bakeGroup(gate.group,'staff-frame-'+gate.id);variantRoot.add(parent);gate.group.add(gate.leaf);variantRoot.add(bakeGroup(gate.leaf,'staff-leaf-'+gate.id,{local:true}));}
      for(const n of world.nodes){
        if(n.key)n.key.removeFromParent();variantRoot.add(bakeGroup(n.group,'node-'+n.id));
        if(n.key){const parent=n.id==='reclaim'?n.tray:n.group.children[0];parent.add(n.key);variantRoot.add(bakeGroup(n.key,'key-'+n.id,{local:true}));}
      }
      if(variants.length===0)for(const lock of world.doorLocks)fittings.add(bakeGroup(lock.group,'lock-'+lock.floor+'-'+lock.exit.id));
      variants.push({seed,variant:run.variant,exitId:run.exitId,office:run.office,keyRoom:run.keyRoom,nodes:world.nodes.map(serializeNode),gates:world.gates.map(({id,x,z,y,dx,dz,height})=>({id,x,z,y,dx,dz,height}))});
      world.dispose();await window.__progress('Exported escape arrangement '+variants.length+'/8');
    }
    exterior.timeline.setPeriod(1916);for(const e of detail.entries)e.levels.forEach((root,i)=>root.visible=i===0);
    createEscapeLandmark(THREE,exterior);const walker=createAsylumOutside(THREE,exterior),progress=createEscapeProgress({seed:variants[0].seed,floors});
    const grounds=createEscapeGrounds(THREE,exterior,walker,progress),dynamic=[];
    for(const [id,gate] of Object.entries(grounds.gates)){
      dynamic.push({id,source:gate.pivot,angle:-Math.PI/2,obstacle:{minX:gate.x-gate.width/2,maxX:gate.x+gate.width/2,minZ:gate.z-.12,maxZ:gate.z+.12,minY:0,maxY:3.4}});
      if(id==='wicket'){gate.boards.name='wicket-boards';gate.boards.removeFromParent();}
    }
    for(const door of [{id:'tower-door',pivot:grounds.workshops.pivot,side:1},...grounds.workshops.roomDoors])dynamic.push({id:door.id,source:door.pivot,angle:door.side*Math.PI/2,obstacle:door.id==='tower-door'?grounds.workshops.doorObstacle():grounds.workshops.roomDoorObstacles()[grounds.workshops.roomDoors.findIndex(d=>d.id===door.id)]});
    const moving=new THREE.Group();moving.name='Moving grounds fittings';const movingDefinitions=[];
    for(const d of dynamic){moving.add(bakeGroup(d.source,d.id,{local:true}));movingDefinitions.push({id:d.id,angle:d.angle,obstacle:nativeFootprint(d.obstacle)});d.source.removeFromParent();}
    const boards=grounds.gates.wicket.boards;grounds.gates.wicket.pivot.add(boards);moving.add(bakeGroup(boards,'wicket-boards',{local:true}));boards.removeFromParent();
    for(const id of ['crowbar','oil']){const source=grounds.group.getObjectByName(id==='crowbar'?'Takeable crowbar':'Takeable oil can');
      if(!source)throw Error('Missing native takeable tool '+id);moving.add(bakeGroup(source,'tool-'+id,{local:true}));source.removeFromParent();}
    // Reuse unchanged estate batches rather than exporting a second complete
    // campus. Register only the corridor replacements and scenario additions.
    const escapeMeshes=new Set();for(let lod=0;lod<3;lod++){for(const e of detail.entries)e.levels.forEach((root,i)=>root.visible=i===lod);for(const id of addEstate(descriptors(exterior.model)))escapeMeshes.add(id);}
    for(const e of detail.entries)e.levels.forEach((root,i)=>root.visible=i===0);
    const escapeScene=new THREE.Group();escapeScene.name='Moving Escape fittings';escapeScene.add(moving);
    const escapeWalking=exportOutside(THREE,exterior,exteriorObstacles);
    const escapeJumps=escapeWalking.jumpObstacles.map(nativeFootprint);delete escapeWalking.jumpObstacles;
    exterior.trees.visible=false;const escapeNoTrees=exportOutside(THREE,exterior,exteriorObstacles);exterior.trees.visible=true;
    const escape={meshes:[...escapeMeshes],variants,nodes:grounds.nodes.map(serializeNode),moving:movingDefinitions,solids:grounds.solids.map(nativeFootprint),outline:GROUNDS_OUTLINE.map(([x,z])=>({x,z})),gates:Object.entries(GROUNDS_GATES).map(([id,g])=>({id,...g})),mast:MAST,patrol:GUARD_PATROL,...escapeWalking,jumpObstacles:escapeJumps,obstaclesNoTrees:escapeNoTrees.obstacles,jumpObstaclesNoTrees:escapeNoTrees.jumpObstacles.map(nativeFootprint),lamps:grounds.workshops.lighting.lamps.map(({x,y,z})=>({x,y,z}))};
    function copyRig(source){
      const target=source.isMesh?new THREE.Mesh(source.geometry,materialFor(source.material).material):new THREE.Group();
      target.name=source.name;target.position.copy(source.position);target.quaternion.copy(source.quaternion);target.scale.copy(source.scale);
      for(const child of source.children)target.add(copyRig(child));return target;
    }
    const guard=copyRig(createSecurityGuard(THREE));
    async function save(name,object){
      if(metadataOnly&&name!=='selection.glb')return 0;
      await window.__progress('Serializing '+name);
      object.traverse(mesh=>{if(mesh.isMesh&&!mesh.geometry.index){const original=mesh.geometry;mesh.geometry=mergeVertices(original,1e-6);original.dispose();}});
      const data=new Uint8Array(await new GLTFExporter().parseAsync(object,{binary:true,trs:true,maxTextureSize:1024,onlyVisible:true}));
      if(data.length<20)throw Error('Empty GLB export '+name);
      await window.__progress(name+': '+data.length+' bytes');
      for(let start=0;start<data.length;start+=262144){
        let raw='';for(let i=start;i<Math.min(data.length,start+262144);i+=16384)raw+=String.fromCharCode(...data.subarray(i,Math.min(data.length,i+16384,start+262144)));
        await window.__nativeChunk(name,btoa(raw));
      }return data.length;
    }
    const stats=root=>{let triangles=0,meshes=0;root.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});return {batches:meshes,triangles};};
    const {paintRoomWallpaper,paintRoomDado}=await import('/room-finish-textures.mjs');
    for(const [name,paint] of [['room-wallpaper.png',paintRoomWallpaper],['room-paint.png',paintRoomDado]]){const canvas=document.createElement('canvas');canvas.width=canvas.height=512;paint(canvas.getContext('2d'),512);await window.__nativeChunk(name,canvas.toDataURL('image/png').split(',')[1]);}
    await window.__progress('Escape scene: '+JSON.stringify({visible:escapeScene.visible,children:escapeScene.children.length,...stats(escapeScene)}));
    const outdoorStats=stats(estate),outdoorChunks=[];
    const bytes={escape:await save('escape.glb',escapeScene),fittings:await save('fittings.glb',fittings),outdoor:0,indoor:await save('indoor.glb',interior),guard:await save('guard.glb',guard),selection:await save('selection.glb',selectionLibrary)};
    // Chromium cannot reliably create a single Blob for the expanded library.
    // Bounded files preserve every mesh and keep serialization/import memory low.
    const estateMeshes=[...estate.children];for(let start=0;start<estateMeshes.length;start+=384){const root=new THREE.Group();root.name='Estate library part '+outdoorChunks.length;for(const mesh of estateMeshes.slice(start,start+384))root.add(mesh);const name='outdoor-'+outdoorChunks.length+'.glb';outdoorChunks.push(name);bytes.outdoor+=await save(name,root);}
    await window.__progress('Serializing '+jumpRecords.length+' shared jump bounds');
    const collisionBytes=new Uint8Array(8+jumpRecords.reduce((n,r)=>n+32+(r.values.length-6)*4,0)),collisionView=new DataView(collisionBytes.buffer);
    collisionView.setUint32(0,0x4a313832,true);collisionView.setUint32(4,jumpRecords.length,true);let offset=8;
    for(const r of jumpRecords){for(let i=0;i<6;i++)collisionView.setFloat32(offset+i*4,r.values[i],true);collisionView.setUint16(offset+24,r.withTrees,true);collisionView.setUint16(offset+26,r.withoutTrees,true);collisionView.setUint32(offset+28,(r.values.length-6)/2,true);offset+=32;for(const n of r.values.slice(6)){collisionView.setFloat32(offset,n,true);offset+=4;}}
    for(let start=0;start<collisionBytes.length;start+=262144){let raw='';for(let i=start;i<Math.min(collisionBytes.length,start+262144);i+=16384)raw+=String.fromCharCode(...collisionBytes.subarray(i,Math.min(collisionBytes.length,i+16384,start+262144)));await window.__nativeChunk('jump-collision.bytes',btoa(raw));}
    const artNames=['front','front2','front3','annexe','annexe2','chimney','watertower','cheshire-asylum-1860-discharge-etc','asylum-winter-moonlight','asylum-service-tunnels','daily-account-patients-1854'];
    const journal=createNotebook(floors);
    const art=artNames.map((key,i)=>{const item={src:'./art/'+key+'.png',title:i===8?'':key.replaceAll('-',' ').toUpperCase(),imageOnly:i===8};journal.recordArt({...item,url:item.src,floor:0});return {...item,note:journal.entries[0].text,source:journal.entries[0].source};});
    const wallArt=[];
    for(let floor=0;floor<floors.length;floor++){
      const plan=floors[floor],open=(x,z)=>x>=0&&z>=0&&x<plan.width&&z<plan.height&&plan.cells[z*plan.width+x]===1;
      const surfaces=interiorWallSurfaces(plan).filter(s=>!s.window&&!(floor===2&&Math.abs(s.x+34.65)<2&&Math.abs(s.z-1.39)<.5));
      const placed=[];
      for(let index=0;index<art.length;index++){
        const candidates=surfaces.filter(s=>plan.stairs.every(t=>Math.hypot(s.x-t.x*plan.cellSize,s.z-t.z*plan.cellSize)>4)&&plan.exits.every(e=>Math.hypot(s.x-e.x*plan.cellSize,s.z-e.z*plan.cellSize)>4)&&placed.every(p=>Math.hypot(s.x-p.x,s.z-p.z)>3));
        const surface=candidates[Math.floor(candidates.length*.618)];if(!surface)break;placed.push(surface);
        wallArt.push({floor,index,x:surface.x-surface.dx*.115,z:surface.z-surface.dz*.115,rotation:surface.rotation});
      }
    }
    const buildings=selection.entries.map(e=>({...BUILDING_CATALOG.find(c=>c.id===e.id),sections:e.sections,dates:e.sections.map(s=>({section:s,...sectionDates(s)}))}));
    const locations=Object.entries(LOCATION_VIEWS).map(([key,view])=>({key,position:view.position,target:view.target,fov:view.fov??60,walkPosition:LOCATION_WALKS[key]?.position??null,walkTarget:LOCATION_WALKS[key]?.target??null}));
    await window.__progress('Serializing navigation and manifest');
    return JSON.stringify({schema:4,navigation,escape,escapeStats:stats(escapeScene),fittings:stats(fittings),outdoorChunks,jumpBounds:jumpRecords.length,supportLibrary,defaultPeriod:1916,floorHeight:FLOOR_HEIGHT,playBounds:{minX:-400,maxX:950,minZ:-550,maxZ:550},outdoor:outdoorStats,indoor:stats(interior),guard:stats(guard),selection:stats(selectionLibrary),bytes,periods,meshFlags,detailGroups,buildings,locations,art,wallArt,earthAnchor:EARTH_ANCHOR,perimeter:ESTATE_PERIMETER.map(([x,z])=>({x,z})),diagnoses,causes});
  },metadataOnly));
  if(await modelSourceHash()!==sourceHash)throw Error('Source changed during native export. Repeat export.');
  for(const [name,value] of Object.entries(interiorHashes))if(hash(await readFile(resolve(dist,name)))!==value)throw Error('Interior source changed during export: '+name);
  await mkdir(output,{recursive:true});await mkdir(archive,{recursive:true});
  console.log('Asset chunks: '+[...chunks].map(([name,parts])=>name+':'+parts.reduce((n,b)=>n+b.length,0)).join(', '));
  for(const [name,parts] of chunks)await writeFile(resolve(output,name),Buffer.concat(parts));
  const navigationBytes=Buffer.from(JSON.stringify(report.navigation)+'\n');delete report.navigation;
  await writeFile(resolve(output,'layout.json'),navigationBytes);
  await writeFile(resolve(output,'asylum-plan.json'),layoutBytes);
  // Unity does not import WebP. Decode locally with the existing browser rather
  // than fetching or altering the originals; retain each original content hash.
  const images=[...new Map([...report.buildings.flatMap(b=>[...(b.photos??[]),...(b.contextPhotos??[])]),...report.art,{src:'./art/grindley-basement-mural.png'}].map(p=>[p.src,p])).values()];
  const imageHashes={};
  for(const item of images){
    const source=resolve(dist,item.src),sourceBytes=await readFile(source);
    const name=item.src.replace(/^\.\//,'').replace(/\.[^.]+$/,'').replaceAll('/','_');
    const result=await page.evaluate(async url=>{
      const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);return c.toDataURL('image/png').split(',')[1];
    },'/'+item.src.replace(/^\.\//,''));
    await writeFile(resolve(archive,name+'.png'),Buffer.from(result,'base64'));
    imageHashes[item.src]=createHash('sha256').update(sourceBytes).digest('hex');
  }
  const packedEscape=packEscapeCollision(report.escape.jumpObstacles,report.escape.jumpObstaclesNoTrees);
  await writeFile(resolve(output,'escape-jump-collision.bytes'),packedEscape.bytes);report.escapeJumpBounds=packedEscape.count;
  delete report.escape.jumpObstacles;delete report.escape.jumpObstaclesNoTrees;
  const assetHashes={};for(const name of [...report.outdoorChunks,...['indoor','guard','selection','escape','fittings'].map(n=>n+'.glb')]){const file=await readFile(resolve(output,name));assetHashes[name]=createHash('sha256').update(file).digest('hex');}
  assetHashes['jump-collision.bytes']=hash(await readFile(resolve(output,'jump-collision.bytes')));
  assetHashes['escape-jump-collision.bytes']=hash(packedEscape.bytes);
  for(const name of ['room-wallpaper.png','room-paint.png'])assetHashes[name]=hash(await readFile(resolve(output,name)));
  const manifest={...report,sourceHash,interiorHashes,planHash:hash(layoutBytes),layoutHash:hash(navigationBytes),assetHashes,imageHashes};
  await writeFile(resolve(output,'manifest.json'),JSON.stringify(manifest)+'\n');
  for(const [src,dst] of [['vendor/THREE-LICENSE.txt','THREE-LICENSE.txt'],['vendor/ez-tree/LICENSE','EZ-TREE-LICENSE.txt'],['vendor/ez-tree/TEXTURES-LICENSE.md','TREE-TEXTURES-LICENSE.txt']])await copyFile(resolve(dist,src),resolve(output,dst));
  await copyFile(resolve(native,'../LICENSE'),resolve(output,'GPL-3.0.txt'));
  for(const [src,dst] of [['LICENSE.txt','FURNITURE-LICENSE.txt'],['ShopPrentice-MIT.txt','ShopPrentice-MIT.txt'],['Panca-GPL-3.0.txt','Panca-GPL-3.0.txt']])await copyFile(resolve(dist,'models/furniture',src),resolve(output,dst));
  console.log(JSON.stringify({sourceHash,outdoor:report.outdoor,indoor:report.indoor,guard:report.guard,bytes:report.bytes,periods:report.periods.length,buildings:report.buildings.length,images:images.length},null,2));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
