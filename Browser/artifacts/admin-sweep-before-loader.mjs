export async function load(url,context,next){
 const result=await next(url,context);
 if(url.endsWith('/dist/historic-road-layout.mjs'))return {...result,source:String(result.source).replace(' ...adminTeardropPaving(HISTORIC_ROAD_TRACES),','')};
 return result;
}
