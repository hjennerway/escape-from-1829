import http from 'node:http';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {chromium} from 'playwright';
import {dist,modelSourceHash} from './model-build-inputs.mjs';
import {decodeModel,MODEL_FORMAT} from './dist/model-binary.mjs';

// Run the real procedural builders in a headless browser so canvas textures and
// labels are baked with exactly the same APIs as the interactive application.
const root=fileURLToPath(dist),output=new URL('compiled/',dist),started=performance.now(),sourceHash=await modelSourceHash();
let compiled,buildStats;const chunks=[];
const server=http.createServer(async(req,res)=>{
  try{
    const path=new URL(req.url,'http://localhost').pathname;
    if(path==='/favicon.ico'){res.writeHead(204).end();return;}
    if(path==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Compile estate</title>');return;}
    const file=resolve(root,'.'+decodeURIComponent(path));
    if(!file.startsWith(resolve(root)+sep)){res.writeHead(403).end();return;}
    const body=await readFile(file);res.setHeader('Content-Type',extname(file)==='.mjs'||extname(file)==='.js'?'text/javascript':'application/octet-stream');res.end(body);
  }catch(error){res.writeHead(500).end(error.message);}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
  browser=await chromium.launch({headless:true,...(process.env.MODEL_CHROME_PATH?{executablePath:process.env.MODEL_CHROME_PATH}:{})});
  const page=await browser.newPage();
  // Bounded IPC avoids DevTools trying to capture one enormous HTTP request body.
  await page.exposeFunction('__modelChunk',chunk=>{chunks.push(Buffer.from(chunk,'base64'));});
  page.on('console',message=>{if(message.type()==='error')console.error(message.text());});
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  buildStats=await page.evaluate(async()=>{
    const THREE=await import('/vendor/three.module.js');
    const {buildAerialScene,snapshotAerialScene}=await import('/aerial-scene.mjs');
    const {encodeModel}=await import('/model-binary.mjs');
    const start=performance.now(),estate=await buildAerialScene(THREE,1),built=performance.now();
    const snapshot=snapshotAerialScene(THREE,estate),bytes=encodeModel(snapshot);
    for(let start=0;start<bytes.length;start+=262144){
      let text='';for(let part=start;part<Math.min(bytes.length,start+262144);part+=16384)text+=String.fromCharCode(...bytes.subarray(part,Math.min(bytes.length,part+16384)));
      await window.__modelChunk(btoa(text));
    }
    return {revision:THREE.REVISION,buildMilliseconds:built-start,windows:estate.buildingDetail.stats.windows,geometries:snapshot.scene.geometries.length,materials:snapshot.scene.materials.length,textures:snapshot.scene.textures.length};
  });
  compiled=Buffer.concat(chunks);
  if(!compiled||decodeModel(compiled.buffer.slice(compiled.byteOffset,compiled.byteOffset+compiled.byteLength)).format!==MODEL_FORMAT)throw new Error('Compiler produced no valid model');
  if(await modelSourceHash()!==sourceHash)throw new Error('Source changed during compilation. Run the build again.');
  const compressed=gzipSync(compiled,{level:9}),hash=createHash('sha256').update(compressed).digest('hex'),file=`aerial-${hash.slice(0,20)}.bin.gz`;
  await mkdir(output,{recursive:true});await writeFile(new URL(file,output),compressed);
  const manifest={format:MODEL_FORMAT,revision:buildStats.revision,sourceHash,file,bytes:compressed.length,uncompressedBytes:compiled.length,sha256:hash,stats:buildStats};
  await writeFile(new URL('manifest.json.tmp',output),JSON.stringify(manifest,null,2)+'\n');
  await rename(new URL('manifest.json.tmp',output),new URL('manifest.json',output));
  console.log(JSON.stringify({...manifest,totalSeconds:Math.round((performance.now()-started)/100)/10},null,2));
}finally{
  await browser?.close();await new Promise(resolve=>server.close(resolve));
}
