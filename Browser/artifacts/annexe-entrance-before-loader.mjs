import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){const result=next(url,context);if(url.endsWith('/dist/annexe-road-trees.mjs'))return {...result,source:String(result.source).replace('{removed:true}','{removed:false}')};return result;}});
