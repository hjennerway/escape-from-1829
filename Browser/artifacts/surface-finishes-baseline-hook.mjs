import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){
 const result=next(url,context);
 if(url.endsWith('/dist/entrance-walks.mjs'))return {...result,source:String(result.source).replace('[-1.6,26.2],[-3.9,26.2],[-3.9,26],[-4.24,26],[-4.24,24]','[-1.6,26.2],[-4.24,26.2],[-4.24,24]')};
 return result;
}});
