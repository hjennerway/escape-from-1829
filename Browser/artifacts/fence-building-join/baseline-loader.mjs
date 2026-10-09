// Reproduce the saved pre-fix behaviour without replacing working-tree files.
import {registerHooks} from 'node:module';
export function fenceBaselineSource(url,source){
 if(url.endsWith('/workshop-gallery.mjs')){
  source=source.replace(/ \/\/ Keep authored concave courts open after clipping\.[\s\S]*?(?= let pieces=)/,'');
  source=source.replace(/   const hull=\[\.\.\.half\(sorted\)[\s\S]*?   result\.push\(mesh\);/,"   mesh.userData.collisionFootprint=[...half(sorted),...half([...sorted].reverse())];result.push(mesh);");
 }
 if(url.endsWith('/escape-grounds.mjs'))source=source.replace("wallPadding=kind==='iron'?0:.27","wallPadding=.27");
 if(url.endsWith('/escape-grounds-state.mjs'))source=source.replaceAll('[wardJoinX,','[105,');
 return source;
}
registerHooks({load(url,context,nextLoad){
 const result=nextLoad(url,context);if(!url.endsWith('.mjs')||!result.source)return result;
 const source=typeof result.source==='string'?result.source:new TextDecoder().decode(result.source);
 return {...result,source:fenceBaselineSource(url,source)};
}});
