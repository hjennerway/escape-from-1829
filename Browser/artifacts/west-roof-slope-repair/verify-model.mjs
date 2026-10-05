import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {modelSourceHash} from '../../model-build-inputs.mjs';
const out=new URL('./',import.meta.url),compiled=new URL('../../dist/compiled/',import.meta.url),manifest=JSON.parse(await readFile(new URL('manifest.json',compiled),'utf8'));
const source=JSON.parse(await readFile(new URL('final-source-validation.json',out),'utf8')),built=JSON.parse(await readFile(new URL('final-compiled-validation.json',out),'utf8'));
const currentHash=await modelSourceHash(),sha256=createHash('sha256').update(await readFile(new URL(manifest.file,compiled))).digest('hex');
if(currentHash!==manifest.sourceHash||source.sourceHash!==currentHash||built.sourceHash!==currentHash||sha256!==manifest.sha256)throw Error('Model provenance mismatch');
let maximumDifference=0;for(let i=0;i<source.survey.checked.length;i++){const a=source.survey.checked[i],b=built.survey.checked[i];if(a.x!==b.x||a.z!==b.z)throw Error('Probe mismatch');maximumDifference=Math.max(maximumDifference,Math.abs(a.y-b.y));}
if(maximumDifference>.0001)throw Error('Source/compiled surface mismatch');
const result={currentHash,manifest,sha256,checked:source.survey.checked.length,maximumDifference,gpu:'NVIDIA GeForce RTX 3090 Ti / Direct3D11',errors:[...source.errors,...built.errors],sources:['Browser/dist/front-inside-corners.mjs','Browser/dist/entrance-west-photo-detail.mjs','Browser/dist/west-cross-range-roof.mjs'],exports:{browserSource:true,localCompiledAerial:true,Unity:false,Blender:false,packages:false}};
await writeFile(new URL('final-model.json',out),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({currentHash,checked:result.checked,maximumDifference,sha256}));
