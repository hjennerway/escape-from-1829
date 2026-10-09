// Restore only this task's two material edits in memory for baseline checks.
export async function load(url,context,nextLoad){
  const result=await nextLoad(url,context);
  if(url.endsWith('/dist/photo-detail-primitives.mjs'))return {...result,source:String(result.source)
    .replace('columns=3,lintel=stone','columns=3')
    .replace('part(lintel,0,h/2+.08','part(stone,0,h/2+.08')};
  if(url.endsWith('/dist/west-lawn-photo-detail.mjs'))return {...result,source:String(result.source)
    .replace('    // The straight backing\'s exposed ends belong to the brick arch, not stone.\n','')
    .replace('sash(face,x,y,z,Math.PI/2,w,h,{lintel:brick});','sash(face,x,y,z,Math.PI/2,w,h);')};
  return result;
}
