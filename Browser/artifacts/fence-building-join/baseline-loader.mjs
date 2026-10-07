// Reproduce the saved pre-fix behaviour without replacing working-tree files.
import {registerHooks} from 'node:module';
registerHooks({load(url,context,nextLoad){
 const result=nextLoad(url,context);if(!url.endsWith('.mjs')||!result.source)return result;
 let source=typeof result.source==='string'?result.source:new TextDecoder().decode(result.source);
 if(url.endsWith('/dist/workshop-gallery.mjs')){
  source=source.replace(/ \/\/ Keep authored concave courts open after clipping\.[\s\S]*?(?= let pieces=)/,'');
  source=source.replace(/   const hull=\[\.\.\.half\(sorted\)[\s\S]*?   result\.push\(mesh\);/,"   mesh.userData.collisionFootprint=[...half(sorted),...half([...sorted].reverse())];result.push(mesh);");
 }
 if(url.endsWith('/dist/escape-grounds.mjs'))source=source.replace("wallPadding=kind==='iron'?0:.27","wallPadding=.27");
 if(url.endsWith('/dist/escape-grounds-state.mjs'))source=source.replaceAll('[wardJoinX,','[105,');
 if(url.endsWith('/test-tower-workshops.mjs')&&process.env.FENCE_BASELINE_KEEP_REGRESSION!=='1')source=source.replace(/ \/\/ The marked wicket-side railing must meet actual masonry\.[\s\S]*?(?= \/\/ Survey the reported ceiling stripe)/,'');
 return {...result,source};
}});
