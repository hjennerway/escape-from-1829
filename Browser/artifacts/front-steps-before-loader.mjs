import {registerHooks} from 'node:module';
// Reconstruct only the pre-change stair dimensions for preservation audits.
registerHooks({load(url,context,next){
  const result=next(url,context);
  if(!url.endsWith('/front-steps.mjs'))return result;
  return {...result,source:String(result.source)
    .replace("slab('Front stair branching landing',0,branchZ,2.2,branchDepth,mid)","slab('Front stair branching landing',0,25.2,2.2,1.2,mid)")
    .replace('side*(1.3+i*.4),branchZ,.4,branchDepth,mid+(i+1)*rise)','side*(1.3+i*.4),25.2,.4,1.2,mid+(i+1)*rise)')};
}});
