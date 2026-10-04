export async function load(url,context,nextLoad){
  if(url.endsWith('/west-cross-range-roof.mjs'))return {format:'module',shortCircuit:true,source:'export function joinWestCrossRangeRoof(){}'};
  return nextLoad(url,context);
}
