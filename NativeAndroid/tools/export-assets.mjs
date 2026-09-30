import http from 'node:http';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {chromium} from '../../Browser/node_modules/playwright/index.mjs';
import {modelSourceHash} from '../../Browser/model-build-inputs.mjs';

const native=fileURLToPath(new URL('../',import.meta.url));
const dist=resolve(fileURLToPath(new URL('../../Browser/dist/',import.meta.url)));
const three=resolve(fileURLToPath(new URL('../../Browser/node_modules/three/',import.meta.url)));
const output=resolve(native,'Unity/Assets/NativePrototype/Generated');
const sourceHash=await modelSourceHash();
const layoutBytes=await readFile(resolve(dist,'layout.json'));
const chunks=new Map();
const server=http.createServer(async(req,res)=>{
  try{
    const path=new URL(req.url,'http://localhost').pathname;
    if(path==='/'){
      res.setHeader('Content-Type','text/html');
      res.end('<!doctype html><title>Native asset export</title><script type="importmap">{"imports":{"three":"/vendor/three.module.js"}}</script>');return;
    }
    if(path==='/favicon.ico'){res.writeHead(204).end();return;}
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
  const chrome=process.env.MODEL_CHROME_PATH;
  browser=await chromium.launch({headless:true,...(chrome?{executablePath:chrome}:{})});
  const page=await browser.newPage();
  page.on('console',m=>{if(m.type()==='error')console.error(m.text());});
  await page.exposeFunction('__nativeChunk',(name,data)=>{
    if(!chunks.has(name))chunks.set(name,[]);
    chunks.get(name).push(Buffer.from(data,'base64'));
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  const report=await page.evaluate(async()=>{
    const THREE=await import('/vendor/three.module.js');
    const {GLTFExporter}=await import('/three/examples/jsm/exporters/GLTFExporter.js');
    const {mergeGeometries}=await import('/vendor/BufferGeometryUtils.js');
    const {createEscapeExterior}=await import('/escape-exterior.mjs');
    const {createAerialLayouts}=await import('/aerial-layouts.mjs');
    const {prepareEstateTimeline}=await import('/estate-timeline.mjs');
    const {exteriorObstacles}=await import('/explore-controls.mjs');
    const {buildArchitecture}=await import('/architecture.mjs');
    const {createSecurityGuard}=await import('/security-guard.mjs');
    const layout=await fetch('/layout.json').then(r=>r.json());
    const exterior=createEscapeExterior(THREE,1);
    const layouts=createAerialLayouts(THREE,exterior);
    prepareEstateTimeline(THREE,exterior,layouts);exterior.timeline.setPeriod(1916);
    const crop={minX:-85,maxX:85,minZ:-62,maxZ:86};
    const overlaps=b=>b.max.x>=crop.minX&&b.min.x<=crop.maxX&&b.max.z>=crop.minZ&&b.min.z<=crop.maxZ;
    const selectedObstacles=exteriorObstacles(THREE,exterior.model);
    const obstacles=selectedObstacles.filter(b=>b.maxX>=crop.minX&&b.minX<=crop.maxX&&b.maxZ>=crop.minZ&&b.minZ<=crop.maxZ);
    const walkSurfaces=selectedObstacles.walkSurfaces.filter(b=>b.maxX>=crop.minX&&b.minX<=crop.maxX&&b.maxZ>=crop.minZ&&b.minZ<=crop.maxZ);

    // Export final geometry from the current source. Material/cell batching is
    // rebuilt for Unity, keeping view culling useful and avoiding an instance
    // extension dependency in the importer. No source objects are edited.
    function bake(root,name,filter=null){
      root.updateMatrixWorld(true);
      const target=new THREE.Group();target.name=name;
      const batches=new Map(),materials=new Map(),matrix=new THREE.Matrix4(),world=new THREE.Matrix4();
      let sourceParts=0,triangles=0;
      root.traverseVisible(object=>{
        if(!object.isMesh)return;
        if(Array.isArray(object.material))throw Error('Export needs a material-group adapter: '+object.name);
        const count=object.isInstancedMesh?object.count:1;
        if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();
        for(let i=0;i<count;i++){
          if(object.isInstancedMesh){object.getMatrixAt(i,matrix);world.multiplyMatrices(object.matrixWorld,matrix);}else world.copy(object.matrixWorld);
          const bounds=object.geometry.boundingBox.clone().applyMatrix4(world);
          if(filter&&!filter(bounds,object))continue;
          const center=bounds.getCenter(new THREE.Vector3());
          let tint='';if(object.instanceColor){const color=new THREE.Color();object.getColorAt(i,color);tint=color.getHexString();}
          const materialKey=object.material.uuid+':'+tint;
          if(!materials.has(materialKey)){
            const material=object.material.clone();material.userData={};material.onBeforeCompile=()=>{};
            if(tint)material.color.multiply(new THREE.Color('#'+tint));
            materials.set(materialKey,material);
          }
          let geometry=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();
          geometry.applyMatrix4(world);
          if(world.determinant()<0){
            // Mirrored source instances need reversed winding after baking.
            for(const attribute of Object.values(geometry.attributes))for(let v=0;v<attribute.count;v+=3)for(let c=0;c<attribute.itemSize;c++){
              const a=(v+1)*attribute.itemSize+c,b=(v+2)*attribute.itemSize+c;
              [attribute.array[a],attribute.array[b]]=[attribute.array[b],attribute.array[a]];
            }
          }
          for(const key of Object.keys(geometry.attributes))if(!['position','normal','uv'].includes(key))geometry.deleteAttribute(key);
          if(!geometry.attributes.normal)geometry.computeVertexNormals();
          if(!geometry.attributes.uv)geometry.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count*2),2));
          const key=materialKey+':'+Math.floor(center.x/16)+':'+Math.floor(center.z/16);
          if(!batches.has(key))batches.set(key,{material:materials.get(materialKey),parts:[]});
          batches.get(key).parts.push(geometry);sourceParts++;triangles+=geometry.attributes.position.count/3;
        }
      });
      for(const [key,batch] of batches){
        const geometry=mergeGeometries(batch.parts);
        if(!geometry)throw Error('Cannot batch exported geometry');
        const mesh=new THREE.Mesh(geometry,batch.material);mesh.name=name+' batch '+target.children.length;target.add(mesh);
        for(const part of batch.parts)part.dispose();
      }
      return {target,stats:{sourceParts,batches:target.children.length,triangles}};
    }
    const outdoor=bake(exterior.model,'1829 frontage',(bounds)=>overlaps(bounds)&&bounds.max.y<70);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(230,210),exterior.terrain.material.clone());
    ground.geometry.rotateX(-Math.PI/2).translate(0,-.15,12);ground.name='Prototype ground';outdoor.target.add(ground);
    const interiorSource=new THREE.Group();buildArchitecture(THREE,interiorSource,layout);
    const indoor=bake(interiorSource,'Ground floor');
    const guard=bake(createSecurityGuard(THREE),'Security guard').target;
    async function save(name,object){
      const data=new Uint8Array(await new GLTFExporter().parseAsync(object,{binary:true,maxTextureSize:1024,onlyVisible:true}));
      for(let start=0;start<data.length;start+=262144){
        let raw='';for(let i=start;i<Math.min(data.length,start+262144);i+=16384)raw+=String.fromCharCode(...data.subarray(i,Math.min(data.length,i+16384,start+262144)));
        await window.__nativeChunk(name,btoa(raw));
      }
      return data.length;
    }
    const bytes={outdoor:await save('outdoor.glb',outdoor.target),indoor:await save('indoor.glb',indoor.target),guard:await save('guard.glb',guard)};
    const nativeFootprint=b=>({...b,...(b.corners?{corners:b.corners.map(([x,z])=>({x,z}))}:{})});
    return {schema:1,period:1916,crop,playBounds:{minX:-70,maxX:70,minZ:22,maxZ:78},outdoor:outdoor.stats,indoor:indoor.stats,bytes,obstacles:obstacles.map(nativeFootprint),walkSurfaces:walkSurfaces.map(nativeFootprint)};
  });
  if(await modelSourceHash()!==sourceHash)throw Error('Model changed during native export; repeat export.');
  if(!layoutBytes.equals(await readFile(resolve(dist,'layout.json'))))throw Error('Layout changed during native export.');
  await mkdir(output,{recursive:true});
  for(const [name,parts] of chunks)await writeFile(resolve(output,name),Buffer.concat(parts));
  await writeFile(resolve(output,'layout.json'),layoutBytes);
  const manifest={...report,sourceHash,layoutHash:createHash('sha256').update(layoutBytes).digest('hex'),assetHashes:Object.fromEntries([...chunks].map(([name,parts])=>[name,createHash('sha256').update(Buffer.concat(parts)).digest('hex')]))};
  await writeFile(resolve(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  await copyFile(resolve(dist,'vendor/THREE-LICENSE.txt'),resolve(output,'THREE-LICENSE.txt'));
  await copyFile(resolve(dist,'vendor/ez-tree/LICENSE'),resolve(output,'EZ-TREE-LICENSE.txt'));
  await copyFile(resolve(dist,'vendor/ez-tree/TEXTURES-LICENSE.md'),resolve(output,'TREE-TEXTURES-LICENSE.txt'));
  await copyFile(fileURLToPath(new URL('../../LICENSE',import.meta.url)),resolve(output,'GPL-3.0.txt'));
  console.log(JSON.stringify({sourceHash,outdoor:report.outdoor,indoor:report.indoor,bytes:report.bytes,obstacles:report.obstacles.length},null,2));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
