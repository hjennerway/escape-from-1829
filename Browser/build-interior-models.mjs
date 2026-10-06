import http from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {launchHardwareBrowser} from './test-support/hardware-browser.mjs';
import {interiorSourceHash} from './model-build-inputs.mjs';
const root=resolve(fileURLToPath(new URL('./dist/',import.meta.url))),out=new URL('./dist/compiled/interior/',import.meta.url),sourceHash=await interiorSourceHash(),assets=[];
const server=http.createServer(async(req,res)=>{try{if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end('<title>Prepare interiors</title>');return;}const path=resolve(root,'.'+req.url);if(!path.startsWith(root+sep))throw Error('Path');res.setHeader('Content-Type',['.mjs','.js'].includes(extname(path))?'text/javascript':'application/json');res.end(await readFile(path));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try{
 browser=await launchHardwareBrowser();const page=await browser.newPage();await page.exposeFunction('__interiorAsset',(id,floor,kind,base64)=>assets.push({id,floor,kind,bytes:Buffer.from(base64,'base64')}));await page.goto('http://127.0.0.1:'+server.address().port);
 const stats=await page.evaluate(async()=>{
  const THREE=await import('/vendor/three.module.js'),{buildAsylumLayout}=await import('/asylum-layout.mjs'),{buildInteriorFloor}=await import('/interior-section-build.mjs'),{asylumArchitectureMaterials}=await import('/asylum-architecture.mjs');
  const plan=await(await fetch('/asylum-plan.json')).json(),floors=buildAsylumLayout(plan).floors,stats=[];asylumArchitectureMaterials(THREE,{id:0},null);
  async function emit(id,floor,kind,bytes){let value='';for(let i=0;i<bytes.length;i+=16384)value+=String.fromCharCode(...bytes.subarray(i,i+16384));await __interiorAsset(id,floor,kind,btoa(value));}
  for(const floor of floors){const start=performance.now(),built=buildInteriorFloor(THREE,floor);await emit('floor-'+floor.id,floor.id,'resource',built.resource);for(const asset of built.assets)await emit(asset.id,floor.id,'section',asset.bytes);stats.push({floor:floor.id,sections:built.assets.length,buildMilliseconds:performance.now()-start});}return stats;
 });
 if(sourceHash!==await interiorSourceHash())throw Error('Interior sources changed during compilation');await mkdir(out,{recursive:true});
 const manifest={format:1,sourceHash,resources:{},sections:[],stats};
 for(const asset of assets){const compressed=gzipSync(asset.bytes,{level:9}),sha256=createHash('sha256').update(compressed).digest('hex'),file=asset.id+'-'+sha256.slice(0,16)+'.bin.gz';await writeFile(new URL(file,out),compressed);const record={id:asset.id,floor:asset.floor,file,bytes:compressed.length,rawBytes:asset.bytes.length,sha256};if(asset.kind==='resource')manifest.resources[asset.floor]=record;else manifest.sections.push(record);}
 await writeFile(new URL('manifest.json',out),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({sections:manifest.sections.length,bytes:assets.length,stats,compressedBytes:[...Object.values(manifest.resources),...manifest.sections].reduce((n,r)=>n+r.bytes,0)},null,2));
}finally{await browser?.close();server.close();}
