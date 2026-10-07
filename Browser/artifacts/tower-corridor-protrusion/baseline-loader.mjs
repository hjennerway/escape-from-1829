// Run the current workshop checks with only this protrusion repair disabled.
// Keep the workspace intact and remove only this task's change in memory.
export async function load(url,context,nextLoad){
 const result=await nextLoad(url,context);
 if(url.endsWith('/dist/tower-workshops.mjs'))return {...result,source:String(result.source).replace('eaves?|fascia|flashing|','eaves?|')};
 if(url.endsWith('/test-tower-workshops.mjs')){
  const source=String(result.source),start=source.indexOf(' // The kitchen\'s low eave crosses'),end=source.indexOf(' let facadeProbes=0;',start);
  if(start<0||end<0)throw Error('Protrusion regression markers changed');
  return {...result,source:source.slice(0,start)+source.slice(end)};
 }
 return result;
}
