// Read a historical model without checking out or changing the shared workspace.
import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=new URL('../../',import.meta.url),dist=new URL('../dist/',import.meta.url).href;
const ref=process.env.GEOMETRY_SNAPSHOT_REF;
registerHooks({load(url,context,next){
  let result;
  if(ref&&url.startsWith(dist)&&/\.(mjs|js)$/.test(url)){
    const path=decodeURIComponent(url.slice(root.href.length));
    result={format:'module',shortCircuit:true,source:execFileSync('git',['show',`${ref}:${path}`],{cwd:fileURLToPath(root),encoding:'utf8',maxBuffer:32*1024*1024,windowsHide:true})};
  }else result=next(url,context);
  if(url.endsWith('/jarman-scope.mjs'))result={...result,source:String(result.source).replace('return {primitives:','globalThis.captureGeometryRows?.("jarman",rows);return {primitives:')};
  if(url.endsWith('/leighton-scope.mjs'))result={...result,source:String(result.source).replace('return {count:','globalThis.captureGeometryRows?.("leighton",rows);return {count:')};
  return result;
}});
