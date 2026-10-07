import {readFile} from 'node:fs/promises';
export async function load(url,context,next){
 const file=url.split('/').pop();
 if(process.env.ROOF_REGRESSION_CASE==='original'&&url.includes('/dist/')&&['east-photo-detail.mjs','east-entrance-roof-join.mjs'].includes(file))
  return {format:'module',shortCircuit:true,source:await readFile(new URL('before-'+file,import.meta.url),'utf8')};
 if(process.env.ROOF_REGRESSION_CASE==='backfaces'&&url.endsWith('/dist/east-entrance-roof-join.mjs')){
  const result=await next(url,context);
  return {...result,source:String(result.source).replace("name==='court'?tri.toReversed():tri","name==='court'?tri:tri.toReversed()")};
 }
 if(process.env.ROOF_REGRESSION_CASE==='no-cap'&&url.endsWith('/dist/east-entrance-roof-join.mjs')){
  const result=await next(url,context);
  return {...result,source:String(result.source).replace('positions.push(...top.attributes.position.array);top.dispose();','top.dispose();')};
 }
 return next(url,context);
}
