import {registerHooks} from 'node:module';

// Reproduce unrelated suite failures with the previous road shade and neck,
// without replacing the working source or invalidating the compiled model.
registerHooks({load(url,context,nextLoad){
 const result=nextLoad(url,context);
 if(url.endsWith('/road-end-fades.mjs'))return {...result,source:String(result.source)
  .replace("makeMaterial('gravel',ROAD_STYLE.asphalt,ROAD_STYLE.asphaltLayer)","makeMaterial('gravel',0xa49f91,ROAD_STYLE.asphaltLayer)")
  .replace('1-.30*smooth(0,7,s)','1-.64*smooth(0,7,s)')};
 return result;
}});
